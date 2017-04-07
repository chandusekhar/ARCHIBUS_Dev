/*
 * Manager events registered event in matrix and allowing to call
 */
var EventManager = Base.extend({
    _eventsMap: {},
    /*
     * Constructor
     */
    constructor: function () {
        this._eventsMap = {};
    },
    /*
     * Add event
     *  @eventName: the name of the events
     *  @callback: function
     *  @scope: the scope of the area events
     */
    addEventListener: function (eventName, callback, scope) {
        if (typeof this._eventsMap[eventName] == "undefined"){
            this._eventsMap[eventName] = {};
        }
        this._eventsMap[eventName] = {
            function: callback,
            scope: scope
        };
    },
    /*
     * Call event
     *  @eventName: the name of the events
     *  @fields: variables functions
     */
    callEvent: function (eventName, fields) {
        if (typeof eventName == "string") {
            eventName = {type: eventName};
        }
        var listeners = this._eventsMap[eventName.type];
        if (listeners) {
            var fun = listeners.function;
            return fun.apply(listeners.scope, fields);
        }
    }
});

/*
 * The matrix manager allows to work with the matrix from outside.
 * Manager registered events: get the height and width of the matrix.
 */
var MatrixDispatcher = Base.extend({
    constructor: function (view) {
        this.extend({
            /*
             * Get height of the matrix view
             */
            getHeight: function () {
                return view.getConfig().height;
            },
            /*
             * Get width of the matrix view
             */
            getWidth: function () {
                return view.getConfig().width;
            }
        });
    }
});

/*
 * Calculates/controls matrix layout and size.
 * Initialization of actions matrix: zoom categories, collapse/expand column, highlight element
 */
var ViewManager = Base.extend({
    _container: null,
    _currentConfig: {},
    _eventManager: '',
    _dispatcher: null,
    _positionColumn: [],
    /*
     * Constructor
     *  @config: custom config the matrix
     *  @events: the console events
     */
    constructor: function (config, events) {
        this._eventManager = new EventManager();

        this._container = config.container;
        this._currentConfig.height = config.height;
        this._dispatcher = new MatrixDispatcher(this);
        this._positionColumn = [];

        this._initEvents(events);
        this._initAction();

    },
    /*
     * Get manager matrix to the received data
     */
    getDispatcher: function () {
        return this._dispatcher;
    },
    /*
     * Get the event manager
     */
    getEventManager: function () {
        return this._eventManager;
    },
    /*
     * Get config of the view matrix
     */
    getConfig: function () {
        return this._currentConfig;
    },
    /*
     * Get container the matrix
     */
    getContainer: function () {
        return d3.select('#' + this._container);
    },
    /*
     * Get container name the matrix
     */
    getContainerName: function () {
        return this._container;
    },
    /*
     * Calculate the location of elements in the matrix
     */
    calculateLocalizationElement: function (dataStore) {
        var manager = this;
        while(true) {
            var result = false;
            var positionX = 0;
            dataStore.eachColumn(function (column) {
                if (column.getType() == CapitalExpense.Constants.C3) {
                    positionX -= ColumnData.gapBetweenColumns;
                }
                var boxesHeight = manager.getConfig().height - ColumnData.heightHeader;
                var calculateHeight = new HeightCalculator(column, manager);
                var resultBoxesHeight = calculateHeight.calculate();
                if (resultBoxesHeight) {
                    if (resultBoxesHeight > boxesHeight) {
                        result = true;
                        manager.getConfig().height = resultBoxesHeight + ColumnData.heightHeader;
                        return true;
                    }
                }
                WidthCalculator.calculate(column);
                PositionCalculator.calculate(column,
                    {
                        X: positionX,
                        Y: ColumnData.heightHeader
                    }
                );
                switch (column.getType()) {
                    case CapitalExpense.Constants.C1:
                    case CapitalExpense.Constants.C2:
                        positionX += ColumnData.columnWidth + ColumnData.gapBetweenColumns;
                        break;
                    case CapitalExpense.Constants.C3:
                        positionX += AnalyticColumn.width + ColumnData.gapBetweenColumns;
                        break;
                }
            });
            if (!result) {
                break;
            }
        }
        this._currentConfig.width = positionX;
    },
    /*
     * Calculate the location of elements in the matrix: position X
     */
    _calculateColumnPositionX: function () {
        var dataStore = this._eventManager.callEvent('getDataStore', []);
        var result = [];
        var prevWidth = 0;
        dataStore.eachColumn(function (column) {
            var currentPositionX = column.getValue(CapitalExpense.Constants.POSITION_X);
            var gap = 0;
            switch (column.getType()){
                case CapitalExpense.Constants.C1:
                case CapitalExpense.Constants.C2:
                    gap = ColumnData.gapBetweenColumns;
                    break;
            }
            if (currentPositionX == 0) {
                result[result.length] = currentPositionX;
            } else {
                var i = result.length;
                result[result.length] = result[i - 1] + prevWidth + gap;
            }
            if (column.isCollapse()) {
                prevWidth = 30;
            } else {
                prevWidth = column.getValue(CapitalExpense.Constants.WIDTH);
            }
        });
        this._positionColumn = result;
    },
    /*
     * Load data from a previous session and to perform required actions: collapse/expands columns
     */
    _loadPrevSession: function () {
        var list = this._eventManager.callEvent('readSidecar', ['Collapse']);
        var dataStore = this._eventManager.callEvent('getDataStore', []);
        var scope = this;
        if (list != null) {
            var data  = list.actions
            for (var i=0; i < data.length; i++) {
                dataStore.eachColumn(function (column) {
                    if (data[i].id == column.getValue(CapitalExpense.Constants.BOX_ID) && data[i].action == true) {
                        column.switchCollapse();
                        scope._eventManager.callEvent('onCollapse', [column, true]);
                    }
                });
            }
        }

    },
    /*
     * Initialize the events work with the controller
     *  @events: the list of external events
     */
    _initEvents: function (events) {
        if (events) {
            for (var eventName in events) {
                var obj = events[eventName];
                this._eventManager.addEventListener(eventName, obj.function, obj.scope);
            }
        }
        this._eventManager.addEventListener('calculatePosition', function () {
            this._calculateColumnPositionX();
        }, this);
        this._eventManager.addEventListener('getColumnPosition', function (columnIndex) {
            return this._positionColumn[columnIndex];
        }, this);
        this._eventManager.addEventListener('getWidth', function () {
            var lastColumn;
            this._calculateColumnPositionX();
            var dataStore = this._eventManager.callEvent('getDataStore', []);
            dataStore.eachColumn(function (column) {
                lastColumn = column
            });
            return this._positionColumn[this._positionColumn.length - 1] + lastColumn.getValue(CapitalExpense.Constants.WIDTH);
        }, this);
        this._eventManager.addEventListener('getConfig', function () {
            return this.getConfig();
        }, this);
        this._eventManager.addEventListener('getContainer', this.getContainer, this);
        this._eventManager.addEventListener('loadPrevSession', this._loadPrevSession, this);
    },
    /*
     * Initialize the action work with the matrix
     */
    _initAction: function () {
        new MatrixZoomController(this);
        new MatrixHighlightElementsController(this);
        new MatrixCollapseController(this);
    }
});