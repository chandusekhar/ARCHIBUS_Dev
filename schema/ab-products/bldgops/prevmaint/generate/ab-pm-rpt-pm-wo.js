/**
 * @author keven.xi
 */
function user_form_afterSelect(){
    var controller = View.controllers.get('viewPMWorkOrder');
    var tabs = null;
    if (View.parentTab) {
        tabs = View.parentTab.parentPanel;
    }
    if (tabs) {
        if (!tabs.isFirstTimeLoad) {
            controller.afterInitialDataFetch();
        }
        tabs.isFirstTimeLoad = false;
    }
    
}

var viewPMWorkOrderController = View.createController('viewPMWorkOrder', {

    workOrderCode: "",
    workRequestCode: "",
	wrStatus: "",
    consoleValue: new Object(),

	setConsoleValueFromUrl: function() {
		var strHref = window.location.href;
		var startWo;
		var endWo;
		var pmtype;
  		//find out if there are any 
 		if ( strHref.indexOf("?") > -1 ){
    		var strQueryString = strHref.substr(strHref.indexOf("?")+1);
    		var aQueryString = strQueryString.split("&");
    		for ( var iParam = 0; iParam < aQueryString.length; iParam++ ){
     			if (aQueryString[iParam].indexOf("=") > -1 ){
        			var aParam = aQueryString[iParam].split("=");
        			
        			if(aParam[0].toLowerCase() == String('startWo').toLowerCase()){
        				startWo = unescape(aParam[1]);
        			} else if(aParam[0].toLowerCase() == String('endWo').toLowerCase()){
        				endWo = unescape(aParam[1]);
        			} else if(aParam[0].toLowerCase() == String('pmType').toLowerCase()){
        				pmtype = unescape(aParam[1]);
        			} 
        		}
      		}
		    this.filterWorkOrderPanel.setFieldValue("wo.workOrderFrom", startWo);
		    this.filterWorkOrderPanel.setFieldValue("wo.workOrderTo", endWo);
		    $('woType').value = pmtype;
                       }
	},

    afterInitialDataFetch: function(){
        this.workOrderCode = "";
        this.workRequestCode = "";
        var tabs = null;
        if (View.parentTab) {
            tabs = View.parentTab.parentPanel;
        }
        if (tabs) {
            if (tabs.workflow != 'free') {
                tabs.isFirstTimeLoad = true;
            }
            tabs.setTabTitle("viewWoTab", getMessage('viewWoTabTitle'));
            tabs.workflow = 'free';
            tabs.setAllTabsEnabled(true);
            this.setStoredConsoleValue();
        }
		else{
            this.setConsoleValueFromUrl();
		}
        this.filterWorkOrderPanel_onSearch();
    },
    
    /**
     * action search
     *
     */
    filterWorkOrderPanel_onSearch: function(){
        var restriction = "";
        var console = this.filterWorkOrderPanel;
        var woDS = View.dataSources.get("ds_ab-pm-rpt-pm-wo_filter_wo");
        
        // wo.wo_id value range
        var workOrderNumFrom = console.getFieldValue('wo.workOrderFrom');
        if (workOrderNumFrom != '') {
            restriction += "wo.wo_id &gt;= '" + workOrderNumFrom + "'";
        }
        var workOrderNumTo = console.getFieldValue('wo.workOrderTo');
        if (workOrderNumTo != '') {
            if (restriction) 
                restriction += " AND "
            restriction += "wo.wo_id &lt;= '" + workOrderNumTo + "'";
        }
        
        // wo.date_assigned value range
        var dateAssignedFrom = console.getFieldValue('wo.date_assigned.from');
        //parse date 
        dateAssignedFrom = woDS.parseValue('wo.date_assigned.from', dateAssignedFrom, true);
        if (dateAssignedFrom != '') {
            if (restriction) 
                restriction += " AND "
            restriction += "wo.date_assigned &gt;= ${sql.date(\'" + dateAssignedFrom  +"\')}";
        }
        var dateAssignedTo = console.getFieldValue('wo.date_assigned.to');
        dateAssignedTo = woDS.parseValue('wo.resolve_date.to', dateAssignedTo, true);
        if (dateAssignedTo != '') {
            if (restriction) 
                restriction += " AND "
            restriction += "wo.date_assigned &lt;= ${sql.date(\'" + dateAssignedTo + "\')}";
        }
        //primary work type
        var selectedIndex = $('woType').selectedIndex;
        var workType = $('woType').options[selectedIndex].value;
        if (restriction) 
            restriction += " AND "
        restriction += "wo.wo_type = '" + workType + "'";
        
        //Site
        var siteCode = console.getFieldValue('wr.site_id');
        var buildingCode = console.getFieldValue('wr.bl_id');
        var floorCode = console.getFieldValue('wr.fl_id');
        var tradeCode = console.getFieldValue('wo.tr_id');
        var pmGroupCode = console.getFieldValue('pms.pm_group');
        if (siteCode || buildingCode || floorCode || pmGroupCode ||tradeCode) {
            if (restriction) 
                restriction += " AND ";
            restriction += " EXISTS(SELECT 1 FROM wr,pms,pmp WHERE wr.wo_id = wo.wo_id and wr.pms_id = pms.pms_id and wr.pmp_id = pms.pmp_id and pms.pmp_id = pmp.pmp_id ";
		restriction+=" AND "+getSchedDatesRestriction(siteCode, buildingCode, floorCode, pmGroupCode ,tradeCode )+" )";
        }
        
		//Guo comment below code 2009-09-10 to fix KB3024296
        //Date Work Order Issued is NULL
        //if (restriction) 
        //    restriction += " AND "
        //restriction += "wo.date_issued IS NULL ";
		
		//Guo added 2009-08-26 to fix KB3024175
		this.wrStatus = $('wr.status').value;
		if(this.wrStatus){
			restriction += " AND EXISTS(SELECT 1 FROM wr WHERE wr.wo_id = wo.wo_id AND wr.status='" + this.wrStatus+  "')";
		}else{
			restriction += " AND EXISTS(SELECT 1 FROM wr WHERE wr.wo_id = wo.wo_id AND wr.status IN ('AA','I'))";
		}
        
        //refresh the work order grid
        this.woGrid.refresh(restriction);
        this.woGrid.show(true);
        
        if (View.parentTab) {
            var tabs = View.parentTab.parentPanel;
        }
        if (tabs) {
            this.storeConsoleValue(workOrderNumFrom, workOrderNumTo, dateAssignedFrom, dateAssignedTo, workType, siteCode, buildingCode, floorCode, pmGroupCode, tradeCode);
        }
        
    },
    
    woGrid_afterRefresh: function(){
        if (this.woGrid.rows.length != 0) {
            this.workOrderCode = this.woGrid.rows[0]["wo.wo_id"];
        }
        else {
            this.workOrderCode = "";
        }
        
        var restriction = new Ab.view.Restriction();
        if ("" != this.workOrderCode) {
            restriction.addClause("wr.wo_id", this.workOrderCode, "=");
            if (this.wrStatus) {
                restriction.addClause("wr.status", this.wrStatus, "=");
            }
            else {
                restriction.addClause("wr.status", ['AA', 'I'], "IN");
            }
            var wrDS = View.dataSources.get("ds_ab-pm-rpt-pm-wo_show_wr");
            var records = wrDS.getRecords(restriction);
            if (records.length != 0) {
                this.workRequestCode = records[0].getValue("wr.wr_id");
            }
            else {
                this.workRequestCode = "";
            }
        }
        else {
            this.workRequestCode = "";
            restriction.addClause("wr.wr_id", "-1", "=");
        }
        this.wrGrid.refresh(restriction);
    },
    
    wrGrid_afterRefresh: function(){
        //set title of work request panel 
        var title = getMessage("wrPanelTitle") + " " + this.workOrderCode;
        setPanelTitle('wrGrid', title);
        //refresh the wr resource panels
        showPanelsByWorkRequest(this.workRequestCode);
    },
    
    /**
     * open a new browser window or tab
     * that will contain a printable EQPMWOWR report for the work orders displayed in woGrid
     */
    woGrid_onPrint: function(){
        //Guo changed 2009-08-19 for PM release2
        this.woIdList = '';
        var woIdArray = [];
        for (var i = 0, row; row = this.woGrid.rows[i]; i++) {
            this.woIdList += row['wo.wo_id'] + ",";
            woIdArray.push(row['wo.wo_id']);
        }
        
        if (i > 0) {
            this.woIdList = '(' + this.woIdList.substr(0, this.woIdList.length - 1) + ')';
            
            var ds = View.dataSources.get("ds_ab-pm-rpt-pm-wo_show_pmps");
            ds.addParameter('woWoIdList', this.woIdList);
            var record = ds.getRecord();
            var maxPmpsCount = parseInt(record.getValue('pmps.max_pmps_count'));
			//Guo changed 2009-09-15 to fix KB3024475
            var parameter = null;
			var viewName='';
            if (maxPmpsCount > 1) {
                    viewName= 'ab-pm-rpt-wo-prnt.axvw'
            }
            else {
                    viewName= 'ab-pm-rpt-wo-prnt-cos.axvw'
            }
			var result = {};
			// open print work orders paginated report--not consolidated,file='PreventiveMaintenanceCommonHandler.java'
            try {
				result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-openPrintWosPaginatedReport', woIdArray, viewName);
			} 
			catch (e) {
				Workflow.handleError(e);
			}
            if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
                result.data = eval('(' + result.jsonExpression + ')');
                var jobId = result.data.jobId;
                var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
                View.openDialog(url);
            }
        }
        
        //var requestPrefix = window.location;
        //requestPrefix = requestPrefix.href.substring(0, requestPrefix.href.indexOf('/schema/') + 1);
        //var win = window.open(requestPrefix + "schema/ab-products/bldgops/prevmaint/reports-equip/ab-eqpmwowr-print.html");
    },
    
    setStoredConsoleValue: function(){
        var tabs = null;
        if (View.parentTab) {
            tabs = View.parentTab.parentPanel;
        }
        if (tabs && tabs.setFilterTabRestric) {
            this.filterWorkOrderPanel.setFieldValue("wo.workOrderFrom", tabs.workOrderNumFrom);
            this.filterWorkOrderPanel.setFieldValue("wo.workOrderTo", tabs.workOrderNumTo);
            this.filterWorkOrderPanel.setFieldValue("wo.date_assigned.from", tabs.dataFrom);
            this.filterWorkOrderPanel.setFieldValue("wo.date_assigned.to", tabs.dataTo);
            this.filterWorkOrderPanel.setFieldValue("wr.site_id", tabs.siteId);
            this.filterWorkOrderPanel.setFieldValue("wr.bl_id", tabs.blId);
            this.filterWorkOrderPanel.setFieldValue("wr.fl_id", tabs.flId);
            this.filterWorkOrderPanel.setFieldValue("pms.pm_group", tabs.pmGroup);
            this.filterWorkOrderPanel.setFieldValue("wo.tr_id", tabs.trId);
            $('woType').value = tabs.primaryWorkType;
            tabs.setFilterTabRestric = false;
        }
        else {
            this.filterWorkOrderPanel.setFieldValue("wo.workOrderFrom", this.consoleValue.workOrderNumFrom);
            this.filterWorkOrderPanel.setFieldValue("wo.workOrderTo", this.consoleValue.workOrderNumTo);
            this.filterWorkOrderPanel.setFieldValue("wo.date_assigned.from", this.consoleValue.dataFrom);
            this.filterWorkOrderPanel.setFieldValue("wo.date_assigned.to", this.consoleValue.dataTo);
            this.filterWorkOrderPanel.setFieldValue("wr.site_id", this.consoleValue.siteId);
            this.filterWorkOrderPanel.setFieldValue("wr.bl_id", this.consoleValue.blId);
            this.filterWorkOrderPanel.setFieldValue("wr.fl_id", this.consoleValue.flId);
            this.filterWorkOrderPanel.setFieldValue("pms.pm_group", this.consoleValue.pmGroup);
            this.filterWorkOrderPanel.setFieldValue("wo.tr_id", this.consoleValue.trId);
            $('woType').value = this.consoleValue.primaryWorkType;
        }
    },
    
    storeConsoleValue: function(workOrderNumFrom, workOrderNumTo, dataFrom, dataTo, primaryWorkType, siteId, blId, flId, pmGroup, trId){
        this.consoleValue.workOrderNumFrom = workOrderNumFrom;
        this.consoleValue.workOrderNumTo = workOrderNumTo;
        this.consoleValue.dataFrom = dataFrom;
        this.consoleValue.dataTo = dataTo;
        this.consoleValue.primaryWorkType = primaryWorkType;
        this.consoleValue.siteId = siteId;
        this.consoleValue.blId = blId;
        this.consoleValue.flId = flId;
        this.consoleValue.pmGroup = pmGroup;
        this.consoleValue.trId = trId;
    }
});

function onSelectWorkOrder(){
    //1 get data when click any text in work order grid
    var grid = View.panels.get('woGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var woCode = selectedRow["wo.wo_id"];
    
    //2 refresh the pms panel  
    var restriction = new Ab.view.Restriction();
    restriction.addClause("wo.wo_id", woCode, "=");
	var cotroller = View.controllers.get('viewPMWorkOrder');
	if(cotroller.wrStatus){
		restriction.addClause("wr.status", cotroller.wrStatus, "=");
	}else{
		restriction.addClause("wr.status", ['AA','I'], "IN");
	}
    
    var wrDS = View.dataSources.get("ds_ab-pm-rpt-pm-wo_show_wr");
    var records = wrDS.getRecords(restriction);
    if (records.length != 0) {
        cotroller.workRequestCode = records[0].getValue("wr.wr_id");
    }
    else {
        cotroller.workRequestCode = "";
    }
    cotroller.wrGrid.refresh(restriction);
    //set title of work request panel 
    var title = getMessage("wrPanelTitle") + " " + woCode;
    setPanelTitle('wrGrid', title);
}

function onSelectWorkRequest(){
    //1 get data when click any text in work request grid
    var grid = View.panels.get('wrGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var wrCode = selectedRow["wr.wr_id"];
    
    //refresh the wr resource panels
    showPanelsByWorkRequest(wrCode);
}

function showPanelsByWorkRequest(workRequestCode){
    //set resource panels title
    var title = getMessage("wrTradePanelTitle") + " " + workRequestCode;
    setPanelTitle('tradeReport', title);
    title = getMessage("wrPartPanelTitle") + " " + workRequestCode;
    setPanelTitle('partReport', title);
    title = getMessage("wrToolTypePanelTitle") + " " + workRequestCode;
    setPanelTitle('toolTypeReport', title);
    title = getMessage("wrToolPanelTitle") + " " + workRequestCode;
    setPanelTitle('toolReport', title);
    title = getMessage("wrLaborPanelTitle") + " " + workRequestCode;
    setPanelTitle('craftReport', title);
    
    var restriction = new Ab.view.Restriction();
    if ("" == workRequestCode) {
        restriction.addClause("wr.wr_id", "-1", "=");
    }
    else {
        restriction.addClause("wr.wr_id", workRequestCode, "=");
    }
    //refresh resource panels
    var cotroller = View.controllers.get('viewPMWorkOrder');
    cotroller.tradeReport.refresh(restriction);
    cotroller.partReport.refresh(restriction);
    cotroller.toolTypeReport.refresh(restriction);
    cotroller.toolReport.refresh(restriction);
    cotroller.craftReport.refresh(restriction);
}

function setDefaultValue(){
    $('woType').value = "EQPM";
}



var PanelId = '', Type = '';
function openDialog(panelid,type){

   //KB#3039865: add restriction to only show pm work orders in select-value list
	var pmRestriction = new Ab.view.Restriction();
    pmRestriction.addClause("wo.wo_type", "EQPM", "=", "OR" );
    pmRestriction.addClause("wo.wo_type", "HSPM", "=", "OR" );

	PanelId = panelid;
	Type = type;
    if (Type == "woFrom") {
        View.selectValue(PanelId, getMessage("woFrom"), ['wo.workOrderFrom'], 'wo', ['wo.wo_id'], ['wo.wo_id', 'wo.description'], pmRestriction, null, null, null, null, 800, 500, null, null, null);
    }
    else 
        if (Type == "woTo") {
            View.selectValue(PanelId, getMessage("woTo"), ['wo.workOrderTo'], 'wo', ['wo.wo_id'], ['wo.wo_id', 'wo.description'], pmRestriction, null, null, null, null, 800, 500, null, null, null);
        }
        else 
            if (Type == "bl") {
                if (View.panels.get("filterWorkOrderPanel").getFieldValue('wr.site_id')) {
                    var sql = "site_id='" + View.panels.get("filterWorkOrderPanel").getFieldValue('wr.site_id') + "'";
                    View.selectValue(PanelId, getMessage("BlCode"), ['wr.site_id','wr.bl_id'], 'bl', ['bl.site_id','bl.bl_id'], ['bl.site_id', 'bl.bl_id', 'bl.name'], sql, null, null, null, null, 800, 500, null, null, null);
                }
                else 
                    View.selectValue(PanelId, getMessage("BlCode"), ['wr.site_id','wr.bl_id'], 'bl', ['bl.site_id', 'bl.bl_id'], ['bl.site_id', 'bl.bl_id', 'bl.name'], null, null, null, null, null, 800, 500, null, null, null);
                
            }
}
