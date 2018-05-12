const keepRunning = require("keep-running");
const led = require("sense-hat-led");
const joystick = require("sense-joystick");
const _ = require("lodash");
const fs = require("fs");

var X = [255, 0, 0]; // Red
var O = [0, 0, 0]; // Black
var V = [0, 120, 120]; // Vaderer

var ITERATING = true;
var PIXEL_WIDTH = 8;

const workingFile = "/tmp/working";

led.clear(0);

// List of valid moves in 2D
var directions = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1]
];

// Calculate a move and check if it's valid
var move = (location, dir) => {
  var newlocation = [0, 0];
  for (var i = 0; i < 2; i++) {
    newlocation[i] = location[i] + dir[i];
    if (newlocation[i] < 0 || newlocation[i] >= PIXEL_WIDTH) {
      return null;
    }
  }
  return newlocation;
};

// Display the vanderer on the LED
var display = async (location, colour) => {
  await led.setPixel(location[0], location[1], colour);
};

// Run one round of moves
var newMove = location => {
  display(location, 0);
  var newlocation = null;
  do {
    // create new moves until there's a legal one, not falling off the display
    var movedirection = _.random(directions.length - 1);
    newlocation = move(location, directions[movedirection]);
  } while (newlocation === null);
  if (ITERATING) {
    // If things are okay, display changes, and schedule the next move
    display(newlocation, V);
    setTimeout(() => newMove(newlocation), 100);
  } else {
    // If things are broken, show that
    display(newlocation, X);
    console.log("Borked it...");
  }
};

// Listen for joystick events, and break things when recevied one
joystick.getJoystick().then(j => {
  j.on("press", direction => {
    ITERATING = false;
    fs.unlinkSync(workingFile);
  });
});

// Set up healthcheck file
fs.closeSync(fs.openSync(workingFile, "w"));

// Start the moves
const startingLocation = [_.random(7), _.random(7)];
display(startingLocation, V);
newMove(startingLocation);

keepRunning.init()(() => console.log("Let's get moving..."));
