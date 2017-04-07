
function checkAvailable() {

	var panel_form=View.panels.get("panel_docreate");
	if(panel_form != null) {

		var date_perform = panel_form.getFieldValue("flt_order.date_perform");
		var time_perform = panel_form.getFieldValue("flt_order.time_perform").substr(0,5);
		var date_est_completion = panel_form.getFieldValue("flt_order.date_est_completion");
		var time_est_completion = panel_form.getFieldValue("flt_order.time_est_completion").substr(0,5);

		//alert("date_perform="+date_perform+"\r\ntime_perform="+time_perform+"\r\ndate_est_completion="+date_est_completion+"\r\ntime_est_completion="+time_est_completion);
		if((date_perform == "")	|| (time_perform == "") || (date_est_completion == "") || (time_est_completion == "")) {
			alert("You must enter the vehicle OUT and IN dates before selecting a vehicle.");
			return false;
		}
		if(date_perform+" "+time_perform >= date_est_completion+" "+time_est_completion) {
			alert("The vehicle OUT date must come before the vehicle IN date.");
			return false;
		}

		var sDateOut = "";
		var sTimeOut = "";
		var sDateIn  = "";
		var sTimeIn  = "";

		var sDbType = getDatabaseType();
		if(sDbType == "Oracle") {
			sDateOut = "TO_DATE('"+date_perform+"','YYYY-MM-DD')";
			sTimeOut = "TO_DATE('1899-12-30 "+time_perform+"','YYYY-MM-DD HH24:MI')";
			sDateIn  = "TO_DATE('"+date_est_completion+"','YYYY-MM-DD')";
			sTimeIn  = "TO_DATE('1899-12-30 "+time_est_completion+"','YYYY-MM-DD HH24:MI')";
		}
		else {
			sDateOut = "'"+date_perform+"'";
			sTimeOut = "'1899-12-30 "+time_perform+"'";
			sDateIn  = "'"+date_est_completion+"'";
			sTimeIn  = "'1899-12-30 "+time_est_completion+"'";
		}

		var strRest  = "vehicle.vehicle_id NOT IN (SELECT DISTINCT flt_order.vehicle_id " +
				"FROM flt_order " +
				"WHERE vehicle_id IS NOT NULL " +
				"AND (date_perform &lt; " + sDateIn + " " +
				"OR (date_perform = " + sDateIn + " AND time_perform &lt; " + sTimeIn + ")) " +
				"AND (date_est_completion &gt; " + sDateOut + " " +
				"OR (date_est_completion = " + sDateOut + " AND time_est_completion &gt; " + sTimeOut + ")) " +
				"AND flt_order.status NOT IN ('S','Can','Com','Clo','HA','Rej') " +
				"AND flt_order.vehicle_id IS NOT NULL) " +
				"AND vehicle.date_excessed IS NULL " +
				"AND vehicle.em_id IS NULL AND vehicle.dv_id IS NULL " + // Used for Dispatch Orders Only
				"AND vehicle.avail_fdo='Y'";

		//alert(strRest);
		View.selectValue('panel_docreate', 'Vehicle', ['flt_order.vehicle_id'], 'vehicle', ['vehicle.vehicle_id'], ['vehicle.vehicle_id', 'vehicle.vehicle_type_id', 'vehicle.mfr_id', 'vehicle.model_id', 'vehicle.loc_vehicle'], strRest, '');
	}

}

function clearVehicle() {

	var panel_form=View.panels.get("panel_docreate");
	if(panel_form != null) {
		panel_form.setFieldValue("flt_order.vehicle_id", "");
	}
}

function validateDOFields() {

	var panel_form=View.panels.get("panel_docreate");
	if(panel_form != null) {

		panel_form.clearValidationResult();
		if(!panel_form.validateFields()) {
			return false;
		}

		var initialfrom = panel_form.getFieldValue("flt_order.initialfrom");
		var destinationto = panel_form.getFieldValue("flt_order.destinationto");
		var date_perform = panel_form.getFieldValue("flt_order.date_perform");
		var time_perform = panel_form.getFieldValue("flt_order.time_perform").substr(0,5);
		var date_est_completion = panel_form.getFieldValue("flt_order.date_est_completion");
		var time_est_completion = panel_form.getFieldValue("flt_order.time_est_completion").substr(0,5);
		
		//alert("date_perform="+date_perform+"\r\ntime_perform="+time_perform+"\r\ndate_est_completion="+date_est_completion+"\r\ntime_est_completion="+time_est_completion);
		if(date_perform+" "+time_perform > date_est_completion+" "+time_est_completion) {
			alert("The vehicle OUT date must come before the vehicle IN date.");
			return false;
		}

	  	var description = "INITIAL (From): " + initialfrom + " <br/>\r\n" +
			"DESTINATION (To): " + destinationto + " <br/>\r\n" +
			"Expected In: " + date_est_completion + " " +
			time_est_completion + "\r\n";
		panel_form.setFieldValue("flt_order.description", description);
		panel_form.setFieldValue("flt_order.status", "I");
	}

	return true;
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