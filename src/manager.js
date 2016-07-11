"use strict";
var robot = require("robotjs");
var Player = require("./player.js");
var Admin = require("./admin.js");

var Manager = Manager || {};
function Manager(optionsObj)
{

    this.playerButtonsEnabled = true;
    this.arrPlayers = [];

    this.arrPlayersInControl = [];

    this.io;

    this.init = function (io) {
        console.log('Manager init');
        this.io = io;

        var self=this;

        setInterval(function() { self._sendStatus(); } , 1000);
        
    }

        
    this._sendStatus = function () {

        var serverstatus = { 
            'sockets': this.io.engine.clientsCount, 
            'players' : this.getPlayers().length,
            'time' : new Date().toJSON() 
        };

        this.io.to('lobby').emit('server-status', serverstatus );
        // serverstatus.players = this.getPlayersJSON();
        this.io.to('admin').emit('server-status', serverstatus );
        
    }

    this.getPlayers = function () {
        return this.arrPlayers;
    }

    /**
     * Add a user to the game - sets up a Player object and adds them to arrPlayers
     */
    this.addUser = function (socket, user) {

        var self = this;

        // check to see if this username is already taken
        for (var i = 0; i<this.arrPlayers.length; i++) { 
            var tmpPlayer = this.arrPlayers[i];
            if (tmpPlayer.name == user.name) {
                return false;
            }
        }

                
        if (user.nane=='admin') { 
            var admin = new Admin();
            admin.init(socket);
            admin.setName(user.name);
            this.bindListeners(admin);
            this.bindAdminListeners(admin);

            socket.join('admins');
            return admin;
        } else { 

            var player = new Player();
            player.init(socket);
            player.setName(user.name);

            this.bindListeners(player);

            socket.join('players');
            player.disableButtons();

            this.arrPlayers.push(player);
            return player;
        }
    };

    /** 
     * bind all listen events for the socket
     */
    this.bindListeners = function(player) {
        
        var self = this;

        player.getSocket().on('joingame', function(data) {
            self.handleJoinGameRequest(player, data);
        });
        player.getSocket().on('pad.button', function (data) {
            self.handlePadData(player, data);
        });

    }

    this.removeUser = function(socket) { 

        // find the socket ID in the player array and remove the player
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

    /**
     * Resurrect a player object that has been stored in the session store.
     */
    this.reconnectPlayer = function (socket, json) {
        var result = this.addUser(socket, json.player);
        if (result) {
            // redirect them to a lobby page
            result.sendPage('lobby/index.html');
        }
        return result;
    };

    this.handleJoinGameRequest = function (player, data) {

        // add to playersInControl array , if not already in there
        var found = -1;
        for (var i=0;i < this.arrPlayersInControl.length; i++) {
            if (this.arrPlayersInControl[i].name == player.name) {
                found = i;
            }
        }

        if (found == -1) {
            this.arrPlayersInControl.push(player);
        }

        player.enableButtons();
        player.sendPage('game1/index.html');
    };

    this.handlePadData = function (player, data) {
        if (this.playerButtonsEnabled && player.buttonsEnabled) { 
            console.log(player.getSocket().id + " " + player.name + " Pad: %j", data.pad);
            if (data.pad.state!='click') {
                robot.keyToggle(data.pad.button, data.pad.state);
            } else {
                robot.keyTap(data.pad.button);
            }
        }
    };

};

module.exports = Manager;