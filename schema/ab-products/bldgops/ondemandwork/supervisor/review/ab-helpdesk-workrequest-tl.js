/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-workrequest-tl.axvw' target='main'>ab-helpdesk-workrequest-tl.axvw</a>
 */
/**
 * Called when loading the form<br />
 * <a href='#populateToolTypes'>Prepare selection list with tooltypes</a>
 */
var assignToolController = View.createController('assignTool', {
    tool_form_afterRefresh: function(){
        populateToolTypes();
        
        if (this.tool_form.getFieldValue("wrtl.tool_id") == "") {
        	setCurrentLocalDateTime();
        }
        
        if (this.tool_form.getFieldValue("wrtl.tool_id") == '') {
            this.tool_form.setFieldValue("wrtl.date_start", '');
            this.tool_form.setFieldValue("wrtl.time_start", '');
            this.tool_form.setFieldValue("wrtl.date_end", '');
            this.tool_form.setFieldValue("wrtl.time_end", '');
        }
    }
    
});


/**
 * Create selection list with tool types for this work request<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#getToolTypesForWorkRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-getToolTypesForWorkRequest</a><br />
 * Called by <a href='#user_form_onload' target='main'>user_form_onload</a>
 */
function populateToolTypes(){
    var form = View.panels.get('tool_form');
	var result = {};
 	try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-getToolTypesForWorkRequest', form.getFieldValue("wrtl.wr_id"));
    	} 
  		catch (e) {
		Workflow.handleError(e);
 		}
    if (result.code == 'executed') {
        var res = eval('(' + result.jsonExpression + ')');
        selectControl = $("toolType");
        
        // get "-select" localized string 
        var selectTitle = '';
        if (getMessage('selectTitle') != "") 
            selectTitle = getMessage('selectTitle');
        
        var option = new Option(selectTitle, "");
        selectControl.options[0] = option;
        
        for (i = 0; i < res.length; i++) {
            option = new Option(res[i].tool_type, res[i].tool_type);
            selectControl.options[i + 1] = option;
        }
    }
    else {
        Workflow.handleError(result);
    }
}
/**
 * Save tool assignment<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#saveWorkRequestTool(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-saveWorkRequestTool</a><br />
 * Called by 'Save' button
 * @param {String} form current form
 */
function saveTool(){
    var panel = View.getControl('', 'tool_form');
    var record = ABODC_getDataRecord2(panel);

    if (!panel.save()) {
    	return;
    }
	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestTool", record);
    } 
   	catch (e) {
	Workflow.handleError(e);
 	}	
    if (result.code == 'executed') {
        res = eval('(' + result.jsonExpression + ')');
        
        if (res.conflict) {
            View.showMessage(result.message);
			panel.newRecord = true;
        } else {
    		View.getOpenerView().parentTab.loadView();    
        }
    }
    else {
        Workflow.handleError(result);
    }
}
/**
 * Get estimation for current tool type and current work request<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#getEstimationFromToolType(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-getEstimationFromToolType</a><br />
 * Fills in estimated hours for selected tool type
 */
function getEstimationFromToolType(){
    var toolForm = View.panels.get("tool_form");
    var hoursEst = toolForm.getFieldValue("wrtl.hours_est");
    if (hoursEst <= 0) {
        var tool_type = $("toolType").value;
        var wr_id = toolForm.getFieldValue("wrtl.wr_id");
        if (!tool_type) {
            return;
        }
		var result = {};
		try {
			 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-getEstimationFromToolType", tool_type,wr_id);
		} 
  		catch (e) {
		Workflow.handleError(e);
 		}
        if (result.code == 'executed') {
            var res = eval('(' + result.jsonExpression + ')');
            toolForm.setFieldValue("wrtl.hours_est", res.estimation);
        }
        else {
            Workflow.handleError(result);
        }
    }
}

/**
 * Get date and time to start according to service window for current workrequest<br />
 * Calls WFR AbBldgOpsHelpDesk-getServiceWindowStartFromSLA<br />
 * Fills in date and time started
 */
function getDateAndTimeStarted(){
    var panel = View.panels.get('tool_form');
    var wrId = panel.getFieldValue("wrtl.wr_id");
	var result = {};
	try {
		 result = Workflow.callMethod("AbBldgOpsHelpDesk-SLAService-getServiceWindowStartFromSLA", 'wr','wr_id',wrId);
    } 
	catch (e) {
		Workflow.handleError(e);
 		}
    if (result.code == 'executed') {
        var start = eval('(' + result.jsonExpression + ')');
        //split isodate yyyy-mm-dd
        temp = start.date_start.substring(1, start.date_start.length - 1).split("-");
        date = FormattingDate(temp[2], temp[1], temp[0], strDateShortPattern);
        //split isotime hh:mm:ss
        tmp = start.time_start.substring(1, start.time_start.length - 1).split(":");
        if (tmp[0] > 12) {
            time = FormattingTime(tmp[0], tmp[1], "PM", timePattern);
        }
        else {
            time = FormattingTime(tmp[0], tmp[1], "AM", timePattern);
        }
        
        $("tool_form_wrtl.date_start").value = date;
        $("tool_form_wrtl.time_start").value = time;
        $("Storedtool_form_wrtl.time_start").value = tmp[0] + ":" + tmp[1] + ".00.000";
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Called if tool type is selected/changed<br />
 * Calls <a href='#getEstimationFromToolType'>getEstimationFromToolType</a> and <a href='#getDateAndTimeStarted'>getDateAndTimeStarted</a>
 */
function onChangeToolType(){
    //get estimation
    getEstimationFromToolType();
    //fill in date and time started according to service window
    getDateAndTimeStarted();
}

/**
 * Opens select value dialog to select tool from selected tool type
 */
function onSelectTool(){
    if (document.getElementById('toolType').value != '') {
        View.selectValue("tool_form", getMessage('tool'), ["wrtl.tool_id"], "tl", ["tl.tool_id"], ["tl.tool_id", "tl.bl_id", "tl.tool_type"], {
            'tl.tool_type': document.getElementById('toolType').value
        });
    }
    else {
        View.selectValue("tool_form", getMessage('tool'), ["wrtl.tool_id"], "tl", ["tl.tool_id"], ["tl.tool_id", "tl.bl_id", "tl.tool_type"], {});
    }
}

/**
 * Open dialog with reservations for selected tool
 * @param {String} strSerialized xml
 */
function showReservations(){
    var tool_id = View.panels.get("tool_form").getFieldValue("wrtl.tool_id");
    if (tool_id == "") {
        alert(getMessage("noTool"));
        return;
    }
    
    var rest = new Ab.view.Restriction();
    rest.addClause("tl.tool_id", tool_id, "=");
    View.openDialog("ab-helpdesk-workrequest-tool-reservations.axvw", rest, false);
}


/**
 * 
 */
function setCurrentLocalDateTime() {
	var panel = View.getControl('', 'tool_form');
    var wr_id = panel.getFieldValue("wrtl.wr_id");
    
	try {
   		 var result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getCurrentLocalDateTime", 'wr','wr_id',wr_id);
		 if (result.code == 'executed') {
			var obj = eval('(' + result.jsonExpression + ')');
			panel.setFieldValue("wrtl.date_assigned", obj.date);
			panel.setInputValue("wrtl.time_assigned", obj.time);
		} else {
			Workflow.handleError(e);
		}
    }catch (e) {
		 Workflow.handleError(e);
 	}
}