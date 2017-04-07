var scenarioController = View.createController('scenarioCtrl',{
	restriction:'',
	restriction2:'',
	
	viewPanels: [
    	"panel_totalCostTypeData",
    	"panel_totalCostConsumpChart",
    	"panel_totalCostConsumpData",
    	"panel_elecCostRateData",
    	"panel_gasCostRateData",
    	"panel_elecLoadFactorData",
    	"panel_elecConsumWeatherModelData",
    	"panel_elecDemandWeatherModelData",
    	"panel_elecConsumWeatherModelChart",
    	"panel_elecDemandWeatherModelChart",
    	"panel_gasWeatherModelData",
    	"panel_gasWeatherModelChart"
	],
	viewPanelsForCost: [
     	"panel_gasCostRateChart"
 	],
	afterViewLoad:function(){
		var totalCostTypeChartPanel = View.panels.get('panel_totalCostTypeChart');
		totalCostTypeChartPanel.show(false);	
		var elecCostRateChartPanel = View.panels.get('panel_elecCostRateChart');
		elecCostRateChartPanel.show(false)
		var gasCostRateChartPanel = View.panels.get('panel_gasCostRateChart');
		gasCostRateChartPanel.show(false);
		var totalCostConsumpChartPanel = View.panels.get('panel_totalCostConsumpChart');
		totalCostConsumpChartPanel.show(false);
		var elecLoadFactorChartPanel = View.panels.get('panel_elecLoadFactorChart');
		elecLoadFactorChartPanel.show(false);
		var elecConsumLoadWeatherModelPanel = View.panels.get('panel_elecConsumWeatherModelChart');
		elecConsumLoadWeatherModelPanel.show(false);
		var elecDemandLoadWeatherModelPanel = View.panels.get('panel_elecDemandWeatherModelChart');
		elecDemandLoadWeatherModelPanel.show(false);	
		var gasLoadWeatherModelPanel = View.panels.get('panel_gasWeatherModelChart');
		gasLoadWeatherModelPanel.show(false);
		
		abEnergyBillCommonController.setBillUnitsOptions();
		abEnergyBillCommonController.setBillUnitsParameter(true, this.viewPanels, this.viewPanelsForCost);
	},
 	afterInitialDataFetch: function() {
        	// add beforeTabChange event listener
        	this.tabs.addEventListener('beforeTabChange', this.tabs_beforeTabChange.createDelegate(this));
        },
	tabs_beforeTabChange: function(tabPanel, selectedTabName, newTabName){
			var panel = View.panels.get('panel_' + newTabName);
			
			if((newTabName.indexOf('WeatherModel') > -1) || (newTabName == 'elecLoadFactorChart')){
				panel.refresh(this.restriction2);	
			} else {
				panel.refresh(this.restriction);		
			}			
	},
	panel_measureVerifyConsole_onClear: function(){
		this.panel_measureVerifyConsole.clear();
		this.panel_measureVerifyConsole_onFilter()
	},
	panel_measureVerifyConsole_onFilter: function(){
		// apply restriction from console
		this.restriction = new Ab.view.Restriction();
		this.restriction2 = new Ab.view.Restriction();
		var console_name = "panel_measureVerifyConsole";
		var console = View.panels.get(console_name);
		var time_periodFrom = console.getFieldValue('bill_archive.time_period.from');
		var time_periodTo = console.getFieldValue('bill_archive.time_period.to');

		if (time_periodFrom != '') {
			this.restriction.addClause('bill_archive.time_period', time_periodFrom, '&gt;=');
			this.restriction2.addClause('energy_chart_point.time_period', time_periodFrom, '&gt;=');

		}
		if (time_periodTo != '') {
			this.restriction.addClause('bill_archive.time_period', time_periodTo, '&lt;=');
			this.restriction2.addClause('energy_chart_point.time_period', time_periodTo, '&lt;=');

		 }	 
		
		// set charts labels
		this.applyBillUnits();

		// create the SQL restriction for the selected location
		var treePanel = View.panels.get('panel_measureVerifyCtry');
		var selectedNode = treePanel.lastNodeClicked;

		if (valueExists(selectedNode)) {
			var selectedLevel = selectedNode.level.levelIndex;
			var locationField, locationValue;
			switch (selectedLevel) {
			case 0:
			    locationField = 'ctry_id'; 
			    locationValue = selectedNode.data['ctry.ctry_id'];
			    locationRestriction = ''; 
				break;
			case 1:
			    locationField = 'regn_id'; 
			    locationValue = selectedNode.data['regn.regn_id'];
			    locationRestriction = ''; 
				break;
			case 2:
			    locationField = 'state_id'; 
			    locationValue = selectedNode.data['state.state_id'];
			    locationRestriction = ''; 
				break;
			case 3:
			    locationField = 'city_id'; 
			    locationValue = selectedNode.data['city.city_id'];
				break;
			case 4:
			    locationField = 'site_id'; 
			    locationValue = selectedNode.data['site.site_id'];
				break;
			case 5:
			    locationField = 'bl_id'; 
			    locationValue = selectedNode.data['bl.bl_id'];
				break;
			}


			//pass parameters to panels, refresh/show them, and append their titles
			var totalCostTypeChartPanel = View.panels.get('panel_totalCostTypeChart');	
			totalCostTypeChartPanel.show(true);
			totalCostTypeChartPanel.addParameter('locationField', locationField);
			totalCostTypeChartPanel.addParameter('locationValue', locationValue);
			//totalCostTypeChartPanel.refresh(restriction);
			totalCostTypeChartPanel.appendTitle(locationValue);	

			var totalCostConsumpChartPanel = View.panels.get('panel_totalCostConsumpChart');	
			totalCostConsumpChartPanel.show(true);
			totalCostConsumpChartPanel.addParameter('locationField', locationField);
			totalCostConsumpChartPanel.addParameter('locationValue', locationValue);
			//totalCostConsumpChartPanel.refresh(restriction);
			totalCostConsumpChartPanel.appendTitle(locationValue);	

			var elecCostRateChartPanel = View.panels.get('panel_elecCostRateChart');
			elecCostRateChartPanel.show(true);
			elecCostRateChartPanel.addParameter('locationField', locationField);
			elecCostRateChartPanel.addParameter('locationValue', locationValue);
			//elecCostRateChartPanel.refresh(restriction);
			elecCostRateChartPanel.appendTitle(locationValue);	

			var gasCostRateChartPanel = View.panels.get('panel_gasCostRateChart');
			gasCostRateChartPanel.show(true);
			gasCostRateChartPanel.addParameter('locationField', locationField);
			gasCostRateChartPanel.addParameter('locationValue', locationValue);
			//gasCostRateChartPanel.refresh(restriction);
			gasCostRateChartPanel.appendTitle(locationValue);	

			var elecLoadFactorChartPanel = View.panels.get('panel_elecLoadFactorChart');
			elecLoadFactorChartPanel.show(true);
			elecLoadFactorChartPanel.addParameter('locationField', locationField);
			elecLoadFactorChartPanel.addParameter('locationValue', locationValue);
			//elecLoadFactorChartPanel.refresh(restriction2);
			elecLoadFactorChartPanel.appendTitle(locationValue);	

			var elecConsumWeatherModelChartPanel = View.panels.get('panel_elecConsumWeatherModelChart');
			elecConsumWeatherModelChartPanel.show(true);
			elecConsumWeatherModelChartPanel.addParameter('locationField', locationField);
			elecConsumWeatherModelChartPanel.addParameter('locationValue', locationValue);
			//elecConsumWeatherModelChartPanel.refresh(restriction2);
			elecConsumWeatherModelChartPanel.appendTitle(locationValue);	

			var elecDemandWeatherModelChartPanel = View.panels.get('panel_elecDemandWeatherModelChart');
			elecDemandWeatherModelChartPanel.show(true);
			elecDemandWeatherModelChartPanel.addParameter('locationField', locationField);
			elecDemandWeatherModelChartPanel.addParameter('locationValue', locationValue);
			//elecDemandWeatherModelChartPanel.refresh(restriction2);
			elecDemandWeatherModelChartPanel.appendTitle(locationValue);	

			var gasWeatherModelChartPanel = View.panels.get('panel_gasWeatherModelChart');
			gasWeatherModelChartPanel.show(true);
			gasWeatherModelChartPanel.addParameter('locationField', locationField);
			gasWeatherModelChartPanel.addParameter('locationValue', locationValue);
			//gasWeatherModelChartPanel.refresh(restriction2);
			gasWeatherModelChartPanel.appendTitle(locationValue);

			var totalCostTypeDataPanel = View.panels.get('panel_totalCostTypeData');
			totalCostTypeDataPanel.addParameter('locationField', locationField);
			totalCostTypeDataPanel.addParameter('locationValue', locationValue);
			totalCostTypeDataPanel.appendTitle(locationValue);

			var totalCostConsumpDataPanel = View.panels.get('panel_totalCostConsumpData');
			totalCostConsumpDataPanel.addParameter('locationField', locationField);
			totalCostConsumpDataPanel.addParameter('locationValue', locationValue);
			totalCostConsumpDataPanel.appendTitle(locationValue);	

			var elecCostRateDataPanel = View.panels.get('panel_elecCostRateData');
			elecCostRateDataPanel.addParameter('locationField', locationField);
			elecCostRateDataPanel.addParameter('locationValue', locationValue);
			elecCostRateDataPanel.appendTitle(locationValue);

			var gasCostRateDataPanel = View.panels.get('panel_gasCostRateData');
			gasCostRateDataPanel.addParameter('locationField', locationField);
			gasCostRateDataPanel.addParameter('locationValue', locationValue);
			gasCostRateDataPanel.appendTitle(locationValue);	

			var elecLoadFactorDataPanel = View.panels.get('panel_elecLoadFactorData');
			elecLoadFactorDataPanel.addParameter('locationField', locationField);
			elecLoadFactorDataPanel.addParameter('locationValue', locationValue);
			elecLoadFactorDataPanel.appendTitle(locationValue);

			var elecConsumWeatherModelDataPanel = View.panels.get('panel_elecConsumWeatherModelData');
			elecConsumWeatherModelDataPanel.addParameter('locationField', locationField);
			elecConsumWeatherModelDataPanel.addParameter('locationValue', locationValue);
			elecConsumWeatherModelDataPanel.appendTitle(locationValue);

			var elecDemandWeatherModelDataPanel = View.panels.get('panel_elecDemandWeatherModelData');
			elecDemandWeatherModelDataPanel.addParameter('locationField', locationField);
			elecDemandWeatherModelDataPanel.addParameter('locationValue', locationValue);
			elecDemandWeatherModelDataPanel.appendTitle(locationValue);

			var gasWeatherModelDataPanel = View.panels.get('panel_gasWeatherModelData');	
			gasWeatherModelDataPanel.addParameter('locationField', locationField);
			gasWeatherModelDataPanel.addParameter('locationValue', locationValue);
			gasWeatherModelDataPanel.appendTitle(locationValue);

			var tabs = View.panels.get('tabs'); 
			var selectedTab = tabs.selectedTabName;
			var selectedTabPanel = View.panels.get('panel_' + selectedTab);
			if((selectedTab.indexOf('WeatherModel') > -1) || (selectedTab == 'elecLoadFactorChart')){
				selectedTabPanel.refresh(this.restriction2);	
			} else {
				selectedTabPanel.refresh(this.restriction);		
			}
		}		
	},
	
	/**
	 * sets bill units to datasources and labels to chart panels
	 */
	applyBillUnits: function(){
		abEnergyBillCommonController.setBillUnitsParameter(false, this.viewPanels, this.viewPanelsForCost);
		
		for ( var i = 0; i < scenarioController.viewPanels.length; i++) {
			var panelId = scenarioController.viewPanels[i];
			var chartPanel = View.panels.get(panelId);
			if(chartPanel.type === "chart"){
				abEnergyBillCommonController.setQtyEnergyTitle(chartPanel);
				chartPanel.loadChartSWFIntoFlash();
			}
		}
		
		for ( var i = 0; i < scenarioController.viewPanelsForCost.length; i++) {
			var panelId = scenarioController.viewPanelsForCost[i];
			var chartPanel = View.panels.get(panelId);
			if(chartPanel.type === "chart"){
				abEnergyBillCommonController.setQtyEnergyTitle(chartPanel);
				chartPanel.loadChartSWFIntoFlash();
			}
		}
	},
	
	panel_totalCostTypeData_afterRefresh: function(panel){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_totalCostConsumpData_afterRefresh: function(panel){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_elecCostRateData_afterRefresh: function(panel){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_gasCostRateData_afterRefresh: function(panel){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_elecLoadFactorData_afterRefresh: function(panel){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_elecConsumWeatherModelData_afterRefresh: function(panel){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_elecDemandWeatherModelData_afterRefresh: function(panel){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_gasWeatherModelData_afterRefresh: function(panel){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	}
});



function selectLocation() {
	scenarioController.panel_measureVerifyConsole_onFilter();	
}
