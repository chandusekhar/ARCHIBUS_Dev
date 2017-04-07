var projReviewCostsByProjectController = View.createController('projReviewCostsByProject', {
	actionRestriction : '',
	
	afterInitialDataFetch : function() {
		this.actionRestriction = getConsoleRestrictionForActions();
	},
	
	selectProjectReport_afterRefresh : function() {
		this.actionRestriction = getConsoleRestrictionForActions();
	}
});

function selectProjectReport_onclick(obj) {
	var controller = View.controllers.get('projReviewCostsByProject');
	if (obj.restriction.clauses.length > 0) {
		controller.projReviewCostsByProjectColumnReport.refresh(obj.restriction);
		controller.projReviewCostsByProjectColumnReport.showInWindow({
		    width: 800,
		    height: 600
		});
	}
}

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.is_template = 0");
}