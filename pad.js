var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var Manager = require("./src/manager.js");
var manager = new Manager();

// web stuff
app.use('/', express.static(__dirname + '/public'));
app.listen(80, function() { console.log('web listening on port 80')});


function status() {
    io.broadcast.emit('server-status', { 'sockets': io.engine.clientsCount, 'players' : Manager.getPlayers().length });
}

// socket.io stuff
io.sockets.on('connection', function (socket) {

    console.log('Client connected ' + socket.id + ' from ' + socket.request.connection.remoteAddress);

    socket.on('register', function (data, fn) {

        var result = manager.addUser(socket, data.user);

        if (result == false) {
            console.log('Client ' + socket.id + ' trying to use username already in use ' + data.user.name);
            fn(result);
        } else { 
            console.log('Client registered ' + socket.id + ' username ' + data.user.name);
            fn(true);
        }

    });

    socket.on('disconnect', function () {
        console.log('Client disconnected ' + socket.id);
        manager.removeUser(socket);
    });

});


server.listen(5555)