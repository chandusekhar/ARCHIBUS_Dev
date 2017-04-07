/*********************************************
 JavaScript File : ab-helpdesk-workrequest-select.js
 Date: 2009-06-08
 *********************************************/
var selectTabController = View.createController('selectTab', {
	
	  /**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.wr_report.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},

    /**
     * Actionhandler called by report row button Estimate/Schedule<br />
     * Select estimation or scheduling tab page depending on selected record
     * @param {object} row
     */
    wr_report_eschedule_onClick: function(row){
        var record = row.getRecord();
        var restriction = new Ab.view.Restriction();
        restriction.addClause('wr.wr_id', record.getValue("wr.wr_id"));
        restriction.addClause('wr_step_waiting.step_log_id', record.getValue('wr_step_waiting.step_log_id'));
        restriction.addClause('wr.wo_id', record.getValue('wr.wo_id'));
        
        var mainTabs = View.getControl('', 'mainTabs');
        var stepType = record.getValue('wr_step_waiting.step_type').toLowerCase();
        if (stepType == "estimation") {
            mainTabs.selectTab('estimate', restriction, false, false, false);
        }
        else 
            if (stepType == "scheduling") {
                mainTabs.selectTab('schedule', restriction, false, false, false);
            }
    },
    
    request_console_afterRefresh: function(){
        //set the value of the fields in console panel
        this.request_console.setFieldValue("wr.date_requested.from", '');
        this.request_console.setFieldValue("wr.date_requested.to", '');
        this.request_console.setFieldValue("wr.prob_type", '');
		
        var restr = window.selectRestriction;
        if (valueExists(restr)) {
            for (var i = 0, clause; clause = restr.clauses[i]; i++) {
                if (clause.name == 'wr.prob_type') {
                    this.request_console.setFieldValue("wr.prob_type", clause.value);
                }
                else 
                    if (clause.name == 'wr.date_requested') {
                        if (clause.op == "&gt;=") {
                            this.request_console.setFieldValue("wr.date_requested.from", clause.value);
                        }
                        else {
                            this.request_console.setFieldValue("wr.date_requested.to", clause.value);
                        }
                        
                    }
            }
        }
        this.wr_report.refresh();
    },
    wr_report_afterRefresh: function(){
		 highlightBySubstitute(this.wr_report, 'wr_step_waiting.user_name',  View.user.name);		 
	}
})
