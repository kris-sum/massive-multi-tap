"use strict";
$(function() {
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
    });
});
