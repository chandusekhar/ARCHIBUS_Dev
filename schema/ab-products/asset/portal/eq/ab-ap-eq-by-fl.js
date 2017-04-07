/*
 * controller definition  
 */
var abApEqByFlController = View.createController('abApEqByFl', {
	
	// filter action from console panel 
	panel_abApEqByFl_console_onShow :function(){
		
		this.setParameter('blId' ,'eq.bl_id' );
		this.setParameter('flId' ,'eq.fl_id' );
		
		// refresh tree
		this.treeAbApEqByFl_bl.refresh();
		
		// hide details panel
		this.panel_abApEqByFl_details.show(false);
	} ,
	
	/*
	 *  set restriction parameters for treeAbApEqByFl 
	 *  @ paramName - parameter to be set
	 *  @ fieldName - the console field to be read
	 */
	setParameter: function(paramName ,fieldName){
		
		var consoleField = this.panel_abApEqByFl_console.getFieldValue(fieldName)  
		if(valueExistsNotEmpty(consoleField)){
			this.treeAbApEqByFl_bl.addParameter(paramName , " and "+fieldName+" = '"+consoleField+"'");	
		}else{
			this.treeAbApEqByFl_bl.addParameter(paramName , "");	
		}
	}	
	
	
	
});

/**
 * generate paginated report for user selection
 */
function abApEqByFl_paginatedReport(button){
	var parameters = null;
	var restriction = button.restriction;
	var restrictions = null;
	
	restrictions = {
		'ds_abApEqByFlPgrp': restriction,
		'ds_abApEqByFlPgrp_details': restriction
	};
			
	View.openPaginatedReportDialog('ab-ap-eq-by-fl-pgrp.axvw', restrictions, parameters);
}

