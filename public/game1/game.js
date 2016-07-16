$(function() {
    
    // unbind previously bound events (prevents duplication if the page gets reloaded)
    $('#pad .button.click, #pad .button.updown, #pad.button.toggle').off();

    $('#pad .button.click').on('click', function() {
        if (player.buttonsEnabled == false) return; 
        
        window.navigator.vibrate(50);
        socket.emit('pad.button',{
            pad: {button: $(this).attr('id'), state: 'click' }
        });
    });

    $('#pad .button.updown').on('mousedown touchstart', function() {
        if (player.buttonsEnabled == false) return; 
        // check to see if we're not already 'down'
        if ($(this).hasClass('down')) return;
        window.navigator.vibrate(50);
        socket.emit('pad.button',{
            pad: {button: $(this).attr('id'), state: 'down' }
        });
        $(this).addClass('down');
    });

    $('#pad .button.updown').on('mouseup touchend', function() {
        if (player.buttonsEnabled == false) return; 
        
        window.navigator.vibrate(50);
        socket.emit('pad.button',{
            pad: {button: $(this).attr('id'), state: 'up' }
        });
        $(this).removeClass('down');
    });

    $('#pad .button.toggle').on('click', function() {
        if (player.buttonsEnabled == false) return; 
        
        window.navigator.vibrate(50);
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