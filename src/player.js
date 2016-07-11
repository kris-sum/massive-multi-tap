"use strict";
var fs = require('fs');

class Player {
     constructor(socket) {
        this.buttonsEnabled = true;
        this.name = '';
        this.socket = socket;
    }
    
    enableButtons() {
        this.buttonsEnabled = true;
        this.updateClient();
        return this;
    }

    disableButtons() {
        this.buttonsEnabled = false;
        this.updateClient();
        return this;
    }

    getName() {
        return this.name;
    }
    setName(name) { 
        this.name = name;
        return this;
    }
    
    setSocket(socket) {
        this.socket = socket;
        return this;
    }
    getSocket() {
        return this.socket;
    }

    getJSON() {
        var data = {};

        var obj = {}
        obj.name = this.name;
        obj.buttonsEnabled = this.buttonsEnabled;
        obj.socketid = this.socket.id;

        data.player = obj;

        return data;
    }

    loadFromJSON(json) {

        var obj = JSON.parse(json);
        this.name = obj.name;
        return this;
    };

    /**
     * Sends data to the client so the client can update it's UI state
     */
    updateClient() {
        this.socket.emit('update-ui', this.getJSON());
    };

    sendPage(filename) {
        var self = this;
        fs.readFile(__dirname + '/../public/' + filename , "utf-8", function (err, data){
            if (err) console.log(err);
            self.socket.emit('load', data);
        });
    };

};


module.exports = Player;