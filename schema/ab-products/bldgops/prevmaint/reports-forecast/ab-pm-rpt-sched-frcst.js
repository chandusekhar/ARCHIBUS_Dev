/**
 * @author keven.xi
 */
var viewPMWorkForecastController = View.createController('viewPMWorkForecast', {

    curTab: "byDateTab", //byDateTab | byTradeTab | byTradeBuildingTab
    dateTodo: "", //ISO format
    tradeCode: "",
    buildingCode: "",
    afterInitialDataFetch: function(){
        var curDate = getCurrentDate();
        this.filterPMSchedPanel.setFieldValue("pmsd.date_todo.from", curDate);
        this.filterPMSchedPanel.setFieldValue("pmsd.date_todo.to", getDateAfter52Week());
        this.groupByTabs.addEventListener('beforeTabChange', this.beforeTabChange.createDelegate(this));
		//commented for kb 3023677. The scheduling routine is run ONLY from the "Show" button on the console filter, by ZY 2009-08-03.
		//this.filterPMSchedPanel_onSearch(); 
    },
    /**
     * action search
     *
     */
    filterPMSchedPanel_onSearch: function(){
        var console = this.filterPMSchedPanel;
        var filterPmsDS = View.dataSources.get("ds_ab-pm-rpt-sched-frcst_filter_pms_pmsd_pmp");
        
        // pmsd.date_todo value range
        var dateTodoFrom = console.getFieldValue('pmsd.date_todo.from');
        if (dateTodoFrom == '') {
            //the start date is todoay
            alert(getMessage("notCompleteFromDate"));
            dateTodoFrom = getCurrentDate();
            console.setFieldValue('pmsd.date_todo.from', dateTodoFrom);
        }
        //parse date
        dateTodoFrom = filterPmsDS.parseValue('pmsd.date_todo.from', dateTodoFrom, true);
        
        var dateTodoTo = console.getFieldValue('pmsd.date_todo.to');
        if (dateTodoTo == '') {
            //the end date is 52*7 days from start date
            alert(getMessage("notCompleteToDate"));
            var fromDate = new Date(console.getRecord().getValue('pmsd.date_todo.from'));
            dateTodoTo = dateAddDays(fromDate, 52 * 7);
            console.setFieldValue('pmsd.date_todo.to', dateTodoTo);
        }
        dateTodoTo = filterPmsDS.parseValue('pmsd.date_todo.to', dateTodoTo, true);
        
        var endDate = new Date(console.getRecord().getValue('pmsd.date_todo.to'));
        var startDate = new Date(console.getRecord().getValue('pmsd.date_todo.from'));
        
        if (dateTodoTo && dateTodoFrom) {
            if (compareLocalizedDates($('pmsd.date_todo.to').value, $('pmsd.date_todo.from').value)) {
                View.showMessage(getMessage("errorEndDate"));
                return;
            }
            
            if (getDays(endDate, startDate) > 366) {
                View.showMessage(getMessage("errorDateDiff"));
                return;
            }
        }
        
        var tradeID = console.getFieldValue('pmp.tr_id');
        var pmGroup = console.getFieldValue('pms.pm_group');
        var buildingID = console.getFieldValue('pms.bl_id');
        var floorID = console.getFieldValue('pms.fl_id');
        var siteID = console.getFieldValue('pms.site_id');
        this.dateTodoFrom = dateTodoFrom;
        this.dateTodoTo = dateTodoTo;
        //generate schedule date before refresh all the tab
        this.schedDatesRes = getSchedDatesRestriction(siteID, buildingID, floorID, pmGroup, tradeID);
		//update code for 19.2 by Guo Jiangtao 2010-07-22
		this.refreshPanels();
        //this.jobId = generateScheduleDate(dateTodoFrom, dateTodoTo, this.schedDatesRes);
		//Modified for kb 3023677, by ZY 2009-08-03.
		//var url = 'ab-single-job.axvw?jobId=' + this.jobId;
		//var jobStatus = Workflow.getJobStatus(this.jobId);
		//window.open(url);
        //View.openDialog('ab-pm-date-progressbar.axvw', null, false, {
        //    width: 500,
        //    height: 150,
        //    closeButton: false
        //});
    },
	
	/**
     * generate schedule dates
     * add this action for 19.2 by Guo Jiangtao 2010-07-22
     */
    filterPMSchedPanel_onGenerateScheduleDates: function(){
        var console = this.filterPMSchedPanel;
        var filterPmsDS = View.dataSources.get("ds_ab-pm-rpt-sched-frcst_filter_pms_pmsd_pmp");
        
        // pmsd.date_todo value range
        var dateTodoFrom = console.getFieldValue('pmsd.date_todo.from');
        if (dateTodoFrom == '') {
            //the start date is todoay
            alert(getMessage("notCompleteFromDate"));
            dateTodoFrom = getCurrentDate();
            console.setFieldValue('pmsd.date_todo.from', dateTodoFrom);
        }
        //parse date
        dateTodoFrom = filterPmsDS.parseValue('pmsd.date_todo.from', dateTodoFrom, true);
        
        var dateTodoTo = console.getFieldValue('pmsd.date_todo.to');
        if (dateTodoTo == '') {
            //the end date is 52*7 days from start date
            alert(getMessage("notCompleteToDate"));
            var fromDate = new Date(console.getRecord().getValue('pmsd.date_todo.from'));
            dateTodoTo = dateAddDays(fromDate, 52 * 7);
            console.setFieldValue('pmsd.date_todo.to', dateTodoTo);
        }
        dateTodoTo = filterPmsDS.parseValue('pmsd.date_todo.to', dateTodoTo, true);
        
        var endDate = new Date(console.getRecord().getValue('pmsd.date_todo.to'));
        var startDate = new Date(console.getRecord().getValue('pmsd.date_todo.from'));
        
        if (dateTodoTo && dateTodoFrom) {
            if (compareLocalizedDates($('pmsd.date_todo.to').value, $('pmsd.date_todo.from').value)) {
                View.showMessage(getMessage("errorEndDate"));
                return;
            }
            
            if (getDays(endDate, startDate) > 366) {
                View.showMessage(getMessage("errorDateDiff"));
                return;
            }
        }
        
        var tradeID = console.getFieldValue('pmp.tr_id');
        var pmGroup = console.getFieldValue('pms.pm_group');
        var buildingID = console.getFieldValue('pms.bl_id');
        var floorID = console.getFieldValue('pms.fl_id');
        var siteID = console.getFieldValue('pms.site_id');
        this.dateTodoFrom = dateTodoFrom;
        this.dateTodoTo = dateTodoTo;
        //generate schedule date before refresh all the tab
        this.schedDatesRes = getSchedDatesRestriction(siteID, buildingID, floorID, pmGroup, tradeID);
        this.jobId = generateScheduleDate(dateTodoFrom, dateTodoTo, (this.schedDatesRes)?this.schedDatesRes:' 1=1 ');
		View.showMessage(getMessage("jobStarted"));
    },
    
    byDateGrid_afterRefresh: function(){
        //refresh report by the top 1 record in this grid
        if ("byDateTab" == this.curTab) {
            var grid = this.byDateGrid;
            if (grid.rows.length != 0) {
				var d = grid.rows[0]["pmsd.date_todo"];
                this.dateTodo = isBeingISODateFormat(d) ? d : getDateWithISOFormat(d);
                var restriction = getRestriction(this.dateTodo, null, null, grid.restriction, this.curTab);
            }
            else {
                var restriction = new Ab.view.Restriction();
                restriction.addClause("pmsd.pms_id", "-1", "=");
            }
            
            this.pmsForcastReport.refresh(restriction);
            this.byDateGrid.show(true);
        }
    },
    
    byTradeGrid_afterRefresh: function(){
        var grid = this.byTradeGrid;
        var preDate = "";
        for (var i = 0; i < grid.rows.length; i++) {
            var row = grid.rows[i];
            var curDate = row["pmsd.date_todo"];
            row["pmsd.date_todo1"] = row["pmsd.date_todo"];
            
            if (curDate == preDate) {
                row["pmsd.date_todo"] = "";
            }
            preDate = row["pmsd.date_todo1"];
            
        }
        this.addEmptyRows("byTradeGrid");
        this.byTradeGrid.build();
        
        //refresh report by the top 1 record in this grid
        if ("byTradeTab" == this.curTab) {
        
            if (grid.rows.length != 0) {
				var d = grid.rows[0]["pmsd.date_todo"];
                this.dateTodo = isBeingISODateFormat(d) ? d : getDateWithISOFormat(d);
                this.tradeCode = grid.rows[0]["pmp.tr_id"];
                var restriction = getRestriction(this.dateTodo, this.tradeCode, null, grid.restriction, this.curTab);
            }
            else {
                var restriction = new Ab.view.Restriction();
                restriction.addClause("pmsd.pms_id", "-1", "=");
            }
            this.pmsForcastReport.refresh(restriction);
            this.byTradeGrid.show(true);
        }
    },
    
    byTradeByBuildingGrid_afterRefresh: function(){
        var grid = this.byTradeByBuildingGrid;
        var preDate = "";
        for (var i = 0; i < grid.rows.length; i++) {
            var row = grid.rows[i];
            var curDate = row["pmsd.date_todo"];
            row["pmsd.date_todo1"] = row["pmsd.date_todo"];
            
            if (curDate == preDate) {
                row["pmsd.date_todo"] = "";
            }
            preDate = row["pmsd.date_todo1"];
            
        }
        this.addEmptyRows("byTradeByBuildingGrid");
        this.byTradeByBuildingGrid.build();
        
        //refresh report by the top 1 record in this grid
        if ("byTradeByBuildingTab" == this.curTab) {
            if (grid.rows.length != 0) {
				var d = grid.rows[0]["pmsd.date_todo"];
                this.dateTodo = isBeingISODateFormat(d) ? d : getDateWithISOFormat(d);
                this.tradeCode = grid.rows[0]["pmp.tr_id"];
                this.buildingCode = grid.rows[0]["pms.bl_id"];
                var restriction = getRestriction(this.dateTodo, this.tradeCode, this.buildingCode, grid.restriction, this.curTab);
            }
            else {
                var restriction = new Ab.view.Restriction();
                restriction.addClause("pmsd.pms_id", "-1", "=");
            }
            this.pmsForcastReport.refresh(restriction);
            this.byTradeByBuildingGrid.show(true);
        }
    },
    
    beforeTabChange: function(tabPanel, selectedTabName, newTabName){
        this.curTab = newTabName;
    },
    
    pmsForcastReport_afterRefresh: function(){
        if (this.pmsForcastReport.rows.length == 0) {
            var title = getMessage("schedPanelTitle");
            setPanelTitle('pmsForcastReport', title);
            return;
        }
        var title = getMessage("schedPanelTitle") + " " + this.dateTodo;
        if ("byDateTab" == this.curTab) {
            setPanelTitle('pmsForcastReport', title);
            showOrHideFields(false, true, true);
        }
        if ("byTradeTab" == this.curTab) {
            if (this.tradeCode) {
                title += ", " + this.tradeCode;
            }
            setPanelTitle('pmsForcastReport', title);
            showOrHideFields(false, false, true);
        }
        if ("byTradeByBuildingTab" == this.curTab) {
            if (this.tradeCode) {
                title += ", " + this.tradeCode;
            }
            if (this.buildingCode) {
                title += ", " + this.buildingCode;
            }
            setPanelTitle('pmsForcastReport', title);
            showOrHideFields(false, false, false);
        }
    },
    
    addEmptyRows: function(gridPanelID){
        var gridPanel = View.panels.get(gridPanelID);
        var oldRows = gridPanel.rows;
        if (oldRows.length == 0) {
            return;
        }
        
        var newRows = [];
        var preDateTodo = oldRows[0]['pmsd.date_todo1'];
        for (var i = 0; i < oldRows.length; i++) {
            if (oldRows[i]['pmsd.date_todo1'] == preDateTodo) {
                newRows.push(oldRows[i]);
            }
            else {
                var row = new Object();
                row["pmsd.date_todo"] = "-";
                newRows.push(row);
                newRows.push(oldRows[i]);
                preDateTodo = oldRows[i]['pmsd.date_todo1'];
            }
        }
        gridPanel.rows = newRows;
    },
    
	/**
     * refresh all panels
     * add this method for 19.2 by Guo Jiangtao 2010-07-22
     */
    refreshPanels: function(){
        // apply restriction to the grid 
        if (this.schedDatesRes) {
            this.schedDatesRes += " AND ";
        }
        this.schedDatesRes += " pmsd.date_todo &lt;= ${sql.date(\'" + this.dateTodoTo + "\')} AND pmsd.date_todo &gt;= ${sql.date(\'" + this.dateTodoFrom + "\')}";
        this.byDateGrid.refresh(this.schedDatesRes);
        this.byTradeGrid.refresh(this.schedDatesRes);
        this.byTradeByBuildingGrid.refresh(this.schedDatesRes);
    }
})

function showPmsByDate(){
    //1 get data when click any text in byDateGrid
    var grid = View.panels.get('byDateGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var dateTodo = selectedRow["pmsd.date_todo"];
    var controller = View.controllers.get("viewPMWorkForecast");
    controller.dateTodo =  isBeingISODateFormat(dateTodo) ? dateTodo : getDateWithISOFormat(dateTodo); 
    
    //2 refresh the pms panel  
    var restriction = getRestriction(controller.dateTodo, null, null, grid.restriction, "byDateTab");
    var pmsReport = View.panels.get('pmsForcastReport');
    pmsReport.refresh(restriction);
}

function showPmsByTrade(){
    //1 get data when click any text in byTradeGrid
    var tradeGrid = View.panels.get('byTradeGrid');
    var selectedRow = tradeGrid.rows[tradeGrid.selectedRowIndex];
    var tradeID = selectedRow["pmp.tr_id"];
    var dateTodo = selectedRow["pmsd.date_todo1"];
    if (!dateTodo) 
        return;
    var controller = View.controllers.get("viewPMWorkForecast");
    controller.dateTodo =  isBeingISODateFormat(dateTodo) ? dateTodo : getDateWithISOFormat(dateTodo); 
    controller.tradeCode = tradeID;
    
    //2 refresh the pms panel    
    var restriction = getRestriction(controller.dateTodo, tradeID, null, tradeGrid.restriction, "byTradeTab");
    var pmsReport = View.panels.get('pmsForcastReport');
    pmsReport.refresh(restriction);
}

function showPmsByTradeBuilding(){
    //1 get data when click any text in byTradeByBuildingGrid	
    var grid = View.panels.get('byTradeByBuildingGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var tradeID = selectedRow["pmp.tr_id"];
    var buildingID = selectedRow["pms.bl_id"];
    var dateTodo = selectedRow["pmsd.date_todo1"];
    if (!dateTodo) 
        return;
    var controller = View.controllers.get("viewPMWorkForecast");
    controller.dateTodo =  isBeingISODateFormat(dateTodo) ? dateTodo : getDateWithISOFormat(dateTodo); 
    controller.tradeCode = tradeID;
    controller.buildingCode = buildingID;
    
    //2 refresh the pms panel  
    var restriction = getRestriction(controller.dateTodo, tradeID, buildingID, grid.restriction, "byTradeByBuildingTab");
    var pmsReport = View.panels.get('pmsForcastReport');
    pmsReport.refresh(restriction);
}

function showOrHideFields(showDateField, showTradeField, showBuildingField){
    var pmsReport = View.panels.get('pmsForcastReport');
    if (pmsReport.rows.length == 0) {
        return;
    }
    var headerRow = pmsReport.headerRows[0];
    
    var dateColumnIndex = getColumnIndexByFullName("pmsd.date_todo", pmsReport.columns);
    var buildingColumnIndex = getColumnIndexByFullName("pms.bl_id", pmsReport.columns);
    var tradeColumnIndex = getColumnIndexByFullName("pmp.tr_id", pmsReport.columns);
    
    //show or hide column header
    if (showDateField) {
        headerRow.childNodes[dateColumnIndex].style.display = "";
    }
    else {
        headerRow.childNodes[dateColumnIndex].style.display = "none";
    }
    if (showTradeField) {
        headerRow.childNodes[tradeColumnIndex].style.display = "";
    }
    else {
        headerRow.childNodes[tradeColumnIndex].style.display = "none";
    }
    if (showBuildingField) {
        headerRow.childNodes[buildingColumnIndex].style.display = "";
    }
    else {
        headerRow.childNodes[buildingColumnIndex].style.display = "none";
    }
    //show or hide column 	
    var len = pmsReport.gridRows.length;
    for (var i = 0; i < len; i++) {
        var row = pmsReport.gridRows.items[i];
        if (showDateField) {
            row.cells.items[dateColumnIndex].dom.style.display = "";
        }
        else {
            row.cells.items[dateColumnIndex].dom.style.display = "none";
        }
        if (showTradeField) {
            row.cells.items[tradeColumnIndex].dom.style.display = "";
        }
        else {
            row.cells.items[tradeColumnIndex].dom.style.display = "none";
        }
        if (showBuildingField) {
            row.cells.items[buildingColumnIndex].dom.style.display = "";
        }
        else {
            row.cells.items[buildingColumnIndex].dom.style.display = "none";
        }
    }
}


function getRestriction(dateTodo, tradeCode, buildingCode, consoleRestriciton, curTab){
    var restriction = " pmsd.date_todo = ${sql.date(\'" + dateTodo + "\')}";
    if (consoleRestriciton) {
        restriction += " AND " + consoleRestriciton;
    }
    if (curTab == "byDateTab") 
        return restriction;
    
    if (!tradeCode) {
        restriction += " AND pmp.tr_id is null ";
    }
    else {
        restriction += " AND pmp.tr_id ='" + tradeCode + "'";
    }
    if (curTab == "byTradeTab") 
        return restriction;
    
    if (!buildingCode) {
        restriction += " AND pms.bl_id is null ";
    }
    else {
        restriction += " AND pms.bl_id ='" + buildingCode + "'";
    }
    if ("byTradeByBuildingTab" == curTab) 
        return restriction;
}


