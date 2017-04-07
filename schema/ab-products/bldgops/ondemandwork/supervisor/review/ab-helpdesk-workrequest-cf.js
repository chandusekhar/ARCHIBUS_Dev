
var assignCfController = View.createController('assignCf', {
    /**
     * Called when loading the form<br />
     * <a href='#populateTrades'>Fill selection list with trades</a>
     */
    cf_form_afterRefresh: function(){
        populateTrades();
        setTrade();
        if (this.cf_form.getFieldValue("wrcf.cf_id") == "") {
        	setCurrentLocalDateTime();
        }
    }
});


function setTrade(){
    var panel = View.getControl('', 'cf_form');
    var trId = panel.getRecord().getValue('wrcf.scheduled_from_tr_id');
    if (trId) {
        var selectElem = $("wrcf.scheduled_from_tr_id");
        var exist = false;
        var i;
        for (i = 0; i < selectElem.options.length; i++) {
        	if (selectElem.options[i].value == trId) {
        		exist = true;
        		selectElem.selectedIndex = i;
        		break;
        	}
		}
        
        if (!exist) {
	        selectElem.options[selectElem.options.length] = new Option(trId, trId);
	        selectElem.selectedIndex = selectElem.options.length - 1;
        }
    }
}

/**
 * Select craftsperson of given trade<br />
 * Opens select value window for craftspersons which belong to the selected trade
 */
function selectCf(){
	var cfPanel = View.panels.get("cf_form");
	var wrId = cfPanel.getFieldValue("wrcf.wr_id");
	var sql = "(date_contract_exp IS NULL OR date_contract_exp > ${sql.currentDate}) AND assign_work = 1 AND status = 'A' " +
			"AND work_team_id IN (SELECT work_team_id FROM wr WHERE wr_id = "+wrId+
				" UNION SELECT work_team_id FROM cf WHERE email = " +
					"(SELECT email FROM em WHERE em_id = " +
						"(SELECT supervisor FROM wr WHERE wr_id = "+wrId+")))";
	if ($('wrcf.scheduled_from_tr_id').value != '') {
		sql += " AND tr_id ='" + $('wrcf.scheduled_from_tr_id').value + "'";
	}
	View.selectValue("cf_form",getMessage('craftsperson'),["wrcf.cf_id"],"cf",["cf.cf_id"],["cf.cf_id","cf.name","cf.tr_id","cf.work_team_id"],sql);
}

/**
 * Create selection list with all trades for current workrequest (from records in wrtr)<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#getTradesForWorkRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-getTradesForWorkRequest</a>
 */
function populateTrades(){
    var panel = View.getControl('', 'cf_form');
	var result = {};
	try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-getTradesForWorkRequest', panel.getFieldValue("wrcf.wr_id"));
    } 
   	catch (e) {
		 Workflow.handleError(e);
 	}	
	
    if (result.code == 'executed') {
        var res = eval('(' + result.jsonExpression + ')');
        var selectControl = $("wrcf.scheduled_from_tr_id");
        
        // get "-select" localized string 
        var selectTitle = '';
        if (getMessage('selectTitle') != "") 
            selectTitle = getMessage('selectTitle');
        
        var option = new Option(selectTitle, "");
        selectControl.options[0] = option;
        for (i = 0; i < res.length; i++) {
			if (res[i].tr_id) {
				option = new Option(res[i].tr_id, res[i].tr_id);
				selectControl.options[i + 1] = option;
			}
        }
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Called when click the button 'Save'<br />
 */
function saveCf(){
    var panel = View.getControl('', 'cf_form');
	var record = ABODC_getDataRecord2(panel);
    
    if (!panel.save()) {
    	return;
    }
	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestCraftsperson", record);
    } 
   	catch (e) {
		Workflow.handleError(e);
 	}
    if (result.code != 'executed') {
        Workflow.handleError(result);
    } else {
    	View.getOpenerView().parentTab.loadView();
    }
}

/**
 * Get estimation for current trade and current workrequest<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#getEstimationFromTrade(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-getEstimationFromTrade</a><br />
 * Fills in estimated hours and work type for selected trade
 */
function getEstimationFromTrade(){
    var cfForm = View.panels.get("cf_form");
    if (cfForm.getFieldValue("wrcf.hours_est") <= 0) {
        var tr_id = $("wrcf.scheduled_from_tr_id").value;
        var wr_id = cfForm.getFieldValue("wrcf.wr_id");
        if (!tr_id) {
            return;
        }
		var result = {};
        try {
			 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-getEstimationFromTrade", tr_id,wr_id);
		} 
  		catch (e) {
		Workflow.handleError(e);
 		}
        if (result.code == 'executed') {
            var res = eval('(' + result.jsonExpression + ')');
            if (res.estimation) {
                cfForm.setFieldValue("wrcf.hours_est", res.estimation);
            }
            if (res.work_type) {
                cfForm.setFieldValue("wrcf.work_type", res.work_type);
            }
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
    var panel = View.getControl('', 'cf_form');
    var wr_id = panel.getFieldValue("wrcf.wr_id");
    var result = {};
	try {
   			result = Workflow.callMethod("AbBldgOpsHelpDesk-SLAService-getServiceWindowStartFromSLA", 'wr','wr_id',wr_id);
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
        
        $("cf_form_wrcf.date_start").value = date;
        $("cf_form_wrcf.time_start").value = time;
        
        $("Storedcf_form_wrcf.time_start").value = tmp[0] + ":" + tmp[1] + ".00.000";
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Called if another trade is selected<br />
 * Calls <a href='#getEstimationFromTrade'>getEstimationFromTrade</a> and <a href='#getDateAndTimeStarted'>getDateAndTimeStarted</a>
 */
function onChangeTrade(){
    //fill in estimated hours (remaining hours to schedule);
    getEstimationFromTrade();
    //fill in date and time started according to service window
    getDateAndTimeStarted();
}

/**
 * 
 */
function setCurrentLocalDateTime() {
	var panel = View.getControl('', 'cf_form');
    var wr_id = panel.getFieldValue("wrcf.wr_id");
    
	try {
   		 var result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getCurrentLocalDateTime", 'wr','wr_id',wr_id);
		 if (result.code == 'executed') {
			var obj = eval('(' + result.jsonExpression + ')');
			panel.setFieldValue("wrcf.date_assigned", obj.date);
			panel.setInputValue("wrcf.time_assigned", obj.time);
		} else {
			Workflow.handleError(e);
		}
    }catch (e) {
		 Workflow.handleError(e);
 	}
}
