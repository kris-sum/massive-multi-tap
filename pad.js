var express = require('express');
var app = express();
var server = require('http').createServer(app);  
var io = require('socket.io').listen(server);
var robot = require("robotjs");

// web stuff
app.use('/', express.static(__dirname + '/public'));
app.listen(80, function() { console.log('web listening on port 80')});

// socket.io stuff
 
io.sockets.on('connection', function (socket) {
    socket.user_id = 0; // current user ID
    console.log('Client connected ' + socket.id + ' from ' + socket.request.connection.remoteAddress);

    socket.emit('welcome', {message: 'Welcome!'});
 
    // process the data
    socket.on('pad.button', function (data) {
       console.log("Pad: %j", data.pad);

       if (data.pad.state!='click') {
           robot.keyToggle(data.pad.button, data.pad.state);
       } else {
           robot.keyTap(data.pad.button);
           console.log('press '+data.pad.button);
       }
       
    });
});

server.listen(5555)