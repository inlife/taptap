$(document).ready(function() {

    // Loop on every cell
    $.each($('li'), function() {

        // Add random color to every cell
        var trueOrFalse = Math.round(Math.random());
        if (trueOrFalse) {
            $(this).addClass('on');
        }

        // Create random count of connected cells between 0 and 2
        var conectionsCount = Math.floor((Math.random() * 2));

        // Create array with connected cells
        var connectedCells = [];
        for (var i = 0; i <= conectionsCount; i++) {
            var randomCell = $('li').not($(this))[Math.floor((Math.random() * $('li').length))];
            connectedCells.push(randomCell);
        }

        // Bind event on click
        $(this).click(function() {

            // Change current cell color
            $(this).toggleClass('on');

            // Change connected cells color
            $(connectedCells).toggleClass('on');

        });
    });

    // Resize
    $('ul')[0].setAttribute("style", "height:" + $('ul')[0].offsetWidth + 'px');
    $(window).resize(function() {
        $('ul')[0].setAttribute("style", "height:" + $('ul')[0].offsetWidth + 'px');
    });

});
