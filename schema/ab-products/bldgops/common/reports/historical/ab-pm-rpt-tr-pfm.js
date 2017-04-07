var tradpfrmController = View.createController('tradpfrmController', {
    restriction: "",
    afterInitialDataFetch: function(){
        var dateCompletedTo = getCurrentDate();
        this.tr_pfm_filter_console.setFieldValue("date_completed_to", dateCompletedTo);
        var restriction = new Ab.view.Restriction();
        restriction.addClause("hwr.date_completed", dateCompletedTo, "&lt;=");
        this.tr_pfm_tr_grid.refresh(restriction);
    },
    
    tr_pfm_tr_grid_onTradId: function(row, action){
        this.showWorkRequestsOfTrade(row, action);
    },
    
    tr_pfm_tr_grid_onTradDesc: function(row, action){
        this.showWorkRequestsOfTrade(row, action);
    },
    
    tr_pfm_tr_grid_afterRefresh: function(){
        if (this.tr_pfm_tr_grid.rows.length > 0) {
            this.showReport(this.tr_pfm_tr_grid.rows[0]['tr.tr_id']);
        }
        else {
            var title = getMessage('reportTitle');
            setPanelTitle('tr_pfm_report', title);
            this.tr_pfm_report.clear();
        }
    },
    
    tr_pfm_report_afterRefresh: function(){
        if (!this.restriction) {
            return;
        }
        
        var totalRecord = View.dataSources.get('ds_ab-pm-rpt-tr-pfm_hwrtr_hwr_group').getRecord(this.restriction);
        
        var totalRow = new Object();
        totalRow['hwrtr.wr_id'] = getMessage('total');
        totalRow['hwrtr.hours_total'] = totalRecord.localizedValues['hwrtr.total_hours_total'];
        totalRow['hwrtr.hours_est'] = totalRecord.localizedValues['hwrtr.total_hours_est'];
        totalRow['hwrtr.hours_diff'] = totalRecord.localizedValues['hwrtr.total_hours_diff'];
        
        var averageRow = new Object();
        averageRow['hwrtr.wr_id'] = getMessage('average');
        averageRow['hwrtr.hours_diff'] = totalRecord.localizedValues['hwrtr.avg_hours_diff'];
        
        this.tr_pfm_report.addRow(totalRow);
        this.tr_pfm_report.addRow(averageRow);
        
        this.tr_pfm_report.build();
        var rows = this.tr_pfm_report.rows;
        Ext.get(rows[rows.length - 1].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 1].row.dom).setStyle('font-weight', 'bold');
        Ext.get(rows[rows.length - 2].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 2].row.dom).setStyle('font-weight', 'bold');
    },
    
    //----------------Logic function start--------------------
    
    showWorkRequestsOfTrade: function(row, action){
        var record = row.getRecord();
        var trId = record.getValue('tr.tr_id');
        this.showReport(trId);
    },
    
    showReport: function(trId){
        var dateCompletedFrom = this.tr_pfm_filter_console.getFieldValue('date_completed_from');
        var dateCompletedTo = this.tr_pfm_filter_console.getFieldValue('date_completed_to');
        
        if (dateCompletedFrom && dateCompletedTo) {
            if (compareLocalizedDates(this.tr_pfm_filter_console.getFieldElement('date_completed_to').value, this.tr_pfm_filter_console.getFieldElement('date_completed_to').value)) {
                View.showMessage(getMessage('errorDateRange'));
                return;
            }
        }
        
        this.restriction = new Ab.view.Restriction();
        this.restriction.addClause("hwrtr.tr_id", trId, "=");
        if (dateCompletedFrom) {
            this.restriction.addClause("hwr.date_completed", dateCompletedFrom, "&gt;=");
        }
        if (dateCompletedTo) {
            this.restriction.addClause("hwr.date_completed", dateCompletedTo, "&lt;=");
        }
        var title = getMessage('reportTitle') + " " + trId;
        setPanelTitle('tr_pfm_report', title);
        
        this.tr_pfm_report.refresh(this.restriction);
    }
});

function setReportPanelTitle(){
    var title = getMessage('reportTitle');
    setPanelTitle('tr_pfm_report', title);
}
