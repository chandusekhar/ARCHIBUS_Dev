
var abHpdWorkReqApproveTabsController = View.createController("abHpdWorkReqApproveTabsController",{
	
	afterInitialDataFetch: function(){
		var code = window.location.parameters["code"];
		if(valueExists(code)){
			this.getApprovalForCode(code);
		}
	},
	
	/**
	 * Get approval information for given step code<br />
	 * If code exists and approval is not yet given, approval tab is selected<br />
	 * Calls WFR AbBldgOpsHelpDesk-getStepForCode<br />
	 * Called by <a href='#user_form_onload' target='main'>user_form_onload</a><br />
	 * @param {String} code step code
	 */
	getApprovalForCode: function(code){
		var result = {};
		try {
			 result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepForCode',code);
		}catch (e) {
			Workflow.handleError(e);
 			}
		if(result.code == 'executed'){
			var tabs = View.panels.get("abHpdWorkReqApproveTabs"); 
			if(tabs != null){
				res = eval('('+result.jsonExpression+')');
				if(res.approved){
					alert(getMessage("approved"));
				} else {
					var rest = new Ab.view.Restriction();
					rest.addClause(res.table_name+"."+res.field_name,res.pkey_value,"=");
					rest.addClause("wr_step_waiting."+res.field_name,res.pkey_value,"=");
					rest.addClause("wr_step_waiting.em_id",res.em_id,"=");
					rest.addClause("wr_step_waiting.step",res.step,"=");
					
					tabs.selectTab("review",rest);
				}
			}
		} else {
			Workflow.handleError(result);
		}
	}
});