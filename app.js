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
        secret: `secreto`,
        resave: false,
        saveUninitialized: true,

    })
);

//configurar pug
app.set(`view engine`,`pug`);
app.set(`views`, path.join(__dirname, `views`));

//Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({extends: true}));


//rutas
app.use((req,res, next)=> {
    res.locals.user = req.session.user || null;
    if(req.session.user === undefined && !req.path.startsWith("/login"))
        res.redirect("/login");
    else
        next();
});

app.get(`/`, (req, res) => {
    res.redirect(`index`,{user: req.session.user})
});

// Iniciar el servidor
app.listen(port, () => {
console.log(`Servidor iniciado en http://localhost:${port}`);
});

app.get(`/login`,(req, res)=> {
    res.render(`login`);
});