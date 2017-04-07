var cfPfmController = View.createController('cfPfmController', {
    restriction: "",
    afterInitialDataFetch: function(){
        var dateCompletedTo = getCurrentDate();
        this.cf_pfm_filter_console.setFieldValue("date_completed_to", dateCompletedTo);
        var restriction = new Ab.view.Restriction();
        restriction.addClause("hwr.date_completed", dateCompletedTo, "&lt;=");
        this.cf_pfm_cf_grid.refresh(restriction);
    },
    
    cf_pfm_cf_grid_afterRefresh: function(){
        if (this.cf_pfm_cf_grid.rows.length > 0) {
            this.showReport(this.cf_pfm_cf_grid.rows[0]['cf.cf_id']);
        }
        else {
            var title = getMessage('reportTitle');
            setPanelTitle('cf_pfm_report', title);
            this.cf_pfm_report.clear();
        }
    },
    
    cf_pfm_cf_grid_onSelectCfId: function(row, action){
        this.showWorkRequestsOfCraftperson(row, action);
    },
    
    cf_pfm_cf_grid_onSelectCfName: function(row, action){
        this.showWorkRequestsOfCraftperson(row, action);
    },
    
    cf_pfm_report_afterRefresh: function(){
        if (!this.restriction) {
            return;
        }
        
        var totalRecord = View.dataSources.get('ds_ab-pm-rpt-cf-pfm_hwrcf_hwr_group').getRecord(this.restriction);
        
        var totalRow = new Object();
        totalRow['hwrcf.wr_id'] = getMessage('total');
        totalRow['hwrcf.hours_total'] = totalRecord.localizedValues['hwrcf.total_hours_total'];
        totalRow['hwrcf.hours_est'] = totalRecord.localizedValues['hwrcf.total_hours_est'];
        totalRow['hwrcf.hours_diff'] = totalRecord.localizedValues['hwrcf.total_hours_diff'];
        
        var averageRow = new Object();
        averageRow['hwrcf.wr_id'] = getMessage('average');
        averageRow['hwrcf.hours_diff'] = totalRecord.localizedValues['hwrcf.avg_hours_diff'];
        
        this.cf_pfm_report.addRow(totalRow);
        this.cf_pfm_report.addRow(averageRow);
        
        this.cf_pfm_report.build();
        var rows = this.cf_pfm_report.rows;
        Ext.get(rows[rows.length - 1].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 1].row.dom).setStyle('font-weight', 'bold');
        Ext.get(rows[rows.length - 2].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 2].row.dom).setStyle('font-weight', 'bold');
    },
    
    //----------------Logic function start--------------------
    
    showWorkRequestsOfCraftperson: function(row, action){
        var record = row.getRecord();
        var cfId = record.getValue('cf.cf_id');
        this.showReport(cfId);
    },
    
    showReport: function(cfId){
        var dateCompletedFrom = this.cf_pfm_filter_console.getFieldValue('date_completed_from');
        var dateCompletedTo = this.cf_pfm_filter_console.getFieldValue('date_completed_to');
        
        if (dateCompletedFrom && dateCompletedTo) {
            if (compareLocalizedDates(this.cf_pfm_filter_console.getFieldElement('date_completed_to').value, this.cf_pfm_filter_console.getFieldElement('date_completed_from').value)) {
                View.showMessage(getMessage('errorDateRange'));
                return;
            }
        }
        
        this.restriction = new Ab.view.Restriction();
        this.restriction.addClause("hwrcf.cf_id", cfId, "=");
        if (dateCompletedFrom) {
            this.restriction.addClause("hwr.date_completed", dateCompletedFrom, "&gt;=");
        }
        if (dateCompletedTo) {
            this.restriction.addClause("hwr.date_completed", dateCompletedTo, "&lt;=");
        }
        
        var title = getMessage('reportTitle') + " " + cfId;
        setPanelTitle('cf_pfm_report', title);
        
        this.cf_pfm_report.refresh(this.restriction);
    }
});

function setReportPanelTitle(){
    var title = getMessage('reportTitle');
    setPanelTitle('cf_pfm_report', title);
}
