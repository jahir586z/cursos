const express = require('express'); // importa el framework Express para crear el servidor
const mysql = require('mysql2'); // importa el cliente MySQL

const app = express(); // crea la instancia de la aplicación Express

app.use(express.json()); // middleware para parsear JSON en el cuerpo de las peticiones
app.use(express.static('public')); // sirve archivos estáticos desde la carpeta 'public'

const connection = mysql.createConnection({ // configura la conexión a la base de datos
    host: 'localhost', // host de la base de datos
    user: 'root', // usuario de la base de datos
    password: '', // contraseña (vacía en desarrollo local)
    database: 'cursos_db' // nombre de la base de datos
});

connection.connect(err => { // intenta conectar con MySQL
    if (err) {
        console.error("Error de conexión a MySQL:", err.message || err); // log de error si falla
    } else {
        console.log("Conectado a MySQL"); // confirmación si se conecta
    }
});

// 🔹 Obtener cursos
app.get('/cursos', (req, res) => { // endpoint GET para listar todos los cursos
    connection.query("SELECT * FROM cursos", (err, results) => { // consulta todos los registros
        if (err) {
            console.error('Error al obtener cursos:', err); // log de error en consulta
            return res.status(500).json({ error: 'Error al obtener cursos' }); // responde 500 al cliente
        }
        res.json(results); // devuelve los resultados en formato JSON
    });
});

// 🔹 Guardar curso
app.post('/guardar', (req, res) => { // endpoint POST para crear un curso
    connection.query("INSERT INTO cursos SET ?", req.body, (err, result) => { // inserta usando el body
        if (err) {
            console.error('Error al guardar curso:', err); // log de error en inserción
            return res.status(500).json({ error: 'Error al guardar curso' }); // responde 500
        }
        res.json({ mensaje: "Curso guardado", insertId: result.insertId }); // devuelve mensaje y id insertado
    });
});

// 🔹 Actualizar curso
app.put('/actualizar/:id', (req, res) => { // endpoint PUT para actualizar curso por id
    connection.query("UPDATE cursos SET ? WHERE id = ?", 
    [req.body, req.params.id], (err, result) => { // ejecuta la actualización con parámetros
        if (err) {
            console.error('Error al actualizar curso:', err); // log si ocurre error
            return res.status(500).json({ error: 'Error al actualizar curso' }); // responde 500
        }
        if (result.affectedRows === 0) return res.status(404).json({ error: 'No encontrado' }); // si no afectó filas, 404
        res.json({ mensaje: "Curso actualizado" }); // confirma actualización
    });
});

// 🔹 Eliminar curso
app.delete('/eliminar/:id', (req, res) => { // endpoint DELETE para eliminar por id
    connection.query("DELETE FROM cursos WHERE id = ?", 
    [req.params.id], (err, result) => { // ejecuta eliminación con id como parámetro
        if (err) {
            console.error('Error al eliminar curso:', err); // log en caso de error
            return res.status(500).json({ error: 'Error al eliminar curso' }); // responde 500
        }
        if (result.affectedRows === 0) return res.status(404).json({ error: 'No encontrado' }); // 404 si no hay filas afectadas
        res.json({ mensaje: "Curso eliminado" }); // confirma eliminación
    });
});

app.listen(3000, () => { // inicia el servidor en el puerto 3000
    console.log("Servidor en http://localhost:3000"); // imprime la URL en consola
});
