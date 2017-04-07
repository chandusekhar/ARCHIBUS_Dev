/**
 * Controller for the Work request parts.
 */
var opsConsoleStepHistoryController = View.createController('opsConsoleStepHistoryController', {
	/**
     * Get step information
     */
	getStepInfo: function(){
		try {
			//call wfr to get all steps of the selected work request
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', 'wr','wr_id',this.wrDetails.getFieldValue('wr.wr_id'));
			var steps = eval('('+result.jsonExpression+')');
			
			//if no steps, hide history panel 
            if (steps.length == 0) {
                this.historyPanel.show(false);
            }
            else {
            	//if exists steps, show history panel and refresh the history panel 
            	this.historyPanel.show(true);
            	
            	//prepare restrition for history panel
                var restriction = new Ab.view.Restriction();
                if (steps.length == 1) {
                    restriction.addClause('helpdesk_step_log.step_log_id', steps[0].step_log_id, "=");
                }
                else {
                    restriction.addClause('helpdesk_step_log.step_log_id', steps[0].step_log_id, "=", ")AND(");
                    for (var i = 1, step; step = steps[i]; i++) {
                        restriction.addClause('helpdesk_step_log.step_log_id', step.step_log_id, "=", "OR");
                    }
                }
                
                //refresh the history panel
                this.historyPanel.refresh(restriction);
	         }
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	
    /**
     * Set history field
     */
	historyPanel_afterRefresh: function(){
		var rows = this.historyPanel.rows;
	    
	    var datetime = "";
	    for (var i = 0; i < rows.length; i++) {
	        var row = rows[i];
	        var user = "";
	        if (row['helpdesk_step_log.user_name']) 
	            user = row['helpdesk_step_log.user_name'];
	        if (row['helpdesk_step_log.em_id']) 
	            user = row['helpdesk_step_log.em_id'];
	        if (row['helpdesk_step_log.vn_id']) 
	            user = row['helpdesk_step_log.vn_id'];
	        row['helpdesk_step_log.vn_id'] = user;
	        
	        if (row["helpdesk_step_log.date_response"] == "" && row["helpdesk_step_log.time_response"] == "") {
	            datetime = getMessage("pending");
	        }
	        else {
	            datetime = row["helpdesk_step_log.date_response"] + " " + row["helpdesk_step_log.time_response"];
	        }
	        row['helpdesk_step_log.date_response'] = datetime;
	    }
	    this.historyPanel.reloadGrid();
    }

});