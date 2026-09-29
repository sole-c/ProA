import os
import secrets
from datetime import timedelta
from functools import wraps
from io import BytesIO
from mimetypes import guess_type

import click
import mysql.connector
from flask import Flask, abort, jsonify, request, send_file, session
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config.update(
    SECRET_KEY=os.getenv("FLASK_SECRET_KEY") or secrets.token_hex(32),
    MAX_CONTENT_LENGTH=8 * 1024 * 1024,
    PERMANENT_SESSION_LIFETIME=timedelta(hours=8),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

DATABASE_SETUP_SQL = (
    "CREATE DATABASE IF NOT EXISTS proa_admin "
    "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    "CREATE DATABASE IF NOT EXISTS proa_images "
    "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    "CREATE TABLE IF NOT EXISTS proa_admin.admins ("
    "id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, "
    "username VARCHAR(80) NOT NULL UNIQUE, "
    "password_hash VARCHAR(255) NOT NULL, "
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"
    ") ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS proa_images.images ("
    "id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, "
    "filename VARCHAR(255) NOT NULL, "
    "content_type VARCHAR(100) NOT NULL, "
    "image_data LONGBLOB NOT NULL, "
    "uploaded_by BIGINT UNSIGNED NOT NULL, "
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "
    "INDEX idx_images_created_at (created_at)"
    ") ENGINE=InnoDB",
)


def database_connection(database_variable):
    default_name = "proa_admin" if database_variable == "ADMIN_DB_NAME" else "proa_images"
    database_name = os.getenv(database_variable, default_name)

    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "127.0.0.1"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER", "proa_app"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=database_name,
        connection_timeout=5,
    )


@app.cli.command("init-db")
def init_db():
    """Create the two databases, tables, and the Flask database account."""
    app_password = os.getenv("MYSQL_PASSWORD")
    if not app_password:
        raise click.ClickException("Configura MYSQL_PASSWORD antes de crear las bases.")

    connection = None
    cursor = None
    try:
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "127.0.0.1"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=os.getenv("MYSQL_ADMIN_USER", "root"),
            password=os.getenv("MYSQL_ADMIN_PASSWORD", ""),
            connection_timeout=5,
        )
        cursor = connection.cursor()
        for statement in DATABASE_SETUP_SQL:
            cursor.execute(statement)
        cursor.execute(
            "CREATE USER IF NOT EXISTS 'proa_app'@'127.0.0.1' IDENTIFIED BY %s",
            (app_password,),
        )
        cursor.execute(
            "GRANT SELECT, INSERT ON proa_admin.admins TO 'proa_app'@'127.0.0.1'"
        )
        cursor.execute(
            "GRANT SELECT, INSERT ON proa_images.images TO 'proa_app'@'127.0.0.1'"
        )
        click.echo("Bases de datos, tablas y usuario de Flask creados.")
    except (mysql.connector.Error, ValueError) as error:
        raise click.ClickException(
            "No se pudieron crear las bases. Comprueba MySQL y las credenciales de administrador."
        ) from error
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if "admin_id" not in session:
            return jsonify(error="Debes iniciar sesión."), 401
        return view(*args, **kwargs)

    return wrapped


@app.post("/login")
def login():
    credentials = request.get_json(silent=True) or request.form
    username = credentials.get("username", "").strip()
    password = credentials.get("password", "")
    if not username or not password:
        return jsonify(error="Completa usuario y contraseña."), 400

    connection = None
    cursor = None
    try:
        connection = database_connection("ADMIN_DB_NAME")
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, password_hash FROM admins WHERE username = %s",
            (username,),
        )
        admin = cursor.fetchone()
        if not admin or not check_password_hash(admin["password_hash"], password):
            return jsonify(error="Usuario o contraseña incorrectos."), 401

        session.clear()
        session["admin_id"] = admin["id"]
        session.permanent = True
        return jsonify(message="Sesión iniciada correctamente.")
    except (mysql.connector.Error, RuntimeError, ValueError):
        app.logger.exception("No se pudo consultar la base de administradores.")
        return jsonify(error="No se pudo conectar con la base de datos."), 503
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.post("/logout")
@admin_required
def logout():
    session.clear()
    return jsonify(message="Sesión cerrada.")


@app.get("/images")
@admin_required
def list_images():
    connection = None
    cursor = None
    try:
        connection = database_connection("IMAGES_DB_NAME")
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, filename, content_type, created_at "
            "FROM images ORDER BY created_at DESC"
        )
        images = cursor.fetchall()
        for image in images:
            image["url"] = f"/images/{image['id']}"
            image["created_at"] = image["created_at"].isoformat()
        return jsonify(images=images)
    except (mysql.connector.Error, RuntimeError, ValueError):
        app.logger.exception("No se pudo consultar la base de imágenes.")
        return jsonify(error="No se pudo conectar con la base de datos."), 503
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.post("/images")
@admin_required
def upload_image():
    uploaded_file = request.files.get("image")
    if not uploaded_file or not uploaded_file.filename:
        return jsonify(error="Selecciona una imagen en el campo 'image'."), 400

    filename = secure_filename(uploaded_file.filename)
    extension = os.path.splitext(filename)[1].lower()
    content_type = guess_type(filename)[0]
    if not filename or extension not in ALLOWED_EXTENSIONS or not content_type:
        return jsonify(error="Formato no permitido. Usa JPG, PNG, GIF o WEBP."), 400

    image_data = uploaded_file.read()
    if not image_data:
        return jsonify(error="El archivo está vacío."), 400

    connection = None
    cursor = None
    try:
        connection = database_connection("IMAGES_DB_NAME")
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO images (filename, content_type, image_data, uploaded_by) "
            "VALUES (%s, %s, %s, %s)",
            (filename, content_type, image_data, session["admin_id"]),
        )
        connection.commit()
        return jsonify(id=cursor.lastrowid, message="Imagen guardada."), 201
    except (mysql.connector.Error, RuntimeError, ValueError):
        if connection and connection.is_connected():
            connection.rollback()
        app.logger.exception("No se pudo guardar la imagen.")
        return jsonify(error="No se pudo guardar la imagen en la base de datos."), 503
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.get("/images/<int:image_id>")
@admin_required
def get_image(image_id):
    connection = None
    cursor = None
    try:
        connection = database_connection("IMAGES_DB_NAME")
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT filename, content_type, image_data FROM images WHERE id = %s",
            (image_id,),
        )
        image = cursor.fetchone()
        if not image:
            abort(404)
        return send_file(
            BytesIO(image["image_data"]),
            mimetype=image["content_type"],
            download_name=image["filename"],
            max_age=0,
        )
    except (mysql.connector.Error, RuntimeError, ValueError):
        app.logger.exception("No se pudo leer la imagen.")
        return jsonify(error="No se pudo conectar con la base de datos."), 503
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.cli.command("create-admin")
def create_admin():
    """Create an administrator and store only its password hash."""
    username = click.prompt("Usuario").strip()
    password = click.prompt("Contraseña", hide_input=True, confirmation_prompt=True)
    if not username:
        raise click.ClickException("El usuario no puede estar vacío.")

    connection = None
    cursor = None
    try:
        connection = database_connection("ADMIN_DB_NAME")
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO admins (username, password_hash) VALUES (%s, %s)",
            (username, generate_password_hash(password)),
        )
        connection.commit()
        click.echo("Administrador creado.")
    except mysql.connector.IntegrityError:
        raise click.ClickException("Ese usuario ya existe.") from None
    except (mysql.connector.Error, RuntimeError, ValueError) as error:
        raise click.ClickException("No se pudo crear el administrador. "
                                   "Comprueba la configuración y la base de datos.") from error
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.errorhandler(413)
def file_too_large(_error):
    return jsonify(error="La imagen supera el límite de 8 MB."), 413


if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG") == "1")