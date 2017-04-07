View.createController('serviceRequestStepHistory', {

	afterInitialDataFetch:function(){
		//KB3046327 - Workflow Steps are not translated in Step History form of the new Search & Manage view
		var localizedStepField = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getLocalizedStepFieldName').message;
		this.stepsReport.addParameter('localizedStepField', localizedStepField);
		if(Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','hhelpdesk_step_log', 'step_log_id').value){
			this.stepsReport.addParameter('union_hhelpdesk_step_log', "UNION SELECT hhelpdesk_step_log.status,hhelpdesk_step_log.step_type," +
					"afm_wf_steps.${parameters['localizedStepField']}  ${sql.as} step, hhelpdesk_step_log.date_created,hhelpdesk_step_log.time_created," +
					"hhelpdesk_step_log.date_response,hhelpdesk_step_log.time_response,hhelpdesk_step_log.step_status_result,hhelpdesk_step_log.user_name," +
					"hhelpdesk_step_log.comments,hhelpdesk_step_log.vn_id,hhelpdesk_step_log.em_id,hhelpdesk_step_log.cf_id,hhelpdesk_step_log.step_log_id," +
					"hhelpdesk_step_log.field_name,hhelpdesk_step_log.pkey_value from hhelpdesk_step_log left join afm_wf_steps on hhelpdesk_step_log.activity_id = " +
					"afm_wf_steps.activity_id AND hhelpdesk_step_log.status = afm_wf_steps.status AND hhelpdesk_step_log.step = afm_wf_steps.step");
		}
		
		this.stepsReport.refresh(View.restriction);
	}
	
});
