var Player = Player || {};
function Player(optionsObj)
{
    this.buttonsEnabled = true;
    this.name = '';
    this.socket = null;
    
    this.init = function (socket) { 
        
        socket.join('players');
        this.socket = socket;

    }

    this.getName = function() {
        return this.name;
    }
    this.setName = function (name) { 
        this.name = name;
        return this;
    }
    this.getSocket = function () {
        return this.socket;
    }

}


module.exports = Player;