/**
 * controller definition
 */
var abApJkByFlController = View.createController('abApJkByFlCtrl',{
	
	// filter action from console panel 
	panel_abApJkByFl_console_onShow :function(){
		
		this.setParameter('blId' ,'jk.bl_id' );
		this.setParameter('flId' ,'jk.fl_id' );
		
		// refresh tree
		this.treeAbApJkByFl_bl.refresh();
		
		// hide details panel
		this.panel_abApJkByFl_jk.show(false);
	} ,
	
	/*
	 *  set restriction parameters for treeAbApJkByFl 
	 *  @ paramName - parameter to be set
	 *  @ fieldName - the console field to be read
	 */
	setParameter: function(paramName ,fieldName){
		
		var consoleField = this.panel_abApJkByFl_console.getFieldValue(fieldName)  
		if(valueExistsNotEmpty(consoleField)){
			this.treeAbApJkByFl_bl.addParameter(paramName , " and "+fieldName+" = '"+consoleField+"'");	
		}else{
			this.treeAbApJkByFl_bl.addParameter(paramName , "");	
		}
	},	
	
	panel_abApJkByFl_console_onPaginatedReport: function(){
		var bl_id = this.panel_abApJkByFl_console.getFieldValue('jk.bl_id');
		var fl_id = this.panel_abApJkByFl_console.getFieldValue('jk.fl_id');
		var consoleRestriction = "";
		var parameters = null;
		
		if (valueExistsNotEmpty(bl_id)) {
			consoleRestriction += (consoleRestriction!="" ? " AND " : ""); 
			consoleRestriction += "jk.bl_id='" + bl_id + "'";
		}
		if (valueExistsNotEmpty(fl_id)) {
			consoleRestriction += (consoleRestriction!="" ? " AND " : ""); 
			consoleRestriction += "jk.fl_id='" + fl_id + "'";
		}

		if(consoleRestriction != "") {
			parameters = {
				'consoleRestriction': consoleRestriction
			};
		}
		
		View.openPaginatedReportDialog('ab-ap-jk-by-fl-pgrp.axvw', null, parameters);
	}
});
