var scenarioController = View.createController('scenarioCtrl',{
	m_billType:'',
	
	viewPanels: [
    	"panel_byBuildingBySiteChart",
    	"panel_byBuildingByBillTypeChart",
    	"panel_byBuildingByVendorChart",
    	"panel_byBuildingByBuildingUseChart",
    	"panel_byPeriodByBuildingChart",
    	"panel_byPeriodByBillTypeChart",
    	"panel_byPeriodByVendorChart",
    	"panel_byPeriodByBuildingUseChart",
    	"panel_bill_archive_popup"
	],
	
	afterViewLoad:function(){
		this.setLabel();
		abEnergyBillCommonController.setBillUnitsParameter(true, this.viewPanels);
	},
 	afterInitialDataFetch: function() {
        	// add beforeTabChange event listener
        	this.tabs.addEventListener('beforeTabChange', this.tabs_beforeTabChange.createDelegate(this));
    },
	tabs_beforeTabChange: function(tabPanel, selectedTabName, newTabName){
			var panel = View.panels.get('panel_' + newTabName);
			panel.refresh(this.restriction);			
	},	
	setLabel: function(){	
    		this.exclude_bill_type_title = getMessage('exclude_bill_type_of_0')+' '+getMessage('exclude_bill_type_of_1');
    		this.show_bill_type_title = getMessage('show_bill_type_of_0')+' '+getMessage('show_bill_type_of_1');
    		
		this.setButtonLabels(new Array('excludeAddBillType','excludeClearBillType'), new Array('add','clear'));
		this.setButtonLabels(new Array('showAddBillType','showClearBillType'), new Array('add','clear'));
		
		$('exclude_bill_type_of_label').innerHTML = '&#160;'+getMessage('exclude_bill_type_of_0')+'<br/>'+getMessage('exclude_bill_type_of_1');
		$('show_bill_type_of_label').innerHTML = '&#160;'+getMessage('show_bill_type_of_0')+'<br/>'+getMessage('show_bill_type_of_1');
		
		abEnergyBillCommonController.setBillUnitsOptions();
    },
    
    setButtonLabels: function(arrButtons, arrLabels){
		var maxLabelIndex = -1;
		var maxLabelLength = -1;
		var maxWidth = 0;
		for(var i=0; i < arrLabels.length; i++){
			var crtText = getMessage(arrLabels[i]);
			if(crtText.length > maxLabelLength){
				maxLabelLength = crtText.length;
				maxLabelIndex = i;
			}
		}
		// set label for maxLabelIndex
		var objButton = document.getElementById(arrButtons[maxLabelIndex]);
		objButton.value = getMessage(arrLabels[maxLabelIndex]);
		maxWidth = objButton.clientWidth;
		for(var i =0;i < arrButtons.length; i++){
			var crtObj = document.getElementById(arrButtons[i]);
			crtObj.value = getMessage(arrLabels[i]);
			crtObj.style.width = maxWidth+10;
		}
    },
    
    panel_utilityMetricsConsole_onFilter: function(){
    	this.tabs.setAllTabsEnabled();
		// apply restriction from console
		this.restriction = new Ab.view.Restriction();
		var console_name = "panel_utilityMetricsConsole";
		var console = View.panels.get(console_name);
		var time_periodFrom = console.getFieldValue('bill_archive.time_period.from');
		var time_periodTo = console.getFieldValue('bill_archive.time_period.to');
		
		var check_show_bill_type = document.getElementById("show_bill_type_check").checked;
		var check_exculde_bill_type = document.getElementById("exclude_bill_type_check").checked;
		var bill_type_storage_ex = trim($('bill_type_storage_exclude').value);
		var bill_type_storage_sh = trim($('bill_type_storage_show').value);
		var billTypeParamEx = '';
		var billTypeParamSh = '';		

		if (time_periodFrom != '') {
			this.restriction.addClause('bill_archive.time_period', time_periodFrom, '&gt;=');	
		}
		if (time_periodTo != '') {
			this.restriction.addClause('bill_archive.time_period', time_periodTo, '&lt;=');		
		}
		
		if (bill_type_storage_ex != "" && check_exculde_bill_type) {
			var regex = /,/g;
			var bill_type = bill_type_storage_ex.replace(regex, "','");
			billTypeParamEx = "AND bill_archive.bill_type_id NOT IN ('" + bill_type + "') ";
			
		}
		if (bill_type_storage_sh != "" && check_show_bill_type) {
			var regex = /,/g;
			var bill_type = bill_type_storage_sh.replace(regex, "','");
			billTypeParamSh = "AND bill_archive.bill_type_id IN ('" + bill_type + "') ";
		}		
		
		abEnergyBillCommonController.setBillUnitsParameter(false, this.viewPanels);

		// create the SQL restriction for the selected location
		var treePanel = View.panels.get('panel_utilityMetricsCtry');
		var selectedNode = treePanel.lastNodeClicked;
		var locationField = '1'; 
		var locationValue = '1';

		if (valueExists(selectedNode)) {
			var selectedLevel = selectedNode.level.levelIndex;
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
		}
		//pass parameters to panels, refresh/show them, and append their titles
		var byBuildingBySiteChartPanel = View.panels.get('panel_byBuildingBySiteChart');
		byBuildingBySiteChartPanel.addParameter('billTypeEx', billTypeParamEx);
		byBuildingBySiteChartPanel.addParameter('billTypeSh', billTypeParamSh);		
		byBuildingBySiteChartPanel.addParameter('locationField', locationField);
		byBuildingBySiteChartPanel.addParameter('locationValue', locationValue);
		//byBuildingBySiteChartPanel.refresh(restriction);
		byBuildingBySiteChartPanel.appendTitle(locationValue);	

		var byBuildingByBillTypeChartPanel = View.panels.get('panel_byBuildingByBillTypeChart');
		byBuildingByBillTypeChartPanel.addParameter('billTypeEx', billTypeParamEx);
		byBuildingByBillTypeChartPanel.addParameter('billTypeSh', billTypeParamSh);				
		byBuildingByBillTypeChartPanel.addParameter('locationField', locationField);
		byBuildingByBillTypeChartPanel.addParameter('locationValue', locationValue);
		//byBuildingByBillTypeChartPanel.refresh(restriction);
		byBuildingByBillTypeChartPanel.appendTitle(locationValue);

		var byBuildingByVendorChartPanel = View.panels.get('panel_byBuildingByVendorChart');
		byBuildingByVendorChartPanel.addParameter('billTypeEx', billTypeParamEx);
		byBuildingByVendorChartPanel.addParameter('billTypeSh', billTypeParamSh);
		byBuildingByVendorChartPanel.addParameter('locationField', locationField);
		byBuildingByVendorChartPanel.addParameter('locationValue', locationValue);
		//byBuildingByVendorChartPanel.refresh(restriction);
		byBuildingByVendorChartPanel.appendTitle(locationValue);

		var byBuildingByBuildingUseChartPanel = View.panels.get('panel_byBuildingByBuildingUseChart');
		byBuildingByBuildingUseChartPanel.addParameter('billTypeEx', billTypeParamEx);
		byBuildingByBuildingUseChartPanel.addParameter('billTypeSh', billTypeParamSh);
		byBuildingByBuildingUseChartPanel.addParameter('locationField', locationField);
		byBuildingByBuildingUseChartPanel.addParameter('locationValue', locationValue);
		//byBuildingByBuildingUseChartPanel.refresh(restriction);
		byBuildingByBuildingUseChartPanel.appendTitle(locationValue);

		var byPeriodByBuildingChartPanel = View.panels.get('panel_byPeriodByBuildingChart');
		byPeriodByBuildingChartPanel.addParameter('billTypeEx', billTypeParamEx);
		byPeriodByBuildingChartPanel.addParameter('billTypeSh', billTypeParamSh);
		byPeriodByBuildingChartPanel.addParameter('locationField', locationField);
		byPeriodByBuildingChartPanel.addParameter('locationValue', locationValue);
		//byPeriodByBuildingChartPanel.refresh(restriction);
		byPeriodByBuildingChartPanel.appendTitle(locationValue);

		var byPeriodByBillTypeChartPanel = View.panels.get('panel_byPeriodByBillTypeChart');
		byPeriodByBillTypeChartPanel.addParameter('billTypeEx', billTypeParamEx);
		byPeriodByBillTypeChartPanel.addParameter('billTypeSh', billTypeParamSh);
		byPeriodByBillTypeChartPanel.addParameter('locationField', locationField);
		byPeriodByBillTypeChartPanel.addParameter('locationValue', locationValue);
		//byPeriodByBillTypeChartPanel.refresh(restriction);
		byPeriodByBillTypeChartPanel.appendTitle(locationValue);

		var byPeriodByVendorChartPanel = View.panels.get('panel_byPeriodByVendorChart');
		byPeriodByVendorChartPanel.addParameter('billTypeEx', billTypeParamEx);
		byPeriodByVendorChartPanel.addParameter('billTypeSh', billTypeParamSh);
		byPeriodByVendorChartPanel.addParameter('locationField', locationField);
		byPeriodByVendorChartPanel.addParameter('locationValue', locationValue);
		//byPeriodByVendorChartPanel.refresh(restriction);
		byPeriodByVendorChartPanel.appendTitle(locationValue);

		var byPeriodByBuildingUseChartPanel = View.panels.get('panel_byPeriodByBuildingUseChart');
		byPeriodByBuildingUseChartPanel.addParameter('billTypeEx', billTypeParamEx);
		byPeriodByBuildingUseChartPanel.addParameter('billTypeSh', billTypeParamSh);
		byPeriodByBuildingUseChartPanel.addParameter('locationField', locationField);
		byPeriodByBuildingUseChartPanel.addParameter('locationValue', locationValue);
		//byPeriodByBuildingUseChartPanel.refresh(restriction);
		byPeriodByBuildingUseChartPanel.appendTitle(locationValue);

		var billArchivePopupPanel = View.panels.get('panel_bill_archive_popup');
		billArchivePopupPanel.addParameter('billTypeEx', billTypeParamEx);
		billArchivePopupPanel.addParameter('billTypeSh', billTypeParamSh);		
		billArchivePopupPanel.addParameter('locationField', locationField);
		billArchivePopupPanel.addParameter('locationValue', locationValue);
		billArchivePopupPanel.appendTitle(locationValue);	
			
		var selectedTab = this.tabs.selectedTabName;
		var selectedTabPanel = View.panels.get('panel_' + selectedTab);
		selectedTabPanel.refresh(this.restriction);
    },
	addBillType: function(billType,title_label) {
		// select cost categories in the grid
		this.formSelectValueMultiple_grid.refresh();
		var values = $(billType).value;
		this.m_billType = billType;
		this.setSelectedItems(this.formSelectValueMultiple_grid, 'bill_archive.bill_type_id', values);
		this.formSelectValueMultiple_grid.showInWindow({width: 600, height: 400});
	},
	setSelectedItems: function (grid, fieldName, values) {
		// prepare the values map for fast indexing
		var valuesMap = {};
		var valuesArray = values.split(',');
		for (var i = 0; i < valuesArray.length; i++) {
			var value = valuesArray[i];
			valuesMap[value] = value;
		}
		// select rows
		grid.gridRows.each(function (row) {
			var value = row.getRecord().getValue(fieldName);
			// if we have this value in the list, select the row
			if (valueExists(valuesMap[value])) {
				row.select();
			}
		});
	},
	formSelectValueMultiple_grid_onAddSelected: function () {
		// get selected cost categories from the grid
		var values = this.getSelectedItems(this.formSelectValueMultiple_grid, 'bill_archive.bill_type_id');
		$(this.m_billType).value = values;
		this.formSelectValueMultiple_grid.closeWindow();
	},
	getSelectedItems: function (grid, fieldName) {
		var values = '';
		grid.gridRows.each(function (row) {
			if (row.isSelected()) {
				var value = row.getRecord().getValue(fieldName);
				if (values != '') {
					values += ',';
				}
				values += value;
			}
		});
		return values;
	},
	clearBillType: function (billType) {
		billType.value = '';
	},
	
	panel_byBuildingBySiteChart_afterGetData: function(panel, dataSet){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_byBuildingByBillTypeChart_afterGetData: function(panel, dataSet){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_byBuildingByVendorChart_afterGetData: function(panel, dataSet){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_byBuildingByBuildingUseChart_afterGetData: function(panel, dataSet){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_byPeriodByBuildingChart_afterGetData: function(panel, dataSet){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_byPeriodByBillTypeChart_afterGetData: function(panel, dataSet){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_byPeriodByVendorChart_afterGetData: function(panel, dataSet){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	panel_byPeriodByBuildingUseChart_afterGetData: function(panel, dataSet){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	},
	
	panel_bill_archive_popup_afterRefresh: function(panel){
		abEnergyBillCommonController.setQtyEnergyTitle(panel);
	}
});
function user_addBillType_ex() {
	var controller = View.controllers.get('scenarioCtrl');
	controller.addBillType($('bill_type_storage_exclude'),'');
}
function user_addBillType_sh() {
	var controller = View.controllers.get('scenarioCtrl');
	controller.addBillType($('bill_type_storage_show'),'');
}
function user_clearBillType_ex() {
	var controller = View.controllers.get('scenarioCtrl');
	controller.clearBillType($('bill_type_storage_exclude'));
	document.getElementById("exclude_bill_type_check").checked = false;
}
function user_clearBillType_sh() {
	var controller = View.controllers.get('scenarioCtrl');
	controller.clearBillType($('bill_type_storage_show'));
	document.getElementById("show_bill_type_check").checked = false;
}
function selectLocation() {
	var controller = View.controllers.get('scenarioCtrl');
	controller.panel_utilityMetricsConsole_onFilter();
}
function check_exclude(){
	if(document.getElementById("exclude_bill_type_check").checked){
		document.getElementById("show_bill_type_check").checked = false;
	}
}
function check_show(){
	if(document.getElementById("show_bill_type_check").checked){
		document.getElementById("exclude_bill_type_check").checked = false;
	}
}