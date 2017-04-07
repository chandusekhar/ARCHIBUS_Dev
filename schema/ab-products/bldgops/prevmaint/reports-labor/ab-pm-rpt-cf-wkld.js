var cfWorkLoadController = View.createController('cfWorkLoadController', {

    afterInitialDataFetch: function(){
        var dateAssigedFrom = getCurrentDate();
        var dateAssigedTo = getDateAfterHalfMonth();
        this.cf_wkld_filter_console.setFieldValue("date_assigned_from", dateAssigedFrom);
        this.cf_wkld_filter_console.setFieldValue("date_assigned_to", dateAssigedTo);
        var restriction = new Ab.view.Restriction();
        restriction.addClause("wrcf.date_assigned", dateAssigedFrom, "&gt;=");
        restriction.addClause("wrcf.date_assigned", dateAssigedTo, "&lt;=");
        this.cf_wkld_cf_grid.refresh(restriction);
    },
    
    cf_wkld_cf_grid_afterRefresh: function(){
        if (this.cf_wkld_cf_grid.rows.length > 0) {
            this.showReport(this.cf_wkld_cf_grid.rows[0]['wrcf.cf_id']);
        }
        else {
            var title = getMessage('reportTitle');
            setPanelTitle('cf_wkld_wrcf_report', title);
            this.cf_wkld_wrcf_report.clear();
        }
    },
    
    cf_wkld_cf_grid_onSelectCfID: function(row, action){
        this.showWorkRequestsOfCraftperson(row, action);
    },
    
    cf_wkld_cf_grid_onSelectCfName: function(row, action){
        this.showWorkRequestsOfCraftperson(row, action);
    },
    
    cf_wkld_cf_grid_onSelectCfPosition: function(row, action){
        this.showWorkRequestsOfCraftperson(row, action);
    },
    
    cf_wkld_cf_grid_onSelectCfTradId: function(row, action){
        this.showWorkRequestsOfCraftperson(row, action);
    },
    
    cf_wkld_cf_grid_onSelectCfStatus: function(row, action){
        this.showWorkRequestsOfCraftperson(row, action);
    },
    
    
    //----------------Logic function start--------------------
    
    showWorkRequestsOfCraftperson: function(row, action){
        var record = row.getRecord();
        var cfId = record.getValue('wrcf.cf_id');
        this.showReport(cfId);
    },
    
    showReport: function(cfId){
        var dateAssigedFrom = this.cf_wkld_filter_console.getFieldValue('date_assigned_from');
        var dateAssigedTo = this.cf_wkld_filter_console.getFieldValue('date_assigned_to');
        
        if (dateAssigedFrom && dateAssigedTo) {
            if (compareLocalizedDates(this.cf_wkld_filter_console.getFieldElement('date_assigned_to').value, this.cf_wkld_filter_console.getFieldElement('date_assigned_from').value)) {
                View.showMessage(getMessage('errorDateRange'));
                return;
            }
        }
        var restriction = new Ab.view.Restriction();
        restriction.addClause("wrcf.cf_id", cfId, "=");
        if (dateAssigedFrom) {
            restriction.addClause("wrcf.date_assigned", dateAssigedFrom, "&gt;=");
        }
        if (dateAssigedTo) {
            restriction.addClause("wrcf.date_assigned", dateAssigedTo, "&lt;=");
        }
        var title = getMessage('reportTitle') + " " + cfId;
        setPanelTitle('cf_wkld_wrcf_report', title);
        this.cf_wkld_wrcf_report.refresh(restriction);
        
        var totalRecords = View.dataSources.get('ds_ab-pm-rpt-cf-wkld_wrcf_wr_group').getRecords(restriction);
        var oldRows = this.cf_wkld_wrcf_report.rows;
        if (oldRows.length == 0) {
            return;
        }
        var newRows = [];
        var preDate = oldRows[0]['wrcf.date_assigned'];
        for (var i = 0; i < oldRows.length; i++) {
            if (oldRows[i]['wrcf.date_assigned'] == preDate) {
                newRows.push(oldRows[i]);
            }
            else {
                newRows = this.addStatisticDateRow(newRows, preDate, totalRecords);
                newRows.push(oldRows[i]);
                preDate = oldRows[i]['wrcf.date_assigned'];
            }
            if (i == oldRows.length - 1) {
                newRows = this.addStatisticDateRow(newRows, preDate, totalRecords);
            }
        }
        
        this.cf_wkld_wrcf_report.rows = newRows;
        this.cf_wkld_wrcf_report.build();
        this.cf_wkld_wrcf_report.removeSorting();
        this.setStatisticRowStyle();
    },
    addStatisticDateRow: function(newRows, preDate, totalRecords){
        var totalRow = new Object();
        totalRow['isStatisticRow'] = true;
        totalRow['wrcf.wr_id'] = getMessage('totalByDate');
        totalRow['wrcf.date_assigned'] = preDate;
        for (var i = 0; i < totalRecords.length; i++) {
            var record = View.dataSources.get('ds_ab-pm-rpt-cf-wkld_wrcf_wr_group').processOutboundRecord(totalRecords[i]);
            if (record.getValue('wrcf.date_assigned') == getDateWithISOFormat(preDate)) {
                totalRow['wr.est_labor_hours'] = record.getValue('wrcf.total_est_labor_hours');
                newRows.push(totalRow);
            }
        }
        
        return newRows;
    },
    
    setStatisticRowStyle: function(){
        var rows = this.cf_wkld_wrcf_report.rows;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i]['isStatisticRow']) {
                Ext.get(rows[i].row.dom).setStyle('color', '#4040f0');
                Ext.get(rows[i].row.dom).setStyle('font-weight', 'bold');
            }
        }
    }
});

function setReportPanelTitle(){
    var title = getMessage('reportTitle');
    setPanelTitle('cf_wkld_wrcf_report', title);
}
