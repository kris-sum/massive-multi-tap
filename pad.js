var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// auth
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var sessionStore = new RedisStore();
var cookieParser = require('cookie-parser');
var socketHandshake = require('socket.io-handshake');
var sessionConfig = {store: sessionStore, key:'sid', secret:'ksecret1', parser:cookieParser(), saveUninitialized: true, resave:false }; 

io.use(socketHandshake(sessionConfig));
app.use(session(sessionConfig));

// app code
var Manager = require("./src/manager.js");
var manager = new Manager();

// web stuff
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.use('/', express.static(__dirname + '/public'));
app.listen(80, function() { console.log('web listening on port 80')});

// lobby functions

function sendStatus() {
    io.to('lobby').emit('server-status', 
    { 
        'sockets': io.engine.clientsCount, 
        'players' : manager.getPlayers().length,
        'time' : new Date().toJSON() 
    });
}

// send current time every 10 secs
setInterval(sendStatus, 1000);

// socket.io stuff
io.sockets.on('connection', function (socket) {

    console.log('Client connected - processing');
    console.log(socket.handshake.session);
    
    if (!socket.handshake.session.player) {
        console.log('Client connected ' + socket.id + ' from ' + socket.request.connection.remoteAddress);
    } else {
        var player = manager.reconnectPlayer(socket, socket.handshake.session.player);
        if (player) { 
            console.log('Client re-connected ' + player.name + ' from ' + socket.request.connection.remoteAddress);
            player.getSocket().emit('302','/lobby');  
            player.updateClient();
        } else { 
            socket.emit('302','/error');
        }
        
    }
    
    // join the socket to the lobby so they can receive lobby events
    socket.join('lobby');

    socket.on('register', function (data, fn) {

        var result = manager.addUser(socket, data.user);

        if (result == false) {
            console.log('Client ' + socket.id + ' trying to use username already in use ' + data.user.name);
            fn(result);
        } else { 
            console.log('Client registered ' + socket.id + ' username ' + data.user.name);
            socket.handshake.session.player=result.getJSON();
            socket.handshake.session.save();
            fn(true);
        }

    });

    socket.on('disconnect', function () {
        console.log('Client disconnected ' + socket.id);
        manager.removeUser(socket);
    });

});


server.listen(5555)