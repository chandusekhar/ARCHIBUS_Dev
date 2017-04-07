/*
 * controller definition  
 */
var abApFtByDpController = View.createController('abApFtByDp', {
	
	// filter action from console panel 
	abApFtByDp_console_onFilter :function(){
		
		this.setParameter('dvId' ,'ta.dv_id' );
		this.setParameter('dpId' ,'ta.dp_id' );
		
		// refresh tree
		this.treeAbApFtByDp_dv.refresh();
		
		// hide details panel
		this.abApFtByDp_details.show(false);
	} ,
	
	/*
	 *  set restriction parameters for treeAbApFtByDp_dv and abApFtByDp_details panels
	 *  @ paramName - parameter to be set
	 *  @ fieldName - the console field to be read
	 */
	setParameter: function(paramName ,fieldName){
		
		var consoleField = this.abApFtByDp_console.getFieldValue(fieldName)  
		if(valueExistsNotEmpty(consoleField)){
			this.treeAbApFtByDp_dv.addParameter(paramName , " and "+fieldName+" = '"+consoleField+"'");	
			this.abApFtByDp_details.addParameter(paramName , " and "+fieldName+" = '"+consoleField+"'");;
		}else{
			this.treeAbApFtByDp_dv.addParameter(paramName , "");	
			this.abApFtByDp_details.addParameter(paramName , "");
		}
	}	
	
	
	
});

/*
 * generate paginated report
 */
function generateReport(){

    var controller = abApFtByDpController;
	var restriction = controller.abApFtByDp_console.getRecord().toRestriction();
	View.openPaginatedReportDialog('ab-ap-ft-by-dp-pgrp.axvw',{'dsAbApFtByDp_parent':restriction,'dsAbApFtByDp_data':restriction});
}
