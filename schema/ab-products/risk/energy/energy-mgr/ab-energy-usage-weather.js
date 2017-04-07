var scenarioController = View.createController('scenarioCtrl',{
	restriction:'',
	restriction2:'',
	oldBillType: 'ELECTRIC',
	
	viewPanels: [
    	"panel_elecLoadFactorData",
    	"panel_elecConsumWeatherModelData",
    	"panel_elecDemandWeatherModelData",
    	"panel_elecConsumWeatherModelChart",
    	"panel_elecDemandWeatherModelChart",
    	"panel_gasWeatherModelData",
    	"panel_gasWeatherModelChart"
	],
	viewPanelsForCost:[],
	afterViewLoad:function(){
		var elecLoadFactorChartPanel = View.panels.get('panel_elecLoadFactorChart');
		elecLoadFactorChartPanel.show(false);
		var elecConsumLoadWeatherModelPanel = View.panels.get('panel_elecConsumWeatherModelChart');
		elecConsumLoadWeatherModelPanel.show(false);
		var elecDemandLoadWeatherModelPanel = View.panels.get('panel_elecDemandWeatherModelChart');
		elecDemandLoadWeatherModelPanel.show(false);	
		var gasLoadWeatherModelPanel = View.panels.get('panel_gasWeatherModelChart');
		gasLoadWeatherModelPanel.show(false);
		
		this.setBillUnitOption();
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
			var billTypeRestriction, gasCons, gasReg, gasNumDays, panelTitle;
			var tab = View.panels.get('tabs').findTab('gasWeatherModelChart');
			if(value == 'All'){
				billTypeRestriction = "1=1";
			}
			if(value == 'ELECTRIC'){
				billTypeRestriction = "bill_archive.bill_type_id='ELECTRIC'";
			}
			if(value == 'GAS - NATURAL'){
				billTypeRestriction = "bill_archive.bill_type_id='GAS - NATURAL'";
				gasCons = "gas_actual_consumption";
				gasReg = "gas_natural_regression";
				gasNumDays = "gas_num_days";
				tab.setTitle(getMessage('gas_title'));
				panelTitle = getMessage('gas_title');
			}
			if(value == 'FUEL OIL 1'){
				billTypeRestriction = "bill_archive.bill_type_id='FUEL OIL 1'";
				gasCons = "fuel_oil_1_actual_consumption";
				gasReg = "fuel_oil_1_regression";
				gasNumDays = "fuel_oil_1_num_days";
				tab.setTitle(getMessage('fuel1_title'));
				panelTitle = getMessage('fuel1_title');
			}
			if(value == 'FUEL OIL 2'){
				billTypeRestriction = "bill_archive.bill_type_id='FUEL OIL 2'";
				gasCons = "fuel_oil_2_actual_consumption";
				gasReg = "fuel_oil_2_regression";
				gasNumDays = "fuel_oil_2_num_days";
				tab.setTitle(getMessage('fuel2_title'));
				panelTitle = getMessage('fuel2_title');
			}
			if(value == 'GAS - PROPANE'){
				billTypeRestriction = "bill_archive.bill_type_id='GAS - PROPANE'";
				gasCons = "propane_actual_consumption";
				gasReg = "gas_propane_regression";
				gasNumDays = "propane_num_days";
				tab.setTitle(getMessage('propane_title'));
				panelTitle = getMessage('propane_title');
			}
			panelTitle = panelTitle + " - " + locationValue;

			
			//pass parameters to panels, refresh/show them, and append their titles
			if(value =='ELECTRIC'){
				View.panels.get('tabs').showTab('elecLoadFactorChart',true);
				if(this.oldBillType != 'ELECTRIC') {
					View.panels.get('tabs').selectTab('elecLoadFactorChart',true);
					this.oldBillType = 'ELECTRIC';
				}
				View.panels.get('tabs').showTab('elecLoadFactorChart',true);
				var elecLoadFactorChartPanel = View.panels.get('panel_elecLoadFactorChart');
				elecLoadFactorChartPanel.show(true);
				elecLoadFactorChartPanel.addParameter('locationField', locationField);
				elecLoadFactorChartPanel.addParameter('locationValue', locationValue);
				elecLoadFactorChartPanel.addParameter('billType', billTypeRestriction);
				
				//elecLoadFactorChartPanel.refresh(restriction2);
				elecLoadFactorChartPanel.appendTitle(locationValue);	
	
				View.panels.get('tabs').showTab('elecConsumWeatherModelChart',true);
				var elecConsumWeatherModelChartPanel = View.panels.get('panel_elecConsumWeatherModelChart');
				elecConsumWeatherModelChartPanel.show(true);
				elecConsumWeatherModelChartPanel.addParameter('locationField', locationField);
				elecConsumWeatherModelChartPanel.addParameter('locationValue', locationValue);
				//elecConsumWeatherModelChartPanel.refresh(restriction2);
				elecConsumWeatherModelChartPanel.appendTitle(locationValue);	
	
				View.panels.get('tabs').showTab('elecDemandWeatherModelChart',true);
				var elecDemandWeatherModelChartPanel = View.panels.get('panel_elecDemandWeatherModelChart');
				elecDemandWeatherModelChartPanel.show(true);
				elecDemandWeatherModelChartPanel.addParameter('locationField', locationField);
				elecDemandWeatherModelChartPanel.addParameter('locationValue', locationValue);
				//elecDemandWeatherModelChartPanel.refresh(restriction2);
				elecDemandWeatherModelChartPanel.appendTitle(locationValue);
				View.panels.get('tabs').showTab('gasWeatherModelChart',false);
			}else{
				View.panels.get('tabs').showTab('elecLoadFactorChart',false);
				View.panels.get('tabs').showTab('elecConsumWeatherModelChart',false);
				View.panels.get('tabs').showTab('elecDemandWeatherModelChart',false);
				View.panels.get('tabs').showTab('gasWeatherModelChart',true);
				if(this.oldBillType == 'ELECTRIC') {
					View.panels.get('tabs').selectTab('gasWeatherModelChart',true);
					this.oldBillType = 'GAS';
				}			
				View.panels.get('tabs').showTab('gasWeatherModelChart',true);
				var gasWeatherModelChartPanel = View.panels.get('panel_gasWeatherModelChart');
				gasWeatherModelChartPanel.show(true);
				gasWeatherModelChartPanel.addParameter('locationField', locationField);
				gasWeatherModelChartPanel.addParameter('locationValue', locationValue);
				gasWeatherModelChartPanel.addParameter('gasCons', gasCons);
				gasWeatherModelChartPanel.addParameter('gasReg', gasReg);
				gasWeatherModelChartPanel.addParameter('gasNumDays', gasNumDays);
				//gasWeatherModelChartPanel.refresh(restriction2);
				gasWeatherModelChartPanel.setTitle(panelTitle);
				//gasWeatherModelChartPanel.appendTitle(locationValue);
			}

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
	},
	
	setBillUnitOption: function(billTypeId, selectId){
    	var selectNode = (selectId == undefined ? $('select_bill_units') : $(selectId));
    	selectNode.options.length = 0;
    	
    	if (billTypeId == undefined || billTypeId == '') { // by default
    		billTypeId = 'ELECTRIC';
    	} 
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause("bill_unit.bill_type_id", billTypeId);
    	// Show only units with rollup_type of Energy or Volume (skip the None with 0 conversion factor and the Power one)
    	restriction.addClause("bill_unit.rollup_type", 'Energy', "="); 
    	
		var unitsRecords = this.view.dataSources.get("abEnergyBillCommon_ds_allUnits").getRecords(restriction);
    	for (var i = 0; i < unitsRecords.length; i++) {
			var unitRecord = unitsRecords[i];
			var unit = unitRecord.getValue("bill_unit.bill_unit_id");
			var isDflt = (unitRecord.getValue("bill_unit.is_dflt") == "1");
			
			//if(unit != "MMBTU"){
				var optionNode = document.createElement('option');
				optionNode.value = unit;
				optionNode.selected = isDflt;
				optionNode.appendChild(document.createTextNode(unit));
				selectNode.appendChild(optionNode);
			//} else {
				//selectNode.options[0].selected = isDflt;
			//}
		}
    }
});



function selectLocation() {
	scenarioController.panel_measureVerifyConsole_onFilter();	
}

function changeUnits(){
	scenarioController.setBillUnitOption($('select_bill_type').value);
}
