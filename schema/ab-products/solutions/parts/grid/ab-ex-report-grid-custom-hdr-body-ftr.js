// Example for customizing the Ab.grid.ReportGrid
// This same code will work with a miniConsole control because the Ab.grid.MiniConsole is derived from the Ab.grid.ReportGrid
//
// Add an additional row at the very top of the grid by overriding a function called by all (re)building processes  - buildPreHeaderRows(parentElement)
// Style a whole row based on the value of one of the columns
// Style a row cell based on the value of one of the cell
// Add an additional row after the grid by overriding a function called by all (re)building processes  - buildPreFooterRows(parentElement)
//

View.createController('gridWithHeaderAndFooter', {
    /**
     * Override grid methods that create data rows.
     */
    afterViewLoad: function() {
        var grid = this.reportGridCustomHdrBodyFtr_grid;

        /**
         * Redefine the class function afterCreateDataRows().
         * In this case, depending on column and value, reset the style of the row.
         *
         */
        grid.afterCreateDataRows = function(parentElement, columns) {
            // get array of dataRow elements
            var dataRows = Ext.query('tr.dataRow', grid.tableBodyElement);
            // iterate over the rows
            for (var i=0, row; row = dataRows[i]; i++) {
                // row children are <td /> elements
                var children = row.childNodes;
                // test column name & value to see if row should be highlighted (here if the floor == '17')
                for (var j = 0; j < grid.columns.length ; j++) {
                    if (grid.columns[j].id == 'rm.fl_id' && children[j].innerHTML == '17') {
                        row.style.background = (i%2 != 0) ? '#DDDDDD' : '#FFF8DF';
                    }
                }
            }
        }

        /**
         * Redefine the class function afterCreateCellContent().
         * In this case, customize the style of a room area cell depending on its value
         *
         */
        grid.afterCreateCellContent = function(row, column, cellElement) {
            var value = row[column.id];
            // set cell style depending on cell value, if cell has target id
            if (column.id == 'rm.area' && value != '' && value < 100)	{
                if (value <= 0)	{
                    var contentElement = cellElement.childNodes[0];
                    contentElement.nodeValue = '(' + contentElement.nodeValue + ')';
                    cellElement.style.color = 'Red';
                }
                else {
                    cellElement.style.color = 'Blue';
                }
            }
        }
    },

    /**
     * Refresh the grid using overwritten methods.
     */
    afterInitialDataFetch: function() {
        this.reportGridCustomHdrBodyFtr_grid.refresh();
    }
});