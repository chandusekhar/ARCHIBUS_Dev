var projReviewCostsActivityTypeController = View.createController('projReviewCostsActivityType', {
	actionRestriction : '',
		
	afterInitialDataFetch : function() {
		onCalcEndDatesForProject('');
		this.actionRestriction = getConsoleRestrictionForActions();
	},
	
	selectActionsReport_afterRefresh : function() {
		this.actionRestriction = getConsoleRestrictionForActions();
	}
});

function selectActionsReport_onclick(obj) {
	var controller = View.controllers.get('projReviewCostsActivityType');
	var restriction = controller.actionRestriction;
	if (obj.restriction.clauses.length > 0) {
		var activity_type = obj.restriction.clauses[0].value;
		restriction += " AND activity_type = '" + activity_type + "'";
	}
    controller.projReviewCostsActivityTypeGrid.refresh(restriction);
    controller.projReviewCostsActivityTypeGrid.showInWindow({
        width: 800,
        height: 600
    });
}

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.is_template = 0");
}