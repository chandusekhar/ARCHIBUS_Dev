/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-workrequest-estimate.axvw' target='main'>ab-helpdesk-workrequest-estimate.axvw</a>
 */
/**
 * Called when loading the form
 * <div class='detailHead'>Pseudo-code:</div>
 *	<ol>
 *		<li>Disable all buttons if the current step type is not 'estimation'</li>
 * 		<li>Create restriction and show estimation panels for trades, tooltypes, parts and other costs</li>
 *	</ol>
 */
var wrestimateController = View.createController('wrestimate', {
	
	  /**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.panel_estimation.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},

    panel_estimation_afterRefresh: function(){
        if (valueExists(this.panel_estimation.restriction)) {
            this.onInitialData();
        }
    },
    onInitialData: function(){
        if (this.panel_estimation.getFieldValue("wr_step_waiting.step_type").toLowerCase() != "estimation") {
            ABODC_disableAllButtons();
        }
        var wr = this.panel_estimation.getFieldValue("wr.wr_id");
        
        this.refreshTradeGrid(wr);
        this.refreshTooltypeGrid(wr);
        this.refreshPartGrid(wr);
        this.refreshOthercostGrid(wr);
    },
    refreshTradeGrid: function(wrcode){
        // pass restriction to grid panel
        var trrest = new Ab.view.Restriction();
        trrest.addClause("wrtr.wr_id", wrcode, '=');
        this.tr_report.refresh(trrest);
    },
    refreshTooltypeGrid: function(wrcode){
        var ttrest = new Ab.view.Restriction();
        ttrest.addClause("wrtt.wr_id", wrcode, '=');
        this.tt_report.refresh(ttrest);
    },
    refreshPartGrid: function(wrcode){
        var ptrest = new Ab.view.Restriction();
        ptrest.addClause("wrpt.wr_id", wrcode, '=');
        this.pt_report.refresh(ptrest);
    },
    refreshOthercostGrid: function(wrcode){
        var otherrest = new Ab.view.Restriction();
        otherrest.addClause("wr_other.wr_id", wrcode, '=');
        this.other_report.refresh(otherrest);
    }
    
})
/**
 * Opens dialog for new trade, with work request code set to current work request
 */
function addTrade(){
    var panel = View.panels.get('panel_estimation');
    var wrId = panel.getFieldValue("wr.wr_id");
    
    var rest = new Ab.view.Restriction();
    rest.addClause("wrtr.wr_id", wrId, "=");
    View.openDialog("ab-helpdesk-workrequest-trade.axvw", rest, true);
}

/**
 * Opens dialog for new tooltype, with work request code set to current work request
 */
function addToolType(){
    var panel = View.getControl('', 'panel_estimation');
    var wrId = panel.getFieldValue("wr.wr_id");
    
    var rest = new Ab.view.Restriction();
    rest.addClause("wrtt.wr_id", wrId, "=");
    rest.addClause("wrtt.tool_type", '', "=");
    View.openDialog("ab-helpdesk-workrequest-tooltype.axvw", rest, true);
}

/**
 * Open dialog to add part to current work request
 */
function addPart(){
    var panel = View.panels.get('panel_estimation');
    var wrId = panel.getFieldValue("wr.wr_id");
    
    var rest = new Ab.view.Restriction();
    rest.addClause("wrpt.wr_id", wrId, "=");
    View.openDialog("ab-helpdesk-workrequest-part.axvw", rest, true);
}

/**
 * Open dialog to add other cost to current work request
 */
function addOther(){
    var panel = View.panels.get('panel_estimation');
    var wrId = panel.getFieldValue("wr.wr_id");
    
    var rest = new Ab.view.Restriction();
    rest.addClause("wr_other.wr_id", wrId, "=");
    rest.addClause("wr_other.other_rs_type", '', "=");
    View.openDialog("ab-helpdesk-workrequest-othercost.axvw", rest, true);
}

/**
 * Complete work request estimation<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#completeEstimation(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-completeEstimation</a><br />
 * Called by 'Complete Estimation' button<br />
 * Reloads select tab
 * @param {String} form form submitted
 */
function completeEstimation(formId){
    var form = View.panels.get(formId);
    var record = ABODC_getDataRecord2(form);
    var wr_id = form.getFieldValue("wr.wr_id");
	var result = {};
	try {
		result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-completeEstimation', 'wr', 'wr_id', wr_id, record);
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

function refreshPanels(panelId){
	View.panels.get("panel_estimation").refresh();
	View.panels.get(panelId).refresh();
}