var energyAnnualSummaryController = View.extendController('energyAnnualSummaryController', energyCostBaseController, {

	previousUnit : '',
	period_from : '',
	period_to : '',
	finalRestriction : '',

	viewPanels: [
	   "energyAnnualSummary"
	],
	
	afterViewLoad: function() {
	    
	    this.initializeBillUnitsOptions();
		this.showOnLoad(false);

		this.hideConsoleField("bill_archive.time_period.from"); 
		this.hideConsoleField("bill_archive.time_period.to"); 
		this.hideConsoleRow(3); 
		this.hideConsoleRow(4); 
		this.hideConsoleField("bill_archive.bill_type_id"); 
		this.hideConsoleField("bill_archive.bill_type_ids"); 
		this.hideConsoleRow(6);
		View.controllers.get('abEnergyCostConsole').vnRestriction = "bill_archive.bill_type_id = 'ELECTRIC'";
	},
	
	energyConsole_onShow: function() {
			
		var year = this.energyConsole.getFieldValue('bill_archive.year');
		if ((year == '') || (year < 1000) || (year > 3000)) { alert(getMessage('enterYear'));	return; };

		var blId = this.energyConsole.getFieldValue('bill_archive.bl_id');
		if (blId == '')	{ alert(getMessage('enterBl')); return; }; 

		// Calculate the time periods (year-month) to consider, and the number of hours in the period
		this.period_from = year + "-01";
		this.period_to = year + "-12";
		var dateFrom = new Date(year + "-01-01");
		var dateTo = new Date(year + "-12-31");
		
		//see if Fiscal Year or Calendar Year is selected, change the period to the correct one if Fiscal Year option is selected
		var periodSelected = $('energyConsole_periodSelect').value;
		if (periodSelected == 'fiscalYear')
		{
			var fiscalYearDs = View.dataSources.get("ds_energySummary_FiscalYear");
			var record = fiscalYearDs.getRecord();
			if (valueExists(record)) {
				var fiscalYearStartMonth = record.getValue("afm_scmpref.fiscalyear_startmonth");
				if (fiscalYearStartMonth < 10) fiscalYearStartMonth = "0" + fiscalYearStartMonth;
				var fiscalYearStartDay = record.getValue("afm_scmpref.fiscalyear_startday");
				if (fiscalYearStartDay < 10) fiscalYearStartDay = "0" + fiscalYearStartDay;
				this.period_from = (parseInt(year)-1) + "-" + fiscalYearStartMonth;
				this.period_to = year + "-" + fiscalYearStartMonth;
				// Construct the limit dates for the selected period
				dateFrom = new Date((parseInt(year)-1) + "-" + fiscalYearStartMonth + "-" + fiscalYearStartDay);
				dateTo = new Date(year + "-" + fiscalYearStartMonth + "-" + fiscalYearStartDay);
				dateTo.setDate(dateTo.getDate() - 1);
			};
		};
		
		// Get number of hours in the period
		var dateDiff = dateTo - dateFrom;
		var hoursDiff = 1;
	    if (!(isNaN(dateDiff))){ 
	    	hoursDiff = Math.floor(dateDiff / (1000*60*60)); 
		};
		
		// Set parameters to coefficients datasource and obtain the values for CDD and HDD
		var coefficientsDs = View.dataSources.get("ds_energySummary_Coefficients");
		coefficientsDs.addParameter("blId", blId);
		coefficientsDs.addParameter("periodStart", this.period_from);
		coefficientsDs.addParameter("periodEnd", this.period_to);
		var recordCoefficients = coefficientsDs.getRecord();
		var hdd="NULL";
		var cdd="NULL";
		if (valueExists(recordCoefficients)) {
			if (recordCoefficients.getValue("bl.electricity_hdd") != "") hdd=recordCoefficients.getValue("bl.electricity_hdd");
			if (recordCoefficients.getValue("bl.electricity_cdd") != "") cdd=recordCoefficients.getValue("bl.electricity_cdd");
		};

		// set the unit conversion factor
		this.setBillUnitsParameter(); 
		
		// get the selected unit by user
		var selectNode = $('select_bill_units');
		var userUnitsChoice = "Units";
	    if (selectNode != undefined && selectNode.selectedIndex >= 0) {
	        userUnitsChoice = selectNode.options[selectNode.selectedIndex].value;
	    };

		// Construct the report restriction
		var vnId = this.energyConsole.getFieldValue('bill_archive.vn_id');
		this.finalRestriction = " bill_archive.bill_type_id='ELECTRIC'";
		this.finalRestriction += " AND bill_archive.time_period > '" + this.period_from + "' ";
		this.finalRestriction += " AND bill_archive.time_period <= '" + this.period_to + "' ";
		this.finalRestriction += " AND bill_archive.bl_id = '" + getValidRestVal(blId) + "' ";
		if (vnId != '') this.finalRestriction += " AND bill_archive.vn_id = '" + getValidRestVal(vnId) + "' ";
			
		// add parameters to the report datasource
		this.energyAnnualSummary.addParameter("coefficientHdd", hdd);
		this.energyAnnualSummary.addParameter("coefficientCdd", cdd);
		this.energyAnnualSummary.addParameter("finalRestriction", this.finalRestriction);
		this.energyAnnualSummary.addParameter("hoursInYear", hoursDiff);		
		
		var conversionFactor = abEnergyBillCommonController.getConversionFactor("ELECTRIC", userUnitsChoice);
		var areaUnitsConversionFactor = this.getAreaUnitsConversionFactor();
		
		this.energyAnnualSummary.addParameter("areaUnitsConversionFactor", areaUnitsConversionFactor);
		this.energyAnnualSummary.addParameter("unitsConversionFactor", conversionFactor == 0 ? 9999999999 : conversionFactor);
					
		
		// Change field titles to show the selected units if the user selection changed
		if (this.previousUnit != userUnitsChoice)
		{
			this.updateReportTitles(userUnitsChoice);
			this.previousUnit = userUnitsChoice;
		};
		
		//refresh the grid
		this.energyAnnualSummary.refresh();
		this.energyAnnualSummary.show(true); 
	},
	
	updateReportTitles: function(userUnitsChoice) {		 
		var symbol = View.project.budgetCurrency.symbol;
		var userAreaUnits = View.user.areaUnits.title;
		 
		var fieldDefs = this.energyAnnualSummary.fieldDefs;
		for ( var i = 0; i < fieldDefs.length; i++) {
			if (fieldDefs[i].id == "bill_archive.consumption") fieldDefs[i].title = getMessage("consumption_title") + " " + userUnitsChoice;
			else if (fieldDefs[i].id == "bill_archive.cost") fieldDefs[i].title = fieldDefs[i].title.replace("$", symbol);
			else if (fieldDefs[i].id == "bill_archive.cost_sqft") fieldDefs[i].title = String.format(fieldDefs[i].title, symbol, userAreaUnits);
			else if (fieldDefs[i].id == "bill_archive.rate") fieldDefs[i].title = getMessage("rate_title") + " ("+symbol+"/" + userUnitsChoice + ")";
			else if (fieldDefs[i].id == "bill_archive.electricity_hdd") fieldDefs[i].title = userUnitsChoice + "/" + getMessage("textHDD");
			else if (fieldDefs[i].id == "bill_archive.electricity_sqft") fieldDefs[i].title = userUnitsChoice + "/" + userAreaUnits;
			else if (fieldDefs[i].id == "bill_archive.electricity_day") fieldDefs[i].title = getMessage("avg_title") + " (" + userUnitsChoice + "/" + getMessage("textDay") + ")";
			else if (fieldDefs[i].id == "bill_archive.electricity_cdd") fieldDefs[i].title = userUnitsChoice + "/" + getMessage("textCDD");
			else if (fieldDefs[i].id == "bill_archive.kw_sqft") fieldDefs[i].title = "kW/" + userAreaUnits;
			else if (fieldDefs[i].id == "bill_archive.kw_hdd") fieldDefs[i].title = "kW/" + getMessage("textHDD");
			else if (fieldDefs[i].id == "bill_archive.kw_cdd") fieldDefs[i].title = "kW/" + getMessage("textCDD");
		};
	},
	
	getAreaUnitsConversionFactor: function(){
		var userSystem = View.user.displayUnits;
		var projectSystem = View.project.units;
		var factor = 1;
		if(userSystem != projectSystem){
			factor = View.user.areaUnits.conversionFactor;
		}
		return factor;
	}
	
}); 

function onDrillDownToDetails()
{  
	// get the panel to change the title	
	var panel = View.panels.get('energyAnnualSummaryDetails');

	// get the controller to set the parameters to the drilldown panel	
	var controller = View.controllers.get('energyAnnualSummaryController'); 
	controller.energyAnnualSummaryDetails.addParameter("finalRestriction", controller.finalRestriction);
	controller.energyAnnualSummaryDetails.addParameter("periodStart", controller.period_from);
	controller.energyAnnualSummaryDetails.addParameter("periodStartPrev", "");
	controller.energyAnnualSummaryDetails.addParameter("periodEnd", controller.period_to);
	controller.energyAnnualSummaryDetails.addParameter("periodEndPrev", "");
	panel.setTitle(getMessage("annualsummary_details"));

	controller.energyAnnualSummaryDetails.refresh();
	controller.energyAnnualSummaryDetails.showInWindow( {width: 1000, height: 600, closeButton: true}); 
	
}