const PORT = process.env.PORT || 8080;

const DOCROOT = './../dist/';

// подключаем нужные модули

const http = require('http');
const path = require('path');
const express = require('express');
const sockets = require('./sockets');

// создаём сервер, используя express и http

const app = express();
const server = http.createServer(app);


// настраиваем отдачу игровых файлов при запросе к серверу

// const documentRoot = path.join(__dirname, DOCROOT);
// const staticContent = express.static(documentRoot);
// app.use(staticContent);


// инициализируем сокеты
sockets.init(server);

app.get('/', (req, res, next) => {
   res.send('hello world')
});

// запускаем серверт
server.listen(PORT, () => {
   console.log(`server is run http://localhost:${PORT}`)
});
