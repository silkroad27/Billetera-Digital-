const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const passportConfig = require('./config/passport');
const cors = require('cors');
const Swal = require('sweetalert2');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const MONGO_URL = 'mongodb://127.0.0.1:27017/auth';
const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on('error', (err) => {
  throw err;
  process.exit(1);
})

const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  autoReconnect: true
});

app.use(cors());

app.use(session({
  secret: 'ESTO ES SECRETO',
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: {
    maxAge: 60 * 60 * 1000 // 1 hora en milisegundos
  }
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.raw({ type: '*/*', limit: '50mb' }));

const controladorUsuario = require('./controladores/usuario');

app.get('/userInfo/:userId', controladorUsuario.getUserInfo);
app.put('/userInfo/:userId', controladorUsuario.updateUserInfo);
app.put('/uploadProfileImage/:userId', controladorUsuario.uploadProfileImage);
app.put('/changePassword/:userId', controladorUsuario.changePassword);
app.post('/signup', controladorUsuario.postSignup);
app.post('/login', controladorUsuario.postLogin);
app.get('/logout', passportConfig.estaAutenticado, controladorUsuario.logout);
//Funciones de cuenta
const controladorCuenta = require('./controladores/cuenta');
app.get('/cuenta/:cuentaId', controladorCuenta.getCuentaById);
app.get('/userByAccount/:cuentaId', controladorCuenta.getUserInfoByAccount);
app.get('/cuentaUserId/:userId', controladorCuenta.getCuentasByUserId);
app.post('/cuentaNueva', controladorCuenta.crearCuenta);
app.put('/cambiarTasa/:accountId', controladorCuenta.cambiarTasa);

app.listen(3000, () => {
  console.log('Escuchando en el puerto 3000')
})

