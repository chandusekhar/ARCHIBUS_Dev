var projMngDashMileController = View.createController('projMngDashMile', {
	projMngDashMile_grid_afterRefresh: function() {
    	this.projMngDashMile_grid.gridRows.each(function (row) {
    	   var action = row.actions.get('status_tick');
 		   var pct_complete = row.getRecord().getValue('activity_log.pct_complete');
 		   var status = row.getRecord().getValue('activity_log.status');
 		   if (pct_complete >= 100 || status == 'COMPLETED' || status == 'COMPLETED-V' || status == 'CLOSED') {		  
 			   action.show(true);
 		   }
 		   else action.show(false);
  		});
    },
    
    projMngDashMile_grid_onAddNew: function() {
		var openerController =  this.getOpenerController();
		var projectRestriction = new Ab.view.Restriction();
		projectRestriction.addClause('project.project_id', openerController.project_id);
		View.openDialog('ab-proj-mng-dash-mile-add.axvw', projectRestriction, true, {
			closeButton: true,
			callback: function() {
				openerController.refreshProjDash();
		    }
		});
	},
	
	getOpenerController: function(){
		var openerController = null;
		if(valueExists(View.getOpenerView().controllers.get('projMng'))) {
			openerController = View.getOpenerView().controllers.get('projMng');
		} else if(valueExists(View.getOpenerView().controllers.get('abEamProjConsoleDashController'))){
			openerController = View.getOpenerView().controllers.get('abEamProjConsoleDashController');
		} else if (valueExists(View.controllers.get('abEamProjConsoleDashController'))){
			openerController = View.controllers.get('abEamProjConsoleDashController');
		}
		return openerController
	}
});

function openAction(commandContext) {
	var controller = View.controllers.get('projMngDashMile');
	var openerController = controller.getOpenerController();
	var activity_log_id = commandContext.restriction['activity_log.activity_log_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.activity_log_id', activity_log_id);
	View.openDialog('ab-proj-mng-act-edit.axvw', restriction, false, {
	    closeButton: true,
	    callback: function() {
	    	openerController.refreshProjDash();
	    } 
	});
}