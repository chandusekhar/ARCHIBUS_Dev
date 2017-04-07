var energyYearToDateSummaryController = View.extendController('energyYearToDateSummaryController', energyCostBaseController, {

	period_from : '',
	period_to : '',
	period_from_prev : '',
	period_to_prev : '',
	finalRestriction : '',

	viewPanels: [
	   "energyAnnualSummary", "energyAnnualSummaryYear", "energyAnnualSummary6Month", "energyAnnualSummary1Month"
	],
	
	afterViewLoad: function() {
	    
		//Initialize the list of Electric bill units options
	    this.initializeBillUnitsOptions();
	    this.showOnLoad(false);

		this.hideConsoleField("bill_archive.year"); 
		this.hideConsoleField("bill_archive.time_period.from"); 
		this.hideConsoleField("bill_archive.time_period.to"); 
		this.hideConsoleRow(3); 
		this.hideConsoleRow(4); 
		this.hideConsoleField("bill_archive.bill_type_ids");
		this.hideConsoleRow(6); 
		View.controllers.get('abEnergyCostConsole').restriction = "bill_unit.bill_type_id <> 'WATER'";
	},
	
	
	energyConsole_onShow: function() {
		
		var blId = this.energyConsole.getFieldValue('bill_archive.bl_id');
		if (blId == '')	{ View.showMessage(getMessage('enterBl')); return; }; 
		
		var billType = this.energyConsole.getFieldValue("bill_archive.bill_type_id");
		if (billType == '') { 
			//this.energyConsole.setFieldValue("bill_archive.bill_type_id", "ELECTRIC");		
			View.showMessage(getMessage('selectRequiredBillType'));
			return;
		}
		

		var today = new Date();
		var today_year = today.getFullYear();
		var today_month = today.getMonth() + 1;
		if (today_month < 10) today_month = "0" + today_month;
		
		// Calculate the time periods (year-month) to consider for this year
		this.period_from = today_year + "-01";
		this.period_to = today_year + "-" + today_month;

		// if Fiscal Year option is selected, change the period values to match fiscal year
		var periodSelected = $('energyConsole_periodSelect').value;
		if (periodSelected == 'fiscalYear') this.period_from = this.getFiscalYearPeriodFrom();

		// Calculate the time periods (year-month) to consider for the previous year
		this.period_from_prev = this.getPreviousYearPeriod(this.period_from);
		this.period_to_prev = this.getPreviousYearPeriod(this.period_to);

		// Construct the report restriction
		this.finalRestriction = " 1=1";
		this.finalRestriction += " AND bill_archive.bl_id = '" + getValidRestVal(blId) + "' ";
		this.finalRestriction +=" AND bill_archive.bill_type_id = '" + getValidRestVal(billType) + "' ";
		var vnId = this.energyConsole.getFieldValue('bill_archive.vn_id');
		if (vnId != '') this.finalRestriction += " AND bill_archive.vn_id = '" + getValidRestVal(vnId) + "' ";
		
		// set the unit conversion factor for the Energy selected Units
		this.setBillUnitsParameter(); 
		
		//Get translated titles for the periods in the rows
		this.currentTitle = getMessage("current_title");		
		this.previousTitle = getMessage("previous_title");				 
		
		// add parameters to the report datasource to show the Year-to-Date data 
		this.setParameters(this.energyAnnualSummary, ((parseInt(today_year)-1)+"-12"), this.period_from_prev);
		//refresh the grid
		this.energyAnnualSummary.refresh();

		// add parameters to the report datasource to show data for the last year 
		this.setParameters(this.energyAnnualSummaryYear, this.getPreviousYearPeriod(this.period_to), this.getPreviousYearPeriod(this.period_to_prev));
		//refresh the grid
		this.energyAnnualSummaryYear.refresh();

		// add parameters to the report datasource to show data for the last 6 months
		var sixMonthBeforeToday = this.getMonthsBeforeTodayPeriod(6); 
		this.setParameters(this.energyAnnualSummary6Month,sixMonthBeforeToday,this.getPreviousYearPeriod(sixMonthBeforeToday));
		//refresh the grid
		this.energyAnnualSummary6Month.refresh();

		// add parameters to the report datasource to show data for the last month
		var oneMonthBeforeToday = this.getMonthsBeforeTodayPeriod(2); 
		this.setParameters(this.energyAnnualSummary1Month, oneMonthBeforeToday, this.getPreviousYearPeriod(oneMonthBeforeToday));
		//refresh the grid
		this.energyAnnualSummary1Month.refresh();
//		this.energyAnnualSummary1Month.show(true);

	},
	
	setParameters: function(panel, periodStart, periodStartPrev) {
		panel.addParameter("finalRestriction", this.finalRestriction);
		panel.addParameter("periodStart", periodStart);
		panel.addParameter("periodEnd", this.period_to);
		panel.addParameter("periodStartPrev", periodStartPrev);
		panel.addParameter("periodEndPrev", this.period_to_prev);
		panel.addParameter("titleCurrent", this.currentTitle);
		panel.addParameter("titlePrev", this.previousTitle);
		panel.addParameter("consumptionUnits", $('select_bill_units').value);
		
		var conversionFactor = abEnergyBillCommonController.getConversionFactor(this.energyConsole.getFieldValue("bill_archive.bill_type_id"), $("select_bill_units").value);	 
		panel.addParameter("unitsConversionFactor", conversionFactor == 0 ? 9999999999 : conversionFactor);		
		
		this.updateHeader(panel);		 
	},
	
	updateHeader: function(panel) {		
		for (var i=0; i<panel.columns.length; i++) {
			var column = panel.columns[i];
			if (column.id == 'bill_archive.electricity_consumption') {
				if(panel.id =='energyAnnualSummaryDetails'){
					column.name = getMessage("elec_consumption") + " (" + $("select_bill_units").value + ")";
				}else{		
					column.name = getMessage("consumption") + " (" + $("select_bill_units").value + ")";				
				}
			}
		}
		panel.updateHeader();
	},
	
	getPreviousYearPeriod: function(period) {
		return ((parseInt(period.substr(0,4))-1) + "-" + period.substr(5,2)); 
	},
	
	getFiscalYearPeriodFrom : function(){
		var today = new Date();
		var today_year = today.getFullYear();

		var fiscalYearDs = View.dataSources.get("ds_energySummary_FiscalYear");
		var record = fiscalYearDs.getRecord();
		if (valueExists(record)) {
			var fiscalYearStartMonth = record.getValue("afm_scmpref.fiscalyear_startmonth");
			if (fiscalYearStartMonth < 10) fiscalYearStartMonth = "0" + fiscalYearStartMonth;
			var fiscalYearStartDay = record.getValue("afm_scmpref.fiscalyear_startday");
			if (fiscalYearStartDay < 10) fiscalYearStartDay = "0" + fiscalYearStartDay;
			var fiscalDate = new Date(today_year + "-" + fiscalYearStartMonth + "-" + fiscalYearStartDay);
			//If the fiscal year start for this year is in the future, get the info from the past fiscal year
			if (fiscalDate >= today)
				return ((parseInt(today_year)-1) + "-" + fiscalYearStartMonth);
			else
				return (today_year + "-" + fiscalYearStartMonth);
		};		
	}, 
	
	getMonthsBeforeTodayPeriod: function(numberMonths){
		var date = new Date();
		date.setMonth(date.getMonth()-numberMonths);			
		var date_year = date.getFullYear();
	    var date_month = date.getMonth()+1;
	    if (date_month < 10) {
	    	date_month = "0" + date_month;
	    }
		return (date_year + "-" + date_month); 
	}

});  

function onDrillDownToDetails(period) {  	 
	// get the panel to change the title	
	var panel = View.panels.get('energyAnnualSummaryDetails');

	// get the controller to set the parameters to the drilldown panel	
	var controller = View.controllers.get('energyYearToDateSummaryController'); 	 
	
	switch (period) {
		case 'YearToDate': 
			controller.setParameters(panel,(parseInt(controller.period_from.substr(0,4))-1)+"-12" , controller.period_from_prev);
			panel.setTitle(getMessage("yearToDate_details"));
			break;
		case '12Months':  
			controller.setParameters(panel, controller.getPreviousYearPeriod(controller.period_to), controller.getPreviousYearPeriod(controller.period_to_prev));
			panel.setTitle(getMessage("months12_details"));
			break;
		case '6Months': 	
			var sixMonthBeforeToday = controller.getMonthsBeforeTodayPeriod(6); 
			controller.setParameters(panel, sixMonthBeforeToday, controller.getPreviousYearPeriod(sixMonthBeforeToday));
			panel.setTitle(getMessage("months6_details"));
			break;
		case '1Month': 	
			// add parameters to the report datasource to show data for the last month
			var oneMonthBeforeToday = controller.getMonthsBeforeTodayPeriod(2); 
			controller.setParameters(panel, oneMonthBeforeToday, controller.getPreviousYearPeriod(oneMonthBeforeToday));
			panel.setTitle(getMessage("month1_details"));
			break;
	};

	panel.refresh();
	panel.showInWindow( {width: 1000, height: 600, closeButton: true}); 
	
}
