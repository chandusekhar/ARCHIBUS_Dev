
/**
 * Add 'trim' function to 'String' object
 */
String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g,'');
};


/**
 * Append a string pattern at the beginning of field value , if that pattern didn't exists already 
 * 
 * @param {Object} panel
 * @param {Object} fieldName
 * @param {Object} pattern
 */
function setPatternToField(panel, fieldName, pattern){
	var fieldValue = panel.getFieldValue(fieldName);
	if(pattern.trim() != fieldValue.substring(0,pattern.length).trim()){
		panel.setFieldValue(fieldName, pattern+fieldValue);
	}
}


/**
 * Functionality for 'Save' action. 
 * 
 * @param fieldValue
 * @param formPanel
 * @param gridPanel
 * @param pattern
 */
function saveForm(fieldName, formPanel, gridPanel, pattern){
	var fieldValue = formPanel.getFieldValue(fieldName);
	if(fieldValue == pattern || !fieldValue){
		
		var message = getMessage("invalidValue") + " [" + formPanel.fields.get(fieldName).fieldDef.title + "]";
		View.showMessage(message);
		return;
	}
	
	formPanel.save();
	gridPanel.refresh();
}

function selectHpattern(panelId, field){
	View.hpatternPanel = View.panels.get(panelId);
	View.hpatternField = field;
    View.patternString = View.hpatternPanel.getFieldValue(field);
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}

