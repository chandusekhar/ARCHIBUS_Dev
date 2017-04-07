/*
 * Defines a box displayed in the category column.
 * Provides an API to show, hide, resize, zoom in, zoom out, adjust, shift, and highlight a box.
 */
var AnalyticBox = Base.extend({
    _id: '',
    _data: '',
    _dataBoxes: '',
    _columnIndex: '',
    _columnAnalyticIndex: '',
    _eventManager: '',
    _highlight: '',
    /*
     *  Constructor
     *   @record: category information
     *   @boxes: the list boxes which are included in the category
     *   @eventManager: event manager
     *   @columnIndex: the index of the column in which the element is located
     */
    constructor: function (record, boxes, eventManager, columnIndex) {
        this._eventManager = eventManager;
        this._highlight = false;
        this._columnIndex = columnIndex;
        if (record) {
            this._data = record;
            this._id = '#' + record.getValue(CapitalExpense.Constants.BOX_ID);
        }
        if (boxes) {
            this._dataBoxes = boxes;
        }
        this._columnAnalyticIndex = this._findColumnIndex();
        var isCreate = d3.select('#tooltip_' + this.getValue(CapitalExpense.Constants.BOX_ID)).node();
        if (isCreate != null) {
            d3.select('#tooltip_' + this.getValue(CapitalExpense.Constants.BOX_ID)).remove();
        }
        this._tooltip = d3.tip()
            .offset(function (data) {
                var offsetLeft = 0;//(Column.width - RollUp.getWidth()) / 2 - 5;
                return [data.getValue(CapitalExpense.Constants.HEIGHT) / 3.5,  offsetLeft];
            })
            .attr('class', 'capitalExpenseMatrixBoxTooltip')
            .attr('id', 'tooltip_' + this.getValue(CapitalExpense.Constants.BOX_ID))
            .html(this._renderTooltip);
    },
    /*
     *    Get a database field from database data the matrix element
     *       @field: field of the box
     */
    getValue: function (field) {
        return this._data.getValue(field);
    },
    /*
     *    Set a database field from database data the matrix element
     *        @field: field of the box
     *        @value: value
     */
    setValue: function (field, value) {
        this._data.setValue(field, value);
    },
    /*
     * Get ID the box in matrix
     */
    getID: function () {
        return this.getValue(CapitalExpense.Constants.BOX_ID);
    },
    /*
     *  Get the first box belonging to the category
     */
    getFirstBox: function () {
        return this._dataBoxes[0];
    },
    /*
     * Get the last box belonging to the category
     */
    getLastBox: function () {
        return this._dataBoxes[this._dataBoxes.length - 1];
    },
    /*
     * Check the highlighting the box in the matrix
     */
    isHighlight: function () {
        return this._highlight;
    },
    /*
     * Check belongs box to the category
     * 	@currentBox: box
     */
    isContainsBox: function (currentBox) {
        var result = false;
        this.eachBox(function (box) {
            if (box.getID() == currentBox.getID()) {
                result = true;
                return true;
            }
        });
        return result;
    },
    /*
     * To toggle the selection box
     */
    switchHighlight: function () {
        if (this._highlight) {
            this._highlight = false;
        } else {
            this._highlight = true;
        }
    },
    /*
     * Iterate over all boxes in the category
     *  @action: function analysis of box
     */
    eachBox: function (action) {
        for (var index = 0; index < this._dataBoxes.length; index++) {
            var box = this._dataBoxes[index];
            var result = action(box);
            if (result) {
                break;
            }
        }
    },
    /*
     * Get column index in analytic column
     */
    getColumnIndex: function () {
        return this._columnAnalyticIndex;
    },
    /*
     * Get column index in matrix
     */
    getAnalyticColumnIndex: function () {
        return this._columnIndex;
    },
    /*
     * Perform the render box.
     * Is drawing the background, header and value/percent of boxing.
     * Initialized the click, mouseover and mouseout events
     *      @container: area add box
     */
    render: function (container) {
        var eventManager = this._eventManager;
        var analyticBoxContainer = CapitalExpense.SVG.renderBackground( this,
            {
                type: CapitalExpense.ClassType.ANALYTIC_BOX,
                container: container,
                //tooltip: this._tooltip,
                click: function (record) {
                    return function () {
                        eventManager.callEvent('onSelectAnalyticBox', [record]);
                    }
                },
                border: {}
            }
        );
        var tooltip = this._tooltip;
        var data = this;

        analyticBoxContainer.call(tooltip);
        analyticBoxContainer.on('mouseover', function () {
            if (!eventManager.callEvent('onCheckHighlightAnalyticBox', [data]) &&
                !eventManager.callEvent('onCheckZoom', [])) {
                if (data.getValue(CapitalExpense.Constants.BOX_TOOLTIP)) {
                    tooltip.show(data);
                }
                data._hover();
            }

        });
        analyticBoxContainer.on('mouseout', function () {
            if (!eventManager.callEvent('onCheckHighlightAnalyticBox', [data])) {
                if (data.getValue(CapitalExpense.Constants.BOX_TOOLTIP)) {
                    tooltip.hide();
                }
                data.resetHover();

            }
        });
        var positionX = this.getValue(CapitalExpense.Constants.POSITION_X) + 3;
        var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + this.getValue(CapitalExpense.Constants.HEIGHT) / 2;
        var textColor =  ColorCalculator.calculateTextColor(this.getValue(CapitalExpense.Constants.BGK_COLOR), AnalyticBox);
        var attr = {
            x: positionX,
            y: positionY,
            'text-anchor': 'middle',
            width: this.getValue(CapitalExpense.Constants.HEIGHT),
            height: this.getValue(CapitalExpense.Constants.WIDTH) / 2,
            color: textColor,
            fill: textColor,
            'transform': 'rotate(-90 ' + positionX +' '+ positionY +')',
            type: CapitalExpense.Constants.AR
        };
        var text = this.getValue(CapitalExpense.Constants.BOX_TITLE) + ' ';
        var percent = this.getValue(CapitalExpense.Constants.VALUE) / this.getValue(CapitalExpense.Constants.TOTAL_VALUE);

        if (percent == 1 ) {
            text += this.getValue(CapitalExpense.Constants.VALUE_FORMATTED);
        } else {
            text += Math.round(percent * 100) + '%';
        }

        CapitalExpense.SVG.renderDynamicText(CapitalExpense.ClassType.ANALYTIC_BOX_TITLE, analyticBoxContainer,
            {
                attr: attr,
                text: text
            },
            true
        );
        var borderGroup = CapitalExpense.SVG.renderContainer(container, CapitalExpense.ClassType.ANALYTIC_BOX_BORDER, 'border_' + this.getValue(CapitalExpense.Constants.BOX_ID));
        CapitalExpense.SVG.renderLine(borderGroup, this._createDataTopBorderBox(this.getValue(CapitalExpense.Constants.POSITION_X)),
            {
                color: AnalyticBox.borderColor,
                width: AnalyticBox.borderWidth
            },
            'top'
        );
        CapitalExpense.SVG.renderLine(borderGroup, this._createDataRightBorderBox(this.getValue(CapitalExpense.Constants.POSITION_X)),
            {
                color: AnalyticBox.borderColor,
                width: AnalyticBox.borderBottomWidth
            },
            'right'
        );
        CapitalExpense.SVG.renderLine(borderGroup, this._createDataBottomBorderBox(this.getValue(CapitalExpense.Constants.POSITION_X)),
            {
                color: AnalyticBox.borderColor,
                width: AnalyticBox.borderWidth
            },
            'bottom'
        );
    },
    /*
     * Move the  box for "Zoom in" event
     */
    zoomIn: function () {
        var analyticBox = this,
            height = MatrixZoomController.config.headerHeight + MatrixZoomController.config.tooltipHeaderHeight,
            totalValue = 0;
        analyticBox.eachBox(function (box) {
            totalValue += Math.abs(parseInt(box.getValue(CapitalExpense.Constants.VALUE)));
        });
        analyticBox.eachBox(function (box) {
            box.show();
            box.reLoadPercent(totalValue, true);
            box.zoomIn(height);
            height +=  box.adjustZoom(height);

            box.highlight(false);
        });
        var scale = this._calculateScale(height);
        analyticBox.scale(scale);
        this._zoomInBkg(scale);
        this._eventManager.callEvent('onResetSelectAnalyticBox', []);
        var selectBox = this._eventManager.callEvent('getSelectBox', []);
        if (selectBox) {
            selectBox.highlight(true);
        }
        return scale;
    },
    /*
     * Move the  box for "Zoom out" event
     */
    zoomOut: function () {
        this.scale(1);
        this._zoomOutBkg();
        this._resetBackgroundHighlight();
        this.eachBox(function (box) {
            box.scale(1);
            box.reLoadPercent();
            box.zoomOut();
        });
    },
    /*
     * Perform highlight/ reset highlight the box in the matrix
     */
    highlight: function () {
        this._tooltip.hide();
        this.switchHighlight();
        if (this.isHighlight()) {
            this._backgroundHighlight();
            this._eventManager.callEvent('onInitZoom', [this]);
        } else {
            this._resetBackgroundHighlight();
            this._hover();
            var tooltip = this._eventManager.callEvent('onZoomInTooltip', []);
            tooltip.remove();
        }
    },
    /*
     * Scale the size of the box
     *      @scale: the value by which to scale the size of the box
     */
    scale: function (scale) {
        this.eachBox(function (box) {
            box.scale(scale);
        });
        CapitalExpense.SVG.scale(this._id, scale, CapitalExpense.Animation.analyticBoxScale);
    },
    /*
     * Show all the elements of box
     */
    show: function () {
        CapitalExpense.SVG.displayView(this._id, 1, CapitalExpense.Animation.analyticBoxZoomOut);
        CapitalExpense.SVG.displayView('#border_' + this.getValue(CapitalExpense.Constants.BOX_ID), 1, CapitalExpense.Animation.analyticBoxZoomOut);

    },
    /*
     * Hide all the elements of box
     */
    hide: function () {
        CapitalExpense.SVG.displayView(this._id, 0, CapitalExpense.Animation.analyticBoxZoomOut);
        CapitalExpense.SVG.displayView('#border_' + this.getValue(CapitalExpense.Constants.BOX_ID), 0, CapitalExpense.Animation.analyticBoxZoomOut);

    },
    /*
     * Move the  box for "Collapse" event
     */
    shift: function (positionX) {
        var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + this.getValue(CapitalExpense.Constants.HEIGHT) / 2 ;
        var positionBackground = positionX;
        if (this._eventManager.callEvent('onCheckHighlightAnalyticBox', [this])) {
            positionBackground = positionX;
            positionX += this.getColumnIndex() * this.getValue(CapitalExpense.Constants.WIDTH);
        }
        this._transitionView(800,
            {
                x: positionBackground
            },
            {
                x: positionX + 3,
                'transform': 'rotate(-90 ' + (positionX + 3) +' '+ positionY +')'
            }
        );
        CapitalExpense.SVG.transitionLine(this.getValue(CapitalExpense.Constants.BOX_ID), 'top', 800, this._createDataTopBorderBox(positionX));
        CapitalExpense.SVG.transitionLine(this.getValue(CapitalExpense.Constants.BOX_ID), 'right', 800, this._createDataRightBorderBox(positionX));
        CapitalExpense.SVG.transitionLine(this.getValue(CapitalExpense.Constants.BOX_ID), 'bottom', 800, this._createDataBottomBorderBox(positionX));
    },
    /*
     * Resize the size of the box height relative to the overall size of the matrix
     */
    resize: function () {
        var text = this.getValue(CapitalExpense.Constants.BOX_TITLE) + ' ';
        var percent = this.getValue(CapitalExpense.Constants.VALUE) / this.getValue(CapitalExpense.Constants.TOTAL_VALUE);

        if (percent == 1 ) {
            text += this.getValue(CapitalExpense.Constants.VALUE_FORMATTED);
        } else {
            text += Math.round(percent * 100) + '%';
        }
        this._eventManager.callEvent('calculatePosition', []);
        var positionX = this._eventManager.callEvent('getColumnPosition', [this._columnIndex]) + this.getValue(CapitalExpense.Constants.WIDTH) * this._columnAnalyticIndex;
        var positionY =  this.getValue(CapitalExpense.Constants.POSITION_Y) + this.getValue(CapitalExpense.Constants.HEIGHT) / 2 ;
        this._transitionView(0,
            {
                y: this.getValue(CapitalExpense.Constants.POSITION_Y),
                height: this.getValue(CapitalExpense.Constants.HEIGHT)
            },
            {
                x: positionX + 3,
                y: positionY,
                'transform': 'rotate(-90 ' + (positionX + 3) +' '+ positionY +')',
                height: this.getValue(CapitalExpense.Constants.WIDTH),
                width: this.getValue(CapitalExpense.Constants.HEIGHT) - 10,
                text: text,
                type: CapitalExpense.Constants.AR
            }
        );
        if (this._eventManager.callEvent('onCheckZoom', [this])) {
            //MatrixZoomController.config.headerHeight
        }
        CapitalExpense.SVG.transitionLine(this.getValue(CapitalExpense.Constants.BOX_ID), 'top', 0, this._createDataTopBorderBox(positionX));
        CapitalExpense.SVG.transitionLine(this.getValue(CapitalExpense.Constants.BOX_ID), 'right', 0, this._createDataRightBorderBox(positionX));
        CapitalExpense.SVG.transitionLine(this.getValue(CapitalExpense.Constants.BOX_ID), 'bottom', 0, this._createDataBottomBorderBox(positionX));
    },
    /*
     * Reset highlight category and highlight boxes
     */
    resetHover: function () {
        d3.select(this._id).select('rect').attr({
            fill: CapitalExpense.Tools.formatColor(this),
            opacity: 1
        });

        this.eachBox(function (box) {
            d3.select('#' + box.getID()).select('.fill').attr({
                opacity: 1
            });
        });
    },
    /*
     * Create data for top border box
     */
    _createDataTopBorderBox: function (startPositionX) {
        var data = [];
        var positionX = startPositionX + this.getValue(CapitalExpense.Constants.WIDTH) * AnalyticBox.borderStart;
        var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y);
        data[data.length] = {x: positionX, y: positionY};
        positionX = startPositionX + this.getValue(CapitalExpense.Constants.WIDTH) - AnalyticBox.borderBottomWidth + AnalyticBox.borderWidth;
        data[data.length] = {x: positionX, y: positionY};
        return data;
    },
    /*
     * Create data for right border box
     */
    _createDataRightBorderBox: function (startPositionX) {
        var data = [];
        var positionX = startPositionX + this.getValue(CapitalExpense.Constants.WIDTH) - AnalyticBox.borderBottomWidth;
        var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y);
        data[data.length] = {x: positionX, y: positionY};
        positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + this.getValue(CapitalExpense.Constants.HEIGHT);
        data[data.length] = {x: positionX, y: positionY};
        return data;
    },
    /*
     * Create data for bottom border box
     */
    _createDataBottomBorderBox: function (startPositionX) {
        var data = [];
        var positionX = startPositionX + this.getValue(CapitalExpense.Constants.WIDTH) - AnalyticBox.borderBottomWidth + AnalyticBox.borderWidth;
        var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + this.getValue(CapitalExpense.Constants.HEIGHT);
        data[data.length] = {x: positionX  , y: positionY};
        positionX = startPositionX + this.getValue(CapitalExpense.Constants.WIDTH) * AnalyticBox.borderStart;
        data[data.length] = {x: positionX, y: positionY};
        return data;
    },
    /*
     * Perform the transposition of view box
     */
    _transitionView: function (duration, backgroundConfig, titleConfig) {
        var id = this._id;
        backgroundConfig['duration'] = duration;

        CapitalExpense.SVG.transitionBackground(id, backgroundConfig);
        if (titleConfig) {
            titleConfig['duration'] = duration;
            CapitalExpense.SVG.transitionDynamicText(id, CapitalExpense.ClassType.ANALYTIC_BOX_TITLE, titleConfig, titleConfig.isRender);
        }
    },
    /*
     *   Find column index in analytic column
     */
    _findColumnIndex: function () {
        if (this._dataBoxes.length == 0) {
            return null;
        }
        var box = this._dataBoxes[0];
        var idAnalyticBox = this.getValue(CapitalExpense.Constants.BOX_ID);
        if (box.getValue(CapitalExpense.Constants.AR01) == idAnalyticBox) {
            return 0;
        }
        if (box.getValue(CapitalExpense.Constants.AR02) == idAnalyticBox) {
            return 1;
        }
        if (box.getValue(CapitalExpense.Constants.AR03) == idAnalyticBox) {
            return 2;
        }
        if (box.getValue(CapitalExpense.Constants.AR04) == idAnalyticBox) {
            return 3;
        }
        if (box.getValue(CapitalExpense.Constants.AR05) == idAnalyticBox) {
            return 4;
        }
    },
    /*
     * Render tooltip the box
     */
    _renderTooltip: function (data) {
        var width = ColumnData.columnWidth;
        var html = '<div style="width: '+ width +'px">'
            + '<div>'
            + 	'<div class="capitalExpenseMatrixBoxTooltipValue">' + data.getValue(CapitalExpense.Constants.VALUE_FORMATTED) + '</div>'
            + '</div>'
            + '<div style="text-align:left; float: left;">'
            + 	'<div class="capitalExpenseMatrixBoxTooltipTitle">' + data.getValue(CapitalExpense.Constants.BOX_TITLE) + '</div>'
            + 	'<div class="capitalExpenseMatrixBoxTooltipText">' + data.getValue('finanal_matrix.box_tooltip') + '</div>'
            + '</div>'
            + '</div>';
        return html;
    },
    /*
     * Perform highlighting of the background of the category box
	 * and boxes are included in the category
	 */
    _backgroundHighlight: function () {
        var width = this.getValue(CapitalExpense.Constants.WIDTH) * (this.getColumnIndex() + 1);
        width = width == 0 ? this.getValue(CapitalExpense.Constants.WIDTH) : width;
        this._eventManager.callEvent('calculatePosition', []);
        var positionX =  this._eventManager.callEvent('getColumnPosition', [this.getAnalyticColumnIndex()]);
        d3.select(this._id).select('rect').transition().duration(0).attr({
            x: positionX,
            y: this.getValue(CapitalExpense.Constants.POSITION_Y),
            width: width-3,
            height:  this.getValue(CapitalExpense.Constants.HEIGHT),
            stroke:  AnalyticBox.borderColor,
            'stroke-width':  AnalyticBox.borderWidth,
            fill: AnalyticBox.colorByClicking,
            opacity: 1
        });
        this.eachBox( function (box) {
            box.highlight(true);
        })
    },
    /*
     * Perform reset highlighting of the background of the category box
	 * and boxes are included in the category
	 */
    _resetBackgroundHighlight: function () {
        var width = this.getValue(CapitalExpense.Constants.WIDTH) * this.getColumnIndex();
        this._eventManager.callEvent('calculatePosition', []);
        var positionX =  this._eventManager.callEvent('getColumnPosition', [this.getAnalyticColumnIndex()]) + width;
        d3.select(this._id).select('rect').transition().duration(0).attr({
            x: positionX,
            y: this.getValue(CapitalExpense.Constants.POSITION_Y),
            width: this.getValue(CapitalExpense.Constants.WIDTH),
            height: this.getValue(CapitalExpense.Constants.HEIGHT),
            stroke: 'none'
        });
        this.eachBox( function (box) {
            box.highlight(false);
        });
        var selectBox = this._eventManager.callEvent('getSelectBox', []);
        if (selectBox) {
            selectBox.highlight(true);
        }
    },
    /*
     * Hover the category box and the boxes included in the category
     */
    _hover: function () {
        d3.select(this._id).select('rect').attr({
            fill: '#f0f8ff',
            opacity: 0.5
        });
        this.eachBox(function (box) {
            d3.select('#' + box.getID()).select('.fill').attr({
                opacity: 0.5
            });
        });
    },
    /*
     * Calculate the value of the scaling
     *  @heightBoxes: total height boxes
     */
    _calculateScale: function (heightBoxes) {
        var heightView = this._eventManager.callEvent('getConfig', []).height;
        var scale = heightView / (heightBoxes);
        if (scale > 1.2) {
            scale = 1.2;
        }
        return scale;
    },
    /*
     * Perform a formation header the category for an "Zoom in" event 
	 *  @scale: the value of the scaling	
	 */
    _zoomInBkg: function (scale) {
        this._transitionView(CapitalExpense.Animation.analyticBoxZoomIn,
            {
                x: 0,
                y: 0,
                fill: CapitalExpense.Tools.formatColor(this),
                height: MatrixZoomController.config.headerHeight,
                width: (ColumnData.columnWidth  -  RollUp.getWidth())
            }
        );
        d3.select(this._id)
            .select('rect')
            .style('cursor','auto');
        d3.select(this._id)
            .select('.' + CapitalExpense.ClassType.ANALYTIC_BOX_TITLE)
            .select('text')
            .text(this.getValue(CapitalExpense.Constants.BOX_TITLE).toUpperCase());
        d3.select(this._id)
            .select('.' + CapitalExpense.ClassType.ANALYTIC_BOX_TITLE)
            .select('text')
            .transition().duration(800)
            .attr({
                'text-anchor': 'start',
                y: MatrixZoomController.config.headerHeight / 2,
                x: 10,
                transform: 'rotate(0 ' + 0 +' '+ MatrixZoomController.config.headerHeight / 2 +' )'
            })
            .style({
                'font-weight': 'bold',
                'font-size': '16px'
            });
        d3.select(this._id)
            .select('.' + CapitalExpense.ClassType.ANALYTIC_BOX_TITLE)
            .select('text')
            .call(CapitalExpense.Tools.wrapFullText, {
                width: (ColumnData.columnWidth  -  RollUp.getWidth()) - 5,
                height: 50,
                y: MatrixZoomController.config.headerHeight / 2,
                x: 10
            });
        var textColor =  ColorCalculator.calculateTextColor(this.getValue(CapitalExpense.Constants.BGK_COLOR), AnalyticBox);
        var positionX = 10;
        var positionY = 30;
        var attr = {
            x: positionX,
            y: positionY,
            'text-anchor': 'start',
            width: 100,
            height: 50,
            color: textColor,
            fill: textColor,
            'font-size': '18px',
            'font-weight': 'bold'
        };
        CapitalExpense.SVG.renderStaticText(CapitalExpense.ClassType.ANALYTIC_BOX_VALUE, d3.select(this._id),
            {
                data: [this], attr: attr,
                function: function (data) {
                    return data.getValue(CapitalExpense.Constants.VALUE_FORMATTED);
                },
                delay: 650
            },
            true
        );
        d3.select('#' + CapitalExpense.ClassType.BACKGROUND).attr({
            width: (ColumnData.columnWidth  -  RollUp.getWidth()) * scale,
            height: this._eventManager.callEvent('getConfig', []).height,
            fill: CapitalExpense.Tools.formatColor(this),
            display: 'block'
        });
    },
    /*
     * Perform a formation header the category for an "Zoom out" event 
	 */
    _zoomOutBkg: function () {
        d3.select(this._id)
            .select('rect')
            .style('cursor', 'pointer');
        d3.select(this._id).select('.' + CapitalExpense.ClassType.ANALYTIC_BOX_VALUE).remove();
        this._eventManager.callEvent('calculatePosition', []);
        var positionX = this._eventManager.callEvent('getColumnPosition', [this.getAnalyticColumnIndex()]) + this.getColumnIndex() * this.getValue(CapitalExpense.Constants.WIDTH);
        var text = this.getValue(CapitalExpense.Constants.BOX_TITLE) + ' ';
        var percent = this.getValue(CapitalExpense.Constants.VALUE) / this.getValue(CapitalExpense.Constants.TOTAL_VALUE);
        if (percent == 1 ) {
            text += this.getValue(CapitalExpense.Constants.VALUE_FORMATTED);
        } else {
            text += Math.round(percent * 100) + '%';
        }
        var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + this.getValue(CapitalExpense.Constants.HEIGHT) / 2;
        d3.select(this._id)
            .select('.' + CapitalExpense.ClassType.ANALYTIC_BOX_TITLE)
            .select('text')
            .text(text);
        d3.select(this._id)
            .select('.' + CapitalExpense.ClassType.ANALYTIC_BOX_TITLE)
            .select('text')
            .transition().duration(800)
            .attr({
                'text-anchor': 'middle',
                y: positionY,
                x: positionX + 3,
                transform: 'rotate(-90 ' + (positionX + 3) +' '+ positionY +' )'
            }).style({
                'font-weight': 'normal',
                'font-size': '13px'
            });
        d3.select(this._id).select('.' + CapitalExpense.ClassType.ANALYTIC_BOX_TITLE).select('text').call(CapitalExpense.Tools.wrap, {
            width: this.getValue(CapitalExpense.Constants.HEIGHT),
            height: this.getValue(CapitalExpense.Constants.WIDTH) / 2,
            y: positionY,
            x: positionX + 3
        });
        d3.select('#' + CapitalExpense.ClassType.BACKGROUND).attr({
            display: 'none'
        });
    }
},
    {

        textColorDark: '#000000',
        textColorLight: '#ffffff',
        borderOfDarkAndLigthColor: '#6ec49a',
        borderColor: '#ffffff',
        borderBottomWidth: 2,
        borderWidth: 1,
        borderStart: 0.4,
        colorByClicking: '#ea7500'
    }
);