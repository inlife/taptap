/**
 * Create game object, attach or regenerate field, bind cells, resize
 * 
 * @constructor Game
 * @param {Object} identifers - Selectors for field, line, cell ex. {field: '#mygame', line: '.l', cell: '.a'} 
 * @param {int} [size=4] - Size of field ex. 4 (4x4), 3 (3x3), 10 (10x10)
 * @param {int} [percent=30] - Percentage of cells for each task in algorithm
 */
var Game = function(selectors, size, percent) {
    if (!selectors || !selectors.field || selectors.field.length < 1) {
        return console.error('Please, provide correct selector object as first parameter.');
    }

    this.selectors = selectors;
    this.entity = (selectors.field) ? $(selectors.field) : null;
    this.size = (size) ? size : 4;
    this.percent = (percent) ? percent : 45;
    this.cells = [];
    this.events = [];

    // Register inner game events
    this.registerEvents();

    // Check if current size of field corresponds to our js parameters
    if (this.entity.data('size') != this.size) {
        this.regenerate();
    }

    // Bind cells to entities in js
    this.bindCells();

    // Setup dynamic field size 
    this.resize();
};

/**
 * Register inner game events
 */
Game.prototype.registerEvents = function() {
    var self = this;

    this.on('cellChange', function() {

        // Check if we won
        var states = 0;

        for (var i = self.cells.length - 1; i >= 0; i--) {
            states += self.cells[i].state;
        };

        if (states === 0 || states === self.size * self.size) {
            self.trigger('victory');
        }

    });
};

/**
 * Regenerate field using our game.size
 */
Game.prototype.regenerate = function() {
    this.removeCells();
    this.entity.attr('data-size', this.size);

    for (var x = 1; x <= this.size; x++) {
        var line = $('<div class="' + this.selectors.line.replace(/[\#\.]/i, '') + '">');

        for (var y = 1; y <= this.size; y++) {
            line.append( $('<div class="' + this.selectors.cell.replace(/[\#\.]/i, '') + '" id="cell_' + x + '_' + y + '">') );
        }

        this.entity.append( line );
    }
};

/**
 * Restart game
 * @param {int} [size] - If provided, game will be resized
 */
Game.prototype.restart = function(size) {
    this.setSize( (size) ? size : this.size );
};

/**
 * Resize html according to game size data
 */
Game.prototype.resize = function() {
    this.entity.css('width' , this.getFieldSize());
    this.entity.css('height', this.getFieldSize());

    if (window.innerWidth < this.getFieldSizeinPixelsStatic()) {
        $('body').css('font-size', window.innerWidth / this.size);
    }
};

/**
 * Resize game field, resize html, regenerate cells
 * @param {int} size - New size of the field
 * @param {bool} [force] - Force size, useful for restart
 */
Game.prototype.setSize = function(size, force) {

    if (size != this.size || force === true) {
        // Save new size
        this.size = size;

        // Regenerate field
        this.regenerate();

        // Bind cells to entities in js
        this.bindCells();

        // Setup dynamic field size 
        this.resize();
    }
};

/**
 * Return size of our field on x/y axis in em
 * @return {string}
 */
Game.prototype.getFieldSize = function() {
    return this.size * C_SIZE_SPACE + 'em';
};

/**
 * Return static, initial default size of our field on x/y axis in pixels
 * @return {int}
 */
Game.prototype.getFieldSizeinPixelsStatic = function() {
    return C_BASIC_SCALE * this.size;
};

/**
 * Add new cell into game register
 * @param {Cell} cell - Created cell object
 */
Game.prototype.addCell = function(cell) {
    this.cells.push(cell);
};

/**
 * Get random cell from registered cells
 * @return {Cell} cell - Cell object
 */
Game.prototype.getRandomCell = function() {    
    return this.cells[ Math.floor( Math.random() * this.cells.length ) ];
};

/**
 * Remove all cells, and html data
 */
Game.prototype.removeCells = function() {
    for (var i = this.cells.length - 1; i >= 0; i--) {
        this.cells[i].remove();
        delete this.cells[i];
    };
    this.cells = [];

    this.entity.children().remove();
};

/**
 * Event system, binding event listeners
 * @param {string} name - Name of event to listen
 * @param {Function} callback - Function callback
 */
Game.prototype.on = function(name, callback) {
    if (this.events[name]) {
        this.events[name].push(callback);
    } else {
        this.events[name] = [callback];
    }
};

/**
 * Event system, triggering event
 * @param {string} name - Name of event to trigger
 * @param {Object} [event] - Event data, that will be sent to callback
 */
Game.prototype.trigger = function(name, event) {
    if (this.events[name]) {
        for (var i = this.events[name].length - 1; i >= 0; i--) {
            this.events[name][i](event)
        };
    }
};

/**
 * Create cell objects, and bind them to clicks
 * Launch main algo
 */
Game.prototype.bindCells = function() {
    var self = this;

    // Loop on every cell
    $.each( $(self.selectors.cell), function() {

        // Create cell, and save it
        self.addCell(
            new Cell( $(this).attr('id'), self )
        );

    });

    // Launch main algo
    self.connectCells_v1();
};















/**
 * main algo v2  TODO: repeat usage of same cells, but prevent infinite cycles, by providing minimum one-way exit 
 */
Game.prototype.connectCells = function() {
    var self = this;

    var count = this.size * this.size;
    var part = Math.floor( count / 100 * this.percent );
    
    // Generate pool of free cells
    var pool = {};
    var getRandomCellFromPull = function(compareCell) {
        // Pseudo infinite cycle (ends after 9999 iterations)
        for (var i = 0; i < 9999; i++) {

            // Try to find empty cell
            var cell = self.getRandomCell();
            
            // If cell was not used, get it
            if (pool[cell.id] === true) {

                // If proviede compareCell, compare them, against equality
                if (compareCell && cell.id === compareCell.id) {
                    continue;
                }

                pool[cell.id] = false;
                return cell;
            }
        }
    };
    for (var i = 0; i < count; i++) {
        pool[this.cells[i].id] = true;
    }

    //[START] One way generator (single solution)
    
    // Get first (last) random cell
    var pcell = getRandomCellFromPull();

    // Iterate over N cells
    for (var i = 0; i < part * 2; i++) {
        // Get new random cell
        var cell = getRandomCellFromPull(pcell);

        // Connect random cell with previous cell
        pcell.connect( cell, true );    
        // Overwrite previous with current

        for (var j = 0; j < 2; j++, i++) {
            cell = getRandomCellFromPull(pcell);
            pcell.connect( cell );
        };
        pcell = cell;
    }

    //[END] One way


    //[START] Double switchers generator, use last (first) of previous generator

    for (var i = 0; i < part; i++) {
        var cell = null;

        pcell = cell;
    }

    //[END] Double switchers
};

















/**
 * main algo v1 (very easy)
 */
Game.prototype.connectCells_v1 = function() {
    var self = this;

    var count = this.size * this.size;
    var part = Math.floor( count / 100 * this.percent );
    
    // Generate pool of free cells
    var pool = {};
    var getRandomCellFromPull = function(compareCell) {
        // Pseudo infinite cycle (ends after 9999 iterations)
        for (var i = 0; i < 9999; i++) {

            // Try to find empty cell
            var cell = self.getRandomCell();
            
            // If cell was not used, get it
            if (pool[cell.id] === true) {

                // If proviede compareCell, compare them, against equality
                if (compareCell && cell.id === compareCell.id) {
                    continue;
                }

                pool[cell.id] = false;
                return cell;
            }
        }
    };
    for (var i = 0; i < count; i++) {
        pool[this.cells[i].id] = true;
    }

    //[START] One way generator (single solution)
    
    // Get first (last) random cell
    var pcell = getRandomCellFromPull();

    // Iterate over N cells
    for (var i = 0; i < part; i++) {
        // Get new random cell
        var cell = getRandomCellFromPull(pcell);
        
        // Connect random cell with previous cell
        pcell.connect( cell, true );    
        // Overwrite previous with current
        pcell = cell;
    }

    //[END] One way


    //[START] Double switchers generator, use last (first) of previous generator

    for (var i = 0; i < part; i++) {
        var cell = null;

        for (var j = 0; j < 2; j++, i++) {
            cell = getRandomCellFromPull(pcell);
            pcell.connect( cell );
        };

        pcell = cell;
    }

    //[END] Double switchers
};