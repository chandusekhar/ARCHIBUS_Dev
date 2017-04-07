var createSlaSelectTabController = View.createController('createSlaSelectTabController', {
	
	tabs: null,

    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
        this.tabs.disableTab('request');
        this.tabs.disableTab('priority');
        this.tabs.disableTab('response');
        this.tabs.disableTab('ordering');
        
        if(!Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','helpdesk_sla_request', 'match_ordering_seq').value){
    		this.rule_report.showColumn('helpdesk_sla_request.match_ordering_seq', false);
    		this.rule_report.showColumn('helpdesk_sla_request.ordering_seq', true);
    		this.rule_report.sortColumns[0].fieldName = "helpdesk_sla_request.ordering_seq";
    	}
        
        this.rule_report.refresh();
    },
    tabs_afterTabChange: function(tabPanel, newTabName){
        if (newTabName == 'select') {
            this.rule_console.clear();
            this.rule_report.refresh();
            this.tabs.activity_type_copy = null;
            this.tabs.ordering_seq_copy = null;
            this.tabs.makeCopy = null;
            this.tabs.adding = null;
            this.tabs.existing = null;
            this.tabs.ordering_seq = null;
            this.tabs.activity_type = null;
        }
       
        this.tabs.disableTab('request');
        this.tabs.disableTab('priority');
        this.tabs.disableTab('response');
        this.tabs.disableTab('ordering');
        this.tabs.enableTab(newTabName);        
    }
});

function selectActivityType(){
    var restriction = "activitytype.activity_type LIKE 'SERVICE DESK%'";
    View.selectValue("rule_console", getMessage('requestType'), ["helpdesk_sla_request.activity_type"], "activitytype", ["activitytype.activity_type"], ['activitytype.activity_type', 'activitytype.description'], restriction);
}


/**
 * Delete selected rules after user confirmation<br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/sla/ServiceLevelAgreementHandler.html#deleteRules(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-deleteRules</a><br />
 */
function deleteRule(){
    var grid = View.panels.get('rule_report');
    var records = grid.getPrimaryKeysForSelectedRows();
    if (records.length > 0) {
        View.confirm(getMessage("confirmDelete"), function(button){
            if (button == 'yes') {
				
                try {
					var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-deleteRules', records);
				}catch(e){
					Workflow.handleError(e);
				}
                if (result.code == 'executed') {
                    grid.refresh();
                }
                else {
                    Workflow.handleError(result);
                }
            }
        });
    }
}


/**
 * Copy SLA rule<br />
 * Set global parameter (in top.window) makeCopy true<br />
 */
function copyRule(){
	var tabs = createSlaSelectTabController.tabs;
    var grid = View.panels.get('rule_report');
    var records = grid.getPrimaryKeysForSelectedRows();
    if (records.length == 0) {
        View.showMessage(getMessage("noSLAtoCopy"));
    }
    else {
        if (records.length == 1) {
            var json = eval('(' + toJSON(records) + ')');
            tabs.activity_type_copy = json[0]['helpdesk_sla_request.activity_type'];
            tabs.ordering_seq_copy = json[0]['helpdesk_sla_request.ordering_seq'];
            tabs.makeCopy = true;
            
            var rest = new Ab.view.Restriction();
            rest.addClause("helpdesk_sla_request.activity_type", tabs.activity_type_copy, "=");
            rest.addClause("helpdesk_sla_request.ordering_seq", tabs.ordering_seq_copy, "=");
            tabs.selectTab("request", rest);
        }
        else {
            View.showMessage(getMessage("select1SLAtoCopy"));
        }
    }
}
