/**
 * demonstrate how to pass restrictions and parameters into a paginated report
 */
passRestrictionParametersController = View.createController('reporting', {
	// @begin_translatable
	z_MESSAGE_REQUIRED_FIELD: 'The value is required. Please enter a value into highlighted field and try again.',
	// @end_translatable
	
	//pass just restrictions without parameters
	restrictions_parameters_reporting_onPassingRestrictions: function() {
		if(this.doValidation()){
		
			//a paginated view name 
			var reportViewName = "ab-ex-restrictions-reporting.axvw";
		
			var restriction = new Ab.view.Restriction();
			restriction.addClause('fl.bl_id', this.restrictions_parameters_reporting.getFieldValue('rm.bl_id'), '=');
			restriction.addClause('fl.fl_id', this.restrictions_parameters_reporting.getFieldValue('rm.fl_id'), '=');
			
			var anotherRestriction = new Ab.view.Restriction();
			anotherRestriction.addClause('rm.fl_id', this.restrictions_parameters_reporting.getFieldValue('rm.fl_id'), '=');
			
			//paired dataSourceId with Restriction objects
			var passedRestrictions = {'ds_abExRmxflRpt_owner': restriction, 'ds_abExRmxflRpt_data': anotherRestriction};
			
			//parameters
			var parameters = null;
			
			//passing restrictions
			View.openPaginatedReportDialog(reportViewName, passedRestrictions, parameters);	
		}
	},
	//pass just parameters without restrictions
	restrictions_parameters_reporting_onPassingParameters: function() {
		if(this.doValidation()){
			//a paginated view name 
			var reportViewName = "ab-ex-parameters-reporting.axvw";
			
			var passedRestrictions = null;
		
			//paired parameter names with parameter values
			var parameters = {'ds_abExRmxflRpt_owner_bl_id':this.restrictions_parameters_reporting.getFieldValue('rm.bl_id'),'ds_abExRmxflRpt_owner_fl_id':this.restrictions_parameters_reporting.getFieldValue('rm.fl_id'),'ds_abExRmxflRpt_data_dp_id':'ENGINEERING'};
			
			//passing parameters
			View.openPaginatedReportDialog(reportViewName, passedRestrictions, parameters);	
		}
	},
	//pass both restrictions and parameters
	restrictions_parameters_reporting_onPassingBoth: function() {
		if(this.doValidation()){
			//a paginated view name
			var reportViewName = "ab-ex-restrictions-and-parameters-reporting.axvw";
			
			var restriction = new Ab.view.Restriction();
			restriction.addClause('fl.bl_id', this.restrictions_parameters_reporting.getFieldValue('rm.bl_id'), '=');
			restriction.addClause('fl.fl_id', this.restrictions_parameters_reporting.getFieldValue('rm.fl_id'), '=');
			
			var anotherRestriction = new Ab.view.Restriction();
			anotherRestriction.addClause('rm.fl_id', this.restrictions_parameters_reporting.getFieldValue('rm.fl_id'), '=');
			
			//paired dataSourceId with Restriction objects
			var passedRestrictions = {'ds_abExRmxflRpt_owner': restriction, 'ds_abExRmxflRpt_data': anotherRestriction};
			
			//paired parameter names with parameter values
			var parameters = {'ds_abExRmxflRpt_data_dp_id':'ENGINEERING'};
			
			//passing restrictions and parameters
			View.openPaginatedReportDialog(reportViewName, passedRestrictions, parameters);	
		}
	},
	
	doValidation:function(){
		if( !this.validation('rm.fl_id')) {
			return false;
		}else if(!this.validation('rm.bl_id')){
			return false;
		}
		return true;		 
	},
	validation: function(fieldName){
		this.restrictions_parameters_reporting.clearValidationResult();
		var isValid =  this.restrictions_parameters_reporting.validateField(fieldName, true);
		 if(!isValid){
			 this.restrictions_parameters_reporting.validationResult.valid = false;
			 this.restrictions_parameters_reporting.validationResult.message = this.z_MESSAGE_REQUIRED_FIELD;
			 this.restrictions_parameters_reporting.validationResult.invalidFields[fieldName] = '';
			 this.restrictions_parameters_reporting.displayValidationResult();
		 }
		
		 return isValid;
	}
});
	
	