/**
 * Declare the namespace for the form JS classes.
 */
 Ab.namespace('val');


/**
 * Class that holds the form fields validation results.
 */
 Ab.val.Validator = Base.extend({  
 	// @begin_translatable
 	z_CONFIRM_PROMPT_ADDNEW_MESSAGE1: "This value does not exist: '",
 	z_PROMPT_ADDNEW_MESSAGE2: "'.  If this is in error, press Cancel.  Or, to add this as a new value, enter a description for this code and press OK.",
 	z_CONFIRM_ADDNEW_MESSAGE2: "'. If this is in error, press Cancel.  Or, to add this as a new category value, press OK.",
 	z_VALUE: "Value '",
 	z_SAVED: "' saved.",
 	// @end_translatable
 	
 	fieldsToValidate: [],
 	
 	descFields: [],
 	
 	statuses: [],
 	
 	pass: true,
 	
 	constructor: function() { 
 		this.invalidFields = {};  
 	},


	/**
     * Adds fields that are to be validated
     * @param {fields} A list of fields that are to be validated against a specific table
     * @param {descField} Name of a description field (Optional)
     */
     addFieldsToValidate : function( fields, descField ) {
     	this.fieldsToValidate.push(fields);
     	this.descFields.push(descField)
	},    	


    /**
     * Loops through all fields that are to validated.  If it finds a field that has a bad validating value,
     * pop up a validation dialog.  If all fields pass validation, saves the record in the form.
     * @param {formId}  Id of the form panel.
     */
     validate : function(formId) {
     	var form = 	Ab.view.View.getControl('', formId);
     	form.validationResult.valid = false;
     	this.statuses.length = 0;
     	
     	for (var x=0; x < this.fieldsToValidate.length; x++){
     		var fields = this.fieldsToValidate[x];
     		var fieldNamesStr = "";
     		var restrictionStr = new Ab.view.Restriction();
     		var count = 0;
     		var record = {};
     		
     		for (i in fields){
     			var temp = fields[i].split('.');
     			var table_name = temp[0];
     			var field_name = temp[1];
     			var value = form.getFieldValue(i);
     			
     			record[table_name + '.' + field_name] = value;
     			
     			if (count == 0){
     				fieldNamesStr += "[" + table_name + '.' + field_name + "]";	
     			} else {
     				fieldNamesStr += ", [" + table_name + '.' + field_name + "]";
     			}
     			
     			restrictionStr.addClause(table_name + "." + field_name, value, '=');
     		}
     		
     		var parameters = {
     			tableName: table_name,
     			fieldNames: fieldNamesStr,
     			restriction: toJSON(restrictionStr) 
     		};
     		
     		var result = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
     		
     		if (result.code == 'executed') {
     			// If there were records returned, then there is no need to add record 
     			if (result.data.records.length == 0){
     				// Confirmation Message
     				var descField = this.descFields[x];
     				
     				if (descField != undefined){
     					var button = prompt( Ab.view.View.getLocalizedString(this.z_CONFIRM_PROMPT_ADDNEW_MESSAGE1) + value + Ab.view.View.getLocalizedString(this.z_PROMPT_ADDNEW_MESSAGE2), '');
     					record[table_name + '.' + this.descFields[x]] = button;
     					
     				} else {
     					var button = confirm(Ab.view.View.getLocalizedString(this.z_CONFIRM_PROMPT_ADDNEW_MESSAGE1) + value + Ab.view.View.getLocalizedString(this.z_CONFIRM_ADDNEW_MESSAGE2));
     				}	
     				
     				if (button == null) {
     					this.statuses.push(null);
     				} else{
     					// Else save validating record
     					var parameters = {
     						tableName: table_name,
     						fields: toJSON(record)
     					};	
     					
     					var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', parameters);	
     					if (result.code == 'executed') {
     						var messageCell = form.getMessageCell();
     						var savedMessage= '   ' + Ab.view.View.getLocalizedString(this.z_VALUE) + value + Ab.view.View.getLocalizedString(this.z_SAVED) + "<br/>";
     						var messageElement = Ext.DomHelper.append(form.getMessageCell(), '<p>' + savedMessage + '</p>', true);
     						messageElement.setHeight(1, {duration: 1});
     						messageElement.setVisible(false, {duration: 0.20});	
     						form.dismissMessage.defer(1000, form, [messageElement]);
     						this.statuses.push(true);
     					} else {
     						View.showMessage(result.message);
     						this.statuses.push(false);
     					}	 
     				}
     			}		
										
        	} else {
        		View.showMessage(result.message);
        		this.statuses.push(false);
        	}	
        	
        	count = count + 1;
        }
        
        for (var y=0; y < this.statuses.length; y++){
        	if (this.statuses[y] == false){
        		this.pass = false;
        	}

    	 	if (this.statuses[y] != undefined){
    	 		form.newRecord = true;
    	 	}
  		} 
  		
  		if (this.pass == true){
  			form.validationResult.valid = true;	
  		} 
  	}  
        	           
});












	