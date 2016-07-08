var express = require('express');
var app = express();
var server = require('http').createServer(app);  
var io = require('socket.io').listen(server);

// web stuff
app.use('/', express.static(__dirname + '/public'));
app.listen(80, function() { console.log('web listening on port 80')});

// socket.io stuff

// sample function:
// send current time to all connected clients
function sendTime() {
    io.sockets.emit('time', {
        time: new Date().toJSON()
    });
}
 
// send current time every 10 secs
setInterval(sendTime, 10000);
 
// emit welcome message on connection
io.sockets.on('connection', function (socket) {
    socket.user_id = 0; // current user ID
 
    socket.emit('welcome', {message: 'Welcome!'});
 
    socket.on('sayhi', console.log); // just log data in console
 
    // process the data
    socket.on('user_online_data', function (data) {
        socket.user_id = data.data.id; // "socket scope"
 
        var name = data.data.name; // local scope
        console.log("#:" + socket.user_id + ", name: " + name);
    });
});

server.listen(5555)