import os
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from werkzeug.utils import secure_filename
import pymysql

app = Flask(__name__)
app.secret_key = 'clave_secreta_proa_2026'

# Carpeta para subir nuevas imágenes
UPLOAD_FOLDER = os.path.join('static', 'images')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configuración de credenciales de MySQL
DB_CONFIG = {
    'host': 'localhost',             
    'user': 'root',                  
    'password': '', # <--- Pon aquí tu contraseña de MySQL ('' si usas XAMPP)
    'database': 'proa_db',           
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

def get_db_connection():
    return pymysql.connect(**DB_CONFIG)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def obtener_contenidos():
    """Trae todos los textos e imágenes desde MySQL."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT clave, texto FROM contenidos")
        filas = cursor.fetchall()
        conn.close()
        return {item['clave']: item['texto'] for item in filas}
    except Exception as e:
        print(f"Error conectando a MySQL: {e}")
        return {}


# ---------------------------------------------------------
# ACCESO ADMINISTRADOR (/login)
# ---------------------------------------------------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        user = request.form.get('username')
        pwd = request.form.get('password')

        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM usuarios WHERE username=%s AND password=%s AND role='admin'",
                (user, pwd)
            )
            account = cursor.fetchone()
            conn.close()

            if account:
                session['loggedin'] = True
                session['username'] = user
                session['role'] = 'admin'
                return redirect(url_for('inicio'))
            else:
                error = "Usuario o contraseña de administrador incorrectos."
        except Exception as e:
            error = f"Error al conectar con MySQL: {e}"

    return f'''
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Acceso Administrador | ProA</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-100 flex items-center justify-center min-h-screen font-sans">
        <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
            <h1 class="text-2xl font-bold text-[#00355f] text-center mb-2">Panel de Administración</h1>
            <p class="text-slate-500 text-sm text-center mb-6">Ingresa con tus credenciales de administrador</p>
            {"<div class='bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center'>" + error + "</div>" if error else ""}
            <form method="POST" action="/login" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Usuario</label>
                    <input type="text" name="username" required placeholder="admin" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00355f]">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Contraseña</label>
                    <input type="password" name="password" required placeholder="••••••••" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00355f]">
                </div>
                <button type="submit" class="w-full bg-[#00355f] hover:bg-[#0f4c81] text-white font-bold py-2.5 rounded-lg transition-colors shadow">
                    Ingresar como Administrador
                </button>
            </form>
        </div>
    </body>
    </html>
    '''

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('inicio'))


# ---------------------------------------------------------
# RUTAS DE NAVEGACIÓN PÚBLICA
# ---------------------------------------------------------
@app.route('/')
@app.route('/inicio.html')
@app.route('/inicio')
def inicio():
    role = session.get('role', 'usuario')
    return render_template('inicio.html', contenidos=obtener_contenidos(), role=role)

@app.route('/sobrelainstitucion.html')
@app.route('/sobrelainstitucion')
def sobrelainstitucion():
    role = session.get('role', 'usuario')
    return render_template('sobrelainstitucion.html', contenidos=obtener_contenidos(), role=role)

@app.route('/instalaciones.html')
@app.route('/instalaciones')
def instalaciones():
    role = session.get('role', 'usuario')
    return render_template('instalaciones.html', contenidos=obtener_contenidos(), role=role)

@app.route('/novedades.html')
@app.route('/novedades')
def novedades():
    role = session.get('role', 'usuario')
    return render_template('novedades.html', contenidos=obtener_contenidos(), role=role)

@app.route('/planes.html')
@app.route('/planes')
def planes():
    role = session.get('role', 'usuario')
    return render_template('planes.html', contenidos=obtener_contenidos(), role=role)

@app.route('/equipodeorientacion.html')
@app.route('/equipodeorientacion')
def equipodeorientacion():
    role = session.get('role', 'usuario')
    return render_template('equipodeorientacion.html', contenidos=obtener_contenidos(), role=role)

@app.route('/contacto.html')
@app.route('/contacto')
def contacto():
    role = session.get('role', 'usuario')
    return render_template('contacto.html', contenidos=obtener_contenidos(), role=role)


# ---------------------------------------------------------
# API PARA GUARDAR TEXTOS EN MYSQL (SOLO ADMIN)
# ---------------------------------------------------------
@app.route('/api/guardar', methods=['POST'])
def guardar_contenido():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Acceso denegado: Se requieren permisos de administrador'}), 403

    data = request.get_json() if request.is_json else request.form
    clave = data.get('clave')
    nuevo_texto = data.get('texto')

    if not clave or nuevo_texto is None:
        return jsonify({'error': 'Datos incompletos'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO contenidos (clave, texto) VALUES (%s, %s) ON DUPLICATE KEY UPDATE texto=%s",
            (clave, nuevo_texto, nuevo_texto)
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'mensaje': 'Contenido actualizado en MySQL'})
    except Exception as e:
        return jsonify({'error': f'Error al guardar en MySQL: {e}'}), 500


# ---------------------------------------------------------
# API PARA CAMBIAR E SUBIR IMÁGENES (SOLO ADMIN)
# ---------------------------------------------------------
@app.route('/api/guardar_imagen', methods=['POST'])
def guardar_imagen():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Acceso denegado'}), 403

    clave = request.form.get('clave')
    if 'imagen' not in request.files:
        return jsonify({'error': 'No se envió ningún archivo de imagen'}), 400

    file = request.files['imagen']
    if file.filename == '':
        return jsonify({'error': 'Nombre de archivo no válido'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Guardar la nueva ruta relativa de la imagen en MySQL
        nueva_ruta = f"images/{filename}"
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO contenidos (clave, texto) VALUES (%s, %s) ON DUPLICATE KEY UPDATE texto=%s",
                (clave, nueva_ruta, nueva_ruta)
            )
            conn.commit()
            conn.close()
            return jsonify({'success': True, 'nueva_ruta': nueva_ruta})
        except Exception as e:
            return jsonify({'error': f'Error guardando en MySQL: {e}'}), 500

    return jsonify({'error': 'Formato de imagen no permitido'}), 400


if __name__ == '__main__':
    app.run(debug=True, port=5000)
