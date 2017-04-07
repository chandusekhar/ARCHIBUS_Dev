var addNewTransactionController = View.createController('addNewTransaction',{
	selectedProperty:null,
	isDialog:false,
	crtValues:null,
	afterInitialDataFetch:function(){
		if(this.view.parameters != null){
			if(this.view.parameters['isDialog']!= null){
				this.isDialog = this.view.parameters['isDialog'];
			}
			if(this.view.parameters['selectedItem']!= null){
				this.selectedProperty = this.view.parameters['selectedItem'];
			}
		}
		this.formTranGenInfo.refresh({}, true);
		this.formTranGenInfo.setFieldValue('grp_trans.user_name_requestor', View.user.name);
		this.crtValues = this.dsTransactionDetailsExisting.getRecord({'grp.unique_identifier':this.selectedProperty});
		this.formTransactionDetails.refresh({}, true);
		//KB3030908
		//this.addEmptyOption();
		this.setValues();
	},
	setValues:function(){
		this.view.setTitle(this.view.title + ' '+this.selectedProperty);
		this.formTransactionDetails.setFieldValue('grp_trans.headUpdated','<b>'+getMessage('head_update_value')+'</b>');
		//$('headExisting_label').innerHTML = '<b>'+getMessage('head_existing_value')+'</b>';
		this.formTransactionDetails.setFieldValue('grp_trans.headExisting','<b>'+getMessage('head_existing_value')+'</b>');
		
		/*
		 * 06/15/2010 IOAN
		 * fixed initialization for grp_type_id field 
		 */
		var arrFields = new Array('real_property_name','grp_type_id', 'grp_use_id', 'legal_interest_ind', 'lease_maintenance_ind',
				'lease_authority_id','status_indicator','outgrant_indicator','historical_status','reporting_grp_agency_id','using_grp_agency_id','size_rural_acres',
				'size_urban_acres','size_gross_area','size_structural_unit','size_unit_of_measure','utilization','value','condition_index',
				'mission_dependency','annual_operating_costs','street_address','latitude','longitude','unique_identifier','city',
				'state','country','county','congressional_district','zip_code','installation_identifier','sub_installation_identifier','installation_name',
				'restrictions','disposition_method_id','disposition_date','disposition_value','net_proceeds','recipient','sustainability',
				'btu_consumption','count_emp_fed','count_emp_contractor','count_emp_fed_telework','dispos_anticipated','dispos_anticipated_method',
				'dispos_anticipated_year','excess_is_anticipated','excess_anticipated_year','sale_candidate','sale_anticipated_year',
				'lease_id','date_lease_expiration','lease_option_to_term_early');
				
		for(var i=0;i< arrFields.length;i++){
			var crtField = arrFields[i];
			this.putFieldValue(this.formTransactionDetails, crtField, this.formTransactionDetails.fields.get('grp_trans.'+crtField).config.format, this.crtValues.values['grp.'+crtField], this.crtValues.localizedValues['grp.'+crtField]);
		}
	},
	putFieldValue: function(form, fieldShortName, format, crtValue, crtLocalizedValue){
		if(format == 'Float' || crtValue.constructor == Date){
			form.setFieldValue('grp_trans.'+fieldShortName, (crtLocalizedValue!= undefined?crtLocalizedValue:''));
		}else{
			form.setFieldValue('grp_trans.'+fieldShortName, (crtValue!= undefined?crtValue:''));
		}
		//$(fieldShortName+'_crt_label').innerHTML = (crtLocalizedValue!= undefined)?crtLocalizedValue:'';
		form.setFieldValue('grp_trans.'+fieldShortName+'_crt', (crtLocalizedValue!= undefined?crtLocalizedValue:''));
	},
	formTranGenInfo_onSave:function(){
		/*
		 * check transaction details fields 
		 */
		this.formTransactionDetails.clearValidationResult();
		this.formTranGenInfo.clearValidationResult();
		var newRecord = new Ab.data.Record({}, true);
		var formRecord = this.formTransactionDetails.getRecord();
		var ds = this.formTransactionDetails.getDataSource();
		
		var valDescription = this.formTranGenInfo.getFieldValue('grp_trans.description_of_change');
		if(valDescription == '' || valDescription == 'Initial entry for property'){
			this.formTranGenInfo.addInvalidField('grp_trans.description_of_change', getMessage('error_description_of_change'));
			this.formTranGenInfo.displayValidationResult();
			return;
		} else if(!this.checkL27PersonnelFields()
				|| !this.checkRequiredFieldWhenOtherIsYes("grp_trans.dispos_anticipated", "grp_trans.dispos_anticipated_method")
				|| !this.checkRequiredFieldWhenOtherIsYes("grp_trans.excess_is_anticipated", "grp_trans.excess_anticipated_year")
				|| !this.checkRequiredFieldWhenOtherIsYes("grp_trans.sale_candidate", "grp_trans.sale_anticipated_year")){
			return;
		}
			
		for(var i=0;i<this.formTransactionDetails.fields.length;i++){
			var key = this.formTransactionDetails.fields.keys[i];
			var crtKey = key.substring(key.indexOf('.')+1);
			if(crtKey.indexOf('_crt')== -1 
				&& crtKey != 'unique_identifier' && crtKey != 'headExisting' && crtKey != 'headUpdated'){
				var newValKey = 'grp_trans.'+ crtKey;
				var oldValKey = 'grp.' + crtKey;
				if(this.crtValues.values[oldValKey] == undefined ||
					(this.crtValues.values[oldValKey] != undefined && this.crtValues.values[oldValKey] != formRecord.values[newValKey]
					&& valueExistsNotEmpty(formRecord.values[newValKey]))){
					if(this.formTransactionDetails.validateField(newValKey, false)){
						if(crtKey == 'grp_use_id' && !valueExistsNotEmpty(newRecord.getValue('grp_trans.grp_type_id'))){
							if(valueExistsNotEmpty(formRecord.values['grp_trans.grp_type_id'])){
								newRecord.setValue('grp_trans.grp_type_id', formRecord.values['grp_trans.grp_type_id']);
							}
							else{
								newRecord.setValue('grp_trans.grp_type_id', this.crtValues.values['grp.grp_type_id']);
							}
						}
						if(crtKey == 'disposition_date' || crtKey == 'date_lease_expiration'){
							newRecord.setValue(newValKey, this.formTransactionDetails.getFieldValue(newValKey));
						}else{
							newRecord.setValue(newValKey, formRecord.values[newValKey]);
						}
					}else{
						this.formTransactionDetails.addInvalidField(newValKey, '');
						this.formTransactionDetails.validationResult.valid = true;
						this.formTransactionDetails.displayValidationResult();
						return;
					}
				}
			}
		}		
		newRecord.setValue('grp_trans.unique_identifier', this.selectedProperty);
		newRecord.setValue('grp_trans.trans_type', 'UPDATE');
		newRecord.setValue('grp_trans.comments', this.formTranGenInfo.getFieldValue('grp_trans.comments'));
		newRecord.setValue('grp_trans.user_name_requestor', View.user.name);
		newRecord.setValue('grp_trans.status', this.formTranGenInfo.getFieldValue('grp_trans.status'));
		newRecord.setValue('grp_trans.description_of_change', valDescription);
		var dbRecord = ds.processOutboundRecord(newRecord);

		try{
			var result = Workflow.callMethod('AbRPLMGovPropertyRegistry-GovPropertyRegistryService-insertItemGovPropRegData', dbRecord);
			if(this.isDialog){
				View.getOpenerView().panels.get('gridTransactions').refresh();
				View.getOpenerView().closeDialog();
			}
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	/**
	 * This data element is required for all Office and Laboratory Building leases.
	 * Field "Number of Federal Teleworking Employees (27.c)" is required to be less than or equal number submitted for  "Number of Federal Employees (27.a)"
	 * @returns true if the fields are valid
	 */
	checkL27PersonnelFields: function(){
		var form = this.formTransactionDetails;
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
			&& (realPropUse == "20" || realPropUse == "74")
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
		var form = this.formTransactionDetails;
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
	/*,
	addEmptyOption: function(){
		var myObj = $('formTransactionDetails_grp_trans.legal_interest_ind');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			//myObj.options.selectedIndex = 0;
		}
		var myObj = $('formTransactionDetails_grp_trans.lease_maintenance_ind');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			//myObj.options.selectedIndex = 0;
		}
		var myObj = $('formTransactionDetails_grp_trans.lease_authority_id');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			//myObj.options.selectedIndex = 0;
		}
		var myObj = $('formTransactionDetails_grp_trans.status_indicator');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			//myObj.options.selectedIndex = 0;
		}
		var myObj = $('formTransactionDetails_grp_trans.outgrant_indicator');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			//myObj.options.selectedIndex = 0;
		}
		var myObj = $('formTransactionDetails_grp_trans.historical_status');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			//myObj.options.selectedIndex = 0;
		}
		var myObj = $('formTransactionDetails_grp_trans.size_unit_of_measure');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			//myObj.options.selectedIndex = 0;
		}
		var myObj = $('formTransactionDetails_grp_trans.utilization');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			//myObj.options.selectedIndex = 0;
		}
		var myObj = $('formTransactionDetails_grp_trans.mission_dependency');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			//myObj.options.selectedIndex = 0;
		}
		var myObj = $('formTransactionDetails_grp_trans.disposition_method_id');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			//myObj.options.selectedIndex = 0;
		}
		var myObj = $('formTransactionDetails_grp_trans.sustainability');
		try{
			myObj.add(new Option("", "", true), myObj.options[0]);
		}catch(err){
			// for IE only
			myObj.add(new Option("", ""), 0);
			//myObj.options.selectedIndex = 0;
		}
	}*/
})
