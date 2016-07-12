"use strict";
var robot = require("robotjs");
var Player = require("./player.js");
var Admin = require("./admin.js");

class Manager {
    
    constructor(io) {
        
        this.io = io;

        this.playerButtonsEnabled = true;
        this.arrPlayers = [];
        this.arrPlayersInControl = [];

        var self=this;
        setInterval(function() { self._sendStatus(); } , 1000);
        
    }

    _sendStatus() {

        var serverstatus = { 
            'sockets': this.io.engine.clientsCount, 
            'players' : this.getPlayers().length,
            'time' : new Date().toJSON() 
        };

        this.io.to('lobby').emit('server-status', serverstatus );
        // serverstatus.players = this.getPlayersJSON();
        this.io.to('admins').emit('server-status', serverstatus );
        
    }

    getPlayers() {
        return this.arrPlayers;
    }

    /**
     * Add a user to the game - sets up a Player object and adds them to arrPlayers
     */
    addUser(socket, user) {

        var self = this;

        // check to see if this username is already taken
        for (var i = 0; i<this.arrPlayers.length; i++) { 
            var tmpPlayer = this.arrPlayers[i];
            if (tmpPlayer.name == user.name) {
                return false;
            }
        }

        if (user.name=='admin') { 
            var admin = new Admin(socket);
            admin.setName(user.name);
            this._bindListeners(admin);

            socket.leave('lobby');
            socket.join('admins');
            
            // redirect them to a lobby page
            admin.sendPage('admin/index.html');

            return admin;
        } else { 

            var player = new Player(socket);
            player.setName(user.name);

            this._bindListeners(player);

            socket.join('players');
            player.disableButtons();

            this.arrPlayers.push(player);

            // redirect them to a lobby page
            player.sendPage('lobby/index.html');

            // inform admins
            this.io.to('admins').emit('player-joined', player.getJSON());

            return player;
        }
    };

    /** 
     * bind all listen events for the socket
     */
    _bindListeners(player) {
        
        var self = this;

        player.getSocket().on('joingame', function(data) {
            self.handleJoinGameRequest(player, data);
        });
        player.getSocket().on('pad.button', function (data) {
            self.handlePadData(player, data);
        });

        if (player instanceof Admin) {

            player.getSocket().on('get-player-list', function() {
                self.getPlayerList(player);
            });

            player.getSocket().on('player-enable-pad', function(data, fn) {
                var player = self._getPlayerBySocketId(data.socketid);
                if (!player) {
                    console.log('Unable to find player ' + data.socketid);
                    fn(false);
                    return;
                } 
                player.enableButtons();
                fn(true);
            });

            player.getSocket().on('player-disable-pad', function(data, fn) {
                var player = self._getPlayerBySocketId(data.socketid);
                if (!player) {
                    console.log('Unable to find player ' + data.socketid);
                    fn(false);
                    return;
                } 
                player.disableButtons();
                fn(true);
            });            
        }

    }

    _getPlayerBySocketId(socketid) {
        var found = -1;
        for (var i = 0; i<this.arrPlayers.length; i++) { 
            var tmpPlayer = this.arrPlayers[i];
            if (tmpPlayer.getSocket().id == socketid) {
                found = i;
            }
        }
        if (found == -1) { return false; } else  { return this.arrPlayers[found]; } 
    }

    removeUser(socket) { 

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
            // inform admins
            this.io.to('admins').emit('player-left', player.getJSON());
        }


        socket.emit('disconnected');

    };

    /**
     * Resurrect a player object that has been stored in the session store.
     */
    reconnectPlayer(socket, json) {
        var result = this.addUser(socket, json.player);

        return result;
    };

    handleJoinGameRequest(player, data) {

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
        player.sendPage('game1/' + data.game + '.html');
    };

    handlePadData(player, data) {
        if (this.playerButtonsEnabled && player.buttonsEnabled) { 
            console.log(player.getSocket().id + " " + player.name + " Pad: %j", data.pad);
            if (data.pad.state!='click') {
                robot.keyToggle(data.pad.button, data.pad.state);
            } else {
                robot.keyTap(data.pad.button);
            }
        }
    };

    getPlayerList(player) {
        var players = [];
        for (var i=0;i<this.arrPlayers.length;i++) { 
            players.push(this.arrPlayers[i].getJSON());
        }
        player.getSocket().emit('player-list',{ 'players': players});
    }

};

module.exports = Manager;