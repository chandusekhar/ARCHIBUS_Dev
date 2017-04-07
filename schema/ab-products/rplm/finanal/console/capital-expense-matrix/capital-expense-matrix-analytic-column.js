/*
 * The analytical column is designed to display the financial categories.
 * Provides an API to show, hide, resize, collapse, expand, shift, and a column.
 */
var AnalyticColumn = ColumnBase.extend({
    _data: null,
    _columnIndex: null,
    _id: null,
    _boxesData: null,
    _percentData: null,
    _eventManager: null,

    _switchMarket: null,
    _collapse: null,

    _viewId: null,
    /*
     * Constructor
     *  @column: column information
     *  @records: matrix data
     *  @prevColumn: column containing the boxes belonging to the categories
     *  @index: column index
     *  @eventManager: event manager
     */
    constructor: function (column,records, prevColumn, index, eventManager) {
        this._data = column;
        this._columnIndex = index;
        this._id = column.getValue(CapitalExpense.Constants.BOX_ID);
        this._viewId = '#' + this._id;
        this._switchMarket = false;
        this._collapse = false;
        this._eventManager = eventManager;
        this._sampleData(records, prevColumn);
    },
    /*
     * To fetch data from the database and prev column
     */
    _sampleData: function (records, prevColumn) {
        this._boxesData = [];
        var index = 0;
        for (index = 0; index < records.length; index++) {
            var id = records[index].getValue(CapitalExpense.Constants.COLUMN_BOX_ID);
            if (this._data.getValue(CapitalExpense.Constants.BOX_ID) == id) {
                this._boxesData[this._boxesData.length] = records[index];
            }
        }
        var boxesData = [];
        var totalValue = [0,0,0,0,0];
        for (index = 0; index < this._boxesData.length; index++) {
            var analyticBox = this._boxesData[index];
            var boxID = analyticBox.getValue(CapitalExpense.Constants.BOX_ID);
            var boxes = [];
            prevColumn.eachBox(function (box){
                var isBox = box.getValue(CapitalExpense.Constants.AR01) == boxID ||
                    box.getValue(CapitalExpense.Constants.AR02) == boxID ||
                    box.getValue(CapitalExpense.Constants.AR03) == boxID ||
                    box.getValue(CapitalExpense.Constants.AR04) == boxID ||
                    box.getValue(CapitalExpense.Constants.AR05) == boxID;

                if (isBox) {
                    boxes[boxes.length] = box;
                }
            });
            if (boxes.length != 0) {
                boxesData[boxesData.length] = new AnalyticBox(analyticBox, boxes, this._eventManager, this._columnIndex);
                var item = boxesData[boxesData.length - 1];
                totalValue[item.getColumnIndex()] += parseInt(item.getValue(CapitalExpense.Constants.VALUE));
            }
        }

        for (index = 0; index < boxesData.length; index++) {
            item = boxesData[index];
            item.setValue(CapitalExpense.Constants.TOTAL_VALUE, totalValue[item.getColumnIndex()]);
        }
        this._boxesData = boxesData;
        this._boxesData.sort(function (current, next) {
            var currentOrder = current.getColumnIndex();
            var nextOrder = next.getColumnIndex();
            if (currentOrder > nextOrder) {
                return 1;
            } else {
                if (currentOrder < nextOrder) {
                    return -1;
                } else {
                    return 0;
                }
            }
        });
    },
    /*
     * Iterate over all boxes in the column
     *  @action: function analysis of box
     */
    eachBox: function (action) {
        for(var i = 0; i < this._boxesData.length; i++) {
            var box = this._boxesData[i];
            action.apply(this, [box]);
        }
    },
    /*
     * Perform the render column.
     * Is drawing the background, header and value/percent of header column and display the box and rollUp.
     * Initialized the mouseover and mouseout events
     *      @container: area add box
     */
    render: function (container) {
        var columnContainer = CapitalExpense.SVG.renderContainer(container, CapitalExpense.ClassType.COLUMN);
        this._renderHeader(columnContainer);
        this._renderBody(columnContainer);
    },
    /*
     * Show header of column
     */
    showHeader: function () {
        CapitalExpense.SVG.displayView(this._viewId, 1, CapitalExpense.Animation.columnShow);
    },
    /*
     * Show all the elements of column
     */
    show: function () {
        this.showHeader();
        this._showBody();
    },
    /*
     * Hide all the elements of column
     */
    hide: function () {
        CapitalExpense.SVG.displayView(this._viewId, 0, CapitalExpense.Animation.columnShow);
        this._hideBody();
    },
    /*
     * Resize the size of the box and rollUp height relative to the overall size of the matrix
     */
    resize: function () {
        d3.select(this._viewId)
            .select('rect').
            attr({
               height: this._eventManager.callEvent('getConfig', []).height
            });
        this.eachBox(function (box) {
            box.resize();
        });
    },
    /*
     * Collapse the column.
     * Hides column and updates zoom highlighting and tooltips.
     */
    collapse: function (positionX) {
        this._eventManager.callEvent('calculatePosition', []);
        var positionX = this._eventManager.callEvent('getColumnPosition', [this._columnIndex]);
        d3.select(this._viewId)
            .select('rect')
            .transition().duration(CapitalExpense.Animation.collapseColumn)
            .attr({
                x: positionX,
                width: 30,
                height: this._eventManager.callEvent('getConfig', []).height
        });

        this._collapseTitleHeader(positionX);
        this._hideBody();
        this._collapseCollapseButton(positionX);
    },
    /*
     * Expand the column.
     * Shows column and updates zoom highlighting and tooltips.
     */
    expand: function (positionX) {
        var id = '#' + this.getValue(CapitalExpense.Constants.BOX_ID);
        d3.select(this._viewId)
            .select('rect')
            .transition().duration(CapitalExpense.Animation.expandColumn)
            .attr({
                width: this.getValue(CapitalExpense.Constants.WIDTH),
                height: this._eventManager.callEvent('getConfig', []).height
            });
        this._expandTitleHeader(positionX);
        this._expandCollapseButton(positionX);
        this._showBody();
    },
    /*
     * Move the  column for "Collapse" event
     */
    shift: function (positionX) {
        this._eventManager.callEvent('calculatePosition', []);
        var positionX = this._eventManager.callEvent('getColumnPosition', [this._columnIndex]);
        var positionCollapseButton = positionX;
        if(this.isCollapse()) {
            d3.select(this._viewId)
                .select('rect')
                .transition().duration(CapitalExpense.Animation.columnShift)
                .attr({
                    width: 30,
                    x: positionX
                });
            this._shiftTitleHeader(positionX);
        } else {
            this._transitionView(CapitalExpense.Animation.columnShift,
                {
                    x: positionX
                },
                {
                    x: positionX + 10
                }
            );
            positionCollapseButton = positionX + this.getValue(CapitalExpense.Constants.WIDTH) - 30;
        }
        this._shiftCollapseButton(positionCollapseButton);
        this._shiftBump(positionX);

    },
    /*
     * Render the column header
     */
    _renderHeader: function (container) {
        var container = CapitalExpense.SVG.renderBackground(this,
            {
                type: CapitalExpense.ClassType.COLUMN_HEADER,
                container: container,
                border: {},
                id: 'bump_' + this.getValue(CapitalExpense.Constants.BOX_ID)
            }
        );
        this._renderTitleHeader(container);
        this._renderCollapseButton(container);
        this._renderBump(container);
    },
    /*
     * Render the column body
     */
    _renderBody: function (contrainer) {
        this.eachBox(function (box) {
            box.render(contrainer);
        });
    },
    /*
     * Render title the column header
     */
    _renderTitleHeader: function (container) {
        var positionX = this.getValue(CapitalExpense.Constants.POSITION_X) + 10;
        var textColor =  ColorCalculator.calculateTextColor(this.getValue(CapitalExpense.Constants.BGK_COLOR), AnalyticColumn);
        var attr = {
            x: positionX,
            'text-anchor': 'start',
            width: 150,
            height: 50,
            color: textColor,
            fill: textColor
        };
        attr['y'] = this.getValue(CapitalExpense.Constants.POSITION_Y) + 40;
        CapitalExpense.SVG.renderDynamicText(CapitalExpense.ClassType.TITLE_HEADER, container,
            { attr: attr, text: this.getValue(CapitalExpense.Constants.BOX_TITLE).toUpperCase() },
            true
        );
    },
    /*
     * Render bump the column
     */
    _renderBump: function (container) {
        var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + AnalyticColumn.heightHeader / 2 - 25;
        var bumpContainer = CapitalExpense.SVG.renderContainer(container, CapitalExpense.ClassType.BUMP_HEADER);
        this._renderTopBump(bumpContainer, positionY);
        this._renderBottomBump(bumpContainer, positionY);
        this._renderBodyBump(bumpContainer, positionY);
    },
    /*
     * Render top border bump the column
     */
    _renderTopBump: function (container,positionY) {
        var topData = [{
            x:  this.getValue(CapitalExpense.Constants.POSITION_X) - 15,
            y:  positionY  + 15
        },{
            x:  this.getValue(CapitalExpense.Constants.POSITION_X),
            y:  positionY + 30
        }];
        CapitalExpense.SVG.renderLine(container, topData,
            {
                color: '#ffffff',
                width: '1px'
            },
            'top'
        );
    },
    /*
     * Render bottom border bump the column
     */
    _renderBottomBump: function (container, positionY) {
        var bottomData = [{
            x:  this.getValue(CapitalExpense.Constants.POSITION_X),
            y:  positionY
        },{
            x:  this.getValue(CapitalExpense.Constants.POSITION_X) - 15,
            y:  positionY  + 15
        }];
        CapitalExpense.SVG.renderLine(container, bottomData,
            {
                color: '#ffffff',
                width: '1px'
            },
            'bottom'
        );
    },
    /*
     * Render body bump the column
     */
    _renderBodyBump: function (container, positionY) {
        var data = [
            {
                x:  this.getValue(CapitalExpense.Constants.POSITION_X) + 1,
                y:  positionY
            },
            {
                x:  this.getValue(CapitalExpense.Constants.POSITION_X) + 1 ,
                y:  positionY  + 30
            },
            {
                x:  this.getValue(CapitalExpense.Constants.POSITION_X) - 14,
                y:  positionY  + 15
            }
        ];
        CapitalExpense.SVG.renderFillLine(container, data, CapitalExpense.Tools.formatColor(this), 'fill');
    },
    /*
     * Show body the column
     */
    _showBody: function () {
        this.eachBox(function (box) {
            box.show();
        });
    },
    /*
     * Hide body the column
     */
    _hideBody: function () {
        this.eachBox(function (box) {
            box.hide();
        });
    },
    /*
     * Collapse title the column header
     */
    _collapseTitleHeader: function (positionX) {
        var positionY = d3.select(this._viewId).select('.' + CapitalExpense.ClassType.TITLE_HEADER).select('text').node().getComputedTextLength() + 22;
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .transition().duration(CapitalExpense.Animation.collapseColumn)
            .attr({
                x: positionX + 22,
                y:  positionY,
                height: 25,
                'transform': 'rotate(-90 ' + (positionX + 22) +' '+  positionY +')'
            });
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .selectAll('tspan')
            .transition().duration(CapitalExpense.Animation.collapseColumn)
            .attr({
                x: positionX +5,
                y:  positionY
            });
    },
    /*
     * Expand title the column header
     */
    _expandTitleHeader: function (positionX) {
        var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + 60;
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .transition().duration(CapitalExpense.Animation.expandColumn)
            .attr({
                x: positionX + 10,
                y: positionY,
                width: 150,
                height: 50,
                'transform': 'rotate(0 ' + (positionX + 10) +' '+ positionY +')'
            });
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .selectAll('tspan')
            .transition().duration(CapitalExpense.Animation.expandColumn)
            .attr({
                x: positionX + 10,
                y: positionY
            });
    },
    /*
     * Collapse the collapse button column
     */
    _collapseCollapseButton: function (positionX) {
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.COLLAPSE_BUTTON)
            .select('image')
            .attr({
                'xlink:href':  CapitalExpense.Constants.COLLAPSE_BUTTON_OPEN_IMAGE
            });
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.COLLAPSE_BUTTON)
            .select('image')
            .transition().duration(CapitalExpense.Animation.collapseColumn)
            .attr({
                x: positionX
            });
    },
    /*
     * Expand the collapse button column
     */
    _expandCollapseButton: function (positionX) {
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.COLLAPSE_BUTTON)
            .select('image')
            .attr({
                'xlink:href':  CapitalExpense.Constants.COLLAPSE_BUTTON_CLOSE_IMAGE
            });
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.COLLAPSE_BUTTON)
            .select('image')
            .transition().duration(CapitalExpense.Animation.expandColumn)
            .attr({
                x: positionX + this.getValue(CapitalExpense.Constants.WIDTH) - 30
            });
    },
    /*
     * Shift bump the column
     */
    _shiftBump: function (positionX) {
        var bumpPositionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + AnalyticColumn.heightHeader / 2 - 25;
        this._transitionBump('top',
            [{
                x:  positionX - 15,
                y:  bumpPositionY  + 15
            },{
                x:  positionX,
                y:  bumpPositionY + 30
            }]
        );
        this._transitionBump('bottom',
            [{
                x:  positionX,
                y:  bumpPositionY
            },{
                x:  positionX - 15,
                y:  bumpPositionY  + 15
            }]
        );
        this._transitionBump('fill',
            [{
                x:  positionX + 1,
                y:  bumpPositionY
            }, {
                x:  positionX + 1 ,
                y:  bumpPositionY  + 30
            }, {
                x:  positionX - 14,
                y:  bumpPositionY  + 15
            }]
        );
    },
    /*
     * Perform the transposition bump
     */
    _transitionBump: function (id, data) {
        var lineFunction = d3.svg.line()
            .x(function(data) { return data.x; })
            .y(function(data) { return data.y; })
            .interpolate("linear");
        d3.select(this._viewId)
            .select('.' +  CapitalExpense.ClassType.BUMP_HEADER)
            .select('#' + id)
            .transition().duration(CapitalExpense.Animation.columnShift)
            .attr({
                d: lineFunction(data)
            });
    },
    /*
     * Shift title the column header
     */
    _shiftTitleHeader: function (positionX) {
        var positionY = 34;
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .attr({
                display: 'block'
            });
        var widthText = d3.select(this._viewId).select('.' + CapitalExpense.ClassType.TITLE_HEADER).select('text').node().getComputedTextLength();
        if  (widthText == 0) {
            widthText = 97;
        }
        positionY += widthText;
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .transition().duration(CapitalExpense.Animation.columnShift)
            .attr({
                x: positionX + 22,
                y:  positionY,
                'transform': 'rotate(-90 ' + (positionX + 22) +' '+  positionY +')'
            });
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .selectAll('tspan')
            .transition().duration(CapitalExpense.Animation.columnShift)
            .attr({
                x: positionX + 22,
                y:  positionY
            });
    },
    /*
     * Shift the collapse button column
     */
    _shiftCollapseButton: function (positionX) {
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.COLLAPSE_BUTTON)
            .select('image')
            .transition().duration(CapitalExpense.Animation.columnShift)
            .attr({
                x: positionX
            });
    },
    /*
     * Perform the transposition of view column
     */
    _transitionView: function (duration, backgroundConfig, titleConfig) {
        backgroundConfig['duration'] = duration;
        titleConfig['duration'] = duration;
        CapitalExpense.SVG.transitionBackground(this._viewId, backgroundConfig);
        CapitalExpense.SVG.transitionDynamicText(this._viewId, CapitalExpense.ClassType.TITLE_HEADER, titleConfig);
    }
}, {
    width: 150,
    textColorDark: '#000000',
    textColorLight: '#ffffff',
    borderOfDarkAndLigthColor: '#6ec49a',
    heightHeader: 125
});
