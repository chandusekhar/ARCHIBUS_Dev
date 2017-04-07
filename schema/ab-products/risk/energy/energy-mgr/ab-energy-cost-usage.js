var scenarioController = View.createController('scenarioCtrl',{
	restriction:'',
	restriction2:'',
	
	viewPanels: [
    	"panel_totalCostTypeData",
    	"panel_totalCostConsumpChart",
    	"panel_totalCostConsumpData",
    	"panel_elecCostRateData",
    	"panel_gasCostRateData",
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
		
		abEnergyBillCommonController.setBillUnitsOptions($('select_bill_type').value);
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
			
			var value = $('select_bill_type').value;
			var billTypeRestriction, billType, panelRateTitle, panelCostTitle;
			var tab = View.panels.get('tabs').findTab('gasCostRateChart');
			var tab2 = View.panels.get('tabs').findTab('totalCostConsumpChart');
			if(value == 'All'){
				billTypeRestriction = "1=1";
				tab.setTitle(getMessage('gas_title'));
				panelRateTitle = getMessage('gas_title');
				tab2.setTitle(getMessage('cons_electric_title'));
				panelCostTitle = getMessage('cons_electric_title');
			}
			if(value == 'ELECTRIC'){
				billTypeRestriction = "bill_archive.bill_type_id='ELECTRIC'";
				billType = "ELECTRIC";
				tab.setTitle(getMessage('electric_title'));
				panelRateTitle = getMessage('electric_title');
				tab2.setTitle(getMessage('cons_electric_title'));
				panelCostTitle = getMessage('cons_electric_title');
			}
			if(value == 'GAS - NATURAL'){
				billTypeRestriction = "bill_archive.bill_type_id='GAS - NATURAL'";
				billType = "GAS - NATURAL";
				tab.setTitle(getMessage('gas_title'));
				panelRateTitle = getMessage('gas_title');
				tab2.setTitle(getMessage('cons_gas_title'));
				panelCostTitle = getMessage('cons_gas_title');
			}
			if(value == 'FUEL OIL 1'){
				billTypeRestriction = "bill_archive.bill_type_id='FUEL OIL 1'";
				billType = "FUEL OIL 1";
				tab.setTitle(getMessage('fuel1_title'));
				panelRateTitle = getMessage('fuel1_title');
				tab2.setTitle(getMessage('cons_fuel1_title'));
				panelCostTitle = getMessage('cons_fuel1_title');
			}
			if(value == 'FUEL OIL 2'){
				billTypeRestriction = "bill_archive.bill_type_id='FUEL OIL 2'";
				billType = "FUEL OIL 2";
				tab.setTitle(getMessage('fuel2_title'));
				panelRateTitle = getMessage('fuel2_title');
				tab2.setTitle(getMessage('cons_fuel2_title'));
				panelCostTitle = getMessage('cons_fuel2_title');
			}
			if(value == 'GAS - PROPANE'){
				billTypeRestriction = "bill_archive.bill_type_id='GAS - PROPANE'";
				billType = "GAS - PROPANE";
				tab.setTitle(getMessage('propane_title'));
				panelRateTitle = getMessage('propane_title');
				tab2.setTitle(getMessage('cons_propane_title'));
				panelCostTitle = getMessage('cons_propane_title');
			}
			if(value == 'WATER'){
				billTypeRestriction = "bill_archive.bill_type_id='WATER'";
				billType = "WATER";
			}
			
			panelRateTitle = panelRateTitle + " - " + locationValue;
			panelCostTitle = panelCostTitle + " - " + locationValue;

			View.panels.get('tabs').showTab('totalCostTypeChart',true)
			View.panels.get('tabs').selectTab('totalCostTypeChart',true);
			

			View.panels.get('tabs').showTab('totalCostConsumpChart',true);
			var totalCostConsumpChartPanel = View.panels.get('panel_totalCostConsumpChart');	
			totalCostConsumpChartPanel.show(true);
			totalCostConsumpChartPanel.addParameter('locationField', locationField);
			totalCostConsumpChartPanel.addParameter('locationValue', locationValue);
			totalCostConsumpChartPanel.addParameter('billType', billTypeRestriction);
			totalCostConsumpChartPanel.setTitle(panelCostTitle);
			//totalCostConsumpChartPanel.refresh(restriction);
			//totalCostConsumpChartPanel.appendTitle(locationValue);	
			
			View.panels.get('tabs').showTab('totalCostTypeChart',true);
			var totalCostTypeChartPanel = View.panels.get('panel_totalCostTypeChart');	
			totalCostTypeChartPanel.show(true);
			totalCostTypeChartPanel.addParameter('locationField', locationField);
			totalCostTypeChartPanel.addParameter('locationValue', locationValue);
			//totalCostTypeChartPanel.refresh(restriction);
			totalCostTypeChartPanel.appendTitle(locationValue);	
			//pass parameters to panels, refresh/show them, and append their titles
			if(value == 'ELECTRIC'){
	
				View.panels.get('tabs').showTab('elecCostRateChart',true);
				var elecCostRateChartPanel = View.panels.get('panel_elecCostRateChart');
				elecCostRateChartPanel.show(true);
				elecCostRateChartPanel.addParameter('locationField', locationField);
				elecCostRateChartPanel.addParameter('locationValue', locationValue);
				elecCostRateChartPanel.addParameter('billType', billTypeRestriction);
				elecCostRateChartPanel.setTitle(panelRateTitle);
				//elecCostRateChartPanel.refresh(restriction);
				//elecCostRateChartPanel.appendTitle(locationValue);	
				
				View.panels.get('tabs').showTab('gasCostRateChart',false);
			}else{
				View.panels.get('tabs').showTab('elecCostRateChart',false);
				//View.panels.get('tabs').showTab('totalCostTypeChart',false);
				View.panels.get('tabs').showTab('gasCostRateChart',true);
				var gasCostRateChartPanel = View.panels.get('panel_gasCostRateChart');
				gasCostRateChartPanel.show(true);
				gasCostRateChartPanel.addParameter('locationField', locationField);
				gasCostRateChartPanel.addParameter('locationValue', locationValue);
				gasCostRateChartPanel.addParameter('billType', billType);
				gasCostRateChartPanel.setTitle(panelRateTitle);
				//gasCostRateChartPanel.refresh(restriction);
				//gasCostRateChartPanel.appendTitle(locationValue);
			}

			
			if(value == 'WATER'){
			View.panels.get('tabs').showTab('elecCostRateChart',false);
			View.panels.get('tabs').showTab('totalCostConsumpChart',false);
			View.panels.get('tabs').showTab('gasCostRateChart',false);
			}

			var totalCostTypeDataPanel = View.panels.get('panel_totalCostTypeData');
			totalCostTypeDataPanel.addParameter('locationField', locationField);
			totalCostTypeDataPanel.addParameter('locationValue', locationValue);
			totalCostTypeDataPanel.appendTitle(locationValue);

			var totalCostConsumpDataPanel = View.panels.get('panel_totalCostConsumpData');
			totalCostConsumpDataPanel.addParameter('locationField', locationField);
			totalCostConsumpDataPanel.addParameter('locationValue', locationValue);
			totalCostConsumpDataPanel.addParameter('billType', billTypeRestriction);
			totalCostConsumpDataPanel.appendTitle(locationValue);	

			var elecCostRateDataPanel = View.panels.get('panel_elecCostRateData');
			elecCostRateDataPanel.addParameter('locationField', locationField);
			elecCostRateDataPanel.addParameter('locationValue', locationValue);
			elecCostRateDataPanel.addParameter('billType', billTypeRestriction);
			elecCostRateDataPanel.appendTitle(locationValue);

			var gasCostRateDataPanel = View.panels.get('panel_gasCostRateData');
			gasCostRateDataPanel.addParameter('locationField', locationField);
			gasCostRateDataPanel.addParameter('locationValue', locationValue);
			gasCostRateDataPanel.addParameter('billType', billType);
			gasCostRateDataPanel.appendTitle(locationValue);	

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
		abEnergyBillCommonController.setBillUnitsParameter(false, this.viewPanels, this.viewPanelsForCost, $('select_bill_type').value);
		
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

function changeUnits(){
	abEnergyBillCommonController.setBillUnitsOptions($('select_bill_type').value);
}

