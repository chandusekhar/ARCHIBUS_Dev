var projReviewCostsByProjectController = View.createController('projReviewCostsByProject', {
	actionRestriction : '',

	afterViewLoad: function() {
        this.selectProjectReport.addEventListener('afterGetData', this.selectProjectReport_afterGetData, this);
    },

    selectProjectReport_afterGetData: function(panel, dataSet) {
        /*
    	dataSet.totals[0].localizedValues['activity_log.contracted_cost'] = '';
    	dataSet.totals[0].localizedValues['activity_log.owner_count'] = '';
    	dataSet.totals[0].localizedValues['activity_log.vendor_count'] = '';
    	dataSet.totals[0].localizedValues['activity_log.cost_invoice'] = '';
    	dataSet.totals[0].localizedValues['activity_log.variance_design_baseline'] = '';
    	dataSet.totals[0].localizedValues['activity_log.variance_actual_design'] = '';
        */
	},

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
	projectIdSelval("brg_project_view.is_template = 0");
}