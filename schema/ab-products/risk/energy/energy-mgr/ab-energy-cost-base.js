var energyCostBaseController = Ab.view.Controller.extend({ 
	consoleBlRestriction: ' 1=1 ',
	treeRestriction: ' 1=1 ',
	consoleBillArchiveRestriction: ' 1=1 ',
	detailOptionSelected : 'byBuilding',
	treeRefreshRequired: false,
	
	viewPanels: [],
	viewPanelsForCost: [],
	
	billTypeId: 'ELECTRIC',
	
	showOnLoad: true,
	
	afterInitialDataFetch: function() {
		//Clear the console
		this.energyConsole_onClear();
		// Initialize some default console fields values
	    var today = new Date();
	    var month = today.getMonth() + 1;
	    if (month < 10) month= "0" + month;
	    var period_to = today.getFullYear() + "-" + month;
	    var period_from = (today.getFullYear() - 1) + "-" + month;
	    var console = View.panels.get('energyConsole');
	    console.setFieldValue("bill_archive.time_period.from", period_from);
	    console.setFieldValue("bill_archive.time_period.to", period_to);
	    //show the tree collapsed and all values not selected
		// onTreeExpandAll('energyTree', false);
		// onTreeSelectAll('energyTree', false);		
		// appendChartTitle('energyCostLoc_chart', 'energyCostLoc_locDtlSelect', 'energyCostLoc_normAreaCheck');
		//call the onShow to show the chart
	    if (this.showOnLoad) {
	    	this.energyConsole_onShow();
	    }
	    
	    appendChartTitle('energyCost_chart', '');
	    
	    this.initializeDefaults();
	},
	
	initializeDefaults: function() {
		// to be overridden 
	},
	
	showOnLoad: function(value) {
		this.showOnLoad = value;
	}, 
	
	initializeTree: function() {
		onTreeExpandAll('energyTree', false);
		onTreeSelectAll('energyTree', false);
		
		this.energyTree.setMultipleSelectionEnabled(0);
		this.energyTree.setMultipleSelectionEnabled(1);
		this.energyTree.setMultipleSelectionEnabled(2);
		this.energyTree.setMultipleSelectionEnabled(3);
		this.energyTree.setMultipleSelectionEnabled(4);
		this.energyTree.setMultipleSelectionEnabled(5);
		// since the tree is always dynamic expand when a checkbox is clicked
		this.energyTree.addEventListener('onChangeMultipleSelection', this.onExpandNode.createDelegate(this));		 
	},
	
	initializeBillUnitsOptions: function(selectId) { 
		this.billTypeId = this.energyConsole.getFieldValue("bill_archive.bill_type_id");
		//Call function to initialize the list of energy units, or if selectId is entered to this different list
		if (selectId == undefined)
			abEnergyBillCommonController.setBillUnitsOptions(this.billTypeId);
		else
			abEnergyBillCommonController.setBillUnitsOptions(this.billTypeId, selectId);
		abEnergyBillCommonController.setBillUnitsParameter(true, this.viewPanels, this.viewPanelsForCost, this.billTypeId);
	},
	
	setBillUnitsParameter: function(selectId, parameterId) {
		this.billTypeId = this.energyConsole.getFieldValue("bill_archive.bill_type_id");	
		if ((parameterId == undefined) && (selectId == undefined))
			abEnergyBillCommonController.setBillUnitsParameter(false, this.viewPanels, this.viewPanelsForCost, this.billTypeId);
		else
			abEnergyBillCommonController.setBillUnitsParameter(false, this.viewPanels, this.viewPanelsForCost, this.billTypeId, selectId, parameterId);
	}, 
	
	onExpandNode: function(treeNode){		 
		onTreeExpandAll('energyTree', true, treeNode);
	}, 	  
	
	setBillUnitsOptionsType: function(bill_type_id){		 
		abEnergyBillCommonController.unitsConversionFactorSql = "(CASE WHEN (SELECT conversion_factor FROM bill_unit WHERE bill_unit.bill_type_id = '"+bill_type_id+"' AND {0}) IS NULL"
		+ " THEN ${sql.replaceZero('0')}"
		+ " ELSE (SELECT ${sql.replaceZero('conversion_factor')} FROM bill_unit WHERE bill_unit.bill_type_id = '"+bill_type_id+"'  AND {0})"
		+ " END)";

		abEnergyBillCommonController.unitsConversionFactorSqlForCost = "(CASE WHEN (SELECT conversion_factor FROM bill_unit WHERE bill_unit.bill_type_id = '"+bill_type_id+"'  AND {0}) IS NULL"
		+ " THEN 0"
		+ " ELSE (SELECT conversion_factor FROM bill_unit WHERE bill_unit.bill_type_id = '"+bill_type_id+"'  AND {0})"
		+ " END)";
	},
	
	hideConsoleField: function(fieldName){
		this.setConsoleField(fieldName, 'none');
	},
	
	showConsoleField: function(fieldName){
		this.setConsoleField(fieldName, 'table-cell');
	},
	
	setConsoleField: function(fieldName, displayType){
		if (this.energyConsole.getFieldElement(fieldName) != null) {
			this.energyConsole.showField(fieldName, false)
		} else {
			var formElement = $(fieldName);
			if (formElement != undefined) {
				var formCell = formElement.parentNode;
				var labelCell = formCell.previousSibling;
				labelCell.style.display = displayType;
				formCell.style.display = displayType;
			}
		}		
	},
	
	hideConsoleRow: function(rowNumber){
		var id = this.energyConsole.getParentElementId();
		var table = $(id);
		if (rowNumber < table.rows.length) {
			table.rows[rowNumber].style.display = 'none';
		}		
	}, 
	
	energyConsole_onClear: function() {
		//Clear the console and set default values
		this.energyConsole.clear();
		$('energyCostLoc_locDtlSelect_bl').selected = true;
		$('energyCostLoc_normAreaCheck').checked = true;
	},
	
	energyConsole_onShow: function() {
		//If any of the bl filter fields in the console value has changed
		if (this.treeRefreshRequired) {
			//If the restriction from bl fields in the console has changed, refresh the tree after applying the restriction
			var consoleBlRestriction = getConsoleBlRestriction('energyConsole');
			if (consoleBlRestriction != this.consoleBlRestriction) {
				this.energyTree.addParameter('consoleBlRestriction', consoleBlRestriction);
				this.consoleBlRestriction = consoleBlRestriction;
				this.energyTree.refresh();
			}
			onTreeExpandAll('energyTree', true);
			onTreeSelectAll('energyTree', true);
			this.treeRefreshRequired = false;
		}
		//call the onShowSelected function from the tree
		this.energyTree_onShowSelected();
	},
	 
	getFinalRestriction: function(includeTimePeriod) {		 
		//Apply to the chart the restrictions from the console and the tree
		var finalRestriction = getConsoleBlRestriction('energyConsole');
		this.consoleBillArchiveRestriction = getConsoleBillArchiveRestriction('energyConsole', includeTimePeriod);
		this.treeRestriction = getTreeRestriction('energyTree');
		finalRestriction += " AND " + this.treeRestriction;
		finalRestriction += " AND " + this.consoleBillArchiveRestriction;
		
		return finalRestriction;
	},
	
	getPreviousRestriction: function() {
		var finalRestriction = getConsoleBlRestriction('energyConsole');
		// don't include time period restriction
		this.consoleBillArchiveRestriction = getConsoleBillArchiveRestriction('energyConsole', false);
		this.treeRestriction = getTreeRestriction('energyTree');
		finalRestriction += " AND " + this.treeRestriction;
		finalRestriction += " AND " + this.consoleBillArchiveRestriction;
		
		var bill_period_from = this.energyConsole.getFieldValue('bill_archive.time_period.from');
		var bill_period_to = this.energyConsole.getFieldValue('bill_archive.time_period.to');
		// use the previous year restriction
		if (bill_period_from != '') finalRestriction += " AND bill_archive.time_period >= '" + this.getPreviousYear(bill_period_from) + "' ";
		if (bill_period_to != '') finalRestriction += " AND bill_archive.time_period <= '" + this.getPreviousYear(bill_period_to) + "' ";
 		
		return finalRestriction;
	},
	
	setPreviousYearFromField: function() {
		var periodTo = this.energyConsole.getFieldValue('bill_archive.time_period.to');
		if (periodTo != '') {
			this.energyConsole.setFieldValue('bill_archive.time_period.from', this.getPreviousYear(periodTo));
			return true;
		} else {
			View.showMessage(getMessage('selectRequiredPeriodTo'));
			return false;
		}		
	},
	
	getPreviousYear: function(timePeriod) {
		var parts = timePeriod.split('-');		
		return (parseInt(parts[0])-1) + '-' + parts[1];		
	},
	
	getPeriodRestriction: function() {
		var restriction = " 1=1 ";
		var bill_period_from = this.energyConsole.getFieldValue('bill_archive.time_period.from');
		var bill_period_to = this.energyConsole.getFieldValue('bill_archive.time_period.to');
		 	
		if (bill_period_from != '') restriction += " AND bill_archive.time_period >= '" + bill_period_from + "' ";
		if (bill_period_to != '') restriction += " AND bill_archive.time_period <= '" + bill_period_to + "' ";
	   	
		return restriction;
	},
	
	adjustBalloonText: function(graphDataItem, graph){ 
		 var parts = graphDataItem.category.split('-');		 
		 var timePeriod = (parseInt(parts[0])-1) + "-" + parts[1];			 
		 var value = graphDataItem.values.value;
		 if (value > 1000) {
			 value = parseInt(value/100)/10 + 'K'
		 }
		 var title = graphDataItem.graph.title;
		 return  "<b>"+title+"</b><br>"+timePeriod+"<br><b>"+value+"</b>";
	},

	energyTree_onShowSelected: function() {
		 // to be implemented		
	}
});

//When any of the filter fields from the bl table is updated, a tree refresh is required
function changeBlValue() {
	var controller = View.controllers.get('energyCostLoc');
	controller.treeRefreshRequired = true;
}

//Update the chart title based on the selected options in the filter console
function appendChartTitle(chartId, groupByField, normField) {
	var chart = View.panels.get(chartId);
	if (chart == undefined) {
		return;
	}
	
	if (groupByField != undefined && $(groupByField) != undefined) {
		var groupBy = $(groupByField).value;
		var title = ' ' + getMessage(groupBy);
		if (getMessage('unitTitle') != null && getMessage('unitTitle') != 'unitTitle') {
			title += " (" + getMessage('unitTitle');
			if (normField != undefined && $(normField).checked) {
				title += "/";
				title += (View.project.units == 'imperial')? getMessage('unitTitleImperial') : getMessage('unitTitleMetric');
			}
			title += ")";
		} 
		chart.appendTitle(title);
	}	
	
	var selectNode = $('select_bill_units');
    if (selectNode != undefined && selectNode.selectedIndex >= 0) {
        var userUnitsChoise = selectNode.options[selectNode.selectedIndex].value;
        chart.setTitle(chart.getTitle().replace("{0}", userUnitsChoise));
    }
}
