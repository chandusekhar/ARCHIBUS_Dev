function setFilter()
{
	var restriction = getConsoleRestriction();
	var westPanel = View.panels.get('westPanel');
	westPanel.refresh(restriction);
	westPanel.show(true);
}

function selectWorkPkg(context)
{
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);
	var northPanel = View.panels.get('northPanel');
	northPanel.refresh(rowRestriction);
	northPanel.show(true);
	var centerPanel = View.panels.get('centerPanel');
	centerPanel.refresh(rowRestriction);
	centerPanel.show(true);
	var southPanel = View.panels.get('southPanel');
	southPanel.refresh(rowRestriction);
	southPanel.show(true);
	showButtons();
}

function showButtons(mainView)
{
/* Buttons removed.
	if (!mainView) mainView = View.getView(self);
	var northPanel = mainView.panels.get('northPanel');
	var northDs = mainView.dataSources.get('northDs');
				
		if (northPanel.rows.length <= 0)
		{
			northPanel.actions.get('addBid').enable(true);
			northPanel.actions.get('submit').enable(false);
			northPanel.actions.get('edit').enable(false);
			northPanel.actions.get('withdraw').enable(false);
			northPanel.actions.get('view').enable(false);
		}
		else
		{ 
			northPanel.actions.get('addBid').enable(false);
			
			var restriction = northPanel.getPrimaryKeysForRow(northPanel.rows[0]);
			var record = northDs.getRecord(restriction);
			var status = record.getValue('work_pkg_bids.status');
			if (status == 'Created' || status == 'Withdrawn')
			{
				northPanel.actions.get('submit').enable(true);
				northPanel.actions.get('edit').enable(true);
				northPanel.actions.get('withdraw').enable(false);
				northPanel.actions.get('view').enable(false);
			}
			else if (status == 'Submitted')
			{
				northPanel.actions.get('submit').enable(false);
				northPanel.actions.get('edit').enable(false);
				northPanel.actions.get('withdraw').enable(true);
				northPanel.actions.get('view').enable(true);
			}
			else
			{
				northPanel.actions.get('submit').enable(false);
				northPanel.actions.get('edit').enable(false);
				northPanel.actions.get('withdraw').enable(false);
				northPanel.actions.get('view').enable(true);
			}
		}
*/
}

function submitBidFromGrid()
{	
	var northPanel = View.panels.get('northPanel');
	var restriction = northPanel.getPrimaryKeysForRow(northPanel.rows[0]);
	var northDs = View.dataSources.get('northDs');
	var record = northDs.getRecord(restriction);
	var vn_id = record.getValue('work_pkg_bids.vn_id');
	var confirmSubmit = getMessage('confirmSubmit') + " - " + vn_id;
	if (!confirm(confirmSubmit)) return;
	
	record.setValue('work_pkg_bids.status', 'Submitted');
	record.setValue('work_pkg_bids.date_submitted', new Date());
	northDs.saveRecord(record);
	refreshPanels();
}

function refreshPanels()
{	
	var northPanel = View.panels.get('northPanel');
	northPanel.refresh();
	northPanel.show(true);
	showButtons();		
}

function addBid()
{
	var northPanel = View.panels.get('northPanel');
	// call wfr to save record
	var parameters = {};
	parameters.fieldValues = toJSON({
		'work_pkg_bids.project_id': northPanel.restriction['work_pkgs.project_id'], 
		'work_pkg_bids.work_pkg_id': northPanel.restriction['work_pkgs.work_pkg_id']
	});
	try {
    	var result = Workflow.call('AbProjectManagement-addWorkPkgBid', parameters);
    	var data = eval('('+result.jsonExpression+')');
		if (!data.emailMatchesVendor) 
		{
			alert(getMessage('noMatchingEmail'));
			return;
		}
		refreshPanels();
		openEditDialog();
	} catch (e) {
    	Workflow.handleError(e);
	}
}

function openEditDialog()
{
	var northPanel = View.panels.get('northPanel');
	var restriction = northPanel.getPrimaryKeysForRow(northPanel.rows[0]);
	View.openDialog('ab-proj-review-work-packages-out-for-bid-edit.axvw', restriction);
}

function openReportDialog()
{
	var northPanel = View.panels.get('northPanel');
	var restriction = northPanel.getPrimaryKeysForRow(northPanel.rows[0]);
	View.openDialog('ab-proj-review-work-packages-out-for-bid-report.axvw', restriction);
}
