var tradAvailController = View.createController('tradAvailController', {
    restriction: "",
    afterInitialDataFetch: function(){
        var dateAssigedFrom = getCurrentDate();
        var dateAssigedTo = getDateAfterHalfMonth();
        this.tr_avail_filter_console.setFieldValue("resavail.date_assigned.from", dateAssigedFrom);
        this.tr_avail_filter_console.setFieldValue("resavail.date_assigned.to", dateAssigedTo);
        this.createAvailResAndShowGrid(dateAssigedFrom, dateAssigedTo);
    },
    
    tr_avail_filter_console_onShowDates: function(){
        var dateAssigedFrom = this.tr_avail_filter_console.getFieldValue("resavail.date_assigned.from");
        var dateAssigedTo = this.tr_avail_filter_console.getFieldValue("resavail.date_assigned.to");
        if (dateAssigedFrom && dateAssigedTo) {
            if (compareLocalizedDates(this.tr_avail_filter_console.getFieldElement('resavail.date_assigned.to').value, this.tr_avail_filter_console.getFieldElement('resavail.date_assigned.from').value)) {
                View.showMessage(getMessage('errorDateRange'));
                return;
            }
            if (dateRangeInterval(dateAssigedFrom, getCurrentDate()) > 0) {
                View.showMessage(getMessage('errorDatefrom') + " " + getCurrentDate());
                return;
            }
            if (dateRangeInterval(dateAssigedFrom, dateAssigedTo) > 32) {
                View.showMessage(getMessage('errorDateRangeInterval'));
                return;
            }
            
            this.createAvailResAndShowGrid(dateAssigedFrom, dateAssigedTo);
        }
        else {
            View.showMessage(getMessage('errorDateRange'));
        }
    },
    
    tr_avail_dates_grid_onDate: function(row, action){
        this.showTradeAvailabilityReport(row, action);
    },
    
    tr_avail_report_afterRefresh: function(){
        if (!this.restriction) {
            return;
        }
        
        var totalRecord = View.dataSources.get('ds_ab-pm-rpt-tr-avail_resavail_group').getRecord(this.restriction);
        
        var totalRow = new Object();
        totalRow['resavail.tr_id'] = getMessage('total');
        totalRow['resavail.hours_avail_total'] = totalRecord.localizedValues['resavail.total_hours_avail_total'];
        totalRow['resavail.hours_commited_total'] = totalRecord.localizedValues['resavail.total_hours_commited_total'];
        totalRow['resavail.od_hours_commited'] = totalRecord.localizedValues['resavail.total_od_hours_commited'];
        totalRow['resavail.pm_hours_commited'] = totalRecord.localizedValues['resavail.total_pm_hours_commited'];
        totalRow['resavail.hours_remaining'] = totalRecord.localizedValues['resavail.total_hours_remaining'];
        
        this.tr_avail_report.addRow(totalRow);
        
        this.tr_avail_report.build();
        var rows = this.tr_avail_report.rows;
        Ext.get(rows[rows.length - 1].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 1].row.dom).setStyle('font-weight', 'bold');
    },
    
    tr_avail_dates_grid_afterRefresh: function(){
        if (this.tr_avail_dates_grid.rows.length > 0) {
            this.showReport(this.tr_avail_dates_grid.rows[0]['resavail.date_assigned']);
        }
        else {
            var title = getMessage('resavailReportTitle');
            setPanelTitle('tr_avail_report', title);
            this.tr_avail_report.clear();
        }
    },
    //----------------Logic function start--------------------
    
    showTradeAvailabilityReport: function(row, action){
        var dateAssigned = row.record['resavail.date_assigned'];
        this.showReport(dateAssigned);
    },
    
    showReport: function(dateAssigned){
        dateAssigned = getDateWithISOFormat(dateAssigned);
        var title = getMessage('resavailReportTitle') + " " + dateAssigned;
        setPanelTitle('tr_avail_report', title);
        this.restriction = new Ab.view.Restriction();
        this.restriction.addClause("resavail.date_assigned", dateAssigned, "=");
        this.tr_avail_report.refresh(this.restriction);
    },
    
    createAvailResAndShowGrid: function(dateAssigedFrom, dateAssigedTo){
		//This method serve as a workflow rule to calculate and create records represent availability within given date
        //range for the specified resource types include trade, craftperson, tool type and parts,file='PreventiveMaintenanceCommonHandler.java'
        try {
            Workflow.callMethod("AbBldgOpsPM-PmEventHandler-createResAvailRecords", 'tr',dateAssigedFrom,dateAssigedTo);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("resavail.date_assigned", dateAssigedFrom, "&gt;=");
        restriction.addClause("resavail.date_assigned", dateAssigedTo, "&lt;=");
        this.tr_avail_dates_grid.refresh(restriction);
    }
});

function setReportPanelTitle(){
    var title = getMessage('resavailReportTitle');
    setPanelTitle('tr_avail_report', title);
}
