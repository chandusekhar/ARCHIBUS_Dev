var commEqByDpController = View.createController('commEqByDp', {
	afterViewLoad : function() {
		this.inherit();
		
		this.panel_abApEqByDp_details.afterCreateCellContent = function(row, column, cellElement) {
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
	
	panel_abApEqByDp_console_onShow: function() {
		this.setParameter('dvId' ,'eq.dv_id' );
		this.setParameter('dpId' ,'eq.dp_id' );
		
		this.panel_abApEqByDp_dv.refresh();
		this.panel_abApEqByDp_details.refresh(this.panel_abApEqByDp_console.getFieldRestriction());
		this.panel_abApEqByDp_details.show(true);	
	},
	
	setParameter: function(paramName, fieldName){
		
		var consoleField = this.panel_abApEqByDp_console.getFieldValue(fieldName)  
		if(valueExistsNotEmpty(consoleField)){
			this.panel_abApEqByDp_dv.addParameter(paramName , " AND "+fieldName+" LIKE '"+consoleField+"'");	
		}else{
			this.panel_abApEqByDp_dv.addParameter(paramName , "");	
		}
	}
});

/**
 * generate paginated report for user selection
 */
function abApEqByDp_paginatedReport(button){
	var restriction = button.restriction;
	var restrictions = null;
	
	restrictions = {
		'ds_abApEqByDpPgrp': restriction,
		'ds_abApEqByDpPgrp_details': restriction
	};
			
	View.openPaginatedReportDialog('ab-comm-eq-by-dp-pgrp.axvw', restrictions);
}

