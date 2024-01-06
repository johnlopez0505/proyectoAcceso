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

const util = require('util');
const queryAsync = util.promisify(db.query).bind(db);

db.connect(err => {
    if(err){
        console.error(`Error al conectar a mysql:`,err);
        return;
    }
    console.log(`Conexión exitosa a MySQL`);
});

const executeDatos = require('./db.js');
const { error } = require('console');

// Llamar a la función para ejecutar los triggers
executeDatos();



//configurar pug
app.set('view engine','pug');
app.set('views', path.join(__dirname, 'views'));

//Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({extended: true}));

app.use(
    session({
        //carbiar a una clave segura en producción.
        secret: process.env.SESSION_SECRET || '1234',
        resave: false,
        saveUninitialized: true,

    })
);

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
    res.render('index',{user: req.session.user, 
        rol: req.session.rol
    });
});

//ruta para el login
app.get('/login',(req, res)=> {
    res.render('login');
});

// Ruta para manejar el formulario de login
app.post('/login', (req,res) => {
    const { username, password} = req.body;

    // verificar credenciales
    const query = "SELECT * FROM users WHERE username = ? AND password = ? ";
    const queryUserAlumno =`SELECT * FROM alumno WHERE id = ?`;
    const queryUserProfesor = `SELECT * FROM profesor WHERE id = ?`;
    db.query(query, [username, password],(err,results) => {
        //console.log(results);
        let usuario = {};
        if(results.length > 0){
            db.query(queryUserAlumno,[results[0].alumno],(errorUserAlumno,userAlumno) =>{
                //console.log(`este es results.alumno ${results[0].alumno}`);
                db.query(queryUserProfesor,[results[0].profesor],(errorUserProfesor,userProfesor) =>{
                    //console.log(`este es results.profesor ${results[0].profesor}`);
                    if(err || errorUserAlumno || errorUserProfesor){
                        console.error('Error al verificar las credenciales:', err);
                        res.render("error", {mensaje: "Credenciales no validas."});
                    }else{
                        //console.log(results[0].alumno);
                        if(results[0].alumno > 0){
                            usuario = `${userAlumno[0].nombre} ${userAlumno[0].apellido}`;
                            //console.log(usuario);
                            req.session.user =  usuario;
                            req.session.rol = results[0].rol;
                            req.session.userAlumno = {
                                id: userAlumno[0].id,
                                nombre: `${userAlumno[0].nombre} ${userAlumno[0].apellido}`,
                                email: userAlumno[0].email,
                                telefono: userAlumno[0].telefono
                            };
                            //console.log(userAlumno[0]);
                            res.redirect('/');
                        }
                        else if(results[0].profesor > 0){
                            usuario = `${userProfesor[0].nombre} ${userProfesor[0].apellido}`;
                            //console.log(usuario);
                            req.session.user =  usuario;
                            req.session.rol = results[0].rol;
                            req.session.userProfesor = {
                                id: userProfesor[0].id,
                                nombre: `${userProfesor[0].nombre} ${userProfesor[0].apellido}`,
                                email: userProfesor[0].email
                            };
                            res.redirect('/');
                        }
                        else if(results.length > 0){
                            req.session.user =  username;
                            req.session.rol = results[0].rol;
                            res.redirect('/');
                        }
                    }
                });
            });
        }else{
            res.redirect('/login');
        }
     });
 });

 

 app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) res.render("error", {mensaje: err});
        else res.redirect('/login');
    });
});

app.get('/error', (req, res) => {
    res.render('error');
});



//findAll alumnos
app.get('/alumnos', (req, res) => {
    // Obtener todos los alumnos de la base de datos
    const queryAlumnos = `SELECT * FROM alumno ORDER BY nombre`;

    // Consulta para alumnos
    const queryAlumnosCiclo = `
    SELECT DISTINCT a.*, asign.ciclo
    FROM alumno a
    JOIN asignatura_alumno aa ON a.id = aa.alumno
    JOIN asignatura asign ON aa.asignatura = asign.id
    WHERE asign.curso IN 
    (SELECT asign.curso FROM asignatura_alumno aa1
    JOIN asignatura asign1 ON aa1.asignatura = asign1.id
    WHERE aa1.alumno = ?)`;
    //console.log("ID del alumno en sesión:", req.session.userAlumno.id);
    //console.log("ID del profesor en sesión:", req.session.userProfesor);

    // Consulta para profesores
    const queryAlumnosAsignaturasProfesor = `
    SELECT a.*, asign.ciclo, 
    GROUP_CONCAT(asign.nombre ORDER BY asign.nombre) as asignaturas
    FROM alumno a
    JOIN asignatura_alumno aa ON a.id = aa.alumno
    JOIN asignatura_profesor ap ON aa.asignatura = ap.asignatura
    JOIN asignatura asign ON ap.asignatura = asign.id
    WHERE ap.profesor = ?
    GROUP BY a.id, a.nombre, a.apellido, a.email, a.telefono, asign.ciclo`;

    // Determinar qué consulta ejecutar basándose en el rol del usuario
    let queryToExecute="";
    let idUsuario = 0;
    if(req.session.rol === 'administrativo'){
        queryToExecute = queryAlumnos;
    }else{
        queryToExecute = (req.session.rol === 'alumno') ? queryAlumnosCiclo : queryAlumnosAsignaturasProfesor;
        //console.log(queryToExecute);
        idUsuario = (req.session.rol === 'alumno') ? req.session.userAlumno.id : req.session.userProfesor.id;
        //console.log(idUsuario);
    }
    
    db.query(queryToExecute,[idUsuario],(err,result)=>{
        //console.log(result);
        if (err) res.render("error", {mensaje: err});
        else res.render('alumnos', { alumnos: result,
            user: req.session.user, 
            rol: req.session.rol,
            userAlumno: req.session.userAlumno,
        });
    });
});

//save() alumnos
app.get('/alumnos-add', (req, res) => {
    res.render('alumnos-add',{user: req.session.user, 
        rol: req.session.rol});
});

app.post('/alumnos-add', (req, res) => {
    // Insertar un nuevo alumno en la base de datos
    const { nombre, apellido, email, telefono } = req.body;
    db.query(`INSERT INTO alumno 
                (nombre, apellido, email, telefono) 
                VALUES (?, ?, ?, ?)`, 
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
        else res.render('alumnos-edit', { alumno: result[0], 
            user: req.session.user, 
            rol: req.session.rol
        });
    });
});

app.post('/alumnos-edit/:id', (req, res) => {
    const alumnoId = req.params.id;
    // Actualizar un alumno por su ID
    const { nombre, apellido, email, telefono } = req.body;
    db.query(`UPDATE alumno SET 
                nombre = ?, 
                apellido = ?, 
                email = ?, 
                telefono = ?  
                WHERE id = ?`,
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
        res.render('alumnos-delete', { 
            alumno: result[0],
            user: req.session.user, 
            rol: req.session.rol
        });
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
     // Obtener todas las asignaturas de la base de datos
    const queryAsignaturas =`SELECT * FROM asignatura ORDER BY nombre`;
    // Obtener profesor por id
    const queryProfesor = `SELECT * FROM profesor WHERE profesor.id = ?`
    // Obtener alumno por id 
    const queryAlumno = `SELECT * FROM alumno WHERE alumno.id = ?`
     // consulta alumno
    const queryAsiganturaAlumno=`
    SELECT asignatura.nombre as asignatura, alumno.*
    FROM asignatura, alumno, asignatura_alumno
    WHERE asignatura_alumno.alumno = ?
    AND asignatura.id = asignatura_alumno.asignatura
    AND alumno.id = asignatura_alumno.alumno`;

    // Consulta para profesores
    const queryProfesoresAsignaturas = `
    SELECT asignatura.nombre as asignatura, profesor.*
    FROM asignatura, profesor, asignatura_profesor
    WHERE asignatura_profesor.profesor = ?
    AND asignatura.id = asignatura_profesor.asignatura
    AND profesor.id = asignatura_profesor.profesor`;
 
    // Determinar qué consulta ejecutar basándose en el rol del usuario
    let queryToExecute="";
    let queryUser= "";
    let idUsuario = 0;
    if(req.session.rol === 'administrativo'){
        queryToExecute = queryAsignaturas;
    }else{
        queryToExecute = (req.session.rol === 'alumno') 
            ? queryAsiganturaAlumno : queryProfesoresAsignaturas;
        //console.log(queryToExecute);
        idUsuario = (req.session.rol === 'alumno')
            ? req.session.userAlumno.id :req.session.userProfesor.id;
        //console.log(idUsuario);
        queryUser = (req.session.rol === 'alumno') ? queryAlumno : queryProfesor
    }
    let usuario = {};
    if(req.session.rol !== 'administrativo'){
        db.query(queryUser,[idUsuario],(err,result)=>{
            if(err)  res.render("error", {mensaje: err});
            else{
                usuario=result[0];
            }
    
        })
    }
    db.query(queryToExecute,[idUsuario], (err, result) => {
        if (err)
            res.render("error", {mensaje: err});
        else {
            res.render("asignaturas", {asignaturas: result,
                usuario: usuario, 
                user: req.session.user, 
                rol: req.session.rol});
        }
    });
});

app.get('/asignaturas-add', (req, res)=> {
    res.render("asignaturas-add",{
        user: req.session.user, 
        rol: req.session.rol
    });
});

app.post('/asignaturas-add', (req, res)=> {
    // Insertar un nuevo alumno en la base de datos
    const { nombre, ciclo, curso } = req.body;
    db.query(`INSERT INTO asignatura 
                (nombre, ciclo, curso) 
                VALUES (?, ?,?)`, 
            [nombre, ciclo, curso], (err, result) => {
    if (err) throw err;
        res.redirect('/asignaturas');
    });
});


app.get('/asignaturas-edit/:id', (req, res)=> {
    const asignaturaId = req.params.id;
    db.query(`SELECT * FROM asignatura 
                WHERE id = ?`, 
            [asignaturaId], (err, result) =>{
        if (err)
            res.render("error", {mensaje: err});
        else
            res.render("asignaturas-edit", {
                asignatura: result[0],
                user: req.session.user, 
                rol: req.session.rol
        });
    });
});


app.post('/asignaturas-edit/:id', (req, res) => {
    const asignaturaId = req.params.id;
    // Actualizar un asignatura por su ID
    const { nombre, ciclo, curso } = req.body;
    db.query(`UPDATE asignatura 
                SET nombre = ?, 
                ciclo = ?, 
                curso = ? 
                WHERE id = ?`,
            [nombre, ciclo, curso, asignaturaId], (err, result)=> {
        if (err)
            res.render("error", {mensaje: err});
        else
        res.redirect('/asignaturas');
    });
});


app.get('/asignaturas-delete/:id', (req, res) => {
    const asignaturaId = req.params.id;
    // Obtener y mostrar el asignatura a eliminar
    db.query(`SELECT * FROM asignatura 
                WHERE id = ?`, 
            [asignaturaId], (err, result) => {
        if (err)
            res.render("error", {mensaje: err});
        else
            res.render('asignaturas-delete', { 
                asignatura: result[0],
                user: req.session.user, 
                rol: req.session.rol 
        });
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
    
   
// detalle maestro matriculas
app.get('/matricular', (req, res) => {
    // Obtener lista de alumnos y asignaturas
    const queryAlumnos = ' SELECT * FROM alumno ORDER BY nombre';
    const queryAsignaturas = 'SELECT * FROM asignatura ORDER BY nombre';
    const queryAsigAlumnos = `
    SELECT a.id as id,
    CONCAT(a.nombre, ' ', a.apellido) AS nombre, 
    GROUP_CONCAT(asig.nombre SEPARATOR ', ') AS asignaturas,
    GROUP_CONCAT(asig.id SEPARATOR ', ') AS idAsignaturas 
    FROM asignatura_alumno al 
    JOIN alumno a ON al.alumno = a.id 
    JOIN asignatura asig ON al.asignatura = asig.id 
    GROUP BY nombre, id`
    
    db.query(queryAlumnos, (errAlumnos, resultAlumnos) => {
        if (errAlumnos) throw errAlumnos;
            db.query(queryAsigAlumnos, (errAsigAlumnos, resultAsigAlumnos) => {
                if (errAsigAlumnos) throw errAsigAlumnos;
                db.query(queryAsignaturas, (errAsignaturas, resultAsignaturas) => {
                    if (errAsignaturas) throw errAsignaturas;
                        res.render('matriculas', {
                        alumnos: resultAlumnos,
                        asignaturas: resultAsignaturas,
                        matriculados: resultAsigAlumnos,
                        user: req.session.user, 
                        rol: req.session.rol
                })
            });
        });
    });
});



app.post('/matricular', async (req, res) => {
    const { alumno, asignatura } = req.body;

    // Verificar si la matricula ya existe
    const queryExistencia = `
    SELECT * FROM asignatura_alumno 
    WHERE alumno = ? AND asignatura = ?`;

    try {
        const resultExistencia = await queryAsync(queryExistencia, [alumno, asignatura]);
        if (resultExistencia.length === 0) {
            // Matricular al alumno en la asignatura
            const queryMatricular = `
            INSERT INTO asignatura_alumno 
            (alumno, asignatura) VALUES (?, ?)`;
            
            try {
                await queryAsync(queryMatricular, [alumno, asignatura]);
                // Éxito en la matricula
                res.redirect('/matricular');
            } catch (errMatricular) {
                // Ignorar el error específico que esperamos
                if (!(errMatricular.sqlState === '45000' && errMatricular.errno === 1644)) {
                    // Otro tipo de error, lanzar para que se maneje en el bloque catch superior
                    throw errMatricular;
                }
                // Error específico: No se pueden matricular más de 32 alumnos a la asignatura
                console.error('Error: No se pueden matricular más de 32 Alumnos a la Asignatura.');
                res.render('error', { mensaje: 'No se pueden matricular más de 32 Alumnos a la Asignatura.' });
            }
        } else {
            // Asignación ya existe
            res.render('error', { mensaje: 'La Asignación ya existe' });
        }
    } catch (errExistencia) {
        // Error al verificar la existencia
        res.render('error', { mensaje: 'Error al verificar la existencia.' });
    }
});

app.get('/asignaturas-alumno/:alumnoId', (req, res) => {
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
                    asignaturasMatriculadas: asignaturas,
                    user: req.session.user, 
                    rol: req.session.rol
                });
            });
        }
    });
});

app.post('/matricula-delete', (req, res) => {
    const { alumno, asignatura } = req.body;
    
    // Eliminar un profesor por su ID
    db.query(`DELETE FROM asignatura_alumno 
    WHERE alumno = ? AND asignatura = ?`
    , [alumno,asignatura], (err,
        result) => {
    if (err)
        res.render("error", {mensaje: err});
    else
        res.redirect('/matricular');
    });
});


//crup profesor
//findAll profesores
app.get('/profesores', (req, res) => {
    // Obtener todos los profesores de la base de datos
    const queryProfesores =`SELECT * FROM profesor ORDER BY nombre`;
    // Consulta para alumnos
    const queryProfesoresCiclo = `
    SELECT p.*, 
    asign.ciclo,
    GROUP_CONCAT(DISTINCT asign.nombre ORDER BY asign.nombre SEPARATOR ', ') as asignaturas
    FROM profesor p
    JOIN asignatura_profesor ap ON p.id = ap.profesor
    JOIN asignatura asign ON ap.asignatura = asign.id
    JOIN asignatura_alumno aa ON ap.asignatura = aa.asignatura
    WHERE aa.alumno = ?
    GROUP BY p.id, p.nombre, p.apellido, p.email, asign.ciclo`;
    //console.log("ID del alumno en sesión:", req.session.userAlumno.id);
    //console.log("ID del profesor en sesión:", req.session.userProfesor);
 
    // Consulta para profesores
    const queryProfesoresAsignaturas = `
    SELECT p.*, 
    asign.ciclo,
    GROUP_CONCAT(DISTINCT asign.nombre ORDER BY asign.nombre SEPARATOR ', ') as asignaturas
    FROM profesor p
    JOIN asignatura_profesor ap ON p.id = ap.profesor
    JOIN asignatura asign ON ap.asignatura = asign.id
    GROUP BY p.id, p.nombre, p.apellido, p.email, asign.ciclo`;
 
    // Determinar qué consulta ejecutar basándose en el rol del usuario
    let queryToExecute="";
    let idUsuario = 0;
    if(req.session.rol === 'administrativo'){
        queryToExecute = queryProfesores;
    }else{
        queryToExecute = (req.session.rol === 'alumno') ? queryProfesoresCiclo : queryProfesoresAsignaturas;
        //console.log(queryToExecute);
        idUsuario = (req.session.rol === 'alumno') ? req.session.userAlumno.id :0;
        //console.log(idUsuario);
    }
     
    db.query(queryToExecute,[idUsuario], (err, result) => {
        if (err) res.render("error", {mensaje: err});
        else res.render('profesores', { 
            profesores: result, 
            user: req.session.user, 
            rol: req.session.rol
        });
    });
});

//save() profesores
app.get('/profesores-add', (req, res) => {
    res.render('profesores-add',{
        user: req.session.user, 
        rol: req.session.rol
    });
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
        else res.render('profesores-edit', { 
            profesor: result[0],
            user: req.session.user, 
            rol: req.session.rol 
        });
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
        res.render('profesores-delete', {
            profesor: result[0],
            user: req.session.user, 
            rol: req.session.rol 
        });
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
    const queryProfesores = 'SELECT * FROM profesor ORDER BY nombre';
    const queryAsignaturas = 'SELECT * FROM asignatura ORDER BY nombre';
    const queryAsignaturasProfesores = `
    SELECT p.id as id,
    CONCAT(p.nombre, ' ', p.apellido) AS nombre, 
    GROUP_CONCAT(asig.nombre SEPARATOR ', ') AS asignaturas,
    GROUP_CONCAT(asig.id SEPARATOR ', ') AS idAsignaturas 
    FROM asignatura_profesor ap 
    JOIN profesor p ON ap.profesor = p.id 
    JOIN asignatura asig ON ap.asignatura = asig.id 
    GROUP BY nombre, id;`;
    
    db.query(queryProfesores, (errProfesores, resultProfesores) => {
        if (errProfesores) throw errProfesores;
            db.query(queryAsignaturasProfesores, (errAsignaturaProfesores, resultAsignaturaProfesor) =>{
                if (errAsignaturaProfesores) throw errAsignaturaProfesores;
                db.query(queryAsignaturas, (errAsignaturas, resultAsignaturas) => {
                    if (errAsignaturas) throw errAsignaturas;
                        res.render('impartir-asignaturas', {
                        profesores: resultProfesores,
                        asignaturas: resultAsignaturas,
                        asignaturasProfesores: resultAsignaturaProfesor,
                        user: req.session.user, 
                        rol: req.session.rol,
                });
            });
        });
    });
});


app.post('/impartir-asignaturas', async (req, res) => {
    const { profesor, asignatura } = req.body;

    // Verificar si la asignación ya existe
    const queryExistencia = 'SELECT * FROM asignatura_profesor WHERE profesor = ? AND asignatura = ?';

    try {
        const resultExistencia = await queryAsync(queryExistencia, [profesor, asignatura]);

        if (resultExistencia.length === 0) {
            // Asignar al profesor en la asignatura
            const queryAsignar = 'INSERT INTO asignatura_profesor (profesor, asignatura) VALUES (?, ?)';
            
            try {
                await queryAsync(queryAsignar, [profesor, asignatura]);
                // Éxito en la asignación
                res.redirect('/asignar-profesores');
            } catch (errAsignaturas) {
                // Ignorar el error específico que esperamos
                if (!(errAsignaturas.sqlState === '45000' && errAsignaturas.errno === 1644)) {
                    // Otro tipo de error, lanzar para que se maneje en el bloque catch superior
                    throw errAsignaturas;
                }
                // Error específico: No se pueden asignar más de dos profesores a la asignatura
                console.error('Error: No se pueden asignar más de dos profesores a la asignatura.');
                res.render('error', { mensaje: 'No se pueden asignar más de dos profesores a la asignatura.' });
            }
        } else {
            // Asignación ya existe
            res.render('error', { mensaje: 'La Asignación ya existe' });
        }
    } catch (errExistencia) {
        // Error al verificar la existencia
        res.render('error', { mensaje: 'Error al verificar la existencia.' });
    }
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
                    asignaturasAsignadas: asignaturas,
                    user: req.session.user, 
                    rol: req.session.rol
                });
            });
        }
    });
});

app.post('/profesores-asignaturas-delete', (req, res) => {
    const { profesor, asignatura } = req.body;
    
    // Eliminar un profesor por su ID
    db.query(`DELETE FROM asignatura_profesor 
    WHERE profesor = ? AND asignatura = ?`
    , [profesor,asignatura], (err,
        result) => {
    if (err)
        res.render("error", {mensaje: err});
    else
        res.redirect('/asignar-profesores');
    });
});



// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});

