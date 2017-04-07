/*
 *  Handles collapse/expand actions.
 *  Hides or shows columns and updates zoom highlighting and tooltips.
 *  */
var MatrixCollapseController = Base.extend({
    _manager: null,
    _eventManager: null,
    /*
     * Constructor
     *  @manager: view manager
     */
    constructor: function (manager) {
        this._manager = manager;
        this._eventManager = this._manager.getEventManager();
        this._initEvent();
    },
    /*
     * Initialize the events work with the controller
     */
    _initEvent: function () {
        this._eventManager.addEventListener('onCollapse', function (column, reLoad) {
            this._collapse(column, reLoad);
        }, this);
    },
    /*
     * Perform the collapse/expand column
     *  @column: the column object
     */
    _collapse: function (column, reLoad) {
        this._eventManager.callEvent('calculatePosition', []);
        var positionX = this._eventManager.callEvent('getColumnPosition', [column.getColumnIndex()]);
        var isShowTooltip = (column.getType() == CapitalExpense.Constants.C3) && this._eventManager.callEvent('onCheckHighlightAnalyticBox', []);
        var data = {
            id: column.getValue(CapitalExpense.Constants.BOX_ID)
        };
        if (column.isCollapse()) {
            column.collapse(positionX);
            if (isShowTooltip) {
                this._eventManager.callEvent('onZoomInTooltip', []).hide();
            }
            data.action = true;
        } else {
            column.expand(positionX);
            if (isShowTooltip) {
                this._eventManager.callEvent('onZoomInTooltip', []).show();
            }
            data.action = false;
        }
        this._eventManager.callEvent('writeSidecar', ['Collapse', data]);
        this._shiftColumns(column, reLoad);
    },
    /*
     * Perform the shift columns after the events of "Collapse"
     */
    _shiftColumns: function (collapseColumn, reLoad) {
        var dataStore = this._eventManager.callEvent('getDataStore', []);

        var isStartingShift = false;
        var width = 0;
        var columnPrev;
        var scope = this;
        dataStore.eachColumn(function (column) {
            var columnWidth = scope._calculateViewWidth(column, columnPrev);
            width += columnWidth + 10;
            if (isStartingShift) {
                var positionX = scope._eventManager.callEvent('getColumnPosition', [column.getColumnIndex()]);
                column.shift(positionX, reLoad);
                switch (column.getType()) {
                    case CapitalExpense.Constants.C1:
                    case CapitalExpense.Constants.C2:
                        column.eachRollUp(function (rollUp) {
                            rollUp.shift(positionX);
                        });
                        positionX += RollUp.getWidth();
                        column.eachBox(function (box) {
                           box.shift(positionX);
                        });
                        columnPrev = column;
                        break;
                    case CapitalExpense.Constants.C3:
                        width -= 10;
                        if (columnPrev.isCollapse()) {
                            width -= columnWidth;
                            column.hide();
                            this._eventManager.callEvent('onZoomInTooltip', []).hide();
                        } else {
                            if (column.isCollapse()) {
                                column.showHeader();
                            } else {
                                column.show();
                                this._eventManager.callEvent('onZoomInTooltip', []).show();
                            }
                        }
                        column.eachBox(function (analyticBox) {
                            var positionBox = 0;
                            if (scope._eventManager.callEvent('onCheckHighlightAnalyticBox', [analyticBox])) {
                                positionBox = positionX;
                                scope._eventManager.callEvent('onZoomInTooltip', []).shift(positionBox);
                            } else {
                                positionBox = positionX + analyticBox.getColumnIndex() * analyticBox.getValue(CapitalExpense.Constants.WIDTH);
                            }
                            analyticBox.shift(positionBox);
                        });
                        break;
                }
            }
            if (collapseColumn.getID() == column.getID()) {
                isStartingShift = true;
                columnPrev = column;
            }
        });
        this._eventManager.callEvent('getConfig', []).width = width;
        this._eventManager.callEvent('onResizeSVG', []);
        this._eventManager.callEvent('afterCollapse', [this._manager.getDispatcher()]);
    },
    /*
     *  Calculate the width of the view
     */
    _calculateViewWidth: function (column, columnPrev) {
        var result = 0;
        var columnWidth;
        if (column.isCollapse()) {
            columnWidth = 30;
        } else {
            columnWidth = column.getValue(CapitalExpense.Constants.WIDTH);
        }
        result += columnWidth;
        if (columnPrev && (columnPrev.getType() != CapitalExpense.Constants.C3)) {
            result += ColumnData.gapBetweenColumns;
        }
        return result;
    }
});