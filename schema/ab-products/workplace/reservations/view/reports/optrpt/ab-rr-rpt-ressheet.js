/**
 * @author keven.xi
 */
var rptResSheetController = View.createController("rptResSheetController", {

    /**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
        this.onStart();
    },
    
    /**
     * it refresh the reservation info panel with the first row in the select reservation panel.
     */
    onStart: function(){
        var resId = '-1';
        var restriction = new Ab.view.Restriction();
        if (this.rrressheet.gridRows.length > 0) {
            resId = this.rrressheet.gridRows.items[0].getFieldValue("rrressheetplus.res_id");
        }
        restriction.addClause("resview.res_id", resId, "=");
        this.resview.refresh(restriction);
        
        restriction.removeClause("resview.res_id");
        restriction.addClause("resrmview.res_id", resId, "=");
        this.resrmview.refresh(restriction);
        
        restriction.removeClause("resrmview.res_id");
        restriction.addClause("resrsview.res_id", resId, "=");
        this.resrsview.refresh(restriction);
    }
    
})
/**
 * Build a restriction from parameters in the console panel
 * in the view ab-rr-rpt-ressheet.axvw
 */
function buildReportRestriction(consolePanelId){
    var panel = View.panels.get(consolePanelId);
    var restriction = panel.getFieldRestriction();
    var startDate = panel.getFieldValue("date_start");
    var endDate = panel.getFieldValue("date_to");
    
    // delete twice for date start and date end.
    restriction.removeClause("rrressheetplus.date_start");
    restriction.removeClause("rrressheetplus.date_start");
    
    if (startDate != '') {
        restriction.addClause("rrressheetplus.date_start", startDate, "&gt;=");
    }
    
    if (endDate != '') {
        restriction.addClause("rrressheetplus.date_start", endDate, "&lt;=");
    }
    
    if (startDate != '' && endDate != '') {
        var strStartDate = panel.getFieldElement("date_start").value;
        var strEndDate = panel.getFieldElement("date_to").value;
        
        if (compareLocalizedDates(strEndDate, strStartDate)) {
            View.showMessage(getMessage("errorDateRange"));
            return false;
        }
    }
    
    return restriction;
}

