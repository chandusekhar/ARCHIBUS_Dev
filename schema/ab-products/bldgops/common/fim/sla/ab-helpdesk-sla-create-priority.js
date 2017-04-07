var createSlapriorityTabController = View.createController('createSlapriorityTabController', {

    tabs: null,
    
    afterInitialDataFetch: function(){
    
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        
        if(!Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','helpdesk_sla_request', 'match_ordering_seq').value){
        	jQuery('#request_form_helpdesk_sla_request\\.match_ordering_seq_fieldCell').parent().hide();
        	jQuery('#request_form_helpdesk_sla_request\\.ordering_seq_fieldCell').parent().show();
    	}else{
    		jQuery('#request_form_helpdesk_sla_request\\.match_ordering_seq_fieldCell').parent().show();
        	jQuery('#request_form_helpdesk_sla_request\\.ordering_seq_fieldCell').parent().hide();
    	}
		
    },
	
	request_form_afterRefresh: function(){
    
        var record = this.request_form.getRecord();
        this.panel_priority.clear();
        this.panel_priority.setRecord(record);
        this.panel_priority.show(true);
        var ordering_seq = this.request_form.getFieldValue("helpdesk_sla_request.ordering_seq");
        var activity_type = this.request_form.getFieldValue("helpdesk_sla_request.activity_type");
        ordering_seq = ordering_seq == "" ? "-1" : ordering_seq;
        
        try {
            var result = Workflow.callMethod("AbBldgOpsHelpDesk-SLAService-getPriorityLevels", ordering_seq, activity_type);
            var priorities = eval('(' + result.jsonExpression + ')');
            if (priorities.priority_level_1 != undefined) {
                $('priority_level_1').value = priorities.priority_level_1;
            }
            if (priorities.priority_level_2 != undefined) {
                $('priority_level_2').value = priorities.priority_level_2;
            }
            if (priorities.priority_level_3 != undefined) {
                $('priority_level_3').value = priorities.priority_level_3;
            }
            if (priorities.priority_level_4 != undefined) {
                $('priority_level_4').value = priorities.priority_level_4;
            }
            if (priorities.priority_level_5 != undefined) {
                $('priority_level_5').value = priorities.priority_level_5;
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
    }
});

function selectPriorityLevel(level){
    View.selectValue('panel_priority', getMessage('priorityLevel') + ' ' + level, ['priority_level_' + level], 'helpdesk_sla_response', ['helpdesk_sla_response.priority_label'], ['helpdesk_sla_response.priority_label'], 'priority=' + level, '', true, true);
}


/**
 * Go to next tab<br />
 * Save priority labels with WFR <a href='../../../../javadoc/com/archibus/eventhandler/sla/ServiceLevelAgreementHandler.html#saveSLAPriorityLevels(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-saveSLAPriorityLevels</a><br />
 * Load 'Response Parameters' tab<br />
 * Called by 'Next' button
 * @param {String} form current form
 */
function nextTab(form){
    var tabs = View.getControlsByType(parent, 'tabs')[0];
    var form = View.panels.get('panel_priority');
    form.clearValidationResult();
    
    if ($('priority_level_1').value == "") {
        $('priority_level_1').value = "Default";
    }
    
    if (form.getFieldValue('helpdesk_sla_request.default_priority') != '') {
        var defaultPriority = form.getFieldValue('helpdesk_sla_request.default_priority');
        if ($('priority_level_' + defaultPriority) == undefined || $('priority_level_' + defaultPriority).value == "") {
            form.addInvalidField("helpdesk_sla_request.default_priority", getMessage("wrongDefaultPriority"));
            form.displayValidationResult();
            return;
        }
    }
    form.save();
    var priorities = new Array(5);
    priorities[0] = form.getFieldValue('priority_level_1');
    priorities[1] = form.getFieldValue('priority_level_2');
    priorities[2] = form.getFieldValue('priority_level_3');
    priorities[3] = form.getFieldValue('priority_level_4');
    priorities[4] = form.getFieldValue('priority_level_5');
    var prioritiesJSON = "["
    for (i = 0; i < 5; i++) {
        if (priorities[i] != "") {
            var level = i + 1;
            prioritiesJSON += "{priority : " + level + " , label:'" + priorities[i] + "'},"
        }
    }
    prioritiesJSON = prioritiesJSON.substring(0, prioritiesJSON.length - 1) + "]";
    
    var topForm = View.panels.get('request_form');
    tabs.priorities = priorities;
    tabs.ordering_seq = topForm.getFieldValue('helpdesk_sla_request.ordering_seq');
    tabs.activity_type = topForm.getFieldValue('helpdesk_sla_request.activity_type');
    
    var recordValues = ABHDC_getDataRecord2(form);
    var defPriority = form.getFieldValue('helpdesk_sla_request.default_priority');
    var result = {};
    try {
        result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-saveSLAPriorityLevels', recordValues, prioritiesJSON);
        //var responseTab = tabs.findTab('response');
        //responseTab.loadView();
        tabs.selectTab("response", null, false, false, true);
    } 
    catch (e) {
        Workflow.handleError(e);
    }
}
