var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

//pros player
var player;
var cursors;

//chao e paredes
var floor;


function preload() {

    game.load.spritesheet('lapras', 'pics/shiny.png', 40, 40);
    game.load.image('bg', 'pics/ocean.png');
    game.load.image('floor', 'pics/floor.png');

}

function create() {

    //total size of world
    game.world.setBounds(0, 0, 2000, 1050);

    //adding physiscs
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //game.add.sprite(0, 0, 'bg');

    floor = game.add.group();
    floor.createMultiple(840, 'floor', [0], true);
    floor.align(40, 21, 50, 50);
    //floor.x = 0;
    //floor.y = 0;
    
    
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
    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1);

}


function update() {

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

}

function render() {

//    game.debug.text('Click to fill tiles', 32, 32, 'rgb(255,255,255)');

}
