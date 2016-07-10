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

    socket.on('update-ui', function(data) {
        player = data.player;
        if (player.buttonsEnabled == false)
        {
            $('#pad').addClass('disabled');
        } else {
            $('#pad').removeClass('disabled');
        }
    });

    $('#register form').on('submit', function(event) {

        event.preventDefault();
        var playerName =  $('#register input.name').val();

        if (playerName=='') {
            $('#register .error').show('fast');
            return false;
        }

        socket.emit(
            'register', 
            { user: { name : playerName } } ,
            function(confirmation){ 
                if (confirmation) { 
                    $('#register').hide();
                    $('#pad').show();
                } else { 
                    $('#register .error').show('fast');
                }
            });

        return false;
    })

    $('#pad .button.click').on('click', function() {
        if (player.buttonsEnabled == false) return; 
        socket.emit('pad.button',{
            pad: {button: $(this).attr('id'), state: 'click' }
        });
    });

    $('#pad .button.updown').on('mousedown touchstart', function() {
        if (player.buttonsEnabled == false) return; 
        // check to see if we're not already 'down'
        if ($(this).hasClass('down')) return;
        socket.emit('pad.button',{
            pad: {button: $(this).attr('id'), state: 'down' }
        });
        $(this).addClass('down');
    });

    $('#pad .button.updown').on('mouseup touchend', function() {
        if (player.buttonsEnabled == false) return; 
        socket.emit('pad.button',{
            pad: {button: $(this).attr('id'), state: 'up' }
        });
        $(this).removeClass('down');
    });

    $('#pad .button.toggle').on('click', function() {
        if (player.buttonsEnabled == false) return; 
        if ($(this).hasClass('down')) {
            socket.emit('pad.button',{
                pad: {button: $(this).attr('id'), state: 'up' }
            });
            $(this).removeClass('down');
        } else { 
            socket.emit('pad.button',{
                pad: {button: $(this).attr('id'), state: 'down' }
            });
            $(this).addClass('down');
        }

    });

});
