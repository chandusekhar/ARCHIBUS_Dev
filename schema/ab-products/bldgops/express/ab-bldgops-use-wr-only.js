var abBldgopsUseWorkRequestOnlyCtrl = View.createController('abBldgopsUseWorkRequestOnlyCtrl', {
	
	// 1 or 0: indicate current value of activity parameter 'WorkRequestsOnly'
	workRequestOnly: 0,

	/**
	 * @inherit
	 */
	afterInitialDataFetch: function(){
		//initially check the 	 radio button 'Yes'.
		this.setYesNo(1);

		//detect value of activity parameter "WorkRequestsOnly".
		this.detectWorkRequestsOnly();

		//set proper instructio text.
		this.setInstruction();
	},
	
	/**
	*  Check radio button 'yes_no' according to value. 
	*/
	setYesNo:function(value){
		// not a simple field - try getting radio buttons
		var radios = document.getElementsByName("yes_no");
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
	 *  Get the value of activity parameter "WorkRequestsOnly" and store it to local variable. 
	 */
	detectWorkRequestsOnly: function(paraId, paraValue){
		//get activity parameter by id
		var record = this.getWorkRequestsOnlyRecord();
		if (record){
			this.workRequestOnly = record.getValue( 'afm_activity_params.param_value') ; 
		}	else {
			View.showMessage( getMessage("noParam") );
		}
	},

	/**
	 * @return the DataRecord of activity parameter "WorkRequestsOnly". 
	 */
	getWorkRequestsOnlyRecord: function(){
        var restriction = new Ab.view.Restriction();
		restriction.addClause("afm_activity_params.activity_id", "AbBldgOpsOnDemandWork", "=");
		restriction.addClause("afm_activity_params.param_id", "WorkRequestsOnly", "=");
		var record = this.afm_activity_params_ds.getRecord(restriction);
		return  record; 
	},

	/**
	 * @return the DataRecord of activity parameter "WorkRequestsOnly". 
	 */
	getUseBuildingConsoleRecord: function(){
        var restriction = new Ab.view.Restriction();
		restriction.addClause("afm_activity_params.activity_id", "AbBldgOpsOnDemandWork", "=");
		restriction.addClause("afm_activity_params.param_id", "UseBldgOpsConsole", "=");
		var record = this.afm_activity_params_ds.getRecord(restriction);
		return  record; 
	},

	/**
	 * Set instruction text according to value of 'workRequestOnly'.
	 */
	setInstruction: function(){
		var instructionText='';
		if ( this.workRequestOnly==0  ){
			instructionText = getMessage ('changeText');
		} else {
			instructionText = getMessage ('restoreText');
		} 
		this.useWorkRequestsOnly.setInstructions(instructionText);
	},
	
	/**
	 * Handler of action 'Start': call WFR to update display value of enum field status and 'Dispatch' step.
	 */
	useWorkRequestsOnly_onStart: function(){
		//kb#3044623: the WFR only works if UseBldgOpsConsole = 1
		var useOpsConsoleRecord = this.getUseBuildingConsoleRecord();
		if ( useOpsConsoleRecord.getValue('afm_activity_params.param_value')==0 ) {
			View.showMessage( getMessage("notAllowed") );
			return;
		}

		var yesNo = document.getElementsByName("yes_no");
		if (yesNo[1].checked)
			return;

		var newWorkRequestsOnly = ( this.workRequestOnly==0 ? 1 : 0 ) ;
		
		//run the update logic according to application parameter 'WorkRequestsOnly'.
		var result = Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsExpressService-updateStatusAndStepByWorkRequestsOnly', newWorkRequestsOnly);
		if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
			//get job id
			result.data = eval('(' + result.jsonExpression + ')');
			var jobId = result.data.jobId;
			// open the progress bar dialog
			View.openJobProgressBar(getMessage('setting'),  jobId, '', function(status) {
				if(status.jobFinished == true){
					//store new value to activity parameter 'WorkRequestsOnly'.
					var record = abBldgopsUseWorkRequestOnlyCtrl.getWorkRequestsOnlyRecord();
					record.setValue( 'afm_activity_params.param_value', newWorkRequestsOnly) ; 
					abBldgopsUseWorkRequestOnlyCtrl.afm_activity_params_ds.saveRecord (record) ;
					View.showMessage( getMessage("finished") );
					abBldgopsUseWorkRequestOnlyCtrl.afterInitialDataFetch();
				}
			});
		}			
	}
});

/**
 * Show/Hide the start button according to 'Yes'/'No' option.
 */
function onChooseYesNo(){
    var controller = View.controllers.get('abBldgopsUseWorkRequestOnlyCtrl');
    var yesNo = document.getElementsByName("yes_no");
    if ( yesNo[0].checked ) {
        controller.useWorkRequestsOnly.actions.get('start').show(true);
    }  else {
        controller.useWorkRequestsOnly.actions.get('start').show(false);
    }
}
