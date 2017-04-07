/**
 * @author keven.xi
 */
var rptRmDaysReserveController = View.createController("rptRmDaysReserveController", {

    /**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
        this.onStart();
    },
    
    /**
     * it initialize the date_start with the present day.
     */
    onStart: function(){
        var dateObj = new Date();
        var day = dateObj.getDate();
        var month = dateObj.getMonth() + 1;
        var year = dateObj.getFullYear();
        
        var ISODate = year + "-" + month + "-" + day;
        this.roomDaysReserveConsole.setFieldValue("reserve_rm.date_start", ISODate);
    }
})


/**
 * Build a restriction from parameters in the console panel 
 * in the view ab-rr-rpt-reservations-room-days.axvw
 */
function buildReportRestriction(consolePanelId) {
	var panel = View.panels.get(consolePanelId);
	var startDate = panel.getFieldValue("reserve_rm.date_start");
	if (!startDate) {
        alert(getMessage("selectDateError"));
        return;
    }
	var restriction = panel.getFieldRestriction();
	
	return restriction;
}
