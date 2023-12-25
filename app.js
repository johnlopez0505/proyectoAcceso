const express = require('express');
const session = require(`express-session`);
const mysql = require(`mysql2`);
const bodyParser = require(`body-parser`);
const path = require(`path`);

const app = express();
const port = 8000;

const db = mysql.createConnection({
    host:`localhost`,
    port: 33308,
    user: `root`,
    password: `s83n38DGB8d72`,
    database: `gestion`,
})

db.connect(err => {
    if(err){
        console.error(`Error al conectar a mysql:`,err);
        return;
    }
    console.log(`Conexión exitosa a MySQL`);
});


app.use(
    session({
        //carbiar a una clave segura en producción.
        secret: process.env.SESSION_SECRET || '1234',
        resave: false,
        saveUninitialized: true,

    })
);

//configurar pug
app.set('view engine','pug');
app.set('views', path.join(__dirname, 'views'));

//Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({extended: true}));

//ruta por defecto
app.get('/', (req, res) => {
    res.render('index',{user: req.session.user});
});

//Middleware para gestionar la sesión de usuario
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;

    if (!req.session.user && !req.path.startsWith("/login")) {
        return res.redirect("/login");
    }

    next();
});


// RUTAS
// ruta por defecto
app.get('/', (req, res) => {
    res.render('index');
});

//ruta para el login
app.get('/login',(req, res)=> {
    res.render('login');
});

app.post('/login', (req,res) => {
    const { username, password } = req.body;
    console.log(username);
    console.log(password);

     // verificar credenciales
     const query = "SELECT * FROM users WHERE username = ? AND password = ?";
     db.query(query, [username, password],(err,results) => {
         if(err){
             console.error('Error al verificar las credenciales:', err);
             res.render("error", {mensaje: "Credenciales no validas."});
         }else{
             if(results.length > 0){
                 req.session.user = username;
                 res.redirect('/');
             }else{
                 res.redirect('/login');
             }
         }
     });
 })

 app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) res.render("error", {mensaje: err});
        else res.redirect('/login');
    });
});

app.get('/error', (req, res) => {
    res.render('error');
});

//rutas
app.use((req,res, next)=> {
    res.locals.user = req.session.user || null;
    if(req.session.user === undefined && !req.path.startsWith("/login"))
        res.redirect("/login");
    else
        next();
});


    


//findAll alumnos
app.get('/alumnos', (req, res) => {
    // Obtener todos los alumnos de la base de datos
    db.query('SELECT * FROM alumno', (err, result) => {
        if (err) res.render("error", {mensaje: err});
        else res.render('alumnos', { alumnos: result });
    });
});

//save() alumnos
app.get('/alumnos-add', (req, res) => {
    res.render('alumnos-add');
});

app.post('/alumnos-add', (req, res) => {
    // Insertar un nuevo alumno en la base de datos
    const { nombre, apellido, email, telefono } = req.body;
    db.query('INSERT INTO alumno (nombre, apellido, email, telefono) VALUES (?, ?, ?, ?)', 
    [nombre, apellido, email, telefono], (err, result) => {
            if (err) res.render("error", {mensaje: err});
            else res.redirect('/alumnos');
        });
});

app.get('/alumnos-edit/:id', (req, res) => {
    const alumnoId = req.params.id;
    // Obtener un alumno por su ID
    db.query('SELECT * FROM alumno WHERE id = ?', [alumnoId], (err,
        result) => {
        if (err) res.render("error", {mensaje: err});
        else res.render('alumnos-edit', { alumno: result[0] });
    });
});

app.post('/alumnos-edit/:id', (req, res) => {
    const alumnoId = req.params.id;
    // Actualizar un alumno por su ID
    const { nombre, apellido, email, telefono } = req.body;
    db.query('UPDATE alumno SET nombre = ?, apellido = ?, email = ?, telefono = ?  WHERE id = ?',
        [nombre, apellido, email, telefono, alumnoId], (err, result) => {
    if (err)
        res.render("error", {mensaje: err});
    else
        res.redirect('/alumnos');
    });
});


app.get('/alumnos-delete/:id', (req, res) => {
    const alumnoId = req.params.id;
    // Obtener y mostrar el alumno a eliminar
    db.query('SELECT * FROM alumno WHERE id = ?', [alumnoId], (err,
        result) => {
    if (err)
        res.render("error", {mensaje: err});
    else
        res.render('alumnos-delete', { alumno: result[0] });
    });
});
    
app.post('/alumnos-delete/:id', (req, res) => {
    const alumnoId = req.params.id;
    // Eliminar un alumno por su ID
    db.query('DELETE FROM alumno WHERE id = ?', [alumnoId], (err,
        result) => {
    if (err)
        res.render("error", {mensaje: err});
    else
        res.redirect('/alumnos');
    });
});


//crud asignaturas 

app.get('/asignaturas', (req, res)=> {
    db.query('SELECT * FROM asignatura', (err, result) => {
        if (err)
            res.render("error", {mensaje: err});
        else {
            res.render("asignaturas", {asignaturas: result});
        }
    });
});

app.get('/asignaturas-add', (req, res)=> {
    res.render("asignaturas-add");
});

app.post('/asignaturas-add', (req, res)=> {
    // Insertar un nuevo alumno en la base de datos
    const { nombre, ciclo, curso } = req.body;
    db.query('INSERT INTO asignatura (nombre, ciclo, curso) VALUES (?, ?,?)', [nombre, ciclo, curso], (err, result) => {
    if (err) throw err;
        res.redirect('/asignaturas');
    });
});


app.get('/asignaturas-edit/:id', (req, res)=> {
    const asignaturaId = req.params.id;
    db.query('SELECT * FROM asignatura WHERE id = ?', [asignaturaId], (err, result) =>{
        if (err)
            res.render("error", {mensaje: err});
        else
            res.render("asignaturas-edit", {asignatura: result[0]});
    });
});


app.post('/asignaturas-edit/:id', (req, res) => {
    const asignaturaId = req.params.id;
    // Actualizar un asignatura por su ID
    const { nombre, ciclo, curso } = req.body;
    db.query('UPDATE asignatura SET nombre = ?, ciclo = ?, curso = ? WHERE id = ?', [nombre, ciclo, curso, asignaturaId], (err, result)=> {
        if (err)
            res.render("error", {mensaje: err});
        else
        res.redirect('/asignaturas');
    });
});


app.get('/asignaturas-delete/:id', (req, res) => {
    const asignaturaId = req.params.id;
    // Obtener y mostrar el asignatura a eliminar
    db.query('SELECT * FROM asignatura WHERE id = ?', [asignaturaId], (err, result) => {
        if (err)
            res.render("error", {mensaje: err});
        else
            res.render('asignaturas-delete', { asignatura: result[0] });
    });
});


app.post('/asignaturas-delete/:id', (req, res) => {
    const asignaturaId = req.params.id;
    // Eliminar un asignatura por su ID
    db.query('DELETE FROM asignatura WHERE id = ?', [asignaturaId], (err, result) => {
        if (err)
            res.render("error", {mensaje: err});
        else
            res.redirect('/asignaturas');
    });
});
    
   
// Rutas maestro detalles
app.get('/matricular', (req, res) => {
    // Obtener lista de alumnos y asignaturas
    const queryAlumnos = 'SELECT * FROM alumno';
    const queryAsignaturas = 'SELECT * FROM asignatura';
    
    db.query(queryAlumnos, (errAlumnos, resultAlumnos) => {
        if (errAlumnos) throw errAlumnos;
            db.query(queryAsignaturas, (errAsignaturas, resultAsignaturas) => {
                if (errAsignaturas) throw errAsignaturas;
                    res.render('matriculas', {
                    alumnos: resultAlumnos,
                    asignaturas: resultAsignaturas,
            });
        });
    });
});



app.post('/matricular', (req, res) => {
    const { alumno, asignatura } = req.body;
    // Verificar si la matrícula ya existe
    const queryExistencia = 'SELECT * FROM asignatura_alumno WHERE alumno = ? AND asignatura = ?';
    db.query(queryExistencia, [alumno, asignatura], (errExistencia,resultExistencia) => {
        if (errExistencia) throw errExistencia;
            if (resultExistencia.length === 0) {
                // Matricular al alumno en la asignatura
                const queryMatricular = 'INSERT INTO asignatura_alumno (alumno,asignatura) VALUES (?, ?)';
                db.query(queryMatricular, [alumno, asignatura], (errMatricular)=> {
                    if (errMatricular) throw errMatricular;
                        res.redirect('/matricular');
                });
        } else {
            // Matrícula ya existe
            res.render('error', {mensaje: 'La matrícula ya existe'});
        }
    });
});


app.get('/asignaturas/:alumnoId', (req, res) => {
    const alumnoId = req.params.alumnoId;
    // Obtener asignaturas matriculadas para el alumno seleccionado
    const queryAsignaturasMatriculadas = `
    SELECT asignatura.nombre as asignatura, alumno.*
    FROM asignatura, alumno, asignatura_alumno
    WHERE asignatura_alumno.alumno = ?
    AND asignatura.id = asignatura_alumno.asignatura
    AND alumno.id = asignatura_alumno.alumno;`;
    
    db.query(queryAsignaturasMatriculadas, [alumnoId], (err, result) => {
        if (err) res.render('error', {mensaje: err});
        else {
            const asignaturas = result;
            db.query('select * from alumno where alumno.id=?', [alumnoId], (err, result) => {
                if (err) res.render('error', {mensaje: err});
                else
                    res.render('asignaturas-alumno', {alumno: result[0],
                    asignaturasMatriculadas: asignaturas});
            });
        }
    });
});


//crup profesor
//findAll profesores
app.get('/profesores', (req, res) => {
    // Obtener todos los profesores de la base de datos
    db.query('SELECT * FROM profesor', (err, result) => {
        if (err) res.render("error", {mensaje: err});
        else res.render('profesores', { profesores: result });
    });
});

//save() profesores
app.get('/profesores-add', (req, res) => {
    res.render('profesores-add');
});

app.post('/profesores-add', (req, res) => {
    // Insertar un nuevo profesor en la base de datos
    const { nombre, apellido, email} = req.body;
    db.query('INSERT INTO profesor (nombre, apellido, email) VALUES (?, ?, ?)', 
    [nombre, apellido, email], (err, result) => {
            if (err) res.render("error", {mensaje: err});
            else res.redirect('/profesores');
        });
});

app.get('/profesores-edit/:id', (req, res) => {
    const profesorId = req.params.id;
    // Obtener un profesor por su ID
    db.query('SELECT * FROM profesor WHERE id = ?', [profesorId], (err,
        result) => {
        if (err) res.render("error", {mensaje: err});
        else res.render('profesores-edit', { profesor: result[0] });
    });
});

app.post('/profesores-edit/:id', (req, res) => {
    const profesorId = req.params.id;
    // Actualizar un profesor por su ID
    const { nombre, apellido, email } = req.body;
    db.query('UPDATE profesor SET nombre = ?, apellido = ?, email = ?  WHERE id = ?',
        [nombre, apellido, email, profesorId], (err, result) => {
    if (err)
        res.render("error", {mensaje: err});
    else
        res.redirect('/profesores');
    });
});


app.get('/profesores-delete/:id', (req, res) => {
    const profesorId = req.params.id;
    // Obtener y mostrar el profesor a eliminar
    db.query('SELECT * FROM profesor WHERE id = ?', [profesorId], (err,
        result) => {
    if (err)
        res.render("error", {mensaje: err});
    else
        res.render('profesores-delete', { profesor: result[0] });
    });
});
    
app.post('/profesores-delete/:id', (req, res) => {
    const profesorId = req.params.id;
    // Eliminar un profesor por su ID
    db.query('DELETE FROM profesor WHERE id = ?', [profesorId], (err,
        result) => {
    if (err)
        res.render("error", {mensaje: err});
    else
        res.redirect('/profesores');
    });
});




// Rutas maestro asignar profesores
app.get('/asignar-profesores', (req, res) => {
    // Obtener lista de profesores y asignaturas
    const queryProfesores = 'SELECT * FROM profesor';
    const queryAsignaturas = 'SELECT * FROM asignatura';
    
    db.query(queryProfesores, (errProfesores, resultProfesores) => {
        if (errProfesores) throw errProfesores;
            db.query(queryAsignaturas, (errAsignaturas, resultAsignaturas) => {
                if (errAsignaturas) throw errAsignaturas;
                    res.render('impartir-asignaturas', {
                    profesores: resultProfesores,
                    asignaturas: resultAsignaturas,
            });
        });
    });
});



app.post('/impartir-asignaturas', (req, res) => {
    const { profesor, asignatura } = req.body;
    // Verificar si la asignacion ya existe
    const queryExistencia = 'SELECT * FROM asignatura_profesor WHERE profesor = ? AND asignatura = ?';
    db.query(queryExistencia, [profesor, asignatura], (errExistencia,resultExistencia) => {
        if (errExistencia) throw errExistencia;
            if (resultExistencia.length === 0) {
                // Asignar al profesor en la asignatura
                const queryAsignar = 'INSERT INTO asignatura_profesor (profesor,asignatura) VALUES (?, ?)';
                db.query(queryAsignar, [profesor, asignatura], (errAsignaturas)=> {
                    if (errAsignaturas) throw errAsignaturas;
                        res.redirect('/asignar-profesores');
                });
        } else {
            // Asignacion ya existe
            res.render('error', {mensaje: 'La Asignacion ya existe'});
        }
    });
});


app.get('/asignaturas-profesor/:profesorId', (req, res) => {
    const profesorId = req.params.profesorId;
    // Obtener asignaturas asignadas para el profesor seleccionado
    const queryAsignaturasAsignadas = `
    SELECT asignatura.nombre as asignatura, profesor.*
    FROM asignatura, profesor, asignatura_profesor
    WHERE asignatura_profesor.profesor = ?
    AND asignatura.id = asignatura_profesor.asignatura
    AND profesor.id = asignatura_profesor.profesor;`;
    
    db.query(queryAsignaturasAsignadas, [profesorId], (err, result) => {
        if (err) res.render('error', {mensaje: err});
        else {
            const asignaturas = result;
            db.query('select * from profesor where profesor.id=?', [profesorId], (err, result) => {
                if (err) res.render('error', {mensaje: err});
                else
                    res.render('asignaturas-profesor', {profesor: result[0],
                    asignaturasAsignadas: asignaturas});
            });
        }
    });
});



// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});

