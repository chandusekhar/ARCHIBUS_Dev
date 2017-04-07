var formController = View.createController('formWithValidation', {
	// Initialize validation object
	validatorForThisForm: null,
	
	afterInitialDataFetch: function() {	
		var panel = Ab.view.View.getControl('', 'validationOnSave_detailsPanel');
		
		if (panel){
			panel.addEventListener('beforeSave', this.beforeSave.createDelegate(this));
			validatorForThisForm = new Ab.val.Validator(); 
			
			// Tell the validator which fields (control id's) of the form to validate, and against which tables and fields
			// (e.g. bl.bl_id).  The first parameter (required) will be hashTable object which holds paired Form field input id 
			// and its corresponding schema field full name.  The second parameter (optional) allows the user to enter a
			// corresponding description value.
			
			// Tell to validate against bl_id in bl table first.  If the bl_id does not exist, allow user to fill in bl.name field 
			// as description in prompt box.
			validatorForThisForm.addFieldsToValidate({'rm.bl_id':'bl.bl_id'}, 'name');  			
			
			// Tell to validate against bl_id and fl_id in fl table.  If the fl_id does not exist, display confirm box.  
			// Do not allow description.
			validatorForThisForm.addFieldsToValidate({'rm.bl_id':'fl.bl_id', 'rm.fl_id':'fl.fl_id'}); 
		}
	}, 
	
	beforeSave: function(){
		// Perform validation on click of Save button.  If all of the fields pass validation, continue with save.
		// If any field fails validation, display error.  Parameter (required) is the form panel id.
		validatorForThisForm.validate('validationOnSave_detailsPanel');			
	}     
})
