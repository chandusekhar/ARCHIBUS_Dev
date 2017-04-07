/**
 * 
 */
var abRrRmArrangeController = View.createController('abRrRmArrangeController', {
	timelineLimits: null
});

/**
 * This function is called when action_approval_expired field value changes
 */
function onChangeAction(){
	var panel = View.panels.get("rm_arrange_form");
	
	// If selected action when approval expired is Notify, enable the user to notify field, otherwise disable it
	if (panel.getFieldValue("rm_arrange.action_approval_expired") == 2) {
		panel.enableField("rm_arrange.user_approval_expired", true);
	} else {
		panel.enableField("rm_arrange.user_approval_expired", false);
		panel.setFieldValue("rm_arrange.user_approval_expired", '');		
	}
}

/**
 * This function is called after refreshing the edit form
 */
function rmArrangeFormAfterRefresh() {
	var panel = View.panels.get("rm_arrange_form");
	
	// If selected action when approval expired is Notify, enable the user to notify field, otherwise disable it
	if (panel.getFieldValue("rm_arrange.action_approval_expired") == 2) {
		panel.enableField("rm_arrange.user_approval_expired", true);
	} else {
		panel.enableField("rm_arrange.user_approval_expired", false);
	}
}

/**
 * It is called when user click Save button on room arrangement form.
 */
function onSaveForm() {
	var panel = View.panels.get("rm_arrange_form");
	
	if (panel.getFieldValue("rm_arrange.day_start") != '' && panel.getFieldValue("rm_arrange.day_end") != ''){
		if(panel.getFieldValue("rm_arrange.day_start") >= panel.getFieldValue("rm_arrange.day_end")) {
			View.showMessage(getMessage('wrongTimeScopeError'));
		} else {
			//Get the afm_activity_params value for TimelineStartTime and TimelineEndTime
			if (typeof abRrRmArrangeController.timelineLimits == "undefined" || abRrRmArrangeController.timelineLimits == null) {
				try{
					var results = Workflow.callMethod("AbWorkplaceReservations-common-getTimelineLimits");
					setTimelineLimits(results);
				}catch(e){
					Workflow.handleError(e);
				}
			} else {
				checkCorrectValues();
			}
		}
	} else {
		View.showMessage(getMessage('noTimeError'));
	}
}

/**
 * Handle WFR results
 * @param {Object} result
 */ 
function setTimelineLimits(result){
	if (result.code == "executed") {
		var timelineLimits = eval("(" + result.jsonExpression + ")");
		abRrRmArrangeController.timelineLimits = timelineLimits;
		checkCorrectValues();
	} else {
		logError(result, 'AbWorkplaceReservations-getTimelineLimits');
	}
}

/**
 * Check the form values before updating the room arrangement values.
 */
function checkCorrectValues() {
	var panel = View.panels.get("rm_arrange_form");
	if ((ABRV_isMinnor(panel.getFieldValue("rm_arrange.day_start"), abRrRmArrangeController.timelineLimits.TimelineStartTime)) 
			|| (ABRV_isMinnor(abRrRmArrangeController.timelineLimits.TimelineEndTime, panel.getFieldValue("rm_arrange.day_end")))){
		View.showMessage(getMessage('outOfTimelineLimitsError'));
	} else{
		// If selected action when approval expired is Notify, then check the user selected the user to notify		
		if ((panel.getFieldValue("rm_arrange.action_approval_expired") == 2) 
				&& (panel.getFieldValue("rm_arrange.user_approval_expired") == '')) {
			View.showMessage(getMessage('noUserToNotifyError'));
		} else {
			//If the room has been set to non-reservable, check if it has any pending reservation
			if (panel.getFieldValue('rm_arrange.reservable') == 0) {
				var xmlRecord = ABRV_getDataRecord(panel);
				
				try{
					var results =  Workflow.callMethod('AbWorkplaceReservations-common-getNumberPendingReservations', xmlRecord);
					setNumberPendingReservations(results);
				}catch(e){
					Workflow.handleError(e);
				}
			} else {
				if (panel.save()) {
					var panelRmList = View.panels.get("rm_arrange_list");
					panelRmList.refresh();
				}
			}
		}
	}
}

/**
 * Handle the result from the WFR AbWorkplaceReservations-getNumberPendingReservations.
 * @param {Object} result
 */
function setNumberPendingReservations(result) {
	var panel = View.panels.get("rm_arrange_form");
	
	if (result.code != 'executed') {
    	View.showMessage(result.message);
    } else {
		var pendingRes = eval("(" + result.jsonExpression + ")");
		//Modified for kb 3019116. In WFR getNumberPendingReservations maybe not return pendingRes, so here add a condition. By ZY,2008-08-19.
		if (pendingRes && pendingRes.numberPendingRes != '0'){
			View.confirm(
				getMessage('pendingReservationsError'),
				function(button) {
		            if (button == 'yes') {
		            	if (panel.save()) {
					   		var panelRmList = View.panels.get("rm_arrange_list");
					   		panelRmList.refresh();
					   	}
					}});
		} else {
			if (panel.save()) {
				var panelRmList = View.panels.get("rm_arrange_list");
				panelRmList.refresh();
			}
		}
	}
}
