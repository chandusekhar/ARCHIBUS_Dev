function selectWorkPkg(context)
{
	// remove vn_id restriction since it may not correlate with activity_log.vn_id
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);
	var northPanel = AFM.view.View.getControl('northFrame','northPanel');
	var restriction = new AFM.view.Restriction();
	restriction.addClause('work_pkg_bids.project_id', rowRestriction['work_pkg_bids.project_id']);
	var work_pkg_id = rowRestriction['work_pkg_bids.work_pkg_id'];
	restriction.addClause('work_pkg_bids.work_pkg_id', work_pkg_id);
	northPanel.restriction = restriction;
	northPanel.refresh();
	northPanel.show(true);
	setPanelTitle(work_pkg_id);
}

function setPanelTitle(work_pkg_id)
{
	var northFrame = getFrameObject(parent,'northFrame');
	var titleTD = northFrame.$('_title'); 
	if (titleTD && work_pkg_id != "") titleTD.innerHTML = work_pkg_id;
}


