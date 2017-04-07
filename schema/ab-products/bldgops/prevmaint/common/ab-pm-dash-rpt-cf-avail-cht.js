var cfAvailController = View.createController('cfAvailController', {

	afterInitialDataFetch: function(){
		//This method serve as a workflow rule to calculate and create records represent availability within given date
        //range for the specified resource types include trade, craftperson, tool type and parts ,file='PreventiveMaintenanceCommonHandler.java'
        try {
            Workflow.callMethod("AbBldgOpsPM-PmEventHandler-createResAvailRecords", 'cf',getCurrentDate(),getCurrentDate());
	        this.cf_avail_chart.refresh();
        } 
        catch (e) {
            Workflow.handleError(e);
        }
    }
});

	
function showDetail(obj){
    var detailPanel = View.panels.get('cf_avail_wrcf_report');
    detailPanel.refresh(obj.restriction);
    detailPanel.show(true);
    detailPanel.showInWindow({
        width: 800,
        height: 600
    });
}

