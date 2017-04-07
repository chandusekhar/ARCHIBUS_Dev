function user_form_onload() 
{
	// project_id has been passed in by mc
	var objConsoleFrame = getFrameObject(window, "consoleFrameMC");
	if (objConsoleFrame != null) {
		var view_project_id = objConsoleFrame.mc_project_id;
		if (view_project_id) {
			if ($('project.project_id')) $('project.project_id').value = view_project_id;
			var parameters = {'project_id':view_project_id};
			var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbProjectManagement-calcActivityLogDateSchedEndForProject',parameters);
			if (result.code == 'executed') {
				var targetFrameName = getFrameObject(parent, 'viewFrame').name;	
				view_project_id = view_project_id.replace(/\'/g,"\'\'");
				var restriction = "project.project_id = \'"+view_project_id+"\'";
				var strXMLSQLTransaction = '<afmAction type="render" state="brg-proj-review-actions-schedule-variances-mdx-mc.axvw" response="true">';
				strXMLSQLTransaction += '<restrictions><userInputRecordsFlag><restriction type="sql" sql="'+restriction+'">';
				strXMLSQLTransaction += '</restriction></userInputRecordsFlag></restrictions>';
				strXMLSQLTransaction += '</afmAction>';
				sendingDataFromHiddenForm('',strXMLSQLTransaction, targetFrameName, '',false,'');		
	  		} 
	  		else 
	  		{
	    		alert(result.code + " :: " + result.message);
	  		}	
		}
	}
}	
