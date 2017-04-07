var abFltMgmtEditOperator_controller = View.createController('abFltMgmtEditOperator_controller', {

	afterInitialDataFetch: function() {
		this.getParentOrderId();
	},

	getParentOrderId: function() {
		if(this.panel_addedit_operator.getFieldValue("flt_doem.fo_id") == "") {
			var do_panel = View.getOpenerView().panels.get("panel_do");
			if(do_panel != null) {
				this.panel_addoperator.setFieldValue("flt_doem.fo_id", do_panel.getFieldValue("flt_order.fo_id"));
			}
		}
	}
});

function validateOperator() {

	var panel_form=View.panels.get("panel_addedit_operator");
	if(panel_form != null) {

		panel_form.clearValidationResult();
		if(!panel_form.validateFields()) {
			return false;
		}

		var date_start = panel_form.getFieldValue("flt_doem.date_start");
		var time_start = panel_form.getFieldValue("flt_doem.time_start").substr(0,5);
		var date_end = panel_form.getFieldValue("flt_doem.date_end");
		var time_end = panel_form.getFieldValue("flt_doem.time_end").substr(0,5);
		
		if((date_start != "") && (date_end != "")) {
			if(date_start > date_end) {
				alert("The date STARTED must come before the date FINISHED.");
				return false;
			}
			else if((time_start != "") && (time_end != "")) {
				if(date_start+" "+time_start >= date_end+" "+time_end) {
					alert("The date STARTED must come before the date FINISHED.");
					return false;
				}
			}
		}

		var hours_straight = parseFloat(panel_form.getFieldValue("flt_doem.hours_straight"));
		var hours_over     = parseFloat(panel_form.getFieldValue("flt_doem.hours_over"));
		var hours_double   = parseFloat(panel_form.getFieldValue("flt_doem.hours_double"));
		var hours_total    = hours_straight + hours_over + hours_double;
		
		panel_form.setFieldValue("flt_doem.hours_total", hours_total);
	}

	return true;
}

function refreshOperators() {

	var operator_panel = View.getOpenerView().panels.get("panel_operator");
	if(operator_panel != null) {
		operator_panel.refresh();
	}
}