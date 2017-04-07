var addNewPropertyController = View.createController('addNewProperty',{
	isDialog: false,
	
	afterInitialDataFetch:function(){
		this.formProperty.refresh({}, true);
		//KB3030908
		//this.addEmptyOption();
		this.formProperty.setFieldValue('grp_trans.user_name_requestor', View.user.name);
		if(this.view.parameters != null && this.view.parameters['isDialog']!= null){
			this.isDialog = this.view.parameters['isDialog'];
		}
	},
	formProperty_onSave:function(){
		this.formProperty.clearValidationResult();
		var valDescription = this.formProperty.getFieldValue('grp_trans.description_of_change');
		var valUniqueidentifier = this.formProperty.getFieldValue('grp_trans.unique_identifier');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('grp_trans.unique_identifier',valUniqueidentifier, '=');
		var records = this.dsProperties.getRecords(restriction);
		if(valUniqueidentifier == ''){
			this.formProperty.addInvalidField('grp_trans.unique_identifier', getMessage('error_unique_identifier'));
			this.formProperty.displayValidationResult();
			return;
		}else if(records.length > 0){
			this.formProperty.addInvalidField('grp_trans.unique_identifier', getMessage('error_unique_identifier_exist'));
			this.formProperty.displayValidationResult();
			return;
		}else if(valDescription == '' || valDescription == 'Initial entry for property'){
			this.formProperty.addInvalidField('grp_trans.description_of_change', getMessage('error_description_of_change'));
			this.formProperty.displayValidationResult();
			return;
		}
		else if(!this.checkEnumerationFields()){
			return;
		} else if(!this.checkL27PersonnelFields()
				|| !this.checkRequiredFieldWhenOtherIsYes("grp_trans.dispos_anticipated", "grp_trans.dispos_anticipated_method")
				|| !this.checkRequiredFieldWhenOtherIsYes("grp_trans.excess_is_anticipated", "grp_trans.excess_anticipated_year")
				|| !this.checkRequiredFieldWhenOtherIsYes("grp_trans.sale_candidate", "grp_trans.sale_anticipated_year")){
			return;
		}
		else{
			if(this.formProperty.canSave()){
				var ds = this.formProperty.getDataSource();
				var values = {};
				for(var i=0;i<this.formProperty.fields.length;i++){
					var key = this.formProperty.fields.keys[i];
					if(valueExistsNotEmpty(this.formProperty.getFieldValue(key))){
						if (key == 'grp_trans.trans_type') {
							values[key] = 'INSERT';
						}
						else {
							var fieldValue = this.processFieldValue(this.formProperty, key); 
							if (valueExistsNotEmpty(fieldValue)) {
								values[key] = this.formProperty.getFieldValue(key);
							}
						}
					}
				}
				var record = new Ab.data.Record(values, true);
				var dbRecord = ds.processOutboundRecord(record);
				
				try{
					/*
			         * 06/15/2010 IOAN Kb 3028001 changed to custom query because the some enumeration list
			         * fields come with a default value and are not saved for new record
			         */
					var result = Workflow.callMethod('AbRPLMGovPropertyRegistry-GovPropertyRegistryService-insertItemGovPropRegData', dbRecord);
					//ds.saveRecord(record);
				}catch(e){
					/*
					 * 04/09/2010 IOAN kb 3026928
					 * changed from Workflow.handleError to View.showMessage
					 */
					View.showMessage('error', e.message, e.detailedMessage, e.data);
					return;
				}
			}
			
			if(this.isDialog){
				View.getOpenerView().panels.get('gridPropertyList').refresh();
				View.getOpenerView().closeDialog();
			}else{
				this.propertyId = this.formProperty.getFieldValue('grp_trans.unique_identifier');
				this.formProperty.refresh(null, true);
				//KB3030908
				//this.setEmptyOption();
				this.formProperty.setFieldValue('grp_trans.user_name_requestor', View.user.name);
			}
		}
	},
	
	processFieldValue: function(form, field){
		var value = null;
		var fieldDef = form.fields.get(field).fieldDef
		if (fieldDef.isEnum && !fieldDef.required) {
			if (form.getFieldValue(field) != fieldDef.defaultValue) {
				value = form.getFieldValue(field);
			}
			
		} else {
			value = form.getFieldValue(field);
		}
		return value;
	},
	
	checkEnumerationFields: function(){
		if(!this.checkEnumerationField('grp_trans.legal_interest_ind', 'Z')
			|| !this.checkEnumerationField('grp_trans.lease_maintenance_ind', 'Z')
			|| !this.checkEnumerationField('grp_trans.lease_authority_id', 'NA')
			|| !this.checkEnumerationField('grp_trans.status_indicator', 'Z')
			|| !this.checkEnumerationField('grp_trans.outgrant_indicator', 'Z')
			|| !this.checkEnumerationField('grp_trans.historical_status', '0')
			|| !this.checkEnumerationField('grp_trans.size_unit_of_measure', '0')
			|| !this.checkEnumerationField('grp_trans.utilization', '0')
			|| !this.checkEnumerationField('grp_trans.mission_dependency', '0')
			|| !this.checkEnumerationField('grp_trans.disposition_method_id', 'NA')
			|| !this.checkEnumerationField('grp_trans.sustainability', '4'))
			return false;
		else
			return true;
	},
	checkEnumerationField: function(field, value){
		if(this.formProperty.getFieldValue(field) == value){
			this.formProperty.addInvalidField(field, getMessage('error_field_empty'));
			this.formProperty.displayValidationResult();
			return false;
		}
		return true;
	},
	
	/**
	 * This data element is required for all Office and Laboratory Building leases.
	 * Field "Number of Federal Teleworking Employees (27.c)" is required to be less than or equal number submitted for  "Number of Federal Employees (27.a)"
	 * @returns true if the fields are valid
	 */
	checkL27PersonnelFields: function(){
		var form = this.formProperty;
		var l27a_id = "grp_trans.count_emp_fed";
		var l27b_id = "grp_trans.count_emp_contractor";
		var l27c_id = "grp_trans.count_emp_fed_telework";
		var l27a = form.getDataSource().parseValue(l27a_id, form.getFieldValue(l27a_id), false);
		var l27b = form.getDataSource().parseValue(l27b_id, form.getFieldValue(l27b_id), false);
		var l27c = form.getDataSource().parseValue(l27c_id, form.getFieldValue(l27c_id), false);
		var realPropType = form.getFieldValue("grp_trans.grp_type_id");
		var realPropUse = form.getFieldValue("grp_trans.grp_use_id");
		var leaseInterestIndicator = form.getFieldValue("grp_trans.legal_interest_ind");
		var message = "";
		
		if(realPropType == "35"
			&& (realPropUse == "10" || realPropUse == "74")
			&& leaseInterestIndicator == "L"){
			
			message = getMessage("error_field_empty_L27");
			var returnFalse = false;
			
			if(!(l27a > 0)){
				form.addInvalidField(l27a_id, message);
				returnFalse = true;
			}

			if(!(l27b > 0)){
				form.addInvalidField(l27b_id, message);
				returnFalse = true;
			}

			if(!(l27c > 0)){
				form.addInvalidField(l27c_id, message);
				returnFalse = true;
			}
			
			if(returnFalse){
				form.displayValidationResult();
				return false;
			}
		}
		
		// the number of teleworking employees must be less or equal to the number of employees
		if(l27c > l27a){
			message = getMessage("error_teleworking_employees");
			message = message.replace("{0}", form.fields.get(l27a_id).fieldDef.title);
			form.addInvalidField(l27c_id, message);
			form.displayValidationResult();
			return false;
		}
		
		return true;
	},
	
	/**
	 * Checks if required field is filled when other (boolean) is 'Yes'.
	 * @returns true if the field is filled, false otherwise
	 */
	checkRequiredFieldWhenOtherIsYes: function(booleanFieldId, requiredFieldId){
		var form = this.formProperty;
		var booleanFieldValue = form.getFieldValue(booleanFieldId);
		var requiredFieldValue = form.getFieldValue(requiredFieldId);
		var returnFalse = false;
		var message = getMessage("error_field_required_when_other_yes");
		
		if(booleanFieldId == "grp_trans.dispos_anticipated"){
			// L28 Anticipated Disposition Of Asset fields
			if(booleanFieldValue == "Y"
				&& !(requiredFieldValue == "LX" || requiredFieldValue == "LE" || requiredFieldValue == "UN")){
				
				message = getMessage("error_valid_method_required");
				returnFalse = true;
			}
		} else if(booleanFieldValue == "Y"
			&& !valueExistsNotEmpty(requiredFieldValue)){
			
			// L29 Determination Of Excess fields
			// L30 Potential Candidate For Sale fields
			returnFalse = true;
		}
		
		if(returnFalse) {
			message = message.replace("{0}", form.fields.get(booleanFieldId).fieldDef.title);
			form.addInvalidField(requiredFieldId, message);
			form.displayValidationResult();
			return false;
		}
		
		return true;
	}
	
	//KB3030908
	/*setEmptyOption: function(){
		var myObj = $('formProperty_grp_trans.legal_interest_ind');
		myObj.options.selectedIndex = 0;
		var myObj = $('formProperty_grp_trans.lease_maintenance_ind');
		myObj.options.selectedIndex = 0;
		var myObj = $('formProperty_grp_trans.lease_authority_id');
		myObj.options.selectedIndex = 0;
		var myObj = $('formProperty_grp_trans.status_indicator');
		myObj.options.selectedIndex = 0;
		var myObj = $('formProperty_grp_trans.outgrant_indicator');
		myObj.options.selectedIndex = 0;
		var myObj = $('formProperty_grp_trans.historical_status');
		myObj.options.selectedIndex = 0;
		var myObj = $('formProperty_grp_trans.size_unit_of_measure');
		myObj.options.selectedIndex = 0;
		var myObj = $('formProperty_grp_trans.utilization');
		myObj.options.selectedIndex = 0;
		var myObj = $('formProperty_grp_trans.mission_dependency');
		myObj.options.selectedIndex = 0;
		var myObj = $('formProperty_grp_trans.disposition_method_id');
		myObj.options.selectedIndex = 0;
		var myObj = $('formProperty_grp_trans.sustainability');
		myObj.options.selectedIndex = 0;
	}*/
	//KB3030908
	/*,
	addEmptyOption: function(){
		var myObj = $('formProperty_grp_trans.legal_interest_ind');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			myObj.options.selectedIndex = 0;
		}
		var myObj = $('formProperty_grp_trans.lease_maintenance_ind');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			myObj.options.selectedIndex = 0;
		}
		var myObj = $('formProperty_grp_trans.lease_authority_id');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			myObj.options.selectedIndex = 0;
		}
		var myObj = $('formProperty_grp_trans.status_indicator');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			myObj.options.selectedIndex = 0;
		}
		var myObj = $('formProperty_grp_trans.outgrant_indicator');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			myObj.options.selectedIndex = 0;
		}
		var myObj = $('formProperty_grp_trans.historical_status');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			myObj.options.selectedIndex = 0;
		}
		var myObj = $('formProperty_grp_trans.size_unit_of_measure');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			myObj.options.selectedIndex = 0;
		}
		var myObj = $('formProperty_grp_trans.utilization');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			myObj.options.selectedIndex = 0;
		}
		var myObj = $('formProperty_grp_trans.mission_dependency');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			myObj.options.selectedIndex = 0;
		}
		var myObj = $('formProperty_grp_trans.disposition_method_id');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			myObj.options.selectedIndex = 0;
		}
		var myObj = $('formProperty_grp_trans.sustainability');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			myObj.options.selectedIndex = 0;
		}
	}*/
})
