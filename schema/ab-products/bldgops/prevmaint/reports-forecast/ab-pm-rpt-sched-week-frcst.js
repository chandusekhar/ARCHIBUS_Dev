var Controller = View.createController('ab-report-bygroup', {

    curTab: "ProcedureWeekly", //ProcedureWeekly|EquipmentWeekly | TradeWeekly | TradeMonthly
    afterInitialDataFetch: function(){
        this.consolePanel.setFieldValue("pmressum.date_todo.from", getCurrentDate());
        this.consolePanel.setFieldValue("pmressum.date_todo.to", getDateAfterOneYear());
        this.Select_By.addEventListener('beforeTabChange', this.beforeTabChange.createDelegate(this));
		//commented for kb 3023677. The scheduling routine is run ONLY from the "Show" button on the console filter, by ZY 2009-08-03.
        //this.consolePanel_onShow();
    },
	
	/**
     * refresh the panels
     * changed for 19.2 by Guo Jiangtao 2010-07-22
     */
    consolePanel_onShow: function(){
		this.refreshCurTab();
    },
	
	/**
     * generate schedule dates
     * add this action for 19.2 by Guo Jiangtao 2010-07-22
     */
	consolePanel_onGenerateScheduleDates: function(){
        var console = this.consolePanel;
        
        // pmressum.date_todo value range
        var dateFrom = console.getFieldValue('pmressum.date_todo.from');
        if (dateFrom == '') {
            //the start date is todoay
            alert(getMessage("notCompleteFromDate"));
            dateFrom = getCurrentDate();
            console.setFieldValue('pmressum.date_todo.from', dateFrom);
        }
        //parse date
        dateFrom = this.console_DS.parseValue('pmressum.date_todo.from', dateFrom, true);
        
        var dateTo = console.getFieldValue('pmressum.date_todo.to');
        if (dateTo == '') {
            //the end date is 52*7 days from start date
            alert(getMessage("notCompleteToDate"));
            var fromDate = new Date(console.getRecord().getValue('pmressum.date_todo.from'));
            dateTo = dateAddDays(fromDate, 52 * 7);
            console.setFieldValue('pmressum.date_todo.to', dateTo);
        }
        dateTo = this.console_DS.parseValue('pmressum.date_todo.to', dateTo, true);
        
        var endDate = new Date(console.getRecord().getValue('pmressum.date_todo.to'));
        var startDate = new Date(console.getRecord().getValue('pmressum.date_todo.from'));
        
        if (dateTo && dateFrom) {
            if (compareLocalizedDates($('pmressum.date_todo.to').value, $('pmressum.date_todo.from').value)) {
                View.showMessage(getMessage("errorEndDate"));
                return;
            }
            
            if (getDays(endDate, startDate) > 366) {
                View.showMessage(getMessage("errorDateDiff"));
                return;
            }
        }
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        this.callWFR(dateFrom, dateTo);
    },
    
    forecast_report_byWeek_afterRefresh: function(){
        if (this.forecast_report_byWeek.rows.length == 0) {
            return;
        }
        if (this.curTab == 'ProcedureWeekly') {
            showOrHideFields(false, true);
        }
        if (this.curTab == 'EquipmentWeekly') {
            showOrHideFields(true, false);
        }
    },
    
    by_Procedure_afterRefresh: function(){
        this.clearReportRows();
        this.setDefaultTitleOfReportPanel();
    },
    
    by_Equipment_afterRefresh: function(){
        this.clearReportRows();
        this.setDefaultTitleOfReportPanel();
    },
    
    setDefaultTitleOfReportPanel: function(){
        var title = getMessage("reportPanelTitle");
        setPanelTitle('forecast_report_byWeek', title);
    },
    
    clearReportRows: function(){
        var restriction = new Ab.view.Restriction();
        restriction.addClause("pmforecast_tr.eq_id", "-1", "=");
        this.forecast_report_byWeek.refresh(restriction);
    },
    
    beforeTabChange: function(tabPanel, selectedTabName, newTabName){
        this.curTab = newTabName;
		//commented for kb 3023677. The scheduling routine is run ONLY from the "Show" button on the console filter, by ZY 2009-08-03.
        //this.consolePanel_onShow();
        var toCollapse = View.getLayoutAndRegionById("reportRegion");
        var panel = toCollapse.layoutManager.getRegionPanel(toCollapse.region);
        if (newTabName == 'ProcedureWeekly' || newTabName == 'EquipmentWeekly') {
            panel.expand(false);
        }
        if (newTabName == 'TradeWeekly' || newTabName == 'TradeMonthly') {
            panel.collapse(false);
        }
    },
    
    //call WFR
    callWFR: function(dateFrom, dateTo){
        var console = this.consolePanel;
        this.tradeID = console.getFieldValue('pmp.tr_id');
        this.pmGroup = console.getFieldValue('pms.pm_group');
        this.buildingID = console.getFieldValue('pms.bl_id');
        this.floorID = console.getFieldValue('pms.fl_id');
        this.siteID = console.getFieldValue('pms.site_id');
        
        //changed for 19.2 by Guo Jiangtao 2010-07-22
        //generate schedule date and forecast
        var schedDatesRes = getSchedDatesRestriction(this.siteID, this.buildingID, this.floorID, this.pmGroup, this.tradeID);
		// kb#3038913: when restrcition is empty process it before pass it to WFR  for avoiding sql error
		if(!schedDatesRes){
			schedDatesRes	 = " 1=1 ";
		}
        var resourceType = this.getResourceTypeByCurTab();
      
        try {
			//his method serve as a WFR to do one of forecasts for: Procedure Weekly, Equipment Weekly, Trade Weekly or Trade Monthly, file='PreventiveMaintenanceCommonHandler.java'
			var result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-generateScheduleDateAndForecastPM52Week', this.dateFrom,this.dateTo,schedDatesRes ,resourceType);
            if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
                result.data = eval('(' + result.jsonExpression + ')');
                this.jobId = result.data.jobId;
				View.showMessage(getMessage("jobStarted")+"\n"+getMessage("jobFinished"));
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    },
    
    refreshCurTab: function(){
        if (this.curTab == 'ProcedureWeekly') {
            View.panels.get("by_Procedure").refresh();
        } else if (this.curTab == 'EquipmentWeekly') {
            View.panels.get("by_Equipment").refresh();
        } else if (this.curTab == 'TradeWeekly') {
            var tab = this.Select_By.findTab('TradeWeekly');
            if (tab.isContentLoaded) {
                tab.refresh();
            } else {
                tab.loadView();
            }
        } else {
            var tab = this.Select_By.findTab('TradeMonthly');
            if (tab.isContentLoaded) {
                tab.refresh();
            } else {
                tab.loadView();
            }
        }
    },
    
    getResourceTypeByCurTab: function(){
        var resourceType = '';
        if (this.curTab == 'ProcedureWeekly') {
            resourceType = '52W-P'
        }
        if (this.curTab == 'EquipmentWeekly') {
            resourceType = '52W-E'
        }
        if (this.curTab == 'TradeWeekly') {
            resourceType = '52W-L'
        }
        if (this.curTab == 'TradeMonthly') {
            resourceType = '12M-L'
        }
        return resourceType;
    },
    
    refreshGridPanel: function(){
        this.refreshCurTab();
    }
});

function forecastFor52WeeksEW(){
    var panelName1 = View.panels.get("by_Equipment");
    var selectedRowIndex = panelName1.selectedRowIndex;
    if (selectedRowIndex != -1) {
        var eq_id = panelName1.rows[selectedRowIndex]['pmpsum.eq_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause("pmforecast_tr.eq_id", eq_id, "=");
        View.panels.get("forecast_report_byWeek").refresh(restriction);
    }
    //set report panel title
    var title = getMessage("reportPanelTitle") + " " + eq_id;
    setPanelTitle('forecast_report_byWeek', title);
}

function forecastFor52WeeksPW(){

    var panelName2 = View.panels.get("by_Procedure");
    var selectedRowIndex = panelName2.selectedRowIndex;
    if (selectedRowIndex != -1) {
        var pmp_id = panelName2.rows[selectedRowIndex]['pmpsum.pmp_id'];
        var restriction = new Ab.view.Restriction();
        restriction.addClause("pmforecast_tr.pmp_id", pmp_id, "=");
        View.panels.get("forecast_report_byWeek").refresh(restriction);
    }
    //set report panel title
    var title = getMessage("reportPanelTitle") + " " + pmp_id;
    setPanelTitle('forecast_report_byWeek', title);
}

function showOrHideFields(showPmpField, showTradeField){
    var forecastReport = View.panels.get('forecast_report_byWeek');
    var headerRow = forecastReport.headerRows[0];
    
    var pmpColumnIndex = getColumnIndexByFullName("pmforecast_tr.pmp_id", forecastReport.columns);
    var tradeColumnIndex = getColumnIndexByFullName("pmforecast_tr.tr_id", forecastReport.columns);
    
    //show or hide column header
    if (showPmpField) {
        headerRow.childNodes[pmpColumnIndex].style.display = "";
    }
    else {
        headerRow.childNodes[pmpColumnIndex].style.display = "none";
    }
    if (showTradeField) {
        headerRow.childNodes[tradeColumnIndex].style.display = "";
    }
    else {
        headerRow.childNodes[tradeColumnIndex].style.display = "none";
    }
    //show or hide column 	
    var len = forecastReport.gridRows.length;
    for (var i = 0; i < len; i++) {
        var row = forecastReport.gridRows.items[i];
        if (showPmpField) {
            row.cells.items[pmpColumnIndex].dom.style.display = "";
        }
        else {
            row.cells.items[pmpColumnIndex].dom.style.display = "none";
        }
        if (showTradeField) {
            row.cells.items[tradeColumnIndex].dom.style.display = "";
        }
        else {
            row.cells.items[tradeColumnIndex].dom.style.display = "none";
        }
    }
}
