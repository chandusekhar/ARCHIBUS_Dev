/*
 * controller definition  
 */
var abApEqByFlController = View.createController('abApEqByFl', {
	afterViewLoad : function() {
		this.inherit();
		
		this.panel_abApEqByFl_details.afterCreateCellContent = function(row, column, cellElement) {
        	var vf_remaining_yrs = row['eq.vf_remaining_yrs'];
			if (vf_remaining_yrs && vf_remaining_yrs <= 0.0)	{
				cellElement.style.background = '#66FF66';//Green
			}
			if (vf_remaining_yrs && vf_remaining_yrs < -5.0) {
				cellElement.style.background = '#FF6699';//Magenta
			}
        }
	},

	afterInitialDataFetch: function(){
		var title = View.taskInfo.taskId;
		if(View.title != title){
			View.setTitle(title);
		}
	},
	
	// filter action from console panel 
	panel_abApEqByFl_console_onShow :function(){
		
		this.setParameter('blId' ,'eq.bl_id' ); 
		this.setParameter('flId' ,'eq.fl_id' );
		
		// refresh tree
		this.treeAbApEqByFl_bl.refresh();
		this.panel_abApEqByFl_details.refresh(this.panel_abApEqByFl_console.getFieldRestriction());
		this.panel_abApEqByFl_details.show(true);
	} ,
	
	/*
	 *  set restriction parameters for treeAbApEqByFl 
	 *  @ paramName - parameter to be set
	 *  @ fieldName - the console field to be read
	 */
	setParameter: function(paramName, fieldName){
		
		var consoleField = this.panel_abApEqByFl_console.getFieldValue(fieldName)  
		if(valueExistsNotEmpty(consoleField)){
			this.treeAbApEqByFl_bl.addParameter(paramName , " AND "+fieldName+" LIKE '"+consoleField+"'");	
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
			
	View.openPaginatedReportDialog('ab-comm-eq-by-fl-pgrp.axvw', restrictions, parameters);
}

