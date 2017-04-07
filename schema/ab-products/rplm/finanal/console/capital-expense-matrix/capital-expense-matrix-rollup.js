/*
 * Defines a principal Roll Up fields values by restricting to the boxes.
 * Provides an API to show, hide, resize, and shift a box.
 */
var RollUp = Base.extend({
        _id: null,
        _data: null,
        _columnIndex: null,
        _eventManager: null,
        /*
         * Constructor
         *  @record: rollUp information
         *  @columnIndex: the index of the column in which the element is located
         *  @eventManager: event manager
         * */
        constructor: function (record, columnIndex, eventManager) {
            this._columnIndex = columnIndex;
            this._eventManager = eventManager;
            if (record) {
                this._data = record;
                this._id = '#' + record.getValue(CapitalExpense.Constants.BOX_ID);
            }
            var isCreate = d3.select('#tooltip_' + this.getValue(CapitalExpense.Constants.BOX_ID)).node();
            if (isCreate != null) {
                d3.select('#tooltip_' + this.getValue(CapitalExpense.Constants.BOX_ID)).remove();
            }
            this._tooltip = d3.tip()
                .offset(function (data) {
                    var offsetLeft = (ColumnData.columnWidth - RollUp.getWidth()) / 2 - 5;
                    var offsetTop = data.getValue(CapitalExpense.Constants.HEIGHT) / 3.5;
                    return [offsetTop,  offsetLeft];
                })
                .attr('class', 'capitalExpenseMatrixRollUpTooltip')
                .attr('id', 'tooltip_' + this.getValue(CapitalExpense.Constants.BOX_ID))
                .html(this._renderTooltip);


        },
        /*
         * Set a database field from database data the matrix element
         *  @field: field of the box
         *  @value: value
         */
        setValue: function (type, value) {
            this._data.setValue(type,value);
        },
        /*
         * Get a database field from database data the matrix element
         *  @field: field of the box
         */
        getValue: function (field) {
            return this._data.getValue(field);
        },
        /*
         * Perform the render rollUp.
         * Is drawing the background and header of rollUp.
         * Initialized the mouseover and mouseout events
         *      @container: area add box
         */
        render: function (container) {
            var rollUpContainer = CapitalExpense.SVG.renderBackground( this,
                {
                    type: 'rollUp',
                    container: container,
                    border: {
                        color: '#ffffff',
                        size: '1px'
                    }
                }
            );
            var data = this;
            rollUpContainer.call(this._tooltip);
            rollUpContainer.on ('mouseover', function () {
                data._tooltip.show(data);
            });
            rollUpContainer.on ('mouseout', function () {
                data._tooltip.hide();
            });
            var positionX = this.getValue(CapitalExpense.Constants.POSITION_X);
            var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + this.getValue(CapitalExpense.Constants.HEIGHT) /2 ;
            var textColor =  ColorCalculator.calculateTextColor(this.getValue(CapitalExpense.Constants.BGK_COLOR), RollUp);
            var attr = {
                x: positionX,
                y: positionY,
                'text-anchor': 'middle',
                width: this.getValue(CapitalExpense.Constants.HEIGHT) - 10,
                height: this.getValue(CapitalExpense.Constants.WIDTH),
                color: textColor,
                fill: textColor,
                'transform': 'rotate(-90 ' + positionX +' '+ positionY +')',
                type: CapitalExpense.Constants.FR
            };
            var style = {
                'text-align': 'center',
                overflow: 'hidden',
                'vertical-align': 'center',
                width: '100%',
                height: '100%'
            };

            CapitalExpense.SVG.renderDynamicText('textRollUpTitle', rollUpContainer,
                {
                    attr: attr,
                    style: style,
                    text: this.getValue(CapitalExpense.Constants.BOX_TITLE)
                },
                true
            );
        },
        /*
         * Show all the elements of rollUp
         */
        show: function () {
            CapitalExpense.SVG.displayView(this._id, 1, CapitalExpense.Animation.rollupShow);
        },
        /*
         * Hide all the elements of rollUp
         */
        hide: function () {
            CapitalExpense.SVG.displayView(this._id, 0, CapitalExpense.Animation.rollupHide);
        },
        /*
         * Move the rollUp for "Collapse" event
         */
        shift: function (positionX, positionY) {
            var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + this.getValue(CapitalExpense.Constants.HEIGHT) / 2 ;
            var length = d3.select(this._id).select('.textRollUpTitle').select('text').selectAll('tspan')[0].length;
            var positionXText = positionX;
            if (length == 1) {
                positionXText += 5;
            }
            this._transitionView(800,
                {
                    x: positionX
                },
                {
                    x: positionXText,
                    'transform': 'rotate(-90 ' + (positionXText) +' '+ positionY +')'
                }
            );
        },
        /*
         * Resize the size of the rollUp height relative to the overall size of the matrix
         */
        resize: function () {
            this._eventManager.callEvent('calculatePosition', []);
            var positionX = this._eventManager.callEvent('getColumnPosition', [this._columnIndex]);
            var positionY = this.getValue(CapitalExpense.Constants.POSITION_Y) + this.getValue(CapitalExpense.Constants.HEIGHT) / 2 ;
            this._transitionView(0,
                {
                    y: this.getValue(CapitalExpense.Constants.POSITION_Y),
                    height: this.getValue(CapitalExpense.Constants.HEIGHT)
                },
                {
                    x: positionX,
                    y: positionY,
                    'transform': 'rotate(-90 ' + (positionX) +' '+ positionY +')',
                    width: this.getValue(CapitalExpense.Constants.HEIGHT) - 10,
                    height: this.getValue(CapitalExpense.Constants.WIDTH),
                    text: this.getValue(CapitalExpense.Constants.BOX_TITLE),
                    type: CapitalExpense.Constants.FR
                }
            );
        },
        /*
         * Perform the transposition of view rollUp
         */
        _transitionView: function (duration, backgroundConfig, titleConfig) {
            var id = this._id;
            backgroundConfig['duration'] = duration;
            titleConfig['duration'] = duration;
            CapitalExpense.SVG.transitionBackground(id, backgroundConfig);
            CapitalExpense.SVG.transitionDynamicText(id, 'textRollUpTitle', titleConfig);

        },
        /*
         * Render tooltip the rollUp
         */
        _renderTooltip: function (data) {
            var width = ColumnData.columnWidth - RollUp.getWidth();
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
        }


    },
    {
        textColorDark: '#000000',
        textColorLight: '#ffffff',
        borderOfDarkAndLigthColor: '#6ec49a',
        gapBetweenRollUp: 5,
        getWidth: function () {
            return ColumnData.columnWidth * 0.15;
        }
    }
);