function user_form_onload()
{
	// clears work pkg status field
	clearConsole();
}

function openDetails(context)
{
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);	
	var work_pkg_id = rowRestriction['work_pkgs.work_pkg_id'];
	var project_id = rowRestriction['work_pkgs.project_id'];
	work_pkg_id = escape(work_pkg_id);
	work_pkg_id = work_pkg_id.replace(/\+/g, '%2B');
	project_id = escape(project_id);
	project_id = project_id.replace(/\+/g, '%2B');
	var detailsFrame = getFrameObject(parent,'detailsFrame');
	detailsFrame.location.href = "brg-proj-review-actions-by-work-pkg-details.axvw?handler=com.archibus.config.Find&work_pkgs.work_pkg_id="+work_pkg_id+"&work_pkgs.project_id="+project_id;
}