var abEhsDefMedMonCtrl = View.createController('abEhsDefMedMonCtrl',{
	
	recurringPatternCtrl : null,
	
	afterViewLoad:function(){
		this.recurringPatternCtrl = View.controllers.get("abRecurringPatternCtrl");
	},
	
	afterInitialDataFetch: function(){
		this.recurringPatternCtrl.showRecurringPatternPanel(false);
	},
	
	showForm: function(visible){
		this.recurringPatternCtrl.showRecurringPatternPanel(visible);
		this.abEhsDefMedicalMonitoring_form.show(visible);
		if(visible){
			if(this.abEhsDefMedicalMonitoring_form.getFieldValue('ehs_medical_monitoring.is_recurring') == '1'){
				var recurringRule = this.abEhsDefMedicalMonitoring_form.getFieldValue("ehs_medical_monitoring.recurring_rule");
				this.recurringPatternCtrl.setRecurringPattern(this.abEhsDefMedicalMonitoring_form.getFieldValue("ehs_medical_monitoring.recurring_rule"));
				this.abEhsDefMedicalMonitoring_form.enableField("ehs_medical_monitoring.date_recurrence_end", true);
				
			}else{
				//this.recurringPatternCtrl.enableRecurringPattern(false);
				this.abEhsDefMedicalMonitoring_form.enableField("ehs_medical_monitoring.date_recurrence_end", false);
				
				this.recurringPatternCtrl.showRecurringPatternPanel(false);
			}
		}
	},
	
	onChangeNeedsRenewal: function(){
		var needsRenewal = this.abEhsDefMedicalMonitoring_form.getFieldValue('ehs_medical_monitoring.is_recurring'); 
		if(needsRenewal == '1'){
			this.recurringPatternCtrl.showRecurringPatternPanel(true);
			
			this.recurringPatternCtrl.enableRecurringPattern(true);
			this.abEhsDefMedicalMonitoring_form.enableField("ehs_medical_monitoring.date_recurrence_end", true);
		}else{
			this.recurringPatternCtrl.clearRecurringPattern();
			//this.recurringPatternCtrl.enableRecurringPattern(false);
			this.abEhsDefMedicalMonitoring_form.enableField("ehs_medical_monitoring.date_recurrence_end", false);
			this.abEhsDefMedicalMonitoring_form.fields.get("ehs_medical_monitoring.date_recurrence_end").clear();
			
			this.recurringPatternCtrl.showRecurringPatternPanel(false);
		}
	},
	
	abEhsDefMedicalMonitoring_form_afterRefresh:function(){
		this.recurringPatternCtrl.setRecurringPattern(this.abEhsDefMedicalMonitoring_form.getFieldValue("ehs_medical_monitoring.recurring_rule"));
	},
	
	abEhsDefMedicalMonitoring_form_beforeSave: function(){
		this.abEhsDefMedicalMonitoring_form.setFieldValue("ehs_medical_monitoring.recurring_rule", this.recurringPatternCtrl.getRecurringPattern());
		var needsRenewal = this.abEhsDefMedicalMonitoring_form.getFieldValue('ehs_medical_monitoring.is_recurring'); 
		if(needsRenewal == '1'){
			//check that renewal frequency is described
			if(!valueExistsNotEmpty(this.abEhsDefMedicalMonitoring_form.getFieldValue('ehs_medical_monitoring.recurring_rule'))){
				View.showMessage(getMessage("errNoRecurringRule"));
				return false;
			}
			
			//check that one of the stop conditions is defined: Date End or End After[ ]Ocurrences or Once button selected
			/* PC not required after last changes to common code, default values of 5-10 years can be used if no stop condition is indicated
			if(!isRecurrenceEnd(this.abEhsDefMedicalMonitoring_form.getFieldValue("ehs_medical_monitoring.date_recurrence_end"), this.recurringPatternCtrl)){
				return false;
			}*/
		}
		return true;
	}
});
