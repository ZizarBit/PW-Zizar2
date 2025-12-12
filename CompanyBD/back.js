const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5500;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'PruebasTec',
    password: 'PruebasdelTec', // Cambia esto por tu contraseña de MySQL
    database: 'company'
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

//Autentificacion LOGIN
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const query = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        res.json({
            success: true,
            message: 'Login exitoso',
            user: { name: user.name, email: user.email }
        });
    });
});

//CRUD Empleado

// GET Obtener todos los empleados
app.get('/api/empleados', (req, res) => {
    const query = `
        SELECT e.*, d.Dname as DepartmentName
        FROM employee e
        LEFT JOIN department d ON e.Dno = d.Dnumber
        ORDER BY e.Lname, e.Fname
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener empleados' });
        }
        res.json(results);
    });
});

// GET Obtener un empleado por SSN
app.get('/api/empleados/:ssn', (req, res) => {
    const { ssn } = req.params;
    const query = `
        SELECT e.*, d.Dname as DepartmentName
        FROM employee e
        LEFT JOIN department d ON e.Dno = d.Dnumber
        WHERE e.Ssn = ?
    `;

    db.query(query, [ssn], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener empleado' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        res.json(results[0]);
    });
});

// POST Crear nuevo empleado
app.post('/api/empleados', (req, res) => {
    const { Fname, Minit, Lname, Ssn, Bdate, Address, Sex, Salary, Super_ssn, Dno } = req.body;

    // Validación básica
    if (!Fname || !Lname || !Ssn || !Dno) {
        return res.status(400).json({ error: 'Faltan campos requeridos (Fname, Lname, Ssn, Dno)' });
    }

    const query = `
        INSERT INTO employee (Fname, Minit, Lname, Ssn, Bdate, Address, Sex, Salary, Super_ssn, Dno)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        Fname,
        Minit || null,
        Lname,
        Ssn,
        Bdate || null,
        Address || null,
        Sex || null,
        Salary || null,
        Super_ssn || null,
        Dno
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'El SSN ya existe' });
            }
            return res.status(500).json({ error: 'Error al crear empleado' });
        }
        res.status(201).json({
            success: true,
            message: 'Empleado creado exitosamente',
            ssn: Ssn
        });
    });
});

// PUT Actualizar empleado
app.put('/api/empleados/:ssn', (req, res) => {
    const { ssn } = req.params;
    const { Fname, Minit, Lname, Bdate, Address, Sex, Salary, Super_ssn, Dno } = req.body;

    const query = `
        UPDATE employee
        SET Fname = ?, Minit = ?, Lname = ?, Bdate = ?, Address = ?,
            Sex = ?, Salary = ?, Super_ssn = ?, Dno = ?
        WHERE Ssn = ?
    `;

    const values = [
        Fname,
        Minit || null,
        Lname,
        Bdate || null,
        Address || null,
        Sex || null,
        Salary || null,
        Super_ssn || null,
        Dno,
        ssn
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar empleado' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        res.json({
            success: true,
            message: 'Empleado actualizado exitosamente'
        });
    });
});

// DELETE  Eliminar empleado
app.delete('/api/empleados/:ssn', (req, res) => {
    const { ssn } = req.params;

    // Primero verificar si el empleado existe
    db.query('SELECT * FROM employee WHERE Ssn = ?', [ssn], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al verificar empleado' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        // Eliminar el empleado
        const query = 'DELETE FROM employee WHERE Ssn = ?';
        db.query(query, [ssn], (err, result) => {
            if (err) {
                if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                    return res.status(400).json({
                        error: 'No se puede eliminar. El empleado está referenciado en otras tablas'
                    });
                }
                return res.status(500).json({ error: 'Error al eliminar empleado' });
            }
            res.json({
                success: true,
                message: 'Empleado eliminado exitosamente'
            });
        });
    });
});

// GET  Obtener departamentos
app.get('/api/departamentos', (req, res) => {
    const query = 'SELECT Dnumber, Dname FROM department ORDER BY Dname';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener departamentos' });
        }
        res.json(results);
    });
});

// Ruta raíz - redirige al login
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Abre tu navegador en http://localhost:${PORT}`);
});