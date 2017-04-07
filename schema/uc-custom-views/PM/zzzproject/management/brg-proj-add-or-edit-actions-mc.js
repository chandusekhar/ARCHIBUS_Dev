		
/**********************************************************
 ab-proj-add-or-edit-actions-mc.js
 
**********************************************************/

var strDestProjectId = "";

function applyTemplate()
{
	var consoleFrameMC = getFrameObject(window, 'consoleFrameMC');
	strDestProjectId = consoleFrameMC.mc_project_id;
	if (strDestProjectId != "")
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
		var southPanel= AFM.view.View.getControl('southFrame','southPanel');
		southPanel.refresh(null);
		southPanel.show(true);
    } else   
    {
    	alert(result.code + " :: " + result.message);
  	}
	
}

function showButtons(){
	var detailsFrame = getFrameObject(parent, 'detailsFrame');
	var detailsPanel= AFM.view.View.getControl('detailsFrame','detailsPanel');
	var action_status = detailsPanel.getFieldValue('activity_log.status');
	var action_id = detailsPanel.getFieldValue('activity_log.activity_log_id');
	if ((action_id != "") && (action_status == 'N/A' || action_status == 'REQUESTED'))
	{
		// hide cancel and stop, show delete
		detailsFrame.$('cancelAction').parentNode.style.display = 'none';
		detailsFrame.$('stopAction').parentNode.style.display = 'none';
		detailsFrame.$('deleteAction').parentNode.style.display = 'inline';
	}
	else if (action_status == 'SCHEDULED')
	{
		// hide delete and stop, show cancel
		detailsFrame.$('deleteAction').parentNode.style.display = 'none';
		detailsFrame.$('stopAction').parentNode.style.display = 'none';
		detailsFrame.$('cancelAction').parentNode.style.display = 'inline';
	}
	else if (action_status == 'IN PROGRESS' || action_status == 'IN PROCESS-H')
	{
		// hide cancel and delete, show stop
		detailsFrame.$('cancelAction').parentNode.style.display = 'none';
		detailsFrame.$('deleteAction').parentNode.style.display = 'none';
		detailsFrame.$('stopAction').parentNode.style.display = 'inline';
	}
	else 
	{
		// hide all wfr buttons
		detailsFrame.$('cancelAction').parentNode.style.display = 'none';
		detailsFrame.$('stopAction').parentNode.style.display = 'none';
		detailsFrame.$('deleteAction').parentNode.style.display = 'none';
	}
}

function stopAction() {
	var detailsPanel= AFM.view.View.getControl('detailsFrame','detailsPanel');
	$('activity_log.status').value = 'STOPPED';
	detailsPanel.save();
	showButtons();
}

function cancelAction() {
	var detailsPanel= AFM.view.View.getControl('detailsFrame','detailsPanel');
	$('activity_log.status').value = 'CANCELLED';
	detailsPanel.save();
	showButtons();
}

				