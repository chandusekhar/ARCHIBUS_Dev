/**
 * Run scheduled WFR.
 * @param ctx
 */
function runScheduledWFR(ctx){
	var activityId = ctx.row.getFieldValue("afm_wf_rules.activity_id"); 
	var ruleId = ctx.row.getFieldValue("afm_wf_rules.rule_id"); 
	var workflowRuleId = activityId + "-"+ ruleId;
	
	try {
	    var parameters = {
	            'workflowRuleId': workflowRuleId 
	        };
	    
        var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-runWorkflowRule', parameters);
        if (result.code == 'executed') {
    	    View.showMessage(getMessage('rule_executed_message') + ' = ' + result.data.ruleKey);
        }
	} catch (e){
		Workflow.handleError(e)
	}
}