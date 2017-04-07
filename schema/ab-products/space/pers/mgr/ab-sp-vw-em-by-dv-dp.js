var viewEmByDpController = View.createController('viewEmByDpController', {

	 afterInitialDataFetch:function(){
		var useWorkspaceTransactions = this.getParameterValues("UseWorkspaceTransactions");
		if( useWorkspaceTransactions==1 ){
			var startDate =   this.getParameterValues("AreaTotalsStartDate");
			var endDate = this.getParameterValues("AreaTotalsEndDate");
			View.setTitle( View.title+ " " +
				"-" + " "+getMessage('dateRange').replace("<{0}>", startDate).replace("<{1}>", endDate));
		}  
	 },

    dpPanel_afterRefresh: function(){
        var dpPanel = this.dpPanel;
        if (this.dpPanel.restriction != null) {
            dpPanel.setTitle(getMessage('setTitleForDp') + ' '+ this.dpPanel.restriction['dv.dv_id']);
        }
        else 
            dpPanel.setTitle(getMessage('setTitleForDp'));
    },
    
    emPanel_afterRefresh: function(){
        var emPanel = this.emPanel;
        emPanel.setTitle(getMessage('setTitleForEm') + ' '+this.emPanel.restriction['dp.dv_id'] + "-" + this.emPanel.restriction['dp.dp_id']);
    },

	/**
	 * Private function: get activity parameter values.
	 */
	getParameterValues: function(paraId){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_activity_params.activity_id', "AbSpaceRoomInventoryBAR");
		restriction.addClause('afm_activity_params.param_id', paraId);

		var parameters = {
				tableName: 'afm_activity_params',
				fieldNames: toJSON(['afm_activity_params.param_value']),
				restriction: toJSON(restriction)
		};

		try{
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if(result.code == "executed" && result.data.records.length > 0){
				
				//query requirement type value from requirement record
				var record = result.data.records[0];
				return record['afm_activity_params.param_value'];
			}
		}catch (e){
			Workflow.handleError(e);
			return "";
		}
	}

})
