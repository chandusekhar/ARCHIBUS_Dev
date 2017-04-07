/**
 * @author keven.xi
 */
var viewPMResForecastController = View.createController('viewPMResForecast', {

    dateStart: "",
    dateEnd: "",
    curGridPanelID: "",
    selectedDate: "",
    totalRestriction: null,
    
    //const 
    laborGridId: "byLaborGrid",
    partsGridId: "byPartsGrid",
    toolsGridId: "byToolsGrid",
    allGridId: "byAllGrid",
    
    afterInitialDataFetch: function(){
        this.curGridPanelID = this.laborGridId;
        this.dateStart = getCurrentDate();
        this.dateEnd = getDateAfterOneYear();
        this.filterPMResPanel.setFieldValue("pmressum.date_todo.from", this.dateStart);
        this.filterPMResPanel.setFieldValue("pmressum.date_todo.to", this.dateEnd);
        this.groupByTabs.addEventListener('beforeTabChange', this.beforeTabChange.createDelegate(this));
		//commented for kb 3023677. The scheduling routine is run ONLY from the "Show" button on the console filter, by ZY 2009-08-03.
        //this.filterPMResPanel_onShow();
    },
    /**
     * action show
     *
     */
    filterPMResPanel_onShow: function(){
        var restriction = new Ab.view.Restriction();
        var console = this.filterPMResPanel;
        var consoleDS = View.dataSources.get("ds_ab-pm-rpt-res-frcst_filter_pms_pmsd_pmp");
        
        // pmressum.date_todo value range
        var dateTodoFrom = console.getFieldValue('pmressum.date_todo.from');
        if (dateTodoFrom == '') {
            //the start date is todoay
            alert(getMessage("notCompleteFromDate"));
            dateTodoFrom = getCurrentDate();
            console.setFieldValue('pmressum.date_todo.from', dateTodoFrom);
        }
        //parse date
        dateTodoFrom = consoleDS.parseValue('pmressum.date_todo.from', dateTodoFrom, true);
        restriction.addClause('pmressum.date_todo', dateTodoFrom, '&gt;=');
        
        var dateTodoTo = console.getFieldValue('pmressum.date_todo.to');
        if (dateTodoTo == '') {
            //the end date is 52*7 days from start date
            alert(getMessage("notCompleteToDate"));
            var fromDate = new Date(console.getRecord().getValue('pmressum.date_todo.from'));
            dateTodoTo = dateAddDays(fromDate, 52 * 7);
            console.setFieldValue('pmressum.date_todo.to', dateTodoTo);
        }
        dateTodoTo = consoleDS.parseValue('pmressum.date_todo.to', dateTodoTo, true);
        restriction.addClause('pmressum.date_todo', dateTodoTo, '&lt;=');
        
        var endDate = new Date(console.getRecord().getValue('pmressum.date_todo.to'));
        var startDate = new Date(console.getRecord().getValue('pmressum.date_todo.from'));
        
        if (dateTodoTo && dateTodoFrom) {
            if (compareLocalizedDates($('pmressum.date_todo.to').value, $('pmressum.date_todo.from').value)) {
                View.showMessage(getMessage("errorEndDate"));
                return;
            }
            
            if (getDays(endDate, startDate) > 366) {
                View.showMessage(getMessage("errorDateDiff"));
                return;
            }
        }
        this.tradeID = console.getFieldValue('pmp.tr_id');
        this.pmGroup = console.getFieldValue('pms.pm_group');
        this.buildingID = console.getFieldValue('pms.bl_id');
        this.floorID = console.getFieldValue('pms.fl_id');
        this.siteID = console.getFieldValue('pms.site_id');
        
        this.dateStart = dateTodoFrom;
        this.dateEnd = dateTodoTo;
        //update code for 19.2 by Guo Jiangtao 2010-07-22
		this.refreshGridPanel();
        //generate schedule date before call WFR and refresh byLaborGrid	
        //var schedDatesRes = getSchedDatesRestriction(this.siteID, this.buildingID, this.floorID, this.pmGroup, this.tradeID)
        //this.jobId = generateScheduleDate(dateTodoFrom, dateTodoTo, schedDatesRes);
        
        //View.openDialog('ab-pm-date-progressbar.axvw', null, false, {
        //    width: 500,
        //    height: 150,
        //    closeButton: false
        //});
        
        //call forecastResource WFR and refresh byLaborGrid		
    
        //this.forecastResAndRefreshGrid(dateTodoFrom, dateTodoTo, tradeID, siteID, buildingID, floorID, pmGroup, this.curGridPanelID);
    },
	
	/**
     * generate schedule dates
     * add this action for 19.2 by Guo Jiangtao 2010-07-22
     */
    filterPMResPanel_onGenerateScheduleDates: function(){
        var restriction = new Ab.view.Restriction();
        var console = this.filterPMResPanel;
        var consoleDS = View.dataSources.get("ds_ab-pm-rpt-res-frcst_filter_pms_pmsd_pmp");
        
        // pmressum.date_todo value range
        var dateTodoFrom = console.getFieldValue('pmressum.date_todo.from');
        if (dateTodoFrom == '') {
            //the start date is todoay
            alert(getMessage("notCompleteFromDate"));
            dateTodoFrom = getCurrentDate();
            console.setFieldValue('pmressum.date_todo.from', dateTodoFrom);
        }
        //parse date
        dateTodoFrom = consoleDS.parseValue('pmressum.date_todo.from', dateTodoFrom, true);
        restriction.addClause('pmressum.date_todo', dateTodoFrom, '&gt;=');
        
        var dateTodoTo = console.getFieldValue('pmressum.date_todo.to');
        if (dateTodoTo == '') {
            //the end date is 52*7 days from start date
            alert(getMessage("notCompleteToDate"));
            var fromDate = new Date(console.getRecord().getValue('pmressum.date_todo.from'));
            dateTodoTo = dateAddDays(fromDate, 52 * 7);
            console.setFieldValue('pmressum.date_todo.to', dateTodoTo);
        }
        dateTodoTo = consoleDS.parseValue('pmressum.date_todo.to', dateTodoTo, true);
        restriction.addClause('pmressum.date_todo', dateTodoTo, '&lt;=');
        
        var endDate = new Date(console.getRecord().getValue('pmressum.date_todo.to'));
        var startDate = new Date(console.getRecord().getValue('pmressum.date_todo.from'));
        
        if (dateTodoTo && dateTodoFrom) {
            if (compareLocalizedDates($('pmressum.date_todo.to').value, $('pmressum.date_todo.from').value)) {
                View.showMessage(getMessage("errorEndDate"));
                return;
            }
            
            if (getDays(endDate, startDate) > 366) {
                View.showMessage(getMessage("errorDateDiff"));
                return;
            }
        }
        this.tradeID = console.getFieldValue('pmp.tr_id');
        this.pmGroup = console.getFieldValue('pms.pm_group');
        this.buildingID = console.getFieldValue('pms.bl_id');
        this.floorID = console.getFieldValue('pms.fl_id');
        this.siteID = console.getFieldValue('pms.site_id');
        
        this.dateStart = dateTodoFrom;
        this.dateEnd = dateTodoTo;
        
        //generate schedule date before call WFR and refresh byLaborGrid	
        var schedDatesRes = getSchedDatesRestriction(this.siteID, this.buildingID, this.floorID, this.pmGroup, this.tradeID);
		// kb#3038913: when restrcition is empty process it before pass it to WFR  to avoid sql error
		if(!schedDatesRes){
			schedDatesRes	 = " 1=1 ";
		}
		var result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-generateScheduleDateAndForecastPMResources', this.dateStart,this.dateEnd,'ALL',schedDatesRes);
		if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
			result.data = eval('(' + result.jsonExpression + ')');
			this.jobId = result.data.jobId;
			View.showMessage(getMessage("jobStarted"));
		}
    },
    
    byLaborGrid_afterRefresh: function(){
        var grid = this.byLaborGrid;
        var preDate = "";
        for (var i = 0; i < grid.rows.length; i++) {
            var row = grid.rows[i];
            var curDate = row["pmressum.date_todo"];
            row["pmressum.date_todo1"] = row["pmressum.date_todo"];
            
            if (curDate == preDate) {
                row["pmressum.date_todo"] = "";
            }
            preDate = row["pmressum.date_todo1"];
            
        }
        this.addEmptyRows('byLaborGrid');
        //Guo added 2009-09-16 to fix KB3024474
        this.addStatisticsRow('byLaborGrid');
        this.byLaborGrid.build();
        var lastRowEl = Ext.get(grid.rows[grid.rows.length - 1].row.dom);
        lastRowEl.setStyle('color', '#4040f0');
        lastRowEl.setStyle('font-weight', 'bold');
    },
    
    byPartsGrid_afterRefresh: function(){
        var grid = this.byPartsGrid;
        var preDate = "";
        for (var i = 0; i < grid.rows.length; i++) {
            var row = grid.rows[i];
            var curDate = row["pmressum.date_todo"];
            row["pmressum.date_todo1"] = row["pmressum.date_todo"];
            
            if (curDate == preDate) {
                row["pmressum.date_todo"] = "";
            }
            preDate = row["pmressum.date_todo1"];
            
        }
        this.addEmptyRows('byPartsGrid');
        //Guo added 2009-09-16 to fix KB3024474
        this.addStatisticsRow('byPartsGrid');
        this.byPartsGrid.build();
        var lastRowEl = Ext.get(grid.rows[grid.rows.length - 1].row.dom);
        lastRowEl.setStyle('color', '#4040f0');
        lastRowEl.setStyle('font-weight', 'bold');
    },
    
    byToolsGrid_afterRefresh: function(){
        var grid = this.byToolsGrid;
        var preDate = "";
        for (var i = 0; i < grid.rows.length; i++) {
            var row = grid.rows[i];
            var curDate = row["pmressum.date_todo"];
            row["pmressum.date_todo1"] = row["pmressum.date_todo"];
            
            if (curDate == preDate) {
                row["pmressum.date_todo"] = "";
            }
            preDate = row["pmressum.date_todo1"];
            
        }
        
        this.addEmptyRows('byToolsGrid');
        //Guo added 2009-09-16 to fix KB3024474
        this.addStatisticsRow('byToolsGrid');
        this.byToolsGrid.build();
        var lastRowEl = Ext.get(grid.rows[grid.rows.length - 1].row.dom);
        lastRowEl.setStyle('color', '#4040f0');
        lastRowEl.setStyle('font-weight', 'bold');
    },
    
    byAllGrid_afterRefresh: function(){
        var grid = this.byAllGrid;
        var preDate = "";
        for (var i = 0; i < grid.rows.length; i++) {
            var row = grid.rows[i];
            var curDate = row["pmressum.date_todo"];
            row["pmressum.date_todo1"] = row["pmressum.date_todo"];
            
            if (curDate == preDate) {
                row["pmressum.date_todo"] = "";
            }
            preDate = row["pmressum.date_todo1"];
            
        }
        this.addEmptyRows('byAllGrid');
		//Guo added 2009-09-16 to fix KB3024474
        this.addStatisticsRow('byAllGrid');
        this.byAllGrid.build();
        var lastRowEl = Ext.get(grid.rows[grid.rows.length - 1].row.dom);
        lastRowEl.setStyle('color', '#4040f0');
        lastRowEl.setStyle('font-weight', 'bold');
    },
    
    beforeTabChange: function(tabPanel, selectedTabName, newTabName){
        if ("byLaborTab" == newTabName) {
            this.curGridPanelID = this.laborGridId;
        }
        if ("byPartsTab" == newTabName) {
            this.curGridPanelID = this.partsGridId;
        }
        if ("byToolsTab" == newTabName) {
            this.curGridPanelID = this.toolsGridId;
        }
        if ("byAllTab" == newTabName) {
            this.curGridPanelID = this.allGridId;
        }
    },
    
    forecastResAndRefreshGrid: function(dateStart, dateEnd, trId, siteId, blId, flId, pmGroup, curGridPanelID){
        var restriction = getSchedDatesRestriction(siteId, blId, flId, pmGroup, trId);
		//This method serve as a WFR to forecast one type of required resource of : trade, part, tools or all three ,file='PreventiveMaintenanceCommonHandler.java'
        try {
            var result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-forecastPMResources', dateStart,dateEnd,'ALL',restriction);
            
            if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
                result.data = eval('(' + result.jsonExpression + ')');
                this.jobId = result.data.jobId;
            }
            
            View.openDialog('ab-pm-frcst-progressbar.axvw', null, false, {
                width: 500,
                height: 150,
                closeButton: false
            });
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    },
    
    addEmptyRows: function(gridPanelID){
        var gridPanel = View.panels.get(gridPanelID);
        var oldRows = gridPanel.rows;
        if (oldRows.length == 0) {
            return;
        }
        
        var newRows = [];
        var preDateTodo = oldRows[0]['pmressum.date_todo1'];
        for (var i = 0; i < oldRows.length; i++) {
            if (oldRows[i]['pmressum.date_todo1'] == preDateTodo) {
                newRows.push(oldRows[i]);
            }
            else {
                var row = new Object();
                row["pmressum.hours_or_quantity"] = "-";
                newRows.push(row);
                newRows.push(oldRows[i]);
                preDateTodo = oldRows[i]['pmressum.date_todo1'];
            }
        }
        gridPanel.rows = newRows;
    },
    
    afterScheduleJob: function(){
        this.forecastResAndRefreshGrid(this.dateStart, this.dateEnd, this.tradeID, this.siteID, this.buildingID, this.floorID, this.pmGroup, this.curGridPanelID);
    },
    
    refreshGridPanel: function(){
        var restriction = new Ab.view.Restriction();
        restriction.addClause('pmressum.date_todo', this.dateStart, '&gt;=');
        restriction.addClause('pmressum.date_todo', this.dateEnd, '&lt;=');
        
        var curGridPanel = View.panels.get(this.curGridPanelID);
        curGridPanel.refresh(restriction);
        if ("byLaborGrid" != this.curGridPanelID) {
            var grid = View.panels.get(this.laborGridId);
            grid.refresh(restriction);
        }
        if ("byPartsGrid" != this.curGridPanelID) {
            var grid = View.panels.get(this.partsGridId);
            grid.refresh(restriction);
        }
        if ("byToolsGrid" != this.curGridPanelID) {
            var grid = View.panels.get(this.toolsGridId);
            grid.refresh(restriction);
        }
        if ("byAllGrid" != this.curGridPanelID) {
            var grid = View.panels.get(this.allGridId);
            grid.refresh(restriction);
        }
        
        curGridPanel.show(true);
    },
    
    //Guo added 2009-09-16 to fix KB3024474	
    addStatisticsRow: function(gridPanelID){
        var gridPanel = View.panels.get(gridPanelID);
        var rows = gridPanel.rows;
        var totalRow = new Object();
        totalRow['pmressum.hours_or_quantity'] = getMessage("total");
        var totalCost = 0;
        for (var i = 0; i < rows.length; i++) {
            var rowCost = 0;
            if (rows[i]['pmressum.total_cost']) {
                rowCost = rows[i]['pmressum.total_cost']
            }
            if (rows[i]['pmressum.total_cost.raw']) {
                rowCost = rows[i]['pmressum.total_cost.raw']
            }
            
            totalCost += parseFloat(rowCost);
            ;
            
        }
        totalCost = insertGroupingSeparator(totalCost.toFixed(2));
        totalRow['pmressum.total_cost'] = totalCost;
        gridPanel.addRow(totalRow);
    }
});

function showChart(){
    var controller = View.controllers.get('viewPMResForecast');
    var grid = View.getControl('', controller.curGridPanelID);
    var index = grid.selectedRowIndex;
    var dateToDo = grid.rows[index]['pmressum.date_todo'];
    controller.selectedDate = dateToDo;
    dateToDo = getDateWithISOFormat(dateToDo);
    var resType = grid.rows[index]['pmressum.resource_type.key'];
    var restriction = new Ab.view.Restriction();
    restriction.addClause('pmressum.date_todo', dateToDo, '=');
    restriction.addClause('pmressum.resource_type', resType, '=');
    View.openDialog('ab-pm-rpt-res-frcst-cht.axvw', restriction);
}
