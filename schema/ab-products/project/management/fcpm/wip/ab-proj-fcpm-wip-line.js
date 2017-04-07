var projFcpmWipLineController = View.createController('projFcpmWipLine',{
		
	projFcpmWipLineChart_afterRefresh: function() {
    	var openerController = View.controllers.get('projFcpmWip');
    	var title = '[' + openerController.project_id + '] ' + openerController.project_name;
    	if (openerController.work_pkg_id) title += ' - ' + openerController.work_pkg_id;
		this.projFcpmWipLineChart.appendTitle(title);		
	}
});

function openDetails(obj) {
	var openerController = View.controllers.get('projFcpmWip');
	var parameters = {};
    parameters.dateRestriction = obj.restriction; 
    parameters.project_id = openerController.project_id;
    parameters.work_pkg_id = openerController.work_pkg_id;
    parameters.proj_forecast_id = openerController.proj_forecast_id;
    parameters.fromDate = openerController.fromDate;
    parameters.toDate = openerController.toDate;
	View.openDialog('ab-proj-fcpm-wip-chart-items.axvw', null, false, {
        width: 1200,
        height: 800,
        closeButton: true,
        drilldownParameters: parameters
    });
}


