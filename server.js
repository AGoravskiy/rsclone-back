const PORT = 3000;

const DOCROOT = './../dist/';

// reads in our .env file and makes those values available as environment variables
require('dotenv').config();

const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const secureRoutes = require('./routes/secure');
const routes = require('./routes/main');
const sockets = require('./sockets');

// создаём сервер, используя express и http

const app = express();
const server = http.createServer(app);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// настраиваем отдачу игровых файлов при запросе к серверу

// const documentRoot = path.join(__dirname, DOCROOT);
// const staticContent = express.static(documentRoot);
// app.use(staticContent);

// инициализируем сокеты
sockets.init(server);

// setup mongo connection
const uri = process.env.MONGO_CONNECTION_URL;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
mongoose.connection.on('error', (error) => {
  console.log(error);
  process.exit(1);
});
mongoose.connection.on('connected', () => {
  console.log('connected to mongo');
});

// update express settings
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
// require passport auth
// require('./auth/auth');

// app.get('/index.html', passport.authenticate('jwt', { session: false }), (req, res) => {
//   res.sendFile(`${DOCROOT}index.html`);
// });

app.use(express.static(DOCROOT));
app.get('/', (req, res) => {
  res.send('zalupa');
});

// routes
app.use('/', routes);
// app.use('/', passport.authenticate('jwt', { session: false }), secureRoutes);

// catch all other routes
app.use((req, res, next) => {
  res.status(404);
  res.json({ message: '404 - Not Found' });
});

// handle errors
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err });
});

// have the server start listening on the provided port
server.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});
