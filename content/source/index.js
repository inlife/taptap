"use strict";

var dbg = null; // object can be written here, and called in developer console. ex.: dbg = game; || Chrome: dbg.regenerate();

var C_SIZE_SPACE = 0.98; // Formula: ~~ $c-size + 0.10, and then ctrl+r
var C_BASIC_SCALE = 100; // Equals to scss's $c-basic-scale, no px

$(document).ready(function() {

    // Create game object, provided selectors, size
    var myGame = new Game({ 
        field: '.field', 
        line: '.line', 
        cell: '.cell'
    }, 3);


    // Bind vicory callback (test)
    myGame.on('victory', function() {
        console.log('you won! now it will be restarted, and BIGGER!!');

        setTimeout(function() {
            myGame.restart( myGame.size + 1 );
        }, 1000);
    });


    // Bind resize event to game resize
    $(window).resize(function() {
        myGame.resize();
    });

    // debug
    dbg = myGame;
});

// Disable scrolling
window.addEventListener("touchmove", function(event) {
    if (!event.target.classList.contains('scrollable')) {
        event.preventDefault();
    }
}, false);

// FastClick library
window.addEventListener("load", function() {
    new FastClick(document.body);
}, false);