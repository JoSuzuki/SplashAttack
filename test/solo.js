// Phaser current version test environment
// Simple countdown timer

var game = new Phaser.Game(600, 400, Phaser.AUTO, 'test', null, false, false);

var BasicGame = function (game) {};

BasicGame.Boot = function (game) {};



//Área de variaveis
var timer, timerEvent, text;
var player, cursors; 
var chao, parede;
var shoot, bullet, municao;
var lim = 0;



BasicGame.Boot.prototype = {

    preload: function () {
        game.load.spritesheet('lapras', 'pics/shiny.png', 40, 40);
        game.load.image('bg', 'pics/ocean.png');
        game.load.image('floor', 'pics/floor.png');
        game.load.image('wall', 'pics/wall.png');
        game.load.image('shot', 'pics/shoot.png');
    },

    create: function () {

        //total size of world
        game.world.setBounds(0, 0, 1500, 950);

        game.add.sprite(0, 0, 'bg');

        //the floor is lava
        floor = game.add.group();
        floor.createMultiple(570, 'floor', [0], true);
        floor.align(30, 19, 50, 50);

        //player
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
        shoot = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        //ammo
        municao = game.add.group();
        municao.enableBody = true;
        municao.physicsBodyType = Phaser.Physics.ARCADE;
        municao.createMultiple(30, 'shot');
        //municao.align(5, 6, 50, 50);
        municao.setAll('outOfBoundsKill', true);
        municao.setAll('checkWorldBounds', true);

        // Create a custom timer
        timer = game.time.create();
        
        // Create a delayed event 1m and 30s from now
        timerEvent = timer.add(Phaser.Timer.MINUTE * 3 + Phaser.Timer.SECOND * 0, this.endTimer, this);
        
        // Start the timer
        timer.start();
    },

    update: function () {

        //só permite se estiver rodando o timer
        if(timer.running) {

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

            if(shoot.isDown) {
                player.tint = 0xff00ff;
            }

        }
        else {
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            player.animations.stop();
            player.tint = 0xff6b99;
        }
        
    },

    render: function () {
        // If our timer is running, show the time in a nicely formatted way, else show 'Done!'
        if (timer.running) {
            game.debug.text(this.formatTime(Math.round((timerEvent.delay - timer.ms) / 1000)), 2, 14, "#ff0");
        }
        else {
            game.debug.text("Das Ende!", 2, 14, "#0f0");
        }
    },

    endTimer: function() {
        // Stop the timer when the delayed event triggers
        timer.stop();
    },

    formatTime: function(s) {
        // Convert seconds (s) to a nicely formatted and padded time string
        var minutes = "0" + Math.floor(s / 60);
        var seconds = "0" + (s - minutes * 60);
        return minutes.substr(-2) + ":" + seconds.substr(-2);   
    }, 

    trigger: function() {
        if(game.time.now > lim) {
            bullet = municao.getFirstExists(false);
            bullet.tint = 0xff6b99;
    
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
    }, 

    resetBullet: function(bullet) {
        bullet.kill();
    }

};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');