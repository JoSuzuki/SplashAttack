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
serv.listen(process.env.PORT || 2000, "0.0.0.0");
console.log("Server started.");

var player_lst = [];

var Player = function(startX, startY, startAngle){
  this.x = startX
  this.y = startY
  this.angle = startAngle
}

function onNewPlayer(data) {
  var newPlayer = new Player(data.x, data.y, data.angle);
  console.log("Created new player with id " + this.id);
	newPlayer.id = this.id;
	console.log("newPlayer.id = " + newPlayer.id);

	var current_info = {
		id: newPlayer.id,
		x: newPlayer.x,
		y: newPlayer.y,
		angle: newPlayer.angle,
	};

	// send to the new player about everyone who is already connected
	for (i = 0; i < player_lst.length; i++){
		existingPlayer = player_lst[i];
		var player_info = {
			id: existingPlayer.id,
			x: existingPlayer.x,
			y: existingPlayer.y,
			angle: existingPlayer.angle,
		};
		console.log("pushing player with id "+existingPlayer.id);
		//send message to the sender-client only
		this.emit("new_enemyPlayer", player_info);
	}

	//send message to every connected client except the sender
	this.broadcast.emit('new_enemyPlayer', current_info);

	player_lst.push(newPlayer);
	//console.log("pushed newplayer, player_lst.length: "+player_lst.length);

}

function onMovePlayer(data){
	var movePlayer = find_playerid(this.id);
	//console.log("this id: " + this.id);
	//console.log("broadcast id: " + movePlayer.id)
	//console.log("broadcast de x: " + data.x);
	movePlayer.x = data.x;
	movePlayer.y = data.y;
	movePlayer.angle = data.angle;

	var moveplayerData = {
		id: movePlayer.id,
		x: movePlayer.x,
		y: movePlayer.y,
		angle: movePlayer.angle
	}
	//send message to every connected cliente except the sender
	this.broadcast.emit('enemy_move', moveplayerData);

}
//call when a client disconnects and tell the clients except sender to remove the disconnected player
function onClientdisconnect(){
	console.log('disconnect');

	var removePlayer = find_playerid(this.id);
	if (removePlayer) {
		player_lst.splice(player_lst.indexOf(removePlayer), 1);
	}

	console.log("removing player " + this.id);

	//send message to every connected client except the sender
	this.broadcast.emit('remove_player', {id:this.id});
}

function find_playerid(id) {
	//console.log("player_lst.lenght: "+ player_lst.length);
	//console.log("player_lst: "+player_lst);
	for (var i = 0; i < player_lst.length; i++){
		if (player_lst[i].id == id){
			return player_lst[i];
		}
	}
	return false;
}

 // binds the serv object we created to socket.io
var io = require('socket.io')(serv,{});

// listen for a connection request from any client
io.sockets.on('connection', function(socket){

	console.log("socket connected");
	socket.on("first_connection", function(){
		socket.emit('first_connection', {});
		console.log("server sent connect");
	});

	//listen for disconnection;
	socket.on('disconnect', onClientdisconnect);

	//listen for new player
	socket.on("move_player", onMovePlayer);

  socket.on("new_player", onNewPlayer);

});
