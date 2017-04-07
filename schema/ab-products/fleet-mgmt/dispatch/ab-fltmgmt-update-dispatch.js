var abFltMgmtDOUpdate_controller = View.createController('abFltMgmtDOUpdate_controller', {

	panel_do_afterRefresh: function() {
		this.updateStatusList();
		this.showOperators();
	},

	updateStatusList: function() {
		var ctrlStatus = $('flt_order.status');
		if(ctrlStatus)
		{
			var i=0;
			while(i < ctrlStatus.options.length) {
				if((ctrlStatus.options[i].value == "Req") || (ctrlStatus.options[i].value == "Rej") ||
				   (ctrlStatus.options[i].value == "App") || (ctrlStatus.options[i].value == "HP") ||
				   (ctrlStatus.options[i].value == "HL") || (ctrlStatus.options[i].value == "II") ||
				   (ctrlStatus.options[i].value == "FI")) {
					ctrlStatus.options[i] = null;
				} else {
					i++;
				}
			}
		}
	},
	
	showOperators : function() {
		var fo_id = this.panel_do.getFieldValue("flt_order.fo_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause('flt_doem.fo_id', fo_id, '=');
		this.panel_operator.show(true);
		this.panel_operator.refresh(restriction);
	}
});

function validateDispatchOrder() {

	var do_panel = View.panels.get("panel_do");
	if(do_panel != null) {

		do_panel.clearValidationResult();
		if(!do_panel.validateFields()) {
			return false;
		}

		var status         = do_panel.getFieldValue("flt_order.status");
		var date_completed = do_panel.getFieldValue("flt_order.date_completed");
		var time_completed = do_panel.getFieldValue("flt_order.time_completed");
		var current_meter  = do_panel.getFieldValue("flt_order.current_meter");
		var meter_start    = do_panel.getFieldValue("flt_order.meter_start");

		// Validate fields when dispatch order is completed, cancelled, or stoppped
		if(((status == "Com") || (status == "Can") || (status == "S")) && ((date_completed == "") || (time_completed == "") || (current_meter == "0.00"))) {
			alert("The Date Completed, Time Completed and Current Meter Reading (Vehicle In) must be entered before changing the status to Completed, Cancelled or Stopped.");
			return false;
		}

		// Validate the mileage entered is greater than the starting mileage
		if(((status == "Com") || (status == "Can") || (status == "S")) && ((current_meter * 1.00) < (meter_start * 1.00))) {
			alert("The Current Vehicle Meter Reading cannot be less than the Meter Start value.  Please update the Current Vehicle Meter Reading value and save again.");
			return false;
		}
	}

	return true;
}

function calculateDispatchOrder() {

	var do_panel = View.panels.get("panel_do");
	if(do_panel != null) {

		var status = do_panel.getFieldValue("flt_order.status");
		if((status == "Com") || (status == "Can") || (status == "S")) {

			var fo_id = do_panel.getFieldValue("flt_order.fo_id");
			try {
				var sSyntax = "(date_completed-date_perform)";
				var sDbType = getDatabaseType();
				if(sDbType == "MSSQL") {
					sSyntax = "CAST((date_completed-date_perform) AS FLOAT)";
				}
				var parameters = {
					sqlQuery: "UPDATE flt_order SET meter_trip=current_meter-meter_start" +
                                                  ", act_labor_hours=" + sSyntax + "*24 WHERE fo_id=" + fo_id
				};
				var result = Workflow.call('AbAssetFleetManagement-executeFleetSQL', parameters);
			} 
			catch (e) {
				Workflow.handleError(e);
			}
		}
	}
}

function getDatabaseType() {
	try {
		var result = Workflow.call('AbAssetFleetManagement-getDatabaseType', null);
		return result.message;
	} 
	catch (e) {
		Workflow.handleError(e);
	}
}