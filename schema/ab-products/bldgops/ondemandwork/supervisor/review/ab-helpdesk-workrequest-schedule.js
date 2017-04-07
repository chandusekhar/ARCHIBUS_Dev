/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-workrequest-schedule.axvw' target='main'>ab-helpdesk-workrequest-schedule.axvw</a>
 */
/**
 * Called when loading the form
 * <div class='detailHead'>Pseudo-code:</div>
 *	<ol>
 *		<li>Disable all buttons if the current step type is not 'scheduling'</li>
 * 		<li>Create restriction and refresh panels for craftsperson and tool assignments</li>
 *	</ol>
 */
var wrscheduleController = View.createController('wrschedule', {
	
	  /**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.panel_schedule.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},

    panel_schedule_afterRefresh: function(){
		if (valueExists(this.panel_schedule.restriction)) {
			this.onInitialData();
		}
    },
    onInitialData: function(){
        if (this.panel_schedule.getFieldValue("wr_step_waiting.step_type").toLowerCase() != "scheduling") {
            ABODC_disableAllButtons();
        }
        var wr = this.panel_schedule.getFieldValue("wr.wr_id");
        
        // pass restriction to grid panel
        var trrest = new Ab.view.Restriction();
        trrest.addClause("wrtr.wr_id", wr, '=');
        this.tr_report.refresh(trrest);
        
        var cfrest = new Ab.view.Restriction();
        cfrest.addClause("wrcf.wr_id", wr, '=');
        this.cf_report.refresh(cfrest);
        
        var tlrest = new Ab.view.Restriction();
        tlrest.addClause("wrtl.wr_id", wr, '=');
        this.tool_report.refresh(tlrest);
    }
    
})


/**
 * Complete work request schedule<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#completeScheduling(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-completeScheduling</a><br />
 * Called by 'Complete Schedule' button<br />
 * Reloads select tab
 * @param {String} form current form
 */
function completeScheduling(formId){
	var form = View.panels.get(formId);
    var record = ABODC_getDataRecord2(form);
    var wr_id = form.getFieldValue("wr.wr_id");
	var result = {};
	try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-completeScheduling', record);
	}catch(e){
		Workflow.handleError(result);
	}
    if (result.code == 'executed') {
		var tabs = View.getControl('', 'mainTabs');
        tabs.selectTab('select', {});
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Open dialog for new tool assignment, with work request code set to current work request
 */
function addTool(){
    var panel = View.panels.get('panel_schedule');
    var wrId = panel.getFieldValue('wr.wr_id');
    
    var rest = new Ab.view.Restriction();
    rest.addClause("wrtl.wr_id", wrId, "=");
    rest.addClause("wrtl.tool_id", '', "=");
    View.openDialog("ab-helpdesk-workrequest-tl.axvw", rest, true);
}

/**
 * Open dialog for new craftsperson assigment, with work request code set to current work request
 */
function addCfToWr(){
    var panel = View.panels.get('panel_schedule');
    var wrId = panel.getFieldValue('wr.wr_id');
    
    var rest = new Ab.view.Restriction();
    rest.addClause("wrcf.wr_id", wrId, "=");
    rest.addClause("wrcf.cf_id", '', "=");
    View.openDialog("ab-helpdesk-workrequest-cf.axvw", rest, true);
}


