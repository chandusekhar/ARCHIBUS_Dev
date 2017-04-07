
/**
 * Set status of selected workrequests to completed<br />
 * Calls WFR <a href='../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#setComplete(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-setComplete</a><br />
 * Reloads update tab
 * @param {String} gridName grid to get selected rows from
 * @param {String} tabName name of tabpage to select after execution of the WFR
 */
function setComplete(gridName, tabName){
    var grid = View.panels.get(gridName);
    var records = grid.getPrimaryKeysForSelectedRows();
    //KB3020860
    if (records.length == 0) {
        View.showMessage(getMessage('noRecordSelected'));
        return;
    }
	var result = {};
    try{
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-setComplete', records);
	}catch(e){
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
		   Workflow.handleError(e);
		}
		return;
	}
    if (result.code == 'executed') {
        if (tabName != undefined) {
            View.selectTabPage(tabName);
        }
        else {
            grid.refresh();
        }
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Delete database records, selected in given grid, from given table
 * Calls WFR <a href='../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#deleteItems(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-deleteItems</a><br />
 * Reloads current tab<br />
 * @param {String} gridName grid with selected records to delete
 * @param {String} tableName table to delete records from
 */
function deleteItems(gridName, tableName){
    var grid = View.panels.get(gridName);
    var records = grid.getPrimaryKeysForSelectedRows();
    //KB3020860
    if (records.length == 0) {
        View.showMessage(getMessage('noRecordSelected'));
        return;
    }
	var result = {};
    try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-deleteItems', tableName,records);
	} 
    catch (e) {
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
		   Workflow.handleError(e);
		}
		return;    
	}
    if (result.code == 'executed') {
        View.controllers.get(0).refreshGridPanel();
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * synchronise all the panels record of the same datasource to one record
 * @param {Object} panel the main panel object of the view
 */
function syncPanelRecord(panel){
    var record = panel.getRecord();
    
    View.panels.each(function(panel){
        if ((panel.getRecord) && (panel.visible)) {
            panel.getRecord();
            panel.fields.each(function(field){
                record.setValue(field.getFullName(), convertMemo2validateXMLValue(panel.getFieldValue(field.getFullName())));
            });
        }
    });
    return record;
}
/**
 * synchronise all the panels record of the same datasource
 * @param (Object)panel
 */
function getRecordObject(panel){
    var record = {};
    
    View.panels.each(function(panel){
        if ((panel.getRecord) && (panel.visible)) {
            panel.getRecord();
            panel.fields.each(function(field){
				if (/^wr./.test(field.getFullName())) {
					record[field.getFullName()] = panel.getFieldValue(field.getFullName());
				}
            });
        }
    });
    return record;
}

/**
 * Retrieve step information for a given request (from wr or activity_log)<br />
 *
 * @param {String} table Workflow table
 * @param {String} field Primary key field
 * @param {int} pkey Primary key value
 */
function getStepInformation(table, field, pkey){
	var result = {};
    try{
	    result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', table,field,pkey);
	}catch(e){
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
		   Workflow.handleError(e);
		}
		return;	
	}
    if (result.code == 'executed') {
        var apps = eval('(' + result.jsonExpression + ')');
        return apps;
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * show or hidden 'Verification' action according the lastStepType<br />
 *
 * This function is called while loading the form<br />
 * @param {Object} panel the panel object of the 'Verification' action
 */
function showVerificationAction(panel){
    var steps = getStepInformation("wr", "wr_id", panel.getFieldValue("wr.wr_id"));
    var action = panel.actions.get('verification');
    var isShow = false;
    if (steps && steps.length > 0) {
    	//fix KB3033754 - get the step code filter by user_name, there may be several users can verification when setting verification by role in SLA
    	for(var i=0;i<steps.length;i++){
    		lastStep = steps[i];
            if (lastStep.date_response == "" && lastStep.user_name == View.user.name && lastStep.step_type == "verification" ) {
                lastStepLogId = lastStep.step_log_id;
                lastStepType = lastStep.step_type;
                lastStepCode = lastStep.step_code;
                isShow = true;
                break;
            }
    	}  
    	if(!isShow){//check substitute
    		var result = {};
    		try {
    			result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkVerificationSubstitute', panel.getFieldValue("wr.wr_id"));
    		} catch(e){
    			Workflow.handleError(e);
    		}
    		if(result.code=='executed'){
    			var res = eval('('+result.jsonExpression+')');
    			if(res.isSubstitute){
    				isShow = true;
    				lastStepLogId = res.step_log_id;
    			}
    		} else {    			
    			Workflow.handleError(result);
    		}
    		
    	}
    }
    action.show(isShow);
}


/**
 * Create selection list according to the given status<br />
 * Possible values:
 * <ul>
 * 		<li>Issued and In Process: not for I, Com, S</li>
 * 		<li>On Hold for Parts: not for HP, Com, S</li>
 * 		<li>On Hold for Access: not for HA, Com, S</li>
 * 		<li>On Hold for Labor: not for HL, Com, S</li>
 * 		<li>Stopped: not for S</li>
 * 		<li>Completed: not for Com</li>
 * </ul>
 * @param {String} status current status
 */
function createStatusSelectList(panel){
    var status = panel.getRecord().oldValues['wr.status'];
    var enumValues = panel.fields.map['wr.status'].fieldDef.enumValues;
    var states = [{
        value: "I",
        text: enumValues['I']
    }, {
        value: "HP",
        text: enumValues['HP']
    }, {
        value: "HA",
        text: enumValues['HA']
    }, {
        value: "HL",
        text: enumValues['HL']
    }, {
        value: "S",
        text: enumValues['S']
    }, {
        value: "Com",
        text: enumValues['Com']
    }];
    
    var selectElement = $("selectStatus");
    selectElement.disabled = false;
    
    for (var i = 0; i < states.length; i++) {
        var option = new Option(states[i].text, states[i].value);
        selectElement.options[i] = option;
    }
    selectElement.selectedIndex = -1;
    for (var i = 0; i < states.length; i++) {
        if (status == states[i].value) {
            selectElement.selectedIndex = i;
        }
    }
    if (status != 'I' && status != 'HP' && status != 'HA' && status != 'HL') {
        selectElement.disabled = "true";
    }
}

/**
 * Update work request (including its status)<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#updateWorkRequestStatus(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-updateWorkRequestStatus</a><br/>
 * Called by 'Update' button<br />
 * Reloads work request details tab
 */
function updateWorkRequest(panelName){
    var panel = View.panels.get(panelName);
    var status = $("selectStatus").value;
    var record = getRecordObject(panel);
    //fix KB3032479, set current user to wr.completed_by when update status to complete(Guo 2011/08/19)
    if(status == 'Com' && View.user.employee.id){
    	record['wr.completed_by'] = View.user.employee.id;
    }
    var ds = View.dataSources.get(panel.dataSourceId);
    var wrId = panel.getFieldValue("wr.wr_id");
	var result = {};
    try {
		  result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus',record, status);
	}catch(e){
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
		   Workflow.handleError(e);
		}
		return;	
	}
    if (result.code == 'executed') {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("wr.wr_id", wrId, '=');
        panel.refresh(restriction);
        panel.displayTemporaryMessage(getMessage('updatedSuccessfully'));
    }
    else {
        Workflow.handleError(result);
    }
}


/**
 * Called by 'Verification' button<br />
 * Open dialog for Verification step for current work request
 */
function onVerification(panelName){
    var panel = View.panels.get(panelName);
    var wrId = panel.getFieldValue("wr.wr_id");
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("wr_step_waiting.wr_id", wrId, '=');
    restriction.addClause("wr_step_waiting.step_log_id", lastStepLogId, '=');
    
    View.openDialog("ab-ondemand-workrequest-verification.axvw", restriction, false);
}
