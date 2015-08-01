/**
 * Create game object, attach or regenerate field, bind cells, resize
 * 
 * @constructor Game
 * @param {string} id Unique html identifier for cell. ex.: cell_1_2
 * @param {int} [state=] - Starting state of cell 0 or 1, if not provided random state will be generated
 */
var Cell = function(id, state) {
    this.id = (id) ? id : null;
    this.entity = (id) ? $('#' + id) : null;
    this.state = (state) ? state : Math.round(Math.random());
    this.connected = [];

    // Update html data according to object
    this.initialize();
};

/**
 * Initialize cell object, bind html events, set html data
 */
Cell.prototype.initialize = function() {
    var self = this;

    if (this.state) {
        this.entity.addClass('on');
    }

    // Bind event on click
    this.entity.bind('click', function() {
        self.toggle();
        self.toggleConnected();
    });
};

/**
 * Toggle cell state
 */
Cell.prototype.toggle = function() {
    this.entity.toggleClass('on');
};

/**
 * Toggle connected cells state
 */
Cell.prototype.toggleConnected = function() {
    for (var i = this.connected.length - 1; i >= 0; i--) {
        this.connected[i].toggle();
    };
};

/**
 * Connect cell to other cell

 * @param {Cell} cell - Cell object that we want to connect
 * @param {bool} backward - Connect cells backward
 */
Cell.prototype.connect = function(cell, backward) {
    if (backward) {
        return cell.connect( this );
    }

    this.connected.push( cell );
};