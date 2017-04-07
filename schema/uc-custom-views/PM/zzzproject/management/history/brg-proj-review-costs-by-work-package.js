function openDetails(context)
{
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);
	var project_id = rowRestriction['brg_project_view.project_id'];
	project_id = escape(project_id);
	project_id = project_id.replace(/\+/g, '%2B');
	var detailsFrame = getFrameObject(parent,'detailsFrame');
	detailsFrame.location.href = "brg-proj-review-costs-by-work-package-mdx.axvw?handler=com.archibus.config.Find&project.project_id="+project_id;
}