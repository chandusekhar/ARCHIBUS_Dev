
/**
 * Example controller class.
 */
var legendGridController = View.createController('legendGrid', {
	afterViewLoad: function(){
       this.prgGridLegend_requestGrid.sortEnabled = false;
    },
    
    /**
     * Called after the request grid is refreshed to display color codes in grid cells.
     */
    prgGridLegend_requestGrid_afterRefresh: function() {
        // for all grid rows (Ab.grid.Row objects)
        this.prgGridLegend_requestGrid.gridRows.each(function(row) {
            
            // get wr.status for this row
            var status = row.getRecord().getValue('wr.status');
            
            // map status to color
            var color = '#f5f5f5';
            switch (status) {
                case 'R':   color = '#fe4'; break;
                case 'A':   color = '#ccf'; break;
                case 'I':   color = '#bbf'; break;
                case 'AA':  color = '#aaf'; break;
                case 'Com': color = '#8f8'; break;
                case 'HA':  color = '#f84'; break;
            }
            
            // get the id="legend" cell for this row (Ab.grid.Cell object)
            var cell = row.cells.get('legend');          
            
            
            // set cell background color
            Ext.get(cell.dom).setStyle('background-color', color);
        });
    }
});