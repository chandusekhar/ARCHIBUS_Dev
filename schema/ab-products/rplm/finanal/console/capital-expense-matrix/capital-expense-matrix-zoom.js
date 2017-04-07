/*
 *  Handles zoom in/out actions.
 *  Hides or shows columns and updates zoom highlighting and tooltips.
 *  Displaying selected category and the boxes belonging to the category.
 */
var MatrixZoomController = Base.extend({
    _record: null,
    _zoom: false,
    _scale: null,
    _manager: null,
    _eventManager: null,
    _zoomInTooltip: '',
    _zoomOutTooltip: '',
    /*
     * Constructor
     *  @manager: view manager
     */
    constructor: function (manager) {
        this._manager = manager;
        this._eventManager  = this._manager.getEventManager();
        this._zoomInTooltip = new TooltipZoomIn(this._manager);
        this._zoomOutTooltip = new TooltipZoomOut(this._manager);
        this._initEvents();
    },
    /*
     * Initialize the events work with the controller
     */
    _initEvents: function () {
        this._eventManager.addEventListener('onInitZoom', this._setRecord, this);
        this._eventManager.addEventListener('onCheckZoom', this._checkZoom, this);
        this._eventManager.addEventListener('onCheckZoomBox', this._checkZoomBox, this);
        this._eventManager.addEventListener('onZoomIn', this._zoomIn, this);
        this._eventManager.addEventListener('onZoomOut', this._zoomOut, this);
        this._eventManager.addEventListener('onZoomInTooltip', function () {
            return this._zoomInTooltip;
        }, this);
    },
    /*
     * Check whether the zoom category or not.
     * If param record missing do checks initialization analytic box for zoom.
     *       @record: the analytic box
     */
    _checkZoom: function (record) {
        if (!this._record) {
            return false;
        }
        if (record) {
            if (this._record.getID() == record.getID() && this._zoom) {
                return true;
            }
            return false;
        } else {
            return this._zoom;
        }
    },
    /*
     * Check whether the zoom category box or not.
     * If param record missing do checks initialization analytic box for zoom.
     *       @record: the  box
     */
    _checkZoomBox: function (box) {
        if (!this._record || !this._record.isHighlight()) {
            return false;
        }
        return this._record.isContainsBox(box);
    },
    /*
     * Set the analytic box and create the tooltip for of the zoom in
     */
    _setRecord: function (record) {
        this._record = record;
        this._zoomInTooltip.render(record);
    },
    /*
     * Executing an event "Zoom in"
     */
    _zoomIn: function () {
        this._zoom = true;
        var analyticBox = this._record;
        this._eventManager.callEvent('onMatrixHide', []);


        this._zoomInTooltip.remove();
        var scale = analyticBox.zoomIn();
        this._zoomOutTooltip.render(ColorCalculator.calculateTextColor(analyticBox.getValue(CapitalExpense.Constants.BGK_COLOR), AnalyticBox), scale);

        this._eventManager.callEvent('getConfig', []).width = (ColumnData.columnWidth  -  RollUp.getWidth()) * scale;
        this._eventManager.callEvent('onResizeSVG', []);

        this._eventManager.callEvent('onClickBox', [analyticBox, true]);
        this._eventManager.callEvent('afterZoomIn', [this._manager.getDispatcher()]);
    },
    /*
     * Executing an event "Zoom out"
     */
    _zoomOut: function () {
        this._zoom = false;
        var analyticBox = this._record;
        this._eventManager.callEvent('onMatrixShow', []);


        this._zoomOutTooltip.remove();
        analyticBox.zoomOut();
        analyticBox.switchHighlight();
        this._record = null;
        this._eventManager.callEvent('onResetSelectAnalyticBox', []);
        this._eventManager.callEvent('getConfig', []).width =  this._eventManager.callEvent('getWidth', []);
        this._eventManager.callEvent('onResizeSVG', []);

        this._eventManager.callEvent('onClickBox', [analyticBox, false]);
        this._eventManager.callEvent('afterZoomIn', [this._manager.getDispatcher()]);
    }
},{
    config: {
        headerHeight: 80,
        tooltipHeaderHeight: 30
    }
});
/*
 * Tip performing the event to "Zoom in".
 * Renders the prompts in the matrix.
 */
var TooltipZoomIn = Base.extend({
    _data: null,
    _manager: null,
    _eventManager: null,
    /*
     * Constructor
     *  @manager: view manager
     */
    constructor: function (manager) {
        this._manager = manager;
        this._eventManager = manager.getEventManager();
    },
    /*
     * Perform the render tooltip.
     * Is drawing the background, header, value and percent of analytic box.
     * Initialized the click events
     *      @data: data of the box
     */
    render: function (data) {
        this._data = data;
        this._eventManager.callEvent('calculatePosition', []);
        var positionX = this._eventManager.callEvent('getColumnPosition', [this._data.getAnalyticColumnIndex()]) + this._data.getColumnIndex() * this._data.getValue(CapitalExpense.Constants.WIDTH);
        var container = this._manager.getContainer().select('svg').append('g').attr({
            id: CapitalExpense.ClassType.TOOLTIP_IN_CONTAINER,
            opacity: 1
        });
        this._renderShadows(container, positionX);
        this._renderBody(container, positionX);
        var widthTitle = d3.select('#' + CapitalExpense.ClassType.TOOLTIP_IN_TITLE).node().getComputedTextLength();
        this._renderImage(container, positionX, widthTitle);
        this._adjustTooltip(container, positionX, widthTitle);
        var scope = this;
        container.on('click', function () {
            scope._eventManager.callEvent('onZoomIn', []);
        });
    },
    /*
     * Remove the tooltip
     */
    remove: function () {
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_IN_CONTAINER).remove();
    },
    /*
     * Show all the elements of tooltip
     */
    show: function () {
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_IN_CONTAINER).transition().delay(800).attr({
            display: 'block'
        });
    },
    /*
     * Hide all the elements of tooltip
     */
    hide: function () {
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_IN_CONTAINER).attr({
            display: 'none'
        });
    },
    /*
     * Move the  tooltip for "Collapse" event
     */
    shift: function (positionX) {
        var widthTitle = d3.select('#' + CapitalExpense.ClassType.TOOLTIP_IN_TITLE).node().getComputedTextLength();
        var width = widthTitle + 35;
        var positionXTooltip =  positionX - (width - (this._data.getColumnIndex() + 1) * this._data.getValue(CapitalExpense.Constants.WIDTH));
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_IN_RECT).transition().duration(CapitalExpense.Animation.columnShift).attr({
            x: positionXTooltip
        });
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_IN_TITLE).transition().duration(CapitalExpense.Animation.columnShift).attr({
            x: positionXTooltip + 5
        });
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_IN_VALUE).transition().duration(CapitalExpense.Animation.columnShift).attr({
            x: positionXTooltip + 5
        });
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_IN_IMAGE).transition().duration(CapitalExpense.Animation.columnShift).attr({
            x: positionXTooltip + widthTitle + 15
        });
        var bumpPositionY = this._data.getValue(CapitalExpense.Constants.POSITION_Y) - 5;
        this._transitionBump('top', [{
                x:  positionXTooltip + (width / 2) - 10,
                y:  bumpPositionY
            },{
                x:  positionXTooltip + (width / 2),
                y:  bumpPositionY + 10
            }]
        );
        this._transitionBump('bottom', [{
                x:  positionXTooltip + (width / 2),
                y:  bumpPositionY + 10
            },{
                x:  positionXTooltip + (width / 2) + 10,
                y:  bumpPositionY
            }]
        );
        this._transitionBump('fill', [{
                x:  positionXTooltip + (width / 2) - 10,
                y:  bumpPositionY - 1
            }, {
                x:  positionXTooltip + (width / 2) ,
                y:  bumpPositionY + 10
            }, {
                x:  positionXTooltip + (width / 2) + 10,
                y:  bumpPositionY  - 1
            }]
        );
        for (var i = 3; i >= 0; i--) {
            d3.select('#tooltipZoomInBox_shadow_' + i).transition().duration(800).attr({
                x: positionXTooltip + i * 2
            });
        }
    },
    /*
     * Perform render of the body tooltip
     */
    _renderBody: function (container, positionX) {
        var textColor =  ColorCalculator.calculateTextColor(this._data.getValue(CapitalExpense.Constants.BGK_COLOR), AnalyticBox);
        container.append('rect').attr({
            x: positionX - 70,
            y: this._data.getValue(CapitalExpense.Constants.POSITION_Y) - 45,
            height: 40,
            width: 100,
            fill: AnalyticBox.colorByClicking,
            stroke: textColor,
            id: CapitalExpense.ClassType.TOOLTIP_IN_RECT //'capitalExpenseMatrixZoomTooltip'
        }).style({
            cursor: 'pointer'
        });
        container.append('text').attr({
            x: positionX - 65,
            y: this._data.getValue(CapitalExpense.Constants.POSITION_Y) - 30,
            fill: textColor,
            id: CapitalExpense.ClassType.TOOLTIP_IN_TITLE
        }).style({
            'font-size': '14px',
            'font-weight': 'bold',
            cursor: 'pointer'
        }).text(this._data.getValue(CapitalExpense.Constants.BOX_TITLE));
        container.append('text').attr({
            x: positionX - 65,
            y: this._data.getValue(CapitalExpense.Constants.POSITION_Y) - 11,
            fill: textColor,
            id: CapitalExpense.ClassType.TOOLTIP_IN_VALUE
        }).style({
            'font-size': '12px',
            cursor: 'pointer'
        }).text(this._data.getValue(CapitalExpense.Constants.VALUE_FORMATTED));
    },
    /*
     * Perform render of the image tooltip
     */
    _renderImage: function (container, positionX, widthTitle) {
        container.append("image").attr({
            x: positionX - 65 + widthTitle ,
            y: this._data.getValue(CapitalExpense.Constants.POSITION_Y) - 35,
            width: 16,
            height: 16,
            'xlink:href': CapitalExpense.Constants.TOOLTIP_ANGLE_RIGHT,
            id: CapitalExpense.ClassType.TOOLTIP_IN_IMAGE
        }).style({
            cursor: 'pointer'
        });
    },
    /*
     * Perform render of the shadows tooltip
     */
    _renderShadows: function (container, positionX) {
        for (var i = 3; i >= 0; i--) {
            container.append('rect').attr({
                x: positionX - 70 - i * 2,
                y: this._data.getValue(CapitalExpense.Constants.POSITION_Y) - 45 + i * 2,
                height: 40,
                width: 100,
                id: 'tooltipZoomInBox_shadow_'+ i
            }).style({
                opacity: 0.1
            });
        }
    },
    /*
     * Perform render of the bump tooltip
     */
    _renderBump: function (container, positionX, width) {
        var bumpContainer = CapitalExpense.SVG.renderContainer(container, CapitalExpense.ClassType.TOOLTIP_IN_BUMP);
        var bumpPositionY = this._data.getValue(CapitalExpense.Constants.POSITION_Y) - 5;
        var bumpPositionX = positionX + (width / 2);
        this._renderTopBump(bumpContainer, bumpPositionX, bumpPositionY);
        this._renderBottomBump(bumpContainer, bumpPositionX, bumpPositionY);
        this._renderFillBump(bumpContainer, bumpPositionX, bumpPositionY);
    },
    /*
     * Perform render the top border of the bump
     */
    _renderTopBump: function (container, positionX, positionY) {
        var data  =  [{
            x:  positionX - 10,
            y:  positionY
        },{
            x:  positionX,
            y:  positionY + 10
        }];
        CapitalExpense.SVG.renderLine(container, data,
            {
                color: '#ffffff',
                width: '1px'
            },
            'top'
        );
    },
    /*
     * Perform render the bottom border of the bump
     */
    _renderBottomBump: function (container, positionX, positionY) {
        var data  =  [{
            x:  positionX,
            y:  positionY + 10
        },{
            x:  positionX + 10,
            y:  positionY
        }];
        CapitalExpense.SVG.renderLine(container, data,
            {
                color: '#ffffff',
                width: '1px'
            },
            'bottom'
        );
    },
    /*
     * Perform render the fill of the bump
     * */
    _renderFillBump: function (container, positionX, positionY) {
        var data = [
            {
                x:  positionX - 10,
                y:  positionY - 1
            }, {
                x:  positionX,
                y:  positionY + 10
            }, {
                x:  positionX + 10,
                y:  positionY - 1
            }
        ];
        CapitalExpense.SVG.renderFillLine(container, data, AnalyticBox.colorByClicking, 'fill');
    },
    /*
     * Perform adjust the height and width of the tooltip
     */
    _adjustTooltip: function (container, positionX, widthTitle) {
        var width = widthTitle + 35;
        positionX =  positionX - 70 - (width - 100);

        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_IN_RECT).attr({
            width: width,
            x: positionX
        });

        for (var i = 3; i >= 0; i--) {
            d3.select('#tooltipZoomInBox_shadow_' + i).attr({
                width: width,
                x: positionX + i * 2
            });

        }
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_IN_TITLE).attr({
            width: width,
            x: positionX + 5
        });
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_IN_VALUE).attr({
            width: width,
            x: positionX + 5
        });
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_IN_IMAGE).attr({
            x: positionX + widthTitle + 15
        });
        this._renderBump(container, positionX, width);
    },
    /*
     * Perform the transposition of view bump
     */
    _transitionBump: function (id, data) {
        var lineFunction = d3.svg.line()
            .x(function(data) { return data.x; })
            .y(function(data) { return data.y; })
            .interpolate("linear");
        d3.select('.' + CapitalExpense.ClassType.TOOLTIP_IN_BUMP)
            .select('#' + id)
            .transition().duration(CapitalExpense.Animation.columnShift)
            .attr({
                d: lineFunction(data)
            });
    }
});
/*
 * Tip performing the event to "Zoom out".
 * Renders the prompts in the matrix.
 */
var TooltipZoomOut = Base.extend({
    _manager: '',
    _eventManager: '',
    /*
     * Constructor
     *  @manager: view manager
     */
    constructor: function (manager) {
        this._manager = manager;
        this._eventManager = manager.getEventManager();
    },
    /*
     * Perform the render tooltip.
     * Initialized the click events
     *      @textColor: text color
     *      @scale: the value by which to scale the size of the tooltip
     */
    render: function (textColor, scale) {
        var scope = this;
        var container = scope._manager.getContainer().select('svg').append('g').attr({
            id: CapitalExpense.ClassType.TOOLTIP_OUT_CONTAINER,
            opacity: 1
        });
        var width = (ColumnData.columnWidth  -  RollUp.getWidth()) * scale;
        var height = MatrixZoomController.config.tooltipHeaderHeight * scale;
        container.append('rect').attr({
            x: -100,
            y: -100,
            height: height,
            width: width,
            fill: AnalyticBox.colorByClicking,
            stroke: '#ffffff',
            'stroke-width': 1,
            'cursor': 'pointer'
        });
        container.on('click', function () {
            //EventManager.callEvent('onZoomOut', []);
            scope._eventManager.callEvent('onZoomOut', []);
        });
        container.on('mouseover', function () {
            d3.select('#' + CapitalExpense.ClassType.TOOLTIP_OUT_CONTAINER).select('rect').attr({
                opacity: 0.5
            });
        });
        container.on('mouseout', function () {
            d3.select('#' + CapitalExpense.ClassType.TOOLTIP_OUT_CONTAINER).select('rect').attr({
                opacity: 1
            });
        });
        container.append('image').attr({
            x: -100,
            y: -100,
            width: 16,
            height: 16,
            'xlink:href': CapitalExpense.Constants.TOOLTIP_ANGLE_LEFT,
            id: CapitalExpense.ClassType.TOOLTIP_OUT_IMAGE
        }).style({
            cursor: 'pointer'
        });
        container.append('text').attr({
            x: -100,
            y: -100,
            fill: textColor,
            id: CapitalExpense.ClassType.TOOLTIP_OUT_TITLE
        }).style({
            'font-size': '12px',
            cursor: 'pointer'
        }).text(getMessage('capitalExpenseMatrixZoomOut'));
        this._transitionTooltipZoomOut(scale);
    },
    /*
     * Remove the tooltip
     */
    remove: function () {
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_OUT_CONTAINER).remove();
    },
    /*
     * Perform the transposition of view tooltip
     */
    _transitionTooltipZoomOut: function (scale) {
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_OUT_CONTAINER)
            .select('rect')
            .transition().duration(0).delay(CapitalExpense.Animation.boxZoomOut)
            .attr({
                x: 0,
                y:  ( MatrixZoomController.config.headerHeight) * scale
            });
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_OUT_TITLE)
            .transition().duration(0).delay(CapitalExpense.Animation.boxZoomOut)
            .attr({
                x: (ColumnData.columnWidth  -  RollUp.getWidth()) * scale / 3.5,
                y: (MatrixZoomController.config.headerHeight  + MatrixZoomController.config.tooltipHeaderHeight / 2 + 2.5) * scale
            });
        d3.select('#' + CapitalExpense.ClassType.TOOLTIP_OUT_IMAGE)
            .transition().duration(0).delay(CapitalExpense.Animation.boxZoomOut)
            .attr({
                x: 25,
                y: ( MatrixZoomController.config.headerHeight   + 7.5) * scale
            });
    }
});
