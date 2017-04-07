function openDetails(context)
{
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);
	var work_pkg_id = rowRestriction['work_pkg_bids.work_pkg_id'];
	var project_id = rowRestriction['work_pkg_bids.project_id'];
	work_pkg_id = escape(work_pkg_id);
	work_pkg_id = work_pkg_id.replace(/\+/g, '%2B');
	project_id = escape(project_id);
	project_id = project_id.replace(/\+/g, '%2B');
	var detailsFrame = getFrameObject(parent,'detailsFrame');
	detailsFrame.location.href = "brg-proj-review-my-invoices-and-payments-details.axvw?handler=com.archibus.config.Find&work_pkgs.work_pkg_id="+work_pkg_id+"&work_pkgs.project_id="+project_id;
}