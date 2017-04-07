function setPanelTitle()
{
	var detailsPanel= AFM.view.View.getControl('detailsFrame','detailsPanel');
	var projectId = "";
	projectId = detailsPanel.restriction['project.project_id'];
	var detailsFrame = getFrameObject(parent,'detailsFrame');
	var titleTD = detailsFrame.$('_title'); 
	if (titleTD && projectId != "") titleTD.innerHTML = projectId;
}

function showAction(context)
{
	var restriction = this.grid.getPrimaryKeysForRow(this);
	AFM.view.View.openDialog('brg-proj-actions-with-docs-details.axvw', restriction);	
}					