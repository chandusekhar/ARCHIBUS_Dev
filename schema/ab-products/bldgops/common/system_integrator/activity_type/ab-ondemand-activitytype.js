
var activityTypeController = View.createController("activityTypeController", {

    /**
     * Called when loading the form<br />
     * Copy questionnaire id and request type from opening window
     */
    panel_requestType_afterRefresh: function(){
		var record = this.panel_requestType.getRecord();
        this.panel_hideFields.setRecord(record);
		setHideFields();
    }
});

/**
* Changes value of activitytype.hide_fields according to checked checkboxes<br />
* Called when one of the checkboxes is checked or unchecked
* @param {boolean} checked checkbox checked or not
* @param {String} value value of checkbox
*/
function onCheckField(checked, value){
	var panel = View.panels.get('panel_requestType');
	var hidefields = panel.getFieldValue("activitytype.hide_fields");
	
	if(checked){
		panel.setFieldValue("activitytype.hide_fields",hidefields+value+";");
	} else {
		var array = hidefields.split(";");
		var fields = "";
		for(i=0;i<array.length;i++){
			if(value.match(array[i]) == null){
				fields += array[i]+";";
			}
		}
		panel.setFieldValue("activitytype.hide_fields",fields);
	}
}

/**
 * Checks field to hide<br />
 * Called by <a href='#user_form_onload' target='main'>user_form_onload</a>
 */
function setHideFields() {	
	var location_fields = "site_id;bl_id;fl_id;rm_id";
	var equipment_fields = "eq_id";
	var document_fields = "doc1;doc2;doc3;doc4";
	var datetime_fields = "date_required;time_required";
		
	var fields = View.panels.get('panel_requestType').getFieldValue("activitytype.hide_fields");	
	
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