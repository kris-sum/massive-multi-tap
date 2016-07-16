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
        this.arrPlayersUpNext = [];
        this.arrPlayersPlayed = [];                     // players who have played get put in this pool

        this.cycleGame = 'game1/nes1';                // game file to cycle into play
        this.cycleTime = 30;
        this.cycleTimeLeft = 30;
        this.autoCycleEnabled = false;
        
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
                self.sendPlayerList(player);
                // potentially not good due to async - may need to refactor this
                for (var i = 0; i<self.arrPlayersInControl.length; i++) {
                    self.io.to('admins').to('dashboard').emit('player-activated', self.arrPlayersInControl[i].getJSON());
                } 
                
            });

            player.getSocket().on('player-enable-pad', function(data) {
                var player = self._getPlayerBySocketId(data.socketid);
                if (!player) {
                    console.log('Unable to find player ' + data.socketid);
                    return;
                } 
                player.enableButtons();
                self.io.to('admins').to('dashboard').emit('player-activated', player.getJSON());
                self.arrPlayersInControl.push(player);
            });

            player.getSocket().on('player-disable-pad', function(data) {
                var player = self._getPlayerBySocketId(data.socketid);
                if (!player) {
                    console.log('Unable to find player ' + data.socketid);
                    return;
                } 
                player.disableButtons();
                self.io.to('admins').to('dashboard').emit('player-deactivated', player.getJSON());

                var found=-1;
                for (var i = 0; i<self.arrPlayersInControl.length; i++) {
                    if (self.arrPlayersInControl[i].socketid == player.socketid) 
                    found=i;
                }
                if (found>-1) {
                    self.arrPlayersInControl.splice(found,1);
                }

            });            

            player.getSocket().on('admin-loadpage', function(data) {
               player.sendPage(data.page);
            });

            player.getSocket().on('cycle-start', function(data) {
                self.cycleGame = data.game;
                self.startCycle();
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

    sendPlayerList(player) {
        var players = [];
        for (var i=0;i<this.arrPlayers.length;i++) { 
            players.push(this.arrPlayers[i].getJSON());
        }
        for (var i=0;i<this.arrPlayersPlayed.length;i++) { 
            players.push(this.arrPlayersPlayed[i].getJSON());
        }
        player.getSocket().emit('player-list',{ 'players': players});
        var players = [];
        for (var i=0;i<this.arrPlayersInControl.length;i++) { 
            players.push(this.arrPlayersInControl[i].getJSON());
        }
        player.getSocket().emit('active-player-list',{ 'players': players});
        var players = [];
        for (var i=0;i<this.arrPlayersUpNext.length;i++) { 
            players.push(this.arrPlayersUpNext[i].getJSON());
        }
        player.getSocket().emit('next-player-list',{ 'players': players});
    }

    startCycle() {

        if (this.autoCycleEnabled == true) return;

        var self = this;
        
        this.cycleTimeLeft = this.cycleTime;
        this.autoCycleEnabled = true;

        // reset all players to general pool
        while (this.arrPlayersInControl.length>0) {
            this.arrPlayers.push( this.arrPlayersInControl.pop() );
        }
        while (this.arrPlayersUpNext.length>0) {
            this.arrPlayers.push( this.arrPlayersUpNext.pop() );
        }

        // pick two at random to play now
        if (this.arrPlayers.length>0) {
            var player = this.arrPlayers.splice(Math.floor(Math.random() * this.arrPlayers.length ),1)[0];
            player.sendPage(this.cycleGame+'_p1.html');
            player.enableButtons();
            this.arrPlayersInControl.push(player);
            this.io.to('admins').to('dashboard').emit('player-activated', player.getJSON());
        }

        if (this.arrPlayers.length>0) {
            var player = this.arrPlayers.splice(Math.floor(Math.random() * this.arrPlayers.length ),1)[0];
            player.sendPage(this.cycleGame+'_p2.html');
            player.enableButtons();
            this.arrPlayersInControl.push(player);
            this.io.to('admins').to('dashboard').emit('player-activated', player.getJSON());
        }
        // pick two to add to the next pool
        if (this.arrPlayers.length>0) {
            var player = this.arrPlayers.splice(Math.floor(Math.random() * this.arrPlayers.length ),1)[0];
            this.arrPlayersUpNext.push(player);
        }
        if (this.arrPlayers.length>0) {
            var player = this.arrPlayers.splice(Math.floor(Math.random() * this.arrPlayers.length ),1)[0];
            this.arrPlayersUpNext.push(player);
        }
        
        // start timer
        setTimeout(function() { self.updateCycleTimer(); } , 1000);
    }

    updateCycleTimer() {
        this.cycleTimeLeft--;
        var self = this;
        console.log(this.cycleTimeLeft);
        if (this.cycleTimeLeft<0) {
            this.advanceCycle();
        } else { 
            this.io.to('admins').to('dashboard').emit('update-dashboard', {'cycleTimeLeft': this.cycleTimeLeft } );
            setTimeout(function() { self.updateCycleTimer(); } , 1000);
        }

       
    }

    advanceCycle() {

        // move currrent active to the 'played' pool
        while (this.arrPlayersInControl.length>0) {
            var player =  this.arrPlayersInControl.pop();
            this.arrPlayersPlayed.push(player);
            this.io.to('admins').to('dashboard').emit('player-deactivated', player.getJSON());
            player.sendPage('lobby/index.html');
        }

        while (this.arrPlayersUpNext.length>0) {
            var player =  this.arrPlayersUpNext.pop();
            player.sendPage(this.cycleGame+'_p1.html');
            player.enableButtons();
            this.arrPlayersInControl.push(player);
            this.io.to('admins').to('dashboard').emit('player-activated', player.getJSON());
        }

        // pick two more


        this.cycleTimeLeft = this.cycleTime;

    }

};

module.exports = Manager;