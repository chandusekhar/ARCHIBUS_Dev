var requestPanel;
var responsePanel;
var ondemandPanel;

var defineSlaPriorityTab_Controller = View.createController('defineSlaPriorityTab_Controller', {

    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.afterSelect();
    },
    
    afterSelect: function(){
        requestPanel = View.panels.get('panel_request');
        responsePanel = View.panels.get('panel_response');
        ondemandPanel = View.panels.get("panel_ondemand_response");
        
        var reqRest = new Ab.view.Restriction();
        reqRest.addClause('helpdesk_sla_response.ordering_seq', this.tabs.ordering_seq);
        reqRest.addClause('helpdesk_sla_response.activity_type', this.tabs.activity_type);
        reqRest.addClause('helpdesk_sla_response.priority', 1);
        
        requestPanel.refresh(reqRest);
        
        var record = requestPanel.getRecord();
        setPanelRecord("panel_response", record);
        setPanelRecord("panel_ondemand_response", record);
        
        setTimeToRespond();
        setTimeToComplete();
        
        setRadioButton("notify_service_provider_odw", "helpdesk_sla_response.notify_service_provider", "panel_ondemand_response");
        setRadioButton("notify_craftsperson", "helpdesk_sla_response.notify_craftsperson", "panel_ondemand_response");
        setRadioButton("autoissue", "helpdesk_sla_response.autoissue", "panel_ondemand_response");
        setServiceWindow();
        setRadioButton("allow_work_on_holidays", "helpdesk_sla_response.allow_work_on_holidays", "panel_response");
        setDefaultSlaManager();
        setDispatching();
    }
});


function setPanelRecord(panelId, record){
    var panel = View.panels.get(panelId);
    panel.setRecord(record);
    panel.show(true);
}


/**
 * Enter the current user in the manager field
 */
function setDefaultSlaManager(){
    if (responsePanel.getFieldValue('helpdesk_sla_response.manager') == "") {
        responsePanel.setFieldValue("helpdesk_sla_response.manager", View.user.employee.id);
    }
}

/**
 * Fill in time to respond<br />
 * Used when loading the form
 */
function setTimeToRespond(){
    var interval = responsePanel.getFieldValue("helpdesk_sla_response.interval_to_respond");
    var value = responsePanel.getFieldValue("helpdesk_sla_response.time_to_respond");
    document.getElementById("helpdesk_sla_response.time_to_respond").value = value;
    document.getElementById("helpdesk_sla_response.interval_to_respond").value = interval;
}

/**
 * Fill in time to complete<br />
 * Used when loading the form
 */
function setTimeToComplete(){
    var interval = responsePanel.getFieldValue("helpdesk_sla_response.interval_to_complete");
    var value = responsePanel.getFieldValue("helpdesk_sla_response.time_to_complete");
    document.getElementById("helpdesk_sla_response.time_to_complete").value = value;
    document.getElementById("helpdesk_sla_response.interval_to_complete").value = interval;
}

/**
 * Get time to respond from submitted form<br />
 * Used when saving the form
 */
function getTimeToRespond(){
    var interval = document.getElementById("helpdesk_sla_response.interval_to_respond").value;
    var value = document.getElementById("helpdesk_sla_response.time_to_respond").value;
    responsePanel.setFieldValue("helpdesk_sla_response.time_to_respond", value);
    responsePanel.setFieldValue("helpdesk_sla_response.interval_to_respond", interval);
}

/**
 * Get time to complete from submitted form<br />
 * Used when saving the form
 */
function getTimeToComplete(){
    var interval = document.getElementById("helpdesk_sla_response.interval_to_complete").value;
    var value = document.getElementById("helpdesk_sla_response.time_to_complete").value;
    responsePanel.setFieldValue("helpdesk_sla_response.time_to_complete", value);
    responsePanel.setFieldValue("helpdesk_sla_response.interval_to_complete", interval);
}

function checkTimes(){
    if (document.getElementById("helpdesk_sla_response.interval_to_respond").value == document.getElementById("helpdesk_sla_response.interval_to_complete").value) {
        if (parseFloat(document.getElementById("helpdesk_sla_response.time_to_complete").value) < parseFloat(document.getElementById("helpdesk_sla_response.time_to_respond").value)) {
            return false;
        }
    }
    return true;
}

function checkServiceWindow(){
    if (document.getElementById("Storedpanel_response_helpdesk_sla_response.serv_window_start").value != "" &&
    document.getElementById("Storedpanel_response_helpdesk_sla_response.serv_window_end").value != "") {
        var startTime = document.getElementById("Storedpanel_response_helpdesk_sla_response.serv_window_start").value;
        var endTime = document.getElementById("Storedpanel_response_helpdesk_sla_response.serv_window_end").value;
        var startArr = startTime.split(":");
        var endArr = endTime.split(":");
        var start = parseFloat(startArr[0]);
        var end = parseFloat(endArr[0]);
        return start < end;
    }
    else 
        return true;
}

/**
 * Check form before saving<br />
 * Required fields:
 * 	<ul>
 * 		<li>Manager</li>
 * 		<li>Employee or Vendor or Acceptance Step for Helpdesk workflow</li>
 * 		<li>Supervisor or Trade or Dispatch Step for On demand Workflow</li>
 * 		<li>Default duration for a craftsperson for On demand work</li>
 * 	</ul>
 * @return true if form is ok, false if values are missing
 */
function displayInvalidHtmlField(id, errorMessage, form){
    var fieldInputTd = $(id).parentNode;
    Ext.fly(fieldInputTd).addClass('formErrorInput');
    var errorBreakElement = document.createElement('br');
    errorBreakElement.className = 'formErrorText';
    fieldInputTd.appendChild(errorBreakElement);
    
    var errorTextElement = document.createElement('span');
    errorTextElement.className = 'formErrorText';
    errorTextElement.appendChild(document.createTextNode(errorMessage));
    fieldInputTd.appendChild(errorTextElement);
    View.showMessage('error', form.validationResult.message);
}

function clearInvalidHtmlField(id){
    var fieldInputTd = $(id).parentNode;
    Ext.fly(fieldInputTd).removeClass('formErrorInput');
    
    // remove per-field error messages
    var errorTextElements = Ext.query('.formErrorText', fieldInputTd);
    for (var e = 0; e < errorTextElements.length; e++) {
        fieldInputTd.removeChild(errorTextElements[e]);
    }
}

function checkForm(){
    requestPanel.clearValidationResult();
    responsePanel.clearValidationResult();
    clearInvalidHtmlField('helpdesk_sla_response.time_to_complete');
    ondemandPanel.clearValidationResult();
    if (!checkTimes()) {
        responsePanel.addInvalidField("helpdesk_sla_response.time_to_complete", getMessage("timeToRespondVsComplete"));
        displayInvalidHtmlField('helpdesk_sla_response.time_to_complete', getMessage("timeToRespondVsComplete"), responsePanel)
        return false;
    }
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_start") == "") {
        responsePanel.addInvalidField("helpdesk_sla_response.serv_window_start", getMessage("serviceWindowStart"));
        responsePanel.displayValidationResult();
        return false;
    }
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_end") == "") {
        responsePanel.addInvalidField("helpdesk_sla_response.serv_window_end", getMessage("serviceWindowEnd"));
        responsePanel.displayValidationResult();
        return false;
    }
    if (!checkServiceWindow()) {
        responsePanel.addInvalidField("helpdesk_sla_response.serv_window_start", getMessage("serviceWindowTimes"));
        responsePanel.displayValidationResult();
        return false;
    }
    if (!isFinite(document.getElementById("helpdesk_sla_response.time_to_respond").value)) {
        responsePanel.addInvalidField("helpdesk_sla_response.time_to_respond", getMessage("enterInteger"));
        responsePanel.displayValidationResult();
        return false;
    }
    if (!isFinite(document.getElementById("helpdesk_sla_response.time_to_complete").value)) {
        responsePanel.addInvalidField("helpdesk_sla_response.time_to_complete", getMessage("enterInteger"));
        responsePanel.displayValidationResult();
        return false;
    }
    
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_start") == "") {
        /*alert(getMessage("serviceWindowStartEndRequired"));
         document.getElementById("helpdesk_sla_response.serv_window_start").focus();*/
        responsePanel.addInvalidField("helpdesk_sla_response.serv_window_start", getMessage("serviceWindowStartEndRequired"))
        responsePanel.displayValidationResult();
        return false;
    }
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_end") == "") {
        /*alert(getMessage("serviceWindowStartEndRequired"));
         document.getElementById("helpdesk_sla_response.serv_window_end").focus();*/
        responsePanel.addInvalidField("helpdesk_sla_response.serv_window_end", getMessage("serviceWindowStartEndRequired"))
        responsePanel.displayValidationResult();
        return false;
    }
    
    
    // manager is required
    if (responsePanel.getFieldValue("helpdesk_sla_response.manager") == "") {
        //alert(getMessage("noManager"));
        //document.getElementById("helpdesk_sla_response.manager").focus();
        responsePanel.addInvalidField("helpdesk_sla_response.manager", getMessage("noManager"));
        responsePanel.displayValidationResult();
        return false;
    }
    
    
    //check dispatching
    if (ondemandPanel.getFieldValue("helpdesk_sla_response.supervisor") != "" || ondemandPanel.getFieldValue("helpdesk_sla_response.work_team_id") != "") {
        ondemandPanel.setFieldValue("helpdesk_sla_response.autodispatch", 1);
    }
    else {
        ondemandPanel.addInvalidField("helpdesk_sla_response.supervisor", getMessage("noDispatcher"));
        ondemandPanel.displayValidationResult();
        return false;
    }
    return true;
}

/**
 * Save the form<br />
 * Called by <a href='#onSave'>onSave()</a>
 * <div class='detailHead'>Pseudo-code:</div>
 * <ol>
 * 		<li><a href='#checkForm'>Check form</a></li>
 * 		<li>Create XML for steps</li>
 * 		<li>Get <a href='#getTimeToRespond'>time to respond</a> and <a href='#getTimeToComplete'>time to complete</a></li>
 * 		<li>Get form values</li>
 * 		<li>Call WFR <a href='../../../../javadoc/com/archibus/eventhandler/helpdesk/ServiceLevelAgreementHandler.html#saveSLAResponseParameters(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-saveSLAResponseParameters</a> to save values</li>
 * 		<li>Return the WFR result</li>
 * </ol>
 */
function saveForm(){
    if (!checkForm()) {
        return;
    }
    var xml = "<states> </states>";
    getTimeToRespond();
    getTimeToComplete();
    var record = getSavingRecord2();
    
    //kb:3024805
    var result = {};
    //Save SLA response parameters. file='ServiceLevelAgreementHandler.java'
    try {
        result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-saveSLAResponseParameters', record, xml);
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    if (result.code != 'executed') {
        Workflow.handleError(result);
    }
    return result;
}

function getSavingRecord2(){
    var record = {};
    for (var i = 0; i < responsePanel.fields.items.length; i++) {
        var fieldName = responsePanel.fields.items[i].fieldDef.id;
        if (/^helpdesk_sla_response./.test(fieldName)) {
            var fieldValue = responsePanel.getFieldValue(fieldName);
            record[fieldName] = fieldValue;
        }
    }
    record['helpdesk_sla_response.status'] = 'Active';
    record['helpdesk_sla_response.supervisor'] = ondemandPanel.getFieldValue('helpdesk_sla_response.supervisor');
    record['helpdesk_sla_response.work_team_id'] = ondemandPanel.getFieldValue('helpdesk_sla_response.work_team_id');
    record['helpdesk_sla_response.cf_id'] = ondemandPanel.getFieldValue('helpdesk_sla_response.cf_id');
    record['helpdesk_sla_response.default_duration'] = ondemandPanel.getFieldValue('helpdesk_sla_response.default_duration');
    record['helpdesk_sla_response.notify_service_provider'] = ondemandPanel.getFieldValue('helpdesk_sla_response.notify_service_provider');
    record['helpdesk_sla_response.notify_craftsperson'] = ondemandPanel.getFieldValue('helpdesk_sla_response.notify_craftsperson');
    record['helpdesk_sla_response.autoissue'] = ondemandPanel.getFieldValue('helpdesk_sla_response.autoissue');
    return record;
}

function getSavingRecord(){
    var record = responsePanel.getRecord();
    record.setValue('helpdesk_sla_response.status', 'Active');
    record.setValue('helpdesk_sla_response.supervisor', ondemandPanel.getFieldValue('helpdesk_sla_response.supervisor'));
    record.setValue('helpdesk_sla_response.work_team_id', ondemandPanel.getFieldValue('helpdesk_sla_response.work_team_id'));
    record.setValue('helpdesk_sla_response.cf_id', ondemandPanel.getFieldValue('helpdesk_sla_response.cf_id'));
    record.setValue('helpdesk_sla_response.default_duration', ondemandPanel.getFieldValue('helpdesk_sla_response.default_duration'));
    record.setValue('helpdesk_sla_response.notify_service_provider', ondemandPanel.getFieldValue('helpdesk_sla_response.notify_service_provider'));
    record.setValue('helpdesk_sla_response.notify_craftsperson', ondemandPanel.getFieldValue('helpdesk_sla_response.notify_craftsperson'));
    record.setValue('helpdesk_sla_response.autoissue', ondemandPanel.getFieldValue('helpdesk_sla_response.autoissue'));
    
    var ds = View.dataSources.get(responsePanel.dataSourceId);
    var recordValues = ds.processOutboundRecord(record).values;
    return toJSON(recordValues);
}

/**
 * Save form
 * <div class='detailHead'>Pseudo-code</div>
 * <ol>
 * 		<li><a href='#saveForm'>Save Form</a> (returns WFR result)</li>
 * 		<li>If WFR is executed, create restriction for next tab and <a href='#selectTab'>select next tab</a></li>
 * </ol>
 */
function onSave(){
    var result = saveForm();
    if (result == null) 
        return;
    
    if (result.code == 'executed') {
        var tabs = defineSlaPriorityTab_Controller.tabs;
        var restriction = new Ab.view.Restriction;
        restriction.addClause('helpdesk_sla_request.activity_type', tabs.activity_type, '=');
        //restriction.addClause('helpdesk_sla_request.prob_type', 'PREVENTIVE MAINT', '=');
        tabs.selectTab("ordering", restriction);
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Check radio button
 * @param {String} radioField name of button element
 * @param {String} dbField name of element with database value
 */
function setRadioButton(radioField, dbField, panelId){
    var dbValue = View.panels.get(panelId).getFieldValue(dbField);
    var buttons = document.getElementsByName(radioField);
    if (dbValue != "") {
        if (dbValue == 1) {
            buttons[0].checked = true;
        }
        else 
            if (dbValue == 0) {
                buttons[1].checked = true;
            }
    }
}



/**
 * Set service days<br />
 * Check checkboxes for service days<br />
 * Input in serv_window_days element: x,x,x,x,x,x,x where x = 0 (day off) or 1 (working day)
 */
function setServiceWindow(){
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_days") == "") { // new, set default values
        responsePanel.setFieldValue("helpdesk_sla_response.serv_window_days", "0,1,1,1,1,1,0");
    }
    
    var serv_days = responsePanel.getFieldValue("helpdesk_sla_response.serv_window_days");
    var days = serv_days.split(",", 7);
    for (var i = 0; i < 7; i++) {
        if (days[i] == 1) {
            var check = document.getElementById("days" + i);
            check.checked = true;
        }
    }
    
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_start") == "") 
        responsePanel.setFieldValue("helpdesk_sla_response.serv_window_start", "09:00");
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_end") == "") 
        responsePanel.setFieldValue("helpdesk_sla_response.serv_window_end", "17:00");
}


/**
 * Set service day in serv_window_days
 * @param {int} id : index of element in array with service window days to change
 */
function setServiceDay(id){
    var serv_days = responsePanel.getFieldValue("helpdesk_sla_response.serv_window_days");
    
    if (serv_days != "") {
        var check = document.getElementById("days" + id);
        var days = serv_days.split(",", 7);
        if (check.checked) {
            days[id] = 1;
        }
        else {
            days[id] = 0;
        }
        var sd = "";
        for (var i = 0; i < 7; i++) {
            sd += days[i] + ",";
        }
        responsePanel.setFieldValue("helpdesk_sla_response.serv_window_days", sd.substring(0, 13));
    }
}

/**
 * Select craftsperson<br />
 * If trade is selected, only provide craftspersons of selected trade
 */
function selectCraftsperson(){
    var workTeamId = ondemandPanel.getFieldValue("helpdesk_sla_response.work_team_id");
    var supervisor = ondemandPanel.getFieldValue("helpdesk_sla_response.supervisor");
    //KB3036965 - support em_id with single quotes
	var supervisor = supervisor.replace(/\'/g, "''");
    var sql = "cf.assign_work = 1";
    if (workTeamId) {
        sql += " AND cf.work_team_id='" + workTeamId + "'";
    }
    else 
        if (supervisor) {
            sql += " AND cf.work_team_id = (SELECT work_team_id FROM cf WHERE email = (SELECT email FROM em WHERE em_id = '" + supervisor + "'))";
        }
    View.selectValue('panel_ondemand_response', getMessage('craftsperson'), ['helpdesk_sla_response.cf_id'], 'cf', ['cf.cf_id'], ['cf.cf_id', 'cf.name', 'cf.tr_id', 'cf.work_team_id'], sql);
}


/**
 * Disable given field in the step dialog
 * @param {String} field field name
 */
function disableField(field){
    $(field).value = "";
    $(field).style.readOnly = true;
    $(field).disabled = true;
}


/**
 * Called when an option for the dispatching of a request is selected<br />
 * Enables/Disables fields for supervisor and or trade or adds dispatch step
 * @param {String} type dispatch type (supervisor, work_team_id or dispatch)
 */
function selectDispatching(type){
    if (type == 'supervisor') {
        ondemandPanel.enableField("helpdesk_sla_response.work_team_id", false);
        ondemandPanel.enableField("helpdesk_sla_response.supervisor", true);
        ondemandPanel.setFieldValue("helpdesk_sla_response.work_team_id", "");
    }
    else 
        if (type == 'work_team_id') {
            ondemandPanel.enableField("helpdesk_sla_response.work_team_id", true);
            ondemandPanel.enableField("helpdesk_sla_response.supervisor", false);
            ondemandPanel.setFieldValue("helpdesk_sla_response.supervisor", "");
        }
}

/**
 * Selects radio button and enables/disables fields for dispatching of request
 * Called by <a href='#user_form_onload' target='main'>user_form_onload</a>
 */
function setDispatching(){
    var dispatch = '';
    if (ondemandPanel.getFieldValue("helpdesk_sla_response.supervisor")) {
        dispatch = "supervisor";
        ondemandPanel.enableField("helpdesk_sla_response.work_team_id", false);
        ondemandPanel.enableField("helpdesk_sla_response.supervisor", true);
    }
    else 
        if (ondemandPanel.getFieldValue("helpdesk_sla_response.work_team_id")) {
            dispatch = "work_team_id";
            ondemandPanel.enableField("helpdesk_sla_response.work_team_id", true);
            ondemandPanel.enableField("helpdesk_sla_response.supervisor", false);
        }
        else {
            dispatch = "dispatch";
            ondemandPanel.enableField("helpdesk_sla_response.work_team_id", false);
            ondemandPanel.enableField("helpdesk_sla_response.supervisor", false);
        }
    var buttons = document.getElementsByName("dispatching");
    for (i = 0; i < buttons.length; i++) {
        if (buttons[i].value == dispatch) {
            buttons[i].checked = true;
        }
        else {
            buttons[i].checked = false;
        }
    }
}

/**
 * Called after a dispatch step is added<br />
 * Disables and empties fields for supervisor and trade<br />
 */
function afterAddDispatch(){
    ondemandPanel.enableField("helpdesk_sla_response.work_team_id", false);
    ondemandPanel.enableField("helpdesk_sla_response.supervisor", false);
    ondemandPanel.setFieldValue("helpdesk_sla_response.work_team_id", "");
    ondemandPanel.setFieldValue("helpdesk_sla_response.supervisor", "");
    var buttons = document.getElementsByName("dispatching");
    for (i = 0; i < buttons.length; i++) {
        if (buttons[i].value == "dispatch") {
            buttons[i].checked = true;
        }
        else {
            buttons[i].checked = false;
        }
    }
}



function enableRadioButtons(buttonName, enabled){
    var buttons = document.getElementsByName(buttonName);
    for (i = 0; i < buttons.length; i++) {
        if (enabled) 
            buttons[i].removeAttribute("disabled");
        else 
            buttons[i].disabled = true;
    }
}

/**
 * Autodispatch = dispatch to supervisor or workteam, not by dispatch step
 */
function checkAutoDispatch(){
    var buttons = document.getElementsByName("dispatching");
    if (buttons[2].checked == true) {
        View.showMessage(getMessage("autoDispatch"))
        return false;
    }
    else {
        return true;
    }
}

function onShowServContDetails(){
    var servcont = responsePanel.getFieldValue('helpdesk_sla_response.servcont_id');
    if (servcont != '') {
        var rest = new Ab.view.Restriction();
        rest.addClause('servcont.servcont_id', servcont);
        View.openDialog("ab-helpdesk-servcont-details.axvw", rest, false, 10, 10, 600, 400);
    }
}


function selectServiceContract(){
    View.selectValue('panel_response', getMessage('serviceContract'), ['helpdesk_sla_response.servcont_id'], 'servcont', ['servcont.servcont_id'], ['servcont.servcont_id', 'servcont.description', 'servcont.date_expiration'])
}

function setFormFieldValue(panelId, filedName, value){
    View.panels.get(panelId).setFieldValue(filedName, value);
}

function selectSupervisor(){
    View.selectValue("panel_ondemand_response", getMessage('supervisor'), ['helpdesk_sla_response.supervisor'], 'em', ['em.em_id'], ['em.em_id', 'em.em_std', 'em.email'], 'EXISTS (select cf_id from cf where cf.email = em.email AND cf.is_supervisor = 1)');
}

