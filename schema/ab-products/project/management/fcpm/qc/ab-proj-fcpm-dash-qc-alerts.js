var projFcpmDashQcAlertsController = View.createController('projFcpmDashQcAlerts',{
	alertMessages : new Array('projectPastDue', 'maxContingency', 'chgOrder'),
	projRestriction: null,
	
	afterViewLoad: function(){	
		this.inherit();

		var grid = this.projFcpmDashQcAlerts_msgs;
		grid.afterCreateCellContent = function(row, column, cellElement) {
            var value = row['project.days_overdue'];
            if (column.id == 'project.date_target_end') {
            	if (value > 60)	{
	                cellElement.style.background = '#FF8B73';//Red
	            } else if (value > 30) {
	            	cellElement.style.background = '#FFE773';//Yellow
	            } else {
	                cellElement.style.background = 'transparent';
	            }
            }
        }
		
		for (var i = 0; i < this.alertMessages.length; i++) {
			var alertMessage = this.alertMessages[i];
			this.projFcpmDashQcAlerts_msgs.addParameter(alertMessage, getMessage(alertMessage));
			this.projFcpmDashQcAlerts_msgs.addParameter(alertMessage + "1", getMessage(alertMessage + "1"));
		}
		this.projFcpmDashQcAlerts_msgs.showColumn('project.days_overdue', false);
    },
	
	projFcpmDashQcAlerts_msgs_afterRefresh: function() {
		this.projRestriction =  " project.project_id = '%' ";
	},
	
	projFcpmDashQcAlerts_msgs_select: function(obj) {
		var alert_id = this.projFcpmDashQcAlerts_msgs.rows[this.projFcpmDashQcAlerts_msgs.selectedRowIndex]['project.alert_id'];	
		var count = this.projFcpmDashQcAlerts_msgs.rows[this.projFcpmDashQcAlerts_msgs.selectedRowIndex]['project.alert_count'];	
		var project_id = this.projFcpmDashQcAlerts_msgs.rows[this.projFcpmDashQcAlerts_msgs.selectedRowIndex]['project.project_id'];	
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', project_id);
		switch(alert_id) {
		case '1':			
			View.openDialog('ab-proj-fcpm-dash-qc-projs-dtl.axvw', restriction);
			break;
		case '2':
			View.openDialog('ab-proj-fcpm-dash-qc-pkgs-dtl.axvw', restriction);
			break;
		case '3':
			View.openDialog('ab-proj-fcpm-dash-qc-alerts-chg.axvw', restriction);
			break;
		}
	}
});

