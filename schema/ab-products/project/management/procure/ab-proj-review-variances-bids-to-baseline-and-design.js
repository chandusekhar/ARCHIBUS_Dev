var projReviewVariancesBidsBaselineController = View.createController('projReviewVariancesBidsBaseline', {
	project_id : '',
	work_pkg_id : '',
	
	selectWorkPkgReport_afterRefresh: function(){
		this.project_id = this.consolePanel.getFieldValue('project.project_id');
		this.work_pkg_id = this.consolePanel.getFieldValue('work_pkgs.work_pkg_id');
	}
});

function selectWorkPkgReport_onClickEvent(obj) {
	if (obj.restriction.clauses.length <= 0) return;
	
	var controller = View.controllers.get('projReviewVariancesBidsBaseline');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('work_pkg_bids.vn_id', obj.restriction.clauses[0].value);
	restriction.addClause('work_pkg_bids.project_id', controller.project_id);
	restriction.addClause('work_pkg_bids.work_pkg_id', controller.work_pkg_id);
	View.openDialog('ab-proj-review-variances-bids-to-baseline-and-design-drill-down.axvw', restriction);
}

/****************************************************************
 * Work Package Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("");
}

function onWorkPkgIdSelval() {
	workPkgIdSelval("");
}
	