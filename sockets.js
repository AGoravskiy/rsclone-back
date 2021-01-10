const socketIO = require('socket.io');

module.exports = {
   init(server) {
      this.sessions = [];
      // отслеживает подключение и если подключился какой-то клиент(socket), то дай его id
      this.io = socketIO(server, {cors: {
         origin: "*",
         methods: ["GET", "POST"]
       }});
      this.io.on('connection', socket => {
         socket.on('playerMove', data => {
            this.onPlayerMove(socket, data);
         })
         this.onConnection(socket);
         console.log(`new player connected ${socket.id}`)
      });
   },

   onPlayerMove(socket, data) {
      const session = this.sessions.find((session) => session.playerSocket === socket ||
      session.enemySocket === socket);
      if (session) {
         let opponentSocket;
         if (session.playerSocket === socket) {
            opponentSocket = session.enemySocket;
         } else {
            opponentSocket = session.playerSocket;
         }

         opponentSocket.emit('enemyMove', data);
      }
   },

   // находит сессию, в которой есть сокет игрока, но нет сокета противника => игрок ждёт противника
   getPendingSession() {
      return this.sessions.find((session) => session.playerSocket && !session.enemySocket);
   },

   createPendingSession(socket) {
      const session = {
         playerSocket: socket,
         enemySocket: null
      };
      this.sessions.push(session);
   },

   startGame(session) {
      session.playerSocket.emit('gameStart', {master: true,});
      session.enemySocket.emit('gameStart');
   },

   onConnection(socket) {

      console.log(`new player connected ${socket.id}`);
      // получаем текущую ожидающую игровую сессию

      let session = this.getPendingSession();

      if (!session) {
         this.createPendingSession(socket);
      } else {
         session.enemySocket = socket;
         this.startGame(session);
      }


   }

};