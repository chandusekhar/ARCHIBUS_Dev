var view_project_id = "";

function user_form_onload()
{
	if ($('detailsPanel_head'))
	{
		var detailsPanel = AFM.view.View.getControl('','detailsPanel');
		var objConsoleFrame = getFrameObject(window, "consoleFrameMC");
		if (objConsoleFrame != null) {
			view_project_id = objConsoleFrame.mc_project_id;
			if (view_project_id != null) {
				var restriction = new AFM.view.Restriction();
	       		restriction.addClause('project.project_id', view_project_id, '=');			
				detailsPanel.refresh(restriction);
			}
		}
		updateCosts();
	}
}

function closeActionsPopup()
{
	AFM.view.View.closeDialog();
	var detailsPanel = AFM.view.View.getControl('','detailsPanel');
	detailsPanel.refresh();
	detailsPanel.show(true);
	updateCosts();
}

function updateCosts()
{
	var detailsPanel = AFM.view.View.getControl('','detailsPanel');
	var parameters = 
	{
		'project_id': view_project_id
	};
	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCapitalBudgeting-rollUpActionCostsToProjects',parameters);

	if (result.code == 'executed') {
		var total_costs_field = getMessage('total_costs_field');
		var parameters = 
		{
        	tableName: 'project',
        	fieldNames: toJSON([total_costs_field]),
        	restriction: toJSON(detailsPanel.restriction)
		};
		var wfrResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords',parameters);
		if (wfrResult.code == 'executed') 
		{
			var record = wfrResult.data.records[0];
        	var totalBaselineCosts = record[total_costs_field];
        	if (totalBaselineCosts == null) totalBaselineCosts = 0;
        	
			var titleElement = $('detailsPanel_head').firstChild.firstChild.firstChild; 
			if (titleElement) 
			{
				if (getMessage('detailsPanelTitle'))
				titleElement.innerHTML = getMessage('detailsPanelTitle') + " " + totalBaselineCosts;
			}
		} else 
		{ 
			alert(wfrResult.code + " :: " + wfrResult.message);
		}		
    } else   
    {
    	alert(result.code + " :: " + result.message);
  	}
}