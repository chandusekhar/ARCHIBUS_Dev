/**
 * @author keven.xi
 */
View.createController('viewPmSched', {

    curTab: "eq_tab",
    
    afterViewLoad: function(){
        this.pmgpPmsReport.show(false);
        this.group_by_tabs.addEventListener('beforeTabChange', this.beforeTabChange.createDelegate(this));
    },
    
    beforeTabChange: function(tabPanel, selectedTabName, newTabName){
        var restriction = new Ab.view.Restriction();
        this.curTab = newTabName;
        if (newTabName == "rm_tab") {
            var rmGrid = View.panels.get('by_room');
            if (rmGrid.gridRows.length == 0) {
                rmGrid.refresh(restriction);
            }
        }
        if (newTabName == "tr_tab") {
            var trGrid = View.panels.get('by_trade');
            if (trGrid.gridRows.length == 0) {
                trGrid.refresh(restriction);
            }
        }
        if (newTabName == "pmgp_tab") {
            var schedGrpGrid = View.panels.get('by_schedule_group');
            if (schedGrpGrid.gridRows.length == 0) {
                schedGrpGrid.refresh(restriction);
            }
        }
    },
    
    pmsPmpReport_afterRefresh: function(){
        var len = this.pmsPmpReport.gridRows.length;
        switch (this.curTab) {
            case "eq_tab":
                var showColumns = new Array();
                var hideColumns = new Array();
                showColumns[0] = getColumnIndexByFullName("pms.pms_id", this.pmsPmpReport.columns);// pms.pms_id
                showColumns[1] = getColumnIndexByFullName("pms.pmp_id", this.pmsPmpReport.columns);//pms.pmp_id
                showColumns[2] = getColumnIndexByFullName("pmp.description", this.pmsPmpReport.columns);//pmp.description
                showColumns[3] = getColumnIndexByFullName("pms.pm_group", this.pmsPmpReport.columns);//pms.pm_group
                showColumns[4] = getColumnIndexByFullName("pms.comments", this.pmsPmpReport.columns);//pms.comments				
                hideColumns[0] = getColumnIndexByFullName("pmp.pmp_id", this.pmsPmpReport.columns); //pmp.pmp_id				
                hideColumns[1] = getColumnIndexByFullName("pmp.units", this.pmsPmpReport.columns); //pmp.units
                hideColumns[2] = getColumnIndexByFullName("pmp.units_hour", this.pmsPmpReport.columns); //pmp.units_hour
                hideColumns[3] = getColumnIndexByFullName("pmp.ac_id", this.pmsPmpReport.columns); //pmp.ac_id
                hideColumns[4] = getColumnIndexByFullName("pms.eq_id", this.pmsPmpReport.columns); //pms.eq_id
                hideColumns[5] = getColumnIndexByFullName("pms.bl_id", this.pmsPmpReport.columns); //pms.bl_id
                hideColumns[6] = getColumnIndexByFullName("pms.fl_id", this.pmsPmpReport.columns); //pms.fl_id
                hideColumns[7] = getColumnIndexByFullName("pms.rm_id", this.pmsPmpReport.columns); //pms.rm_id
                hideColumns[8] = getColumnIndexByFullName("pms.interval_3", this.pmsPmpReport.columns);//pms.interval_3
                hideColumns[9] = getColumnIndexByFullName("pms.interval_4", this.pmsPmpReport.columns);//pms.interval_4
                hideColumns[10] = getColumnIndexByFullName("pms.nactive", this.pmsPmpReport.columns);//pms.nactive
                hideColumns[11] = getColumnIndexByFullName("pms.priority", this.pmsPmpReport.columns);//pms.priority					
                this.showAndHideColumns(showColumns, hideColumns);
                break;
            case "rm_tab":
                var showColumns = new Array();
                var hideColumns = new Array();
                showColumns[0] = getColumnIndexByFullName("pms.pms_id", this.pmsPmpReport.columns);// pms.pms_id
                showColumns[1] = getColumnIndexByFullName("pms.pmp_id", this.pmsPmpReport.columns);//pms.pmp_id
                showColumns[2] = getColumnIndexByFullName("pmp.description", this.pmsPmpReport.columns);//pmp.description
                showColumns[3] = getColumnIndexByFullName("pms.pm_group", this.pmsPmpReport.columns);//pms.pm_group
                showColumns[4] = getColumnIndexByFullName("pms.comments", this.pmsPmpReport.columns);//pms.comments				
                showColumns[5] = getColumnIndexByFullName("pms.interval_3", this.pmsPmpReport.columns);//pms.interval_3
                showColumns[6] = getColumnIndexByFullName("pms.interval_4", this.pmsPmpReport.columns);//pms.interval_4				
                showColumns[7] = getColumnIndexByFullName("pms.nactive", this.pmsPmpReport.columns);//pms.nactive
                showColumns[8] = getColumnIndexByFullName("pms.priority", this.pmsPmpReport.columns);//pms.priority				
                hideColumns[0] = getColumnIndexByFullName("pmp.pmp_id", this.pmsPmpReport.columns); //pmp.pmp_id				
                hideColumns[1] = getColumnIndexByFullName("pmp.units", this.pmsPmpReport.columns); //pmp.units
                hideColumns[2] = getColumnIndexByFullName("pmp.units_hour", this.pmsPmpReport.columns); //pmp.units_hour
                hideColumns[3] = getColumnIndexByFullName("pmp.ac_id", this.pmsPmpReport.columns); //pmp.ac_id
                hideColumns[4] = getColumnIndexByFullName("pms.eq_id", this.pmsPmpReport.columns); //pms.eq_id
                hideColumns[5] = getColumnIndexByFullName("pms.bl_id", this.pmsPmpReport.columns); //pms.bl_id
                hideColumns[6] = getColumnIndexByFullName("pms.fl_id", this.pmsPmpReport.columns); //pms.fl_id
                hideColumns[7] = getColumnIndexByFullName("pms.rm_id", this.pmsPmpReport.columns); //pms.rm_id							
                this.showAndHideColumns(showColumns, hideColumns);
                break;
            case "tr_tab":
                var showColumns = new Array();
                var hideColumns = new Array();
                showColumns[0] = getColumnIndexByFullName("pmp.pmp_id", this.pmsPmpReport.columns); //pmp.pmp_id
                showColumns[1] = getColumnIndexByFullName("pmp.description", this.pmsPmpReport.columns); //pmp.description;
                showColumns[2] = getColumnIndexByFullName("pmp.units", this.pmsPmpReport.columns); //pmp.units
                showColumns[3] = getColumnIndexByFullName("pmp.units_hour", this.pmsPmpReport.columns); //pmp.units_hour
                showColumns[4] = getColumnIndexByFullName("pmp.ac_id", this.pmsPmpReport.columns); //pmp.ac_id				
                showColumns[5] = getColumnIndexByFullName("pms.pms_id", this.pmsPmpReport.columns); //pms.pms_id	
                showColumns[6] = getColumnIndexByFullName("pms.eq_id", this.pmsPmpReport.columns); //pms.eq_id
                showColumns[7] = getColumnIndexByFullName("pms.bl_id", this.pmsPmpReport.columns); //pms.bl_id
                showColumns[8] = getColumnIndexByFullName("pms.fl_id", this.pmsPmpReport.columns); //pms.fl_id
                showColumns[9] = getColumnIndexByFullName("pms.rm_id", this.pmsPmpReport.columns); //pms.rm_id						
                showColumns[10] = getColumnIndexByFullName("pms.pm_group", this.pmsPmpReport.columns); //pms.pm_group
                showColumns[11] = getColumnIndexByFullName("pms.comments", this.pmsPmpReport.columns);// pms.comments							
                showColumns[12] = getColumnIndexByFullName("pms.priority", this.pmsPmpReport.columns); //pms.priority				
                hideColumns[0] = getColumnIndexByFullName("pms.pmp_id", this.pmsPmpReport.columns);// pms.pmp_id				
                hideColumns[1] = getColumnIndexByFullName("pms.nactive", this.pmsPmpReport.columns);//pms.nactive				
                hideColumns[2] = getColumnIndexByFullName("pms.interval_3", this.pmsPmpReport.columns);//pms.interval_3
                hideColumns[3] = getColumnIndexByFullName("pms.interval_4", this.pmsPmpReport.columns);//pms.interval_4							
                this.showAndHideColumns(showColumns, hideColumns);
                break;
            case "pmgp_tab":
                break;
        }
    },
    
    showAndHideColumns: function(showColumns, hideColumns){
        var headerRow = this.pmsPmpReport.headerRows[0];
        var showsLen = showColumns.length;
        var hidesLen = hideColumns.length;
        
        //show column header
        for (var j = 0; j < showsLen; j++) {
            headerRow.childNodes[showColumns[j]].style.display = "";
        }
        //hide column header
        for (var k = 0; k < hidesLen; k++) {
            headerRow.childNodes[hideColumns[k]].style.display = "none";
        }
        
        //show or hide column in grid
        var rowsLen = this.pmsPmpReport.gridRows.length;
        for (var i = 0; i < rowsLen; i++) {
            var row = this.pmsPmpReport.gridRows.items[i];
            for (var j = 0; j < showsLen; j++) {
                row.cells.items[showColumns[j]].dom.style.display = "";
            }
            for (var k = 0; k < hidesLen; k++) {
                row.cells.items[hideColumns[k]].dom.style.display = "none";
            }
        }
    }
    
})

function onTradePmpClick(){
    //1 get the trade code from by_trade grid
    var grid = View.panels.get('by_trade');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var tradeID = selectedRow["tr.tr_id"];
    var title = getMessage("schedPanelTitle") + " " + tradeID;
    setPanelTitle('pmsPmpReport', title);
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("pmp.tr_id", tradeID, "=");
    
    var pmgpPmsReport = View.panels.get('pmgpPmsReport');
    pmgpPmsReport.show(false);
    var pmsPmpReport = View.panels.get('pmsPmpReport');
    pmsPmpReport.refresh(restriction);
    pmsPmpReport.show(true);
}

function onRoomClick(){
    //1 get the trade code from by_room grid
    var grid = View.panels.get('by_room');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var siteID = selectedRow["pms.site_id"];
    var buildingID = selectedRow["pms.bl_id"];
    var floorID = selectedRow["pms.fl_id"];
    var roomID = selectedRow["pms.rm_id"];
    var title = getMessage("schedPanelTitle")+" ";
    title += getPMScgedulePanelTitle(siteID, buildingID, floorID, roomID);
    setPanelTitle('pmsPmpReport', title);
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("pms.bl_id", buildingID, "=");
    restriction.addClause("pms.fl_id", floorID, "=");
    restriction.addClause("pms.rm_id", roomID, "=");
    
    var pmgpPmsReport = View.panels.get('pmgpPmsReport');
    pmgpPmsReport.show(false);
    var pmsPmpReport = View.panels.get('pmsPmpReport');
    pmsPmpReport.refresh(restriction);
    pmsPmpReport.show(true);
}

function getPMScgedulePanelTitle(site, building, floor, room){
    var result = "";
    if (site) 
        result = site;
    if (building) 
        result += "-" + building;
    if (floor) 
        result += "-" + floor;
    if (room) 
        result += "-" + room;
    return result;
}

function onEquipmentClick(){
    //1 get the trade code from by_equipment grid
    var grid = View.panels.get('by_equipment');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var equipID = selectedRow["pms.eq_id"];
    var title = getMessage("schedPanelTitle") + " " + equipID;
    setPanelTitle('pmsPmpReport', title);
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("pms.eq_id", equipID, "=");
    
    var pmgpPmsReport = View.panels.get('pmgpPmsReport');
    pmgpPmsReport.show(false);
    var pmsPmpReport = View.panels.get('pmsPmpReport');
    pmsPmpReport.refresh(restriction);
    pmsPmpReport.show(true);
}

function onPmGroupClick(){
    //1 get the trade code from by_equipment grid
    var grid = View.panels.get('by_schedule_group');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var pmGroup = selectedRow["pms.pm_group"];
    var title = getMessage("schedPanelTitle") + " " + pmGroup;
    setPanelTitle('pmgpPmsReport', title);
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("pms.pm_group", pmGroup, "=");
    
    var pmsPmpReport = View.panels.get('pmsPmpReport');
    pmsPmpReport.show(false);
    var pmgpPmsReport = View.panels.get('pmgpPmsReport');
    pmgpPmsReport.refresh(restriction);
    pmgpPmsReport.show(true);
}
