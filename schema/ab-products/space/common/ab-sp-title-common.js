
/**
 * @author Song
 * putting the date range right on the view title
 */
var titleController = View.createController('titleController', {
	/**
	 * re-set the View title.
	 */
	afterInitialDataFetch: function(){
		var dateStart = this.getParameterValues('AreaTotalsStartDate' );
		var dateEnd = this.getParameterValues('AreaTotalsEndDate'); 
		
		View.setTitle(View.originalTitle + " " +
			"-" + " "+getMessage('dateRange').replace("<{0}>", dateStart).replace("<{1}>", dateEnd));
		
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

});
