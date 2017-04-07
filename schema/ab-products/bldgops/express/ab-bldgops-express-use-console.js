var abBldgopsExpressUseConsoleCtrl = View.createController('abBldgopsExpressUseConsoleCtrl', {
	
	// 1 or 0: indicate current value of activity parameter 'WorkRequestsOnly'
	workRequestOnly: 0,

	// 1 or 0: indicate whether need to run the WFR 'updateSLAStepsToWorkRequest'.
	updateSLAStepsToWorkRequest: 0,
	
	/**
	 * @inherit
	 */
	afterInitialDataFetch: function(){
		
		if(!Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','pt_store_loc', 'pt_store_loc_id').value){
			alert(getMessage('updateSchemaForMPSL'));
			jQuery('body').hide();
			return;
		}
		
		if(!Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','cf_work_team', 'cf_id').value){
			alert(getMessage('updateSchemaForMultipleTeamOfCf'));
			jQuery('body').hide();
			return;
		}
		
		//initially check the 	 radio button 'WorkRequestOnly'.
		this.setWorkRequestOnly(0);

		//detect and initial variable updateSLAStepsToWorkRequest.
		this.detectUpdateSLAStepsToWorkRequest();

		//set proper instruction text.
		this.setInstruction();
	},
	
	/**
	*  Check radio button 'WorkRequestOnly' according to value. 
	*/
	setWorkRequestOnly:function(value){
		// not a simple field - try getting radio buttons
		var radios = document.getElementsByName("isWorkRequestOnly");
		if (radios) {
			for (var i = 0; i < radios.length; i++) {
				if (value==radios[i].value) {
					radios[i].checked=true;
					break;
				}
			}
		}
	},

	/**
	 * Call wfr determineIfOnDemandOnly to detect if currently need to call WFR updateSLAStepsToWorkRequest.
	 */
	detectUpdateSLAStepsToWorkRequest: function(){
		try{
			var result = Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsExpressService-determineIfOnDemandOnly', this.workRequestOnly);
			if(result.code == 'executed'){
				if("yes"==result.jsonExpression){
					this.updateSLAStepsToWorkRequest	 = 1;
				} else {
					this.updateSLAStepsToWorkRequest	 = 0;
				}
			}
		}
		catch(e){
			        Workflow.handleError(e);
		}
	},

	/**
	 * Set instruction text according to  value of 'workRequestOnly' and 'updateSLAStepsToWorkRequest'.
	 */
	setInstruction: function(){
		var instructionText='';
		instructionText += getMessage ('workRequestOnly')+ "<br>" ;
		if( this.updateSLAStepsToWorkRequest==0   && this.workRequestOnly==0 ){
			instructionText += getMessage ('preText')+" "+getMessage ('changePnav');
			instructionText += "<br>"+ getMessage ('completeAndRestart');
		} else if ( this.workRequestOnly==1 &&  this.updateSLAStepsToWorkRequest==0 ) {
			instructionText += getMessage ('preText') +":" ;
			instructionText +=   "<br>" + "1. "+getMessage( 'changePnav' ) ;
			instructionText +=   "<br>" + "2. "+ getMessage( 'updateApproveToIssue' ) ;
			instructionText += "<br>"+ getMessage ('completeAndRestart');
		} else  if ( this.workRequestOnly == 0&&  this.updateSLAStepsToWorkRequest==1 ) {
			instructionText += getMessage ('preText') +":" ;
			instructionText +=   "<br>" + "1. "+ getMessage( 'changePnav' );
			instructionText +=   "<br>" + "2. "+ getMessage( 'onlyWorkRequests' );
			instructionText += "<br>"+ getMessage ('completeAndRestart');
		} else  if ( this.workRequestOnly == 1&&  this.updateSLAStepsToWorkRequest==1 ) {
			instructionText += getMessage ('preText') +":" ;
			instructionText +=   "<br>" + "1. "+ getMessage( 'changePnav' ) ;
			instructionText +=   "<br>" + "2. "+ getMessage( 'updateApproveToIssue' ) ;
			instructionText +=   "<br>" + "3. "+ getMessage( 'onlyWorkRequests' ) ;
			instructionText += "<br>"+ getMessage ('completeAndRestart');
		}
		this.useConsolePanel.setInstructions(instructionText);
	},
	
	/**
	 * Handler of action 'Use New Console'.
	 */
	useConsolePanel_onUseConsole: function(){
		//determine if WorkRequestsOnly is changed
		var isWorkRequestOnlyChanged = (this.loadActivityParameter("WorkRequestsOnly")!=this.workRequestOnly) ? 1: 0 ;
		
		var ruleId = 'AbBldgOpsBackgroundData-BldgopsExpressService-useBldgsOperationConsole';
		var result = Workflow.callMethod(ruleId, this.workRequestOnly, isWorkRequestOnlyChanged, this.updateSLAStepsToWorkRequest);
		
		if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
			//get job id
			result.data = eval('(' + result.jsonExpression + ')');
			var jobId = result.data.jobId;

			// open the progress bar dialog
			var message = getMessage('messageUpgrading');
			var currentWorkRequestOnly= this.workRequestOnly; 
			View.openJobProgressBar(getMessage('messageUpgrading'),  jobId, '', function(status) {
				if(status.jobFinished == true){
					// if there exists error message that happened for creating work requests from service requests then alert user
					var wrongData = status.jobProperties['errorMessage'];
					if (wrongData)
						alert(getMessage("wrongData") +": "+wrongData);
					
					var conditionSqlMessage = abBldgopsExpressUseConsoleCtrl.getAlertIfExistsConditionSqlsOfHelpdeskStep(); 
					if (conditionSqlMessage) 
						alert(conditionSqlMessage);

				   // if currently change WorkRequestOnly to 1, then alert user the message
					if (currentWorkRequestOnly==1)
						View.showMessage( getMessage('restart') );
					else 
 						View.showMessage( getMessage('complete') );
					
					//if job completed successfully, then update the parameter values
					abBldgopsExpressUseConsoleCtrl.storeActivityParameter( "UseBldgOpsConsole", 1); 
					abBldgopsExpressUseConsoleCtrl.storeActivityParameter( "WorkRequestsOnly", abBldgopsExpressUseConsoleCtrl.workRequestOnly); 
				}
			});
		}
	},
		
	/**
	 *  Save the activity parameter value. 
	 */
	getAlertIfExistsConditionSqlsOfHelpdeskStep: function(){
		var conditionSteps =   this.helpdesk_sla_steps_ds.getRecords();
		var  returnMessage = "";
		if ( conditionSteps.length>0 ) {
			returnMessage = getMessage("checkConditionSql"); 
		}
		return returnMessage;
	},

	/**
	 *  Save the activity parameter value. 
	 */
	storeActivityParameter: function(paraId, paraValue){
		//get activity parameter record
		var record = this.getActivityParameterRecord(paraId);
		if (record) {
			record.setValue( 'afm_activity_params.param_value', paraValue) ; 
			this.afm_activity_params_ds.saveRecord (record) ; 
		}
		return true;
	},

	/**
	 *  Save the activity parameter value. 
	 */
	loadActivityParameter: function(paraId){
		var record = this.getActivityParameterRecord(paraId);
		if ( record )
			return record.getValue( 'afm_activity_params.param_value') ;
		return null; 
	},

	/**
	 *  Save the activity parameter value. 
	 */
	getActivityParameterRecord: function(paraId){
		//get activity parameter by id
        var restriction = new Ab.view.Restriction();
		restriction.addClause("afm_activity_params.activity_id", "AbBldgOpsOnDemandWork", "=");
		restriction.addClause("afm_activity_params.param_id", paraId, "=");
		var record = this.afm_activity_params_ds.getRecord(restriction);
		return 	record; 
	}		
});

/**
 * when the option "Work Request Only" is changed, store its value to controller's property variable and show coresponding instruction text.
 */
function onWorkRequestOnly(){
    var controller = View.controllers.get('abBldgopsExpressUseConsoleCtrl');
    var isWorkRequestOnly = document.getElementsByName("isWorkRequestOnly");
    if ( isWorkRequestOnly[0].checked ) {
        controller.workRequestOnly = 1;
    }  else if ( isWorkRequestOnly[1].checked  )  {
        controller.workRequestOnly = 0;
    }
	//after the change of radio option, set proper instruction text again.
	abBldgopsExpressUseConsoleCtrl.setInstruction();
}

