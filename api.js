// Server side js
var http = require('http');
var moment = require('moment');
var _ = require('underscore');
var exec = require('child_process').exec;
var express = require('express');
var gpio = require('onoff').Gpio,
led = new gpio(27, 'out'),
button = new gpio(3, 'in', 'both');

var app = express();

var inputs = [{ gpio: '3', value: null},
{ gpio: '27', value: null}];

// Read and store the GPIO inputs twice a second
setInterval(function() {
    led.read(function (err, value) {
        if (err) {
            throw err;
        }
        console.log('read gpio ' + inputs[0].gpio + ' value = ' + value);
        inputs[0].value = value.toString();
    });
    led.read(function(err, value) {
	if (err) {
	    throw err;
	}
	console.log('read gpio ' + inputs[1].gpio + ' value = ' + value);
	inputs[1].value = value.toString();
    });
}, 500); //setInterval

function checkTime(curMoment, setMoment) {
    while (curMoment.isBefore(setMoment)){
	curMoment = moment();
        console.log("still sleeping");
    }
    console.log("done sleeping!");
}

app.use(express['static'](__dirname ));

// Express route for incoming requests for a single input
app.get('/inputs/:id', function(req, res) {
    var i;

    console.log('received API request for port number ' + req.params.id);
    
    for (i in inputs) {
        if ((req.params.id === inputs[i].gpio)) {
            res.send(inputs[i]);
	    return;
        }
    } // end for

    console.log('invalid input port');
    res.status(403).send('dont recognise that input port number ' + req.params.id);
}); 

// Express route to light up LED on GPIO2
app.get('/light', function(req, res){
    console.log('light up LED on GPIO2');
    // executes that line in terminal
    var ledBlink = exec('sudo python3 led_blink.py');
    res.status(200).send('Lit up LED on GPIO2');
});

// Express route to light up LED on GPIO2 after a given time
app.get('/alarmlight', function(req, res){
    var queryMoment = moment(req.query.time, "YYYY-MM-DD HH:mm");
    checkTime(moment(), queryMoment);
    var ledBlink = exec('sudo python3  led_blink.py');
});

// Express route for incoming requests for a list of all inputs
app.get('/inputs', function(req, res) {
    console.log('All inputs');
    res.status(200).send(inputs);
}); 

// Express route for any other unrecognized requests
app.get('*', function(req, res) {
    res.status(404).send('Unrecognised API call');
});

// Express route to handle errors
app.use(function(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send('Oops, Something went wrong!');
  } else {
    next(err);
  }
});

process.on('SIGINT', function() {
    var i;
    
    console.log('\nShutting down from SIGINT (Ctrl + C)');
    console.log('Closing GPIO');
    gpio.unexport();
    process.exit();
});

app.listen(3000);
console.log('Server running on port 3000');