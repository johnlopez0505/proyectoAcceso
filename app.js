const express = require(`express`);
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
        secret: '1234',
        resave: false,
        saveUninitialized: true,

    })
);

//configurar pug
app.set('view engine','pug');
app.set('views', path.join(__dirname, 'views'));

//Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({extends: true}));

//ruta por defecto
app.get('/', (req, res) => {
    res.render('index',{user: req.session.user})
});

//Middleware para gestionar la sesión de usuario
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    if (!req.session.user && !req.path.match('/login'))
        res.redirect('/login')
    else
    next();
});


// RUTAS
// ruta por defecto
app.get('/', (req, res) => {
    res.render('index');
});


//rutas
app.use((req,res, next)=> {
    res.locals.user = req.session.user || null;
    if(req.session.user === undefined && !req.path.startsWith("/login"))
        res.redirect("/login");
    else
        next();
});


//ruta para el login
app.get('/login',(req, res)=> {
    res.render('login');
});

app.post('/login', (req,res) => {
    const { username, password } = req.body;

    // verificar credenciales
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password],(err,results) => {
        if(err){
            console.error('Error al verificar las credenciales:', err);
            res.render("err", {mensaje: "Credenciales no validas."});
        }else{
            if(results.length > 0){
                req.session.user = username;
                res.redirect('/');
            }else{
                res.redirect('/login');
            }
        }
    })
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
    const { nombre, apellido } = req.body;
    db.query('INSERT INTO alumno (nombre, apellido) VALUES (?, ?)', [
        nombre, apellido], (err, result) => {
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
    const { nombre, apellido } = req.body;
    db.query('UPDATE alumno SET nombre = ?, apellido = ? WHERE id = ?',
        [nombre, apellido, alumnoId], (err, result) => {
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



// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});

