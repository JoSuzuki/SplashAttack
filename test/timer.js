// Phaser current version test environment
// Simple countdown timer

var game = new Phaser.Game(600, 400, Phaser.AUTO, 'test', null, false, false);

var BasicGame = function (game) {};

BasicGame.Boot = function (game) {};

var timer, timerEvent, text;

BasicGame.Boot.prototype = {
    preload: function () {
        
    },
    create: function () {
        // Create a custom timer
        timer = game.time.create();
        
        // Create a delayed event 1m and 30s from now
        timerEvent = timer.add(Phaser.Timer.MINUTE * 1 + Phaser.Timer.SECOND * 30, this.endTimer, this);
        
        // Start the timer
        timer.start();
    },
    update: function () {
        
    },
    render: function () {
        // If our timer is running, show the time in a nicely formatted way, else show 'Done!'
        if (timer.running) {
            game.debug.text(this.formatTime(Math.round((timerEvent.delay - timer.ms) / 1000)), 2, 14, "#ff0");
        }
        else {
            game.debug.text("Done!", 2, 14, "#0f0");
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
    }
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');