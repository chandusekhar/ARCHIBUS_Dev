var Controller = View.createController('frcstTrWk', {
    by_tr_week_afterRefresh: function(){
		
        this.addStatInfoForTradeWeekReport();
		
		this.addStatInfoForTradeWeekCostReport();
    },
		
    addStatInfoForTradeWeekReport: function(restriction){
        var totalRecord = View.dataSources.get('ds_ab-pm-rpt-sched-week-frcst-tr-wk_pmforecast_tr_total').getRecord(restriction);
        var totalRow = new Object();
        totalRow['pmforecast_tr.tr_id'] = getMessage("total");
        for (var i = 1; i <= 52; i++) {
            var weekNum = "" + i;
            if (i < 10) {
                weekNum = "0" + i;
            }
            var fieldName = "pmforecast_tr.week_" + weekNum;
            var statFieldName = "pmforecast_tr.sum_week_" + weekNum;
            totalRow[fieldName] = totalRecord.localizedValues[statFieldName];
        }
        
        var tradeWeekReport = View.panels.get('by_tr_week');
        tradeWeekReport.addRow(totalRow);
        tradeWeekReport.build();
        var rows = tradeWeekReport.rows;
      
    },
	addStatInfoForTradeWeekCostReport:function(restriction){
		 var totalRecord = View.dataSources.get('ds_ab-pm-rpt-sched-week-frcst-tr-wk_pmforecast_tr_totalcost').getRecord(restriction);
		 
		 var totalRow = new Object();
        totalRow['pmforecast_tr.tr_id'] = getMessage("totalCost");
        for (var i = 1; i <= 52; i++) {
            var weekNum = "" + i;
            if (i < 10) {
                weekNum = "0" + i;
            }
            var fieldName = "pmforecast_tr.week_" + weekNum;
            var statFieldName = "pmforecast_tr.sum_week_cost_" + weekNum;
            totalRow[fieldName] = totalRecord.localizedValues[statFieldName];
        }
        
        var tradeWeekReport = View.panels.get('by_tr_week');
        tradeWeekReport.addRow(totalRow);
        tradeWeekReport.build();
        var rows = tradeWeekReport.rows;
		  Ext.get(rows[rows.length - 2].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 2].row.dom).setStyle('font-weight', 'bold');
        Ext.get(rows[rows.length - 1].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 1].row.dom).setStyle('font-weight', 'bold');
	}
	
});

function showChart(){
    var grid = View.getControl('', 'by_tr_week');
    var tr = grid.rows[grid.selectedRowIndex]['pmforecast_tr.tr_id'];
    if (tr == getMessage("total")) {
        View.getView('parent').openDialog('ab-pm-rpt-sched-week-frcst-tr-wk-cht-tot.axvw');
    }
    else {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("pmforecast_tr.tr_id", tr, "=");
        View.getView('parent').openDialog('ab-pm-rpt-sched-week-frcst-tr-wk-cht.axvw', restriction);
    }
}


function showPmSchedule(week){

    var console = View.getOpenerView().panels.get('consolePanel');
	var dateFrom = console.getFieldValue('pmressum.date_todo.from');
    var dateTo = console.getFieldValue('pmressum.date_todo.to');
    
    var tradeID = console.getFieldValue('pmp.tr_id');
    var pmGroup = console.getFieldValue('pms.pm_group');
    var buildingID = console.getFieldValue('pms.bl_id');
    var floorID = console.getFieldValue('pms.fl_id');
    var siteID = console.getFieldValue('pms.site_id');
  //  var dateFrom = console.getRecord().getValue('pmressum.date_todo.from');
    var grid = View.getControl('', 'by_tr_week');
    var tr = grid.rows[grid.selectedRowIndex]['pmforecast_tr.tr_id'];
    
     if (tr != "Total Hours:" && tr != "Total Costs:") {
        var PMSrecords = new Object();
		PMSrecords['pmp.tr_id'] = tradeID;
        PMSrecords['pmpstr.tr_id'] = tr;
        PMSrecords['pmsd.date_todo'] = week - 1;
        PMSrecords['weekormonth'] = 'week';
        PMSrecords['pms.pm_group'] = pmGroup;
        PMSrecords['pms.bl_id'] = buildingID;
        PMSrecords['pms.fl_id'] = floorID;
        PMSrecords['pms.site_id'] = siteID;
        
        PMSrecords['pmressum.date_todo.from'] = dateFrom;
        PMSrecords['pmressum.date_todo.to'] = dateTo;
        
		//Guo changed 2009-08-28 to fix KB3024195
        View.getOpenerView().PMSrecords = PMSrecords;
        //Fix KB#3053590
        //Check if console enable, if true, reference new define schedule file to enable multiple storage location.
		var isConsoleEnabled=View.activityParameters['AbBldgOpsOnDemandWork-UseBldgOpsConsole'];
		if(isConsoleEnabled=='1'){
			View.getOpenerView().openDialog('ab-pm-def-sched-mpsl.axvw');
		}else{
			View.getOpenerView().openDialog('ab-pm-def-sched.axvw');
		}
        
    }
    
}
function Recalculate(){
	var openerController = View.getOpenerView().controllers.get("ab-report-bygroup");
	openerController.consolePanel_onGenerateScheduleDates();
}

