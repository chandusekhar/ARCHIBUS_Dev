var cfAvailController = View.createController('cfAvailController', {
    dateStart: '',
    dateEnd: '',
    selectedDate: '',
    restriction: "",
    afterInitialDataFetch: function(){
        var dateAssigedFrom = getCurrentDate();
        var dateAssigedTo = getDateAfterHalfMonth();
        this.cf_avail_filter_console.setFieldValue("resavail.date_assigned.from", dateAssigedFrom);
        this.cf_avail_filter_console.setFieldValue("resavail.date_assigned.to", dateAssigedTo);
        this.createAvailResAndShowGrid(dateAssigedFrom, dateAssigedTo);
    },
    cf_avail_filter_console_onShowDates: function(){
        var dateAssigedFrom = this.cf_avail_filter_console.getFieldValue("resavail.date_assigned.from");
        var dateAssigedTo = this.cf_avail_filter_console.getFieldValue("resavail.date_assigned.to");
        if (dateAssigedFrom && dateAssigedTo) {
            if (compareLocalizedDates(this.cf_avail_filter_console.getFieldElement('resavail.date_assigned.to').value, this.cf_avail_filter_console.getFieldElement('resavail.date_assigned.from').value)) {
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
            this.selectedDate = '';
            this.createAvailResAndShowGrid(dateAssigedFrom, dateAssigedTo);
            this.dateStart = dateAssigedFrom;
            this.dateEnd = dateAssigedTo;
        }
        else {
            View.showMessage(getMessage('errorDateRange'));
        }
    },
    
    cf_avail_dates_grid_afterRefresh: function(){
        if (this.cf_avail_dates_grid.rows.length > 0) {
            this.showReport(this.cf_avail_dates_grid.rows[0]['resavail.date_assigned']);
        }
        else {
            var title = getMessage('resavailReportTitle');
            setPanelTitle('cf_availl_report', title);
            this.cf_availl_report.clear();
        }
    },
    
    cf_avail_dates_grid_onDate: function(row, action){
        this.showCraftpersonAvailabilityReport(row, action);
    },
    
    cf_availl_report_afterRefresh: function(){
        if (!this.restriction) {
            return;
        }
        var ds = View.dataSources.get('ds_ab-pm-rpt-cf-avail_resavail_group');
        
        var totalRecord = ds.getRecord(this.restriction);
        
        var totalRow = new Object();
        totalRow['resavail.cf_id'] = getMessage('total');
        totalRow['resavail.hours_avail_total'] = totalRecord.localizedValues['resavail.total_hours_avail_total'];
        totalRow['resavail.hours_commited_total'] = totalRecord.localizedValues['resavail.total_hours_commited_total'];
        totalRow['resavail.od_hours_commited'] = totalRecord.localizedValues['resavail.total_od_hours_commited'];
        totalRow['resavail.pm_hours_commited'] = totalRecord.localizedValues['resavail.total_pm_hours_commited'];
        totalRow['resavail.hours_remaining'] = totalRecord.localizedValues['resavail.total_hours_remaining'];
        
        this.cf_availl_report.addRow(totalRow);
        
        this.cf_availl_report.build();
        var rows = this.cf_availl_report.rows;
        Ext.get(rows[rows.length - 1].row.dom).setStyle('color', '#4040f0');
        Ext.get(rows[rows.length - 1].row.dom).setStyle('font-weight', 'bold');
    },
    
    //----------------Logic function start--------------------
    
    showCraftpersonAvailabilityReport: function(row, action){
        var dateAssigned = row.record['resavail.date_assigned'];
        this.showReport(dateAssigned);
    },
    
    showReport: function(dateAssigned){
        dateAssigned = getDateWithISOFormat(dateAssigned);
        this.selectedDate = dateAssigned;
        var title = getMessage('resavailReportTitle') + " " + dateAssigned;
        setPanelTitle('cf_availl_report', title);
        this.restriction = new Ab.view.Restriction();
        this.restriction.addClause("resavail.date_assigned", dateAssigned, "=");
        this.cf_availl_report.refresh(this.restriction);
    },
    
    createAvailResAndShowGrid: function(dateAssigedFrom, dateAssigedTo){
		//his method serve as a workflow rule to calculate and create records represent availability within given date
        //range for the specified resource types include trade, craftperson, tool type and parts , file ='PreventiveMaintenanceCommonHandler.java'
        try {
            Workflow.callMethod("AbBldgOpsPM-PmEventHandler-createResAvailRecords", 'cf',dateAssigedFrom,dateAssigedTo);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("resavail.date_assigned", dateAssigedFrom, "&gt;=");
        restriction.addClause("resavail.date_assigned", dateAssigedTo, "&lt;=");
        this.cf_avail_dates_grid.refresh(restriction);
    }
});

function showChart(){
    var selectedDate = View.controllers.get('cfAvailController').selectedDate;
    if (selectedDate) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("resavail.date_assigned", selectedDate, "=");
        View.openDialog('ab-pm-rpt-cf-avail-cht.axvw', restriction);
    }
    else {
        View.showMessage(getMessage("selectDate"));
    }
    
}

function setReportPanelTitle(){
    var title = getMessage('resavailReportTitle');
    setPanelTitle('cf_availl_report', title);
    View.controllers.get('cfAvailController').selectedDate = "";
}
