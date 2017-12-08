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
var beams_list = [];
var enemiesGroup;
var player_created = false;
var player;
var cursors;
var spacebar;
var s_key;
var beamGroup;
var start = false;

var floor;
var wall;
var horizontal = 30;
var vertical = 19;

var lim = 0;
var total;

var p1 = 0;

var tempo;
var timer;


var gameProperties = {
	//this is the actual game size to determine the boundary of
	//the world
	gameWidth: 1500,
	gameHeight: 950,
  game_elemnt: "gameDiv",
  in_game: false,
};

// this is the main game state
var main = function(game){
};

//class main_player
var main_player = function(data){
  this.id = data.id;
  this.tint = Math.random() * 0xffffff;
  console.log("main player id: " + data.id);
  this.direction = "up";
  this.sprite = game.add.sprite(1500*Math.random(),900*Math.random(),'lapras');
  game.physics.arcade.enable(this.sprite);
  this.sprite.body.collideWorldBounds = true;
  this.sprite.animations.add('left', [9, 10, 11], 10, true);
	this.sprite.animations.add('right', [3, 4, 5], 10, true);
	this.sprite.animations.add('up', [0, 1, 2], 10, true);
	this.sprite.animations.add('down', [6, 7, 8], 10, true);
  this.sprite.tint = this.tint;
}
//class remote_player
var remote_player = function(id, startx, starty, startDirection, tint){
  //this is the unique socket id. We use it as a unique name for each enemy
  this.id = id;
  this.tint = tint;
  this.direction = startDirection;
  this.player = enemiesGroup.create(startx, starty, 'lapras');
  this.player.animations.add('left', [9, 10, 11], 10, true);
	this.player.animations.add('right', [3, 4, 5], 10, true);
	this.player.animations.add('up', [0, 1, 2], 10, true);
	this.player.animations.add('down', [6, 7, 8], 10, true);
  this.player.tint = tint;
}
//class beams
var beams = function(owner_id){
  if(beams.count == undefined){
    beams.count = 1;
  }
  else{
    beams.count ++;
  }
  this.id = beams.count;
  this.owner_id = owner_id;
  this.sprite = beamGroup.getFirstExists(false);
}

//class enemy_beams
var enemy_beams = function(owner_id, beam_id, tint){
  this.id = beam_id;
  this.owner_id = owner_id;
  this.sprite = enemyBeamGroup.getFirstExists(false);
  this.sprite.tint = tint;
}

//call this function when the player connects to the server
function onsocketConnected(data){
  console.log("onsocketConnected called");
  player = new main_player(data);
  gameProperties.in_game = true;
  socket.emit('new_player', {x:50, y:50, direction:"up", tint: player.tint});
  spacebar.onDown.add(shoot, {x: 1});
  game.camera.follow(player.sprite);
}

function onRemovePlayer(data){
  var removePlayer = findplayerbyid(data.id);
  //Player not found
  if(!removePlayer){
    console.log('Player not found: ', data.id);
    return;
  }
  removePlayer.player.kill();
  enemies.splice(enemies.indexOf(removePlayer), 1);

}

function onNewPlayer(data) {
  console.log("new enemy id: "+data.id);
  console.log("new enemy x: "+data.x);
  var new_enemy = new remote_player(data.id, data.x, data.y, data.direction, data.tint);
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
    if(enemies[i].id === id){
      return enemies[i];
    }
  }
}

function findplayerbysprite(sprite){
  for(var i = 0; i <enemies.length; i++){
    if(enemies[i].player === sprite){
      return enemies[i];
    }
  }
}
function findindexplayerbysprite(sprite){
  for(var i = 0; i <enemies.length; i++){
    if(enemies[i].player === sprite){
      return i;
    }
  }
}

function findbeambysprite(sprite){
  console.log("Procurando por sprite:" )
  for(var i = 0; i <beams_list.length; i++){
    console.log("beam id:", beams_list[i].id);
    console.log("owner id:", beams_list[i].owner_id);
    if(beams_list[i].sprite == sprite){
      console.log("achou");
      return beams_list[i];
    }
  }
  return false;
}
function findindexbeambysprite(sprite){
  for(var i = 0; i <beams_list.length; i++){
    if(beams_list[i].sprite === sprite){
      return i;
    }
  }
}

function findbeambyid(owner_id, beam_id){
  for(var i = 0; i < beams_list.length; i++){
    if(beams_list[i].owner_id == owner_id && beams_list[i].id == beam_id){
      return beams_list[i];
    }
  }
}

function enemy_shoot(data){
  enemy_beam = new enemy_beams(data.owner_id, data.beam_id);
  console.log("Enemy beam id:", enemy_beam.id);
  console.log("Enemy owner id:", enemy_beam.owner_id);
  if (enemy_beam.sprite != null){
    enemy_beam.sprite.tint = data.tint
    enemy_beam.sprite.reset(data.x, data.y);
    enemy_beam.sprite.body.velocity.x = data.x_velocity;
    enemy_beam.sprite.body.velocity.y = data.y_velocity;
    beams_list.push(enemy_beam);
  }
}

function shoot(){
  //console.log(main_player);
  beam = new beams(player.id);
  console.log("shoot beam id:", beam.id);
  console.log("shoot owner id:", beam.owner_id);
  if (beam.sprite != null){
    beam.sprite.tint = player.tint;
    var x;
    var y;
    var x_velocity;
    var y_velocity;
    if (player.direction == "up"){
      x = player.sprite.x + 15;
      y = player.sprite.y;
      x_velocity = 0;
      y_velocity = -350
      beam.sprite.reset(x, y);
      beam.sprite.body.velocity.y = y_velocity;
    } else if (player.direction == "down"){
      x = player.sprite.x + 10;
      y = player.sprite.y + 30;
      x_velocity = 0;
      y_velocity = 350
      beam.sprite.reset(x, y);
      beam.sprite.body.velocity.y = y_velocity;
    } else if (player.direction == "left"){
      x = player.sprite.x;
      y = player.sprite.y + 10;
      x_velocity = -350;
      y_velocity = 0;
      beam.sprite.reset(x, y);
      beam.sprite.body.velocity.x = -350;
    } else {
      x = player.sprite.x + 30;
      y = player.sprite.y + 10;
      x_velocity = 350;
      y_velocity = 0;
      beam.sprite.reset(x, y);
      beam.sprite.body.velocity.x = 350;
    }
    beams_list.push(beam);
    socket.emit('shoot', {x: x, y: y, x_velocity: x_velocity, y_velocity: y_velocity, owner_id: player.id, beam_id: beam.id, tint: player.tint});
  }
}

function kill(enemy, beam){
  beam_object = findbeambysprite(beam);
  socket.emit('enemy_killed', {enemyId: findplayerbysprite(enemy).id});
  socket.emit('beam_removed', {beam_id: beam_object.id, owner_id: beam_object.owner_id})
  //enemy.kill();
  beams_list.splice(findindexbeambysprite(beam),1);
  //enemiesGroup.remove(enemy, true);
  beam.kill();
}

function enemy_kill(data){
  if (data.enemyId === player.id){
    player.sprite.reset(1500*Math.random(),900*Math.random());
    } else {
    //findplayerbyid(data.enemyId).player.kill();
    }
}

function beam_removal(data){
  console.log("beam removal beam id:", data.beam_id);
  console.log("beam removal owner id:", data.owner_id);
  findbeambyid(data.owner_id, data.beam_id).sprite.kill();
  beams_list.splice(findindexbeambysprite(findbeambyid(data.owner_id, data.beam_id).sprite),1);

}

function borderline(wall) {
	for (var i = 0; i < horizontal; i++) {		// bordas superior e inferior
		var block = wall.create(i*50, 0, 'wall');
		block.body.immovable = true;
		block = wall.create(i*50, game.world.height-50, 'wall');
		block.body.immovable = true;
	}
	for (var i = 1; i < vertical-1; i++) {		//bordas esquerda e direita
		var block = wall.create(0, i*50, 'wall');
		block.body.immovable = true;
		block = wall.create(game.world.width-50, i*50, 'wall');
		block.body.immovable = true;
	}
	for (var i = 0; i < 13; i++) {				// grandes barras verticas
		var block = wall.create(200, 150+i*50, 'wall');
		block.body.immovable = true;
		block = wall.create(game.world.width-250, 150+i*50, 'wall');
		block.body.immovable = true;
	}
	for (var i = 0; i < 3; i++) {				// quadrados 3x3
		for (var j = 0; j < 3; j++) {
			var block = wall.create(400+50*i, 250+j*50, 'wall');
			block.body.immovable = true;
			block = wall.create(game.world.width-550+50*i, 250+j*50, 'wall');
			block.body.immovable = true;
			block = wall.create(400+50*i, 550+j*50, 'wall');
			block.body.immovable = true;
			block = wall.create(game.world.width-550+50*i, 550+j*50, 'wall');
			block.body.immovable = true;
		}
	}
	for (var i = 0; i < 7; i++) {				// grandes barras verticas
		var block = wall.create(650, 300+i*50, 'wall');
		block.body.immovable = true;
		block = wall.create(game.world.width-700, 300+i*50, 'wall');
		block.body.immovable = true;
		if(i == 3) {
			block = wall.create(700, 300+i*50, 'wall');
			block.body.immovable = true;
			block = wall.create(750, 300+i*50, 'wall');
			block.body.immovable = true;
		}
	}
}


function Paint(floor, beam) {
  if(timer.running){
    floor.tint = beam.tint;
  }

}

function formatTime(s) {
	var minutes = "0" + Math.floor(s / 60);
    var seconds = "0" + (s - minutes * 60);
    return minutes.substr(-2) + ":" + seconds.substr(-2);
}

function DeadEnd(wall, beam) {
  beam_object = findbeambysprite(beam);
  if (beam_object != false){
    console.log("id do tiro que bateu na parede", beam_object.id);
    socket.emit('beam_removed', {beam_id: beam_object.id, owner_id: beam_object.owner_id})
    beams_list.splice(findindexbeambysprite(beam), 1);
    beam.kill();
    console.log("tiro deletado", beams_list);
  }
}

function end() {
	timer.stop();
}


function score(floor) {
	if(floor.tint == player.tint) {
		p1 += 1;
	}
}

function updateScore(floor) {
	p1 = 0;
	floor.forEach(score, this, true);
}

function start_game(){
  start = true;
  timer.start();
}

function emitStartGame(){
  socket.emit('start_game', {});
}

// add the
main.prototype = {
	preload: function() {
    game.stage.disableVisibilityChange = true;
    game.load.image('beam', 'client/assets/shoot.png');
    game.load.image('floor', 'client/assets/floor.png');
    game.load.image('wall', 'client/assets/wall.png');
    game.load.spritesheet('lapras', 'client/assets/lapras.png', 40, 40);
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.world.setBounds(0, 0, gameProperties.gameWidth,
      gameProperties.gameHeight, false, false, false, false);
    game.physics.startSystem(Phaser.Physics.ARCADE);

  },
	//this function is fired once when we load the game
	create: function () {

    floor = game.add.group();
    floor.enableBody = true;
    floor.physicsBodyType = Phaser.Physics.ARCADE;
    floor.createMultiple(570, 'floor', [0], true);
    floor.align(30,19,50,50);

    wall = game.add.group();
    wall.enableBody = true;
    wall.physicsBodyType = Phaser.Physics.ARCADE;

    borderline(wall);

    cursors = game.input.keyboard.createCursorKeys();
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    s_key = game.input.keyboard.addKey(Phaser.Keyboard.S);
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

    enemiesGroup = game.add.group();
    enemiesGroup.enableBody = true;
    enemiesGroup.physicsBodyType = Phaser.Physics.ARCADE;


    timer = game.time.create(false);

    tempo = timer.add(Phaser.Timer.MINUTE * 3 + Phaser.Timer.SECOND * 00, end, this);



    //  Set a TimerEvent to occur after 30 seconds
    timer.loop(500, updateScore, this, floor);

    //  Start the timer running - this is important!
    //  It won't start automatically, allowing you to hook it to button events and the like.



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

    socket.on("enemy_kill", enemy_kill);

    socket.on("beam_removal", beam_removal);

    socket.on("start_game", start_game);

	},
  update: function() {
    if(!player_created){
      socket.emit('first_connection', {});
      player_created = true;
      console.log("first time");
    }

    if(gameProperties.in_game){

      game.physics.arcade.collide(player.sprite, wall);
      game.physics.arcade.overlap(enemiesGroup, beamGroup, kill);
      game.physics.arcade.overlap(floor, beamGroup, Paint);
      game.physics.arcade.overlap(floor, enemyBeamGroup, Paint);
      game.physics.arcade.overlap(wall, beamGroup, DeadEnd);
      game.physics.arcade.overlap(wall, beamGroup, Paint);


      if(start == false){
        if(s_key.isDown){
          emitStartGame();
        }
      } else {



        if((cursors.left.isDown) || (cursors.right.isDown) || (cursors.up.isDown) || (cursors.down.isDown)) {
      		if(cursors.left.isDown) {
      			player.sprite.body.velocity.x = -230;
            player.direction = "left";
      			player.sprite.animations.play('left');
      		}

      		else if(cursors.right.isDown) {
      			player.sprite.body.velocity.x = 230;
            player.direction = "right";
      			player.sprite.animations.play('right');
      		}

      		else {
      			player.sprite.body.velocity.x = 0;
      		}

      		if(cursors.up.isDown) {
      			player.sprite.body.velocity.y = -230;
            player.direction = "up";
      			player.sprite.animations.play('up');
      		}

      		else if(cursors.down.isDown) {
      			player.sprite.body.velocity.y = 230;
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

        socket.emit('move_player', {x: player.sprite.x, y: player.sprite.y, direction: player.direction});
      }
    }

  },
  render: function() {
    total = floor.total;
  	var percentage = p1/total*100;
    if(timer.running) {
  		//game.debug.text('Time until event: ' + timer.duration.toFixed(0), 32, 32, 'rgb(255,255,255)');
  		game.debug.text(formatTime(Math.round((tempo.delay - timer.ms) / 1000)), 2, 14, 'rgb(255,255,255)');
  	}
  	else {
  		game.debug.text('FINALE! Press S to Start', 2, 14, 'rgb(255,255,255)');
  	}

  	game.debug.text('Percentage filled: '+percentage+'%', 2, 28, 'rgb(255,255,255)');
  	//game.debug.text('Num de chão: '+ (floor.total-wall.total), 32, 32, 'rgb(255,255,255)');

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
