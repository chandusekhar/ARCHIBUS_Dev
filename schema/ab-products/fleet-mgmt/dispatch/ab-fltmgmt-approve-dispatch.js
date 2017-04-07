
var abFltMgmtDOApprove_controller = View.createController('abFltMgmtDOApprove_controller', {

	panel_dolist_afterRefresh: function() {
		var objTabs = View.getOpenerView().panels.get("dotabs");
		if(objTabs != null) {
			objTabs.setTabEnabled("page2", false);
			objTabs.setTabEnabled("page3", false);
			this.panel_doapprove.show(false);
		} else {
			alert("objTabs is null.");
		}
	},

	panel_doapprove_afterRefresh: function() {
		this.setApprover();
	},

	setApprover: function() {
		try {
			var result = Workflow.call("AbCommonResources-getUser", {});
			var userInfo = result.data;
			this.panel_doapprove.setFieldValue("flt_order.approver", userInfo.Employee.em_id);
		} catch (e) {
			Workflow.handleError(e);
		}        
	}
});

function checkAvailable() {

	var panel_form=View.panels.get("panel_doapprove");
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
		if(date_perform+" "+time_perform > date_est_completion+" "+time_est_completion) {
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
		View.selectValue('panel_doapprove', 'Vehicle', ['flt_order.vehicle_id'], 'vehicle', ['vehicle.vehicle_id'], ['vehicle.vehicle_id', 'vehicle.vehicle_type_id', 'vehicle.mfr_id', 'vehicle.model_id', 'vehicle.loc_vehicle'], strRest, '');
	}
}

function approveDO() {

	var panel_form=View.panels.get("panel_doapprove");
	if(panel_form != null) {

		var vehicle_id = panel_form.getFieldValue("flt_order.vehicle_id");
		if(vehicle_id == "") {
			alert("You must select a vehicle before approving this dispatch request.");
			return false;
		}
		
		panel_form.setFieldValue("flt_order.status","I");
	}

	return true;
}

function rejectDO() {

	var panel_form=View.panels.get("panel_doapprove");
	if(panel_form != null) {
		panel_form.setFieldValue("flt_order.status","Rej");
	}

	return true;
}

function sendApprovalNotification() {

	var panel_form=View.panels.get("panel_doapprove");
	if(panel_form != null) {
		var fo_id = panel_form.getFieldValue("flt_order.fo_id");
		var em_id = panel_form.getFieldValue("flt_order.em_id");
		var vehicle_id = panel_form.getFieldValue("flt_order.vehicle_id");
		panel_form.restriction = "flt_order.fo_id='"+fo_id+"'";

		var em_email = getEmployeeEmail(em_id);
		if(em_email != "") {
			//alert("Sending approval notification for order "+fo_id+".");
			var arrVehicle = getVehicleInfo(vehicle_id);
			var subject = "Fleet Dispatch Request #"+fo_id+" approved";
			var body = "Your fleet dispatch request for a "+panel_form.getFieldValue("flt_order.vehicle_type_id")+" has been approved."
				 + "\r\n\r\nFrom: "+panel_form.getFieldValue("flt_order.date_perform")
				 + " at "+panel_form.getFieldValue("flt_order.time_perform").substr(0,5)
				 + "\r\nTo: "+panel_form.getFieldValue("flt_order.date_est_completion")
				 + " at "+panel_form.getFieldValue("flt_order.time_est_completion").substr(0,5)
				 + "\r\n\r\nVehicle: "+vehicle_id
				 + "\r\nManufacturer: "+arrVehicle['vehicle.mfr_id']
				 + "\r\nModel: "+arrVehicle['vehicle.model_id']
				 + "\r\nSerial Number: "+arrVehicle['vehicle.num_serial']
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

function sendRejectionNotification() {

	var panel_form=View.panels.get("panel_doapprove");
	if(panel_form != null) {
		var fo_id = panel_form.getFieldValue("flt_order.fo_id");
		var em_id = panel_form.getFieldValue("flt_order.em_id");
		panel_form.restriction = "flt_order.fo_id='"+fo_id+"'";

		var em_email = getEmployeeEmail(em_id);
		if(em_email != "") {
			//alert("Sending rejection notification for order "+fo_id+".");
			var subject = "Fleet Dispatch Request #"+fo_id+" rejected";
			var body = "Your fleet dispatch request for a "+panel_form.getFieldValue("flt_order.vehicle_type_id")+" has been rejected."
				 + "\r\n\r\nFrom: "+panel_form.getFieldValue("flt_order.date_perform")
				 + " at "+panel_form.getFieldValue("flt_order.time_perform").substr(0,5)
				 + "\r\nTo: "+panel_form.getFieldValue("flt_order.date_est_completion")
				 + " at "+panel_form.getFieldValue("flt_order.time_est_completion").substr(0,5)
				 + "\r\n\r\nComments:\r\n"+panel_form.getFieldValue("flt_order.comments")
				 + "\r\n\r\nFor assistance, please contact your dispatch coordinator."
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

function getDatabaseType() {
	try {
		var result = Workflow.call('AbAssetFleetManagement-getDatabaseType', null);
		return result.message;
	} 
	catch (e) {
		Workflow.handleError(e);
	}
}