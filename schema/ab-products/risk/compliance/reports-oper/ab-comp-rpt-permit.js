/**
 * @author song
 * extent rpt-requirement controller ['mainController'].
 */
var permitController = mainController.extend({
	
    afterInitialDataFetch: function(){
    	
    	//use this attribute for current View.
    	//add Requirement Type IN ('License','Permit') AND Requirement Status = 'Active'
    	this.isPermit = true;

    	this.objPanelTitles = {"events": null,"notifications": null,
    			"locations": null,"docs": null,"commLog": null,"violations": null};
    	
    	this.objTabAndGridPanelId = {"events": "abCompEventActivityLogGrid",
					                "notifications": "abCompNotificationGrid",
					                "locations": "regLocGrid",
					                "docs": "documentsGrid",
					                "commLog": "commGrid",
					                "violations": "abCompViolationGrid"};
    	
    	this.tabNameRefresh = {"requirement": 0,"events": 0,"notifications": 0,"locations": 0,
				"docs": 0,"commLog": 0,"violations": 0};
    	
    	this.firstTabTable = "regrequirement";
    	
		this.sbfDetailTabs.addEventListener('beforeTabChange', this.beforeTabChange);
		this.sbfDetailTabs.addEventListener('afterTabChange', this.afterTabChange);
    	
    	 //if there is a console exists, put current controller to the console controller array
		 if (typeof controllerConsole != "undefined") {
    		controllerConsole.controllers.push(mainController);
    	}
		 
		this.costomlizeConsole();
    },
    
    /**
     * Requirement Type is a virtual field with static text string value of "License or Permit". 
	 * The virtual field is not used in the restriction, as that is already specified in the permanent 
	 * restriction below.  Requirement Status is disabled and set to "Active"
     */
    costomlizeConsole: function(){
    	
    	var regreq_type = this.abCompDrilldownConsole.getFieldElement("regrequirement.regreq_type");
    	var license = "License";
    	var permit = "Permit";
    	var objLicense = findOption(regreq_type, license);
    	var objPermit = findOption(regreq_type, permit);
    	regreq_type.innerHTML = "";
    	addOption(regreq_type, "", "");
    	addOption(regreq_type, objLicense.value, objLicense.name);
    	addOption(regreq_type, objPermit.value, objPermit.name);
    	
    	this.abCompDrilldownConsole.setFieldValue("regrequirement.status", 'Active');
    	this.abCompDrilldownConsole.enableField("regrequirement.status", false);
    }

});       

