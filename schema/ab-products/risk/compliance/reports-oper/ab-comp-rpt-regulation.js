/**
 * @author song
 */
var mainController = commonRptController.extend({
	
    afterInitialDataFetch: function(){
    	
    	this.objPanelTitles = {"comprogram": null,"requirement": null,"events": null,
    			"locations": null,"docs": null,"commLog": null,"violations": null};
    	
    	this.objTabAndGridPanelId = {"comprogram": "abCompSelectProgram",
					                "requirement": "abCompSelectRequirement",
					                "events": "abCompEventActivityLogGrid",
					                "locations": "regLocGrid",
					                "docs": "documentsGrid",
					                "commLog": "commGrid",
					                "violations": "abCompViolationGrid"};
    	
    	this.tabNameRefresh = {"regulation": 0,"comprogram": 0,"requirement": 0,"events": 0,"locations": 0,
				"docs": 0,"commLog": 0,"violations": 0};
    	
    	this.firstTabTable = "regulation";
    	this.exportRes = "regulation";
    	
		this.sbfDetailTabs.addEventListener('beforeTabChange', this.beforeTabChange);
		this.sbfDetailTabs.addEventListener('afterTabChange', this.afterTabChange);
    }
});        
