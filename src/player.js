var fs = require('fs');

var Player = Player || {};
function Player(optionsObj)
{
    this.buttonsEnabled = true;
    this.name = '';
    this.socket = null;
    
    this.init = function (socket) { 
        this.socket = socket;
    }

    this.enableButtons = function () {
        this.buttonsEnabled = true;
        this.updateClient();
        return this;
    }

    this.disableButtons = function () {
        this.buttonsEnabled = false;
        this.updateClient();
        return this;
    }

    this.getName = function() {
        return this.name;
    }
    this.setName = function (name) { 
        this.name = name;
        return this;
    }
    
    this.setSocket = function(socket) {
        this.socket = socket;
        return this;
    }
    this.getSocket = function () {
        return this.socket;
    }

    this.getJSON = function () {
        var data = {};

        var obj = {}
        obj.name = this.name;
        obj.buttonsEnabled = this.buttonsEnabled;

        data.player = obj;

        return data;
    }

    this.loadFromJSON = function (json) {

        var obj = JSON.parse(json);
        this.name = obj.name;
        return this;
    };

    /**
     * Sends data to the client so the client can update it's UI state
     */
    this.updateClient = function () {
        this.socket.emit('update-ui', this.getJSON());
    };

    this.sendPage = function(filename) {
        var self = this;
        fs.readFile(__dirname + '/../public/' + filename , "utf-8", function (err, data){
            if (err) console.log(err);
            self.socket.emit('load', data);
        });
    };

};


module.exports = Player;