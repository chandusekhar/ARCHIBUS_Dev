function user_form_onload()
{
	var tabsFrame = getFrameObject(parent,'tabsFrame');
	if (tabsFrame)
	{
		tabsFrame.setTabVisible('page2',false);
		tabsFrame.setTabVisible('page3',false);
	}	
}

function showAndSelectTab2(context)
{
	var tabsFrame = getFrameObject(parent,'tabsFrame');
	tabsFrame.setTabVisible('page2',true);
	tabsFrame.setTabVisible('page3',true);
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);
	// remove vn_id restriction since it may not correlate with activity_log.vn_id in third tab
	// save as variable to tabsFrame so that it is accessible to add new dialog
	tabsFrame.project_id = rowRestriction['work_pkg_bids.project_id'];
	tabsFrame.work_pkg_id = rowRestriction['work_pkg_bids.work_pkg_id'];
	tabsFrame.vn_id = rowRestriction['work_pkg_bids.vn_id'];
	var restriction = new AFM.view.Restriction();
	restriction.addClause('work_pkg_bids.project_id', rowRestriction['work_pkg_bids.project_id']);
	var work_pkg_id = rowRestriction['work_pkg_bids.work_pkg_id'];
	restriction.addClause('work_pkg_bids.work_pkg_id', work_pkg_id);	
	tabsFrame.restriction = restriction;
	var title = getMessage('invoicesTitle');
	tabsFrame.setTabTitle('page2',title + " - " + work_pkg_id);	
	tabsFrame.selectTab('page2');
}