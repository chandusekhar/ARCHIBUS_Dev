var abBldgopsReportHwrResourcesController = View.createController('abBldgopsReportHwrResourcesController', {
    dateStart: '1900-12-15',
    dateEnd: '2200-12-15',
    workOrderCode: "",
    workRequestCode: "",
	consoleParam:'',
	workType:'',
    fieldsArraysForRestriction: new Array(['wr.dv_id','','hwr.dv_id'], ['wr.dp_id','','hwr.dp_id'], ['wr.prob_type','like','hwr.prob_type'], ['wr.site_id','','hwr.site_id'], ['wr.bl_id','','hwr.bl_id'], ['wr.fl_id','','hwr.fl_id']),
    consoleValue: new Object(),
	
    /**
     * action search
     */
	afterViewLoad:function(){
		setStartAndEndDateValue(this, this.abBldgopsReportHwrResourcesConsole, "wr.date_completed");
		},
	afterInitialDataFetch: function(){
		this.abBldgopsReportHwrResourcesConsole_onSearch();
	},
	/**
	 * Clear console and set default value
	 */
	abBldgopsReportHwrResourcesConsole_onClear:function(){
		this.abBldgopsReportHwrResourcesConsole.clear();
		setDefaultValueForHtmlField(['worktype'],['both']);
	},
	
	/**
	 * Get date restriction for <restriction> tig
	 * @param {Object} consolePanel
	 * @param {Object} fieldName
	 */
	getRestrictionStrOfDateRangeForRes:function(consolePanel,fieldName){
		var restrictionStr = "";
        var dateStart = consolePanel.getFieldValue(fieldName+".from");
        var dateEnd = consolePanel.getFieldValue(fieldName+".to");
        if (dateStart) {
			restrictionStr += " AND " + fieldName + ">=${sql.date('"+dateStart+"')} ";
        }
        if (dateEnd) {
			restrictionStr += " AND " + fieldName + "<=${sql.date('"+dateEnd+"')} ";
        }
		return restrictionStr;
	},
	
	/**
	 * Search button is for search wo,wr.. panel below itself panel
	 */
    abBldgopsReportHwrResourcesConsole_onSearch: function(){
		var selectedEL;
		selectedEL = document.getElementById("worktype");
		this.workType = selectedEL.options[selectedEL.selectedIndex].value;
		
		var console = View.panels.get('abBldgopsReportHwrResourcesConsole');
		
		var otherRes = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);
		this.consoleParam = otherRes + this.getRestrictionStrOfDateRangeForRes(console, 'wr.date_completed').replace(/wr/g, "hwr");
		var woRes='';
		if (this.workType == 'ondemand') {
			woRes = " EXISTS( SELECT 1 FROM hwr WHERE "+this.consoleParam+" AND hwo.wo_id=hwr.wo_id   AND hwr.prob_type!='PREVENTIVE MAINT' )";
		}
		else 
			if (this.workType == 'pm') {
				woRes = "  EXISTS(SELECT 1 FROM hwr,pms,pmp WHERE "+this.consoleParam+"  AND hwr.prob_type='PREVENTIVE MAINT' AND hwr.wo_id = hwo.wo_id and hwr.pms_id = pms.pms_id and hwr.pmp_id = pms.pmp_id and pms.pmp_id = pmp.pmp_id )";
			}else{
				woRes = " EXISTS( SELECT 1 FROM hwr WHERE "+this.consoleParam+" AND hwo.wo_id=hwr.wo_id  )";
			}
		var panel = this.abBldgopsReportHwrResourcesWoGrid;
		panel.addParameter('woRes', woRes);
		panel.refresh();
    },
	
	abBldgopsReportHwrResourcesWoGrid_afterRefresh: function(){
        if (this.abBldgopsReportHwrResourcesWoGrid.rows.length != 0) {
            this.workOrderCode = this.abBldgopsReportHwrResourcesWoGrid.rows[0]["hwo.wo_id"];
        }
        else {
            this.workOrderCode = "";
        }
        
        var restriction = new Ab.view.Restriction();
        if ("" != this.workOrderCode) {
            restriction.addClause("hwr.wo_id", this.workOrderCode, "=");
            
           	//restriction.addClause("hwr.status", ['Com', 'Clo'], "IN");
            
            var wrDS = View.dataSources.get("abBldgopsReportHwrResourcesWrGridDS");
            var records = wrDS.getRecords(restriction);
            if (records.length != 0) {
                this.workRequestCode = records[0].getValue("hwr.wr_id");
            }
            else {
                this.workRequestCode = "";
            }
        }
        else {
            this.workRequestCode = "";
            restriction.addClause("hwr.wr_id", "-1", "=");
        }
		
		var hwrRes='';
		if(this.workType == 'ondemand'){
			 hwrRes=this.consoleParam +"AND hwr.prob_type!='PREVENTIVE MAINT'";

		}else if(this.workType == 'pm'){
			  hwrRes=this.consoleParam +"AND hwr.prob_type!='PREVENTIVE MAINT' and  EXISTS( SELECT 1 FROM pms,pmp WHERE   hwr.pms_id = pms.pms_id and hwr.pmp_id = pms.pmp_id and pms.pmp_id = pmp.pmp_id)";

		}else{
			 hwrRes=this.consoleParam;
		}
				
		if(hwrRes==''){
			this.abBldgopsReportHwrResourcesWrGrid.addParameter('consoleParam', '1=1');
		}else{
			this.abBldgopsReportHwrResourcesWrGrid.addParameter('consoleParam', hwrRes);
		}
		
        this.abBldgopsReportHwrResourcesWrGrid.refresh(restriction);
    },
	
    abBldgopsReportHwrResourcesWrGrid_afterRefresh: function(){
        //set title of work request panel 
        var title = getMessage("wrPanelTitle") + " " + this.workOrderCode;
        setPanelTitle('abBldgopsReportHwrResourcesWrGrid', title);
        //refresh the wr resource panels
        showPanelsByWorkRequest(this.workRequestCode);
    },
	
    /**
     * open a new browser window or tab
     * that will contain a printable EQPMWOWR report for the work orders displayed in woGrid
     */
    abBldgopsReportHwrResourcesWoGrid_onPrint: function(){
		//Guo changed 2009-08-19 for PM release2
		var woIdList = '';
		var woIdArray = [];
		for (var i = 0, row; row = this.abBldgopsReportHwrResourcesWoGrid.rows[i]; i++) {
			woIdList += row['hwo.wo_id'] + ",";
			woIdArray.push(row['hwo.wo_id']);
		}
		//if (i > 0) {
		woIdList = '(' + woIdList.substr(0, woIdList.length - 1) + ')';
		
		var ds = View.dataSources.get("abBldgopsReportHwrResourcesPmsDS");
		ds.addParameter('woWoIdList', woIdList);
		var record = ds.getRecord();
		var maxPmpsCount = parseInt(record.getValue('pmps.max_pmps_count'));
		//Guo changed 2009-09-15 to fix KB3024475
		var parameter = null;
		var viewName = '';
		
        
        if (this.workType == 'ondemand') {
        	viewName = 'ab-bldgops-report-hwr-prnt-other-worktype.axvw';
        }
        else 
            if (this.workType == 'pm') {
                if (maxPmpsCount > 1) {
                    viewName = 'ab-bldgops-report-hwr-prnt.axvw';
                }
                else {
                    viewName = 'ab-bldgops-report-hwr-prnt-cos.axvw';
                }
            }
            else {
            	viewName = 'ab-bldgops-report-hwr-prnt-other-worktype.axvw';
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
		// }
		}
});

function onSelectWorkOrder(){
	//1 get data when click any text in work order grid
	var grid = View.panels.get('abBldgopsReportHwrResourcesWoGrid');
	var selectedRow = grid.rows[grid.selectedRowIndex];
	var woCode = selectedRow["hwo.wo_id"];
	
	//2 refresh the pms panel  
	var restriction = new Ab.view.Restriction();
	restriction.addClause("hwo.wo_id", woCode, "=");
	var cotroller = View.controllers.get('abBldgopsReportHwrResourcesController');
	
	var wrDS = View.dataSources.get("abBldgopsReportHwrResourcesWrGridDS");
	var records = wrDS.getRecords(restriction);
	if (records.length != 0) {
	    cotroller.workRequestCode = records[0].getValue("hwr.wr_id");
	}
	else {
	    cotroller.workRequestCode = "";
	}
	cotroller.abBldgopsReportHwrResourcesWrGrid.refresh(restriction);
	//set title of work request panel 
	var title = getMessage("wrPanelTitle") + " " + woCode;
	setPanelTitle('abBldgopsReportHwrResourcesWrGrid', title);
	if (cotroller.workRequestCode != '') {
	    showPanelsByWorkRequest(cotroller.workRequestCode);
	}
    
}



function onSelectWorkRequest(){
    //1 get data when click any text in work request grid
	var grid = View.panels.get('abBldgopsReportHwrResourcesWrGrid');
	var selectedRow = grid.rows[grid.selectedRowIndex];
	var wrCode = selectedRow["hwr.wr_id"];
	//refresh the wr resource panels
	showPanelsByWorkRequest(wrCode);
}

function showPanelsByWorkRequest(workRequestCode){
	//set resource panels title
	var title = getMessage("wrTradePanelTitle") + " " + workRequestCode;
	setPanelTitle('abBldgopsReportHwrResourcesWrTrGrid', title);
	title = getMessage("wrPartPanelTitle") + " " + workRequestCode;
	setPanelTitle('abBldgopsReportHwrResourcesWrPtGrid', title);
	title = getMessage("wrToolTypePanelTitle") + " " + workRequestCode;
	setPanelTitle('abBldgopsReportHwrResourcesWrTtGrid', title);
	title = getMessage("wrToolPanelTitle") + " " + workRequestCode;
	setPanelTitle('abBldgopsReportHwrResourcesWrTlGrid', title);
	title = getMessage("wrLaborPanelTitle") + " " + workRequestCode;
	setPanelTitle('abBldgopsReportHwrResourcesWrCfGrid', title);

	var restriction = new Ab.view.Restriction();
    if ("" == workRequestCode) {
        restriction.addClause("hwr.wr_id", "-1", "=");
    }
    else {
        restriction.addClause("hwr.wr_id", workRequestCode, "=");
    }
	//refresh resource panels
	var cotroller = View.controllers.get('abBldgopsReportHwrResourcesController');
	cotroller.abBldgopsReportHwrResourcesWrTrGrid.refresh(restriction);
	cotroller.abBldgopsReportHwrResourcesWrPtGrid.refresh(restriction);
	cotroller.abBldgopsReportHwrResourcesWrTtGrid.refresh(restriction);
	cotroller.abBldgopsReportHwrResourcesWrTlGrid.refresh(restriction);
	cotroller.abBldgopsReportHwrResourcesWrCfGrid.refresh(restriction);
	if(cotroller.abBldgopsReportHwrResourcesWrTrGrid.hasNoRecords&&cotroller.abBldgopsReportHwrResourcesWrPtGrid.hasNoRecords
			&&cotroller.abBldgopsReportHwrResourcesWrTtGrid.hasNoRecords
			&&cotroller.abBldgopsReportHwrResourcesWrTlGrid.hasNoRecords
			&&cotroller.abBldgopsReportHwrResourcesWrCfGrid.hasNoRecords){
					cotroller.showWhenNoRecord.show(true);
				}else{
					cotroller.showWhenNoRecord.show(false);
					}
	restriction = '';
}

var PanelId = '', Type = '';
function openDialog(){
	if (Type == "woFrom") {
	    View.selectValue(PanelId, getMessage("woFrom"), ['hwo.workOrderFrom'], 'hwo', ['hwo.wo_id'], ['hwo.wo_id', 'hwo.description'], null, null, null, null, null, 800, 500, null, null, null);
	}
	else 
		if (Type == "woTo") {
		    View.selectValue(PanelId, getMessage("woTo"), ['wo.workOrderTo'], 'hwo', ['hwo.wo_id'], ['hwo.wo_id', 'hwo.description'], null, null, null, null, null, 800, 500, null, null, null);
		}
		else 
			if (Type == "bl") {
				if (View.panels.get("filterWorkOrderPanel").getFieldValue('hwr.site_id')) {
				    var sql = "site_id='" + View.panels.get("filterWorkOrderPanel").getFieldValue('hwr.site_id') + "'";
				    View.selectValue(PanelId, getMessage("BlCode"), ['hwr.site_id', 'hwr.bl_id'], 'bl', ['bl.site_id', 'bl.bl_id'], ['bl.site_id', 'bl.bl_id', 'bl.name'], sql, null, null, null, null, 800, 500, null, null, null);
				}
				else 
				    View.selectValue(PanelId, getMessage("BlCode"), ['hwr.site_id', 'hwr.bl_id'], 'bl', ['bl.site_id', 'bl.bl_id'], ['bl.site_id', 'bl.bl_id', 'bl.name'], null, null, null, null, null, 800, 500, null, null, null);
			}
}

function InitialPara(panelid, type){
    PanelId = panelid;
	Type = type;
    
}
