/**********************************************************
 ab-project-actions-edit.js
 
**********************************************************/

var strDestProjectId = "";

function beforeSaveForm()
{
	var form = AFM.view.View.getControl('editFrame', 'action_items_form'); 
	var curDate = new Date();
	var date_required = getDateObject(form.getFieldValue('activity_log.date_required'));//note that getFieldValue returns date in ISO format
	var date_planned_for = getDateObject(form.getFieldValue('activity_log.date_planned_for'));
	if ((curDate - date_required)/(1000*60*60*24) >= 1 || (curDate - date_planned_for)/(1000*60*60*24) >= 1){
    	if (!confirm(getMessage('dateBeforeCurrent'))) return false;
	}
    return true;
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

function setPanelTitle()
{
	var action_items_report= AFM.view.View.getControl('bottomSelectionFrame','action_items_report');
	var projectId = action_items_report.restriction['project.project_id'];
	var bottomSelectionFrame = getFrameObject(parent,'bottomSelectionFrame');
	var titleTD = bottomSelectionFrame.$('_title'); 
	if (titleTD) 
	{
		if (getMessage('detailsPanelTitle'))
			titleTD.innerHTML = getMessage('detailsPanelTitle') + " - " + projectId;
	}
}

function applyTemplate()
{
	var action_items_report= AFM.view.View.getControl('bottomSelectionFrame','action_items_report');
	strDestProjectId = action_items_report.restriction['project.project_id'];
	if (strDestProjectId)
	{
		var restriction = "project.is_template = 1";
		var popupTitle = "";
		popupTitle = getMessage('popupTitle');
		AFM.view.View.selectValue(
        '', popupTitle, ['activity_log.activity_log_id'], 'project', ['project.project_id'], ['project.project_id','project.project_type','project.summary','project.description'], 
        restriction, 'afterCopyToProject', false, true, '');
	}
}

function afterCopyToProject(fieldName, selectedValue, previousValue)
{
	var parameters = 
	{
		'proj_id_template':selectedValue,
		'proj_id_destination':strDestProjectId
	};
	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCapitalBudgeting-copyTemplateActionsToProject',parameters);
	if (result.code == 'executed') {
		var action_items_report= AFM.view.View.getControl('bottomSelectionFrame','action_items_report');
		action_items_report.refresh(null);
		action_items_report.show(true);
    } else   
    {
    	alert(result.code + " :: " + result.message);
  	}
	
}

