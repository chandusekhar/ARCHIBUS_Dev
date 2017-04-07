function closeDialogAndRefreshOpener()
{
	opener.closeActionsPopup();
}

function closeActionsPopup()
{
	AFM.view.View.closeDialog();
	var detailsPanel = AFM.view.View.getControl('detailsFrame','detailsPanel');
	detailsPanel.refresh();
	detailsPanel.show(true);
	updateCosts();
}

function setPanelTitle()
{
	var detailsPanel = AFM.view.View.getControl('detailsFrame','detailsPanel');
	var projectId = detailsPanel.restriction['project.project_id'];
	var detailsFrame = getFrameObject(parent,'detailsFrame');
	var titleTD = detailsFrame.$('detailsPanel_head').firstChild.firstChild.firstChild; 
	if (titleTD) 
	{
		titleTD.innerHTML = projectId;
	}
}

function updateCosts()
{
	var detailsPanel = AFM.view.View.getControl('detailsFrame','detailsPanel');
	var projectId = detailsPanel.restriction['project.project_id'];
	var parameters = 
	{
		'project_id': projectId
	};
	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCapitalBudgeting-rollUpActionCostsToProjects',parameters);

	if (result.code == 'executed') {

		var parameters = 
		{
        	tableName: 'project',
        	fieldNames: toJSON(['project.cost_est_design']),
        	restriction: toJSON(detailsPanel.restriction)
		};
		var wfrResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords',parameters);
		if (wfrResult.code == 'executed') 
		{
			var record = wfrResult.data.records[0];
        	var totalBaselineCosts = record['project.cost_est_design'];
        	if (totalBaselineCosts == null) totalBaselineCosts = 0;
			var detailsFrame = getFrameObject(parent,'detailsFrame');
			var titleTD = detailsFrame.$('_title'); 
			if (titleTD) 
			{
				if (getMessage('detailsTableGroupTitle'))
				titleTD.innerHTML = getMessage('detailsTableGroupTitle') + " " + totalBaselineCosts;
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