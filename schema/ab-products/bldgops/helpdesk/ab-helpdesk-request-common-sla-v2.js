/**
* the panel including the field activity_log.priority
*/
function SLA_clearPriorities(panelId,buttonName){
	
	$("SLAinfo").innerHTML = '';
	$("default").style.display='none';

	var radioButtons = document.getElementsByName(buttonName);
	for (var i=0;i<5;i++){
		radioButtons[i].style.visibility='hidden';
		radioButtons[i].style.display='none';
		
		var level = i+1;
    	$("priority_value"+level).innerHTML = '';
    	$("priority_value"+level).style.display='none';
    	radioButtons[i].checked=false;
    }
    radioButtons[5].style.visibility='hidden';
    radioButtons[5].style.display='none';  

    var panel = View.panels.get(panelId);
	panel.setFieldValue("activity_log.priority",'');
}


/**
* XXXXXXXXX
*/
function SLA_onChangePriority(radioButton,panelId){	
	var panel = View.panels.get(panelId);
	if(panelId == 'wrDetailsMore'){
		panel.setFieldValue("wr.priority", radioButton.value);
	}else{
		panel.setFieldValue("activity_log.priority", radioButton.value);
	}
	
	SLA_changePriority(panelId);	
}


/**
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/SLA/ServiceLevelAgreementHandler.html#getSLAInformation(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getSLAInformation</a>
 * to retrieve SLA information for the new priority and shows this information on the request form
 */
function SLA_changePriority(panelId){	 	
	
	var panel = View.panels.get(panelId);
	
	var ordering_seq = document.getElementById("afm_sla_config.ordering_seq").value;	
	
	if(ordering_seq > 0){
		var priority_level = '';	
		var activity_type = '';
		if(panelId == 'wrDetailsMore'){
			priority_level = panel.getFieldElement("wr.priority").value;	
			activity_type = panel.getFieldValue("wr.activity_type");
		}else{
			priority_level = panel.getFieldElement("activity_log.priority").value;	
			activity_type = panel.getFieldValue("activity_log.activity_type");
		}
		
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-getSLAInformation', ordering_seq,priority_level,activity_type,"-1");
		}catch(e){
			Workflow.handleError(e);
		}
	
		if(result.code == 'executed'){
			var SLA = eval ('(' + result.jsonExpression + ')');
			//if(document.getElementById("activity_log.priority").value == 0){
			if(priority_level == 0 ||priority_level == '0'){
				priority_level = "";
			} else {
				priority_level = getMessage("forPriority")+ " " + document.getElementById("priority_value"+priority_level).innerHTML;
			}
	
			var SLAinfo = "<b>" + getMessage("slainfo") + " " + priority_level + "</b>";

			if($("SLAinfo_layout_without_priority_label")){
				SLAinfo = "<b>" + getMessage("slainfo") + "</b>";
			}
			
		 	if(SLA.time_to_respond != "" && SLA.interval_to_respond != ""){
		 		SLAinfo +="<br /> " + getMessage("responseRequired")+" "+ SLA.time_to_respond;
		 		if(SLA.interval_to_respond == 'n') SLAinfo += " " + getMessage("minutes");
		 		if(SLA.interval_to_respond == 'h') SLAinfo += " " + getMessage("hours");
		 		if(SLA.interval_to_respond == 'd') SLAinfo += " " + getMessage("days");
		 		if(SLA.interval_to_respond == 'w') SLAinfo += " " + getMessage("weeks");
		 		if(SLA.interval_to_respond == 'm') SLAinfo += " " + getMessage("months");
		 	}
		 	if(SLA.time_to_complete != "" && SLA.interval_to_complete != ""){
		 		SLAinfo +="<br /> " + getMessage("completionRequired")+" "+ SLA.time_to_complete;
		 		if(SLA.interval_to_complete == 'n') SLAinfo += " " + getMessage("minutes");
		 		if(SLA.interval_to_complete == 'h') SLAinfo += " " + getMessage("hours");
		 		if(SLA.interval_to_complete == 'd') SLAinfo += " " + getMessage("days")
		 		if(SLA.interval_to_complete == 'w') SLAinfo += " " + getMessage("weeks");
		 		if(SLA.interval_to_complete == 'm') SLAinfo += " " + getMessage("months");
		 	}
		 	if(SLA.approvals != "") SLAinfo += "<br />" + SLA.approvals;
		 	
		 	if(activity_type != 'SERVICE DESK - MAINTENANCE' && typeof(SLA.vn_id) != "undefined" && SLA.vn_id != "")	SLAinfo += "<br /> "+getMessage("assigned")+ " " + SLA.vn_id;
		 	
		 	if(activity_type != 'SERVICE DESK - MAINTENANCE' && typeof(SLA.em_id) != "undefined" && SLA.em_id != "") SLAinfo += "<br /> "+getMessage("assigned")+ " " + SLA.em_id;
		 	
		 	if(activity_type == 'SERVICE DESK - MAINTENANCE' && typeof(SLA.supervisor) != "undefined" && SLA.supervisor != "") SLAinfo += "<br /> "+getMessage("supervised")+ " " + SLA.supervisor;
		 	
		 	if(activity_type == 'SERVICE DESK - MAINTENANCE' && typeof(SLA.work_team_id) != "undefined" && SLA.work_team_id != "") SLAinfo += "<br /> "+getMessage("dispatchedTo")+ " " + SLA.work_team_id;
		 	
		 	if(activity_type == 'SERVICE DESK - MAINTENANCE' && typeof(SLA.cf_id) != "undefined" && SLA.cf_id != "") SLAinfo += "<br /> "+getMessage("assigned")+ " " + SLA.cf_id;
		 	
		 	if(activity_type == 'SERVICE DESK - MAINTENANCE' && typeof(SLA.dispatcher) != "undefined" && SLA.dispatcher != "") SLAinfo += "<br /> "+getMessage("dispatched")+ " " + SLA.dispatcher;
		 	
		 	$("SLAinfo").innerHTML = SLAinfo;
	
		} else {
			Workflow.handleError(result);
		}
	} else {
		checkSLA(panelId);
	}
}


/**
* Retrieves priority for current action item from the database<br />
* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/CommonHandler.html#getValue(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getValue</a> for table activity_log, field priority
* @param {int} priority priority of current request
*/
function SLA_setPriority(requestPanelId,priorityPanelId,priorityValue,buttonName){
	
	var priorityPanel = View.panels.get(priorityPanelId);
	var requestPanel = View.panels.get(requestPanelId);
	
	if(priorityValue == undefined || priorityValue == ""){
		
		var sql = "activity_log_id = " + requestPanel.getFieldValue("activity_log.activity_log_id");
		
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-CommonService-getValue', 'activity_log','priority',sql);
		}catch(e){
			Workflow.handleError(e);
		}
	
				
		if(result.code == 'executed'){
			var res = eval("("+result.jsonExpression + ")");
			
			priorityPanel.setFieldValue("activity_log.priority",res.priority);
			var priority = res.priority;
	
			//set radio button
			var radioButtons = document.getElementsByName(buttonName);
	    	for (var i=0; i<radioButtons.length; i++){
		    	if (priority == radioButtons[i].value) {
			    	radioButtons[i].checked = true; 
		            break;
			    }
	    	}
		} else {
			Workflow.handleError(result);
		}
	}else {
		priorityPanel.setFieldValue("activity_log.priority",priorityValue);
	
		//set radio button
		var radioButtons = document.getElementsByName(buttonName);
    	for (var i=0; i<radioButtons.length; i++){
	    	if (priorityValue == radioButtons[i].value) {
		    	radioButtons[i].checked=true; 
	            break;
		    }
    	}
	}
	SLA_changePriority(priorityPanelId);
}

/**
* Called when Location (building, floor or room) is changed, checks if site is still correct<br />
* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/CommonHandler.html#getValue(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getValue</a> for table bl, field site_id<br />
* Calls <a href='#checkSLA'>checkSLA</a>
* @param {String} fieldName Name of form field for site code
* @param {String} selectedValue New value
* @param {String} previousValue Old value
*/
function SLA_onChangeLocation(fieldName,selectedValue,previousValue){
	//XXX hardcode
	var panel = View.panels.get("locationPanel");
	
	panel.setFieldValue(fieldName,selectedValue);
	
	//$(prefix + fieldName).value = selectedValue;
	if($("same") != undefined){
		if($("same").checked){
			$("same").checked = false;
		}
	}
	
	
	if(panel.getFieldValue("activity_log.site_id") == ''){
		var sql = "bl_id = '" + panel.getFieldValue("activity_log.bl_id") + "'";
		
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-CommonService-getValue', 'bl','site_id',sql);
		}catch(e){
			Workflow.handleError(e);
		}
		
		if (result.code == 'executed'){
			var fields = eval('('+ result.jsonExpression +')');
			panel.setFieldValue("activity_log.site_id",fields.site_id);
		} else {
			Workflow.handleError(result);
		}
	}
	checkSLA("descriptionPanel");
	return true;	
}

/**
* Called when Site Code is changed, removes other location information<br />
* Calls <a href='#checkSLA'>checkSLA</a> after the site code has changed
* @param {String} fieldName Name of form field for site code
* @param {String} selectedValue New value
* @param {String} previousValue Old value
*/
function SLA_onChangeSite(fieldName,selectedValue,previousValue){
	//XXX hardcode
	var panel = View.panels.get("locationPanel");
	panel.setFieldValue(fieldName,selectedValue);
	
	if($("same") != undefined){
		if($("same").checked){
			$("same").checked = false;
		}
	}
	panel.setFieldValue("activity_log.bl_id",'');
	panel.setFieldValue("activity_log.fl_id",'');
	panel.setFieldValue("activity_log.rm_id",'');
	try{
		checkSLA("descriptionPanel");
	}catch(e){
		alert(e.message);
	}
	
	return true;
}

/**
* Called when Site Code is changed (without select value window), removes other location information<br />
* Calls <a href='#checkSLA'>checkSLA</a> after the site code has changed
* @param {String} fieldName Name of form field for site code
* @param {String} selectedValue New value
* @param {String} previousValue Old value
*/
function SLA_onChangeSite2(locationPanelId,descriptionPanelId){

	if($("same") != undefined){
		if($("same").checked){
			$("same").checked = false;
		}
	}
	var locationPanel = View.panels.get(locationPanelId);
	locationPanel.setFieldValue("activity_log.bl_id",'');
	locationPanel.setFieldValue("activity_log.fl_id",'');
	locationPanel.setFieldValue("activity_log.rm_id",'');

	checkSLA(descriptionPanelId);
	return true;
}

/**
 * Return location when called by select location button
 * @param {Object} locationPanelId,location panel id
 * @param {Object} descriptionPanelId ,needed description panel 
 */
function setLocationPram(locationPanelId,descriptionPanelId){
	var c=View.controllers.items[0];
	var locationPanel = View.panels.get(locationPanelId);
	locationPanel.setFieldValue("activity_log.bl_id",c.locArray[0]);
	locationPanel.setFieldValue("activity_log.fl_id",c.locArray[1]);
	locationPanel.setFieldValue("activity_log.rm_id",c.locArray[2]);
	SLA_onChangeLocation2(locationPanelId,descriptionPanelId);
	View.closeDialog();
}

/**
 * Called by view  when bl,fl,rm field  value changed
 * @param {Object} locationPanelId
 * @param {Object} descriptionPanelId
 */
function SLA_onChangeLocation2(locationPanelId,descriptionPanelId){

	if($("same") != undefined){
		if($("same").checked){
			$("same").checked = false;
		}
	}
	
	var locationPanel = View.panels.get(locationPanelId);
		
		var sql = "bl_id = '" + locationPanel.getFieldValue("activity_log.bl_id") + "'";
		
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-CommonService-getValue', 'bl','site_id',sql);
		}catch(e){
			Workflow.handleError(e);
		}
		
		if (result.code == 'executed'){
			var fields = eval('('+ result.jsonExpression +')');
			locationPanel.setFieldValue("activity_log.site_id",fields.site_id);
		} else {
			Workflow.handleError(result);
		}
	
	checkSLA(descriptionPanelId);
	return true;	
}


function SLA_showSLAParameters(descriptionPanelId,onlyDefault){

	var descriptionPanel = View.panels.get(descriptionPanelId);
	
	var record = ABHDC_getDataRecord2(descriptionPanel);
  	
	var result = {};
	try {
		result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-getSLAConditionParameters', null,null,record);
	}catch(e){
		if(e.code == 'ruleFailed'){
			descriptionPanel.setFieldValue("activity_log.priority",1);
	
	      	var recordValues = ABHDC_getDataRecordValues("basicDs"); 
	    	recordValues["activity_log.priority"] = 1; 
		    record = ABHDC_handleDataRecordValues2(recordValues);
	    
            try {
			  var result2 = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-getSLAConditionParameters',null,null, record);
		    }catch(e){
			   Workflow.handleError(e);
		    }
		
		    if (result2.code == 'executed') {  
			   SLA_showPriorities(result2);
		    } else {
			   Workflow.handleError(result2);
		    }
	    }else {
   		   Workflow.handleError(e);
        }
		return;
	}

	if(result.code == 'executed'){  
		SLA_showPriorities(result,onlyDefault);
   	}else {
   		Workflow.handleError(result);
    }
}


function SLA_showPriorities(result,onlyDefault){
	//show priority levels or default priority
	var panel = View.panels.get("descriptionPanel");
	
    var params = eval("(" + result.jsonExpression + ")");
    if(params.ordering_seq != document.getElementById("afm_sla_config.ordering_seq").value){
		if (document.getElementById("afm_sla_config.ordering_seq").value != ""){
			SLA_clearPriorities("descriptionPanel","priorities");
	 	}
  		document.getElementById("afm_sla_config.ordering_seq").value = params.ordering_seq;
    }
	
    //add to fix KB3028102 --Guo 2010.07.05 added
    if (params.default_priority != undefined && onlyDefault) {
        SLA_setPriority("requestPanel", "descriptionPanel", params.default_priority, "priorities");
        $("default").innerHTML = params['priority_level_' + params.default_priority];
        $("default").style.display = 'inline';
		return;
    }

	if(params.priority_level_1 != "" && params.priority_level_2 == undefined && params.priority_level_3 == undefined && params.priority_level_4 == undefined && params.priority_level_5 == undefined){
		//setPriority(1)
		SLA_setPriority("requestPanel","descriptionPanel",1,"priorities");
		
		document.getElementById("default").innerHTML = params.priority_level_1;
		document.getElementById("default").style.display='inline';
	}else{
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
	  	
	  	if(panel.getFieldValue("activity_log.priority") != ''
	  		&& panel.getFieldValue("activity_log.priority") != '0'){
	  		SLA_setPriority("requestPanel","descriptionPanel",panel.getFieldValue("activity_log.priority"),"priorities");
	  	}
	}
}