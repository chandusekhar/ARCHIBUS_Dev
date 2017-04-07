/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-request-view-select.axvw' target='main'>ab-helpdesk-request-view-select.axvw</a>
 */


/**
 * Called when form is loading<br />
 * Adds empty option for status field in filter
 */
function user_form_onload(){
	var tabs = getFrameObject(parent,'tabsFrame');
	if(tabs != null){
		tabs.setTabEnabled('view', false);
		tabs.setTabEnabled('viewArchived', false);
	}
}

var legendGridController = View.createController('legendGrid', {
    
    /**
     * Called after the request grid is refreshed to display color codes in grid cells.
     */
    requestGrid_afterRefresh: function() {
        
        // for all grid rows (Ab.grid.Row objects)
        this.requestGrid.gridRows.each(function(row) {
            
            // get wr.status for this row
            var status = row.getRecord().getValue('activity_log.status');
            
            // map status to color
            var color = '#f5f5f5';
            switch (status) {
                case 'REQUESTED':   color = '#fe4'; break;
                case 'APPROVED':   color = '#ccf'; break;
                case 'IN PROGRESS':   color = '#bbf'; break;
                case 'COMPLETED':  color = '#aaf'; break;
                case 'CLOSED': color = '#8f8'; break;
            }
            Ext.get(row.dom).setStyle('background-color', color);
            /*// get the id="legend" cell for this row (Ab.grid.Cell object)
            var cell = row.cells.get('legend');
            
            // set cell background color
            Ext.get(cell.dom).setStyle('background-color', color);*/
        });
    }
});