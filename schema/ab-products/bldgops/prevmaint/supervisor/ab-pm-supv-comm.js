//getting input data from the edit form panel
function gettingRecordsData(panel){
    var ds = View.dataSources.get(panel.dataSourceId);
    var recordValues = ds.processOutboundRecord(panel.getRecord()).values;
    
    return toJSON(recordValues);
}

/**
 * get input data record object from the edit form panel
 * @panel 
 */
function ABPMC_getDataRecord(panel){
	//var panel = View.panels.get(panelId);
	var dataSourceId =  panel.dataSourceId;
	var recordValues = ABPMC_getDataRecordValues(dataSourceId);
	return recordValues;
}

function ABPMC_getDataRecordValues(dataSourceId){

	var dataSource = View.dataSources.get(dataSourceId);
	var formattedValues = {};
	 
	for(var i=0;i<dataSource.fieldDefs.items.length;i++){
		
		var fieldId = dataSource.fieldDefs.items[i].id;
		if(ABPMC_containField(fieldId) == true){
			formattedValues[fieldId] = ABPMC_getFieldValue(fieldId);
		}				
	}
	
	return formattedValues;
}

function ABPMC_containField(fieldId){
	
	for(var i=0;i<View.panels.items.length;i++){
		var panel = View.panels.items[i];
		
		if(panel.type != 'form') continue;
		
		if(panel.containsField(fieldId)){
			return true;		
		}	
	}
	return false;
}

function ABPMC_getFieldValue(fieldId){
	var value = '';
	for(var i=0;i<View.panels.items.length;i++){
		var panel = View.panels.items[i];
		
		View.log(panel.id,"info");
		if(panel.type != 'form') continue;
		
		if(panel.containsField(fieldId)){
			// convert to string
			value = panel.getFieldValue(fieldId) + '';		
			break;
		}	
	}
	return value;
}

/**
 * Set status of selected workrequests to completed<br />
 * Calls WFR <a href='../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#setComplete(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-setComplete</a><br />
 * Reloads update tab
 * @param {String} gridName grid to get selected rows from
 * @param {String} tabName name of tabpage to select after execution of the WFR
 */
function setComplete(gridName, tabName){
    var grid = View.getControl('', gridName);
    var records = grid.getPrimaryKeysForSelectedRows();
    //KB3020860
    if (records.length == 0) {
        View.showMessage(getMessage('noRecordSelected'));
        return;
    }
    //kb:3024805
	var result = {};
    try {
        result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-setComplete', records);
    } 
    catch (e) {
        Workflow.handleError(e);
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
    var grid = View.getControl('', gridName);
    var records = grid.getPrimaryKeysForSelectedRows();
    //KB3020860
    if (records.length == 0) {
        View.showMessage(getMessage('noRecordSelected'));
        return;
    }

    //kb:3024805
	var result = {};
    try {
        result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-deleteItems', tableName,records);
    } 
    catch (e) {
        Workflow.handleError(e);
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
 * Retrieve step information for a given request (from wr or activity_log)<br />
 *
 * This function is called while loading the form<br />
 * The step log information is shown on the current form in the panel with id 'panelHistory' in the table with id 'history' using dynamic HTML<br />
 * Calls WFR <a href='../../javadoc/com/archibus/eventhandler/steps/StepHandler.html#getStepInformation(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getStepInformation</a><br />
 * The jsonExpression returned by this workflow rule is parsed to create the history table.
 * @param {String} table Workflow table
 * @param {String} field Primary key field
 * @param {int} pkey Primary key value
 * @param {boolean} show Show the step history table or not
 */
function getStepInformation(table, field, pkey, show){

    //kb:3024805
	var result = {};
    try {
        result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', table,field,pkey);
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    var panelHistory = View.getControl('', 'panelHistory');
    if (result.code == 'executed') {
        var appInfo = "";
        var apps = eval('(' + result.jsonExpression + ')');
        if (show == undefined || show) {
            if (apps.length == 0) {
                panelHistory.show(false, true);
            }
            else {
                panelHistory.show(true, true);
                $('history').innerHTML = '';
                
                //table headers
                var table = document.createElement("table");
                table.className = "panelReport";
                var header = table.createTHead();
                var x = header.insertRow(0);
                x.className = "headerRow";
                
                var user = document.createElement("th");
                user.className = "headerTitleText";
                user.innerHTML = getMessage("user");
                x.appendChild(user);
                
                var date = document.createElement("th");
                date.className = "headerTitleText";
                date.innerHTML = getMessage("on");
                x.appendChild(date);
                
                var type = document.createElement("th");
                type.className = "headerTitleText";
                type.innerHTML = getMessage("step");
                x.appendChild(type);
                
                var basicstatus = document.createElement("th");
                basicstatus.className = "headerTitleText";
                basicstatus.innerHTML = getMessage("status");
                x.appendChild(basicstatus);
                
                var stepstatus = document.createElement("th");
                stepstatus.className = "headerTitleText";
                stepstatus.innerHTML = getMessage("stepstatus");
                x.appendChild(stepstatus);
                
                var comments = document.createElement("th");
                comments.className = "headerTitleText";
                comments.style.width = "50%";
                comments.innerHTML = getMessage("comments");
                x.appendChild(comments);
                
                for (i = 0; i < apps.length; i++) {
                    //use dynamic html to enter step information in a table
                    var row = table.insertRow(1);
                    var y = row.insertCell(0);
                    var z = row.insertCell(1);
                    var a = row.insertCell(2);
                    var d = row.insertCell(3)
                    var b = row.insertCell(4);
                    var c = row.insertCell(5);
                    
                    var user = "";
                    if (apps[i].user_name != undefined) 
                        user = apps[i].user_name;
                    if (apps[i].em_id != undefined && apps[i].em_id != "") 
                        user = apps[i].em_id;
                    if (apps[i].vn_id != undefined && apps[i].vn_id != "") 
                        user = apps[i].vn_id;
                    y.innerHTML = user;
                    
                    if (apps[i].date_response == "" && apps[i].time_response == "") {
                        datetime = getMessage("pending");
                    }
                    else {
                        datetime = apps[i].date_response + " " + apps[i].time_response;
                    }
                    z.innerHTML = datetime;
                    if (apps[i].step != undefined) 
                        a.innerHTML = apps[i].step;
                    if (apps[i].status != undefined) 
                        d.innerHTML = apps[i].status;
                    if (apps[i].step_status_result != undefined && apps[i].step_status_result != 'none') 
                        b.innerHTML = apps[i].step_status_result;
                    if (apps[i].comments != undefined) 
                        c.innerHTML = apps[i].comments;
                }
                
                toprow = table.insertRow(0);
                toprow.className = "space";
                topspace = toprow.insertCell(0);
                topspace.setAttribute("colspan", "6");
                topspace.className = "formTopSpace";
                
                bottomrow = table.insertRow(apps.length + 2);
                bottomrow.className = "space";
                bottomspace = bottomrow.insertCell(0);
                bottomspace.setAttribute("colspan", "6");
                bottomspace.className = "formBottomSpace";
                $('history').appendChild(table);
            }
        }
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
    var steps = getStepInformation("wr", "wr_id", panel.getFieldValue("wr.wr_id"), false, true);
    var action = panel.actions.get('verification');
    if (steps && steps.length > 0) {
        lastStep = steps[0];
        if (lastStep.date_response == "") {
            lastStepLogId = lastStep.step_log_id;
            lastStepType = lastStep.step_type;
            lastStepCode = lastStep.step_code;
            
            if (lastStepType != "verification") {
                action.show(false);
            }
            else {
                action.show(true);
            }
        }
        else {
            action.show(false);
        }
    }
    else {
        action.show(false);
    }
}

/**
 * Updae the the Date of Last Meter Reading and Last Meter Reading fields of the work request Equipment<br />
 *
 * This function is called while  closing out work request<br />
 * @param {Object} panel the panel object of the 'Verification' action
 */
function updateEquipment(wrId){
    var eqId;
    var currMeterVal;
    var dateCompleted;
    var isOK = true;
    var parameter0 = {
        tableName: 'wr',
        fieldNames: toJSON(['wr.eq_id', 'wr.curr_meter_val', 'wr.date_completed']),
        restriction: toJSON({
            'wr.wr_id': wrId
        })
    };
    //when not all work request were closed out of the same work order, 
    //the closed work request is still in the wr table. 
    //kb:3024805
	var wrResult = {};
    try {
        wrResult = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameter0);
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    if (wrResult.code == 'executed') {
        if (wrResult.data.records.length > 0) {
            eqId = wrResult.data.records[0]['wr.eq_id'];
            currMeterVal = wrResult.data.records[0]['wr.curr_meter_val'];
            dateCompleted = wrResult.data.records[0]['wr.date_completed'];
        }
        else {
            var parameter1 = {
                tableName: 'hwr',
                fieldNames: toJSON(['hwr.eq_id', 'hwr.curr_meter_val', 'hwr.date_completed']),
                restriction: toJSON({
                    'hwr.wr_id': wrId
                })
            };
            //if all the all work request were closed out of the same work order, 
            //the closed work request is in the hwr table and delete from the wr table.
            //kb:3024805
			var hwrResult = {};
            try {
                hwrResult = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameter1);
            } 
            catch (e) {
                Workflow.handleError(e);
            }
            if (wrResult.code == 'executed') {
                if (hwrResult.data.records.length > 0) {
                    eqId = hwrResult.data.records[0]['hwr.eq_id'];
                    currMeterVal = hwrResult.data.records[0]['hwr.curr_meter_val'];
                    dateCompleted = hwrResult.data.records[0]['hwr.date_completed'];
                }
            }
            else {
                isOK = false;
            }
        }
    }
    else {
        isOK = false;
    }
    if (isOK && eqId && currMeterVal && dateCompleted) {
        var parameter2 = {
            tableName: 'eq',
            fields: toJSON({
                'eq.eq_id': eqId,
                'eq.meter': currMeterVal,
                'eq.meter_last_read': getDateWithISOFormat(dateCompleted)
            })
        };
        //kb:3024805
		var eqResult = {};
        try {
             eqResult = Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', parameter2);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        if (eqResult.code != 'executed') {
            isOK = false;
        }
    }
    if (!isOK) {
        View.showMessage(getMessage('updateEquipmentFailed'));
    }
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
 * Update work request (including its status)<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#updateWorkRequestStatus(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-updateWorkRequestStatus</a><br/>
 * Called by 'Update' button<br />
 * Reloads work request details tab
 */
function updateWorkRequest(panelName){
    var panel = View.getControl('', panelName);
    var status = $("selectStatus").value;
    var record = getRecordObject(panel);
    var ds = View.dataSources.get(panel.dataSourceId);
    var recordValues = toJSON(ds.processOutboundRecord(record).values);
    var wrId = panel.getFieldValue("wr.wr_id");
    
    //kb:3024435
	var result = {};
    try {
        result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', record,status);
    } 
    catch (e) {
        Workflow.handleError(e);
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
    var panel = View.getControl('', panelName);
    var wrId = panel.getFieldValue("wr.wr_id");
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("wr_step_waiting.wr_id", wrId, '=');
    restriction.addClause("wr_step_waiting.step_log_id", lastStepLogId, '=');
    
    View.openDialog("ab-pm-wr-verif.axvw", restriction, false);
}

function addEmptyValueToEnumField(form, FieldName){
    var filedEl = form.getFieldElement(FieldName);
    var tempOptions = [];
    for (var i = 0; i < filedEl.options.length; i++) {
        tempOptions.push(filedEl.options[i])
    }
    while (filedEl.options.length != 0) {
        filedEl.remove(0);
    }
    
    filedEl.options.add(new Option("", "--NULL--"));
    for (var i = 0; i < tempOptions.length; i++) {
        filedEl.options.add(tempOptions[i]);
    }
    filedEl.selectedIndex = 0;
}
