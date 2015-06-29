//var raspi = require("raspi-io");
var five = require("johnny-five");
var board = new five.Board();

/*
 var board = new five.Board({
    io: new raspi()
  });
*/


var payload4 = {
        "function" : "digitalWrite",
        "pin" : "13",
        "value" : 1
        };

var payload2 = {
        "function" : "servoTo",
        "pin" : "6",
        "value" : 60
        };

var payload3 = {
        "function" : "servoSweep",
        "pin" : "6",
        "min" : 0,
        "max" : 180,
        "interval" : 100,
        "step" : 10
        };

var payload = {
        "function" : "digitalRead",
        "pin" : "5",
        "name" : "motion"
        };

var pin = [];
var read = {};
board.on("ready", function() {
  // Assuming a button is attached to pin 9

//handlepayload(payload4);

//var handlepayload = function(payload) {

 
  var currentPin = parseInt(payload.pin);
  var state;

  //Check if the pin has be initialized
  //and what the current Pin Mode is

  if(pin[currentPin]){
   this.pin(currentPin).query(function(current) {
        console.log(current);
        state = current.mode;

      });
}else{

  pin[currentPin] = new five.Pin(currentPin);

   this.pin(currentPin).query(function(current) {
        console.log(current);
        state = current.mode;

      });
}

 //Perform the requested function
 // If the mode isn't current for that function
 // then set the pin mode, else run the function
 // with the pin specified.

 //For analogRead and digitalRead
 //the value read is assigned to read.[name specified by user]
 //the entire "read" object is transmitted at an interval

  switch(payload.function){
    case "digitalRead":

        if(state != 0){ 
          this.pinMode(currentPin, five.Pin.INPUT);
           this.digitalRead(currentPin, function(value) {
              read[payload.name] = value;
              });

          }else if(state = 0){
            this.digitalRead(currentPin, function(value) {
              read[payload.name] = value;
              });
          }
        
      break;
    case "digitalWrite":

        if(state != 1){ 
          this.pinMode(currentPin, five.Pin.OUTPUT);
          this.digitalWrite(currentPin, payload.value);
          }else if(state = 1){
            this.digitalWrite(currentPin, payload.value);
          }
        
      break;
    case "analogRead":

        if(state != 2){ 
          this.pinMode(currentPin, five.Pin.ANALOG);
           this.analogRead(currentPin, function(value) {
              read[payload.name] = value;
              });

          }else if(state = 2){
            this.analogRead(currentPin, function(value) {
              read[payload.name] = value;
              });
          }
        
      break;
    case "analogWrite":

        if(state != 3){ 
          this.pinMode(currentPin, five.Pin.PWM);
          this.analogWrite(currentPin, payload.value);
          }else if(state = 3){
            this.analogWrite(currentPin, payload.value);
          }
        
      break;
    case "servoTo":

        if(state != 4){ 
          this.pinMode(currentPin, five.Pin.SERVO);
          this.servoWrite(currentPin, payload.value);
          }else if(state = 4){
            this.servoWrite(currentPin, payload.value);
          }
       
      break;

  }

// }

setInterval(function(){

  if(read){
  console.log(read);
  }
/*    conn.message({
      "devices": "*",
      "payload": { 
        read
      }
    });

*/

  },500);
  
});
