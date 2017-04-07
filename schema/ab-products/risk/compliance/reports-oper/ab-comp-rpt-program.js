/**
 * @author song
 */
var mainController = commonRptController.extend({
	
    //console restriction for three tabs
    regulationRes:" 1=1 ", 
	programRes:" 1=1 ", 
	requirementRes:" 1=1 ", 
	
    afterInitialDataFetch: function(){
    	
    	this.objPanelTitles = {"requirement": null,"events": null,"notifications": null,
    			"locations": null,"docs": null,"commLog": null,"violations": null};
    	
    	this.objTabAndGridPanelId = {"requirement": "abCompSelectRequirement",
					                "events": "abCompEventActivityLogGrid",
					                "notifications": "abCompNotificationGrid",
					                "locations": "regLocGrid",
					                "docs": "documentsGrid",
					                "commLog": "commGrid",
					                "violations": "abCompViolationGrid"};
    	
    	this.tabNameRefresh = {"comprogram": 0,"requirement": 0,"events": 0,"notifications": 0,"locations": 0,
				"docs": 0,"commLog": 0,"violations": 0};
    	
    	this.firstTabTable = "regprogram";

    	this.exportRes = "program";
    	
		this.sbfDetailTabs.addEventListener('beforeTabChange', this.beforeTabChange);
		this.sbfDetailTabs.addEventListener('afterTabChange', this.afterTabChange);
    },
    
    //for pop up Compliance Program Count by:
    addParentRestrictionIfPopUp: function(){
    	var openerView = View.getOpenerView();
    	if(openerView.popUpRestriction){
    		this.abCompSelectProgram.addParameter('consoleResProgram', openerView.popUpRestriction);
    		this.abCompSelectProgram.refresh();
    	}
    }
});        
