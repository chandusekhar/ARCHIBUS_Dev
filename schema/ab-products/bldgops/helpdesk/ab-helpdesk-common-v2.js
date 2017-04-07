/**
 * ABHDC is the abbreviation for ab-helpdesk-common
 * 
 */

function ABHDC_createDuplicatesRestriction(){
	
	var activity_log_id = $("activity_log.activity_log_id").value == "" ? 0 : $("activity_log.activity_log_id").value;	
	var activity_type = $("activity_log.activity_type").value;
	var siteId = $("activity_log.site_id").value;
	var blId = $("activity_log.bl_id").value;
	var date="";
	//get current iso-format date of building  and site' time zone 
	try {
   		var result = Workflow.callMethod('AbBldgOpsHelpDesk-CommonService-getCurrentLocalDateTimeSiteAndBl', siteId,blId);
		 if (result.code == 'executed') {
			var obj = eval('(' + result.jsonExpression + ')');
			date= obj.date;
		} else {
			Workflow.handleError(e);
		}
    }catch (e) {
		 Workflow.handleError(e);
 	}
	
	var restriction = new Ab.view.Restriction();	
	restriction.addClause("activity_log.status","CREATED",'<>');	
	restriction.addClause("activity_log.activity_type",activity_type,'=');	
	restriction.addClause("activity_log.activity_log_id",activity_log_id,'<>');	
	restriction.addClause("activity_log.date_requested",date,'=');	
	
	var eq_id = $("activity_log.eq_id").value;
	if(eq_id != ''){ 
		restriction.addClause("activity_log.eq_id",eq_id,'=');
	} 
    
	//fix KB3029909 - make the duplicate check only for the location specified(Guo 2011/4/11)
    var fl_id = $("activity_log.fl_id").value;
    var rm_id = $("activity_log.rm_id").value;
    if (siteId) {
        restriction.addClause("activity_log.site_id", siteId, '=');
    }
	if (blId) {
        restriction.addClause("activity_log.bl_id", blId, '=');
    }	
	if (fl_id) {
        restriction.addClause("activity_log.fl_id", fl_id, '=');
    }	
	if (rm_id) {
        restriction.addClause("activity_log.rm_id", rm_id, '=');
    }					
	
	var prob_type = $("activity_log.prob_type").value;
	if(prob_type != ''){
		restriction.addClause("activity_log.prob_type",prob_type,"=");
	}
	
	return restriction;
}

/**
 * List Requests for Location
 * @param {string} panelId
 * @param {string} table
 */
function ABHDC_listLocationRequests(panelId,table) {	
	var panel = View.panels.get(panelId);
	//building code is required
	var bl = panel.getFieldValue(table+".bl_id");
	if (bl == '') {
		alert(getMessage("noBuilding"));
		return;
	} 
	
	//create restriction
    var restriction = new Ab.view.Restriction();
    restriction.addClause(table+".bl_id",bl,'=');
   
    var rm = panel.getFieldValue(table+".rm_id");
   	if (rm != ''){
   		restriction.addClause(table+".rm_id",rm,'=');
   	}
   	var fl = panel.getFieldValue(table+".fl_id");
   	if(fl != ''){
   		restriction.addClause(table+".fl_id",fl,'=');
   	}

	//open dialog
    if(table =='wr')Ab.view.View.openDialog("ab-helpdesk-workrequest-history.axvw", restriction, false); 	    
    if(table =='activity_log')Ab.view.View.openDialog("ab-helpdesk-request-history.axvw", restriction, false);
} 

/**
 * 
 * This function is called from the button 'List Requests for Equipment' in a form showing a request record <br />
 *  and opens a dialog with all requests with the same equipment as the current request.
 *  
 * @param {string} panelId
 * @param {string} table
 */
function ABHDC_listEquipmentRequests(panelId,table) {		
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

/**
 * Get the data record object including the all fields in the dataSource
 * @param {Object} dataSourceId
 */
function ABHDC_getDataRecordValues(dataSourceId){

	var dataSource = View.dataSources.get(dataSourceId);
	var formattedValues = {};
	 
	for(var i=0;i<dataSource.fieldDefs.items.length;i++){
		
		var fieldId = dataSource.fieldDefs.items[i].id;
		if(ABHDC_containField(fieldId) == true){
			formattedValues[fieldId] = ABHDC_getFieldValue(fieldId);
		}				
	}
	
	return formattedValues;
}

/**
 * Check the field whether it is existing in the form panel
 * @param {Object} fieldId
 */
function ABHDC_containField(fieldId){
	
	for(var i=0;i<View.panels.items.length;i++){
		var panel = View.panels.items[i];
		
		if(panel.type != 'form') continue;
		
		if(panel.containsField(fieldId)){
			return true;		
		}	
	}
	return false;
}

/**
 * Get the field value from the form panel
 * @param {Object} fieldId
 */
function ABHDC_getFieldValue(fieldId){
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
 * This function is not useful now.
 * @param {Object} panel
 */
function ABHDC_getDataRecord(panel){
   	var recordValues = ABHDC_getDataRecordValues(panel.dataSourceId);
   	recordValues = ABHDC_handleDataRecordValues(recordValues);
   	return recordValues;
}

/**
 * Get the data record object from several panels
 * @param {Object} panel
 * @return object record 
 */
function ABHDC_getDataRecord2(panel){
   	var recordValues = ABHDC_getDataRecordValues(panel.dataSourceId);
   	recordValues = ABHDC_handleDataRecordValues2(recordValues);
   	return recordValues;
}

/**
 * in order to keep up with the version 1.0 to suitable for the work flow rule.
 * @param {Object} recordValues
 */
function ABHDC_handleDataRecordValues(recordValues){
	
	var formattedValues = "";
	for (var name in recordValues) {
	    var value = recordValues[name];
	    
	    formattedValues = formattedValues + name;
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
	    
	    formattedValues = formattedValues + '="' + convert2validXMLValue(value) + '" ';
	}   
   	return '<record '  + formattedValues + ' />';
}

/**
 * deal with the record object for some specific fields 
 * and return the record object handled
 * replace the function ABHDC_handleDataRecordValues in WFR 2.0
 * @param {Object} recordValues
 */
function ABHDC_handleDataRecordValues2(recordValues){
	
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
 * Hide document Panel if empty. 
 * @param {Object} tableName
 * @param {Object} panel
 */
function ABHDC_hideEmptyDocumentPanel(tableName,panel){
	
	if(!valueExists(tableName)||!valueExists(panel)){
		View.showMessage("error",
			"Missing the panel or tableName,occurs in the function hideEmptyConstsPanel\n please check them.");
		return;
	}
	
	var show = ABHDC_showPanelByFieldValue(tableName + '.doc1',panel,'');
	if(show == true) return !show;
	
	var show = ABHDC_showPanelByFieldValue(tableName + '.doc2',panel,'');
	if(show == true) return !show;
	
	var show = ABHDC_showPanelByFieldValue(tableName + '.doc3',panel,'');
	if(show == true) return !show;
	
	var show = ABHDC_showPanelByFieldValue(tableName + '.doc4',panel,'');
	if(show == true) return !show;
	
	return true;
}
/**
 * Hide satisfaction panel if empty
 * @param {Object} tableName
 * @param {Object} panel
 */
function ABHDC_hideEmptySatisfactionPanel(tableName,panel){
	
	if(!valueExists(tableName)||!valueExists(panel)){
		View.showMessage("error",
			"Missing the panel or tableName,occurs in the function hideEmptyConstsPanel\n please check them.");
		return;
	}
	
	var show = ABHDC_showPanelByFieldValue(tableName + '.satisfaction',panel,'0');
	if(show == true) return !show;
	
	var show = ABHDC_showPanelByFieldValue(tableName + '.satisfaction_notes',panel,'');
	if(show == true) return !show;
	
	return true;
}

	
/**
 * Hide costs panel if empty
 * @param {Object} tableName
 * @param {Object} panel
 */
function ABHDC_hideEmptyConstsPanel(tableName,panel){
	
	if(!valueExists(tableName)||!valueExists(panel)){
		View.showMessage("error",
			"Missing the panel or tableName,occurs in the function hideEmptyConstsPanel\n please check them.");
		return;
	}
	
	var show = ABHDC_showPanelByFieldValue(tableName + '.cost_actual',panel,'0.00');
	if(show == true) return !show;
	
	var show = ABHDC_showPanelByFieldValue(tableName + '.hours_actual',panel,'0');
	if(show == true) return !show;
	
	var show = ABHDC_showPanelByFieldValue(tableName + '.comments',panel,'');
	if(show == true) return !show;
	
	return true;
}
/**
* if the html element's value is not equals the targetValue, show the panel.
* otherwise, make the related panel be hidden.
*/
function ABHDC_showPanelByFieldValue(fieldId,panel,targetHiddenValue){ 
	
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

/**
 * Get the priority of SLA and show the value in div
 * @param {Object} tableName -- 'activity_log' or 'wr'
 * @param {Object} primaryKeyName -- 'activity_log_id' or 'wr_id'
 * @param {Object} htmlPriorityId
 * @param {Object} priorityPanel
 * @param {Object} priorityFieldId
 */
function ABHDC_showPriorityLevel(tableName,primaryKeyName,htmlPriorityId,priorityPanel,priorityFieldId){
	//get data record object
	var record = ABHDC_getDataRecord2(priorityPanel);
	
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-getSLAConditionParameters', tableName, primaryKeyName, record);
	}catch(e){
		Workflow.handleError(e);
		return;
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


/**
 * Get and show workflow step history
 * @param {string} tableName
 * @param {string} fieldName
 * @param {string} primaryKeyValue
 * @param {Object} historyPanel
 * @param {string} htmlHistoryId
 * @param {boolean} show
 */
function ABHDC_getStepInformation(tableName,fieldName,primaryKeyValue,historyPanel,htmlHistoryId,show){
	
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', tableName,fieldName,primaryKeyValue);
	}catch(e){
		Workflow.handleError(e);
		return;
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

function ABHDC_checkHiddenFields(actType,equipmentPanel,locationPanel,documentPanel,priorityPanel){
	
	//lookup fields to hide for this activity_type
	var sql = "activity_type = '"+actType+"'";
	
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-CommonService-getValue', 'activitytype','hide_fields',sql);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		res = eval('('+result.jsonExpression+')');
		var hiddenFields = res.hide_fields;
		arrayHiddenFields = hiddenFields.split(";");
		
		if(valueExists(equipmentPanel)){	
			if(ABHDC_contains(arrayHiddenFields,"eq_id")){
				equipmentPanel.show(false);
			}else{
				equipmentPanel.show(true);
			}
		}
		
		if(valueExists(locationPanel)){
			if(ABHDC_contains(arrayHiddenFields,"site_id") 
				&& ABHDC_contains(arrayHiddenFields,"bl_id") 
				&& ABHDC_contains(arrayHiddenFields,"fl_id") 
				&& ABHDC_contains(arrayHiddenFields,"rm_id")){
			
				locationPanel.show(false);
			}else{
				locationPanel.show(true);
			}
		}
		
		if(valueExists(documentPanel)){
			if(ABHDC_contains(arrayHiddenFields,"doc1") 
				&& ABHDC_contains(arrayHiddenFields,"doc2") 
				&& ABHDC_contains(arrayHiddenFields,"doc3") 
				&& ABHDC_contains(arrayHiddenFields,"doc4")){
		
				documentPanel.show(false);
			}else{
				documentPanel.show(true);
			}
		}
		
		if(valueExists(priorityPanel)){
			if(ABHDC_contains(arrayHiddenFields,"date_required") 
				&& ABHDC_contains(arrayHiddenFields,"time_required")){
				
				if(valueExists(priorityPanel.getFieldElement("date_required")))
					priorityPanel.getFieldElement("date_required").parentNode.parentNode.style.display = 'none';
				
				if(valueExists(priorityPanel.getFieldElement("time_required")))
					priorityPanel.getFieldElement("time_required").parentNode.parentNode.style.display = 'none';
			}else{
				if(valueExists(priorityPanel.getFieldElement("date_required")))
					priorityPanel.getFieldElement("date_required").parentNode.parentNode.style.display = '';
				
				if(valueExists(priorityPanel.getFieldElement("time_required")))
					priorityPanel.getFieldElement("time_required").parentNode.parentNode.style.display = '';
			}
		}
	} else {
		Workflow.handleError(result);
	}
}
/**
* It should be retrieved from here ant put in a high level file for common used.
* Checks if array fields contains the given field
* @param {Array} fields array of fields
* @param {String} field field to match
*/
function ABHDC_contains(fields,field){
	for(i=0;i<fields.length;i++){
		if(fields[i] == field){
			return true;
		}
	}
	return false;
}


function ABHDC_showEquipmentContracts(fieldId,panelId){
	var panel = View.panels.get(panelId);
	var equipmentId = panel.getFieldValue(fieldId);
	
	if(equipmentId != ''){
		var restriction = new Ab.view.Restriction();	
		restriction.addClause("eq.eq_id",equipmentId,'=');
		View.openDialog("ab-helpdesk-request-equipment.axvw", restriction, false); 
	}
}


/**
 * 
 * @param {string} fieldId
 * @param {Object} panel
 */
function ABHDC_showSlaParameters(fieldId,panel){
	//document.getElementById("activity_log.priority").value = 1;
    
    panel.setFieldValue("activity_log.priority",1);
    var record = getDataRecord2(panel);
    
    try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-getSLAConditionParameters', null,null,record);
	}catch(e){
		Workflow.handleError(e);
	}

	if (result.code == 'executed') {  
	//show priority levels or default priority
        var params = eval("(" + result.jsonExpression + ")");
        if (params.ordering_seq != document.getElementById("afm_sla_config.ordering_seq").value){
      		if (document.getElementById("afm_sla_config.ordering_seq").value != ""){
      			ABHDC_clearPriorities();
	      	}
    	  	document.getElementById("afm_sla_config.ordering_seq").value=params.ordering_seq;
        }
        if(params.default_priority != undefined){
        	setPriority(params.default_priority);
        	document.getElementById("default").innerHTML = params['priority_level_'+params.default_priority];
      		document.getElementById("default").style.display='inline';

        } else {
        	ABHDC_getTabsSharedParameters()["slaFound"] = true;
        	if(params.priority_level_1 == undefined) { // no sla found        	  
        		alert(getMessage("noSlaFound") + document.getElementById("activity_log.activity_type").value); 
        		ABHDC_getTabsSharedParameters()["slaFound"] = false;
        	} else if(params.priority_level_1 != "" && params.priority_level_2 == undefined && params.priority_level_3 == undefined && params.priority_level_4 == undefined && params.priority_level_5 == undefined){
      			setPriority(1)
      			document.getElementById("default").innerHTML = params.priority_level_1;
      			document.getElementById("default").style.display='inline';
      		} else {
	      		var radioButtons = document.getElementsByName('priorities');
	   		  	if(params.priority_level_1 != ""){
   			  		radioButtons[0].style.visibility='visible';
   			  		radioButtons[0].style.display='inline';
   					document.getElementById("priority_value1").innerHTML = params.priority_level_1 + '<br/>';
   					document.getElementById("priority_value1").style.display='inline';
		      	}
   			  	if(params.priority_level_2 != undefined){
   			  		radioButtons[1].style.visibility='visible';
   		  			radioButtons[1].style.display='inline';
   					document.getElementById("priority_value2").innerHTML = params.priority_level_2 + '<br/>';
    				document.getElementById("priority_value2").style.display='inline';
		      	}
    		  	if(params.priority_level_3 != undefined){
    		  		radioButtons[2].style.visibility='visible';
    		  		radioButtons[2].style.display='inline';
      				document.getElementById("priority_value3").innerHTML = params.priority_level_3 + '<br/>';
      				document.getElementById("priority_value3").style.display='inline';
		      	}
    		  	if(params.priority_level_4 != undefined){
    		  		radioButtons[3].style.visibility='visible';
    		  		radioButtons[3].style.display='inline';
      				document.getElementById("priority_value4").innerHTML = params.priority_level_4 + '<br/>';
      				document.getElementById("priority_value4").style.display='inline';
		      	}
		      	if(params.priority_level_5 != undefined){
   			  		radioButtons[4].style.visibility='visible';
   			  		radioButtons[4].style.display='inline';
   					document.getElementById("priority_value5").innerHTML = params.priority_level_5 + '<br/>';
   					document.getElementById("priority_value5").style.display='inline';
	      		}
	      		if(document.getElementById("activity_log.priority").value != ""){
    	  			setPriority(document.getElementById("activity_log.priority").value)
	      		}
    	    }
    	    //if date required was filled in, check new priority button
    	    if(document.getElementById("activity_log.date_required").value != ""){
      			ABHDC_onChangeDateRequired(this);
      		}
        }
      		
    } else {
       Workflow.handleError(result);
    }
}


function ABHDC_onChangeDateRequired(){
	var radioButtons = document.getElementsByName('priorities');
	if(radioButtons.length > 1){	
		var ord_seq = $("afm_sla_config.ordering_seq").value;
		if(ord_seq > 0){
			var panel = View.panels.get("requestPanel");
			var record = ABHDC_getDataRecord2(panel);
			
			try {
				//record  -- the data record object [name:value...]
				//ord_seq -- the value of afm_sla_config.ordering_seq field
				var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-determinePriority', record,ord_seq);
			}catch(e){
				Workflow.handleError(e);
			}
			afterDeterminePriority(result); // this function is in the ab-helpdesk-request-basic.js
		}
	}
	
}


/**
* Hides priority the radio buttons for the priority levels
*/
function ABHDC_clearPriorities(panelId,buttonName){
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

/**
 * Get and show the values showing in the select options
 * the parameters is used in like as following:
 * 'SELECT valueField as value, textField as text From tableName Where where'
 * @param {string} tableName
 * @param {string} valueField
 * @param {string} textField
 * @param {string} selectElement
 * @param {string} where
 */
function ABHDC_populateSelectList(tableName,valueField,textField,selectElement,where) {	
	
	var pwhere = valueExists(where) ? where : "";
	try {
		var result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getSelectList", tableName,valueField,textField,pwhere);
	}catch(e){
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

/**
 * Show the years in the select options for use to select
 * @param {string} tableName
 * @param {string} dateField
 * @param {string} selectElementId
 * @param {string} where
 */
function ABHDC_populateYearConsole(tableName,dateField,selectElementId,where){
	
	var pwhere = valueExists(where) ? where : "";
	try {
		var result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getYearSelectList", tableName,dateField,pwhere);
	}catch(e){
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

function ABHDC_onSelectActivityType(tableName,consolePanelId){
	Ab.view.View.selectValue(consolePanelId, getMessage('requestType'),[tableName+'.activity_type'],
	'activitytype',['activitytype.activity_type'],['activitytype.activity_type','activitytype.description'],
	"activity_type LIKE 'SERVICE DESK%'");
}

function ABHDC_reloadHistoryPanel(historyPanel){
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

/**
 * Delete the reocrds user selected in grid panel
 * @param {string} panelId
 * @param {strig} tableName
 */
function ABHDC_deleteItems(panelId, tableName) {
	var grid = View.panels.get(panelId);
	var records = grid.getPrimaryKeysForSelectedRows();
	
	if(records.length < 1){
		View.showMessage(getMessage('noRecordSelected'));
		return true;
	}
	
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-CommonService-deleteRecords', records,tableName);
	}catch(e){
		Workflow.handleError(e);
	} 
	if (result.code == 'executed') {
		grid.refresh();		 
	} else {
		Workflow.handleError(result);
	}
}

/**
 * highlight records in grid if assigned as substitute
 * @param panel gridPanel
 * @param fieldName field to check
 * @param value value to check field content againstS
 */
function highlightBySubstitute(panel,fieldName,value){
	
	if(parseInt(View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']) != 0){
		panel.gridRows.each(function(row) {
            
            var rowValue = row.getRecord().getValue(fieldName);
            //var color = '#f5f5f5';
            if(valueExistsNotEmpty(rowValue) && rowValue != value){
        		Ext.get(row.dom).setStyle('background-color', View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']);
        	}           
        });
		
	
		 var instructions = "<span style='background-color:"+View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']+"'>"+getMessage("substituteLegend")+"</span>";
		 panel.setInstructions(instructions);
	}
}

/**
 * highlight records in grid if assigned as substitute
 * @param panel gridPanel
 * @param fieldName field to check
 * @param value value to check field content againstS
 */
function highlightBySubstitutes(panel,fieldNames,value){
	
	if(parseInt(View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']) != 0){
		panel.gridRows.each(function(row) {
            for(var i=0;i<fieldNames.length;i++){
            	var rowValue = row.getRecord().getValue(fieldNames[i]);
                //var color = '#f5f5f5';
                if(valueExistsNotEmpty(rowValue) && rowValue != value){
					//kb#3045008: only highlight the color of cell 'Wore Request Code' but not the whole row, so the color scheme could take affect to the grid's row.
					var cellEl = Ext.get(row.cells.get(fieldNames[i]).dom);
            		cellEl.setStyle('background-color', View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']);
            		continue;
            	}   
            }
                    
        });
		
	
		 var instructions = "<span style='background-color:"+View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']+"'>"+getMessage("substituteLegend")+"</span>";
		 panel.setInstructions(instructions);
	}
}