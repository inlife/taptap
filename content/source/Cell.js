var Cell = function() {
    "use strict";

    /**
     * Create game object, attach or regenerate field, bind cells, resize
     *
     * @constructor Game
     * @requires JQuery.js
     * @param {string} id Unique html identifier for cell. ex.: cell_1_2
     * @param {Game} game - Link to game object, for triggering events
     * @param {int} [state=] - Starting state of cell 0 or 1, if not provided random state will be generated
     */
    var Cell = function(id, game, state) {
        this.id = (id) ? id : null;
        this.entity = (id) ? $('#' + id) : null;
        this.state = (state) ? state : Math.round(Math.random());
        this.connected = [];
        this.isMagic = false;

        // Update html data according to object
        this.initialize(game);
    };

    /**
     * Initialize cell object, bind html events, set html data
     * @private
     * @param {Game} game - Link to game object, for triggering events
     */
    Cell.prototype.initialize = function(game) {
        var self = this;

        if (this.state) {
            this.entity.addClass('on');
        }

        // Bind event on click
        this.entity.bind('click', function() {
            console.log(self.isMagic);
            self.toggle();
            self.toggleConnected();

            game.trigger('cell:toggle');
        });
    };

    /**
     * Connect cell to other cell
     *
     * @public
     * @param {Cell} cell - Cell object that we want to connect
     * @param {bool} [backward] - Connect cells backward
     */
    Cell.prototype.connect = function(cell, backward) {
        if (backward) {
            return cell.connect(this);
        }

        this.connected.push(cell);
    };

    /**
     * Toggle cell state
     * @public
     */
    Cell.prototype.toggle = function() {
        this.state = (this.state) ? 0 : 1;
        this.entity.toggleClass('on');
    };

    /**
     * Toggle connected cells state
     * @private
     */
    Cell.prototype.toggleConnected = function() {
        if (!this.isMagic) {
            for (var i = this.connected.length - 1; i >= 0; i--) {
                this.connected[i].toggle();
            };
        } else {
            if (this.state !== this.connected[0].state) {
                this.connected[0].toggle();
            }
        }
    };

    /**
     * Delete cell
     * @public
     */
    Cell.prototype.remove = function() {
        for (var i = this.connected.length - 1; i >= 0; i--) {
            delete this.connected[i];
        };

        this.entity.remove();
    };

    /**
     * Set "magic" property of cell
     * @public
     * @param {Boolean} isMagic
     * @return {Cell} Pointer on itself
     */
    Cell.prototype.setMagic = function(isMagic) {
        this.isMagic = isMagic;
        return this;
    };

    /**
     * Set state forcefully, and change html
     * @public
     * @param {Boolean} state
     * @return {Cell} Pointer on itself
     */
    Cell.prototype.setState = function(state) {
        this.state = state;

        if (this.state && !this.entity.hasClass('on')) {
            this.entity.toggleClass('on');
        } else if (!this.state && this.entity.hasClass('on')) {
            this.entity.toggleClass('on');
        }

        return this;
    };

    return Cell;
}();