var game = new Phaser.Game(600, 400, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render});

var floor;

var wall;
var horizontal = 30;
var vertical = 19;

var player;
var cursors;

var municao;
var bullet;
var lim = 0;
var shoot;

var total;
var p1 = 0;

var tempo;
var timer;

function preload() {
	game.load.image('shot', 'pics/shot.png');
	game.load.spritesheet('lapras', 'pics/shiny.png', 40, 40);
	game.load.image('floor', 'pics/floor.png');
    game.load.image('wall', 'pics/wall.png');
}

function create() {

	game.world.setBounds(0, 0, 1500, 950);

	// adding physics
	game.physics.startSystem(Phaser.Physics.ARCADE);

	//the floor is lava
  floor = game.add.group();
  floor.enableBody = true;
  floor.physicsBodyType = Phaser.Physics.ARCADE;
  floor.createMultiple(570, 'floor', [0], true);
  floor.align(30, 19, 50, 50);

  //wall·e
  wall = game.add.group();
  wall.enableBody = true;
  wall.physicsBodyType = Phaser.Physics.ARCADE;

  borderline(wall);



	player = game.add.sprite(50, 50, 'lapras');
	game.physics.arcade.enable(player);
	player.body.collideWorldBounds = true;

	//animations
	player.animations.add('left', [9, 10, 11], 10, true);
	player.animations.add('right', [3, 4, 5], 10, true);
	player.animations.add('up', [0, 1, 2], 10, true);
	player.animations.add('down', [6, 7, 8], 10, true);
	player.animations.enableUpdate = true;

	cursors = game.input.keyboard.createCursorKeys();

	shoot = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	municao = game.add.group();
	municao.enableBody = true;
  municao.physicsBodyType = Phaser.Physics.ARCADE;
	municao.createMultiple(30, 'shot');
	municao.setAll('outOfBoundsKill', true);
	municao.setAll('checkWorldBounds', true);

	//frame = game.add.text(0, 0, 'frame = ');

	game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1);

	//  Create our Timer
    timer = game.time.create(false);

    tempo = timer.add(Phaser.Timer.MINUTE * 3 + Phaser.Timer.SECOND * 00, dasEnde, this);

    //  Set a TimerEvent to occur after 30 seconds
    timer.loop(5000, updatePonto, this, floor);

    //  Start the timer running - this is important!
    //  It won't start automatically, allowing you to hook it to button events and the like.
    timer.start();


}

function update() {

	game.physics.arcade.collide(player, wall);

	if((cursors.left.isDown) || (cursors.right.isDown) || (cursors.up.isDown) || (cursors.down.isDown)) {

		if(cursors.left.isDown) {
			player.body.velocity.x = -230;
			player.animations.play('left');
		}

		else if(cursors.right.isDown) {
			player.body.velocity.x = 230;
			player.animations.play('right');
		}

		else {
			player.body.velocity.x = 0;
		}

		if(cursors.up.isDown) {
			player.body.velocity.y = -230;
			player.animations.play('up');
		}

		else if(cursors.down.isDown) {
			player.body.velocity.y = 230;
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

	if(shoot.isDown) {
		fire();
	}

	game.physics.arcade.overlap(floor, municao, Paint, null, this);
	game.physics.arcade.overlap(wall, municao, DeadEnd, null, this);


}

function fire() {

	if(game.time.now > lim) {
		bullet = municao.getFirstExists(false);
		//game.add.text(0, 0, 'frame = '+bullet.tint);
		bullet.tint = 0xA0775F;

		if(bullet) {
			if((player.animations.currentFrame.index == 0) || (player.animations.currentFrame.index == 1) || (player.animations.currentFrame.index == 2)) { //cima
				bullet.reset(player.x+15, player.y);
				//bullet.angle = 180;
				bullet.body.velocity.x = 0;
				bullet.body.velocity.y = -250;
			}
			else if((player.animations.currentFrame.index == 3) || (player.animations.currentFrame.index == 4) || (player.animations.currentFrame.index == 5)) { //direita
				bullet.reset(player.x+30, player.y+10);
				//bullet.angle = -90;
				bullet.body.velocity.x = 250;
				bullet.body.velocity.y = 0;
			}
			else if((player.animations.currentFrame.index == 6) || (player.animations.currentFrame.index == 7) || (player.animations.currentFrame.index == 8)) { //baixo
				bullet.reset(player.x+10, player.y+30);
				//bullet.angle = 0;
				bullet.body.velocity.x = 0;
				bullet.body.velocity.y = 250;
			}
			else if((player.animations.currentFrame.index == 9) || (player.animations.currentFrame.index == 10) || (player.animations.currentFrame.index == 11)) { //esquerda
				bullet.reset(player.x, player.y+10);
				//bullet.angle = 90;
				bullet.body.velocity.x = -250;
				bullet.body.velocity.y = 0;
			}

			lim = game.time.now + 750;
		}
	}

}

function render() {
	total = floor.total;
	var porcentagem = p1/total*100;
	if(timer.running) {
		//game.debug.text('Time until event: ' + timer.duration.toFixed(0), 32, 32, 'rgb(255,255,255)');
		game.debug.text(formatTime(Math.round((tempo.delay - timer.ms) / 1000)), 2, 14, 'rgb(255,255,255)');
	}
	else {
		game.debug.text('FINALE!', 2, 14, 'rgb(255,255,255)');
	}

	game.debug.text('Porcentagem preenchida: '+ porcentagem+'%', 2, 28, 'rgb(255,255,255)');
	//game.debug.text('Num de chão: '+ (floor.total-wall.total), 32, 32, 'rgb(255,255,255)');
}

function resetbullet(bullet) {
	bullet.kill();
}

function Paint(floor, bullet) {
	if(timer.running) {
		floor.tint = bullet.tint;
	}

}

function DeadEnd(wall, bullet) {
	if(timer.running) {
		wall.tint = bullet.tint;
	}

	bullet.kill();
}

function pontuacao(floor) {

	if(floor.tint == 0xff6b99) {
		p1 += 1;
	}
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

function updatePonto(floor) {
	p1 = 0;
	floor.forEach(pontuacao, this, true);
}

function dasEnde() {
	timer.stop();
}

function formatTime(s) {
	var minutes = "0" + Math.floor(s / 60);
    var seconds = "0" + (s - minutes * 60);
    return minutes.substr(-2) + ":" + seconds.substr(-2);
}
