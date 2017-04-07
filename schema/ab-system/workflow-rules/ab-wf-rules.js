//disable Run button if rule is not active
function user_form_onload(){
	var grid = AFM.view.View.getControl(window, "wf_report");
	if (grid != null) {
    	for(var i=0; i<grid.rows.length; i++){
    		var status = grid.rows[i]["afm_wf_rules.is_active"];
    		status = trim(status);
    		if(status=='No'){
    		    var button = grid.getDataRows()[i].childNodes[4].childNodes[0];
    			button.disabled=1;
    		}
    	}	
	}
	
//	setRuleProps();
	
    setSchedProps();
    
}

/**
 * Updates the UI after the user selected the event handler class in the Select Value dialog.
 */
function afterSelectEventHandlerClass(fieldName, selectedValue, previousValue) {
    $('afm_wf_rules.eventHandlerMethod').value = '';
    $('save').disabled = true;
}

/**
 * Updates the UI after the user selected the event handler method in the Select Value dialog.
 */
function afterSelectEventHandlerMethod(fieldName, selectedValue, previousValue) {
    $('save').disabled = false;
}

/**
 * Runs the workflow rule defined by the selected report row.
 */
function runWorkflowRule() {
    var workflowRuleId = this['afm_wf_rules.activity_id'] + '-' + this['afm_wf_rules.rule_id'];
    var parameters = {
        'workflowRuleId': workflowRuleId 
    };
    var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-runWorkflowRule', parameters);
	if (result.code == 'executed') {
	    alert(getMessage('rule_executed_message') + ' = ' + result.data.ruleKey);
    }
	else {
	    AFM.workflow.Workflow.handleError(result);
	}
}

function setRuleProps()
{
	var form = AFM.view.View.getControl('', 'wf_form');
	
	if(form==null) return;
	
    var is_active = form.getFieldValue('afm_wf_rules.is_active');
	
	if(is_active=="0"){
		form.enableField('afm_wf_rules.eventHandlerClass', false);
		form.enableField('afm_wf_rules.eventHandlerMethod', false);
		form.enableField('afm_wf_rules.description', false);
	} else {
		form.enableField('afm_wf_rules.eventHandlerClass', true);
		form.enableField('afm_wf_rules.eventHandlerMethod', true);
		form.enableField('afm_wf_rules.description', true);
    }
}

function setSchedProps()
{
	var form = AFM.view.View.getControl('', 'wf_form');
	
	if(form==null) return;
	
    var rule_type = form.getFieldValue('afm_wf_rules.rule_type');
	
	if(rule_type!="Scheduled"){
		form.enableField('afm_wf_rules.xml_sched_props', false);
	} else {
		form.enableField('afm_wf_rules.xml_sched_props', true);
    }
}

function wr_form_afterRefresh()
{
//	setRuleProps();
	
    setSchedProps();
}