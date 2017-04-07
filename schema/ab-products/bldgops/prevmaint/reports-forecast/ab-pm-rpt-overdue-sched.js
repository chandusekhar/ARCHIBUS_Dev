/**
 * @author keven.xi
 */
var viewOverduePMWorkController = View.createController('viewOverduePMWork', {

    afterInitialDataFetch: function(){
        var dateStart = getCurrentDate();
        var restriction = Ab.view.Restriction();
		var result = {};
		//This method serve as a WFR to call a long running job generating schedule dates for specified date range and PM Schedules. file='PreventiveMaintenanceCommonHandler.java'
        try {
			result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-PmScheduleGenerator', dateStart,dateStart,restriction,false);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
        this.overdue_pms_report.refresh(restriction);
        this.overdue_pms_report.show(true);
    }
})
