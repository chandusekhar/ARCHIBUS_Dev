/**
 * @fileoverview Javascript functions for <a href='../../../../viewdoc/overview-summary.html#ab-create-activitytype-general.axvw' target='main'>ab-create-activitytype-general.axvw</a>
 */
var typeEditController = View.createController("typeEditController", {

    /**
     * Called when loading the form<br />
     * Set request type name (Remove SERVICE DESK from value, because this is already shown in the form)<br />
     * Set fields to hide<br />
     * Set questionnaire
     */
    panelNext_afterRefresh: function(){
    	
    	 document.getElementById("questionnaire").checked = false;
         document.getElementById("location").checked = false;
         document.getElementById("eq_id").checked = false;
         document.getElementById("doc").checked = false;
         document.getElementById("date").checked = false;
         
        if (this.panelNext.newRecord) {
            this.panelHidden.refresh({}, true);
			document.getElementById("activity").value = "";
        }
        else {
            if (valueExists(this.panelNext.restriction)) {
                //sync refresh the panelHidden panel
                var record = this.panelNext.getRecord();
                this.panelHidden.setRecord(record);
                
                //
                // remove 'SERVICE DESK - ' from value
                $("activity").value = this.panelNext.getFieldValue("activitytype.activity_type").substr(15, 50);
                
                setHideFields();
                setQuestionnaire();
            }
        }
    }
});


/**
 * Save activitytype<br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/helpdesk/ActivityHandler.html#saveActivity(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-saveActivity</a><br />
 * Called by 'Next' button<br />
 * Creates restriction for next tab and selects next tab:
 * <ul>
 * 	<li>If the checkbox for questionnaire is checked: 'Questionnaire' tab</li>
 * 	<li>Else if the ondemand request type is used (SERVICE DESK - MAINTENANCE):'Problem Types' tab</li>
 * 	<li>Else 'Select' tab</li>
 * </ul>
 * @param {String} form submitted form
 */
function onNext(){
    var panelNext = View.panels.get('panelNext');
    var record = ABHDC_getDataRecord2(panelNext);
    var quest = document.getElementById("questionnaire").checked;
	
    try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-ActivityService-saveActivity', record, quest);
	}catch(e){
		Workflow.handleError(e);
	}
    
    if (result.code == 'executed') {
        var activity_type = panelNext.getFieldValue("activitytype.activity_type");
        top.window.activity_type = activity_type;
        var tabs = View.getControl('', 'typeTabs');
        if (quest) {
            var restriction = new Ab.view.Restriction();
            restriction.addClause('questionnaire.questionnaire_id', activity_type, "=");
            
            tabs.selectTab('quest', restriction, false);
        }
        else {
            tabs.selectTab('select');
        }
        
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Sets activity_type name<br />
 * Called when the form field with id activity is changed
 */
function setActivityType(){
    var panelNext = View.panels.get("panelNext");
    panelNext.setFieldValue("activitytype.activity_type", "SERVICE DESK - " + document.getElementById("activity").value.toUpperCase());
    document.getElementById("activity").value = document.getElementById("activity").value.toUpperCase();
}


/**
 * Changes value of activitytype.hide_fields according to checked checkboxes<br />
 * Called when one of the checkboxes is checked or unchecked
 * @param {boolean} checked checkbox checked or not
 * @param {String} value value of checkbox
 */
function onCheckField(checked, value){
    var panel = View.panels.get('panelHidden');
    var hidefields = panel.getFieldValue("activitytype.hide_fields");
    
    if (checked) {
        panel.setFieldValue("activitytype.hide_fields", hidefields + value + ";");
    }
    else {
        var array = hidefields.split(";");
        var fields = "";
        for (i = 0; i < array.length; i++) {
            if (value.match(array[i]) == null) {
                fields += array[i] + ";";
            }
        }
        panel.setFieldValue("activitytype.hide_fields", fields);
    }
}

/**
 * Checks field to hide<br />
 * Called by <a href='#user_form_onload' target='main'>user_form_onload</a>
 */
function setHideFields(){
    var location_fields = "site_id;bl_id;fl_id;rm_id";
    var equipment_fields = "eq_id";
    var document_fields = "doc1;doc2;doc3;doc4";
    var datetime_fields = "date_required;time_required";
    
    var fields = View.panels.get('panelHidden').getFieldValue("activitytype.hide_fields");
    
    if (fields.indexOf(location_fields) >= 0) {
        document.getElementById("location").checked = true;
    }
    
    if (fields.indexOf(equipment_fields) >= 0) {
        document.getElementById("eq_id").checked = true;
    }
    
    if (fields.indexOf(document_fields) >= 0) {
        document.getElementById("doc").checked = true;
    }
    
    if (fields.indexOf(datetime_fields) >= 0) {
        document.getElementById("date").checked = true;
    }
}

/**
 * Checks questionnaire checkbox when loading the form if necessary<br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/helpdesk/CommonHandler.html#getStatistic(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getStatistic</a> to get the number of questions for the current request type<br />
 * Called by <a href='#user_form_onload' target='main'>user_form_onload</a>
 */
function setQuestionnaire(){
    var activityType = View.panels.get('panelNext').getFieldValue('activitytype.activity_type');
	var sql = "questionnaire_id = '" + activityType + "'";
	
	try {
		var result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getStatistic", 'quest_name','questions','count',sql);
	}catch(e){
		Workflow.handleError(e);
	}
    
    if (result.code == 'executed') {
        var res = eval('(' + result.jsonExpression + ')');
        if (res.statistic > 0) {
            document.getElementById("questionnaire").checked = true;
        }
    }
    else {
        Workflow.handleError(result);
    }
}
