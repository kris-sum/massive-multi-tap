"use strict";
var Player = require("./player.js");

class Admin extends Player {
    constructor(socket) {
        super(socket);
    }
}

module.exports = Admin;