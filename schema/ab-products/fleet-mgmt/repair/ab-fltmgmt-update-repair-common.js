var abFltMgmtRepairCommon_controller = View.createController('abFltMgmtRepairCommon_controller', {

	afterInitialDataFetch: function() {
		this.getParentOrderId();
	},

	getParentOrderId: function() {
		if(View.panels.get("panel_addedit_rocf") != null) {
			if(this.panel_addedit_rocf.getFieldValue("flt_rocf.fo_id") == "") {
				var ro_panel = View.getOpenerView().panels.get("panel_rocf");
				if(ro_panel != null) {
					var fo_id = ro_panel.restriction.split("'")[1];
					this.panel_addedit_rocf.setFieldValue("flt_rocf.fo_id", fo_id);
				}
			}
		}
		if(View.panels.get("panel_addedit_ropt") != null) {
			if(this.panel_addedit_ropt.getFieldValue("flt_ropt.fo_id") == "") {
				var ro_panel = View.getOpenerView().panels.get("panel_ropt");
				if(ro_panel != null) {
					var fo_id = ro_panel.restriction.split("'")[1];
					this.panel_addedit_ropt.setFieldValue("flt_ropt.fo_id", fo_id);
				}
			}
		}
		if(View.panels.get("panel_add_pmtask") != null) {
			var ro_panel = View.getOpenerView().panels.get("panel_pmtask");
			if(ro_panel != null) {
				var fo_id = ro_panel.restriction.split("'")[1];
				var vehicle_id = getVehicleId(fo_id);
				var restriction = new Ab.view.Restriction();
				restriction.addClause('pms.vehicle_id', vehicle_id, '=');
				this.panel_add_pmtask.refresh(restriction);
			}
		}
		if(View.panels.get("panel_addedit_rotask") != null) {
			if(this.panel_addedit_rotask.getFieldValue("flt_rotask.fo_id") == "") {
				var ro_panel = View.getOpenerView().panels.get("panel_rotask");
				if(ro_panel != null) {
					var fo_id = ro_panel.restriction.split("'")[1];
					this.panel_addedit_rotask.setFieldValue("flt_rotask.fo_id", fo_id);
				}
			}
		}
	}
});

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}

function validateROCF() {

	var panel_form=View.panels.get("panel_addedit_rocf");
	if(panel_form != null) {

		panel_form.clearValidationResult();
		if(!panel_form.validateFields()) {
			return false;
		}

		var hours_straight = parseFloat(panel_form.getFieldValue("flt_rocf.hours_straight"));
		var hours_over     = parseFloat(panel_form.getFieldValue("flt_rocf.hours_over"));
		var hours_double   = parseFloat(panel_form.getFieldValue("flt_rocf.hours_double"));
		var hours_total    = hours_straight + hours_over + hours_double;
		
		panel_form.setFieldValue("flt_rocf.hours_total", hours_total);
	}

	return true;
}

function validateROPT() {

	var panel_form=View.panels.get("panel_addedit_ropt");
	if(panel_form != null) {

		var qty_actual = panel_form.getFieldValue("flt_ropt.qty_actual");
		if(isNaN(qty_actual) || (qty_actual.length==0)) {
			qty_actual = "0";
			panel_form.setFieldValue("flt_ropt.qty_actual", "0.000");
		}
		var cost_unit = panel_form.getFieldValue("flt_ropt.cost_unit");
		if(isNaN(cost_unit) || (cost_unit.length==0)) {
			cost_unit = "0";
			panel_form.setFieldValue("flt_ropt.cost_unit", "0.00");
		}

		panel_form.clearValidationResult();
		if(!panel_form.validateFields()) {
			return false;
		}

		var cost_actual = parseFloat(qty_actual) * parseFloat(cost_unit);
		panel_form.setFieldValue("flt_ropt.cost_actual", cost_actual);
	}

	return true;
}

function validateROTASK() {

	var panel_form=View.panels.get("panel_addedit_rotask");
	if(panel_form != null) {

		var flt_task_library_id = panel_form.getFieldValue("flt_rotask.flt_task_library_id");
		var adj_hours = panel_form.getFieldValue("flt_rotask.adj_hours");
		if(isNaN(adj_hours) || (adj_hours.length == 0)) {
			adj_hours = "0";
			//panel_form.setFieldValue("flt_rotask.adj_hours", "0.00");
		}
		var description = panel_form.getFieldValue("flt_rotask.description");
	
		if(flt_task_library_id == "ADHOC") {
			if(trim(description).length == 0) {
				alert("A description is required when adding an ADHOC task.  Please enter a description and resubmit.");
				return false;
			}
		}

		panel_form.clearValidationResult();
		if(!panel_form.validateFields()) {
			return false;
		}
	}

	return true;
}

function refreshROCF() {

	var opener_panel = View.getOpenerView().panels.get("panel_rocf");
	if(opener_panel != null) {
		opener_panel.refresh();
	}
}

function refreshROPT() {

	var opener_panel = View.getOpenerView().panels.get("panel_ropt");
	if(opener_panel != null) {
		opener_panel.refresh();
	}
}

function refreshPMTASK() {

	var opener_panel = View.getOpenerView().panels.get("panel_pmtask");
	if(opener_panel != null) {
		opener_panel.refresh();
	}
}

function refreshROTASK() {

	var opener_panel = View.getOpenerView().panels.get("panel_rotask");
	if(opener_panel != null) {
		opener_panel.refresh();
	}
}

function addPMTASKs(row) {

	var opener_panel = View.getOpenerView().panels.get("panel_pmtask");
	if(opener_panel != null) {
		var fo_id  = opener_panel.restriction.split("'")[1];
		var pmp_id = row['pms.pmp_id'];
		if(!promptToDelete(fo_id, "Note: All current PM tasks for this repair order will be deleted before the new PM tasks are added.\r\n\r\nDo you want to continue?")) {
			return;
		}

		// Insert the selected PM Tasks
		try {
			var parameters = {
				sqlQuery: "INSERT INTO flt_pmtask (fo_id, flt_task_library_id, step, adj_hours, std_hours, description) " +
					  "(SELECT '" + fo_id + "', flt_task_library.flt_task_library_id, pmps.pmps_id, " +
					  "pmps.adj_hours, flt_task_library.std_hours, flt_task_library.desc_short FROM pmps, flt_task_library " +
					  "WHERE pmps.flt_task_library_id = flt_task_library.flt_task_library_id " +
					  "AND pmps.pmp_id = '" + pmp_id + "')"
			};
			var result = Workflow.call('AbAssetFleetManagement-executeFleetSQL', parameters);
		} 
		catch (e) {
			Workflow.handleError(e);
		}

		opener_panel.refresh();
		View.closeThisDialog();
	}
}

function getVehicleId(fo_id) {

	try {
		var parameters = {
			tableName: 'flt_order',
			fieldNames: toJSON(['flt_order.vehicle_id']),
			restriction: toJSON("flt_order.fo_id='" + fo_id + "'")
		};
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);

		var rows = result.data.records;
		if(rows.length > 0) {
			return rows[0]['flt_order.vehicle_id'];
		}
	} 
	catch (e) {
		Workflow.handleError(e);
	}

	return "null";
}

function deletePMTasks() {

	var pmtask_panel = View.panels.get("panel_pmtask");
	if(pmtask_panel != null) {
		var fo_id  = pmtask_panel.restriction.split("'")[1];
		if(promptToDelete(fo_id, "Note: All PM tasks for this repair order will be deleted.\r\n\r\nDo you want to continue?")) {
			pmtask_panel.refresh();
		}
	}
}

function promptToDelete(fo_id, promptText) {

	// Check if any PM Tasks exist
	try {
		var parameters = {
			tableName: 'flt_pmtask',
			fieldNames: toJSON(['flt_pmtask.pmtask_id']),
			restriction: toJSON("flt_pmtask.fo_id='" + fo_id + "'")
		};
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		var rows = result.data.records;
		if(rows.length > 0) {
			if(confirm(promptText) == false) {
				return false;
			} else {

				// Delete the PM Tasks
				try {
					var parameters = {
						sqlQuery: "DELETE FROM flt_pmtask WHERE fo_id='" + fo_id + "'"
					};
					var result = Workflow.call('AbAssetFleetManagement-executeFleetSQL', parameters);
				} 
				catch (e) {
					Workflow.handleError(e);
				}
			}
		}
	}
	catch (e) {
		Workflow.handleError(e);
	}
	return true;
}
