var Game = function() {
    "use strict";

    /**
     * Create game object, attach or regenerate field, bind cells, resize
     *
     * @constructor Game
     * @requires JQuery.js, Cell.js
     * @param {Object} selectors - Selectors for field, line, cell ex. {field: '#mygame', line: '.l', cell: '.a'}
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
     *
     * @private
     *
     * Available events:
     * game:
     *    - complete|save|load|generated
     * cell:
     *    - toggle
     */
    Game.prototype.registerEvents = function() {
        var self = this;

        self.on('cell:toggle', function() {

            // Check if we won
            var states = 0;

            for (var i = self.cells.length - 1; i >= 0; i--) {
                states += self.cells[i].state;
            };

            if (states === 0 || states === self.size * self.size) {
                self.trigger('game:complete');
            }

        });

        self.on('game:complete', function() {

            console.log('you won! now it will be restarted, and BIGGER!!');

            setTimeout(function() {
                self.restart();
            }, 1000);

        });
    };

    /**
     * Regenerate field using our game.size
     * @private
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
     * @public
     * @param {int} [size] - If provided, game will be also resized
     */
    Game.prototype.restart = function(size) {
        this.setSize( (size) ? size : this.size, true );
    };

    /**
     * Resize game field, resize html, regenerate cells
     * @public
     * @param {int} size - New size of the field
     * @param {bool} [force] - Force size, useful for restart
     */
    Game.prototype.setSize = function(size, force) {
        if (size && size != this.size || force === true) {
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
     * Resize html according to game size data
     * @public
     */
    Game.prototype.resize = function() {
        this.entity.css('width' , this.getFieldSize());
        this.entity.css('height', this.getFieldSize());

        // [TEMP]
        $('.copyright').css('width' , this.getFieldSize());
        $('.time').css('width' , this.getFieldSize());
        $('.field').click(function(event) {
            $('main').removeClass('start');
        });

        if (window.innerWidth < this.getFieldSizeinPixelsStatic()) {
            $('body').css('font-size', window.innerWidth / this.size);
        }
    };

    /**
     * Return size of our field on x/y axis in em
     * @private
     * @return {string}
     */
    Game.prototype.getFieldSize = function() {
        return this.size * C_SIZE_SPACE + 'em';
    };

    /**
     * Return static, initial default size of our field on x/y axis in pixels
     * @private
     * @return {int}
     */
    Game.prototype.getFieldSizeinPixelsStatic = function() {
        return C_BASIC_SCALE * this.size;
    };

    /**
     * Add new cell into game register
     * @private
     * @param {Cell} cell - Created cell object
     */
    Game.prototype.addCell = function(cell) {
        this.cells.push(cell);
    };

    /**
     * Get random cell from registered cells
     * @private
     * @return {Cell} cell - Cell object
     */
    Game.prototype.getRandomCell = function() {
        return this.cells[ Math.floor( Math.random() * this.cells.length ) ];
    };

    /**
     * Remove all cells, and html data
     * @private
     */
    Game.prototype.removeCells = function() {
        for (var i = this.cells.length - 1; i >= 0; i--) {
            this.cells[i].remove();
            delete this.cells[i];
        };
        this.cells.length = 0;

        this.entity.children().remove();
    };

    /**
     * Event system, binding event listeners
     * @public
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
     * @public
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
     * Storage system, save current game
     * @public
     * @requires Store.js
     * @param {string} [name=_sgp1_save_1] - Name of savefile to save game, defaults to _sgp1_save_1
     */
    Game.prototype.save = function(name) {
        var self = this;

        // Default savefile name
        name = (name) ? name : '_sgp1_save_1';

        // Create document, that will be stored to in storage
        var savedata = {
            time: Date.now(),

            game: {
                size: self.size,
                cells: []
            }
        };

        // Add all cells, and their data to document
        for (var i = this.cells.length - 1; i >= 0; i--) {
            var cell = this.cells[i];
            var connected = [];

            // Iterate over cell connections
            for (var j = cell.connected.length - 1; j >= 0; j--) {
                var subcell = cell.connected[j];
                connected.push(subcell.id);
            };

            // Push cell subdocument into savedata document
            savedata.game.cells.push({
                id: cell.id,
                state: cell.state,
                isMagic: cell.isMagic,
                connected: connected
            });
        };

        // Save document, and trigger event
        // [TODO] Add encryption, to add minimal prevention for modifications
        store(name, savedata);
        self.trigger('game:save');
    };

    /**
     * Storage system, load saved game into current game
     * [TODO]
     * @public
     * @requires Store.js
     * @param {string} [name=_sgp1_save_1] - Name of savefile, defaults to _sgp1_save_1
     */
    Game.prototype.load = function(name) {
        var self = this;

        // Default savefile name
        name = (name) ? name : '_sgp1_save_1';

        // Load save data
        var data = store(name);

        // Set new game field size
        this.setSize( data.game.size );

        for (var i = this.cells.length - 1, j = 0; i >= 0; i--, j++) {
            var ccell = this.cells[j];
            var scell = data.game.cells[i];

            // Set current cell data according to save data
            ccell.setState( scell.state );
            ccell.setMagic( (scell.isMagic) ? true : false );

            // Reset connections
            ccell.connected.length = 0;
            for (var k = scell.connected.length - 1; k >= 0; k--) {

                // Get cell by id, and connect them
                ccell.connect(
                    this.getCellById( scell.connected[k] )
                );
            };
        };

        // Trigger event
        self.trigger('game:load');
    };

    Game.prototype.getCellById = function(id) {
        for (var i = this.cells.length - 1; i >= 0; i--) {
            if (this.cells[i].id == id ) {
                return this.cells[i];
            }
        };

        return null;
    };

    /**
     * Create cell objects, and bind them to clicks
     * Launch main algo
     * @private
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
        self.connectCells_v2();
        self.trigger("game:generated");
    };

    /**
     * main algo v1 (very easy)
     * @private
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

    /**
     * main algo v2  [TODO]: repeat usage of same cells, but prevent infinite cycles, by providing minimum one-way exit
     * Notes:
     */
    Game.prototype.connectCells_v2 = function() {
        var game = this;

        // Game parameters
        var size = this.size;
        var field = size * size;

        // Free cell pool
        var pool = {
            data: {},

            getRandomCell: function(compareCell) {
                var self = pool;

                // Pseudo infinite cycle (ends after 9999 iterations)
                for (var i = 0; i < 9999; i++) {

                    // Try to find empty cell
                    var cell = game.getRandomCell();

                    // If cell was not used, get it
                    if (self.data[cell.id] === true) {

                        // If proviede compareCell, compare them, against equality
                        if (compareCell && cell.id === compareCell.id) {
                            continue;
                        }

                        self.data[cell.id] = false;
                        return cell;
                    }
                }
            },

            getFreeCount: function() {
                var self = pool;
                var count = 0;

                for (var id in self.data) {
                    count += (self.data[id]) ? 1 : 0;
                }

                return count;
            },

            create: function() {
                var self = pool;

                for (var i = 0; i < field; i++) {
                    self.data[game.cells[i].id] = true;
                }
            }
        };

        // Cycles
        var cycles = {
            // settings
            minimum: 3, // minimal cycle size
            maximum: 6, // maximal cycle size
            // maximal number of available cells for cycle
            limit: Math.ceil(field / 2),

            // storage
            count: 0,
            data: [],

            generate: function() {
                var self = cycles;

                // Array to store all possible combinations of cycles
                var combinations = [];
                // We give half of field to cycles
                var limit = self.limit;

                (function(combinations){
                    // Recursive function to generate all possible combinations of cycles
                    var rec_combinate = function(prev) {
                        for (var i = self.minimum; i <= self.maximum; i++) {
                            var curr = { members: [], sum: 0 };

                            if (!prev) {
                                var lprev = curr;
                            } else {
                                var lprev = prev;
                            }

                            if (lprev.sum + i <= limit) {

                                curr.members = lprev.members.slice();
                                curr.members.push(i);
                                curr.sum = lprev.sum + i;

                                combinations.push(curr.members);
                                rec_combinate(curr);
                            }
                        }
                    };

                    // Start recursion
                    return rec_combinate(null);

                })(combinations);

                //  Select one random combination
                var result = combinations[
                    Math.floor( Math.random() * combinations.length )
                ];

                // Store count of cycles
                self.count = result.length;

                // Create cycles, and connect cells
                for (var i = result.length - 1; i >= 0; i--) {
                    var cycle_size = result[i];
                    var cells = [];

                    for (var j = 0; j < cycle_size; j++) {
                        cells.push( pool.getRandomCell() );
                        var cell = cells[j];

                        // If we have prev, connect it to curr
                        if (j > 0) {
                            cells[ j - 1 ].connect( cell );
                        }

                        // Connect last cell with first
                        if (j === cycle_size - 1) {
                            cells[j].connect( cells[0] );
                        }
                    }

                    self.data.push( cells );
                };

                console.log(result);
            },

            getRandom: function(compare) {
                var self = cycles;

                for (var k = 0; k < 9999; k++) {
                    if (!self.data.length) {
                        return null;
                    }
                    if (self.data.length === 1) {
                        return self.data[0];
                    }

                    var item = self.data[
                        Math.floor( Math.random() * self.data.length )
                    ];

                    if (compare && item == compare) {
                        continue;
                    }

                    return item;
                }
            },

            getRandomCellFromCycle: function(cycle) {
                return cycle[ Math.floor( Math.random() * cycle.length ) ];
            },

            // link generated cycles into sequence
            link: function() {
                var self = cycles;

                // Generated random count of elements between input and ouput elements, but not more then maxsize
                var linkSequence = function(maxsize, input, output) {

                    // Get big random
                    var rsize = Math.max(
                        Math.ceil( Math.random() * maxsize + 3),
                        Math.ceil( Math.random() * maxsize + 3)
                    );

                    // If pool size less then our random, try setting smaller max size
                    if (rsize > pool.getFreeCount()) {
                        return linkSequence(maxsize - 1, input, output);
                    }

                    var prev = input;

                    // Connect elements
                    for (var i = 0; i < rsize; i++) {
                        var curr = pool.getRandomCell();
                        prev.connect( curr );
                        prev = curr;
                    }

                    prev.connect( output );
                };

                // Get one cell, and make it starting point
                var starting = pool.getRandomCell();
                starting.setMagic(true);

                var maxsize = Math.floor(pool.getFreeCount() / self.count);
                var base = self.data[0];
                var last = base;

                // Chain random number of cells from starting to first cycle
                linkSequence(
                    maxsize,
                    starting,
                    self.getRandomCellFromCycle(base)
                );

                // Link all cycles one by one (or tree)
                for (var i = 1; i < self.count; i++) {
                    var rnd = (Math.random() * 2 > 1) ? true : false;
                    var curr = self.data[i];

                    linkSequence(
                        maxsize,
                        self.getRandomCellFromCycle(base),
                        self.getRandomCellFromCycle(curr)
                    );

                    if (base.length < 4 || !rnd || base != last) {
                        last = curr;
                    }
                }

                // Connect rest of free cells in chain
                var chain = self.getRandomCellFromCycle(last);
                for (var i = pool.getFreeCount() - 1; i >= 0; i--) {
                    var curr = pool.getRandomCell();
                    chain.connect( curr );
                    chain = curr;
                };

            }
        };

        pool.create();
        cycles.generate();
        cycles.link();

        console.log(pool.getFreeCount());
    };

    return Game;
}();
