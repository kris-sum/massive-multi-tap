
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

    $('#content').on('click', '.player .enablePad', function() {
        var socketid = $(this).closest('div').attr('id');
        var button = this;

        if ($(this).hasClass('enabled')) { 
            socket.emit('player-disable-pad', { 'socketid' : socketid }, function(confirmation) {
                $(button).addClass('btn-primary').removeClass('enabled btn-success').find('i').removeClass('fa-circle-o-notch fa-spin').addClass('fa-pause');
            });
        } else { 
            socket.emit('player-enable-pad', { 'socketid' : socketid }, function(confirmation) {
                $(button).removeClass('btn-primary').addClass('enabled btn-success').find('i').addClass('fa-circle-o-notch fa-spin').removeClass('fa-pause');
            });
        }


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

function removePlayer(player) { 
    $('.player[id="'+player.socketid+'"]').remove();
}