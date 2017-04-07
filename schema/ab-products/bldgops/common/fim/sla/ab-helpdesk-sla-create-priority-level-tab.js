/**
 * @fileoverview Javascript functions for <a href='../../../../viewdoc/overview-summary.html#ab-helpdesk-sla-create-priority-level.axvw' target='main'>ab-helpdesk-sla-create-priority-level.axvw</a>
 */
var image_path = "/archibus/schema/ab-products/bldgops/common/graphics/";

var notificationDlg;

var dropItem;
var dropContainer;

var addNew = false;
var basicStatus;
var step;
var stepType;
var steps;

var dragSource;

var dialogBox;

var helpdeskConditionFields;
var ondemandConditionFields;

var requestPanel;
var responsePanel;

$ = YAHOO.util.Dom.get;
$D = YAHOO.util.Dom;
$E = YAHOO.util.Event;
$S = YAHOO.util.Dom.setStyle;


/**
 * Called when form is loaded
 * <div class='detailHead'>Pseudo-code:</div>
 *<ol>
 *	<li><a href='#setTabs'>Create subtabs</a> for the different priority levels and select the first tab</li>
 * 	<li>Make panels collapsable, close request panel</li>
 * 	<li>Show panels for helpdesk or on demand according to the request type</li>
 * 	<li><a href='#setServiceWindow'>Set service window</a>, <a href='#setTimeToRespond'>time to respond</a> and <a href='#setTimeToComplete'>time to complete</a></li>
 * 	<li><a href='#setRadioButton'>Set radiobuttons</a> for notify requestor, autoissue, autocreate_wr, and holidays</li>
 * 	<li><a href='#getHelperRules'>Show workflow steps for the current SLA</a></li>
 * 	<li><a href='#getSteps'>Create step elements</a></li>
 * 	<li><a href='#populateSelectList'>Populate selection list for roles (for steps)</a></li>
 *</ol>
 */
// KB3024763
function translate(){
    var condition_operator = document.getElementById("condition_operator");
    var condition_operand = document.getElementById("condition_operand");
    var condition_operator_ = document.getElementById("condition_operator_");
    
    if (valueExists(condition_operator)) {
        for (var i = 0; i < condition_operator.length; i++) {
            if (condition_operator.options[i].value == 'LIKE') {
                condition_operator.options[i].text = getMessage("like");
            }
        }
    }
    
    if (valueExists(condition_operand)) {
        for (var i = 0; i < condition_operand.length; i++) {
            if (condition_operand.options[i].value == 'AND') {
                condition_operand.options[i].text = getMessage("and");
            }
            else 
                if (condition_operand.options[i].value == 'OR') {
                    condition_operand.options[i].text = getMessage("or");
                }
        }
    }
    
    if (valueExists(condition_operator_)) {
        for (var i = 0; i < condition_operator_.length; i++) {
            if (condition_operator_.options[i].value == 'LIKE') {
                condition_operator_.options[i].text = getMessage("like");
            }
        }
    }
}

var createSlaPriorityLevelSubTabController = View.createController('createSlaPriorityLevelSubTabController', {
    tabs: null,
    priorityLevelTabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent.parent, 'tabs')[0];
        this.priorityLevelTabs = View.getControlsByType(parent, 'tabs')[0];
        this.afterSelect();
        translate();
        
        //KB3041838 - always set autocreate_wr disable and 'Yes'
        enableRadioButtons("autocreate_wr", false);

		//KB3025102 - allow for configurable craftsperson assignment on autoscheduling
        if(!Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','helpdesk_sla_response', 'schedule_immediately').value){
		     jQuery('#scheduleimmediately_div').parent().parent().hide();		     
        }
    },
    
    
    afterSelect: function(){
        var currentTab = this.priorityLevelTabs.currentTab;
        requestPanel = View.panels.get('panel_request');
        responsePanel = View.panels.get('panel_response');
        var helpdeskPanel = View.panels.get("panel_providers");
        var ondemandPanel = View.panels.get("panel_ondemand_response");
        
        var reqRest = new Ab.view.Restriction();
        reqRest.addClause('helpdesk_sla_response.ordering_seq', this.tabs.ordering_seq);
        reqRest.addClause('helpdesk_sla_response.activity_type', this.tabs.activity_type);
        reqRest.addClause('helpdesk_sla_response.priority', currentTab.priority);
        
        requestPanel.show(true);
        requestPanel.refresh(reqRest);
        
        responsePanel.show(true);
        responsePanel.refresh(reqRest);
        var record = responsePanel.getRecord();
        var status = record.getValue('helpdesk_sla_response.status');
        if (status == 'Created') {
            currentTab.setTitle(this.tabs.priorities[currentTab.priority - 1] + ' (*)');
            currentTab.newCreated = true;
        }
        
        setPanelRecord("panel_providers", record);
        setPanelRecord("panel_ondemand_response", record);
        View.panels.get("status_request").show(true);
        
        setPanelCollapse("panel_request");
        setPanelCollapse("panel_response");
        setPanelCollapse("panel_ondemand_response");
        closePanel("panel_request");
        
        setTimeToRespond();
        setTimeToComplete();
        
        var activityType = responsePanel.getFieldValue('helpdesk_sla_response.activity_type');
        if (activityType == 'SERVICE DESK - MAINTENANCE') {
            document.getElementById("helpdeskStatus").style.display = "none";
            helpdeskPanel.show(false);
            
            //fix KB3030571- add specail click handler for response panel if activityType == 'SERVICE DESK - MAINTENANCE' to avoid
            //overlap between panels when expand/collapse response panel(this issue only occur in IE and activityType == 'SERVICE DESK - MAINTENANCE')
            YAHOO.util.Event.addListener("panel_response_title","click",onClickResponsePanelTitle,'panel_response');
            
            setRadioButton("autoissue", "helpdesk_sla_response.autoissue", "panel_ondemand_response");
            setRadioButton("autocreate_wo", "helpdesk_sla_response.autocreate_wo", "panel_ondemand_response");
            //setRadioButton("autocreate_wr", "helpdesk_sla_response.autocreate_wr", "panel_ondemand_response");
            
            setRadioButton("notify_service_provider_odw", "helpdesk_sla_response.notify_service_provider", "panel_response");
            setRadioButton("notify_craftsperson", "helpdesk_sla_response.notify_craftsperson", "panel_response");
            
            //KB3025102 - allow for configurable craftsperson assignment on autoscheduling
            setRadioButton("scheduleimmediately", "helpdesk_sla_response.schedule_immediately", "panel_ondemand_response");
        }
        else {
            //hidePanel("panel_ondemand_response");
            ondemandPanel.show(false);
            document.getElementById("ondemandStatus").style.display = "none";
            
            setRadioButton("notify_service_provider", "helpdesk_sla_response.notify_service_provider", "panel_response");
        }
        
        setServiceWindow();
        
        setRadioButton("notify_requestor", "helpdesk_sla_response.notify_requestor", "panel_response");
        setRadioButton("allow_work_on_holidays", "helpdesk_sla_response.allow_work_on_holidays", "panel_response");
        
        
        $("save_button").value = getMessage("Save");
        $("close_button").value = getMessage("Close");
        
        helpdeskConditionFields = getConditionFields("AbBldgOpsHelpDesk");
        ondemandConditionFields = getConditionFields("AbBldgOpsOnDemandWork");
        
        // get workflow steps and display them
        getHelperRules();
        
        // get all possible steps 
        getSteps();
        
        setStepButtons();

        var maxButtons = ["REQUESTED", "APPROVED", "A", "AA", "I", "Com", "Rej", "S", "Can", "COMPLETED", "REJECTED", "STOPPED", "CANCELLED"]
        for (var i = 0; i < maxButtons.length; i++) {
            addMaximizeButton(maxButtons[i]);
        }

        if (activityType == 'SERVICE DESK - MAINTENANCE') {
            onSetAutoIssue(ondemandPanel.getFieldValue("helpdesk_sla_response.autoissue"), true);
            onSetAutocreateWO(ondemandPanel.getFieldValue("helpdesk_sla_response.autocreate_wo"), true);
            onSetAutocreateWR(ondemandPanel.getFieldValue("helpdesk_sla_response.autocreate_wr"));
            hideOnDemandButtonsForComplete();
        }
        
        setDefaultSlaManager()
        
        document.getElementById("panel_request_title").style.cursor = 'pointer';
        
        var args = ["acceptance", "APPROVED"];
        YAHOO.util.Event.addListener("serviceProviderStep", "click", addStep, args);
        
        args = ["dispatch", "APPROVED"];
        YAHOO.util.Event.addListener("dispatchStep", "click", addStep, args);
        
        if (activityType == 'SERVICE DESK - MAINTENANCE') {
            setDispatching();
        }
        else {
            setProviders();
        }
    }
});

function onClickResponsePanelTitle(e,id){
	if(document.getElementById(id+"_body").parentNode.style.display != 'none'){
		document.getElementById(id+"_title").innerHTML = document.getElementById(id+"_title").innerHTML.replace("[-]","[+]");
		document.getElementById(id+"_body").parentNode.style.display = 'none';
	} else {
		document.getElementById(id+"_title").innerHTML = document.getElementById(id+"_title").innerHTML.replace("[+]","[-]");
		document.getElementById(id+"_body").parentNode.style.display = 'inline';
	}
}

function setPanelRecord(panelId, record){
    var panel = View.panels.get(panelId);
    panel.setRecord(record);
    panel.show(true);
}


function hideOnDemandButtonsForComplete(){
    enableButtons("COMPLETED", false)
    enableButton("survey", "COMPLETED", true);
}

/**
 * Add step buttons to the step containers<br />
 * Based on the possible steps per status and activity
 */
function setStepButtons(){
    var add_text = getMessage("helpdesk_sla_create_priority_level_add");
    if (!valueExists(steps)) {
        return;
    }
    
    var requestType = responsePanel.getFieldValue('helpdesk_sla_response.activity_type');
    
    for (var i = 0; i < steps.length; i++) {
        var state = steps[i].state;
        
        //KB3038797 - not show step options for COMPLETED when SERVICE DESK - GROUP MOVE
        if(state == 'COMPLETED' && requestType == 'SERVICE DESK - GROUP MOVE' ){
        	continue;
        }
        
        var buttonContainer = $("buttons_" + state);
        if (buttonContainer != undefined) {
            var types = steps[i].types;
            
            for (var j = 0; j < types.length; j++) {
                var type = "" + types[j].type.value;
                var typeText = "" + types[j].type.text;
                var args = [type, state];
                
                var button = document.createElement("input");
                button.type = "button";
                
                button.value = add_text + " " + typeText;
                button.id = "btn_" + type + "_" + state;
                
                if (type == "verification") {
                    YAHOO.util.Event.addListener(button, "click", addVerification, state);
                    buttonContainer.appendChild(button);
                }
                else 
                    if (type == "survey") {
                        YAHOO.util.Event.addListener(button, "click", addSurvey, state);
                        buttonContainer.appendChild(button);
                    }
                    else 
                        if (type == "review") {
                        	//Add for 20.1 space transaction, hidden Edit and Approve button for 'SERVICE DESK - GROUP MOVE', 'SERVICE DESK - INDIVIDUAL MOVE' and 'SERVICE DESK - DEPARTMENT SPACE'
                        	if(requestType == 'SERVICE DESK - GROUP MOVE' || requestType == 'SERVICE DESK - INDIVIDUAL MOVE'|| requestType == 'SERVICE DESK - DEPARTMENT SPACE'){
                        		//no need to add Edit and Approve step button
                        	}else{
                        		YAHOO.util.Event.addListener(button, "click", addReview, state);
                                buttonContainer.appendChild(button);
                        	}
                        }
                        else 
                            if (type != "basic" && type != 'change' && type != 'return') {
                            
                                if (type == "acceptance" && state == "APPROVED" && responsePanel.getFieldValue('helpdesk_sla_response.activity_type') == 'SERVICE DESK - MAINTENANCE') {
                                // do nothing
                                }
                                else 
                                    if (type == "dispatch" && state == "APPROVED" && responsePanel.getFieldValue('helpdesk_sla_response.activity_type') != 'SERVICE DESK - MAINTENANCE') {
                                    // do nothing					
                                    }
                                    else {
                                        button.id = "btn_" + type + "_" + state;
                                        YAHOO.util.Event.addListener(button, "click", addStep, args);
                                        buttonContainer.appendChild(button);
                                    }
                            }
                
            }
        }
        
    }
}
// add maximize button

function addMaximizeButton(state) {
    var buttonContainer = $("buttons_" + state);

    var img = document.createElement("img");
    img.setAttribute("src", "/archibus/schema/ab-core/graphics/icons/zoom.png");
    img.setAttribute("border", "0");
    img.setAttribute("id", "btn_max_" + state);
    img.setAttribute("align", "right");
    img.setAttribute("valign", "middle");
    buttonContainer.appendChild(img);

    YAHOO.util.Dom.setStyle(img, "margin", "2px");
    YAHOO.util.Dom.setStyle(img, "margin-left", "6px");
    YAHOO.util.Dom.setStyle(img, "cursor", "pointer");

    // var button = $("btn_max_" + state);    
    YAHOO.util.Event.addListener(img, "click", onMaximizeContainer, state);
}

function addUpDown(state) {
    var buttonContainer = $("buttons_" + state);

    var button = document.createElement("input");
    button.type = "button";

    button.value = getMessage("up");
    button.id = "btn_up" + "_" + state;

    YAHOO.util.Event.addListener(button, "click", addUp, state);
    buttonContainer.appendChild(button);

    button = document.createElement("input");
    button.type = "button";

    button.value = getMessage("down");
    button.id = "btn_down" + "_" + state;

    YAHOO.util.Event.addListener(button, "click", addDown, state);
    buttonContainer.appendChild(button);

}

/**
 * Add Up action
 * @param {String} statusValue status for Up action
 * @param {Event} e event
 */
addUp = function (e, statusValue) {
    dropContainer = document.getElementById(statusValue);
}


/**
 * Add Down action
 * @param {String} statusValue status for Down action
 * @param {Event} e event
 */
addDown = function (e, statusValue) {
    dropContainer = document.getElementById(statusValue);
}


onMaximizeContainer = function (e, state) {
    var statusContainer = document.getElementById(state).parentNode;

    var button = $("btn_max_" + state);

    if (button != undefined && button.value == "min") {
        YAHOO.util.Dom.setStyle(statusContainer, "height", "80px");
        button.value = "max";
    } else {
        YAHOO.util.Dom.setStyle(statusContainer, "height", "80%");
        button.value = "min";
    }
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
 * Open new dialog window for a step
 */
function openDialog(){

    var panel = View.panels.get("step_dialog");
    panel.show(true);

    panel.showInWindow({
        newRecord: true,
        x: 100,
        y: 100,
        width: 800,
        height: 350,
        closeButton: false
    });

    enableAllFields();
}

/**
 * Open custom dialog
 * @param {String} dialog Name of element to open (show)
 */
function openCustomDialog(dialog){
    document.getElementById(dialog).style.display = "block";
}

/**
 * Close dialog
 */
function closeDialog(){
    View.panels.get("step_dialog").closeWindow();
}

/**
 * Close custom dialog
 * @param dialog name of element to close (hide)
 */
function closeCustomDialog(dialog){
    document.getElementById(dialog).style.display = "none";
}

/**
 * Hide row if given fields are empty or don't exist
 * @param {String} fieldName1 field in row
 * @param {String} fieldName2 field in row
 */
function hideRow(fieldName1, fieldName2){
    var field1 = document.getElementById(fieldName1);
    var field2 = document.getElementById(fieldName2);
    // one of the field may not exist
    if (field1 != null && field1.value == "") {
        field1.parentNode.parentNode.style.display = 'none'; // hide tr
    }
    else 
        if (field2 != null && field2.value == "") {
            field2.parentNode.parentNode.style.display = 'none'; // hide tr
        }
}

/**
 * Get all steps from the database<br />
 * Called by <a href='#user_form_onload'>user_form_onload</a><br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/steps/StepHandler.html#getSteps(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getSteps</a><br />
 * Sets global javascript variable 'steps' with returned jsonExpression
 */
function getSteps(){
    var result = {};
    try {
        result = Workflow.callMethod("AbBldgOpsHelpDesk-StepService-getSteps");
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    
    if (result.code == 'executed') {
        steps = eval('(' + result.jsonExpression + ')');
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Populate selection element for steps<br />
 * Called by <a href='#user_form_onload'>user_form_onload</a>
 * @param {String} type type of steps required
 * @param {String} state starting state for steps in dropdown
 */
function populateSteps(type, state){
    var selectElement = document.getElementById("helpdesk_sla_steps.step");
    selectElement.length = 0;
    if (!valueExists(steps)) {
        return;
    }
    for (i = 0; i < steps.length; i++) {
        if (steps[i].state == state) {
            var types = steps[i].types;
            
            for (j = 0; j < types.length; j++) {
                if (types[j].type.value == type) {
                    var mySteps = types[j].steps;
                    
                    if (mySteps.length > 1) {
                        var selectTitle = '';
                        if (getMessage('selectTitle') != "") 
                            selectTitle = getMessage('selectTitle');
                        
                        var option = new Option(selectTitle, "");
                        selectElement.options[0] = option;
                        selectElement.length = 1;
                        for (k = 0; k < mySteps.length; k++) {
                            selectElement.length = selectElement.length + 1;
                            var option = new Option(mySteps[k].text, mySteps[k].step);
                            selectElement.options[k + 1] = option;
                        }
                    }
                    else 
                        if (mySteps.length == 1) {
                            var option = new Option(mySteps[0].text, mySteps[0].step);
                            selectElement.options[0] = option;
                        }
                    
                }
            }
        }
    }
}



function populateConditionField(activity_id, selectElement){
    // var selectElement = document.getElementById("condition_field");
    selectElement.length = 0;
    if (activity_id == 'AbBldgOpsHelpDesk') 
        optionMap = helpdeskConditionFields;
    else 
        if (activity_id = 'AbBldgOpsOnDemandWork') 
            optionMap = ondemandConditionFields;
        else 
            return;
    
    
    // get "-select" localized string 
    var selectTitle = '';
    if (getMessage('selectTitle') != "") 
        selectTitle = getMessage('selectTitle');
    
    var option = new Option(selectTitle, "");
    selectElement.options[0] = option;
    for (i = 0; i < optionMap.length; i++) {
        var option = new Option(optionMap[i].text, optionMap[i].value);
        selectElement.options[i + 1] = option;
    }
}

function populateRoles(type){
    document.getElementById("helpdesk_sla_steps.role").options.length = 0;
    ABHDC_populateSelectList("helpdesk_roles", "role", "role", "helpdesk_sla_steps.role", "step_type='" + type + "'");
    if (document.getElementById("helpdesk_sla_steps.role").options.length == 0) {
        document.getElementById("dialogRowRole").style.display = 'none';
        document.getElementById("dialogRowMultiple1").style.display = 'none';
        document.getElementById("dialogRowMultiple2").style.display = 'none';
    }
}

/**
 * Edit step element
 * @param {Element} element Element to edit
 */
editElement = function(e, obj){
    var element = obj.parentNode.parentNode.parentNode.parentNode;
    
    var category = element.getAttribute("category");
    // public variable
    dropContainer = element.parentNode;
    var state = dropContainer.getAttribute("state");
    
    editStep(state, category, element, e);
}

/**
 * Delete step element
 * @param {Element} element Element to delete
 */
function deleteElement(element){
    var container = element.parentNode;
    container.removeChild(element);
    
    if (container.getAttribute("state") == "REQUESTED" && (checkChildren(container, "approval") || checkChildren(container, "review"))) 
        //document.getElementById("helpdesk_sla_response.autoapprove").value = 0;
        responsePanel.setFieldValue('helpdesk_sla_response.autoapprove', 0);
    else 
        //document.getElementById("helpdesk_sla_response.autoapprove").value = 1;
        responsePanel.setFieldValue('helpdesk_sla_response.autoapprove', 1);
    
    if (checkChildren(container, "acceptance")) 
        //document.getElementById("helpdesk_sla_response.autoaccept").value = 0;
        responsePanel.setFieldValue('helpdesk_sla_response.autoaccept', 0);
    else 
        //document.getElementById("helpdesk_sla_response.autoaccept").value = 1;
        responsePanel.setFieldValue('helpdesk_sla_response.autoaccept', 1);
    
    
}

/**
 * Move Up step element
 * @param {Element} element Element to move
 */

function goUpElement(element) {
    var container = element.parentNode;
    //KB3040307 - element.previousElementSibling not work in IE8
    var prev = element.previousSibling;
    if (prev == null) {
        return;
    }
    container.insertBefore(element, prev)
}

/**
 * Move Down step element
 * @param {Element} element Element to move
 */

function goDownElement(element) {
    var container = element.parentNode;
    //KB3040307 - element.nextElementSibling not work in IE8
    var nxt = element.nextSibling;
    if (nxt == null) {
        return;
    }
    container.insertBefore(nxt, element)
}

/**
 * Check container children for element with attribute type
 * @param {Element} container container to check
 * @param {String} type step type to check container children for
 */
function checkChildren(container, type){
    var children = YAHOO.util.Dom.getElementsByClassName("step", "li", container);
    if (children == null) 
        return false;
    
    for (i = 0; i < children.length; i++) {
        if (children[i].getAttribute("type") == type) {
            return true;
        }
    }
    return false;
}


/**
 * Edit notification<br />
 * Opens dialog to edit a notification
 * @param {Element} element Element for notification
 */
function editNotification(element){
    dropItem = element;
    // public variable
    dropContainer = element.parentNode;
    stepType = "notification";
    step = "notification";
    
    if (dropItem.getAttribute("em_id") != null) 
        document.getElementById("helpdesk_sla_steps.em_id").value = dropItem.getAttribute("em_id");
    else 
        document.getElementById("helpdesk_sla_steps.em_id").value = "";
    
    if (dropItem.getAttribute("vn_id") != null) 
        document.getElementById("helpdesk_sla_steps.vn_id").value = dropItem.getAttribute("vn_id");
    else 
        document.getElementById("helpdesk_sla_steps.vn_id").value = "";
    
    if (dropItem.getAttribute("cf_id") != null) 
        document.getElementById("helpdesk_sla_steps.cf_id").value = dropItem.getAttribute("cf_id");
    else 
        document.getElementById("helpdesk_sla_steps.cf_id").value = "";
    
    if (dropItem.getAttribute("role") != null) 
        document.getElementById("helpdesk_sla_steps.role").value = dropItem.getAttribute("role");
    else 
        document.getElementById("helpdesk_sla_steps.role").value = "";
    
    if (document.getElementById("multiple_required_true").checked) {
        dropItem.setAttribute("multiple_required", "true");
    }
    else {
    
        dropItem.setAttribute("multiple_required", "false");
    }
    showStepField("helpdesk_sla_steps.vn_id");
    showStepField("helpdesk_sla_steps.cf_id");
    openDialog();
}

function selectStepsEmployee(){
    //select dispatcher for dispatch step
    if (dropItem.getAttribute("type") == 'dispatch') {
        var sql = "email IN (SELECT email FROM afm_users WHERE role_name like '%DISPATCH%')";
        View.selectValue('', getMessage('dispatcher'), ['helpdesk_sla_steps.em_id'], 'em', ['em.em_id'], ['em.em_id', 'em.em_std', 'em.email'], sql, afterSelectEmployee);
    }
    else 
        if (dropItem.getAttribute("type") == 'scheduling') {
            var form = View.panels.get('panel_ondemand_response');
            var workTeamId = form.getFieldValue("helpdesk_sla_response.work_team_id");
            //KB3037246 - avoid error if name contain single quotes
            var supervisor = form.getFieldValue("helpdesk_sla_response.supervisor").replace(/\'/g, "''");
            //select planner for schedule step
            var sql = "email IN (SELECT email FROM cf WHERE is_planner = 1)"
            if (workTeamId) {
                sql = "email IN (SELECT email FROM cf WHERE is_planner = 1 AND work_team_id = '" +
                workTeamId +
                "')";
            }
            else 
                if (supervisor) {
                    sql = "email IN (SELECT email FROM cf WHERE is_planner = 1 AND " +
                    "work_team_id = (SELECT work_team_id FROM cf WHERE email = " +
                    "(SELECT email FROM em WHERE em_id = '" +
                    supervisor +
                    "')))";
                }
            View.selectValue('', getMessage('planner'), ['helpdesk_sla_steps.em_id'], 'em', ['em.em_id'], ['em.em_id', 'em.em_std', 'em.email'], sql, afterSelectEmployee);
        }
        else 
            if (dropItem.getAttribute("type") == 'estimation') {
                //select estimator for estimation step
                var sql = "email IN (SELECT email FROM cf WHERE is_estimator = 1)";
                View.selectValue('', getMessage('estimator'), ['helpdesk_sla_steps.em_id'], 'em', ['em.em_id'], ['em.em_id', 'em.em_std', 'em.email'], sql, afterSelectEmployee);
            }
            else {
                View.selectValue('', getMessage('employee'), ['helpdesk_sla_steps.em_id'], 'em', ['em.em_id'], ['em.em_id', 'em.em_std', 'em.email'], '', afterSelectEmployee);
            }
}

/**
 * Edit step<br />
 * Opens dialog to edit a step
 * @param {String} state Status for selected step
 * @param {String} type Type of step
 * @param {Element} element Element to edit
 */
function editStep(state, type, element, e){
    dropItem = element;
    stepType = type;
    
    // public variable
    dropContainer = document.getElementById(state);
    
    populateSteps(type, state);
    populateConditionField(dropContainer.getAttribute("activity"), document.getElementById("condition_field"));
    populateConditionField(dropContainer.getAttribute("activity"), document.getElementById("condition_field_"));
    populateRoles(type);
    
    if (dropItem.getAttribute("condition") != null) {
        document.getElementById("helpdesk_sla_steps.condition").value = dropItem.getAttribute("condition");
        var condition = dropItem.getAttribute("condition");
        var terms = condition.split(" ");
        
        if (terms.length >= 7) {
            document.getElementById("condition_operand").value = terms[3];
            document.getElementById("condition_field_").value = terms[4];
            document.getElementById("condition_operator_").value = terms[5];
            document.getElementById("condition_value_").value = terms[6];
        }
        else {
            document.getElementById("condition_field_").value = "";
            document.getElementById("condition_value_").value = "";
        }
        
        if (terms.length >= 3) {
            document.getElementById("condition_field").value = terms[0];
            document.getElementById("condition_operator").value = terms[1];
            document.getElementById("condition_value").value = terms[2];
        }
        else {
            document.getElementById("condition_field").value = "";
            document.getElementById("condition_value").value = "";
        }
        
    }
    else {
        document.getElementById("condition_field").value = "";
        document.getElementById("condition_value").value = "";
        document.getElementById("condition_field_").value = "";
        document.getElementById("condition_value_").value = "";
    }
    
    if (dropItem.getAttribute("step") != null) {
        document.getElementById("helpdesk_sla_steps.step").value = dropItem.getAttribute("step");
    }
    else {
        document.getElementById("helpdesk_sla_steps.step").value = "";
    }
    
    if (dropItem.getAttribute("em_id") != null) 
        document.getElementById("helpdesk_sla_steps.em_id").value = dropItem.getAttribute("em_id");
    else 
        document.getElementById("helpdesk_sla_steps.em_id").value = "";
    if (dropItem.getAttribute("vn_id") != null) 
        document.getElementById("helpdesk_sla_steps.vn_id").value = dropItem.getAttribute("vn_id");
    else 
        document.getElementById("helpdesk_sla_steps.vn_id").value = "";
    if (dropItem.getAttribute("cf_id") != null) 
        document.getElementById("helpdesk_sla_steps.cf_id").value = dropItem.getAttribute("cf_id");
    else 
        document.getElementById("helpdesk_sla_steps.cf_id").value = "";
    
    document.getElementById("multiple_required_true").checked = false;
    document.getElementById("multiple_required_false").checked = true;
    if (dropItem.getAttribute("role") != null) {
        document.getElementById("helpdesk_sla_steps.role").value = dropItem.getAttribute("role");
        if (type == 'approval' && dropItem.getAttribute("multiple_required") != null && dropItem.getAttribute("role") != "") {
            document.getElementById("multiple_required_" + dropItem.getAttribute("multiple_required")).checked = true;
            enableRadioButtons("multiple_required", true);
        }
    }
    else {
        document.getElementById("helpdesk_sla_steps.role").value = "";
    }
    
    if (dropItem.getAttribute("notify_responsible") != null) {
        document.getElementById("notify_responsible_" + dropItem.getAttribute("notify_responsible")).checked = true;
        enableRadioButtons("notify_responsible", true);
    }
    
    if (type == "dispatch" || type == "scheduling" || type == "estimation") {
        hideStepField("Vendor");
        hideStepField("Craftsperson");
    }
    else 
        if (type == "acceptance") {
            hideStepField("Craftsperson");
        }
        else {
            showStepField("Vendor");
            showStepField("Craftsperson");
        }
    if (type != 'approval') {
        //hide radiobuttons for Multiple Required
        document.getElementById("dialogRowMultiple1").style.display = 'none';
        document.getElementById("dialogRowMultiple2").style.display = 'none';
    }
    else {
        document.getElementById("dialogRowMultiple1").style.display = '';
        document.getElementById("dialogRowMultiple2").style.display = '';
        if (dropItem.getAttribute("role") == null) {
            enableRadioButtons("multiple_required", false);
        }
    }
    
    if (type == 'notification') {
        //hide radiobuttons for 'Notify Responsible?'
        document.getElementById("dialogRowNotify").style.display = 'none';
    }
    else {
        document.getElementById("dialogRowNotify").style.display = '';
    }
    
    /** we don't need below code after KB3037927 about the step dialog improvement
    if (e != undefined) {
        //Guo change 2009-07-03 to solve KB3023417
        var topPos = '150px';
        if (YAHOO.util.Event.isIE) {
        	 var pos = YAHOO.util.Event.getPageY(e);
             var topTitlePos = YAHOO.util.Dom.getY('panel_request_title');
             topPos = pos - topTitlePos - 80;
        }
        $("dialog").style.top = topPos;
        $("dialog").style.left = "40px";
    }*/
    
    openDialog();
}

addReview = function(e, statusValue){
    var container = $("REQUESTED");
    if (checkChildren(container, "review")) {
        View.showMessage(getMessage("onlyOneReview"));
    }
    else {
        // public 
        dropContainer = document.getElementById(statusValue);
        
        element = document.createElement("li");
        element.className = "step";
        element.setAttribute("type", "review");
        element.setAttribute("status", statusValue);
        
        addNew = true;
        
        editStep(statusValue, "review", element, e);
    }
}

/**
 * Add Satisfaction Survey to steps
 * @param {String} statusValue status to add survey step to
 * @param {Event} e event
 */
addSurvey = function(e, statusValue){
    dropContainer = document.getElementById(statusValue);
    
    element = document.createElement("li");
    // element.setAttribute("class","step");	
    element.className = "step"
    element.setAttribute("category", "survey");
    element.setAttribute("type", "survey");
    element.setAttribute("step", "Satisfaction Survey");
    element.setAttribute("notify_responsible", "true");
    
    element.innerHTML = '';
    
    var txt = "Satisfaction Survey ";
    setInnerHTML(element, txt);
    
    dropContainer.appendChild(element);
}


/**
 * Add Verification step
 * @param {String} statusValue status to add verification step to
 * @param {Event} e event
 */
addVerification = function(e, statusValue){
    dropContainer = document.getElementById(statusValue);
    
    element = document.createElement("li");
    // element.setAttribute("class","step");	
    element.className = "step"
    element.setAttribute("category", "verification");
    element.setAttribute("type", "verification");
    element.setAttribute("step", "Verification");
    element.setAttribute("notify_responsible", "true");
    
    element.innerHTML = '';
    
    var txt = "Verification ";
    setInnerHTML(element, txt);
    
    dropContainer.appendChild(element);
}

/**
 * Add step<br />
 * Opens dialog to create new step
 * @param {Event} e event
 * @param {Array} args stepType and basicStatus
 */
addStep = function(e, args){
    /* type, statusValue
     basicStatus = statusValue;
     stepType = type;
     step = type; */
    stepType = args[0];
    step = stepType;
    
    basicStatus = args[1];
    
    // public 
    dropContainer = document.getElementById(basicStatus);
    
    element = document.createElement("li");
    element.className = "step";
    // element.setAttribute("class","step");	
    element.setAttribute("type", stepType);
    element.setAttribute("status", basicStatus);
    
    if (stepType != "notification") {
        element.setAttribute("notify_responsible", "true");
    }
    
    addNew = true;
    
    editStep(basicStatus, stepType, element, e);
}

/**
 * Add icon to step element
 * @param {Element} element Element to add icon to
 * @param {String} category Type of icon
 */
function addIcon(element, category){
    var src = image_path + category + ".png";
    
    var img = document.createElement("img");
    img.setAttribute("src", src);
    img.setAttribute("border", "0");
    
    img.setAttribute("align", "left");
    img.setAttribute("valign", "middle");
    
    element.appendChild(img);
}

/**
 * Add control buttons to step element
 * @param {Element} element Element to add buttons to
 */
function addControlButtons(element){

    element.setAttribute("align", "right");
    
    var img1 = document.createElement("img");
    img1.setAttribute("src", image_path + "edit-step.png");
    img1.setAttribute("border", "0");
    img1.style.cursor = "pointer";
    // img - td - tr - table - li 
    // img1.onclick = function(){ editElement(this.parentNode.parentNode.parentNode.parentNode.parentNode); };
    
    //var li = element.parentNode.parentNode.parentNode.parentNode.parentNode; 
    
    YAHOO.util.Event.addListener(img1, "click", editElement, element);
    
    var img2 = document.createElement("img");
    img2.setAttribute("src", image_path + "delete.png");
    img2.setAttribute("border", "0");
    img2.style.cursor = "pointer";
    // img - td - tr - table - li 
    img2.onclick = function(){
        deleteElement(this.parentNode.parentNode.parentNode.parentNode.parentNode);
    };
    
    var img3 = document.createElement("img");
    img3.setAttribute("src", image_path + "arrow_up.png");
    img3.setAttribute("border", "0");
    img3.style.cursor = "pointer";
    // img - td - tr - table - li 
    img3.onclick = function () {
        goUpElement(this.parentNode.parentNode.parentNode.parentNode.parentNode);
    };

    var img4 = document.createElement("img");
    img4.setAttribute("src", image_path + "arrow_down.png");
    img4.setAttribute("border", "0");
    img4.style.cursor = "pointer";
    // img - td - tr - table - li 
    img4.onclick = function () {
        goDownElement(this.parentNode.parentNode.parentNode.parentNode.parentNode);
    };


    element.appendChild(img1);
    element.appendChild(img2);
    element.appendChild(img3);
    element.appendChild(img4);
    
    return element;
}

/**
 * Set innerHTML for new step
 * @param {Element} dropItem li element to add
 * @param {String} txt Text for new element
 */
function setInnerHTML(dropItem, txt){
    // drop item is the <li> element
    dropItem.innerHTML = '';
    
    var table = document.createElement("table");
    table.setAttribute("width", "700");
    
    // for append row set index = -1
    row = table.insertRow(-1);
    cell = row.insertCell(-1);
    cell.setAttribute("width", 20);
    addIcon(cell, dropItem.getAttribute("category"));
    
    cell = row.insertCell(-1);
    cell.setAttribute("width", 630);
    cell.className = "txt";
    // cell.setAttribute("class", "txt");
    cell.setAttribute("style", "font-size: 11px;");
    cell.appendChild(document.createTextNode(txt));
    
    cell = row.insertCell(-1);
    cell.setAttribute("width", 100);
    addControlButtons(cell);
    
    dropItem.appendChild(table);
}

/**
 * Save created/updated step<br >
 * Add extra item to step list for new step<br />
 */
function onSetStep(){

    if ($("helpdesk_sla_steps.step").value == "") {
        View.showMessage(getMessage("stepRequired"));
        return false;
    }
    
    if ($("helpdesk_sla_steps.em_id").value == "" && $("helpdesk_sla_steps.vn_id").value == "" &&
    $("helpdesk_sla_steps.cf_id").value == "" &&
    $("helpdesk_sla_steps.role").value == "") {
        View.showMessage(getMessage("assigneeRequired"));
        return false;
    }
    
    
    if (addNew) {
        dropContainer.appendChild(dropItem);
    }
    
    var statusValue = dropContainer.getAttribute("state");
    
    // dropItem.setAttribute("class","step");
    dropItem.className = "step";
    dropItem.setAttribute("category", stepType);
    dropItem.setAttribute("type", stepType);
    dropItem.setAttribute("status", statusValue);
    
    if (statusValue == "REQUESTED" && (stepType == "approval" || stepType == "review")) {
        //document.getElementById("helpdesk_sla_response.autoapprove").value = 0;
        responsePanel.setFieldValue('helpdesk_sla_response.autoapprove', 0);
    }
    else 
        if (stepType == "acceptance") {
            //document.getElementById("helpdesk_sla_response.autoaccept").value = 0;
            responsePanel.setFieldValue('helpdesk_sla_response.autoaccept', 0);
            afterAddAcceptance();
        }
        else 
            if (stepType == "dispatch") {
                //document.getElementById("helpdesk_sla_response.autodispatch").value = 0;
                View.panels.get("panel_ondemand_response").setFieldValue('helpdesk_sla_response.autodispatch', 0);
                afterAddDispatch();
            }
    
    if (document.getElementById("helpdesk_sla_steps.step").value != "") {
        step = document.getElementById("helpdesk_sla_steps.step").value;
    }
    
    dropItem.setAttribute("step", step);
    
    if (document.getElementById("condition_field").value != "" && document.getElementById("condition_value").value != "") {
        // first condition		
        var condition = document.getElementById("condition_field").value + " " + document.getElementById("condition_operator").value + " " + literal(document.getElementById("condition_value").value);
        
        // second condition
        if (document.getElementById("condition_field_").value != "" && document.getElementById("condition_value_").value != "") {
            var condition_ = document.getElementById("condition_field_").value + " " + document.getElementById("condition_operator_").value + " " + literal(document.getElementById("condition_value_").value);
            
            condition += " " + document.getElementById("condition_operand").value + " " + condition_;
        }
        
        dropItem.setAttribute("condition", condition);
    }
    
    if (document.getElementById("multiple_required_true").checked) {
        dropItem.setAttribute("multiple_required", "true");
    }
    else {
        dropItem.setAttribute("multiple_required", "false");
    }
    
    dropItem.setAttribute("em_id", document.getElementById("helpdesk_sla_steps.em_id").value);
    dropItem.setAttribute("vn_id", document.getElementById("helpdesk_sla_steps.vn_id").value);
    dropItem.setAttribute("cf_id", document.getElementById("helpdesk_sla_steps.cf_id").value);
    dropItem.setAttribute("role", document.getElementById("helpdesk_sla_steps.role").value);
    
    if (dropItem.getAttribute("type") != 'notification') {
        if (document.getElementById("notify_responsible_true").checked) {
            dropItem.setAttribute("notify_responsible", "true");
        }
        else {
            dropItem.setAttribute("notify_responsible", "false");
        }
    }
    
    dropItem.innerHTML = '';
    var txt = step.substring(0, 1).toUpperCase() + step.substring(1, step.length);
    if (dropItem.getAttribute("em_id") != null || dropItem.getAttribute("vn_id") != null || dropItem.getAttribute("cf_id") != null || dropItem.getAttribute("role") != null) {
        txt += " " + getMessage("by") + " " + dropItem.getAttribute("em_id") + dropItem.getAttribute("vn_id") + dropItem.getAttribute("cf_id") + dropItem.getAttribute("role");
    }
    
    if (dropItem.getAttribute("condition") != null && dropItem.getAttribute("condition") != "") {
        txt += " " + getMessage("when") + " " + getConditionText(dropContainer.getAttribute("activity"), condition);
    }
    
    if (dropItem.getAttribute("type") == 'approval' && dropItem.getAttribute("role") != null && dropItem.getAttribute("role") != "" &&
    document.getElementById("multiple_required_true").checked) {
        txt += ", " + getMessage("multipleRequired");
    }
    
    setInnerHTML(dropItem, txt);
    
    addNew = false;
    closeDialog();
}

// esacape and set quotes
function literal(value){
    if (value.indexOf("'") == 0 && value.lastIndexOf("'") + 1 == value.length) {
        //value already between quotes?
        return value;
    }
    else {
        return "'" + value + "'";
    }
}

/**
 * Save new/updated notification<br />
 * Add extra item to step list for new notification
 */
function onSetNotification(){
    if (addNew) {
        dropContainer.appendChild(dropItem);
    }
    
    //dropItem.setAttribute("class","step");
    dropItem.className = "step";
    
    dropItem.setAttribute("type", "notification");
    dropItem.setAttribute("em_id", document.getElementById("notification_by").value);
    dropItem.setAttribute("em_role", document.getElementById("notification_role").value);
    
    dropItem.innerHTML = '';
    
    var txt = getMessage("NotificationTo") + " " + dropItem.getAttribute("em_id") + dropItem.getAttribute("em_role")
    
    setInnerHTML(dropItem, txt);
    
    addNew = false;
    closeCustomDialog('dialog_notification');
}

/**
 * Check if given node is a text node or has a textnode as child (recursive)
 * @param {Element} node node to check
 * @return textnode or false
 */
function getTextNode(node){
    if (node.nodeType == Node.TEXT_NODE) {
        return node;
    }
    
    for (var i = 0; i < node.childNodes.length; i++) {
        var rtn = getTextNode(node.childNodes[i]);
        if (rtn) {
            return rtn;
        }
    }
    return false;
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
    
    var helpdeskPanel = View.panels.get("panel_providers");
    helpdeskPanel.clearValidationResult();
    var ondemandPanel = View.panels.get("panel_ondemand_response");
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
        responsePanel.addInvalidField("helpdesk_sla_response.serv_window_start", getMessage("serviceWindowStartEndRequired"))
        responsePanel.displayValidationResult();
        return false;
    }
    if (responsePanel.getFieldValue("helpdesk_sla_response.serv_window_end") == "") {
        responsePanel.addInvalidField("helpdesk_sla_response.serv_window_end", getMessage("serviceWindowStartEndRequired"))
        responsePanel.displayValidationResult();
        return false;
    }
    
    
    // manager is required
    if (responsePanel.getFieldValue("helpdesk_sla_response.manager") == "") {
        responsePanel.addInvalidField("helpdesk_sla_response.manager", getMessage("noManager"));
        responsePanel.displayValidationResult();
        return false;
    }
    
    //if this is the default priority for requestors, check if a review is the first step in the workflow
    if (requestPanel.getFieldValue("helpdesk_sla_request.default_priority") == responsePanel.getFieldValue("helpdesk_sla_response.priority")) {
        var container = $("REQUESTED");
        var children = YAHOO.util.Dom.getElementsByClassName("step", "li", container);
        if (children != null && children.length > 0) {
            if (children[0].getAttribute("type") != 'review') {
                openPanel("panel_request");
                requestPanel.addInvalidField("helpdesk_sla_request.default_priority", getMessage("noReviewForDefaultPriority"));
                requestPanel.displayValidationResult();
                return false;
            }
        }
        else {
            openPanel("panel_request");
            requestPanel.addInvalidField("helpdesk_sla_request.default_priority", getMessage("noReviewForDefaultPriority"));
            requestPanel.displayValidationResult();
            return false;
        }
    }
    
    //check if only 1 review step is used (2nd won't be invoked)
    var container = $("REQUESTED");
    var children = YAHOO.util.Dom.getElementsByClassName("step", "li", container);
    if (children != null) {
        var first = false;
        for (i = 0; i < children.length; i++) {
            if (children[i].getAttribute("type") == 'review') {
                if (first) {
                    View.showMessage(getMessage("onlyOneReview"));
                    return false;
                }
                else 
                    first = true;
            }
        }
    }
    
    
    // for helpdesk em_id or vn_id is required
    if (responsePanel.getFieldValue("helpdesk_sla_response.activity_type") != 'SERVICE DESK - MAINTENANCE') {
        var container = $("APPROVED");
        if (document.getElementsByName("serviceProvider")[2].checked) {
            if (!checkChildren(container, "acceptance")) {
                helpdeskPanel.addInvalidField("helpdesk_sla_response.em_id", getMessage("noAssignee"));
                helpdeskPanel.displayValidationResult();
                return false;
            }
        }
        else {
            if (checkChildren(container, "acceptance")) {
                helpdeskPanel.addInvalidField("helpdesk_sla_response.em_id", getMessage("noAssignee"));
                helpdeskPanel.displayValidationResult();
                return false;
            }
        }
    }
    else { // checks for On Demand Work
        var container = $("APPROVED");
        
        //check dispatching
        if (ondemandPanel.getFieldValue("helpdesk_sla_response.supervisor") != "" || ondemandPanel.getFieldValue("helpdesk_sla_response.work_team_id") != "") {
            ondemandPanel.setFieldValue("helpdesk_sla_response.autodispatch", 1);
        }
        else {
            ondemandPanel.setFieldValue("helpdesk_sla_response.autodispatch", 0);
            if (!checkChildren(container, "dispatch")) { //check if dispatch step(s) exist
                ondemandPanel.addInvalidField("helpdesk_sla_response.supervisor", getMessage("noDispatcher"));
                ondemandPanel.displayValidationResult();
                return false;
            }
        }
        
        
        if (document.getElementsByName("dispatching")[2].checked && !checkChildren(container, "dispatch")) {
            //dispatch by step and no dispatch step
            ondemandPanel.addInvalidField("helpdesk_sla_response.supervisor", getMessage("noDispatcher"));
            ondemandPanel.displayValidationResult();
            return false;
        }
        else 
            if (!document.getElementsByName("dispatching")[2].checked && checkChildren(container, "dispatch")) {
                //autodispatch and dispatch step
                ondemandPanel.addInvalidField("helpdesk_sla_response.supervisor", getMessage("noDispatcher"));
                ondemandPanel.displayValidationResult();
                return false;
            }
        
        if (ondemandPanel.getFieldValue("helpdesk_sla_response.autoissue") == 1) {
            ondemandPanel.setFieldValue("helpdesk_sla_response.autoschedule", 1);
            //check craftsperson
            if (ondemandPanel.getFieldValue("helpdesk_sla_response.cf_id") == "") {
                ondemandPanel.addInvalidField("helpdesk_sla_response.cf_id", getMessage("cfAndDefaultDuration"));
                ondemandPanel.displayValidationResult();
                return false;
            }
        }
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
    
    var uls = document.getElementsByTagName("ul");
    var j = 0;
    var state = "";
    var xml = "<states>";
    
    responsePanel.setFieldValue("helpdesk_sla_response.autoapprove", 1);
    responsePanel.setFieldValue("helpdesk_sla_response.autoaccept", 1);
    View.panels.get('panel_ondemand_response').setFieldValue("helpdesk_sla_response.autodispatch", 1);
    
    for (var i = 0; i < uls.length; i++) {
        var ul = uls[i];
        
        if (ul.getAttribute("state") != null && ul.getAttribute("state") != state) {
            state = ul.getAttribute("state");
            
            activity = ul.getAttribute("activity");
            
            if (xml != "<states>") 
                xml += "</state>";
            
            xml += '<state activity="' + activity + '"  value="' + ul.getAttribute("state") + '">';
        }
        
        var lis = ul.getElementsByTagName("li");
        
        for (var x = 0; x < lis.length; x++) {
        	 var step_type = lis[x].getAttribute("type");
        	if(step_type!=null){
        		 xml += '<' + step_type + ' ';
                 
                 if (state == "REQUESTED" && (step_type == "approval" || step_type == "review")) {
                     responsePanel.setFieldValue("helpdesk_sla_response.autoapprove", 0);
                 }
                 if (state == "APPROVED" && step_type == "acceptance") {
                     responsePanel.setFieldValue("helpdesk_sla_response.autoaccept", 0);
                 }
                 if (state == "APPROVED" && step_type == "dispatch") {
                     View.panels.get('panel_ondemand_response').setFieldValue("helpdesk_sla_response.autodispatch", 0);
                 }
                 
                 if (lis[x].getAttribute("step") != null && lis[x].getAttribute("step") != "") 
                     xml += ' step="' + encodeURIComponent(lis[x].getAttribute("step")) + '"';
                 
                 if (lis[x].getAttribute("condition") != null && lis[x].getAttribute("condition") != "") 
                     xml += ' condition="' + lis[x].getAttribute("condition").replace("<", "&lt;").replace(">", "&gt;") + '"';
                 
                 if (lis[x].getAttribute("em_id") != null && lis[x].getAttribute("em_id") != "") 
                     xml += ' em_id="' + encodeURIComponent(lis[x].getAttribute("em_id")) + '"';
                 if (lis[x].getAttribute("vn_id") != null && lis[x].getAttribute("vn_id") != "") 
                     xml += ' vn_id="' + encodeURIComponent(lis[x].getAttribute("vn_id")) + '"';
                 if (lis[x].getAttribute("cf_id") != null && lis[x].getAttribute("cf_id") != "") 
                     xml += ' cf_id="' + encodeURIComponent(lis[x].getAttribute("cf_id")) + '"';
                 if (lis[x].getAttribute("role") != null && lis[x].getAttribute("role") != "") 
                     xml += ' role="' + encodeURIComponent(lis[x].getAttribute("role")) + '"';
                 
                 if (lis[x].getAttribute("multiple_required") != null && lis[x].getAttribute("multiple_required") != "") 
                     xml += ' multiple_required="' + lis[x].getAttribute("multiple_required") + '"';
                 
                 if (lis[x].getAttribute("notify_responsible") != null && lis[x].getAttribute("notify_responsible") != "") {
                     xml += ' notify_responsible="' + lis[x].getAttribute("notify_responsible") + '"';
                 }
                 
                 xml += '/>';
        	}
           
            // end if
        } // end for x		
    } // end for i
    if (xml == "<states>") 
        xml += "</states>";
    else 
        xml += "</state></states>";
    
    getTimeToRespond();
    getTimeToComplete();
    
    var record = getSavingRecord2();
    
    var result = {};
    try {
        result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-saveSLAResponseParameters', record, xml);
    } 
    catch (e) {
        Workflow.handleError(e);
        //fix KB3031080- add return when catch wfr exception(Guo 2011/4/15)
        return null;
    }
    
    return result;
}

function getSavingRecord(){
    var record = responsePanel.getRecord();
    var helpdeskPanel = View.panels.get("panel_providers");
    record.setValue('helpdesk_sla_response.vn_id', helpdeskPanel.getFieldValue('helpdesk_sla_response.vn_id'));
    record.setValue('helpdesk_sla_response.em_id', helpdeskPanel.getFieldValue('helpdesk_sla_response.em_id'));
    var ondemandPanel = View.panels.get("panel_ondemand_response");
    record.setValue('helpdesk_sla_response.supervisor', ondemandPanel.getFieldValue('helpdesk_sla_response.supervisor'));
    record.setValue('helpdesk_sla_response.work_team_id', ondemandPanel.getFieldValue('helpdesk_sla_response.work_team_id'));
    record.setValue('helpdesk_sla_response.autocreate_wr', ondemandPanel.getFieldValue('helpdesk_sla_response.autocreate_wr'));
    record.setValue('helpdesk_sla_response.autocreate_wo', ondemandPanel.getFieldValue('helpdesk_sla_response.autocreate_wo'));
    record.setValue('helpdesk_sla_response.autoschedule', ondemandPanel.getFieldValue('helpdesk_sla_response.autoschedule'));
    record.setValue('helpdesk_sla_response.autodispatch', ondemandPanel.getFieldValue('helpdesk_sla_response.autodispatch'));
    record.setValue('helpdesk_sla_response.autoissue', ondemandPanel.getFieldValue('helpdesk_sla_response.autoissue'));
    record.setValue('helpdesk_sla_response.cf_id', ondemandPanel.getFieldValue('helpdesk_sla_response.cf_id'));
    record.setValue('helpdesk_sla_response.default_duration', ondemandPanel.getFieldValue('helpdesk_sla_response.default_duration'));
    
    var ds = View.dataSources.get(responsePanel.dataSourceId);
    var recordValues = ds.processOutboundRecord(record).values;
    return toJSON(recordValues);
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
    
    var helpdeskPanel = View.panels.get("panel_providers");
    record['helpdesk_sla_response.vn_id'] = helpdeskPanel.getFieldValue('helpdesk_sla_response.vn_id');
    record['helpdesk_sla_response.em_id'] = helpdeskPanel.getFieldValue('helpdesk_sla_response.em_id');
    record['helpdesk_sla_response.activity_id'] = helpdeskPanel.getFieldValue('helpdesk_sla_response.activity_id');
    var ondemandPanel = View.panels.get("panel_ondemand_response");
    record['helpdesk_sla_response.supervisor'] = ondemandPanel.getFieldValue('helpdesk_sla_response.supervisor');
    record['helpdesk_sla_response.work_team_id'] = ondemandPanel.getFieldValue('helpdesk_sla_response.work_team_id');
    record['helpdesk_sla_response.autocreate_wr'] = ondemandPanel.getFieldValue('helpdesk_sla_response.autocreate_wr');
    record['helpdesk_sla_response.autocreate_wo'] = ondemandPanel.getFieldValue('helpdesk_sla_response.autocreate_wo');
    record['helpdesk_sla_response.autoschedule'] = ondemandPanel.getFieldValue('helpdesk_sla_response.autoschedule');
    record['helpdesk_sla_response.autodispatch'] = ondemandPanel.getFieldValue('helpdesk_sla_response.autodispatch');
    record['helpdesk_sla_response.autoissue'] = ondemandPanel.getFieldValue('helpdesk_sla_response.autoissue');
    record['helpdesk_sla_response.cf_id'] = ondemandPanel.getFieldValue('helpdesk_sla_response.cf_id');
    record['helpdesk_sla_response.default_duration'] = ondemandPanel.getFieldValue('helpdesk_sla_response.default_duration');
    
    //KB3025102 - allow for configurable craftsperson assignment on autoscheduling	
    if(Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','helpdesk_sla_response', 'schedule_immediately').value){		
		record['helpdesk_sla_response.schedule_immediately'] = ondemandPanel.getFieldValue('helpdesk_sla_response.schedule_immediately');
    }    
    
    return record;
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
        var tabs = createSlaPriorityLevelSubTabController.priorityLevelTabs;
        var currentTab = tabs.currentTab;
        var topTabs = createSlaPriorityLevelSubTabController.tabs;
        if (currentTab.newCreated) {
            currentTab.setTitle(topTabs.priorities[currentTab.priority - 1]);
        }
        var res = eval('(' + result.jsonExpression + ')');
        var nextPriority = res.priority + 1;
        
        if (topTabs.priorities[nextPriority - 1]) { // start from 0		
            var nextTabName = "priority_tab_" + nextPriority; // start from 1
            tabs.selectTab(nextTabName ,null, false, false, true);
        }
        else {
            var restriction = new Ab.view.Restriction();
            restriction.addClause('helpdesk_sla_request.activity_type', topTabs.activity_type, '=');
            topTabs.selectTab("ordering", restriction);
        }
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
    var form = View.panels.get('panel_ondemand_response');
    var workTeamId = form.getFieldValue("helpdesk_sla_response.work_team_id");
    //KB3037246 - avoid error if name contain single quotes
    var supervisor = form.getFieldValue("helpdesk_sla_response.supervisor").replace(/\'/g, "''");
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
 * Enable all fields in the step dialog
 */
function enableAllFields(){
    enableField("helpdesk_sla_steps.vn_id");
    enableField("helpdesk_sla_steps.em_id");
    enableField("helpdesk_sla_steps.cf_id");
    enableField("helpdesk_sla_steps.role");
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
 * Enable given field in the step dialog
 * @param {String} field field name
 */
function enableField(field){
    $(field).style.readOnly = false;
    $(field).disabled = false;
}

function hideStepField(field){
    $("dialogRow" + field).style.display = 'none';
}

function showStepField(field){
    //$("dialogRow"+field).style.display = 'inline';
    $("dialogRow" + field).removeAttribute("style");
}

/**
 * Called after an employee is selected for a step<br />
 * Disables fields for craftsperson, vendor and role
 */
function afterSelectEmployee(fieldName, newValue, oldValue){
    document.getElementById(fieldName).value = newValue;
    enableField("helpdesk_sla_steps.em_id");
    disableField("helpdesk_sla_steps.cf_id");
    disableField("helpdesk_sla_steps.vn_id");
    $("helpdesk_sla_steps.role").value = "";
    enableRadioButtons("multiple_required", false);
    document.getElementById("multiple_required_true").checked = false;
    document.getElementById("multiple_required_false").checked = true;
}

/**
 * Called after an employee is selected for a step<br />
 * Disables fields for craftsperson, employee and role
 */
function afterSelectVendor(fieldName, newValue, oldValue){
    document.getElementById(fieldName).value = newValue;
    enableField("helpdesk_sla_steps.vn_id");
    disableField("helpdesk_sla_steps.em_id");
    disableField("helpdesk_sla_steps.cf_id");
    $("helpdesk_sla_steps.role").value = "";
    enableRadioButtons("multiple_required", false);
    document.getElementById("multiple_required_true").checked = false;
    document.getElementById("multiple_required_false").checked = true;
}

/**
 * Called after an employee is selected for a step<br />
 * Disables fields for employee, vendor and role
 */
function afterSelectCraftsperson(fieldName, newValue, oldValue){
    document.getElementById(fieldName).value = newValue;
    enableField("helpdesk_sla_steps.cf_id");
    disableField("helpdesk_sla_steps.em_id");
    disableField("helpdesk_sla_steps.vn_id");
    $("helpdesk_sla_steps.role").value = "";
    enableRadioButtons("multiple_required", false);
    document.getElementById("multiple_required_true").checked = false;
    document.getElementById("multiple_required_false").checked = true;
}

/**
 * Called after an employee is selected for a step<br />
 * Disables fields for craftsperson, vendor and employee
 */
function afterSelectRole(){
    if ($("helpdesk_sla_steps.role").value != "") {
        enableField("helpdesk_sla_steps.role");
        disableField("helpdesk_sla_steps.em_id");
        disableField("helpdesk_sla_steps.vn_id");
        disableField("helpdesk_sla_steps.cf_id");
        enableRadioButtons("multiple_required", true);
    }
    else {
        $("helpdesk_sla_steps.em_id").disabled = false;
        $("helpdesk_sla_steps.vn_id").disabled = false;
        $("helpdesk_sla_steps.cf_id").disabled = false;
        enableRadioButtons("multiple_required", false);
    }
}

/**
 * Retrieve helper rules (steps) from database and create step elements in the form<br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/sla/ServiceLevelAgreementHandler.html#getHelperRules(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getHelperRules</a><br />
 * Called by <a href='#user_form_onload' target='main'>user_form_onload</a>
 */
function getHelperRules(){
    var ordering_seq = responsePanel.getFieldValue('helpdesk_sla_response.ordering_seq');
    var priority = responsePanel.getFieldValue('helpdesk_sla_response.priority');
    var activity_type = responsePanel.getFieldValue('helpdesk_sla_response.activity_type');
    
    ordering_seq = ordering_seq == "" ? "-1" : ordering_seq;
    priority = priority == "" ? "-1" : priority;
    
    var result = {};
    try {
        result = Workflow.callMethod("AbBldgOpsHelpDesk-SLAService-getHelperRules", ordering_seq, priority, activity_type);
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    
    if (result.code == 'executed') {
    
        var res = eval('(' + result.jsonExpression + ')');
        
        for (var i = 0; i < res.length; i++) {
        
            var statusValue = res[i].status;
            
            var ul = document.getElementById(statusValue);
            
            if (ul == "undefined" || ul == null) 
                View.showMessage("ul for status " + statusValue + " not found")
            
            var type = res[i].step_type;
            var step = res[i].step;
            
            var condition = res[i].condition;
            var multiple_required = res[i].multiple_required;
            
            var em_id = res[i].em_id;
            var vn_id = res[i].vn_id;
            var cf_id = res[i].cf_id;
            
            var role = res[i].role;
            
            var notify_responsible = res[i].notify_responsible;
            
            var li = document.createElement("li");
            li.setAttribute("type", type);
            li.setAttribute("category", type);
            li.setAttribute("step", step);
            // li.setAttribute("class", "step");
            li.className = "step"
            
            var txt = step.substring(0, 1).toUpperCase() + step.substring(1, step.length);
            var by = null;
            if (em_id != null && em_id != "") {
                by = em_id;
                li.setAttribute("em_id", em_id);
            }
            else 
                if (vn_id != null && vn_id != "") {
                    by = vn_id;
                    li.setAttribute("vn_id", vn_id);
                }
                else 
                    if (cf_id != null && cf_id != "") {
                        by = cf_id;
                        li.setAttribute("cf_id", cf_id);
                    }
                    else 
                        if (role != null && role != "") {
                            by = role;
                            li.setAttribute("role", role);
                        }
            if (by != null) {
                txt += " " + getMessage("by") + " " + by;
            }
            
            if (condition != null && condition != "") {
                txt += " " + getMessage("when") + " " + getConditionText(res[i].activity_id, condition);
                li.setAttribute("condition", condition);
            }
            
            if (type == 'approval' && role != null && role != "" && multiple_required != null && multiple_required == "1") {
                txt += ", " + getMessage("multipleRequired");
                li.setAttribute("multiple_required", "true");
            }
            else {
                li.setAttribute("multiple_required", "false");
            }
            
            if (type != 'notification' && notify_responsible != null && notify_responsible == 1) {
                li.setAttribute("notify_responsible", "true");
            }
            else {
                li.setAttribute("notify_responsible", "false");
            }
            
            setInnerHTML(li, txt);
            ul.appendChild(li);
        }
        
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 *	get condition text value
 */
function getConditionText(activity_id, condition){
    var parts = condition.split(" ");
    // first condition field
    if (parts.length > 2) {
        parts[0] = getFieldTitle(activity_id, parts[0]);
    }
    // second condition field
    if (parts.length > 5) {
        parts[4] = getFieldTitle(activity_id, parts[4]);
    }
    
    return parts.join(" ");
}

/**
 * 	get descriptive text value for condition field
 */
function getFieldTitle(activity_id, field){
    var fieldTxt = "";
    var options;
    if (activity_id == 'AbBldgOpsHelpDesk') {
        options = helpdeskConditionFields;
    }
    else 
        if (activity_id == 'AbBldgOpsOnDemandWork') {
            options = ondemandConditionFields;
        }
        else {
            return field;
        }
    
    for (i = 0; i < options.length; i++) {
        if (options[i].value == field) 
            return options[i].text;
    }
}

/**
 * Called when an option for the dispatching of a request is selected<br />
 * Enables/Disables fields for supervisor and or trade or adds dispatch step
 * @param {String} type dispatch type (supervisor, work_team_id or dispatch)
 */
function selectDispatching(type){
    var form = View.panels.get('panel_ondemand_response');
    if (type == 'supervisor') {
        form.enableField("helpdesk_sla_response.work_team_id", false);
        form.enableField("helpdesk_sla_response.supervisor", true);
        form.setFieldValue("helpdesk_sla_response.work_team_id", "");
        removeSteps("dispatch", "APPROVED");
        enableButton("dispatch", "APPROVED", false);
    }
    else 
        if (type == 'work_team_id') {
            form.enableField("helpdesk_sla_response.work_team_id", true);
            form.enableField("helpdesk_sla_response.supervisor", false);
            form.setFieldValue("helpdesk_sla_response.supervisor", "");
            removeSteps("dispatch", "APPROVED");
            enableButton("dispatch", "APPROVED", false);
        }
        else {
            enableButton("dispatch", "APPROVED", true);
        }
}

/**
 * Selects radio button and enables/disables fields for dispatching of request
 * Called by <a href='#user_form_onload' target='main'>user_form_onload</a>
 */
function setDispatching(){
    var form = View.panels.get('panel_ondemand_response');
    if (form.getFieldValue("helpdesk_sla_response.supervisor")) {
        dispatch = "supervisor";
        form.enableField("helpdesk_sla_response.work_team_id", false);
        form.enableField("helpdesk_sla_response.supervisor", true);
        enableButton("dispatch", "APPROVED", false);
    }
    else 
        if (form.getFieldValue("helpdesk_sla_response.work_team_id")) {
            dispatch = "work_team_id";
            form.enableField("helpdesk_sla_response.work_team_id", true);
            form.enableField("helpdesk_sla_response.supervisor", false);
            enableButton("dispatch", "APPROVED", false);
        }
        else {
            dispatch = "dispatch";
            form.enableField("helpdesk_sla_response.work_team_id", false);
            form.enableField("helpdesk_sla_response.supervisor", false);
            enableButton("dispatch", "APPROVED", true);
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
    var form = View.panels.get('panel_ondemand_response');
    form.enableField("helpdesk_sla_response.work_team_id", false);
    form.enableField("helpdesk_sla_response.supervisor", false);
    form.setFieldValue("helpdesk_sla_response.work_team_id", "");
    form.setFieldValue("helpdesk_sla_response.supervisor", "");
    enableButton("dispatch", "APPROVED", true);
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

/**
 * Selects radio button and enables/disables fields for assigning of request
 * Called by <a href='#user_form_onload' target='main'>user_form_onload</a>
 */
function setProviders(){
    var form = View.panels.get('panel_providers');
    if (form.getFieldValue("helpdesk_sla_response.em_id")) {
        provider = "em";
        form.enableField("helpdesk_sla_response.em_id", true);
        form.enableField("helpdesk_sla_response.vn_id", false);
        form.enableField("helpdesk_sla_response.activity_id", false);
        enableButton("acceptance", "APPROVED", false);
        
        enableRadioButtons("notify_service_provider", true);
    }
    else 
        if (form.getFieldValue("helpdesk_sla_response.vn_id")) {
            provider = "vn";
            form.enableField("helpdesk_sla_response.em_id", false);
            form.enableField("helpdesk_sla_response.activity_id", false);
            form.enableField("helpdesk_sla_response.vn_id", true);
            enableButton("acceptance", "APPROVED", false);
            
            enableRadioButtons("notify_service_provider", true);
        }
        else 
            if(form.getFieldValue("helpdesk_sla_response.activity_id")){
            	provider = "afm_activities";
                form.enableField("helpdesk_sla_response.em_id", false);
                form.enableField("helpdesk_sla_response.vn_id", false);
                form.enableField("helpdesk_sla_response.activity_id", true);
                enableButton("acceptance", "APPROVED", false);
                
                enableRadioButtons("notify_service_provider", true);
            }
            else {
            	var requestType = responsePanel.getFieldValue('helpdesk_sla_response.activity_type');
            	//KB3032157 - set default service provider for 'SERVICE DESK - GROUP MOVE' 'SERVICE DESK - INDIVIDUAL MOVE' and 'SERVICE DESK - DEPARTMENT SPACE'
            	if(requestType == 'SERVICE DESK - GROUP MOVE' || requestType == 'SERVICE DESK - INDIVIDUAL MOVE'){
            		provider = "afm_activities";
                    form.enableField("helpdesk_sla_response.em_id", false);
                    form.enableField("helpdesk_sla_response.vn_id", false);
                    form.enableField("helpdesk_sla_response.activity_id", true);
                    enableButton("acceptance", "APPROVED", false);
                    
                    enableRadioButtons("notify_service_provider", true);
            	} else if(requestType == 'SERVICE DESK - DEPARTMENT SPACE' ){
            		 provider = "em";
            	        form.enableField("helpdesk_sla_response.em_id", true);
            	        form.enableField("helpdesk_sla_response.vn_id", false);
            	        form.enableField("helpdesk_sla_response.activity_id", false);
            	        enableButton("acceptance", "APPROVED", false);
            	        
            	        enableRadioButtons("notify_service_provider", true);
            	}else{
            		provider = "accept";
    	            form.enableField("helpdesk_sla_response.em_id", false);
    	            form.enableField("helpdesk_sla_response.vn_id", false);
    	            enableButton("acceptance", "APPROVED", true);
    	            
    	            enableRadioButtons("notify_service_provider", false);
            	}
            }
    
    var buttons = document.getElementsByName("serviceProvider");
    for (i = 0; i < buttons.length; i++) {
        if (buttons[i].value == provider) {
            buttons[i].checked = true;
        }
        else {
            buttons[i].checked = false;
        }
    }
    
}

/**
 * Called after an acceptance step is added<br />
 * Disables and empties fields for employee and vendor<br />
 */
function afterAddAcceptance(){
    var form = View.panels.get('panel_providers');
    form.enableField("helpdesk_sla_response.em_id", false);
    form.enableField("helpdesk_sla_response.vn_id", false);
    form.setFieldValue("helpdesk_sla_response.vn_id", "");
    form.setFieldValue("helpdesk_sla_response.em_id", "");
    enableButton("acceptance", "APPROVED", true);
    enableRadioButtons("notify_service_provider", false);
    
    var buttons = document.getElementsByName("serviceProvider");
    for (i = 0; i < buttons.length; i++) {
        if (buttons[i].value == "accept") {
            buttons[i].checked = true;
        }
        else {
            buttons[i].checked = false;
        }
    }
}

/**
 * Called when an option for the assignment of a request to a service provider is selected<br />
 * Enables/Disables fields for employee and or vendor or adds acceptance step
 * @param {String} provider em, vn or accept)
 */
function selectServiceProvider(provider){
    var form = View.panels.get('panel_providers');
    if (provider == 'vn') {
        form.enableField("helpdesk_sla_response.em_id", false);
        form.setFieldValue("helpdesk_sla_response.em_id", "");
        form.enableField("helpdesk_sla_response.activity_id", false);
        form.setFieldValue("helpdesk_sla_response.activity_id", "");
        form.enableField("helpdesk_sla_response.vn_id", true);
        enableButton("acceptance", "APPROVED", false);
        removeSteps("acceptance", "APPROVED");
        
        enableRadioButtons("notify_service_provider", true);
    }
    else 
        if (provider == 'em') {
            form.enableField("helpdesk_sla_response.vn_id", false);
            form.setFieldValue("helpdesk_sla_response.vn_id", "");
            form.enableField("helpdesk_sla_response.activity_id", false);
            form.setFieldValue("helpdesk_sla_response.activity_id", "");
            form.enableField("helpdesk_sla_response.em_id", true);
            enableButton("acceptance", "APPROVED", false);
            removeSteps("acceptance", "APPROVED");
            
            enableRadioButtons("notify_service_provider", true);
        }
        else
        	if (provider == 'afm_activities'){//add for 20.1 space transaction
        		form.enableField("helpdesk_sla_response.em_id", false);
                form.setFieldValue("helpdesk_sla_response.em_id", "");
                form.enableField("helpdesk_sla_response.vn_id", false);
                form.setFieldValue("helpdesk_sla_response.vn_id", "");
                form.enableField("helpdesk_sla_response.activity_id", true);
                enableButton("acceptance", "APPROVED", false);
                removeSteps("acceptance", "APPROVED");
                
                enableRadioButtons("notify_service_provider", true);
            }
}

/**
 *		Enable or disable a single button
 */
function enableButton(stepType, state, enabled){
    var button = document.getElementById("btn_" + stepType + "_" + state);
    if (button == null) 
        return;
    if (enabled) {
        button.removeAttribute("disabled");
    }
    else {
        button.disabled = "true";
    }
}

/**
 *		Enable or disable all buttons for a state
 */
function enableButtons(state, enabled){
    var buttonContainer = document.getElementById("buttons_" + state);
    var buttons = buttonContainer.getElementsByTagName("input");
    for (i = 0; i < buttons.length; i++) {
        if (buttons[i].type == 'button') {
            if (enabled) {
                buttons[i].removeAttribute("disabled");
            }
            else {
                buttons[i].disabled = "true";
            }
        }
    }
}

/**
 *	Remove a step in a state
 **/
function removeSteps(stepType, state){
    var container = $(state);
    if (stepType == null || checkChildren(container, stepType)) {
        var children = YAHOO.util.Dom.getElementsByClassName("step", "li", container);
        for (i = 0; i < children.length; i++) {
            if (stepType == null || children[i].getAttribute("type") == stepType) {
                container.removeChild(children[i]);
            }
        }
    }
}

function getConditionFields(activity_id){

    var result = {};
    try {
        result = Workflow.callMethod("AbBldgOpsHelpDesk-StepService-getStepConditionFieldsForActivity", activity_id);
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    if (result.code == 'executed') {
        var res = eval('(' + result.jsonExpression + ')');
        return res;
    }
    else {
        Workflow.handleError(result);
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

/**
 * A work request can be automatically issued if the work order is automatically created
 * and if a craftsperson (and default time to work) is entered (=> autoscheduling included)
 */
function onSetAutoIssue(value, loading){
    var form = View.panels.get('panel_ondemand_response');
    
    //autoissue includes autoschedule
    //set_value('helpdesk_sla_response.autoschedule', value);
    form.setFieldValue('helpdesk_sla_response.autoschedule', value);
    
    if (value > 0) {//auto_issue = yes
        //check if request is autodispatched
        if (!checkAutoDispatch()) {
            //set_value('helpdesk_sla_response.autoissue', 0);
            form.setFieldValue('helpdesk_sla_response.autoissue', 0);
            setRadioButton("autoissue", "helpdesk_sla_response.autoissue", "panel_ondemand_response");
            return;
        }
        
        //check steps on A and AA + disable buttons
        if (loading || confirm(getMessage("removeStepsAA"))) {
            //remove steps on wr status A and AA
            removeSteps(null, "A");
            removeSteps(null, "AA");
            
            //disable step button
            enableButtons("A", false);
            enableButtons("AA", false);
            enableButton("dispatch", "APPROVED", false);
            
            //set and disable all other to buttons
            //set_value('helpdesk_sla_response.autocreate_wo', 1);
            //set_value('helpdesk_sla_response.autocreate_wr', 1);
            //set_value('helpdesk_sla_response.autoschedule', 1);
            //set_value('helpdesk_sla_response.autodispatch', 1);
            
            form.setFieldValue('helpdesk_sla_response.autocreate_wo', 1);
            form.setFieldValue('helpdesk_sla_response.autocreate_wr', 1);
            form.setFieldValue('helpdesk_sla_response.autoschedule', 1);
            form.setFieldValue('helpdesk_sla_response.autodispatch', 1);
            
            setRadioButton("autocreate_wo", "helpdesk_sla_response.autocreate_wo", "panel_ondemand_response");
            //setRadioButton("autocreate_wr", "helpdesk_sla_response.autocreate_wr", "panel_ondemand_response");
            
            //enableRadioButtons("autocreate_wr", false);
            enableRadioButtons("autocreate_wo", false);
            
            //disable dispatch by step
            var buttons = document.getElementsByName("dispatching");
            buttons[2].disabled = true;
        }
        
    }
    else {//auto_issue = no
        //enable other auto buttons
        enableRadioButtons("autocreate_wo", true);
        
        //enable step buttons for status AA
        enableButtons("AA", true);
    }
}

/**
 * Automatic creation of a work order is possible if the work request is automatically created
 */
function onSetAutocreateWO(value, loading){
    var form = View.panels.get("panel_ondemand_response");
    if (value > 0) {//autocreate_wo = yes
        //set + disable buttons for autocreateWO and dispatch step
        if (!checkAutoDispatch()) {
            //set_value('helpdesk_sla_response.autocreate_wo', 0);
            form.setFieldValue('helpdesk_sla_response.autocreate_wo', 0);
            setRadioButton("autocreate_wo", "helpdesk_sla_response.autocreate_wo", "panel_ondemand_response");
            return;
        }
        
        //if not loading for the first time, ask confirmation to remove all steps in status wr approved
        if (loading || confirm(getMessage("removeStepsA"))) {
            //check steps on A + disable buttons, steps on status A cannot be added, nor dispatch step(s)
            removeSteps(null, "A");
            enableButtons("A", false);
            enableButton("dispatch", "APPROVED", false);
            
            //set values + radiobuttons for autocreateWR and autodispatch
            //set_value('helpdesk_sla_response.autocreate_wr', 1);
            //set_value('helpdesk_sla_response.autodispatch', 1);
            form.setFieldValue('helpdesk_sla_response.autocreate_wr', 1);
            form.setFieldValue('helpdesk_sla_response.autodispatch', 1);
            //setRadioButton("autocreate_wr", "helpdesk_sla_response.autocreate_wr", "panel_ondemand_response");
            
            //enableRadioButtons("autocreate_wr", false);
            
            //disable radiobutton for dispatch step
            var buttons = document.getElementsByName("dispatching");
            buttons[2].disabled = true;
        }
    }
    else {//autocreate_wo = no
        //enable other buttons
        //enableRadioButtons("autocreate_wr", true);
        enableButtons("A", true);
        
        //disable radiobutton for dispatch step
        var buttons = document.getElementsByName("dispatching");
        buttons[2].disabled = false;
    }
}

/**
 * Automatic creation of a work request is only possible if the request
 * is auto-dispatched to a supervisor or workteam
 */
function onSetAutocreateWR(value){
	//KB3041838 - for v21.2 autocreate_wr will always be saved as Yes, so do nothing when check this radio.
	return;
	
    var form = View.panels.get("panel_ondemand_response");
    if (value > 0) { //autocreate_wr = yes
        //check dispatch step + disable button
        if (!checkAutoDispatch()) {
            //set_value('helpdesk_sla_response.autocreate_wr', 0);
            //form.setFieldValue('helpdesk_sla_response.autocreate_wr', 0);
            //setRadioButton("autocreate_wr", "helpdesk_sla_response.autocreate_wr", "panel_ondemand_response");
            return;
        }
        
        //disable button for dispatch step
        var buttons = document.getElementsByName("dispatching");
        buttons[2].disabled = true;
        
        if (buttons[0].checked) {
            form.enableField("helpdesk_sla_response.supervisor", true);
            form.enableField("helpdesk_sla_response.work_team_id", false);
        }
        if (buttons[1].checked == true) {
            form.enableField("helpdesk_sla_response.work_team_id", true);
            form.enableField("helpdesk_sla_response.supervisor", false);
        }
        
        
        //dispatch steps cannot be added
        enableButton("dispatch", "APPROVED", false);
    }
    else { //autocreate_wr = no
        //enable all radiobuttons for dispatch
        var buttons = document.getElementsByName("dispatching");
        buttons[0].removeAttribute("disabled");
        buttons[1].removeAttribute("disabled");
        buttons[2].removeAttribute("disabled");
        
        //dispatch steps can be added
        enableButton("dispatch", "APPROVED", true);
        
        if (buttons[0].checked) {
            form.enableField("helpdesk_sla_response.supervisor", true);
            form.enableField("helpdesk_sla_response.work_team_id", false);
        }
        if (buttons[1].checked) {
            form.enableField("helpdesk_sla_response.supervisor", false);
            form.enableField("helpdesk_sla_response.work_team_id", true);
        }
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

function onSelectConditionValue(fieldName, fieldValueName){
    if (document.getElementById(fieldName).value != "") {
        var activityId = dropContainer.getAttribute("activity");
        var conditionValue = document.getElementById(fieldName).value;
        
        var result = {};
        try {
            result = Workflow.callMethod("AbBldgOpsHelpDesk-StepService-getSelectValueForConditionField", activityId, conditionValue);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
        if (result.code == 'executed') {
            var res = eval('(' + result.jsonExpression + ')');
            if (res.table != undefined && res.field != undefined) {
                View.selectValue('panel_response', '', [fieldValueName], res.table, [res.table + "." + res.field], [res.table + "." + res.field], null, afterSelectConditionValue);
            }
            else {
                return;
            }
        }
        else {
            Workflow.handleError(result);
        }
    }
    else {
        View.showMessage(getMessage("selectConditionField"));
    }
}

function afterSelectConditionValue(fieldName, newValue, oldValue){
    $(fieldName).value = newValue;
}

function selectServiceContract(){
    View.selectValue('panel_response', getMessage('serviceContract'), ['helpdesk_sla_response.servcont_id'], 'servcont', ['servcont.servcont_id'], ['servcont.servcont_id', 'servcont.description', 'servcont.date_expiration'])
}

function selectVCraftsperson(){
    View.selectValue('', getMessage('craftsperson'), ['helpdesk_sla_steps.cf_id'], 'cf', ['cf.cf_id'], ['cf.cf_id', 'cf.name', 'cf.tr_id', 'cf.work_team_id'], null, afterSelectCraftsperson)
}

function selectVendor(form){
    View.selectValue('', getMessage('vendor'), ['helpdesk_sla_steps.vn_id'], 'vn', ['vn.vn_id'], ['vn.vn_id', 'vn.company', 'vn.city', 'vn.description'], null, afterSelectVendor)
}

function setFormFieldValue(panelId, filedName, value){
    View.panels.get(panelId).setFieldValue(filedName, value);
}

function selectSupervisor(){
    View.selectValue("panel_ondemand_response", getMessage('supervisor'), ['helpdesk_sla_response.supervisor'], 'em', ['em.em_id'], ['em.em_id', 'em.em_std', 'em.email'], 'EXISTS (select cf_id from cf where cf.email = em.email AND cf.is_supervisor = 1)');
}

