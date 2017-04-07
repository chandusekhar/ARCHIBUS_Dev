/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-workorder-workrequest-create.axvw' target='main'>ab-helpdesk-workorder-workrequest-create.axvw</a>
 */
/**
 * Called when loading the form
 * <div class='detailHead'>Pseudo-code:</div>
 *	<ol>
 *		<li>Clear priority radio buttons</li>
 * 		<li>If work request code is given:</li>
 * 			<ul>
 * 				<li><a href='#setRequestorLocation'>Show requestor location</a></li>
 * 				<li><a href='#showSlaParameters'>Show SLA response parameters</a></li>
 * 			</ul>
 * 		<li>Else set request type to 'SERVICE DESK - MAINTENANCE'</li>
 * 		<li>Check radio button for priority according to the given value</li>
 *	</ol>
 */
var abHelpdeskWorkorderWorkrequestCreateController = View.createController("abHelpdeskWorkorderWorkrequestCreateController", {
/** set the field enable(true)
 * 
 */
    requestPanel_beforeRefresh: function(){
        // not html field
        var formb = this.requestPanel;
        formb.enableField('wr.requestor', true);
        formb.enableField("wr.phone", true);
        var locformb = this.locationPanel;
        locformb.enableField("wr.site_id", true);
        locformb.enableField("wr.bl_id", true);
        locformb.enableField("wr.fl_id", true);
        locformb.enableField("wr.rm_id", true);
        var eqForm = this.equipmentPanel;
        eqForm.enableField("wr.eq_id", true);
		this.problemPanel.enableField('wr.prob_type', true);
		$("wr.prob_type").readOnly = true;
		this.problemPanel.fields.get("wr.prob_type").actions.get(0).command.commands[0].actionListener = afterSelectProblemType;
		//get the html tag
        document.getElementById("same").disabled = false;
        
        //KB3023514 
        this.priorityPanel.show(false);
        this.panel_history.show(false);
    },
    
    requestPanel_afterRefresh: function(){
     
        var form = this.requestPanel;
        
        var wrid = this.requestPanel.getFieldValue("wr.wr_id")
        var restriction = new Ab.view.Restriction();
        restriction.addClause('wr.wr_id', wrid, '=');
        /**
         * refresh other panels according to has been refreshed panel(other explain 'first panel')
         */
        this.locationPanel.refresh(restriction);
        this.equipmentPanel.refresh(restriction);
        this.problemPanel.refresh(restriction);
        this.priorityPanel.refresh(restriction);
        //clear the priority 
        clearPriorities();
        //when the record is old  wrid >0 
        if (wrid > 0) {
            document.getElementById("same").disabled = true;
            this.problemPanel.enableField('wr.prob_type', false);
            showSlaParameters('requestPanel');
            
            changePriority();
            //console the history
            ABODC_getStepInformation("wr", "wr_id", wrid, this.panel_history, "history", true);
           
            
            form.enableField("wr.requestor", false);
            form.enableField("wr.phone", false);
            //set the field enable(false)
            var loc_form = View.getControl('', 'locationPanel');
            loc_form.enableField("wr.site_id", false)
            loc_form.enableField("wr.bl_id", false)
            loc_form.enableField("wr.fl_id", false)
            loc_form.enableField("wr.rm_id", false)
            
            var eq_form = View.getControl('', 'equipmentPanel');
            eq_form.enableField("wr.eq_id", false);
        }
        else { // new record, set default values		
            var woid = this.requestPanel.getFieldValue('wr.wo_id');
            
            if (woid != null) {
                form.setFieldValue("wr.wo_id", woid);
            }
            else {
                alert("no work order")
            }
            
            var form2 = View.getControl('', 'problemPanel');
			//set  the new record'field  default value
            form2.setFieldValue('wr.priority', '1');
            form2.setFieldValue('wr.activity_type', "SERVICE DESK - MAINTENANCE");
            
            form.enableField("wr.phone", true);
            
            //KB3023539 
            var historyRestriction = new Ab.view.Restriction();
            historyRestriction.addClause('helpdesk_step_log.step_log_id', 0, "=");
            this.panel_history.refresh(historyRestriction);
        }
        //KB3023514 
        this.priorityPanel.show(true);
        this.panel_history.show(true);
    },
	
    panel_history_afterRefresh: function(){
    	ABODC_reloadHistoryPanel(this.panel_history);
    }
});


/**
 * Retrieve requestor location from database if a requestor is given<br />
 * Calls WFR AbBldgOpsHelpDesk-getEmployeeLocation<br />
 * Calls <a href='#setLocation'>setLocation</a> and <a href='#checkSLA'>checkSLA</a>
 * @param {String} formName current form
 */
function setRequestorLocation(formName){
    if (View.panels.get('requestPanel').getFieldValue('wr.requestor') != "") {
		var result = {};
		try {
			 result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getEmployeeLocation', View.panels.get('requestPanel').getFieldValue('wr.requestor'));
		}catch (e) {
			Workflow.handleError(e);
 		}	
        if (result.code == 'executed') {
            var results = eval("(" + result.jsonExpression + ")");
            setLocation(formName, results.site_id, results.bl_id, results.fl_id, results.rm_id);
           checkSLA(formName);
        }
        else {
            Workflow.handleError(result);
        }
    }
    else {
        alert(getMessage("noRequestor"));
        return;
    }
    
}

/**
 * Fill in location in current form
 * @param {String} site site_id
 * @param {String} building bl_id
 * @param {String} floor fl_id
 * @param {String} room rm_id
 */
function setLocation(formName, site, building, floor, room){
    View.panels.get(formName).setFieldValue('wr.site_id', site);
    View.panels.get(formName).setFieldValue('wr.bl_id', building);
    View.panels.get(formName).setFieldValue('wr.fl_id', floor);
    View.panels.get(formName).setFieldValue('wr.rm_id', room);
}

/**
 * Shows selection window for equipment
 * @param {String} formName current form
 * @param {boolean} filter if true equipment will be restricted to current location
 */
function onSelectEquipment(form, filter){
    View.selectValue('locationPanel', getMessage('equipment'), ['wr.eq_id', 'wr.bl_id', 'wr.fl_id', 'wr.rm_id'], "eq", ['eq.eq_id', 'eq.bl_id', 'eq.fl_id', 'eq.rm_id'], ['eq.eq_id', 'eq.eq_std', 'eq.site_id', 'eq.bl_id', 'eq.fl_id', 'eq.rm_id'], null, onChangeField, filter, true);
    
}


//control  the field click and the pop up dialog
function onChangeSite2(form, filter){

    if (document.getElementById("same").checked) {
        document.getElementById("same").checked = false;
    }
    View.panels.get(form).setFieldValue('wr.bl_id', '');
    View.panels.get(form).setFieldValue('wr.fl_id', '');
    View.panels.get(form).setFieldValue('wr.rm_id', '');
    View.selectValue(form, getMessage('Site'), ['wr.site_id'], "site", ['site.site_id'], ['site.site_id', 'site.name'], null, onChangeSite3, filter, true);
    
}

function onChangeSite3(fieldName, selectedValue, previousValue){

    View.panels.get("locationPanel").setFieldValue(fieldName, selectedValue);
    
    return true;
}

/**
 * Open select dialog for equipment (filtered by location)
 * @param {String} formName current form
 * @param {boolean} filter equipment filtered by location or not
 */
function selectEquipment(formName, filter){
    var rest = new Ab.view.Restriction();
    if (filter) {
        if (View.panels.get("problemPanel").getFieldValue(wr.wr.fl_id) != '') {
            //sqlRestriction = sqlRestriction + " AND eq.bl_id = '" + document.getElementById('wr.bl_id').value +"' ";
            rest.addClause("eq.bl_id", View.panels.get("problemPanel").getFieldValue(wr.bl_id), "=");
        }
        if (View.panels.get("problemPanel").getFieldValue(wr.bl_id) != '') {
            //sqlRestriction = sqlRestriction +  " AND eq.fl_id = '" + document.getElementById('wr.fl_id').value +"' ";
            rest.addClause("eq.fl_id", View.panels.get("problemPanel").getFieldValue(wr.fl_id), "=");
        }
        if (View.panels.get("problemPanel").getFieldValue(wr.rm_id) != '') {
            //sqlRestriction = sqlRestriction +  " AND eq.rm_id = '" + document.getElementById('wr.rm_id').value +"' ";
            rest.addClause("eq.rm_id", View.panels.get("problemPanel").getFieldValue(wr.rm_id), "=");
        }
    }
    View.selectValue("equipmentPanel", 'Equipment Code', ['wr.eq_id', 'wr.eq_std'], "eq", ['eq.eq_id', 'eq.eq_std'], ['eq.eq_id', 'eq.eq_std'], rest, onChangeField, true, false);
}

/**
 * Check SLA<br />
 * Calls <a href='#showSlaParameters'>showSlaParameters</a> if the problem type is given
 * @param {String} form current form
 */

//search relavte sla through the wr table record
function checkSLA(form){
	if ($("wr.prob_type").value != "") {
		showSlaParameters(form);
	}
}

/**@lei
 * Called when priority is changed<br />
 * Call <a href='#changePriority'>changePriority</a>
 * @param {Element} radioButton radiobutton element checked for new priority
 */
function onChangePriority(radioButton){
	//KB3023539
	var panel = View.panels.get("panel_history");
	panel.show(false);
    set_value('wr.priority', radioButton.value);
    changePriority();
    //KB3023539
    panel.show(true);
}

/**
 * Calls WFR AbBldgOpsHelpDesk-getSLAInformation
 * to retrieve SLA information for the new priority and shows this information on the request form
 * change the priority and get the sla information
 */
function changePriority(){

    var ordering_seq = document.getElementById("afm_sla_config.ordering_seq").value;
    var priority_level = View.panels.get("problemPanel").getFieldValue("wr.priority");
    var activity_type = View.panels.get("problemPanel").getFieldValue("wr.activity_type");

    var wrId = View.panels.get("requestPanel").getFieldValue("wr.wr_id");
    var result ;
	try {
		if(wrId){
			result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-getSLAInformation',ordering_seq,priority_level, activity_type,-1);
		}else{
			result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-getSLAInformation',ordering_seq,priority_level, activity_type,1);
		}
	
    } 
   	catch (e) {
		Workflow.handleError(e);
 	}
	if (result.code == 'executed') {
    
        var SLA = eval('(' + result.jsonExpression + ')');
        if (View.panels.get('problemPanel').getFieldValue('wr.priority') == 0) {
        
            if (document.getElementById("priority_value1").innerHTML != "") {
                priority_level = getMessage("forPriority") + " " + document.getElementById("priority_value0").innerHTML;
            }
            else {
                priority_level = "";
            }
        }
        else {
            priority_level = getMessage("forPriority") + " " + document.getElementById("priority_value" + View.panels.get('problemPanel').getFieldValue('wr.priority')).innerHTML;
        }
        
        var SLAinfo = "<b>" + getMessage("slainfo") + " " + priority_level + "</b>";
        
        if (SLA.time_to_respond != "" && SLA.interval_to_respond != "") {
            SLAinfo += "<br /> " + getMessage("responseRequired") + " " + SLA.time_to_respond;
            if (SLA.interval_to_respond == 'h') 
                SLAinfo += " " + getMessage("hours");
            if (SLA.interval_to_respond == 'd') 
                SLAinfo += " " + getMessage("days");
            if (SLA.interval_to_respond == 'w') 
                SLAinfo += " " + getMessage("weeks");
            if (SLA.interval_to_respond == 'm') 
                SLAinfo += " " + getMessage("months");
        }
        if (SLA.time_to_complete != "" && SLA.interval_to_complete != "") {
            SLAinfo += "<br /> " + getMessage("completionRequired") + " " + SLA.time_to_complete;
            if (SLA.interval_to_complete == 'h') 
                SLAinfo += " " + getMessage("hours");
            if (SLA.interval_to_complete == 'd') 
                SLAinfo += " " + getMessage("days")
            if (SLA.interval_to_complete == 'w') 
                SLAinfo += " " + getMessage("weeks");
            if (SLA.interval_to_complete == 'm') 
                SLAinfo += " " + getMessage("months");
        }
        if (SLA.approvals != "") 
            SLAinfo += "<br />" + SLA.approvals;
        
        if (typeof(SLA.cost) != "undefined" && SLA.cost != "") 
            SLAinfo += "<br /> " + getMessage("costInfo") + " " + SLA.cost;
        
        if (typeof(SLA.vn_id) != "undefined" && SLA.vn_id != "") 
            SLAinfo += "<br /> " + getMessage("assigned") + " " + SLA.vn_id;
        
        if (typeof(SLA.em_id) != "undefined" && SLA.em_id != "") 
            SLAinfo += "<br /> " + getMessage("assigned") + " " + SLA.em_id;
        
        if (typeof(SLA.supervisor) != "undefined" && SLA.supervisor != "") 
            SLAinfo += "<br /> " + getMessage("supervised") + " " + SLA.supervisor;
        
        if (typeof(SLA.cf_id) != "undefined" && SLA.cf_id != "") 
            SLAinfo += "<br /> " + getMessage("assigned") + " " + SLA.cf_id;
        
        if (typeof(SLA.dispatcher) != "undefined" && SLA.dispatcher != "") 
            SLAinfo += "<br /> " + getMessage("dispatched") + " " + SLA.dispatcher;
        
        document.getElementById("SLAinfo").innerHTML = SLAinfo;
        
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Action listener for changes on request fields (problem parameters for SLA)<br />
 * <a href='#checkSLA'>Checks SLA</a> after field values have changed
 * @param {String} fieldName Id of field a value is selected for
 * @param {String} selectedValue new value
 * @param {String} previousValue old value
 */
function onChangeField(fieldName, selectedValue, previousValue){

    View.panels.get("equipmentPanel").setFieldValue(fieldName, selectedValue);
    
    return true;
}

/**
 * Show SLA priorities for current request<br />
 * Calls WFR AbBldgOpsHelpDesk-getSLAConditionParameters<br />
 * Called when an SLA request parameter is changed in the request form and the problem type is given<br />
 * Shows default priority or radiobuttons for different priority levels if the WFR has succeeded
 * @param {String} formName current form
 */
function set_value(id, value){

    View.panels.get("problemPanel").setFieldValue(id, value);
}


function showSlaParameters(formName){
	//KB3023514 
	View.panels.get("panel_history").show(false);
	
	var wrid = View.panels.get('requestPanel').getFieldValue("wr.wr_id");
    if (wrid <= 0) {
        set_value('wr.priority', 1);
    }
    var requestPanel = View.panels.get(formName);
    var record = ABODC_getDataRecord2(requestPanel);
	var result = {};
    try {
		result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-getSLAConditionParameters',null,null, record);
    }catch (e) {
		Workflow.handleError(e);
 	}
    if (result.code == 'executed') {
    
        var params = eval("(" + result.jsonExpression + ")");
        if (wrid != "") {
        
            document.getElementById("afm_sla_config.ordering_seq").value = params.ordering_seq;
            
            var priority_level = View.panels.get("problemPanel").getFieldValue('wr.priority');
            var pr = priority_level;
            if (priority_level == 1) {
                pr = priority_level + " : " + params.priority_level_1;
            }
            else 
                if (priority_level == 2) {
                    pr = priority_level + " : " + params.priority_level_2;
                }
                else 
                
                    if (priority_level == 3) {
                        pr = priority_level + " : " + params.priority_level_3;
                    }
                    else 
                        if (priority_level == 4) {
                            pr = priority_level + " : " + params.priority_level_4;
                        }
                        else 
                            if (priority_level == 5) {
                                pr = priority_level + " : " + params.priority_level_5;
                            }
            document.getElementById("default").innerHTML = pr;
            
        }
        else {
            if (params.ordering_seq) {
                if (document.getElementById("afm_sla_config.ordering_seq").value != "") {
                    clearPriorities();
                }
                document.getElementById("afm_sla_config.ordering_seq").value = params.ordering_seq;
                if (params.priority_level_1 != "" && params.priority_level_2 == undefined && params.priority_level_3 == undefined && params.priority_level_4 == undefined && params.priority_level_5 == undefined) {
                
                    set_value('wr.priority', 1);
                    document.getElementById("default").innerHTML = params.priority_level_1;
                    document.getElementById("default").style.display = 'inline';
                    changePriority();
                    
                }
                else {
                    var radioButtons = document.getElementsByName('priorities');
                    
                    if (params.priority_level_1 != "") {
                        radioButtons[0].style.visibility = 'visible';
                        radioButtons[0].style.display = 'inline';
                        document.getElementById("priority_value1").innerHTML = params.priority_level_1 + '<br/>';
                        document.getElementById("priority_value1").style.display = 'inline';
                    }
                    if (params.priority_level_2 != undefined) {
                        radioButtons[1].style.visibility = 'visible';
                        radioButtons[1].style.display = 'inline';
                        document.getElementById("priority_value2").innerHTML = params.priority_level_2 + '<br/>';
                        document.getElementById("priority_value2").style.display = 'inline';
                    }
                    if (params.priority_level_3 != undefined) {
                        radioButtons[2].style.visibility = 'visible';
                        radioButtons[2].style.display = 'inline';
                        document.getElementById("priority_value3").innerHTML = params.priority_level_3 + '<br/>';
                        document.getElementById("priority_value3").style.display = 'inline';
                    }
                    if (params.priority_level_4 != undefined) {
                        radioButtons[3].style.visibility = 'visible';
                        radioButtons[3].style.display = 'inline';
                        document.getElementById("priority_value4").innerHTML = params.priority_level_4 + '<br/>';
                        document.getElementById("priority_value4").style.display = 'inline';
                    }
                    if (params.priority_level_5 != undefined) {
                        radioButtons[4].style.visibility = 'visible';
                        radioButtons[4].style.display = 'inline';
                        document.getElementById("priority_value5").innerHTML = params.priority_level_5 + '<br/>';
                        document.getElementById("priority_value5").style.display = 'inline';
                    }
                }
            }
        }
    }
    else {
        Workflow.handleError(result);
    }
    View.panels.get("panel_history").show(true);
}

/**
 * Hide radiobuttons for priority
 */
function clearPriorities(){
    document.getElementById("default").innerHTML = "";
    document.getElementById("SLAinfo").innerHTML = "";
    
    var radioButtons = document.getElementsByName('priorities');
    for (var i = 0; i < 5; i++) {
        radioButtons[i].style.visibility = 'hidden';
        radioButtons[i].style.display = 'none';
        
        var level = i + 1;
        document.getElementById("priority_value" + level).innerHTML = "";
        document.getElementById("priority_value" + level).style.display = 'none';
        radioButtons[i].checked = false;
    }
    radioButtons[5].style.visibility = 'hidden';
    radioButtons[5].style.display = 'none';
    
    // set_value('wr.priority',"");
}


function checkForm(){
	var form = View.getControl('','requestPanel');
	form.clearValidationResult();
	var loc_form = View.getControl('','locationPanel');
	loc_form.clearValidationResult();
	var eq_form = View.getControl('','equipmentPanel');
	eq_form.clearValidationResult();
	var prob_form = View.getControl('','problemPanel');
	prob_form.clearValidationResult();
	
	if(View.panels.get('requestPanel').getFieldValue("wr.requestor") == "" ){
		form.addInvalidField("wr.requestor",getMessage("noRequestor"));
		form.displayValidationResult();
		return false;
	}
	if(View.panels.get('locationPanel').getFieldValue("wr.site_id") == ""){
		loc_form.addInvalidField("wr.site_id",getMessage("noSite"));
		loc_form.displayValidationResult();
		return false;
	}
	if(View.panels.get('problemPanel').getFieldValue("wr.description") == ""){
		prob_form.addInvalidField("wr.description",getMessage("noDescription"));
		prob_form.displayValidationResult();
		return false;
	}
	if($("wr.prob_type").value == ""){
		prob_form.addInvalidField("wr.prob_type",getMessage("noProblemType"));
		prob_form.displayValidationResult();
		return false;
	}
	
	if(document.getElementById("default").innerHTML==""){
		//check if a priority is selected
		var radioButtons = document.getElementsByName('priorities');
		for (var i=0; i<radioButtons.length;i++){
			if(radioButtons[i].checked) return true;
		}
		alert(getMessage("noPriority"));
		return false;
    }
	return true;
}

function onSave(formName) {  
	if(!checkForm()) return false;
	var requestPanel = View.panels.get(formName);
    var record = ABODC_getDataRecord2(requestPanel);
	var result = {};
	try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequest', record);
	}catch (e) {
		Workflow.handleError(e);
 	}	
	if (result.code == 'executed') {
		if(result.jsonExpression != undefined){
			var res = eval('('+result.jsonExpression+')');
			var wr_id = res.wr_id;
			 View.panels.get("requestPanel").setFieldValue("wr.wr_id", wr_id);
		}
	} else {
		Workflow.handleError(result);
		return false;
	}
	return true;
}


function onCancel(){
    var rest = new Ab.view.Restriction();
    rest.addClause("wo.wo_id", View.panels.get("requestPanel").getFieldValue('wr.wo_id'), "=");
    View.parentTab.parentPanel.selectTab("details", rest);
}



function returnToWo(){
		if (onSave('requestPanel')) {
			var panel = View.panels.get('requestPanel');
			var woId = panel.getFieldValue('wr.wo_id');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('wo.wo_id', woId, '=');
			View.parentTab.parentPanel.selectTab('details', restriction, false, true);
		}
    
}

function attachDocs(){
	if (onSave('requestPanel')) {
			var panel = View.panels.get('requestPanel');
			var woId = panel.getFieldValue('wr.wo_id');
			var wrId = panel.getFieldValue('wr.wr_id');
		
			var restriction = new Ab.view.Restriction();
			restriction.addClause('wr.wr_id', wrId, '=');
			restriction.addClause('wr.wo_id', woId, '=');
			View.parentTab.parentPanel.selectTab('editDocuments', restriction, false, true);
		}
	
}

function afterSelectProblemType(fieldName, newValue, oldValue){
	$("wr.prob_type").value = newValue;
	showSlaParameters('problemPanel');
}

