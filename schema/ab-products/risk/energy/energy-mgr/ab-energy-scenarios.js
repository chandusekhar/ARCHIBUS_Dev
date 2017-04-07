var scenarioController = View.createController('scenarioCtrl',{
	m_billType:'',
	restriction:'',
	afterViewLoad:function(){
		this.setLabel();
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
    	panel_scenariosConsole_onFilter: function(){
		// apply restriction from console
		this.restriction = new Ab.view.Restriction();
		var console_name = "panel_scenariosConsole";
		var console = View.panels.get(console_name);
		var time_periodFrom = console.getFieldValue('bill_archive.time_period.from');
		var time_periodTo = console.getFieldValue('bill_archive.time_period.to');
		var pctExpChange = $('pctExpChange').value;
		var pctOccChange = $('pctOccChange').value;
		
		var check_show_bill_type = document.getElementById("show_bill_type_check").checked;
		var check_exculde_bill_type = document.getElementById("exclude_bill_type_check").checked;
		var bill_type_storage_ex = trim($('bill_type_storage_exclude').value);
		var bill_type_storage_sh = trim($('bill_type_storage_show').value);
		var billTypeParamEx = '';
		var billTypeParamSh = '';		
		
		//ensure that a null is never passed
		if (pctOccChange == '') {
			pctOccChange = '0.00'; // default value
		}
		if (pctExpChange == '') {
			pctExpChange = '0.00'; // default value
		}

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

		// create the SQL restriction for the selected location
		var treePanel = View.panels.get('panel_scenariosCtry');
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
			var expCrosstabPanel = View.panels.get('panel_expCrosstab');
			expCrosstabPanel.addParameter('billTypeEx', billTypeParamEx);
			expCrosstabPanel.addParameter('billTypeSh', billTypeParamSh);
			expCrosstabPanel.addParameter('locationField', locationField);
			expCrosstabPanel.addParameter('locationValue', locationValue);
			expCrosstabPanel.addParameter('pctExpChange', pctExpChange);
			//expCrosstabPanel.refresh(restriction);
			expCrosstabPanel.appendTitle(locationValue);

			var expOccCrosstabPanel = View.panels.get('panel_expOccCrosstab');
			expOccCrosstabPanel.addParameter('billTypeEx', billTypeParamEx);
			expOccCrosstabPanel.addParameter('billTypeSh', billTypeParamSh);
			expOccCrosstabPanel.addParameter('locationField', locationField);
			expOccCrosstabPanel.addParameter('locationValue', locationValue);
			expOccCrosstabPanel.addParameter('pctExpChange', pctExpChange);
			expOccCrosstabPanel.addParameter('pctOccChange', pctOccChange);
			//expOccCrosstabPanel.refresh(restriction);
			expOccCrosstabPanel.appendTitle(locationValue);
			
			var selectedTab = this.tabs.selectedTabName;
			var selectedTabPanel = View.panels.get('panel_' + selectedTab);
			selectedTabPanel.refresh(this.restriction);			
		}
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
function filter(){
	var controller = View.controllers.get('scenarioCtrl');
	controller.panel_scenariosConsole_onFilter();
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
