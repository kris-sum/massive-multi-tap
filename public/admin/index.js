
$(function() {

    socket.emit('get-player-list');

    socket.on('player-list', function(data) { 

       for (var i=0; i<data.players.length; i++) {
           var player = data.players[i].player;
           addPlayer(player,false);
       };

    });

    socket.on('player-joined', function(data) {
        console.log(player);
        addPlayer(data.player, true);
    });

    socket.on('player-left', function(data) {
	    removePlayer(data.player);
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

    $('#content').on('click', '.player button.pad', function() {
        var socketid = $(this).closest('div').attr('id');
        var button = this;

        if ($(this).hasClass('pad-enabled')) { 
            socket.emit('player-disable-pad', { 'socketid' : socketid });
        } else { 
            socket.emit('player-enable-pad', { 'socketid' : socketid });
        }

    });
    

});


function addPlayer(player, animated) {
    
    var playerHTML = $('div.player.template').clone();

    $(playerHTML).find('.name').html(player.name);
    $(playerHTML).attr('id',player.socketid);
    $(playerHTML).removeClass('template');
    $(playerHTML).appendTo('#player-list');

    if (animated) { 
        $(playerHTML).show('slow');
    } else { 
        $(playerHTML).show();
    }

}

function removePlayer(player) { 
    $('.player[id="'+player.socketid+'"]').remove();
}