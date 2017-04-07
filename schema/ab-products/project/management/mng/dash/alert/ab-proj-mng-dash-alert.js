var projMngDashAlertController = View.createController('projMngDashAlert', {
	alertMessages : new Array('assignedAct', 'workpkgsOutBid', 'contrPendSig', 'chgPendApprv', 'actsBehSched', 'actsOnHold', 'openInv', 'highLog', 'urgLog'),
	projMngController : null,
	projRestriction: null,
	
	afterViewLoad: function(){
		this.projMngController = View.getOpenerView().controllers.get('projMng');
		
		for (var i = 0; i < this.alertMessages.length; i++) {
			var alertMessage = this.alertMessages[i];
			this.projMngDashAlert_msgs.addParameter(alertMessage, getMessage(alertMessage));
			this.projMngDashAlert_msgs.addParameter(alertMessage + "1", getMessage(alertMessage + "1"));
		}
    },
	
	projMngDashAlert_msgs_afterRefresh: function() {
		var project_id = this.projMngController.project_id;
		this.projRestriction =  "project.project_id = '" + getValidRestVal(project_id) + "'";
		
		this.projMngDashAlert_msgs.gridRows.each(function (row) {
			   var record = row.getRecord(); 		   
			   var alert_icon = row.actions.get('alert_icon');
			   var alert_id = record.getValue('project.alert_id');
			   if (alert_id == 8 || alert_id == 9) {		  
				   alert_icon.show(true);
			   }
			   else alert_icon.show(false);	   
		});
	},
	
	projMngDashAlert_msgs_select: function(obj) {
		var alert_id = this.projMngDashAlert_msgs.rows[this.projMngDashAlert_msgs.selectedRowIndex]['project.alert_id'];	
		var count = this.projMngDashAlert_msgs.rows[this.projMngDashAlert_msgs.selectedRowIndex]['project.alert_count'];	
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.projMngController.project_id);
		switch(alert_id) {
		case '1':
			var openerController = View.getOpenerView().controllers.get('projMng');
			openerController.alertsFilter = 'assignedAct';
			openerController.projMngTabs.selectTab('projMngActs');
			break;
		case '2':
			View.openDialog('ab-proj-mng-dash-alert-pkg.axvw', restriction);
			break;
		case '3':
			View.openDialog('ab-proj-mng-dash-alert-contr.axvw', restriction);
			break;
		case '4':
			View.openDialog('ab-proj-mng-dash-alert-chg.axvw', restriction);
			break;
		case '5':
			var openerController = View.getOpenerView().controllers.get('projMng');
			openerController.alertsFilter = 'behSched';
			openerController.projMngTabs.selectTab('projMngActs');
			break;
		case '6':
			var openerController = View.getOpenerView().controllers.get('projMng');
			openerController.alertsFilter = 'onHold';
			openerController.projMngTabs.selectTab('projMngActs');
			break;
		case '7':
			var openerController = View.getOpenerView().controllers.get('projMng');
			openerController.alertsFilter = 'issued';
			openerController.projMngTabs.selectTab('projMngInvs');
			break;
		case '8':
			var openerController = View.getOpenerView().controllers.get('projMng');
			openerController.alertsFilter = 'high';
			this.projMngDashTabs.selectTab('projMngDash_logsTab');
			break;
		case '9':
			var openerController = View.getOpenerView().controllers.get('projMng');
			openerController.alertsFilter = 'urgent';
			this.projMngDashTabs.selectTab('projMngDash_logsTab');
			break;
		}
	}
});

