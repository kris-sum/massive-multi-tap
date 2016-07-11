
$(function() {

    socket.emit('get-player-list');

    socket.on('player-list', function(data) { 

       for (var i=0; i<data.players.length; i++) {
           var player = data.players[i].player;
           addPlayer(player,false);
       };

    });

    socket.on('player-joined', function(data) {

    });
    socket.on('player-left', function(data) {

    });

});


function addPlayer(player, animated) {
    
    var playerHTML = $('div.player.template').clone();

    $(playerHTML).find('.name').html(player.name);
    $(playerHTML).attr('id',player.socketid);
    $(playerHTML).removeClass('template');
    $(playerHTML).appendTo('div.players');

    if (animated) { 
        $(playerHTML).show('slow');
    } else { 
        $(playerHTML).show();
    }

}