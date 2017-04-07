/*
 * controller definition  
 */
var abApTaByFlController = View.createController('abApTaByFl', {
	
	// filter action from console panel 
	abApTaByFl_console_onFilter :function(){
		
		this.setParameter('blId' ,'ta.bl_id' );
		this.setParameter('flId' ,'ta.fl_id' );
		
		// refresh tree
		this.treeAbApTaByFl_bl.refresh();
		
		// hide details panel
		this.abApTaByFl_details.show(false);
	} ,
	
	/*
	 *  set restriction parameters for treeAbApTaByFl_dv and abApTaByFl_details panels
	 *  @ paramName - parameter to be set
	 *  @ fieldName - the console field to be read
	 */
	setParameter: function(paramName ,fieldName){
		
		var consoleField = this.abApTaByFl_console.getFieldValue(fieldName)  
		if(valueExistsNotEmpty(consoleField)){
			this.treeAbApTaByFl_bl.addParameter(paramName , " and "+fieldName+" = '"+consoleField+"'");	
		}else{
			this.treeAbApTaByFl_bl.addParameter(paramName , "");	
		}
	}	
	
	
	
});

/*
 * generate paginated report
 */
function generateReport(){

    var controller = abApTaByFlController;
	var restriction = controller.abApTaByFl_console.getRecord().toRestriction();
	View.openPaginatedReportDialog('ab-ap-ta-by-fl-pgrp.axvw',{'dsAbApTaByFl_parent':restriction});
}
