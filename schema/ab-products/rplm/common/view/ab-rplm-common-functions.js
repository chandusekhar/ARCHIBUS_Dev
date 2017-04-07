
/**
 * Sets date_start and date_end to match lease's dates 
 * when the field 'Cost Dates Match Lease?' is checked by the user.
 * @param chkId checkbox id
 * @param formId form id
 */
function setDatesMatchLease(chkId, formId){
	var objCheckbox = document.getElementById(chkId);
	var objForm = View.panels.get(formId);
	var objDs = View.dataSources.get("dsAddEditRecurringCost_ls");
	
	if(objCheckbox){
		if(objCheckbox.checked){
			var restriction = new Ab.view.Restriction();
			var lease_id = objForm.getFieldValue("cost_tran_recur.ls_id");
			restriction.addClause("ls.ls_id", lease_id, "=");
			var record =objDs.getRecord(restriction);
			var dateStart = record.getValue("ls.date_start");
			var uiDateStart = objDs.formatValue("ls.date_start", dateStart, true); 
			var dateEnd = record.getValue("ls.date_end");
			var uiDateEnd = objDs.formatValue("ls.date_end", dateEnd, true); 
			objForm.setFieldValue("cost_tran_recur.date_start", uiDateStart);
			objForm.setFieldValue("ls.date_start", uiDateStart);
			objForm.setFieldValue("cost_tran_recur.date_end", uiDateEnd);
			objForm.setFieldValue("ls.date_end", uiDateEnd);
		}
	}
}

/**
 * Checks or unchecks the field 'Cost Dates Match Lease?' if date_start and date_end match or not lease's dates.
 * @param chkId
 * @param formId
 * @param dateStart date start id
 * @param dateEnd date end id
 */
function checkIfDatesMatch(chkId, formId, dateStart, dateEnd){
	var toBeChecked = true;
	var objCheckbox = document.getElementById(chkId);
	var objForm = View.panels.get(formId);
	var objDs = View.dataSources.get(objForm.dataSourceId);
	if(objCheckbox){
		var restriction = new Ab.view.Restriction();
		restriction.addClause("ls.ls_id", objForm.getFieldValue("cost_tran_recur.ls_id"), "=");
		var record = objDs.getRecord(restriction);
			
		if(objForm.getFieldValue(dateStart) != objForm.getFieldValue(dateStart.replace("cost_tran_recur.","ls."))){
			toBeChecked = false;
		}
		
		if(objForm.getFieldValue(dateEnd) != objForm.getFieldValue(dateEnd.replace("cost_tran_recur.","ls."))){
			toBeChecked = false;
		}
		
		objCheckbox.checked = toBeChecked;
	}
}

/**
 * If the option 'Option Dates Match Lease?' is checked then date_start and date_option get lease's dates values and became disabled, 
 * else they just became enabled.
 * @param chkId
 * @param formId
 * @param dateStart date start id
 * @param dateEnd date end id
 */
function setOptionDatesIfMatchLease(panel){
	var objDs = View.dataSources.get("dsHelperLeaseForOptionDatesMatch");
    if (panel.getFieldValue('op.dates_match_lease') == 1) {
        panel.enableField('op.date_start', false);
        panel.enableField('op.date_option', false);
        var restriction = new Ab.view.Restriction();
		var lease_id = panel.getFieldValue("op.ls_id");
		restriction.addClause("ls.ls_id", lease_id, "=");
		var record = objDs.getRecord(restriction);
		var dateStart = record.getValue("ls.date_start");
		var uiDateStart = objDs.formatValue("ls.date_start", dateStart, true); 
		var dateEnd = record.getValue("ls.date_end");
		var uiDateEnd = objDs.formatValue("ls.date_end", dateEnd, true); 
		panel.setFieldValue("op.date_start", uiDateStart);
		panel.setFieldValue("op.date_option", uiDateEnd);
    }
    else 
        if (panel.getFieldValue('op.dates_match_lease') == 0) {
            panel.enableField('op.date_start', true);
            panel.enableField('op.date_option', true);
        }
}

/**
 * Compare dates fields. End date cannot be smaller than start date.
 * @param formId form panel
 * @param startDateId start date id
 * @param endDateId end date id
 * @param message error message
 */
function compareDates(formId, startDateId, endDateId, messageId){
	var validDates = true;
	var objForm = View.panels.get(formId);
	var objDs = objForm.getDataSource();
	var startDate = objForm.getFieldValue(startDateId);
	var endDate = objForm.getFieldValue(endDateId);
	if (valueExistsNotEmpty(startDate) && valueExistsNotEmpty(endDate)) {
		var objStartDate = objDs.parseValue(startDateId, startDate, false);
		var objEndDate = objDs.parseValue(endDateId, endDate, false);
		if (objStartDate.getTime() >= objEndDate.getTime()) {
			var message = getMessage(messageId);
			message =  message.replace('{0}', objForm.fields.get(endDateId).fieldDef.title);
			message =  message.replace('{1}', objForm.fields.get(startDateId).fieldDef.title);
			validDates = false;
			View.showMessage(message);
		}
	}
	
	return validDates;
}