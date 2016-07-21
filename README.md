# Massively Multiiplayer Game Tap

*Author:* Kris Sum / @switchsystems
*License:* GPLv3

This is a node.js , socket.io and HTML5 implementation of a remote gaming controller, 
allowing you to play games using a mobile device as a controller.

A *Multi-tap* was a device which let more than 2 controllers plug into games consoles like the SNES and megadrive. 
Why *Massive*? Because this system lets you have an unlimited number of people in control!

## Demo and inspiration

Presented first at the Sundown 2016 demo party in July 2016, hacked together in 1 week:
https://www.youtube.com/watch?v=Ss6NWbH2cUA

Inspired by WifiWars http://wifiwars.co.uk/ , Jackbox Games and the 8 player nintendo project by Disney http://arstechnica.co.uk/gadgets/2015/12/8-players-8-projectors-8-bits-and-just-one-nintendo-entertainment-system/ 

## Technologies

* node.js for the server comms
* socket.io as the communication mechanism
* node/robotjs to send keyboard commands to an emulator of your choice

## Requirements

* Redis, for storing session data

## Caveats

node/robotjs doesn't seem to handle up/down state for regular letters very well, 
so I've ended up binding keypresses to VK_ (virtual key) entities such as VK_PAGEUP, VK_HOME etc. 
Arrow keys and space/enter work fine, but a-z don't seem to want to obey up/down.