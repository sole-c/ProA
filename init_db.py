import pymysql

# CONFIGURACIÓN DE CONEXIÓN A MYSQL LOCAL
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = ''  # Si usas XAMPP déjalo en ''; si tu MySQL tiene clave, escríbela aquí.
DB_NAME = 'proa_db'

def inicializar_mysql():
    print("Conectando al servidor MySQL...")
    try:
        # Crear base de datos si no existe
        conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD)
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4;")
        conn.close()

        # Conectar a proa_db
        conn = pymysql.connect(
            host=DB_HOST, 
            user=DB_USER, 
            password=DB_PASSWORD, 
            database=DB_NAME, 
            charset='utf8mb4'
        )
        cursor = conn.cursor()

        # Operaciones DDL (Estructura de Tablas)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'admin'
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contenidos (
                clave VARCHAR(100) PRIMARY KEY,
                texto TEXT NOT NULL
            )
        ''')

        # Insertar administrador por defecto
        cursor.execute("INSERT IGNORE INTO usuarios (username, password, role) VALUES (%s, %s, %s)", ('admin', 'admin123', 'admin'))

        # Insertar registros por defecto
        textos_iniciales = [
            ('inicio_titulo', 'Bienvenidos a EduProA'),
            ('inicio_subtitulo', 'Conectando estudiantes, familias y docentes en un solo lugar.'),
            ('institucion_historia', 'Desde nuestros inicios, hemos estado comprometidos con la excelencia educativa...'),
            ('institucion_mision', 'La Escuela ProA sede Capital Norte es una escuela con orientación en Desarrollo de Software...'),
            ('institucion_vision', 'La Escuela ProA sede Capital Norte busca promover experiencias de aprendizaje colaborativo...'),
            ('eo_director', 'Juan Diego Maldonado'),
            ('eo_secretario', 'Pablo Marcolini'),
            ('eo_coordinadora', 'Sofia Fernandez Cebollada'),
            ('eo_preceptores', 'Melisa Cebollada, Leandro Bruno, Andres Bianchi'),
            ('contacto_telefono', '5867177'),
            ('contacto_email', 'cordobanorte.ds@escuelasproa.edu.ar'),
            ('contacto_direccion', 'Escuela ProA (Escuela Experimental con enfasis en Tic Sede Capital Norte)'),
            ('img_banner_inicio', 'images/banner.jpg'),
            ('img_institucion', 'images/colegio.jpg'),
            ('img_instalaciones_1', 'images/aula.jpg'),
            ('img_instalaciones_2', 'images/patio.jpg'),
            ('img_instalaciones_3', 'images/lab.jpg')
        ]

        cursor.executemany("INSERT IGNORE INTO contenidos (clave, texto) VALUES (%s, %s)", textos_iniciales)
        conn.commit()
        conn.close()
        print(f"¡Base de datos '{DB_NAME}' configurada con éxito en MySQL!")
    except Exception as e:
        print(f"Error al inicializar la base de datos: {e}")

if __name__ == '__main__':
    inicializar_mysql()