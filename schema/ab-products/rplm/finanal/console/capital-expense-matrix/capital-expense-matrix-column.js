/*
 * Basic column forming common methods to work with object column.
 * Methods: get view id column, set/get value in database and other
 */
var ColumnBase = Base.extend({
    /*
     *    Get a database field from database data the matrix element
     *       @field: field of the column
     */
    getValue: function (field) {
        return this._data.getValue(field);
    },
    /*
     *    Set a database field from database data the matrix element
     *        @field: field of the column
     *        @value: value
     */
    setValue: function(field, value) {
        this._data.setValue(field,value);
    },
    /*
     * Get ID the column in matrix
     */
    getID: function () {
        return this._data.getValue(CapitalExpense.Constants.BOX_ID);
    },
    /*
     * Get type the column
     */
    getType: function () {
        return this._data.getValue(CapitalExpense.Constants.BOX_TYPE);
    },
    /*
     * Get total value the column
     */
    getTotalValues: function () {
        return this._data.getValue(CapitalExpense.Constants.VALUE) / 1000000;
    },
    /*
     * Get column index the column
     */
    getColumnIndex: function() {
        return this._columnIndex;
    },
    /*
     * Switch  collapse the column
     */
    switchCollapse: function () {
        if (this._collapse) {
            this._collapse = false;
        } else {
            this._collapse = true;
        }
    },
    /*
     * Check whether the column is collapse
     */
    isCollapse: function () {
        return this._collapse;
    },
    /*
     * Call event
     *  @eventName: the name of the events
     *  @fields: variables functions
     */
    callEvent: function (eventName, fields) {
        this._eventManager.callEvent(eventName, fields);
    },
    /*
     * Render collapse button
     */
    _renderCollapseButton: function (container) {
        var collapseButtonContainer = CapitalExpense.SVG.renderContainer(container, CapitalExpense.ClassType.COLLAPSE_BUTTON);
        collapseButtonContainer
            .data([this])
            .append('image')
            .attr({
                x: this.getValue(CapitalExpense.Constants.POSITION_X) + this.getValue(CapitalExpense.Constants.WIDTH) - 30,
                y: this.getValue(CapitalExpense.Constants.POSITION_Y) + 5,
                width: 30,
                height: 20,
                'xlink:href': CapitalExpense.Constants.COLLAPSE_BUTTON_CLOSE_IMAGE
            })
            .style({
                cursor: 'pointer'
            })
            .on('click', function (column) {
                column.switchCollapse();
                column.callEvent('onCollapse', [column]);
                //CollapseExpandColumn.action(record);
            });
    },
    /*
     * Render tooltip the column
     */
    _renderTooltip: function (data) {
        var value;
        if (data.isMarket()) {
            value = data.getValue(CapitalExpense.Constants.VALUE_MARKER_FORMATTED);
        } else {
            value = data.getValue(CapitalExpense.Constants.VALUE_FORMATTED);
        }

        var width = ColumnData.columnWidth - 20;
        var html = '<div style="width: '+ width +'px">'
            + '<div>'
            + 	'<div class="capitalExpenseMatrixBoxTooltipValue">' + value + '</div>'
            + '</div>'
            + '<div style="text-align:left; float: left;">'
            + 	'<div class="capitalExpenseMatrixBoxTooltipTitle">' + data.getValue(CapitalExpense.Constants.BOX_TITLE) + '</div>'
            + 	'<div class="capitalExpenseMatrixBoxTooltipText">' + data.getValue('finanal_matrix.box_tooltip') + '</div>'
            + '</div>'
            + '</div>';
        return html;
    }
});

/*
 * Column displays a set of vertical boxes for the principal roll up categories.
 * Provides an API to show, hide, resize, collapse, expand, shift, and a column.
 */
var ColumnData = ColumnBase.extend({
    _data: null,
    _columnIndex: null,
    _id: null,
    _boxesData: null,
    _rollUpData: null,
    _percentData: null,

    _switchMarket: null,
    _collapse: null,

    _viewId: null,
    _eventManager: null,
    /*
        Constructor
             @column: column information
             @records: matrix data
             @index: column index
             @eventManager: event manager
     * */
    constructor: function (column, records, index, eventManager) {
        this._data = column;
        this._columnIndex = index;
        this._id = column.getValue(CapitalExpense.Constants.BOX_ID);
        this._viewId = '#' + this._id;
        this._switchMarket = false;
        this._collapse = false;
        this._eventManager = eventManager;
        this._sampleData(records);
        var isCreate = d3.select('#tooltip_' + this.getValue(CapitalExpense.Constants.BOX_ID)).node();
        if (isCreate != null) {
            d3.select('#tooltip_' + this.getValue(CapitalExpense.Constants.BOX_ID)).remove();
        }
        this._tooltip = d3.tip()
            .offset(function (data) {
                return [0,  0];
            })
            .direction(function (data) {
                return 's';
            })
            .attr('class', 'capitalExpenseMatrixColumnTooltip')
            .attr('id', 'tooltip_' + this.getValue(CapitalExpense.Constants.BOX_ID))
            .html(this._renderTooltip);


    },
    /*
     * Set flag the market
     */
    setMarket: function (marker) {
        this._switchMarket = marker;
    },
    /*
     * Is flag the market
     */
    isMarket: function () {
        return this._switchMarket;
    },
    /*
     * Get element of the column
     */
    getElementByID: function (id, type) {
        if (!id || !type) {
            return null;
        }
        var data = null;
        switch (type) {
            case CapitalExpense.Constants.BO:
                data = this._boxesData;
                break;
            case CapitalExpense.Constants.FR:
                data = this._rollUpData;
                break;
        }
        if (data == null) {
            return null;
        }
        for (var i = 0; i< data.length; i++) {
            var element = data[i];
            if (id == element.getValue(CapitalExpense.Constants.BOX_ID)) {
                return element;
            }
        }
        return null;
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
     * Iterate over all boxes in the category
     *  @action: function analysis of box
     */
    eachBox: function (action) {
        for(var i = 0; i < this._boxesData.length; i++) {
            var box = this._boxesData[i];
            var result = action.apply(this, [box]);
            if (result) {
                break;
            }
        }

    },
    /*
     * Iterate over all rollUp in the category
     *  @action: function analysis of rollUp
     */
    eachRollUp: function (action) {
        for(var i = 0; i < this._rollUpData.length; i++) {
            var rollUp = this._rollUpData[i];
            action.apply(this, [rollUp]);
        }
    },
    /*
     * Get switch the menu position
     */
    getSwitchMenuPosition: function () {
        return this.getValue(CapitalExpense.Constants.POSITION_X) + this.getValue(CapitalExpense.Constants.WIDTH) - 35;
    },
    /*
     * Get count of elements in the specified type
     */
    getCount: function (type) {
        switch (type) {
            case CapitalExpense.Constants.BO:
                return this._boxesData.length;
            case CapitalExpense.Constants.FR:
                return this._rollUpData.length;
        }
        return null;
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
     * Show all the elements of column
     */
    show: function () {
        CapitalExpense.SVG.displayView(this._viewId, 1, CapitalExpense.Animation.columnShow);
        if (!this.isCollapse()) {
            this._showBody();
            this._showSwitchMenu();
        }
        this._tooltip.hide();
    },
    /*
     * Show menu of column
     */
    showSwitchMenu: function (delay) {
        if (!this.isCollapse()) {
            this._showSwitchMenu(delay);
        }
    },
    /*
     * Hide all the elements of column
     */
    hide: function () {
        CapitalExpense.SVG.displayView(this._viewId, 0, CapitalExpense.Animation.columnHide);
        this._hideBody();
        this._hideSwitchMenu();
        this._tooltip.hide();
    },
    /*
     * Resize the size of the box and rollUp height relative to the overall size of the matrix
     */
    resize: function () {
        this.eachBox(function (box) {
            box.resize();
        });
        this.eachRollUp(function (rollUp) {
            rollUp.resize();
        });
    },
    /*
     * Hide menu of column
     */
    hideSwitchMenu: function () {
        this._hideSwitchMenu();
    },
    /*
     * Collapse the column.
     * Hides column and updates zoom highlighting and tooltips.
     */
    collapse: function (positionX) {
        var id = this._viewId;
        this._eventManager.callEvent('calculatePosition', []);
        var positionX = this._eventManager.callEvent('getColumnPosition', [this._columnIndex]);
        d3.select(id)
            .select('rect')
            .transition().duration(CapitalExpense.Animation.collapseColumn)
            .attr({
                x: positionX,
                width: 30,
                height: this._eventManager.callEvent('getConfig', []).height
            });
        this._collapseTextHeader(positionX);
        this._collapseCollapseButton(positionX);
        this._hideBody();
        this._hideSwitchMenu();
        this._tooltip.hide();
    },
    /*
     * Expand the column.
     * Shows column and updates zoom highlighting and tooltips.
     */
    expand: function (positionX) {
        d3.select(this._viewId)
            .select('rect')
            .transition().duration(CapitalExpense.Animation.expandColumn)
            .attr({
                width: this.getValue(CapitalExpense.Constants.WIDTH),
                height: this.getValue(CapitalExpense.Constants.HEIGHT)
            });
        this._expandTextHeader(positionX);
        this._expandCollapseButton(positionX);
        this._showBody();
        this._showSwitchMenu();
        this._tooltip.hide();

    },
    /*
     * Move the  column for "Collapse" event
     */
    shift: function (positionX, reLoad) {
        var positionCollapseButton = positionX;
        if(this.isCollapse()) {
            d3.select(this._viewId)
                .select('rect')
                .transition().duration(800)
                .attr({
                    x: positionX,
                    width: 30,
                    height: this._eventManager.callEvent('getConfig', []).height
                });
            //
            if (reLoad) {
                this._collapseTextHeader(positionX);
            } else {
                this._shiftTextHeader(positionX);
            }

        } else {
            var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y);
            this._transitionView(CapitalExpense.Animation.columnShift,
                {
                    x: positionX
                },
                {
                    x: positionX + 10
                },
                {
                    x: positionX + 10,
                    y: positionY + 30
                },
                {
                    x: positionX + 10,
                    y: positionY + this.getValue(CapitalExpense.Constants.HEIGHT) - 10
                }
            );
            positionCollapseButton = positionX + this.getValue(CapitalExpense.Constants.WIDTH) - 30;
        }
        this._shiftCollapseButton(positionCollapseButton);
    },
    /*
     * To fetch data from the database
     */
    _sampleData: function (records) {
        this._boxesData = [];
        this._rollUpData = [];
        for (var i = 0; i < records.length; i++) {
            var item = records[i];
            if (item.getValue(CapitalExpense.Constants.COLUMN_BOX_ID) == this._id) {
                var type = item.getValue(CapitalExpense.Constants.BOX_TYPE);
                switch (type) {
                    case CapitalExpense.Constants.BO:
                        this._boxesData[this._boxesData.length] = new Box(item, this._columnIndex, this._eventManager);
                        break;
                    case CapitalExpense.Constants.PR:
                        this._percentData = item;
                        break;
                    case CapitalExpense.Constants.FR:
                        this._rollUpData[this._rollUpData.length] = new RollUp(item, this._columnIndex, this._eventManager);
                        break;
                }
            }
        }

        this._boxesData.sort(CapitalExpense.Tools.sortInOrder);
        this._rollUpData.sort(CapitalExpense.Tools.sortInOrder);
    },
    /*
     * Calculate the percent of the box relative to the selected values menu
     */
    _calculateBoxPercent: function (box) {
        if (box.getValue(CapitalExpense.Constants.BOX_PERCENT)) {
            var value;
            var field;
            if (this._switchMarket) {
                value = Math.abs(parseInt(box.getValue(CapitalExpense.Constants.VALUE_MARKER)));
                field = CapitalExpense.Constants.VALUE_MARKER;
            } else {
                value = Math.abs(parseInt(box.getValue(CapitalExpense.Constants.VALUE)));
                field = CapitalExpense.Constants.VALUE;
            }
            var percent = (value / this._calculateTotalValue(field)) * 100;
            //percent = Math.round(percent);
            box.setValue(CapitalExpense.Constants.BOX_PERCENT, percent);
        }
    },
    /*
     * Calculate the total value which participates in the calculation of interest
     */
    _calculateTotalValue: function (field) {
        var result = 0;
        this.eachBox(function (box) {
            if (box.getValue(CapitalExpense.Constants.BOX_PERCENT)) {
                result += parseInt(Math.abs(box.getValue(field)));
            }
        });
        return result;
    },
    /*
     * Render the column header
     */
    _renderHeader: function (container) {
        var headerContainer = CapitalExpense.SVG.renderBackground(this,
            {
                type: CapitalExpense.ClassType.COLUMN_HEADER,
                container: container,
                tooltip: this._tooltip,
                border: {
                    color: '#ffffff',
                    size: '1px'
                }
            }
        );
        /*var column = this;
        headerContainer.call(this._tooltip);
        headerContainer.on('mouseover', function () {
            if (!column.isCollapse()) {
                column._tooltip.show(column);
            }
        });
        headerContainer.on('mouseout', function () {
            if (!column.isCollapse()) {
                column._tooltip.hide();
            }
        });*/
        var positionX = this._data.getValue(CapitalExpense.Constants.POSITION_X) + 10;
        var textColor =  ColorCalculator.calculateTextColor(this.getValue(CapitalExpense.Constants.BGK_COLOR), ColumnData);
        var attr = {
            x: positionX,
            'text-anchor': 'start',
            width: 150,
            height: 50,
            color: textColor,
            fill: textColor
        };
        this._renderValueHeader(headerContainer, attr);
        this._renderTitleHeader(headerContainer, attr);
        this._renderInfo(headerContainer, attr);
        this._renderCollapseButton(headerContainer);
        this._renderSwitchMenu(textColor);
    },
    /*
     * Render the column value header
     */
    _renderValueHeader: function (container, attr) {
        attr['y'] = this.getValue(CapitalExpense.Constants.POSITION_Y) + 30;
        CapitalExpense.SVG.renderStaticText(CapitalExpense.ClassType.VALUE_HEADER, container, {
                data: [this._data],
                attr: attr,
                function: function (data) {
                    return data.getValue(CapitalExpense.Constants.VALUE_FORMATTED);
                }
            },
            true
        );
        var fontSize = 28;
        while(true) {
            var valueLength = d3.select(this._viewId).select('.' + CapitalExpense.ClassType.VALUE_HEADER).select('text').node().getComputedTextLength();
            if (valueLength > 130) {
                fontSize--;
                d3.select(this._viewId).select('.' + CapitalExpense.ClassType.VALUE_HEADER).style({
                    'font-size': fontSize
                })
            } else {
                break;
            }
        }
    },
    /*
     * Render the column title header
     */
    _renderTitleHeader: function (container, attr) {
        attr['y'] = this.getValue(CapitalExpense.Constants.POSITION_Y) + 40;
        CapitalExpense.SVG.renderDynamicText(CapitalExpense.ClassType.TITLE_HEADER, container,
            {
                attr: attr,
                text: this.getValue(CapitalExpense.Constants.BOX_TITLE).toUpperCase()
            },
            true
        );
    },
    /*
     * Render the column info header
     * */
    _renderInfo: function (container, attr) {
        attr['width'] = this.getValue(CapitalExpense.Constants.WIDTH) - 10;
        attr['y'] = this.getValue(CapitalExpense.Constants.POSITION_Y)  + this.getValue(CapitalExpense.Constants.HEIGHT) - 10;



        CapitalExpense.SVG.renderStaticText(CapitalExpense.ClassType.INFO_HEADER, container,
            {
                data: [this._data],
                attr: attr,
                function: function (data) {
                    return "";
                }
            },
            true
        );
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.INFO_HEADER)
            .select('text')
            .attr({
                'font-size': '12px'
            });
        var initText  = getMessage('capitalExpenseMatrixHeaderInfo');
        var chatAtMessage = initText.split("");
        var result = '';


        for( var i = 0; i < chatAtMessage.length; i++) {
            result += chatAtMessage[i];
            d3.select(this._viewId).select('.' + CapitalExpense.ClassType.INFO_HEADER).select('text').text(result);
            var width = d3.select(this._viewId).select('.' + CapitalExpense.ClassType.INFO_HEADER).select('text').node().getComputedTextLength();
            if (width > (attr['width'] - 20)) {
                result += '...';
                d3.select(this._viewId).select('.' + CapitalExpense.ClassType.INFO_HEADER).select('text').text(result);
                break;
            }
        }
    },
    /*
     * Render the column switch menu
     */
    _renderSwitchMenu: function (textColor) {
        if (this.getValue(CapitalExpense.Constants.BOX_TYPE) == CapitalExpense.Constants.C1) {
            d3.select('#'+ this.getValue(CapitalExpense.Constants.BOX_ID) + '_menu').remove();
            this._eventManager.addEventListener('isSwitchMenu', function (box) {
                if (this.isMarket() && this.isContainsBox(box)) {
                    return true;
                }
                return false;
            }, this);
            var idMenu = this.getValue(CapitalExpense.Constants.BOX_ID) + '_menu';
            var idList = this.getValue(CapitalExpense.Constants.BOX_ID) + '_list';

            var cssStyle = document.createElement('style');
            cssStyle.type = 'text/css';
            var rules = document.createTextNode("."+idMenu +"{" +
            "display: inline-block; margin-bottom: 0; font-weight: normal; text-align: center; vertical-align: middle; " +
            "-ms-touch-action: manipulation; touch-action: manipulation;  cursor: pointer; background-image: none; " +
            "border: 1px solid transparent; white-space: nowrap; padding: 2px 4px; font-size: 12px; " +
            "min-width: 90px; line-height: 1.42857143; border-radius: 1px; -webkit-user-select: none; " +
            "-moz-user-select: none; -ms-user-select: none; user-select: none;" +
            "background-Color:" + CapitalExpense.Tools.formatColor(this) + ";" +
            "color:" + textColor + ";" +
            "opacity: 0.7" +

            "}");
            cssStyle.appendChild(rules);
            document.getElementsByTagName("head")[0].appendChild(cssStyle);

            var switchMenu = document.createElement('div');
            switchMenu.className = 'dropdown';
            switchMenu.id = idMenu;
            switchMenu.style.position = 'absolute';
            //switchMenu.style.display = 'block';
            switchMenu.style.left = (this.getValue(CapitalExpense.Constants.POSITION_X) + this.getValue(CapitalExpense.Constants.WIDTH) - 125) + 'px';
            switchMenu.style.top = (this.getValue(CapitalExpense.Constants.POSITION_Y) + 37) + 'px';
            switchMenu.style['z-index'] = 1;


            var initText  = getMessage('capitalExpenseMatrixBookValue');
            var chatAtMessage = initText.split("");
            if (chatAtMessage.length > 12) {
                initText = '';
                for (var a = 0; chatAtMessage.length; a++) {
                    initText += chatAtMessage[a];
                    if (a == 11) {
                        break;
                    }
                }
                initText += '...';
            }

            switchMenu.innerHTML ='<div class="dropdown" id="'+ idMenu + '">'+
            '<button class="'+idMenu+' dropdown-toggle" type="button" data-toggle="dropdown">' + initText +
            '<span class="caret"></span></button>'+
            '<ul class="dropdown-menu" id ="'+ idList +'">'+
            '<li><a tabindex="-1" >'+ getMessage('capitalExpenseMatrixBookValue') +'</a></li>'+
            '<li><a tabindex="-1" >'+ getMessage('capitalExpenseMatrixMarketValue') +'</a></li>' +'</ul></div>';

            document.body.appendChild(switchMenu);
            document.getElementById(idMenu).style.backgroundColor = CapitalExpense.Tools.formatColor(this);
            document.getElementById(idList).style.backgroundColor = CapitalExpense.Tools.formatColor(this);
            var tags = document.getElementById(idList).getElementsByTagName('a');
            for (var i = 0; i < tags.length; i++) {
                tags[i].style.color = textColor;
            }
            var column = this;
            jQuery("#"+  idList+ " li a").on("click", function(event){
                var fieldValue;
                var fieldFormat;
                var x = jQuery(event.target).text(); // Get the button text
                if (x == getMessage('capitalExpenseMatrixBookValue')) {
                    column.setMarket(false);
                    fieldValue = CapitalExpense.Constants.VALUE;
                    fieldFormat = CapitalExpense.Constants.VALUE_FORMATTED;
                } else {
                    column.setMarket(true);
                    fieldValue = CapitalExpense.Constants.VALUE_MARKER;
                    fieldFormat = CapitalExpense.Constants.VALUE_MARKER_FORMATTED;
                }
                var chatAtMessage = x.split("");
                if (chatAtMessage.length > 12) {
                    x = '';
                    for (var a = 0; chatAtMessage.length; a++) {
                        x += chatAtMessage[a];
                        if (a == 11) {
                            break;
                        }
                    }
                    x += '...';
                }
                jQuery('.' + idMenu).html(''+ x +' <span class="caret"></span>');
                var totalPercent = 0;//column._calculateTotalValue(fieldValue);
                column.eachBox(function (box) {
                    if (box.getValue(CapitalExpense.Constants.BOX_PERCENT)) {
                        totalPercent += Math.abs(parseInt(box.getValue(fieldValue)));
                    }
                });
                d3.select('#' + column.getID())
                    .select('.'+ CapitalExpense.ClassType.VALUE_HEADER)
                    .select('text')
                    .text(column.getValue(fieldFormat));
                var fontSize = 28;
                var attr = {
                    x: column.getValue(CapitalExpense.Constants.POSITION_X) + 10,
                    y: column.getValue(CapitalExpense.Constants.POSITION_Y) + 30,
                    'text-anchor': 'start',
                    width: 150,
                    height: 50,
                    color: textColor,
                    fill: textColor
                };
                while(true) {
                    var valueLength = d3.select(column._viewId).select('.' + CapitalExpense.ClassType.VALUE_HEADER).select('text').node().getComputedTextLength();
                    if (valueLength > 130) {
                        fontSize--;
                        attr['font-size'] = fontSize;
                        d3.select(column._viewId).select('.' + CapitalExpense.ClassType.VALUE_HEADER).select('text').remove();
                        d3.select(column._viewId).select('.' + CapitalExpense.ClassType.VALUE_HEADER).append('text').attr(attr).text(column.getValue(fieldFormat));
                    } else {
                        break;
                    }
                }
                column.eachBox(function (box) {
                    if (box.getValue(CapitalExpense.Constants.BOX_PERCENT)) {
                        box.reLoadPercent(totalPercent);
                        var id = '#' + box.getValue(CapitalExpense.Constants.BOX_ID);
                        if (column.isMarket()) {
                            d3.select(id)
                                .select('.'+ CapitalExpense.ClassType.BOX_VALUE)
                                .select('text')
                                .text(box.getValue(CapitalExpense.Constants.VALUE_MARKER_FORMATTED));
                        } else {
                            d3.select(id)
                                .select('.'+ CapitalExpense.ClassType.BOX_VALUE)
                                .select('text')
                                .text(box.getValue(CapitalExpense.Constants.VALUE_FORMATTED));
                        }
                    }
                });

            });
        }
    },
    /*
     * Render the column body
     */
    _renderBody: function (container) {
        this.eachBox(function (box) {
            this._calculateBoxPercent(box);
            box.render(container);
        });
        this.eachRollUp(function (rollUp) {
            rollUp.render(container);
        });
    },
    /*
     * Hide the column body
     * */
    _hideBody: function () {
        this.eachBox(function (box) {
            box.hide();
        });
        this.eachRollUp(function (rollUp) {
            rollUp.hide();
        });
    },
    /*
     * Show the column body
     */
    _showBody: function () {
        this.eachBox(function (box) {
            box.show();
        });
        this.eachRollUp(function (rollUp) {
            rollUp.show();
        });
    },
    /*
     * Collapse the text header
     */
    _collapseTextHeader: function (positionX) {
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.INFO_HEADER)
            .attr({
                display: 'none'
            });
        d3.select(this._viewId).select('.' + CapitalExpense.ClassType.TITLE_HEADER).select('text').text(this.getValue(CapitalExpense.Constants.BOX_TITLE).toUpperCase());
        var positionY = d3.select(this._viewId).select('.' + CapitalExpense.ClassType.VALUE_HEADER).select('text').node().getComputedTextLength();
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.VALUE_HEADER)
            .select('text')
            .transition().duration(CapitalExpense.Animation.collapseColumn)
            .attr({
                x: positionX + 22,
                y: positionY,
                'font-size': '18px',
                'font-weight': 'bold',
                'transform': 'rotate(-90 ' + (positionX + 22) +' '+ positionY +')'
            });
        positionY += d3.select(this._viewId).select('.' + CapitalExpense.ClassType.TITLE_HEADER).select('text').node().getComputedTextLength() + 20;
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .transition().duration(CapitalExpense.Animation.collapseColumn)
            .attr({
                x: positionX + 22,
                y:  positionY - 10 ,
                height: 25,
                'transform': 'rotate(-90 ' + (positionX + 22) +' '+  (positionY - 10)  +')'
            });

        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .selectAll('tspan')
            .transition().duration(CapitalExpense.Animation.collapseColumn)
            .attr({
                x: positionX + 22,
                y:  positionY - 10
            });
    },
    /*
     * Expand the text header
     */
    _expandTextHeader: function (positionX) {
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.INFO_HEADER)
            .transition().delay(CapitalExpense.Animation.expandColumn)
            .attr({
                display: 'block'
            });
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.INFO_HEADER)
            
            .select('text')
            .select('tspan')
            .attr({
                x: positionX + 10
            });
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.INFO_HEADER)
            .select('text')
            .transition().duration(0)
            .attr({
                x: positionX + 10
            });

        var textColor =  ColorCalculator.calculateTextColor(this.getValue(CapitalExpense.Constants.BGK_COLOR), ColumnData);
        var attr = {
            //x: this.getValue(CapitalExpense.Constants.POSITION_Y) + 58,//positionX + 10,
            x: positionX + 10,
            y:  this.getValue(CapitalExpense.Constants.POSITION_Y) + 58 ,
            //'transform': 'rotate(0 ' + (positionX + 10) +' '+  (this.getValue(CapitalExpense.Constants.POSITION_Y) + 58 )  +')',
            'text-anchor': 'start',
            width: 200,
            height: 50,
            color: textColor,
            fill: textColor
        };

        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text').remove();
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .append('text').attr(attr).text(this.getValue(CapitalExpense.Constants.BOX_TITLE).toUpperCase());
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .call(CapitalExpense.Tools.wrap, attr);
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .transition().duration(CapitalExpense.Animation.expandColumn)
            .delay(CapitalExpense.Animation.expandColumn)
            .attr({
                x: positionX + 10,
                y:  this.getValue(CapitalExpense.Constants.POSITION_Y) + 58 ,
                width: 150,
                height: 50,
                'transform': 'rotate(0 ' + (positionX + 10) +' '+  (this.getValue(CapitalExpense.Constants.POSITION_Y) + 58 )  +')'
            });

        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .selectAll('tspan')
            .transition().duration(800)
            .attr({
                x: positionX +  10,
                y:  function (data, position) {
                    return data.getValue(CapitalExpense.Constants.POSITION_Y) + 58 + position * 15;
                }
            });



        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.VALUE_HEADER)
            .select('text')
            .transition().duration(800)
            .attr({
                x: function (a) {
                    return positionX + 10;
                },
                y: this.getValue(CapitalExpense.Constants.POSITION_Y) + 30,
                'font-size': '28px',
                'font-weight': 'normal',
                'transform': 'rotate(0 ' + (positionX + 10) +' '+ (this.getValue(CapitalExpense.Constants.POSITION_Y) + 30) +')'
            });
    },
    /*
     * Shift the text header
     */
    _shiftTextHeader: function (positionX) {
        var width = d3.select(this._viewId).select('.' + CapitalExpense.ClassType.VALUE_HEADER).select('text').node().getComputedTextLength();
        var positionY = width + 34;

        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.VALUE_HEADER)
            .select('text')
            .transition().duration(CapitalExpense.Animation.columnShift)
            .attr({
                x: positionX  + 22,
                y: positionY,
                'transform': 'rotate(-90 ' + (positionX + 22) +' '+ positionY +')'
            });
        positionY += d3.select(this._viewId).select('.' + CapitalExpense.ClassType.TITLE_HEADER).select('text').node().getComputedTextLength() + 10;
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .transition().duration(CapitalExpense.Animation.columnShift)
            .attr({
                x: positionX + 22,
                y: positionY,
                'transform': 'rotate(-90 ' + (positionX + 22) + ' ' + (positionY) +')'
            });

        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.TITLE_HEADER)
            .select('text')
            .selectAll('tspan')
            .transition().duration(CapitalExpense.Animation.columnShift)
            .attr({
                x: positionX + 22,
                y: positionY
            });
        d3.select(this._viewId)
            .select('.' + CapitalExpense.ClassType.INFO_HEADER)
            .select('text')
            .selectAll('tspan')
            .transition().duration(CapitalExpense.Animation.columnShift)
            .attr({
                x: positionX + 22,
                //y: positionY
            });
    },
    /*
     * Collapse the button for collapse
     */
    _collapseCollapseButton: function (positionX){
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
     * Expand the button for collapse
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
     * Shift the button for collapse
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
     * Hide the switch marker
     */
    _hideSwitchMenu: function () {
        var switchMenu = d3.select(this._viewId  + '_menu');
        if (switchMenu) {
            d3.select(this._viewId + '_menu').style({
                display: 'none',
                opacity: 0
            });
        }
    },
    /*
     * Show the switch marker
     */
    _showSwitchMenu: function (delay) {
        var switchMenu = d3.select(this._viewId + '_menu');

        if (switchMenu) {
            if (typeof delay != 'undefined') {
                d3.select(this._viewId  + '_menu')
                    .style({
                        display: 'block',
                        opacity: 1
                    });
            } else {
                d3.select(this._viewId  + '_menu')
                    .transition().delay(CapitalExpense.Animation.columnShow)
                    .style({
                        display: 'block',
                        opacity: 1
                    });
            }

        }
    },
    /*
     * Perform the transposition of view column
     */
    _transitionView: function (duration, backgroundConfig, titleConfig, valueConfig, percentConfig) {
        backgroundConfig['duration'] = duration;
        titleConfig['duration'] = duration;
        if (valueConfig) {
            valueConfig['duration'] = duration;
            CapitalExpense.SVG.transitionStaticText(this._viewId, CapitalExpense.ClassType.VALUE_HEADER, valueConfig);
        }
        if (percentConfig) {
            percentConfig['duration'] = duration;
            CapitalExpense.SVG.transitionDynamicText(this._viewId, CapitalExpense.ClassType.INFO_HEADER, percentConfig);
        }
        CapitalExpense.SVG.transitionBackground(this._viewId, backgroundConfig);
        CapitalExpense.SVG.transitionDynamicText(this._viewId, CapitalExpense.ClassType.TITLE_HEADER, titleConfig);
    }
}, {
    textColorDark: '#000000',
    textColorLight: '#ffffff',
    borderOfDarkAndLigthColor: '#6ec49a',
    columnWidth: 270,
    columnCatagoriesWidth: 150,
    gapBetweenColumns: 10,
    heightHeader: 125
});


