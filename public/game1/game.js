$(function() {
    
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
})