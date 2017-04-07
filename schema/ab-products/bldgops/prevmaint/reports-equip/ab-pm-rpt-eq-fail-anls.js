/**
 * @author keven.xi
 */
var eqFailAnlsController = View.createController('eqFailAnls', {

    afterInitialDataFetch: function(){
        var curDate = getCurrentDate();
        this.rpt_eq_fail_wrConsole.setFieldValue("hwr.date_completed.to", curDate);
        this.rpt_eq_fail_wrConsole_onFilter();
    },
    
    
    rpt_eq_fail_wrConsole_onFilter: function(){
    	
    	var hwrCount = View.dataSources.get('ds_ab-pm-rpt-eq-fail-anls_hwr_count').getRecord().getValue('hwr.count_hwr');
    	if(hwrCount == 0){
    		View.showMessage(getMessage('noHwrRecords'));
    		return;
    	}
    
        var dateCompletedFrom = this.rpt_eq_fail_wrConsole.getFieldValue('hwr.date_completed.from');
        var dateCompletedTo = this.rpt_eq_fail_wrConsole.getFieldValue('hwr.date_completed.to');
        
        if (dateCompletedFrom && dateCompletedTo) {
            if (compareLocalizedDates(this.rpt_eq_fail_wrConsole.getFieldElement('hwr.date_completed.to').value, this.rpt_eq_fail_wrConsole.getFieldElement('hwr.date_completed.from').value)) {
                View.showMessage(getMessage('errorDateRange'));
                return;
            }
        }
        if ("" == dateCompletedTo) {
            dateCompletedTo = getCurrentDate();
        }
        try {
			//Calcute Eq Failure Analysis ,file='PreventiveMaintenanceCommonHandler.java'
            var result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-calcuteEqFailureAnalysis', dateCompletedFrom,dateCompletedTo
            );
            if (result.code == 'executed') {
				//Guo changed 2009-09-10 to fix KB3024278 [SJM moved here in fixing duplicate KB 3024358 to keep afterInitialDataFetch clean]
				// turn visibility of grid ON after showOnLoad='false'. Alternative is to use refresh() but w/ special WFR you must use show()
				this.rpt_eq_fail_eqGrid.show(true);

                this.rpt_eq_fail_eqGrid.clearGridRows();
                this.rpt_eq_fail_eqGrid.setRecords(result.dataSet.records, result.dataSet.hasMoreRecords);
                if (this.rpt_eq_fail_eqGrid.rows.length > 0) {
                    showReport(this.rpt_eq_fail_eqGrid.rows[0]['hwr.vf_distinct_eqId']);
                    this.rpt_eq_fail_eqGrid.removeSorting();
                }
                else {
                    this.rpt_eq_fail_hwrGrid.clear();
                    this.rpt_eq_fail_hwrGrid.setTitle(getMessage("managePanelTitle"));
                    this.eq_fail_anls_eq_info.clear();
                }
            }
            else 
                View.showMessage(result.message);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    },
    
    rpt_eq_fail_hwrGrid_afterRefresh: function(){
        var restriction = this.rpt_eq_fail_hwrGrid.restriction;
        this.addStatisticRows(restriction);
    },
    
    addStatisticRows: function(restriction){
        var statisticRecords = View.dataSources.get('ds_ab-pm-rpt-eq-fail-anls_hwr_group').getRecords(restriction);
        var oldRows = this.rpt_eq_fail_hwrGrid.rows;
        if (oldRows.length == 0) {
            return;
        }
        
        var newRows = [];
        var preCauseType = oldRows[0]['hwr.cause_type'];
        for (var i = 0; i < oldRows.length; i++) {
            if (oldRows[i]['hwr.cause_type'] == preCauseType) {
                newRows.push(oldRows[i]);
            }
            else {
                newRows = this.addStatisticRow(newRows, preCauseType, statisticRecords);
                newRows.push(oldRows[i]);
                preCauseType = oldRows[i]['hwr.cause_type'];
            }
            if (i == oldRows.length - 1) {
                newRows = this.addStatisticRow(newRows, preCauseType, statisticRecords);
            }
        }
        this.rpt_eq_fail_hwrGrid.rows = newRows;
        this.rpt_eq_fail_hwrGrid.build();
        this.setStatisticRowStyle();
    },
    
    addStatisticRow: function(newRows, preCauseType, statisticRecords){
        var row = new Object();
        row['isStatisticRow'] = true;
        row['hwr.prob_type'] = getMessage('countFieldTitle') + preCauseType;
        for (var i = 0; i < statisticRecords.length; i++) {
            var record = statisticRecords[i];
            if (record.getValue('hwr.cause_type') == preCauseType) {
                row['hwr.wr_id'] = record.getValue('hwr.count_hwr');
                newRows.push(row);
                break;
            }
        }
        return newRows;
    },
    
    setStatisticRowStyle: function(){
        var rows = this.rpt_eq_fail_hwrGrid.rows;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i]['isStatisticRow']) {
                Ext.get(rows[i].row.dom).setStyle('color', '#4040f0');
                Ext.get(rows[i].row.dom).setStyle('font-weight', 'bold');
            }
        }
    }
    
});


function showAnalysisResultOfEq(row, action){
    var eqId = row["hwr.vf_distinct_eqId"];
    showReport(eqId);
}

function showReport(eqId){
    //set title of manager panel 
    var title = getMessage("managePanelTitle") + " " + eqId;
    setPanelTitle('rpt_eq_fail_hwrGrid', title);
    var console = View.panels.get('rpt_eq_fail_wrConsole');
    var dateCompletedFrom = console.getFieldValue('hwr.date_completed.from');
    var dateCompletedTo = console.getFieldValue('hwr.date_completed.to');
    
    if (dateCompletedFrom && dateCompletedTo) {
        if (compareLocalizedDates(console.getFieldElement('hwr.date_completed.to').value, console.getFieldElement('hwr.date_completed.from').value)) {
            View.showMessage(getMessage('errorDateRange'));
            return;
        }
    }
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("hwr.eq_id", eqId, "=");
    restriction.addClause("hwr.pms_id", "", "IS NULL");
    if (dateCompletedFrom) {
        restriction.addClause("hwr.date_completed", dateCompletedFrom, "&gt;=");
    }
    if (dateCompletedTo) {
        restriction.addClause("hwr.date_completed", dateCompletedTo, "&lt;=");
    }
    
    View.panels.get('rpt_eq_fail_hwrGrid').refresh(restriction);
    
    var eqInfoRes = new Ab.view.Restriction();
    eqInfoRes.addClause("eq.eq_id", eqId, "=");
    View.panels.get('eq_fail_anls_eq_info').refresh(eqInfoRes);
}

