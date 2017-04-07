/**
* Added for 22.1 :  Compliance and Building Operations Integration: Work History tab 
* @author Zhang Yi
 */
var mainController = commonRptWorkHistoryController.extend({
    afterInitialDataFetch: function(){

    	this.objPanelTitles = {"workRequests": null,"serviceRequests": null, "pmSchedules": null};
    	
    	this.objTabAndGridPanelId = {"workRequests": "abCompRptWrGrid",
					                "serviceRequests": "abCompRptSrGrid",
					                "pmSchedules": "abCompRptPmsGrid"};
    	
    	this.tabNameRefresh = {"workRequests": 0,"serviceRequests": 0, "pmSchedules": 0};
    	
    	this.firstTabTable = "workRequests";

    	this.firstTabCtrl = "abCompRptWrTabCtrl";
    	
		this.workHistoryTabs.addEventListener('beforeTabChange', this.beforeTabChange);
		this.workHistoryTabs.addEventListener('afterTabChange', this.afterTabChange);
		
		this.onRefresh();
	},

    onRefresh: function(){
		if ( View.parentTab.parentPanel.eventId ) {
			this.workHistoryTabs.eventId =  View.parentTab.parentPanel.eventId;
		}
		
		this.refreshSubTabs();
	}
});        
