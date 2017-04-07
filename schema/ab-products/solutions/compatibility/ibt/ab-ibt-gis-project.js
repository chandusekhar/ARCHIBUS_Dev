var controller;

function user_form_onload()
{	
	controller = new Controller('tabsFrame', 'map_tab', ['']);
    controller.setRestrictions = setRestrictions;
}

function setRestrictions(row)
{
	var projectId = row['project.project_id'];
    var restriction = new AFM.view.Restriction();
	restriction.addClause('project.project_id', projectId);
	controller.getTabsFrame().restriction = restriction;
}

