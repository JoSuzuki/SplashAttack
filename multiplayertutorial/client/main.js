//this is the client side js
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

//variaveis iniciais
var enemies = [];
var player_created = false;
var player;
var beam;
var cursors;
var spacebar;
var beamGroup;



var gameProperties = {
	//this is the actual game size to determine the boundary of
	//the world
	gameWidth: 1000,
	gameHeight: 1000,
  game_elemnt: "gameDiv",
  in_game: false,
};

// this is the main game state
var main = function(game){
};

//class remote_player
var remote_player = function(id, startx, starty, startDirection){
  //this is the unique socket id. We use it as a unique name for each enemy
  this.id = id;
  this.direction = startDirection;
  this.player = game.add.sprite(startx, starty, 'lapras');
  this.player.animations.add('left', [9, 10, 11], 10, true);
	this.player.animations.add('right', [3, 4, 5], 10, true);
	this.player.animations.add('up', [0, 1, 2], 10, true);
	this.player.animations.add('down', [6, 7, 8], 10, true);
}

//call this function when the player connects to the server
function onsocketConnected(){
  console.log("onsocketConnected called");
  player = new main_player();
  gameProperties.in_game = true;
  socket.emit('new_player', {x:50, y:50, direction:"up"});
  spacebar.onDown.add(shoot, {x: 1});
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

var main_player = function(){
  this.direction = "up";
  this.sprite = game.add.sprite(50,50,'lapras');
  game.physics.arcade.enable(this.sprite);
  this.sprite.body.collideWorldBounds = true;
  this.sprite.animations.add('left', [9, 10, 11], 10, true);
	this.sprite.animations.add('right', [3, 4, 5], 10, true);
	this.sprite.animations.add('up', [0, 1, 2], 10, true);
	this.sprite.animations.add('down', [6, 7, 8], 10, true);
}

function onNewPlayer(data) {
  console.log("new enemy id: "+data.id);
  console.log("new enemy x: "+data.x);
  var new_enemy = new remote_player(data.id, data.x, data.y, data.direction);
  enemies.push(new_enemy);
}

function onEnemyMove(data) {
  var movePlayer = findplayerbyid(data.id);
  if(!movePlayer){
    return;
  }
  if (data.x == movePlayer.player.x && data.y == movePlayer.player.y){
    movePlayer.player.animations.stop();
  } else if (data.direction == "up") {
    movePlayer.player.animations.play('up');
  } else if (data.direction == "down"){
    movePlayer.player.animations.play('down');
  } else if (data.direction == "right"){
    movePlayer.player.animations.play('right');
  } else if (data.direction == "left"){
    movePlayer.player.animations.play('left');
  }
  movePlayer.player.x = data.x;
  movePlayer.player.y = data.y;
}

function findplayerbyid(id){
  for(var i = 0; i < enemies.length; i++){
    if(enemies[i].id == id){
      return enemies[i];
    }
  }
}

function enemy_shoot(data){
  enemy_beam = enemyBeamGroup.getFirstExists(false);
  if (enemy_beam != null){
    enemy_beam.reset(data.x, data.y);
    enemy_beam.body.velocity.x = data.x_velocity;
    enemy_beam.body.velocity.y = data.y_velocity;
  }
}

function shoot(){
  //console.log(main_player);
  beam = beamGroup.getFirstExists(false); // returns the first nonexistant element, returns null otherwise
  if (beam != null){
    var x;
    var y;
    var x_velocity;
    var y_velocity;
    if (player.direction == "up"){
      x = player.sprite.x + 15;
      y = player.sprite.y;
      x_velocity = 0;
      y_velocity = -250
      beam.reset(x, y);
      beam.body.velocity.y = y_velocity;
    } else if (player.direction == "down"){
      x = player.sprite.x + 10;
      y = player.sprite.y + 30;
      x_velocity = 0;
      y_velocity = 250
      beam.reset(x, y);
      beam.body.velocity.y = y_velocity;
    } else if (player.direction == "left"){
      x = player.sprite.x;
      y = player.sprite.y + 10;
      x_velocity = -250;
      y_velocity = 0;
      beam.reset(x, y);
      beam.body.velocity.x = -250;
    } else {
      x = player.sprite.x + 30;
      y = player.sprite.y + 10;
      x_velocity = 250;
      y_velocity = 0;
      beam.reset(x, y);
      beam.body.velocity.x = 250;
    }
    socket.emit('shoot', {x: x, y: y, x_velocity: x_velocity, y_velocity: y_velocity});
  }
}

function kill(enemy, shoot){
  enemy.kill();
  shoot.kill();

}

// add the
main.prototype = {
	preload: function() {
    game.stage.disableVisibilityChange = true;
    game.load.image('beam', 'client/assets/beam.png');
    game.load.spritesheet('lapras', 'client/assets/lapras.png', 40, 40);
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.world.setBounds(0, 0, gameProperties.gameWidth,
      gameProperties.gameHeight, false, false, false, false);
    game.physics.startSystem(Phaser.Physics.ARCADE);

  },
	//this function is fired once when we load the game
	create: function () {
    cursors = game.input.keyboard.createCursorKeys();
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    beamGroup = game.add.group();
    beamGroup.enableBody = true;
    beamGroup.physicsBodyType = Phaser.Physics.ARCADE;
    beamGroup.createMultiple(5, 'beam');
    beamGroup.setAll('outOfBoundsKill', true);
    beamGroup.setAll('checkWorldBounds', true);
    enemyBeamGroup = game.add.group();
    enemyBeamGroup.enableBody = true;
    enemyBeamGroup.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBeamGroup.createMultiple(50, 'beam');
    enemyBeamGroup.setAll('outOfBoundsKill', true);
    enemyBeamGroup.setAll('checkWorldBounds', true);



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

    socket.on("enemy_shoot", enemy_shoot);


	},
  update: function() {
    if(!player_created){
      socket.emit('first_connection', {});
      player_created = true;
      console.log("first time");
    }

    if(gameProperties.in_game){
      if((cursors.left.isDown) || (cursors.right.isDown) || (cursors.up.isDown) || (cursors.down.isDown)) {
    		if(cursors.left.isDown) {
    			player.sprite.body.velocity.x = -150;
          player.direction = "left";
    			player.sprite.animations.play('left');
    		}

    		else if(cursors.right.isDown) {
    			player.sprite.body.velocity.x = 150;
          player.direction = "right";
    			player.sprite.animations.play('right');
    		}

    		else {
    			player.sprite.body.velocity.x = 0;
    		}

    		if(cursors.up.isDown) {
    			player.sprite.body.velocity.y = -150;
          player.direction = "up";
    			player.sprite.animations.play('up');
    		}

    		else if(cursors.down.isDown) {
    			player.sprite.body.velocity.y = 150;
          player.direction = "down";
    			player.sprite.animations.play('down');
    		}

    		else {
    			player.sprite.body.velocity.y = 0;
    		}
    	}

    	else {
    		player.sprite.body.velocity.x = 0;
    		player.sprite.body.velocity.y = 0;
    		player.sprite.animations.stop();
    	}
      /*if(spacebar.onDown){
        console.log(spacebar.onDown);
        shoot();
      }*/
      //game.physics.arcade.overlap(enemies[0].player, beamGroup, kill, null, this);
      socket.emit('move_player', {x: player.sprite.x, y: player.sprite.y, direction: player.direction});
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
