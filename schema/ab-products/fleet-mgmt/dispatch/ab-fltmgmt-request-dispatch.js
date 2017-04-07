
function validateDOFields() {

	var panel_form=View.panels.get("panel_dorequest");
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
		if(date_perform+" "+time_perform >= date_est_completion+" "+time_est_completion) {
			alert("The vehicle OUT date must come before the vehicle IN date.");
			return false;
		}

	  	var description = "INITIAL (From): " + initialfrom + " <br/>\r\n" +
			"DESTINATION (To): " + destinationto + " <br/>\r\n" +
			"Expected In: " + date_est_completion + " " +
			time_est_completion + "\r\n";
		panel_form.setFieldValue("flt_order.description", description);
		panel_form.setFieldValue("flt_order.status", "Req");
	}

	return true;
}

function emailDOConfirmation() {

	var panel_form=View.panels.get("panel_dorequest");
	if(panel_form != null) {
		var fo_id = panel_form.getFieldValue("flt_order.fo_id");
		var em_id = panel_form.getFieldValue("flt_order.em_id");

		var em_email = getEmployeeEmail(em_id);
		if(em_email != "") {
			//alert("Sending email confirmation for dispatch order "+fo_id+".");
			var subject = "Fleet Dispatch Request #"+fo_id+" received";
			var body = "Your fleet dispatch request for a "+panel_form.getFieldValue("flt_order.vehicle_type_id")+" has been received."
				 + "\r\n\r\nFrom: "+panel_form.getFieldValue("flt_order.date_perform")
				 + " at "+panel_form.getFieldValue("flt_order.time_perform").substr(0,5)
				 + "\r\nTo: "+panel_form.getFieldValue("flt_order.date_est_completion")
				 + " at "+panel_form.getFieldValue("flt_order.time_est_completion").substr(0,5)
				 + "\r\n\r\nDescription:\r\n"+panel_form.getFieldValue("flt_order.description")
				 + "\r\n\r\n\r\nThis is an automated message.  Please do not reply.";

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

function getEmployeeEmail(em_id) {

	try {
		var parameters = {
			tableName: 'em',
			fieldNames: toJSON(['em.email']),
			restriction: toJSON("em.em_id='" + fixApos(em_id) + "'")
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

function fixApos(sText) {
	var arrText = sText.split("'");
	sNewText = arrText[0];
	for(i=1; i<arrText.length; i++) {
		sNewText += "''" + arrText[i];
	}
	return sNewText;
}
