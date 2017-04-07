function showButtons()
{
	var detailsFrame = getFrameObject(parent, 'detailsFrame');
	var status = detailsFrame.$('activity_log.status').value;
	if (status == 'REQUESTED')
	{
		//show buttons
		detailsFrame.$('approve').parentNode.style.display = 'inline';
		detailsFrame.$('reject').parentNode.style.display = 'inline';
	}	
	else 
	{
		//hide buttons
		detailsFrame.$('approve').parentNode.style.display = 'none';
		detailsFrame.$('reject').parentNode.style.display = 'none';
	}
}

function approveChangeOrder()
{
	var detailsPanel = AFM.view.View.getControl('detailsFrame','detailsPanel');
	var activity_log_id = detailsPanel.restriction['activity_log.activity_log_id'];
	var parameters = {'activity_log_id': activity_log_id};
	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbProjectManagement-approveChangeOrder', parameters);
	if (result.code == 'executed') {
		$('activity_log.status').value = 'SCHEDULED';
		detailsPanel.save();
		showButtons();
	} else {
		alert(result.code + " :: " + result.message);
	}	
}

function rejectChangeOrder()
{
	var detailsPanel = AFM.view.View.getControl('detailsFrame','detailsPanel');
	$('activity_log.status').value = 'REJECTED';
	detailsPanel.save();
	showButtons();	
}