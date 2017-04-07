var abFltMgmtROUpdate_controller = View.createController('abFltMgmtROUpdate_controller', {

	panel_ro_afterRefresh: function() {
		this.updateStatusList();
		var fo_id = this.panel_ro.getFieldValue("flt_order.fo_id");
		var rosubtabs = View.panels.get("rosubtabs");
		if(rosubtabs != null) {
			rosubtabs.setTabRestriction("fltmgmt_rocf", "flt_rocf.fo_id='"+fo_id+"'");
			rosubtabs.setTabRestriction("fltmgmt_ropt", "flt_ropt.fo_id='"+fo_id+"'");
			rosubtabs.setTabRestriction("fltmgmt_pmtask", "flt_pmtask.fo_id='"+fo_id+"'");
			rosubtabs.setTabRestriction("fltmgmt_rotask", "flt_rotask.fo_id='"+fo_id+"'");
			setTimeout("View.panels.get('rosubtabs').selectFirstVisibleTab();View.panels.get('rosubtabs').refreshTab('fltmgmt_rocf');", 1000);
		}
	},

	updateStatusList: function() {
		var ctrlStatus = $('flt_order.status');
		if(ctrlStatus)
		{
			var i=0;
			while(i < ctrlStatus.options.length) {
				if((ctrlStatus.options[i].value == "Req") || (ctrlStatus.options[i].value == "Rej") || (ctrlStatus.options[i].value == "App")) {
					ctrlStatus.options[i] = null;
				} else {
					i++;
				}
			}
		}
	}
});

function validateRepairOrder() {

	var ro_panel = View.panels.get("panel_ro");
	if(ro_panel != null) {

		ro_panel.clearValidationResult();
		if(!ro_panel.validateFields()) {
			return false;
		}

		var status         = ro_panel.getFieldValue("flt_order.status");
		var date_completed = ro_panel.getFieldValue("flt_order.date_completed");
		var time_completed = ro_panel.getFieldValue("flt_order.time_completed");
		var current_meter  = ro_panel.getFieldValue("flt_order.current_meter");
		var meter_start    = ro_panel.getFieldValue("flt_order.meter_start");

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

function calculateNextPMs() {

	var ro_panel = View.panels.get("panel_ro");
	if(ro_panel != null) {

		var fo_id  = ro_panel.getFieldValue("flt_order.fo_id");
		var status = ro_panel.getFieldValue("flt_order.status");
		var pms_id = ro_panel.getFieldValue("flt_order.pms_id");

		if((status == "Com") && (pms_id != "")) {

			try {
				var parameters = {
					fo_id: fo_id, status: status, pms_id: pms_id
				};
				var result = Workflow.call('AbAssetFleetManagement-calculateNextPMs', parameters);
			} 
			catch (e) {
				Workflow.handleError(e);
			}
		}
	}
}
