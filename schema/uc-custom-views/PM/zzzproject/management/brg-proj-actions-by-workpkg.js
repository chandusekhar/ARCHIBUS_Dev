function openDetails(context)
{
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);
	var project_id = rowRestriction['work_pkgs.project_id'];
	var work_pkg_id = rowRestriction['work_pkgs.work_pkg_id'];
	project_id = project_id.replace(/\'/g,"''");
	work_pkg_id = work_pkg_id.replace(/\'/g,"''");
	var restriction = "activity_log.project_id = '"+project_id+"' AND activity_log.work_pkg_id = '"+work_pkg_id+"'";
	renderView('brg-proj-actions-by-workpkg-details.axvw','detailsFrame',restriction);
}
