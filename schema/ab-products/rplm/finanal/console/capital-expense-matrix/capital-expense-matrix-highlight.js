/*
 * Handles  box or analytic box click actions.
 * The choice of box or analytic box and tracking of a single selection element on the matrix
 */
var MatrixHighlightElementsController = Base.extend({
    _box: null,
    _analyticBox: null,
    _viewManager: null,
    _eventManager: '',
    /*
     * Constructor
     *  @manager: view manager
     */
    constructor: function  (manager) {
        this._viewManager = manager;
        this._eventManager = manager.getEventManager();
        this._initEvents(this._eventManager);
    },
    /*
     * Initialize the events work with the controller
     */
    _initEvents: function (eventManager) {
        eventManager.addEventListener('onSelectBox', this._onClickBox, this);
        eventManager.addEventListener('onSelectAnalyticBox', this._onClickAnalyticBox, this);
        eventManager.addEventListener('onResetSelectAnalyticBox', this._onResetSelectAnalyticBox, this);
        eventManager.addEventListener('onCheckHighlightAnalyticBox', this._onCheckHighlightAnalyticBox, this);
        eventManager.addEventListener('getSelectBox', function () {
            return this._box;
        }, this);
    },
    /*
     * Perform switching of the highlight box on "Click" event
     */
    _onClickBox: function (box) {
        if (this._analyticBox && this._analyticBox.isContainsBox(box)) {
            return;
        }
        if (this._box && (this._box.getID() != box.getID())) {
            if (this._analyticBox && this._analyticBox.isContainsBox(this._box)) {} else {
                this._box.highlight();
            }

        }
        box.highlight();
        this._box = box;
        this._eventManager.callEvent('onClickBox', [box.getRecord(), box.isHighlight()]);
        if (!this._box.isHighlight()) {
            this._box = null;
        }
    },
    /*
     * Perform switching of the highlight analytic box on "Click" event
     */
    _onClickAnalyticBox: function (box) {
        if (!this._eventManager.callEvent('onCheckZoom', [box])) {
            if (this._analyticBox && (this._analyticBox.getID() != box.getID())) {
                this._analyticBox.highlight();
                this._analyticBox.resetHover();
            }
            box.highlight();
            this._analyticBox = box;
            if (!this._analyticBox.isHighlight()) {
                this._analyticBox = null;
            }
        }

    },
    /*
     * Remove the selection of the analytical box
     */
    _onResetSelectAnalyticBox: function () {
        this._analyticBox = null;
    },
    /*
     * Check whether the box to the items of the analytic box
     */
    _onCheckHighlightAnalyticBox: function (box) {
        if (this._analyticBox == null) {
            return false;
        }
        if (!box) {
            return true;
        }
        var currentID = this._analyticBox.getValue(CapitalExpense.Constants.BOX_ID);
        var ID = box.getValue(CapitalExpense.Constants.BOX_ID);
        if (currentID == ID) {
            return true;
        } else {
            return false;
        }
    }
});