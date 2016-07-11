$(function() {
    
    
    $('#joingame').on('click', function() {
        socket.emit('joingame');
    });


})