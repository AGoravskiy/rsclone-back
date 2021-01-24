require('dotenv').config();

const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const secureRoutes = require('./routes/secure');
const userRoutes = require('./routes/user');
const sockets = require('./sockets');
const cors = require('cors');

const uri = process.env.MONGO_CONNECTION_URL;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
mongoose.connection.on('error', (error) => {
  console.log(error);
  process.exit(1);
});
mongoose.connection.on('connected', () => {
  console.log('connected to mongo');
});

const app = express();
const server = http.createServer(app);
sockets.init(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

require('./auth/auth');

app.use('/user', userRoutes);
app.use('/', passport.authenticate('jwt', { session: false }), secureRoutes);

app.use((req, res, next) => {
  res.status(404);
  res.json({ message: '404 - Not Found' });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});
