var woSubsRecords = [];
var wrSubsRecords= [];

function highlightWrBySubstitute(wrPanel,includeVerification){
	wrPanel.selectAll(true);
	var wr_rows = wrPanel.getPrimaryKeysForSelectedRows();
	wrSubsRecords= [];
	
	//KB3037416 - wfr checkWrSupervisorSubstitutes need wr_rows.length>0
	if(wr_rows.length>0){
		var result = {};
		try {
			 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkWrSupervisorSubstitutes',wr_rows,includeVerification);
		} catch (e) {
			Workflow.handleError(e);
			}
		if(result.code == 'executed'){
			wrSubsRecords = eval('('+result.jsonExpression+')');
			if(wrSubsRecords.length > 0){
				wrPanel.gridRows.each(function(row) {
		            
		            // get wr.status for this row
		            var wrId = row.getRecord().getValue('wr.wr_id');
		            for(var j=0;j<wrSubsRecords.length;j++){
		            	if(wrSubsRecords[j] == wrId){
		            		color = View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor'];
			            	Ext.get(row.dom).setStyle('background-color', color);
			            	break;
		            	}
		            }
		        });
			}
		} else {
			Workflow.handleError(result);
		}
	}
	
	var instructions = "<span style='background-color:"+View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']+"'>"+getMessage("substituteLegend")+"</span>";
	wrPanel.setInstructions(instructions);
	wrPanel.selectAll(false);
}

function highlightWoBySubstitute(woPanel,includeVerification){
	woPanel.selectAll(true);
	var wo_rows = woPanel.getPrimaryKeysForSelectedRows();
	woSubsRecords = [];
	
	if(wo_rows.length > 0){	
		var result = {};
		try {
			 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkWoSupervisorSubstitutes',wo_rows,includeVerification);
		} catch (e) {
			Workflow.handleError(e);
			}
		if(result.code == 'executed'){
			woSubsRecords = eval('('+result.jsonExpression+')');
			if(woSubsRecords.length > 0){
				woPanel.gridRows.each(function(row) {
		            
		            // get wr.status for this row
		            var woId = row.getRecord().getValue('wo.wo_id');
		            for(var j=0;j<woSubsRecords.length;j++){
		            	if(woSubsRecords[j] == woId){
		            		color = View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor'];
			            	Ext.get(row.dom).setStyle('background-color', color);
			            	break;
		            	}
		            }
		        });
			}
		} else {
			Workflow.handleError(result);
		}
	}
	var instructions = "<span style='background-color:"+View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']+"'>"+getMessage("substituteLegend")+"</span>";
	woPanel.setInstructions(instructions);
	woPanel.selectAll(false);
}

function showFloorPlan(panel,fieldArray){
	var panel=View.panels.get(panel);
	var c=View.controllers.items[0];
	var blId=panel.getFieldValue(fieldArray[0]);
	var flId=panel.getFieldValue(fieldArray[1]);
	var rmId=panel.getFieldValue(fieldArray[2]);
	c.locArray[0]=blId;
	c.locArray[1]=flId;
	c.locArray[2]=rmId;
	View.openDialog('ab-ondemand-update-wr-dialog.axvw');
}
function ABODC_getDataRecordValues(dataSourceId){

	var dataSource = View.dataSources.get(dataSourceId);
	var formattedValues = {};
	 
	for(var i=0;i<dataSource.fieldDefs.items.length;i++){
		
		var fieldId = dataSource.fieldDefs.items[i].id;
		if(ABODC_containField(fieldId) == true){
			formattedValues[fieldId] = ABODC_getFieldValue(fieldId);
		}				
	}
	
	return formattedValues;
}

function ABODC_containField(fieldId){
	
	for(var i=0;i<View.panels.items.length;i++){
		var panel = View.panels.items[i];
		
		if(panel.type != 'form') continue;
		
		if(panel.containsField(fieldId)){
			return true;		
		}	
	}
	return false;
}

function ABODC_getFieldValue(fieldId){
	var value = '';
	for(var i=0;i<View.panels.items.length;i++){
		var panel = View.panels.items[i];
		
		View.log(panel.id,"info");
		if(panel.type != 'form') continue;
		
		if(panel.containsField(fieldId)){
			value = panel.getFieldValue(fieldId);
			break;		
		}	
	}
	return value;
}
						

function ABODC_getDataRecord(panel){
   	var recordValues = ABODC_getDataRecordValues(panel.dataSourceId);
   	recordValues = ABODC_handleDataRecordValues(recordValues);
   	return recordValues;
}

/**
* in order to keep up with the version 1.0 to suitable for the work flow rule.
*/
function ABODC_handleDataRecordValues(recordValues){
	
	var formattedValues = "";
	for (var name in recordValues) {
	    var value = recordValues[name];
	    
	    formattedValues = formattedValues + name;
	    if(name == 'activity_log_hactivity_log.po_id'){
	    	if(value == '0') 
	    		value = '';
	    }else if(name == 'activity_log_hactivity_log.act_quest'
	    			||name == 'activity_log.act_quest'){
	    			
	    	value = convert2validXMLValue(value);
	    	
	    }else if(name == 'activity_log.priority'){
	    	if(value == '0') 
	    		value = '';
	    }else if(name == 'activity_log.activity_log_id'){
	    	if(value == '0' || value == 0) 
	    		value = '';
	    }else if(name == 'activity_log.po_id'){
	    	if(value == '0' || value == 0) 
	    		value = '';
	    }
	    
	    formattedValues = formattedValues + '="' + convert2validXMLValue(value) + '" ';
	}   
   	return '<record '  + formattedValues + ' />';
}


function ABODC_setComplete(panelId){

	var grid = View.panels.get(panelId);
	var records = grid.getPrimaryKeysForSelectedRows();
	
	//alert(toJSON(records));
	if(records.length > 0){
		var result = {};
		try {	
			 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-setComplete',records);
		 } 
   		catch (e) {
		Workflow.handleError(e);
 		}
		if (result.code == 'executed'){
			grid.refresh();
		} else {
			Workflow.handleError(result);
		}
	}
}


/**
 * Delete database records, selected in given grid, from given table
 * Calls WFR <a href='../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#deleteItems(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-deleteItems</a><br />
 * Reloads current tab<br />
 * @param {String} gridName grid with selected records to delete
 * @param {String} tableName table to delete records from
 */
function ABODC_deleteItems(panelId, tableName) {
	var grid = View.panels.get(panelId);
	var records = grid.getPrimaryKeysForSelectedRows();
	
	if(records.length < 1){
		View.showMessage(getMessage('noRecordSelected'));
		return true;
	}
	var result = {};
	try {		
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-deleteItems', tableName,records); 
	   } catch (e) {
		Workflow.handleError(e);
 		}
	if (result.code == 'executed') {
		grid.refresh();		 
	} else {
		Workflow.handleError(result);
	}
}

			
/**
* ABODC is the abbreviation for ab-ondemand-common
*/
function ABODC_hideEmptyDocumentPanel(tableName,panel){
	
	if(!valueExists(tableName)||!valueExists(panel)){
		View.showMessage("error",
			"Missing the panel or tableName,occurs in the function hideEmptyConstsPanel\n please check them.");
		return;
	}
	
	var show = ABODC_showPanelByFieldValue(tableName + '.doc1',panel,'');
	if(show == true) return !show;
	
	var show = ABODC_showPanelByFieldValue(tableName + '.doc2',panel,'');
	if(show == true) return !show;
	
	var show = ABODC_showPanelByFieldValue(tableName + '.doc3',panel,'');
	if(show == true) return !show;
	
	var show = ABODC_showPanelByFieldValue(tableName + '.doc4',panel,'');
	if(show == true) return !show;
	
	return true;
}

/**
* if the html element's value is not equals the targetValue, show the panel.
* otherwise, make the related panel be hidden.
*/
function ABODC_showPanelByFieldValue(fieldId,panel,targetHiddenValue){ 
	
	if(!valueExists(targetHiddenValue)){
		targetHiddenValue = '';
	}
	
	if(!valueExists(fieldId)||!valueExists(panel)){
		View.showMessage("error",
			"Missing the panel or field,occurs in the function hidePanelByFieldValue\n please check them.");
		return;
	}
	
	var show = false;
	if(panel.getFieldValue(fieldId) != targetHiddenValue){
		show = true;
	}
	panel.show(show);
	
	return show;
}

function ABODC_getDataRecord2(panel){
   	var recordValues = ABODC_getDataRecordValues(panel.dataSourceId);
   	recordValues = ABODC_handleDataRecordValues2(recordValues);
   	return recordValues;
}
/**
* replace the function ABODC_handleDataRecordValues in WFR 2.0
*/
function ABODC_handleDataRecordValues2(recordValues){
	
	var formattedValues = {};
	for (var name in recordValues) {
	    var value = recordValues[name];
	    
	   // formattedValues = formattedValues + name;
	    if(name == 'activity_log_hactivity_log.po_id'){
	    	if(value == '0') 
	    		value = '';
	    }else if(name == 'activity_log_hactivity_log.act_quest'
	    			||name == 'activity_log.act_quest'){
	    	if(value == null || value == 'undifined')
	    		value = '';		
	    	//value = convert2validXMLValue(value);
	    	
	    }else if(name == 'activity_log.priority'){
	    	if(value == '0') 
	    		value = '';
	    }else if(name == 'activity_log.activity_log_id'){
	    	if(value == '0' || value == 0) 
	    		value = '';
	    }else if(name == 'activity_log.po_id'){
	    	if(value == '0' || value == 0) 
	    		value = '';
	    }
	    //convert string
	    value = value + '';

	    formattedValues[name] = value;
	}   
   	return formattedValues;
}

/**
* Migrate from v1.0
*/
function ABODC_showPriorityLevel(tableName,primaryKeyName,htmlPriorityId,priorityPanel,priorityFieldId){
	var record = ABODC_getDataRecord2(priorityPanel);
	var result = {};
	try {
		 result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-getSLAConditionParameters', tableName,primaryKeyName,record);
  	} catch (e) {
		Workflow.handleError(e);
 	}
	if(result.code == 'executed'){
		var priority_level = priorityPanel.getFieldValue(priorityFieldId);
		var params  = eval('('+result.jsonExpression+')');
		var pr = '';
		if(priority_level == 1){
			pr = priority_level + " : " + params.priority_level_1;
		} else if (priority_level == 2){
			pr = priority_level + " : " + params.priority_level_2;
		} else if (priority_level == 3){
			pr = priority_level + " : " + params.priority_level_3;
		} else if (priority_level == 4){
			pr = priority_level + " : " + params.priority_level_4;
		} else if (priority_level == 5){
			pr = priority_level + " : " + params.priority_level_5;
		}
		document.getElementById(htmlPriorityId).innerHTML = pr;
	} else {
		Workflow.handleError(result);
	}
}


function ABODC_getStepInformation(tableName,fieldName,primaryKeyValue,historyPanel,htmlHistoryId,show){
	var result = {};
	try {
		 result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation',tableName,fieldName,primaryKeyValue);
	} 
	catch (e) {
		Workflow.handleError(e);
 	}
	
	if(result.code == 'executed'){
		var appInfo = "";
		var apps = eval('('+result.jsonExpression+')');
		if (show == undefined || show) {
            if (apps.length == 0) {
                historyPanel.show(false);
            }
            else {
                historyPanel.show(true);
                var restriction = new Ab.view.Restriction();
                if (apps.length == 1) {
                    restriction.addClause('helpdesk_step_log.step_log_id', apps[0].step_log_id, "=");
                }
                else {
                    restriction.addClause('helpdesk_step_log.step_log_id', apps[0].step_log_id, "=", ")AND(");
                    for (var i = 1, app; app = apps[i]; i++) {
                        restriction.addClause('helpdesk_step_log.step_log_id', app.step_log_id, "=", "OR");
                    }
                }
                historyPanel.refresh(restriction);
            }
        }
		return apps;
	} else {
		Workflow.handleError(result);
	}
}


function ABODC_populateSelectList(tableName,valueField,textField,selectElement,where) {
	var pwhere = valueExists(where)? where : "";
	var result = {};
	try {	
		 result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getSelectList",tableName,valueField,textField,pwhere);	
	} catch (e) {
		Workflow.handleError(e);
 	}
	if(result.code == 'executed'){
			var res = eval('('+result.jsonExpression+')');			
			var items = res.items;
			var selectElement = document.getElementById(selectElement);			
			
			// get "-select" localized string 
			var selectTitle = '';
			if (getMessage('selectTitle') != "") selectTitle = getMessage('selectTitle');
			
			var option = new Option(selectTitle,"");									
			selectElement.options[0] = option; 
			
			var j=1;
			for (i=0;i<items.length;i++) {
				if(items[i].value != undefined){
					
					if (items[i].text == undefined 
							|| items[i].text == 'undefined'
							|| items[i].text == ''){
						items[i].text = 'N/A';	
						items[i].value = 'N/A';	
					}
					
					var option = new Option(items[i].text, items[i].value);	
					selectElement.options[j] = option;
					j++;
				}
			}			
		
	} else {
		Workflow.handleError(result);
	}
}

function ABODC_populateYearConsole(tableName,dateField,selectElementId,where){
	var pwhere = valueExists(where)? where : "";
	var result = {};
	try {
		 result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getYearSelectList",tableName,dateField,pwhere);	
	} catch (e){
	 	Workflow.handleError(e);
 	}
	if(result.code == 'executed'){
			var res = eval('('+result.jsonExpression+')');			
			var items = res.items;
			var selectElement = document.getElementById(selectElementId);			
			
			// get "-select" localized string 
			var selectTitle = '';
			if (getMessage('selectTitle') != "") selectTitle = getMessage('selectTitle');
		
			var option = new Option(selectTitle,"");									
			selectElement.options[0] = option; 
			
			for (i=0;i<items.length;i++) {
				var option = new Option(items[i].text, items[i].value);	
				selectElement.options[i+1] = option; 	
			}			
		
	} else {
		Workflow.handleError(result);
	}
}

function ABODC_listUserRequests(tableName,panelId) {	
	var panel = View.panels.get(panelId);	
	//requestor is required
	var req = panel.getFieldValue(tableName + ".requestor");
	
	if (req == '') {
		alert(getMessage("noRequestor"));
		return;
	} 
	//create restriction
    var restriction = new Ab.view.Restriction();
    restriction.addClause(tableName + ".requestor",req,'=');
    
    //open dialog
    if(tableName =='wr')
		View.openDialog("ab-helpdesk-workrequest-history.axvw", restriction, false); 	    
    if(tableName =='activity_log')
		View.openDialog("ab-helpdesk-request-history.axvw", restriction, false);
}


function ABODC_listLocationRequests(tableName,panelId) {
	
	var panel = View.panels.get(panelId);
	//building code is required
	var bl = panel.getFieldValue(tableName + ".bl_id");
	if (bl == '') {
		alert(getMessage("noBuilding"));
		return;
	} 
	
	//create restriction
    var restriction = new Ab.view.Restriction();
    restriction.addClause(tableName + ".bl_id",bl,'=');
   
    var rm = panel.getFieldValue(tableName + ".rm_id");
   	if (rm != ''){
   		restriction.addClause(tableName + ".rm_id",rm,'=');
   	}
   	var fl = panel.getFieldValue(tableName + ".fl_id");
   	if(fl != ''){
   		restriction.addClause(tableName + ".fl_id",fl,'=');
   	}

	//open dialog
    if(tableName =='wr')Ab.view.View.openDialog("ab-helpdesk-workrequest-history.axvw", restriction, false); 	    
    if(tableName =='activity_log')Ab.view.View.openDialog("ab-helpdesk-request-history.axvw", restriction, false);
} 

function ABODC_selectServiceDeskSupervisor(formId,tableName,actionListener){
	if(actionListener != undefined){
		View.selectValue(formId, getMessage('supervisor'), [tableName+'.supervisor'],
		 'em', ['em.em_id'], ['em.em_id','em.em_std','em.email'], 
		 'EXISTS (select cf_id from cf where cf.email = em.email AND cf.is_supervisor = 1)',actionListener);
	} else {
		View.selectValue(formId, getMessage('supervisor'), [tableName+'.supervisor'],
		 'em', ['em.em_id'], ['em.em_id','em.em_std','em.email'], 
		 'EXISTS (select cf_id from cf where cf.email = em.email AND cf.is_supervisor = 1)')		
	}
} 

/**
* This function is called from the button 'List Requests for Equipment' in a form showing a request record <br />
* and opens a dialog with all requests with the same equipment as the current request.
* @param {String} table request table (activity_log or wr)
*/
function ABODC_listEquipmentRequests(panelId,table) {		
	var panel = View.panels.get(panelId);
	 	
	var fieldName = table+".eq_id";
	var eq = panel.getFieldValue(fieldName);
	if (eq == '') {
		alert(getMessage("noEquipment"));
		return;
	} 
	var restriction = new Ab.view.Restriction();
    restriction.addClause(fieldName,eq,'=');
         
	if(table =='wr')Ab.view.View.openDialog("ab-helpdesk-workrequest-history.axvw", restriction, false); 	    
    if(table =='activity_log')Ab.view.View.openDialog("ab-helpdesk-request-history.axvw", restriction, false);
}

function ABODC_showEquipmentContracts(fieldId,panelId){
	var panel = View.panels.get(panelId);
	var equipmentId = panel.getFieldValue(fieldId);
	
	if(equipmentId != ''){
		var restriction = new Ab.view.Restriction();	
		restriction.addClause("eq.eq_id",equipmentId,'=');
		View.openDialog("ab-helpdesk-request-equipment.axvw", restriction, false); 
	}
}

function ABODC_disableAllButtons(){
    // for all view panels
    View.panels.each(function(panel){
    
        // enable/disable panel-level actions
        panel.actions.each(function(action){
            action.enable(!action.enabled);
        });
        
        // enable/disable grid row actions
        if (panel.type == 'grid') {
            panel.gridRows.each(function(row){
                var action = row.actions.get(0);
                action.enable(!action.enabled);
            });
        }
        
        // enable/disable form field actions
        if (panel.type == 'form') {
            panel.fields.each(function(field){
                field.actions.each(function(action){
                    action.enable(!action.enabled);
                });
            });
        }
        
    });
}


/**
* Hides priority the radio buttons for the priority levels
*/
function ABODC_clearPriorities(panelId,buttonName){
	$("SLAinfo").innerHTML = '';
	$("default").style.display='none';
	
	//var radioButtons = document.getElementsByName("priorities");
	var radioButtons = document.getElementsByName(buttonName);
	
	for (var i=0;i<radioButtons.length-1;i++){
		radioButtons[i].style.visibility='hidden';
		radioButtons[i].style.display='none';
		
		var level = i+1;
    	$("priority_value"+level).innerHTML = '';
    	$("priority_value"+level).style.display='none';
    	radioButtons[i].checked=false;
    }
    var defaultIndex = radioButtons.length - 1;
    radioButtons[defaultIndex].style.visibility='hidden';
    radioButtons[defaultIndex].style.display='none';  

    var panel = View.panels.get(panelId);
	panel.setFieldValue("activity_log.priority",'');
}

function ABODC_reloadHistoryPanel(historyPanel){
    var rows = historyPanel.rows;
    
    var datetime = "";
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var user = "";
        if (row['helpdesk_step_log.user_name']) 
            user = row['helpdesk_step_log.user_name'];
        if (row['helpdesk_step_log.em_id']) 
            user = row['helpdesk_step_log.em_id'];
        if (row['helpdesk_step_log.vn_id']) 
            user = row['helpdesk_step_log.vn_id'];
        row['helpdesk_step_log.vn_id'] = user;
        
        if (row["helpdesk_step_log.date_response"] == "" && row["helpdesk_step_log.time_response"] == "") {
            datetime = getMessage("pending");
        }
        else {
            datetime = row["helpdesk_step_log.date_response"] + " " + row["helpdesk_step_log.time_response"];
        }
        row['helpdesk_step_log.date_response'] = datetime;
    }
    historyPanel.reloadGrid();
}