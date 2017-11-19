//import express.js
var express = require('express');
//assign it to variable app
var app = express();
//create a server and pass in app as a request handler
var serv = require('http').Server(app); //Server-11

//send a index.html file when a get request is fired to the given
//route, which is ‘/’ in this case
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
//this means when a get request is made to ‘/client’, put all the
//static files inside the client folder
// Under ‘/client’. See for more details below

app.use('/client',express.static(__dirname + '/client'));

//listen on port 2000
serv.listen(process.env.PORT || 2000);
console.log("Server started.");

var player_lst = [];

var Player = function(startX, startY, startAngle){
  var x = startX
  var y = startY
  var angle = startAngle
}

function onNewPlayer(data) {
  var newPlayer = new Player(data.x,data.y,data.angle);
  console.log("Created new player with id " + this.id);
  player_lst.push(newPlayer);

}

 // binds the serv object we created to socket.io
var io = require('socket.io')(serv,{});

// listen for a connection request from any client
io.sockets.on('connection', function(socket){
	console.log("socket connected");

  socket.on("new_player", onNewPlayer);
	//output a unique socket.id
	console.log(socket.id);
});
