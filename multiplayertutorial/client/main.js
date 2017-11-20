var socket; // define a global variable called socket
socket = io.connect(); // send a connection request to the server
console.log("send a connection request to the server");

//this is just configuring a screen size to fit the game properly
//to the browser
canvas_width = window.innerWidth * window.devicePixelRatio;
canvas_height = window.innerHeight * window.devicePixelRatio;

//make a phaser game
game = new Phaser.Game(canvas_width,canvas_height, Phaser.CANVAS,
 'gameDiv');

var enemies = [];
var player_created = false;


var gameProperties = {
	//this is the actual game size to determine the boundary of
	//the world
	gameWidth: 4000,
	gameHeight: 4000,
  game_elemnt: "gameDiv",
  in_game: false,
};


// this is the main game state
var main = function(game){
};

//call this function when the player connects to the server
function onsocketConnected(){
  console.log("onsocketConnected called");
  createPlayer();
  gameProperties.in_game = true;
  socket.emit('new_player', {x:50, y:50, angle:0});
}

function onRemovePlayer(data){
  var removePlayer = findplayerbyid(data.id);
  //Player not found
  if(!removePlayer){
    console.log('Player not found: ', data.id);
    return;
  }
  removePlayer.player.destroy();
  enemies.splice(enemies.indexOf(removePlayer), 1);

}

function createPlayer(){
  player = game.add.sprite(50,50,'lapras');
  game.physics.arcade.enable(player);
  player.body.collideWorldBounds = true;
  player.animations.add('left', [9, 10, 11], 10, true);
	player.animations.add('right', [3, 4, 5], 10, true);
	player.animations.add('up', [0, 1, 2], 10, true);
	player.animations.add('down', [6, 7, 8], 10, true);
}

var remote_player = function(id, startx, starty, startAngle){
  this.x = startx;
  this.y = starty;
  //this is the unique socket id. We use it as a unique name for each enemy
  this.id = id;
  this.angle = startAngle;
  this.player = game.add.sprite(this.x, this.y, 'lapras');
  this.player.animations.add('left', [9, 10, 11], 10, true);
	this.player.animations.add('right', [3, 4, 5], 10, true);
	this.player.animations.add('up', [0, 1, 2], 10, true);
	this.player.animations.add('down', [6, 7, 8], 10, true);
}

function onNewPlayer(data) {
  console.log("new enemy id: "+data.id);
  console.log("new enemy x: "+data.x);
  var new_enemy = new remote_player(data.id, data.x, data.y, data.angle);
  enemies.push(new_enemy);
}

function onEnemyMove(data) {
  //console.log(data.id);
  //console.log(enemies);
  console.log("id recebido: " + data.id);
  console.log("x recebido: " + data.x);
  var movePlayer = findplayerbyid(data.id);
  console.log("id moveplayer: " + movePlayer.id);
  if(!movePlayer){
    return;
  }
  movePlayer.player.x = data.x;
  movePlayer.player.y = data.y;
  console.log("after moving: "+ movePlayer.x);

}

function findplayerbyid(id){
  for(var i = 0; i < enemies.length; i++){
    if(enemies[i].id == id){
      return enemies[i];
    }
  }
}


// add the
main.prototype = {
	preload: function() {
    game.stage.disableVisibilityChange = true;
    game.load.spritesheet('lapras', 'client/assets/shiny.png', 40, 40);
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.world.setBounds(0, 0, gameProperties.gameWidth,
      gameProperties.gameHeight, false, false, false, false);
    game.physics.startSystem(Phaser.Physics.ARCADE);

  },
	//this function is fired once when we load the game
	create: function () {
    game.stage.backgroundColor = 0xE1A193;
		console.log("client started");
		//listen to the “connect” message from the server. The server
		//automatically emit a “connect” message when the cleint connets.When
		//the client connects, call onsocketConnected.

		socket.on("first_connection", onsocketConnected);
    //onsocketConnected();
    socket.on("new_enemyPlayer", onNewPlayer);

    socket.on("enemy_move", onEnemyMove);

    socket.on("remove_player", onRemovePlayer);


	},
  update: function() {
    if(!player_created){
      socket.emit('first_connection', {});
      player_created = true;
      console.log("first time");
    }

    if(gameProperties.in_game){
      var cursors = game.input.keyboard.createCursorKeys();
      if((cursors.left.isDown) || (cursors.right.isDown) || (cursors.up.isDown) || (cursors.down.isDown)) {
    		if(cursors.left.isDown) {
    			player.body.velocity.x = -150;
    			player.animations.play('left');
    		}

    		else if(cursors.right.isDown) {
    			player.body.velocity.x = 150;
    			player.animations.play('right');
    		}

    		else {
    			player.body.velocity.x = 0;
    		}

    		if(cursors.up.isDown) {
    			player.body.velocity.y = -150;
    			player.animations.play('up');
    		}

    		else if(cursors.down.isDown) {
    			player.body.velocity.y = 150;
    			player.animations.play('down');
    		}

    		else {
    			player.body.velocity.y = 0;
    		}
    	}

    	else {
    		player.body.velocity.x = 0;
    		player.body.velocity.y = 0;
    		player.animations.stop();
    	}
      socket.emit('move_player', {x: player.x, y: player.y, angle: player.angle});
    }

  }
}


// wrap the game states.
var gameBootstrapper = {
    init: function(gameContainerElementId){
		game.state.add('main', main);
		game.state.start('main');
    }
};;

//call the init function in the wrapper and specifiy the division id
gameBootstrapper.init("gameDiv");
