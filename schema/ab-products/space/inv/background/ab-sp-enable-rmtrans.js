var controller = View.createController('abSpEnableRmtransController', {
	
	// 1 or 0: indicate current value of activity parameter 'UseWorkspaceTransactions'
	status: 0,

	/**
	 * @inherit
	 */
	afterInitialDataFetch: function(){
		//set current status from activity parameter 'UseWorkspaceTransactions'
		var record = this.afm_activity_params_ds.getRecord();
		if(record){
			this.status = parseInt(record.getValue('afm_activity_params.param_value') );
		}
		//call private funciton to se proper view title
		this.setViewTitle();
	},
	
	/**
	 * @inherit
	 */
	setViewTitle: function(){
		
		//call private funciton to se proper view title
		if( this.status==1 ) {
			View.setTitle(getMessage("enabledTitle"));
		} 
		else {
			View.setTitle(getMessage("disabledTitle"));
		};
	},

	/**
	 * Enable roomtransaction process.
	 */
	enableRoomTransactionPanel_onEnable: function(){
		try{
			//workflow AllRoomPercentageUpdate.SynchronizePercentages()
			var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransaction-enableOrDisableRoomTransaction', true);
			if(result.code == 'executed'){
				if("noLicense"==result.jsonExpression){
					View.alert(getMessage("noLicense"));
				}
				else {
					View.alert(getMessage("enableMessage"));
					this.status=1;
					this.setViewTitle();
				}
			}
		}catch(e){
			        Workflow.handleError(e);
		}
	},
	
	/**
	 * Reconcile workspace transaction through workflow AllRoomPercentageUpdate.SynchronizePercentages()
	 */
	enableRoomTransactionPanel_onReconcile: function(){
		try{
			//workflow AllRoomPercentageUpdate.SynchronizePercentages()
			var jobId = Workflow.startJob('AbCommonResources-SpaceService-synchronizeSharedRooms');

			if (valueExists(jobId)) {				
				// open the progress bar dialog
				View.openJobProgressBar(getMessage('reconcilingMessage'),  jobId, '', function(status) {
					if(status.jobFinished == true){						
						View.alert(getMessage("reconcileMessage"));
					}
				});
			}				
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	/**
	 * Disable roomtransaction process.
	 */
	disableRoomTransactionPanel_onDisable: function(){
		try{
			//workflow AllRoomPercentageUpdate.SynchronizePercentages()
			var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransaction-enableOrDisableRoomTransaction',false);
			if(result.code == 'executed'){
				View.alert(getMessage("disableMessage"));
				this.status=0;
				this.setViewTitle();
			}
		}catch(e){
			Workflow.handleError(e);
		}
	}
	
});
