var workrequestDetailsController = View.createController('workrequestDetailsGrid', {	
	
	/**
	 * Opens popup with estimation for current request<br />
	 * Called by 'Show Estimation' button
	 */
	wrDetailsPanel_onShowEstimation: function(){ 
		View.openDialog("ab-helpdesk-manager-search-estimation.axvw", this.getWorkRequestRestriction(), false);
	},

	/**
	 * Opens popup with schedule for current request<br />
	 * Called by 'Show Schedule' button
	 */
	wrDetailsPanel_onShowSchedule: function(){ 
		View.openDialog("ab-helpdesk-manager-search-scheduling.axvw", this.getWorkRequestRestriction(), false);
	},
	
	wrDetailsPanel_onShowStepHistory:function(){
		var record = this.wrDetailsPanel.getRecord();	
		var stepLogRestriction = new Ab.view.Restriction();
			//table name = wr or hwr
			stepLogRestriction.addClause('helpdesk_step_log.field_name','wr_id','=','AND');
			stepLogRestriction.addClause('helpdesk_step_log.pkey_value',record.getValue('wrhwr.wr_id'),'=','AND');
		View.openDialog("ab-helpdesk-manager-search-step-history.axvw",stepLogRestriction,false);
	},
	
	getWorkRequestRestriction: function() {
		var restriction = new AFM.view.Restriction();
		var record = this.wrDetailsPanel.getRecord();
		restriction.addClause('wr.wr_id', record.getValue('wrhwr.wr_id'),'=');
		return restriction;
	}
});