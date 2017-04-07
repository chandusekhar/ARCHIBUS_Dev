var abBldgopsQuickStartAppParamCtrl = View.createController('abBldgopsQuickStartAppParamCtrl', {
		
	/**
	 *	Run behind logics only for "WorkRequestOnly".
	 */
	updateWorkRequestOnly: function(){
		// then for 	 "WorkRequestsOnly"	 call specific logic
		var paramId = this.paramForm.getFieldValue('afm_activity_params.param_id');

		if ( 'WorkRequestsOnly'==paramId ) {
			var oldValue = this.paramForm.getOldFieldValues()['afm_activity_params.param_value'];
			var newValue = this.paramForm.getFieldValue('afm_activity_params.param_value');
			if (newValue!=oldValue)
				this.updateStatusAndStepByWorkRequestsOnly(newValue); 	
		}
	},

	/**
	 *	If current selected parameter is "WorkRequestOnly", show the instruction text.
	 */
	paramForm_afterRefresh:function(){
		var paramId = this.paramForm.getFieldValue('afm_activity_params.param_id');
		if ( "WorkRequestsOnly" ==paramId ) {
			this.paramForm.setInstructions(getMessage("workRequestOnly"));
		} else {
			this.paramForm.setInstructions(null);
		}
	},

	/**
	 * Call WFR to update display value of enum field status and 'Dispatch' step according to value of 'WorkRequestsOnly'.
	 *
	 * @param workRequestsOnly value
	 */
	updateStatusAndStepByWorkRequestsOnly: function( workRequestsOnly ) {		
		//run the update logic according to application parameter 'WorkRequestsOnly'.
		try{
			var result = Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsExpressService-updateStatusAndStepByWorkRequestsOnly', parseInt(workRequestsOnly));
			if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
				//get job id
				result.data = eval('(' + result.jsonExpression + ')');
				var jobId = result.data.jobId;
				// open the progress bar dialog
				View.openJobProgressBar(getMessage('setting'),  jobId, '', function(status) {
					if(status.jobFinished == true){
						View.showMessage( getMessage("finished") );
						abBldgopsQuickStartAppParamCtrl.afterInitialDataFetch();
					}
				});
			}						 
		}catch(e){
			        Workflow.handleError(e);
		}
	}
});