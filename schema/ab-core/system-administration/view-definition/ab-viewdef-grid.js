

/* ViewDefGrid class.  Simple extensions to AFM.grid.Grid to help
 * build forms for the ViewDef Wizard.
 */
AFM.grid.ViewDefGrid = AFM.grid.Grid.extend({

    /* Inherit AFM.grid's constructor as is.  */
    
    constructor: function(controlId, rows, columns, cssClassName){
        this.inherit(controlId, rows, columns, cssClassName);
    },
    
    /* Return text of the given cell from the DOM.  Or return true or
     * false if this is a checkbox.
     */
    getCellValue: function(nrow, ncolumn){
        var cell = this.getCell(nrow, ncolumn); // Get DOM element
        if (this.columns[ncolumn].type == 'checkbox') {
            return (cell.childNodes[0].checked);
        }
        else 
            if (this.columns[ncolumn].type == 'text') {
                return (cell.childNodes[0].nodeValue); // Return value of DOM  element
            }
    },
    
    /* Set the value of the given cell.  Give a text "val"
     * for text columns and true/false for checked columns.  These
     * values are just in the DOM: they display right away but will
     * disappear with the next grid re-build().
     */
    setCellValue: function(nrow, ncolumn, val){
        if (val == undefined) // make sure the value has a value
            return;
        var cell = this.getCell(nrow, ncolumn); // Get DOM element
        if (this.columns[ncolumn].type == 'checkbox') {
            cell.childNodes[0].checked = val;
        }
        else 
            if (this.columns[ncolumn].type == 'text') {
                cell.childNodes[0].nodeValue = val;
            }
    },
    
    
    /*
     * Swap the values in this row with the next row.  Swap the rows
     * themselves and rebuild so that the row, the DOM cells, and the
     * row indicies all match.
     *
     * Don't use:
     *  [ grid_fields.rows[n], grid_fields.rows[n+1] ] = [ grid_fields.rows[n+1], grid_fields.rows[n] ] ;
     * as it works only on Firefox.
     */
    moveRowDown: function(n){
        if (n < (this.rows.length - 1)) { // don't move last row down.
            var row = grid_fields.rows[n];
            grid_fields.rows[n] = grid_fields.rows[n + 1];
            grid_fields.rows[n + 1] = row;
            this.build();
        }
    },
    
    
    /* Swap the values in this row with the previous row. */
    
    moveRowUp: function(n){
        if (n != 0) { // don't clobber the 1st row
            var row = grid_fields.rows[n];
            grid_fields.rows[n] = grid_fields.rows[n - 1];
            grid_fields.rows[n - 1] = row;
            this.build();
        }
    },
    
    /* Delete the row with the given index and redisplay the grid. */
    
    removeRowAndRebuild: function(nrow){
        grid_fields.removeRow(nrow);
        grid_fields.build();
    },
    
    
    nextFun: function(){
        alert('nextFun');
    }
    
    
}); // end class ViewDefGrid



