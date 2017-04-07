/*
 * Calculates height of the box or column.
 */
var HeightCalculator = Base.extend({
    _column: null,
    _manager: null,
    /*
     * Constructor
     *  @column: the column
     *  @manager: the view manager
     */
    constructor: function (column, manager) {
        this._column = column;
        this._manager = manager;
    },
    /*
     * Calculate height the column
     */
    calculate: function () {
        switch (this._column.getType()) {
            case CapitalExpense.Constants.C1:
            case CapitalExpense.Constants.C2:
                var boxesHeight = this._manager.getConfig().height - ColumnData.heightHeader;
                boxesHeight -= (this._column.getCount(CapitalExpense.Constants.FR) - 1) * RollUp.gapBetweenRollUp;
                var minHeightContainer = this._column.getCount(CapitalExpense.Constants.BO) * Box.minHeight;
                if (boxesHeight < minHeightContainer) {
                    return minHeightContainer;
                } else {
                    this._calculateHeightColumnHeader();
                    this._calculateHeightBoxes(boxesHeight, minHeightContainer);
                    this._calculateHeightFinRollUp();
                    return boxesHeight;
                }
                break;
            case CapitalExpense.Constants.C3:
                this._calculateHeightColumnHeader();
                this._calculateHeightAnalyticBox();
                break;
        }
    },
    /*
     * Calculate height the boxes
     */
    _calculateHeightBoxes: function (heightContainer, minHeightContainer) {
        var adjustableHeight = heightContainer - minHeightContainer;
        var totalValue = 0;
        this._column.eachBox(function (box) {
            totalValue += Math.abs(box.getValue(CapitalExpense.Constants.VALUE)) / 1000000;
        });
        var scalaValue = adjustableHeight / totalValue;
        this._column.eachBox(function (box) {
            var boxHeight = (Math.abs(box.getValue(CapitalExpense.Constants.VALUE)) / 1000000) * scalaValue + Box.minHeight;
            box.setValue(CapitalExpense.Constants.HEIGHT, boxHeight);
        });
    },
    /*
     *   Calculate height the rollUps
     */
    _calculateHeightFinRollUp: function () {
        var rollUp;
        var rollUpHeight = 0;
        this._column.eachBox(function (box) {
            var boxRollUpId = box.getValue(CapitalExpense.Constants.FIN_ROLL_UP);
            if( rollUp) {
                if (boxRollUpId == rollUp.getValue(CapitalExpense.Constants.BOX_ID)) {
                    rollUpHeight += box.getValue(CapitalExpense.Constants.HEIGHT);
                } else {
                    rollUp.setValue(CapitalExpense.Constants.HEIGHT, rollUpHeight);
                    rollUpHeight = box.getValue(CapitalExpense.Constants.HEIGHT);
                    rollUp = this.getElementByID(boxRollUpId, CapitalExpense.Constants.FR);
                }
            } else {
                rollUp = this.getElementByID(boxRollUpId, CapitalExpense.Constants.FR);
                rollUpHeight = box.getValue(CapitalExpense.Constants.HEIGHT);
            }
        });
        rollUp.setValue(CapitalExpense.Constants.HEIGHT, rollUpHeight);
    },
    /*
     *  Calculate height the analytic box
     */
    _calculateHeightAnalyticBox: function () {
        this._column.setValue(CapitalExpense.Constants.HEIGHT, this._manager.getConfig().height);
        this._column.eachBox(function (analyticBox) {
            var firstBox = analyticBox.getFirstBox();
            var lastBox = analyticBox.getLastBox();
            var height = lastBox.getValue(CapitalExpense.Constants.POSITION_Y) - firstBox.getValue(CapitalExpense.Constants.POSITION_Y) + lastBox.getValue(CapitalExpense.Constants.HEIGHT);
            analyticBox.setValue(CapitalExpense.Constants.HEIGHT, height);
        });
    },
    _calculateHeightColumnHeader: function() {
        this._column.setValue(CapitalExpense.Constants.HEIGHT, ColumnData.heightHeader);
    }
});
/*
 * Calculates width of the box or column.
 */
var WidthCalculator = {
    _column: null,
    _configStore: null,
    /*
     * Calculate width the column
     */
    calculate: function (column) {
        if (column) {
            this._column = column;
        }
        switch (this._column.getType()) {
            case CapitalExpense.Constants.C1:
            case CapitalExpense.Constants.C2:
                this._calculateWidthColumnHeader(ColumnData.columnWidth);
                this._calculateWidthBoxes();
                this._calculateWidthFinRollUp();
                break;
            case CapitalExpense.Constants.C3:
                this._calculateWidthColumnHeader(AnalyticColumn.width);
                this._calculateWidthAnalyticBox();
                break;
        }
    },
    /*
     * Calculate width the boxes
     */
    _calculateWidthBoxes: function () {
        this._column.eachBox(function (box) {
            var boxWidth = ColumnData.columnWidth  -  RollUp.getWidth();
            box.setValue(CapitalExpense.Constants.WIDTH, boxWidth);
        });
    },
    /*
     * Calculate width the rollUps
     */
    _calculateWidthFinRollUp: function () {
        this._column.eachRollUp(function (rollUp) {
            rollUp.setValue(CapitalExpense.Constants.WIDTH, RollUp.getWidth());
        });
    },
    /*
     * Calculate width the column height
     */
    _calculateWidthColumnHeader: function(width) {
        this._column.setValue(CapitalExpense.Constants.WIDTH, width);
    },
    /*
     * Calculate width the analytic box
     */
    _calculateWidthAnalyticBox: function () {
        var width =  AnalyticColumn.width / 5;
        this._column.eachBox(function (analyticBox) {
            analyticBox.setValue(CapitalExpense.Constants.WIDTH, width);
        });
    }
};
/*
 * Calculates position X and Y of the box or column.
 */
var PositionCalculator = {
    _column: null,
    /*
     * Public: Calculate position the column
     */
    calculate: function (column, startPosition) {
        if (column) {
            this._column = column;
        }
        switch (this._column.getType()) {
            case CapitalExpense.Constants.C1:
            case CapitalExpense.Constants.C2:
                this._calculatePosition(startPosition);
                break;
            case CapitalExpense.Constants.C3:
                this._calculatePositionAnalyticColumn(startPosition);
                break;
        }
    },
    /*
     * Private: Calculate position the column
     */
    _calculatePosition: function (startPosition) {
        this._column.setValue(CapitalExpense.Constants.POSITION_X, startPosition.X);
        this._column.setValue(CapitalExpense.Constants.POSITION_Y, 0);
        var rollUp;
        var positionX_Box = startPosition.X + RollUp.getWidth();
        var positionY = startPosition.Y;
        this._column.eachBox(function (box) {
            var boxRollUpId = box.getValue(CapitalExpense.Constants.FIN_ROLL_UP);
            if( rollUp) {
                if (boxRollUpId != rollUp.getValue(CapitalExpense.Constants.BOX_ID)) {
                    positionY +=  RollUp.gapBetweenRollUp;
                    rollUp = this.getElementByID(boxRollUpId, CapitalExpense.Constants.FR);
                    rollUp.setValue(CapitalExpense.Constants.POSITION_X, startPosition.X);
                    rollUp.setValue(CapitalExpense.Constants.POSITION_Y, positionY);
                }
            } else if (valueExistsNotEmpty(boxRollUpId)) {
                rollUp = this.getElementByID(boxRollUpId, CapitalExpense.Constants.FR);
                rollUp.setValue(CapitalExpense.Constants.POSITION_X, startPosition.X);
                rollUp.setValue(CapitalExpense.Constants.POSITION_Y, startPosition.Y);
            }
            box.setValue(CapitalExpense.Constants.POSITION_X, positionX_Box);
            box.setValue(CapitalExpense.Constants.POSITION_Y, positionY);
            positionY += box.getValue(CapitalExpense.Constants.HEIGHT);
        });
    },
    /*
     * Calculate position the analytic column
     */
    _calculatePositionAnalyticColumn: function (startPosition) {
        var positionX = startPosition.X;
        var width = 0;
        this._column.setValue(CapitalExpense.Constants.POSITION_X, positionX);
        this._column.setValue(CapitalExpense.Constants.POSITION_Y, 0);
        var analyticBox;
        for(var index = 0; index < 5; index++) {

            this._column.eachBox(function (analyticBox) {
                if (index == analyticBox.getColumnIndex()) {
                    var firstBox = analyticBox.getFirstBox();
                    var positionY = firstBox.getValue(CapitalExpense.Constants.POSITION_Y);
                    analyticBox.setValue(CapitalExpense.Constants.POSITION_Y, positionY);
                    analyticBox.setValue(CapitalExpense.Constants.POSITION_X, positionX);
                    width = analyticBox.getValue(CapitalExpense.Constants.WIDTH);
                }
            });
            positionX += width;
        }
    }
};
/*
 * Calculates text color of the box or column.
 *  */
var ColorCalculator = {
    /*
     * Calculate text color for the column
     */
    calculateTextColor: function (currentColor, config) {
        var border = this._hexToDex(config.borderOfDarkAndLigthColor.substring(1));
        var value = currentColor.substring(2);
        value = this._hexToDex(value);
        if (border > value) {
            return config.textColorLight;
        } else {
            return config.textColorDark;
        }
    },
    /*
     * Convert hex to dex
     */
    _hexToDex: function ( num ) {
        var result = 0;
        var max = num.toString().length-1;
        for (var i=max; i>=0; i--) {
            var digit = num.charAt(i).toUpperCase();
            switch(digit) {
                case "A": digit = 10; break;
                case "B": digit = 11; break;
                case "C": digit = 12; break;
                case "D": digit = 13; break;
                case "E": digit = 14; break;
                case "F": digit = 15; break;
            }
            result += digit * Math.pow(16, +max-i);
        }
        return result;
    }
};