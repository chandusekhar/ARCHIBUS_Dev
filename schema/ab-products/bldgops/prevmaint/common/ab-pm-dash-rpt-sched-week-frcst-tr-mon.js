var dashFrcstTrMonController = View.createController('dashFrcstTrMon', {

    dateFrom: null,
    dateTo : null,

    afterInitialDataFetch: function(){
        this.dateFrom = getCurrentDate();
        this.dateTo = getDateAfterOneYear();
        this.callWFR();
    },

    //call WFR
    callWFR: function(){
        this.jobId = generateScheduleDate(this.dateFrom, this.dateTo, " 1=1 ");
        
        View.openDialog('ab-pm-date-progressbar.axvw', null, false, {
            width: 500,
            height: 150,
            closeButton: false
        });
    },
    
    afterScheduleJob: function(){
        var forecastRestriction = getSchedDatesRestriction();
        
        var resourceType = 'TradeMonthly';
        try {
			//This method serve as a WFR to do one of forecasts for: Procedure Weekly, Equipment Weekly, Trade Weekly or Trade Monthly. 
            //Only for PM Schedules restricted by date range and other condition comes from JS client , file='PreventiveMaintenanceCommonHandler.java'
            var result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-forecastPM52Week', this.dateFrom,this.dateTo,resourceType,forecastRestriction);
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

	by_tr_month_afterRefresh: function(){
         this.addStatInfoForTradeMonthReport();
		 this.addStatInfoForTradeMonthCostReport();
    },

    addStatInfoForTradeMonthReport: function(restriction){
        var totalRecord = View.dataSources.get('ds_ab-pm-rpt-sched-week-frcst-tr-wk_pmforecast_trm_total').getRecord(restriction);
        
        var totalRow = new Object();
        totalRow['pmforecast_trm.tr_id'] = getMessage("total");
        for (var i = 1; i <= 12; i++) {
            var monthNum = "" + i;
            if (i < 10) {
                monthNum = "0" + i;
            }
            var fieldName = "pmforecast_trm.month_" + monthNum;
            var statFieldName = "pmforecast_trm.sum_month_" + monthNum;
            totalRow[fieldName] = totalRecord.localizedValues[statFieldName];
        }
        
        var tradeMonthReport = View.panels.get('by_tr_month');
        tradeMonthReport.addRow(totalRow);
        tradeMonthReport.build();
        var rows = tradeMonthReport.rows;
        Ext.get(rows[rows.length - 1].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 1].row.dom).setStyle('font-weight', 'bold');
    },
	
	addStatInfoForTradeMonthCostReport:function(restriction){
		var totalRecord = View.dataSources.get('ds_ab-pm-rpt-sched-week-frcst-tr-wk_pmforecast_trm_totalcost').getRecord(restriction);
		 
		var totalRow = new Object();
        totalRow['pmforecast_trm.tr_id'] = getMessage("totalCost");
        for (var i = 1; i <= 12; i++) {
            var monthNum = "" + i;
            if (i < 10) {
                monthNum = "0" + i;
            }
            var fieldName = "pmforecast_trm.month_" + monthNum;
            var statFieldName = "pmforecast_trm.sum_month_cost_" + monthNum;
            totalRow[fieldName] = totalRecord.localizedValues[statFieldName];
        }
        
        var tradeMonthReport = View.panels.get('by_tr_month');
        tradeMonthReport.addRow(totalRow);
        tradeMonthReport.build();
        var rows = tradeMonthReport.rows;
		  Ext.get(rows[rows.length - 2].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 2].row.dom).setStyle('font-weight', 'bold');
        Ext.get(rows[rows.length - 1].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 1].row.dom).setStyle('font-weight', 'bold');
	}
});

function showChart(){
    var grid = View.getControl('', 'by_tr_month');
    var tr = grid.rows[grid.selectedRowIndex]['pmforecast_trm.tr_id'];
    if (tr == getMessage("total")) {
        View.getView('parent').openDialog('ab-pm-rpt-sched-week-frcst-tr-mon-cht-tot.axvw');
    }
    else {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("pmforecast_trm.tr_id", tr, "=");
        View.getView('parent').openDialog('ab-pm-rpt-sched-week-frcst-tr-mon-cht.axvw', restriction);
    }
}

function showPmSchedule(month){

    var grid = View.getControl('', 'by_tr_month');
    // var pmmonth='pmforecast_trm.'+month;
    var tr = grid.rows[grid.selectedRowIndex]['pmforecast_trm.tr_id'];
    // var pmmonthvalue = grid.rows[grid.selectedRowIndex][pmmonth];
    if (tr != 'Total Hours:' && tr != 'Total Costs:') {
    
        var PMSrecords = new Object();
        PMSrecords['pmpstr.tr_id'] = tr;
        PMSrecords['pmsd.date_todo'] = month-1;
        PMSrecords['weekormonth'] = 'month';
        PMSrecords['pms.pm_group'] = null;
        PMSrecords['pms.bl_id'] = null;
        PMSrecords['pms.fl_id'] = null;
        PMSrecords['pms.site_id'] = null;
        //ZY: fixed code error on 2014-05-28.
        PMSrecords['pmressum.date_todo.from'] = dashFrcstTrMonController.dateFrom;
        PMSrecords['pmressum.date_todo.to'] = dashFrcstTrMonController.dateTo;
        
		//Guo changed 2009-08-28 to fix KB3024195
        View.getOpenerView().PMSrecords = PMSrecords;
        View.getOpenerView().openDialog('ab-pm-def-sched.axvw');
    }
}