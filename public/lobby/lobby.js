$(function() {
    
    
    $('.joingame').on('click', function() {
        socket.emit('joingame',{ game: $(this).attr('id') });
    });


})