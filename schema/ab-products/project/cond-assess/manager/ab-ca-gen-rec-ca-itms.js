/**
 * @author Cristina Moldovan
 * 07/17/2009
 */

/**
 * controller definition
 */
var genRecCondAssessController = View.createController('genRecCondAssessCtrl',{
	afterInitialDataFetch: function(){
		this.setLabels();
		if (this.view.taskInfo.activityId == 'AbProjCommissioning') {
			this.genRecCondAssessPanel.setFieldValue('activity_log.activity_type', 'CX - CONSTRUCTION CHECKLISTS');
		}
		else this.genRecCondAssessPanel.setFieldValue('activity_log.activity_type', 'ASSESSMENT');
	},
	
	/**
	 * Calls the workflow rule for generating condition assessment items
	 */
	genRecCondAssessPanel_onGenRecords: function(){
		var rec = this.genRecCondAssessPanel.getRecord();
		if (!this.validateFormFields(this.genRecCondAssessPanel)) return;
		
		var radioGenerateFor = document.getElementsByName("radioGenerateFor");
		var generateFor = "RmEq";
		
        for(var i=0;i<radioGenerateFor.length;i++) {                
	        if(radioGenerateFor[i].checked) { 
				generateFor = radioGenerateFor[i].value;
				break;
        	}
		}
		
		try {
			var controller = this;
			var msg_gen_ok = getMessage('msg_gen_asses_itms_ok');
			var msg_gen_zero_generated = getMessage('msg_gen_zero_generated');

			var jobId = Workflow.startJob('AbCapitalPlanningCA-ConditionAssessmentService-generateAssessmentRecords',
							rec.getValue('activity_log.project_id'),
							rec.getValue('activity_log.site_id'),
							rec.getValue('activity_log.bl_id'),
							rec.getValue('activity_log.fl_id'),
							rec.getValue('activity_log.activity_type'),
							generateFor);
		    View.openJobProgressBar(getMessage('generateMessage'), jobId, '', function(status) {
				var msg = (status.jobCurrentNumber == 0) ? msg_gen_zero_generated : msg_gen_ok;
				controller.genRecCondAssessPanel.displayTemporaryMessage(msg);
				View.getOpenerView().controllers.get('mngCondAssessCtrl').mngCondAssessFilterPanel_onShow();
		    });
		} 
		catch (e) {
			Workflow.handleError(e);
		}

	},
	
	/**
	 * Sets the labels for the radio button
	 */
	setLabels: function(){
		$('radioGenerateFor_RmEq_Span').innerHTML = getMessage('radioGenerateFor_RmEq_Label');
		$('radioGenerateFor_Rm_Span').innerHTML = getMessage('radioGenerateFor_Rm_Label');
		$('radioGenerateFor_Eq_Span').innerHTML = getMessage('radioGenerateFor_Eq_Label');
	},
    
    validateFormFields: function(form) {
    	form.clearValidationResult();
    	var valid = true;
    	if (!this.validateFormField(form, 'site', 'site_id')) valid = false;
    	if (!this.validateFormField(form, 'bl', 'bl_id')) valid = false;
    	if (!this.validateFormField(form, 'fl', 'fl_id')) valid = false;
    	if (!valid) form.displayValidationResult();
    	return valid;
    },
    
    validateFormField: function(form, table_name, field_name) {
    	var fieldValue = form.getFieldValue('activity_log.' + field_name);
    	if (!fieldValue) return true;
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause(table_name + '.' + field_name, fieldValue);
    	var parameters = {
    			tableName: table_name,
    	        fieldNames: toJSON([table_name + '.' + field_name]),
    	        restriction: toJSON(restriction)
    	};
    	try {
    	    var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    	    if (result.data.records.length == 0){
    	    	form.addInvalidField('activity_log.' + field_name, '');
    			return false;
    		}
    	} catch (e) {
    	    Workflow.handleError(e);
    	    return false;
    	}
    	return true;
    }
});
