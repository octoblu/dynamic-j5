// Example based on Johnny-Five: https://github.com/rwaldron/johnny-five/wiki/Servo


var meshblu = require("meshblu");
var meshbluJSON = require("./meshblu.json");
var fs = require("fs");
var _ = require("underscore");
var five = require("johnny-five");
var board = new five.Board();

var names = [];
var component = {};
var functions = [];
var read = {};
var components;
var servo = [];
// Specifies how you want your message payload to be passed
// from Octoblu to your device

var MESSAGE_SCHEMA = {
  "type": "object",
  "properties": {
    "name": {
      "title": "Name",
      "type": "string",
      "enum": names
    },
    "value": {
      "title": "Value",
      "type": "number"
    }
  }
};

// connect
var OPTIONS_SCHEMA = {
  "type": "object",
  "title": "Component",
  "required": [
    "components"
  ],
  "properties": {
    "components": {
      "type": "array",
      "maxItems": 2,
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "title": "Name",
            "type": "string",
            "description": "Name this component anything you like. (i.e Left_Motor). Sensor output will show up under this name in payload"
          },
          "action": {
            "title": "Action",
            "type": "string",
            "enum": ["digitalWrite", "digitalRead", "analogWrite", "analogRead", "servo", "PCA9685-Servo"]
          },
          "pin": {
            "title": "Pin",
            "type": "string",
            "description": "The pin this function uses."
          }

        },
        "required": [
          "name",
          "pin",
          "action"
        ]
      }
    }
  }
};

var OPTIONS_FORM = [

  {
    "key": "components",
    "add": "New",
    "style": {
      "add": "btn-success"
    },
    "items": [
      "components[].name",
      "components[].action",
      "components[].pin"
    ]
  },
  {
    "type": "submit",
    "style": "btn-info",
    "title": "OK"
  }
];

var FORMSCHEMA = ["*"];

var conn = meshblu.createConnection({
  "uuid": meshbluJSON.uuid,
  "token": meshbluJSON.token,
  "server": meshbluJSON.server, // optional- defaults to ws://meshblu.octoblu.com
  "port": meshbluJSON.port  // optional- defaults to 80
});

conn.on("notReady", function(data) {
  console.log('UUID FAILED AUTHENTICATION!');
  console.log('not ready', data);

  // Register a device
  conn.register({
    "type": "dynamic-j5"
  }, function (data) {
    console.log('registered device', data);
    meshbluJSON.uuid = data.uuid;
    meshbluJSON.token = data.token;
    fs.writeFile('meshblu.json', JSON.stringify(meshbluJSON), function(err) {
      if(err) return;
    });

  // Login to SkyNet to fire onready event
  conn.authenticate({
    "uuid": data.uuid,
    "token": data.token
    }, function (data) {
      console.log('authenticating', data);
    });
  });
});

var testOptions = { "components": [
    {
      "name": "Left",
      "action": "digitalWrite",
      "pin": "13"
    },
    {
      "name": "pindata",
      "action": "analogRead",
      "pin": "3"
    },
    {
      "name": "Servo1",
      "action": "servo",
      "pin": "6"
    }
  ]};


// Wait for connection to be ready to send/receive messages
conn.on('ready', function(data) {
  console.log('ready event', data);
conn.update({
    "uuid": meshbluJSON.uuid,
    "token": meshbluJSON.token,
    "optionsSchema" : OPTIONS_SCHEMA,
    "optionsForm" : OPTIONS_FORM
  });

// Wait for the board to be ready for message passing
// board-specific code



  board.on('ready', function() {




conn.whoami({}, function(data) {
if(_.has(data.options,"components")){
    configBoard(data);
}else if(!(_.has(data.options,"components"))){
  conn.update({
      "uuid": meshbluJSON.uuid,
      "token": meshbluJSON.token,
      "options": testOptions
    });
    data.options = testOptions;
    configBoard(data);
}

  });


conn.on('config', function(data) {
if(_.has(data.options,"components")){
if(!(_.isEqual(data.options.components, components))){

  configBoard(data);

    }else {return;}

}
       }); //end on config


  // Handles incoming Octoblu messages
    conn.on('message', function(data) {

      console.log(data);
      handlePayload(data);

    }); // end Meshblu connection onMessage


var configBoard = function(data){

  component = [];
  servo = [];
  names = [];

if(_.has(data.options, "components")){
    components = data.options.components;
  }else{
    components = testOptions.components;
  }

components.forEach(function(payload) {
    console.log(payload);

    component[payload.name] = {"pin" : payload.pin, "action" : payload.action};

    switch(payload.action){
    case "digitalRead":
          console.log("digitalRead");
          board.pinMode(payload.pin, five.Pin.INPUT);
           board.digitalRead(payload.pin, function(value) {
              read[payload.name] = value;
              console.log(value);
              });

      break;
    case "digitalWrite":
      board.pinMode(payload.pin, board.MODES.OUTPUT);
      names.push(payload.name);
      break;
    case "analogRead":

         board.pinMode(payload.pin, five.Pin.ANALOG);
           board.analogRead(payload.pin, function(value) {
              read[payload.name] = value;
              });
      break;
    case "analogWrite":
          board.pinMode(payload.pin, five.Pin.PWM);
          names.push(payload.name);
      break;
    case "servo":
          servo[payload.name] = new five.Servo({
          pin: payload.pin,
          });
          names.push(payload.name);
      break;
    case "PCA9685-Servo":
        servo[payload.name] = new five.Servo({
          address: 0x40,
          controller: "PCA9685",
          pin: payload.pin,
          });
          names.push(payload.name);
      break;

  } //end switch case


}); // end for each

MESSAGE_SCHEMA = {
  "type": "object",
  "properties": {
    "name": {
      "title": "Name",
      "type": "string",
      "enum": names
    },
    "value": {
      "title": "Value",
      "type": "number"
    }
  }
}


conn.update({
    "uuid": meshbluJSON.uuid,
    "token": meshbluJSON.token,
    "messageSchema": MESSAGE_SCHEMA,
    "messageFormSchema": FORMSCHEMA,
    "optionsSchema" : OPTIONS_SCHEMA,
    "optionsForm" : OPTIONS_FORM
  });
} // end configBoard



var handlePayload = function(data){
  var payload = data.payload;
  var value = payload.value;
  if(!component[payload.name])
    return;

  switch(component[payload.name].action){
    case "digitalWrite":
          board.digitalWrite(component[payload.name].pin, value);
      break;
    case "analogWrite":
          board.analogWrite(component[payload.name].pin, value);
      break;
    case "servo":
          console.log('servo', servo);
          servo[payload.name].stop();
          servo[payload.name].to(value);
      break;
    case "PCA9685-Servo":
           servo[payload.name].stop();
           servo[payload.name].to(value);
      break;

  } //end switch case
}



 setInterval(function(){

  if(read){
  console.log(read);

   conn.message({
      "devices": "*",
      "payload": read
    });

  }


  },500);


  }); // end johnny-five board onReady
}); // end Meshblu connection onReady
