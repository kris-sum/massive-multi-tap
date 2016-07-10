"use strict";
var robot = require("robotjs");
var Player = require("./player.js");

var Manager = Manager || {};
function Manager(optionsObj)
{

    this.playerButtonsEnabled = true;
    this.arrPlayers = [];

    this.getPlayers = function () {
        return this.arrPlayers;
    }

    /**
     * Add a user to the game - sets up a Player object and adds them to arrPlayers
     */
    this.addUser = function (socket, user) {

        // check to see if this username is already taken
        for (var i = 0; i<this.arrPlayers.length; i++) { 
            var tmpPlayer = this.arrPlayers[i];
            if (tmpPlayer.name == user.name) {
                return false;
            }
        }

        var self = this;
        var player = new Player();
        player.init(socket);
        player.setName(user.name);

        // process the data on pad click
        socket.on('pad.button', function (data) {
            if (self.playerButtonsEnabled && player.buttonsEnabled) { 
                console.log(socket.id + " " + player.name + " Pad: %j", data.pad);
                if (data.pad.state!='click') {
                    robot.keyToggle(data.pad.button, data.pad.state);
                } else {
                    robot.keyTap(data.pad.button);
                    console.log('press '+data.pad.button);
                }
            }
        });

        this.arrPlayers.push(player);
        return player;
    };

    this.removeUser = function(socket) { 

        // find the socket ID in the player array and remove their player
        var found = -1;
        for (var i = 0; i<this.arrPlayers.length; i++) { 
            var tmpPlayer = this.arrPlayers[i];
            if (tmpPlayer.getSocket().id == socket.id) {
                found = i;
            }
        }

        if (found>=0) {
            var player = this.arrPlayers.splice(found,1)[0];
            console.log('Removed player ' + player.getName());
        }
        socket.emit('disconnected');

    };

}

module.exports = Manager;