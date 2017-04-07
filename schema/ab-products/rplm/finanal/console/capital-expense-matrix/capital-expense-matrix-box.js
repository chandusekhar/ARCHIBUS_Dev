/*
  * Defines a box displayed in the Capital or Expense column.
  * Provides an API to show, hide, resize, zoom in, zoom out, adjust, shift, and highlight a box.
  */
var Box = Base.extend({
    _viewId: null,
    _data: null,
    _tooltip: null,
    _columnIndex: -1,
    _eventManager: null,
    _highlight: false,
    _isDisplayFullText: true,
    _currentPercent: null,
    /*
     * Constructor
     * 	@record: box information
     *  @columnIndex: the index of the column in which the element is located
     *  @eventManager: event manager
     */
    constructor: function (record, columnIndex, eventManager) {

        if (record) {
            this._data = record;
            var isCreate = d3.select('#tooltip_' + this.getValue(CapitalExpense.Constants.BOX_ID)).node();
            if (isCreate != null) {
                d3.select('#tooltip_' + this.getValue(CapitalExpense.Constants.BOX_ID)).remove();
            }
            this._tooltip = this._initTooltip();

            this._viewId = '#' + this.getValue(CapitalExpense.Constants.BOX_ID);
        }

        this._columnIndex = columnIndex;
        this._eventManager = eventManager;
        this._highlight = false;
        this._isDisplayFullText = false;
    },
    /*
     * Get ID the box in matrix
     */
    getID: function () {
        return this.getValue(CapitalExpense.Constants.BOX_ID);
    },
    /*
     * Check the highlighting the box in the matrix
     */
    isHighlight: function () {
        return this._highlight;
    },
    /*
     * Set flag to display the full title box
     *   TRUE: display the full text
     *   FALSE: not displayed fully text
     */
    displayFullText: function (flag) {
        this._isDisplayFullText = flag;
    },
    /*
     * Check the display the full title text of the box
     */
    isDisplayFullText: function () {
        return this._isDisplayFullText;
    },
    /*
     * Get database data for matrix element
     */
    getRecord: function () {
        return this._data;
    },
    /*
     * Get a database field from database data the matrix element
     *  @field: field of the box
     */
    getValue: function (field) {
        return this._data.getValue(field);
    },
    /*
     * Set a database field from database data the matrix element
     *  @field: field of the box
     *  @value: value
     */
    setValue: function (field, value) {
        this._data.setValue(field, value);
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
     * Perform the render box.
     * Is drawing the background, header, value and percent of boxing.
     * Initialized the click, mouseover and mouseout events
     *      @container: area add box
     */
    render: function (container) {
        var eventManager = this._eventManager;
        var boxContainer = CapitalExpense.SVG.renderBackground(this,
            {
                type: CapitalExpense.Constants.BO,
                container: container,
                click: function (record) {
                    return function () {
                        eventManager.callEvent('onSelectBox', [record]);
                    }
                },
                border: {
                    color: '#ffffff',
                    size: '1px'
                }
            }
        );
        var data = this;
        boxContainer.call(this._tooltip);
        boxContainer.on ('mouseover', function () {
            if (!data.callEvent('onCheckZoomBox', [data])) {
                if (!data.isDisplayFullText()) {
                    data.adjustHover();
                }

            } else {


            }
            d3.select('#' + data.getID()).select('.fill').attr({
                opacity: 0.5,
                'cursor': ' pointer'
            });

            data._tooltip.show(data);
        });
        boxContainer.on ('mouseout', function () {
            data._tooltip.hide();
            d3.select('#' + data.getID()).select('.fill').attr({
                opacity: 1
            });
            if (!data.callEvent('onCheckZoomBox', [data])) {
                if (!data.isDisplayFullText()) {
                    data.reAdjustHover();
                }
            }

        });
        var textColor =  ColorCalculator.calculateTextColor(this.getValue(CapitalExpense.Constants.BGK_COLOR), Box);
        var attr = {
            x: this.getValue(CapitalExpense.Constants.POSITION_X) +  this.getValue(CapitalExpense.Constants.WIDTH) - 10 ,
            'text-anchor': 'end',
            width: 150,
            height: this.getValue(CapitalExpense.Constants.HEIGHT),
            color: textColor,
            fill: textColor,
            type: 'Box',
            box: this
        };
        this._renderTitle(boxContainer, attr);
        this._renderValue(boxContainer, attr);
        this._renderPercent(boxContainer, attr);
    },
    /*
     * Show all the elements of box
     */
    show: function () {
        CapitalExpense.SVG.displayView(this._viewId, 1, CapitalExpense.Animation.boxShow);
    },
    /*
     * Hide all the elements of box
     */
    hide: function () {
        CapitalExpense.SVG.displayView(this._viewId, 0, CapitalExpense.Animation.boxHide);
    },
    /*
     * Perform a redraw of percentages value in box
     *       @totalValue: the total value of the category/column
     */
    reLoadPercent: function (totalValue) {
        var value = Math.abs(parseInt(this.getValue(CapitalExpense.Constants.VALUE)));
        var percent  = (value / Math.abs(totalValue)) * 100;
        if (!totalValue) {
            percent = this.getValue(CapitalExpense.Constants.BOX_PERCENT);
        }
        //var text = percent + '%';
        var persentText = '';
        var positionX = 0;
        var positionY = 0;
        if (percent > 0) {
            positionX = this.getValue(CapitalExpense.Constants.POSITION_X) + 50;
            positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + 25;
            persentText = Math.round(percent) + '%';
            if (percent < Box.minPersent) {
                positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + 20;
                persentText = '<' +  Box.minPersent + '%';
            }
        } else {
            positionX = this.getValue(CapitalExpense.Constants.POSITION_X) + 30;
            positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + 20;
            persentText = '-';
        }
        d3.select('#' + this.getValue(CapitalExpense.Constants.BOX_ID))
            .select('.' + CapitalExpense.ClassType.BOX_PERCENT)
            .select('text')
            .text(persentText);
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.BOX_PERCENT)
            .select('text')
        /*.attr({
         x: positionX,
         y: positionY
         })*/.style({
                'font-size': '22px',
                'font-weight': 'bold'
            });
        if (percent > 0 && percent <  Box.minPersent) {
            d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_PERCENT).select('text')/*.attr({
                y: this.getValue(CapitalExpense.Constants.POSITION_Y) + 20
            })*/.style({
                'font-size': '14px',
                'font-weight': 'normal'
            });
        }
        this._currentPercent = percent;

    },
    /*
     * Perform adjust the height of the box to zoom in
     */
    adjustZoom: function (positionY) {
        var nextPositionY;
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.BOX_TITLE)
            .select('text')
            .text(this.getValue(CapitalExpense.Constants.BOX_TITLE));
        d3.select(this._viewId)
            .select('.'  + CapitalExpense.ClassType.BOX_TITLE)
            .select('text')
            .call(CapitalExpense.Tools.wrapFullText, {
                width: 100,
                height: 200,
                y: this.getValue(CapitalExpense.Constants.POSITION_Y),
                x: this.getValue(CapitalExpense.Constants.POSITION_X) + 220
            });
        var heightText = 0;
        var nodes = d3.select(this._viewId).select('.'  + CapitalExpense.ClassType.BOX_TITLE).select('text').selectAll('tspan')[0];
        for (var i = 0; i < nodes.length; i++) {
            heightText += 25;
        }
        var heightBox = this.getValue(CapitalExpense.Constants.HEIGHT);
        if (heightBox < heightText) {
            var currentHeightRect = heightText + 10;
            d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_RECT).attr('height', currentHeightRect);
            d3.select(this._viewId).select('.background').select('rect').attr('height', currentHeightRect);
            nextPositionY = currentHeightRect;
        } else {
            nextPositionY = heightBox;
        }
        d3.select(this._viewId)
            .select('.'  + CapitalExpense.ClassType.BOX_TITLE)
            .select('text')
            .text(this.getValue(CapitalExpense.Constants.BOX_TITLE));
        d3.select(this._viewId)
            .select('.'  + CapitalExpense.ClassType.BOX_TITLE)
            .select('text')
            .call(CapitalExpense.Tools.wrapFullText, {
                width: 100,
                height: 200,
                y: positionY + 3,
                x: 220
            });
        return nextPositionY;
    },
    /*
     * Perform adjust the height of the box to hover
     */
    adjustHover: function () {
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.BOX_TITLE)
            .select('text')
            .text(this.getValue(CapitalExpense.Constants.BOX_TITLE));
        d3.select(this._viewId)
            .select('.'  + CapitalExpense.ClassType.BOX_TITLE)
            .select('text')
            .call(CapitalExpense.Tools.wrapFullText, {
                width: 100,
                height: 200,
                y: this.getValue(CapitalExpense.Constants.POSITION_Y),
                x: this.getValue(CapitalExpense.Constants.POSITION_X) + 220,
                box: this
            });
        var heightText = 0;
        var nodes = d3.select(this._viewId).select('.'  + CapitalExpense.ClassType.BOX_TITLE).select('text').selectAll('tspan')[0];
        for (var i = 0; i < nodes.length; i++) {
            heightText += 20;
        }
        heightText += 5;
        this._eventManager.callEvent('calculatePosition', []);
        var positionX = this._eventManager.callEvent('getColumnPosition', [this._columnIndex]) + RollUp.getWidth();
        var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + (this.getValue(CapitalExpense.Constants.HEIGHT) - heightText);
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.BOX_TITLE)
            .select('text')
            .text(this.getValue(CapitalExpense.Constants.BOX_TITLE));
        d3.select(this._viewId)
            .select('.'  + CapitalExpense.ClassType.BOX_TITLE)
            .select('text')
            .call(CapitalExpense.Tools.wrapFullText, {
                width: 100,
                height: 200,
                y: positionY,
                x: positionX + 220,
                box: this
            });
        d3.select(this._viewId).select('.background').select('rect').attr({
            height: heightText,
            y: positionY
        });
        d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_VALUE).select('text').attr({
            y: positionY + 20
        });
        var persent = this.getValue(CapitalExpense.Constants.BOX_PERCENT);
        if (persent > 0) {
            if (persent < Box.minPersent) {
                d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_PERCENT).select('text').attr({
                    y: positionY + 20
                });
            } else {
                d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_PERCENT).select('text').attr({
                    y: positionY + 25
                });
            }
        } else {
            d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_PERCENT).select('text').attr({
                x: positionX + 30,
                y: positionY + 20

            });
        }
        d3.select(this._viewId).select('.fill').attr({
            height: heightText,
            y: positionY,
            opacity: 0.5
        });
    },
    reAdjustHover: function () {
        this._eventManager.callEvent('calculatePosition', []);
        var positionX = this._eventManager.callEvent('getColumnPosition', [this._columnIndex]) + RollUp.getWidth();
        var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y);
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.BOX_TITLE)
            .select('text')
            .text(this.getValue(CapitalExpense.Constants.BOX_TITLE));
        d3.select(this._viewId)
            .select('.'  + CapitalExpense.ClassType.BOX_TITLE)
            .select('text')
            .call(CapitalExpense.Tools.wrap, {
                x: positionX + 220,
                y: positionY + 2,
                width: 100,
                height: this.getValue(CapitalExpense.Constants.HEIGHT),
                text: this.getValue(CapitalExpense.Constants.BOX_TITLE),
                isRender: true
            });
        d3.select(this._viewId).select('.fill').attr({
            height: this.getValue(CapitalExpense.Constants.HEIGHT),
            y: positionY
        });
        d3.select(this._viewId).select('.background').select('rect').attr({
            height: this.getValue(CapitalExpense.Constants.HEIGHT),
            y: positionY
        });
        var persent = this.getValue(CapitalExpense.Constants.BOX_PERCENT);
        if (persent > 0) {
            if (persent < Box.minPersent) {
                d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_PERCENT).select('text').attr({
                    y: positionY + 20
                });
            } else {
                d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_PERCENT).select('text').attr({
                    y: positionY + 25
                });
            }
        } else {
            d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_PERCENT).select('text').attr({
                x: positionX + 30,
                y: positionY + 20

            });
        }
        d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_VALUE).select('text').attr({
            y: positionY + 20
        });
    },
    /*
     * Perform highlight/ reset highlight the box in the matrix or set the highlight on flag
     *      @flag: TRUE - highlight, FALSE - reset highlight
     */
    highlight: function (flag) {
        if (flag === undefined) {
            this.switchHighlight();
        } else {
            this._highlight = flag;
        }

        var backgroundColor = this._highlight ? Box.colorByClicking : CapitalExpense.Tools.formatColor(this);
        d3.select(this._viewId).select('.fill').attr({
            fill:backgroundColor,
            opacity: 1
        });
    },
    /*
     * Move the  box for "Zoom in" event
     *      @positionY: the position of the box in the matrix
     */
    zoomIn: function (positionY) {
        this._transitionView(CapitalExpense.Animation.boxZoomIn,
            {
                x: 0,
                y: positionY
            },
            {
                x: 220,
                y: positionY + 20
            },
            {
                x: 115,
                y: positionY + 20
            },
            {
                x: 0,
                y: positionY
            }
        );
    },
    /*
     * Move the  box for "Zoom out" event
     */
    zoomOut: function () {
        this._eventManager.callEvent('calculatePosition', []);
        var positionX = this._eventManager.callEvent('getColumnPosition', [this._columnIndex]) + RollUp.getWidth();
        var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y);
        var height = this.getValue(CapitalExpense.Constants.HEIGHT);
        this._transitionView(CapitalExpense.Animation.boxZoomOut,
            {
                x: positionX,
                y: positionY,
                height: height
            },
            {
                x: positionX + 220,
                y: positionY + 2,
                width: 100,
                height: height,
                text: this.getValue(CapitalExpense.Constants.BOX_TITLE),
                isRender: true
            },
            {
                x: positionX + 110,
                y: positionY + 20
            },
            {
                x: positionX,
                y: positionY
            }
        );
    },
    /*
     * Scale the size of the box
     *      @scale: the value by which to scale the size of the box
     */
    scale: function (scale) {
        CapitalExpense.SVG.scale(this._viewId, scale, CapitalExpense.Animation.boxScale);
    },
    /*
     * Resize the size of the box height relative to the overall size of the matrix
     */
    resize: function () {
        this._eventManager.callEvent('calculatePosition', []);
        var positionX = this._eventManager.callEvent('getColumnPosition', [this._columnIndex]) + RollUp.getWidth();
        if (!this._eventManager.callEvent('onCheckZoom', [])) {
            this._transitionView(0,
                {
                    y: this.getValue(CapitalExpense.Constants.POSITION_Y),
                    height: this.getValue(CapitalExpense.Constants.HEIGHT)
                },
                {
                    x: positionX + 220,
                    y: this.getValue(CapitalExpense.Constants.POSITION_Y) + 2,
                    height: this.getValue(CapitalExpense.Constants.HEIGHT),
                    width: 100,
                    text: this.getValue(CapitalExpense.Constants.BOX_TITLE),
                    type: CapitalExpense.Constants.BO,
                    box: this
                },
                {
                    y: this.getValue(CapitalExpense.Constants.POSITION_Y) + 20
                },
                {
                    x: positionX,
                    y: this.getValue(CapitalExpense.Constants.POSITION_Y)
                },
                {
                    height: '75%'
                }
            );
        }

    },
    /*
     * Move the  box for "Collapse" event
     */
    shift: function (positionX, positionY) {
        /*this._eventManager.callEvent('calculatePosition', []);
        var positionX = this._eventManager.callEvent('getColumnPosition', [this._columnIndex]) + RollUp.getWidth();*/
        this._transitionView(800,
            {
                x: positionX
            },
            {
                x: positionX + this.getValue(CapitalExpense.Constants.WIDTH) - 10
            },
            {
                x: positionX + 110
            },
            {
                x: positionX,
                y: this.getValue(CapitalExpense.Constants.POSITION_Y)
            }
        );
    },
    /*
     * Perform the transposition of view box
     */
    _transitionView: function (duration, backgroundConfig, titleConfig, valueConfig, percentConfig, titleStyle) {
        backgroundConfig['duration'] = duration;
        titleConfig['duration'] = duration;
        valueConfig['duration'] = duration;
        percentConfig['duration'] = duration;
        d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_RECT).transition().duration(duration).attr(backgroundConfig);
        d3.select(this._viewId).select('.background').select('rect').transition().duration(duration).attr(backgroundConfig);

        CapitalExpense.SVG.transitionDynamicText(this._viewId, CapitalExpense.ClassType.BOX_TITLE, titleConfig, titleConfig.isRender);
        CapitalExpense.SVG.transitionStaticText(this._viewId, CapitalExpense.ClassType.BOX_VALUE, valueConfig);


        var persent = this._currentPercent;
        if (persent > 0) {
            percentConfig['x'] = percentConfig['x'] + 50;
            percentConfig['y'] = percentConfig['y'] + 25;
            if (persent < Box.minPersent) {
                percentConfig['y'] = percentConfig['y'] - 5;
            }

        } else {
            percentConfig['x'] = percentConfig['x'] + 30;
            percentConfig['y'] = percentConfig['y'] + 20;
        }
        CapitalExpense.SVG.transitionStaticText(this._viewId, CapitalExpense.ClassType.BOX_PERCENT, percentConfig);
    },
    /*
     * Call event
     *  @eventName: the name of the events
     *  @fields: variables functions
     */
    callEvent: function (eventName, fields) {
        return this._eventManager.callEvent(eventName, fields);
    },
    /*
     * Render title the box
     */
    _renderTitle: function (boxContainer, attr) {
        attr['width'] = 100;
        attr['x'] = this.getValue(CapitalExpense.Constants.POSITION_X) + 220 ;
        attr['y'] = this.getValue(CapitalExpense.Constants.POSITION_Y) + 2;
        CapitalExpense.SVG.renderDynamicText(CapitalExpense.ClassType.BOX_TITLE, boxContainer,
            {
                attr: attr,
                text: this.getValue(CapitalExpense.Constants.BOX_TITLE)
            },
            true
        );
        attr['x'] = attr.x - attr.width;

    },
    /*
     * Render value the box
     */
    _renderValue: function (boxContainer, attr) {
        attr['x'] = this.getValue(CapitalExpense.Constants.POSITION_X) + 110;
        attr['y'] = this.getValue(CapitalExpense.Constants.POSITION_Y) + 20;
        CapitalExpense.SVG.renderStaticText(CapitalExpense.ClassType.BOX_VALUE, boxContainer,
            {
                data: [this._data], attr: attr,
                function: function (data) {
                    return data.getValue(CapitalExpense.Constants.VALUE_FORMATTED);
                }
            },
            true
        );
        var fontSize = 14;
        if (this.getValue(CapitalExpense.Constants.BOX_PERCENT)) {
            while(true) {
                var valueLength = d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_VALUE).select('text').node().getComputedTextLength();
                if (valueLength > 50) {
                    fontSize--;
                    attr['font-size'] = fontSize;
                    d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_VALUE).select('text').remove();
                    d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_VALUE).append('text').attr(attr).text(this.getValue(CapitalExpense.Constants.VALUE_FORMATTED));
                } else {
                    break;
                }
            }
        }


    },
    /*
     * Render percent the box
     */
    _renderPercent: function (boxContainer, attr) {
        attr['font-size'] = 22;
        var percent = this.getValue(CapitalExpense.Constants.BOX_PERCENT);
        var renderFunction;
        if (percent > 0) {
            attr['x'] = this.getValue(CapitalExpense.Constants.POSITION_X) + 50;
            attr['y'] = this.getValue(CapitalExpense.Constants.POSITION_Y) + 25;
            renderFunction = function (data) {
                var percent = data.getValue(CapitalExpense.Constants.BOX_PERCENT);
                if (percent < Box.minPersent) {
                    return '<' + Box.minPersent +'%';
                }
                return Math.round(data.getValue(CapitalExpense.Constants.BOX_PERCENT)) + '%';
            };

        } else {
            attr['x'] = this.getValue(CapitalExpense.Constants.POSITION_X) + 30;
            attr['y'] = this.getValue(CapitalExpense.Constants.POSITION_Y) + 20;
            renderFunction = function (data) {
                return '-';
            };
        }
        CapitalExpense.SVG.renderStaticText(CapitalExpense.ClassType.BOX_PERCENT, boxContainer,
            {
                data: [this._data],
                attr: attr,
                function: renderFunction
            },
            true
        );
        if (percent > 0 && percent < Box.minPersent) {
            d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_PERCENT).select('text').attr({
                y: this.getValue(CapitalExpense.Constants.POSITION_Y) + 20
            }).style({
                'font-size': '14px',
                'font-weight': 'normal'
            });
        }
        var fontSize = 22;
        while(true) {
            var valueLength = d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_PERCENT).select('text').node().getComputedTextLength();
            if (valueLength > 50) {
                fontSize--;
                attr['font-size'] = fontSize;
                d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_PERCENT).select('text').remove();
                d3.select(this._viewId).select('.' + CapitalExpense.ClassType.BOX_PERCENT).append('text').attr(attr).text(this.getValue(CapitalExpense.Constants.VALUE_FORMATTED));
            } else {
                break;
            }
        }
        this._currentPercent = percent;
    },
    /*
     * Create the tooltip object
     */
    _initTooltip: function () {
        return d3.tip()
            .direction(function (data) {
                return 'n';
            })
            .offset(function (data) {
                return [0, 0];
            })
            .attr('class', function (data) {
                return 'capitalExpenseMatrixBoxTooltip';
            })
            .attr('id', 'tooltip_' + this.getValue(CapitalExpense.Constants.BOX_ID))

            .html(this._renderTooltip);
    },
    /*
     * Render tooltip the box
     */
    _renderTooltip: function (data) {
        var width = data.getValue(CapitalExpense.Constants.WIDTH) + 50; // KB 3052937
        var value = data.getValue(CapitalExpense.Constants.VALUE_FORMATTED);
        if (data.callEvent('isSwitchMenu', [data])) {
            value = data.getValue(CapitalExpense.Constants.VALUE_MARKER_FORMATTED);
        }
        var percent = data._currentPercent;
        if (percent > 0) {
            if (percent < Box.minPersent) {
                percent = '<' + Box.minPersent + '%';
            } else {
                percent =  Math.round(percent) + '%';
            }
        } else {
            percent = '';
        }
        var html = '<div style="width: '+ width +'px">'
            + '<div  style="text-align:  center">'
            + 	'<div class="capitalExpenseMatrixBoxTooltipPercent">' + percent + '</div>'
            + 	'<div class="capitalExpenseMatrixBoxTooltipValue">' + value + '</div>'
            + '</div>'
            + '<div style="text-align:left; float: left;">'
            + 	'<div class="capitalExpenseMatrixBoxTooltipTitle">' + data.getValue(CapitalExpense.Constants.BOX_TITLE) + '</div>'
            + 	'<div class="capitalExpenseMatrixBoxTooltipText">' +  data.getValue('finanal_matrix.box_tooltip') + '</div>'
            + '</div>'
            + '</div>';
        return html;
    }
},{
    textColorDark: '#000000',
    textColorLight: '#ffffff',
    borderOfDarkAndLigthColor: '#6ec49a',
    colorByClicking: '#ea7500',
    minHeight: 25,
    minPersent: 1
});