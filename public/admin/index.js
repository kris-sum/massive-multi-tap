$(function() {

    socket.emit('get-player-list');
    socket.removeListener('player-list');
    socket.removeListener('player-joined');
    socket.removeListener('player-activated');
    socket.removeListener('player-deactivated');
    socket.removeListener('player-deactivated');
    socket.removeListener('active-player-list');
    socket.removeListener('next-player-list');

    socket.on('player-list', function(data) { 
       for (var i=0; i<data.players.length; i++) {
           var player = data.players[i].player;
           addPlayer(player,false,'#player-list');
       };

    });

    socket.on('active-player-list', function(data) { 
       for (var i=0; i<data.players.length; i++) {
           var player = data.players[i].player;
           addPlayer(player,false, '#active-player-list');
       };

    });


    socket.on('next-player-list', function(data) { 

       for (var i=0; i<data.players.length; i++) {
           var player = data.players[i].player;
           addPlayer(player,false, '#next-player-list');
       };

    });

    socket.on('player-joined', function(data) {
        addPlayer(data.player, true, '#player-list');
    });

    socket.on('player-left', function(data) {
	    removePlayer(data.player , false, '#player-list');
    });

    socket.on('player-activated', function(data) {

        var playerDiv = $('#player-list').find('.player[id="'+data.player.socketid+'"]');

        if (playerDiv) {
            $(playerDiv).find('button.pad.pad-disabled').hide();
            $(playerDiv).find('button.pad.pad-enabled').show();
            $(playerDiv).appendTo('#active-player-list');
        }

    });

    socket.on('player-deactivated', function(data) { 

        var playerDiv = $('#active-player-list').find('.player[id="'+data.player.socketid+'"]');

        if (playerDiv) {
            $(playerDiv).find('button.pad.pad-disabled').show();
            $(playerDiv).find('button.pad.pad-enabled').hide();
            $(playerDiv).appendTo('#player-list');
        }
                   
    });

    socket.on('update-dashboard', function(data) { 

        var timerDiv = $('#timeleft span');

        if (timerDiv) {
            $(timerDiv).html(data.cycleTimeLeft);
        }
                   
    });

    $('#content').on('click', '.player button.pad', function() {
        var socketid = $(this).closest('div').attr('id');
        var button = this;

        if ($(this).hasClass('pad-enabled')) { 
            socket.emit('player-disable-pad', { 'socketid' : socketid });
        } else { 
            socket.emit('player-enable-pad', { 'socketid' : socketid });
        }

    });

    $('#content').on('click', '#dash', function() {
        socket.emit('admin-loadpage', { 'page' : 'admin/dashboard.html' });
    });
    
    $('#content').on('click', '#cycle-start', function() {
        socket.emit('cycle-start', { 'game' : 'game1/nes1' });
    });
 
});

function addPlayer(player, animated, destination) {
    
    var playerHTML = $('div.player.template').clone();

    $(playerHTML).find('.name').html(player.name);
    $(playerHTML).attr('id',player.socketid);
    $(playerHTML).removeClass('template');
    $(playerHTML).appendTo(destination);

    if (animated) { 
        $(playerHTML).show('slow');
    } else { 
        $(playerHTML).show();
    }

}

function removePlayer(player) { 
    $('.player[id="'+player.socketid+'"]').remove();
}