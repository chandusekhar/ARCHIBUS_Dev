var tradWorkLoadController = View.createController('tradWorkLoadController', {

    afterInitialDataFetch: function(){
        var dateAssigedFrom = getCurrentDate();
        var dateAssigedTo = getDateAfterHalfMonth();
        this.tr_wkld_filter_console.setFieldValue("date_assigned_from", dateAssigedFrom);
        this.tr_wkld_filter_console.setFieldValue("date_assigned_to", dateAssigedTo);
        var restriction = new Ab.view.Restriction();
        restriction.addClause("wrtr.date_assigned", dateAssigedFrom, "&gt;=");
        restriction.addClause("wrtr.date_assigned", dateAssigedTo, "&lt;=");
        this.tr_wkld_tr_grid.refresh(restriction);
    },
    
    tr_wkld_tr_grid_onTradId: function(row, action){
        this.showWorkRequestsOfTrade(row, action);
    },
    
    tr_wkld_tr_grid_onTradDesc: function(row, action){
        this.showWorkRequestsOfTrade(row, action);
    },
    tr_wkld_tr_grid_afterRefresh: function(){
        if (this.tr_wkld_tr_grid.rows.length > 0) {
            this.showReport(this.tr_wkld_tr_grid.rows[0]['tr.tr_id']);
        }
        else {
            var title = getMessage('wrtrReportTitle');
            setPanelTitle('tr_wkld_wrtr_report', title);
            this.tr_wkld_wrtr_report.clear();
        }
    },
    //----------------Logic function start--------------------
    
    showWorkRequestsOfTrade: function(row, action){
        var record = row.getRecord();
        var trId = record.getValue('tr.tr_id');
        this.showReport(trId);
        
    },
    showReport: function(trId){
        var dateAssigedFrom = this.tr_wkld_filter_console.getFieldValue('date_assigned_from');
        var dateAssigedTo = this.tr_wkld_filter_console.getFieldValue('date_assigned_to');
        
        if (dateAssigedFrom && dateAssigedTo) {
            if (compareLocalizedDates(this.tr_wkld_filter_console.getFieldElement('date_assigned_to').value, this.tr_wkld_filter_console.getFieldElement('date_assigned_from').value)) {
                View.showMessage(getMessage('errorDateRange'));
                return;
            }
        }
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("wrtr.tr_id", trId, "=");
        if (dateAssigedFrom) {
            restriction.addClause("wrtr.date_assigned", dateAssigedFrom, "&gt;=");
        }
        if (dateAssigedTo) {
            restriction.addClause("wrtr.date_assigned", dateAssigedTo, "&lt;=");
        }
        var title = getMessage('wrtrReportTitle') + " " + trId;
        setPanelTitle('tr_wkld_wrtr_report', title);
        this.tr_wkld_wrtr_report.refresh(restriction);
    }
});

function setReportPanelTitle(){
    var title = getMessage('wrtrReportTitle');
    setPanelTitle('tr_wkld_wrtr_report', title);
}
