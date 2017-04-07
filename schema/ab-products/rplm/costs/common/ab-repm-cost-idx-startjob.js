var abRepmCostIdxStartJobController = View.createController('abRepmCostIdxStartJobController', {
	
	afterInitialDataFetch: function(){
		var currentDate = new Date();
		var formattedValue = this.abRepmCostIdxStartJob.getDataSource().formatValue("ls_index_profile.date_index_start", currentDate, true);
		this.abRepmCostIdxStartJob.setFieldValue("ls_index_profile.date_index_start", formattedValue);
	},
	
	abRepmCostIdxStartJob_onStartJob: function(){
		var indexingDate = this.abRepmCostIdxStartJob.getFieldValue("ls_index_profile.date_index_start");
		if (!valueExistsNotEmpty(indexingDate)){
			View.showMessage(getMessage("errMissingDate"));
			
		}else{
			try{
				var jobId = Workflow.startJob('AbCommonResources-CostIndexingService-applyIndexesForDate', indexingDate);
			    View.openJobProgressBar(getMessage('msgIndexingCosts'), jobId, '', function(status) {
			    	
			    });
			}catch(e){
				Workflow.handleError(e);
				return false;
			}
			
		}
	}
});
	
