/**
 * 
 */
var allocWizGpFloorsController = View.createController('allocWizGpFloorsController', {
	
	selectedBlId: null,
	
	scn_id:null,
	
	unitTitle: '',
	
	callback: null,
	
	afterInitialDataFetch: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('fl.bl_id', this.selectedBlId, '=');
		this.floorDetailsGrid.addParameter('scn_id', this.scn_id);
		this.floorDetailsGrid.refresh(restriction);
		
		this.unitTitle = getMessage('unitTitleMetric');
		var units = View.project.units;
		if (units == "imperial") {
			this.unitTitle = getMessage('unitTitleImperial');
		}
	},

	floorDetailsGrid_onSaveSelectedFloors: function() {
		var grids = this.floorDetailsGrid.getSelectedRows();
		var selectedFls = [];
		for (var i = 0; i < grids.length; i++) {
			var gridRow = grids[i];
			var flId = gridRow.row.getFieldValue("fl.fl_id");
			selectedFls.push(flId);
		}
		
		//create group record
		this.createGroupRecords(selectedFls);
		View.closeThisDialog();
	},
	
	createGroupRecords: function(selectedFls) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('portfolio_scenario.portfolio_scenario_id',this.scn_id, '=');
		var portfolioScenario = this.portfolioScenarioQueryDs.getRecords(restriction)[0];
		var startDate = portfolioScenario.getValue('portfolio_scenario.date_start');
		var scnLevel =  portfolioScenario.getValue('portfolio_scenario.scn_level');
		this.createGroupRecord(selectedFls, startDate, scnLevel);
	},
	
	createGroupRecord: function(selectedFls, startDate, scnLevel) {
		var dsRecord = new Ab.data.Record();
		dsRecord.setValue('bl.bl_id', this.selectedBlId);
		var blRecords = [];
		blRecords.push(dsRecord);
		
		var blDataSet = new Ab.data.DataSetList();
		blDataSet.addRecords(blRecords);
		
		var flDataSet = new Ab.data.DataSetList();
		flDataSet.addRecords(this.floorDetailsGrid.getSelectedRecords());
		var dateStart = getIsoFormatDate(new Date(startDate));
		try{
			var result =  Workflow.callMethod('AbRPLMGroupSpaceAllocation-PortfolioForecastingService-createGroupFromInventory', this.scn_id, blDataSet, flDataSet, dateStart, scnLevel, 0, this.unitTitle);
			if(this.callback){
				this.callback();
			}
		}catch(e) {
			Workflow.handleError(e);
		}
	}
});