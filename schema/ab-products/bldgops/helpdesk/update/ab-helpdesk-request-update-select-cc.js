/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-request-update-select.axvw' target='main'>ab-helpdesk-request-update-select.axvw</a>
 */

/**
 * Called when form is loading<br />
 * Adds empty option for status field in filter
 */
function user_form_onload(){	
	var tabs = getFrameObject(parent,'tabsFrame');
	if(tabs != null){
		tabs.setTabEnabled('update', false);
	}
}

var legendGridController = View.createController('legendGrid', {
    
    /**
     * Called after the request grid is refreshed to display color codes in grid cells.
     */
    requestGrid_afterRefresh: function() {
        
        // for all grid rows (Ab.grid.Row objects)
        this.requestGrid.gridRows.each(function(row) {
            
            var color = '#f5f5f5';
            if(row.getRecord().getValue('activity_log.date_escalation_completion') != ""){
	            var dateEscComp = row.getRecord().getValue('activity_log.date_escalation_completion');
							
				var dateEC = new Date();
				dateEC.setYear(getDateArray(dateEscComp)['year'])
				dateEC.setDate(getDateArray(dateEscComp)['day']);
				dateEC.setMonth(getDateArray(dateEscComp)['month']-1);
	            var now = new Date();
	            var timeNow = now.getTime();
	            var timeEC = dateEC.getTime();
	            var diff = timeNow - timeEC;
	            
	            if(diff > 432000000){
	            	color = '#00FF00';
	            } else if (diff > 86400000){
	            	color = '#FFFF00';
	            } else if(diff > 0){            	
	            	color = "#FF8A00";
	            } else {
	            	color = "#FF0000";
	            }
            }
            
            Ext.get(row.dom).setStyle('background-color', color);
        });
    }
});