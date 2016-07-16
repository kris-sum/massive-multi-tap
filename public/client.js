"use strict";

var socket = io.connect(window.location.hostname + ':5555');
var player = { 'name' : '', 'buttonsEnabled' : false };

$(function() {

    socket.on('server-status', function(data) { 
        $('#statusbar span.connectionCount').html(data.sockets);
        $('#statusbar span.playerCount').html(data.players);
    
        var time = new Date(data.time);
        $('#statusbar span.time').html(time.getHours() + ':'+time.getMinutes()+':'+time.getSeconds());
    });
    socket.on('errormsg', function(data) { 
        $('#statusbar .error').show().html(data);
    });

    socket.on('302', function(data) { 
        /*
        if (window.location != data) {
            socket.disconnect();
            window.location = data;
        } */
    });
    socket.on('load', function(data) { 
        $('#content').html(data);
        window.navigator.vibrate([100,50,100]);
    });

    socket.on('update-ui', function(data) {
        player = data.player;

        $('#statusbar span.name').html(player.name);

        if (player.buttonsEnabled == false)
        {
            $('#pad').addClass('disabled');
        } else {
            $('#pad').removeClass('disabled');
        }
    });
    socket.on('connect', function(data) {
       $('#statusbar').removeClass('disconnected'); 
    });

    socket.on('disconnect', function(data) {
       $('#statusbar').addClass('disconnected'); 
    });

});
