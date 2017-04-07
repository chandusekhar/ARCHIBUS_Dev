
function checkAvailable() {

	var panel_form=View.panels.get("panel_rocreate");
	if(panel_form != null) {

		var date_perform = panel_form.getFieldValue("flt_order.date_perform");
		var time_perform = panel_form.getFieldValue("flt_order.time_perform").substr(0,5);
		var date_est_completion = panel_form.getFieldValue("flt_order.date_est_completion");
		var time_est_completion = panel_form.getFieldValue("flt_order.time_est_completion").substr(0,5);

		if((date_perform == "")	|| (time_perform == "") || (date_est_completion == "") || (time_est_completion == "")) {
			alert("You must enter the vehicle IN and OUT dates before selecting a vehicle.");
			return false;
		}
		if(date_perform+" "+time_perform > date_est_completion+" "+time_est_completion) {
			alert("The vehicle IN date must come before the vehicle OUT date.");
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
				"AND vehicle.avail_fro='Y'";

		View.selectValue('panel_rocreate', 'Vehicle', ['flt_order.vehicle_id'], 'vehicle', ['vehicle.vehicle_id'], ['vehicle.vehicle_id', 'vehicle.vehicle_type_id', 'vehicle.mfr_id', 'vehicle.model_id', 'vehicle.loc_vehicle'], strRest, '');
	}

}

function clearVehicle() {

	var panel_form=View.panels.get("panel_rocreate");
	if(panel_form != null) {
		panel_form.setFieldValue("flt_order.vehicle_id", "");
	}
}

function validateROFields() {

	var panel_form=View.panels.get("panel_rocreate");
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
			alert("The vehicle IN date must come before the vehicle OUT date.");
			return false;
		}

		panel_form.setFieldValue("flt_order.status", "I");
	}

	return true;
}

function emailROConfirmation() {

	var panel_form=View.panels.get("panel_rocreate");
	if(panel_form != null) {
		var fo_id = panel_form.getFieldValue("flt_order.fo_id");
		var vehicle_id = panel_form.getFieldValue("flt_order.vehicle_id");
		panel_form.restriction = "flt_order.fo_id='"+fo_id+"'";

		var em_email = getVehicleEmployee(vehicle_id);
		if(em_email != "") {
			//alert("Sending email confirmation for repair order "+fo_id+".");
			var subject = "Fleet Repair Order #"+fo_id+" created for Vehicle "+vehicle_id;
			var body = "Your vehicle ("+vehicle_id+") has been scheduled for maintenance.\r\n\r\n"
				 + "Date: "+panel_form.getFieldValue("flt_order.date_perform")+"\r\n"
				 + "Time: "+panel_form.getFieldValue("flt_order.time_perform").substr(0,5)+"\r\n";

			var arrVehicle = getVehicleInfo(vehicle_id);
			if(arrVehicle != null) {
				body += "\r\nManufacturer: "+arrVehicle['vehicle.mfr_id']
				     +  "\r\nModel: "+arrVehicle['vehicle.model_id']
				     +  "\r\nSerial Number: "+arrVehicle['vehicle.num_serial']+"\r\n";
			}
			body += "\r\nShop Code: "+panel_form.getFieldValue("flt_order.shop_id")
			     +  "\r\nRepair Type: "+panel_form.getFieldValue("flt_order.repair_type_id")
			     +  "\r\n\r\nComments:\r\n"+panel_form.getFieldValue("flt_order.comments")
			     +  "\r\n\r\n\r\nThis is an automated message.  Please do not reply.";

			try {
				var parameters = {
					recipient: em_email,
					subject: subject,
					body: body
				};
				var result = Workflow.call('AbAssetFleetManagement-sendFleetEmail', parameters);
			} 
			catch (e) {
				Workflow.handleError(e);
			}
		}
	}
	return true;
}

function getVehicleEmployee(vehicle_id) {

	try {
		var parameters = {
			tableName: 'em',
			fieldNames: toJSON(['em.email']),
			restriction: toJSON("em.em_id=(SELECT em_id FROM vehicle WHERE vehicle_id='" + vehicle_id + "')")
		};
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		var rows = result.data.records;
		if(rows.length > 0) {
			return rows[0]["em.email"];
		}
	} 
	catch (e) {
		Workflow.handleError(e);
	}
	return "";
}

function getVehicleInfo(vehicle_id) {

	var arrVehicle = new Array();
	try {
		var parameters = {
			tableName: 'vehicle',
			fieldNames: toJSON(['vehicle.model_id','vehicle.mfr_id','vehicle.num_serial']),
			restriction: toJSON("vehicle_id='" + vehicle_id + "'")
		};
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		var rows = result.data.records;
		if(rows.length > 0) {
			arrVehicle = rows[0];
			return arrVehicle;
		}
	} 
	catch (e) {
		Workflow.handleError(e);
	}
	return null;
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