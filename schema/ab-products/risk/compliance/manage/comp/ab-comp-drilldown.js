
var abCompRptLocConsoleController = View.createController('abCompRptLocConsoleController', {
	
	isReport: false,
//	Match Compliance Level in regprogram OR regrequirement.
//	- Responsible Person matches regprogram.em_id OR regrequirement.em_id
//	- Vendor Code matches regprogram.vn_id OR regrequirement.vn_id
	specialFields: ['vn_id','em_id','comp_level'],

	//If Regulation = Egress or HAZMAT, disable Regulation field and Delete button.
	isEgressOrHAZMAT: false,
	
	
    //console restriction for three tabs
    regulationRes:" 1=1 ", 
	programRes:" 1=1 ", 
	requirementRes:" 1=1 ", 
	
    //----------------event handle--------------------
    afterViewLoad: function(){
//        this.site_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
    
    afterInitialDataFetch: function(){
    	var obj = {};
    	obj.abCompRptLocConsoleController = abCompRptLocConsoleController;
    	obj.buttonName = 'addNew';
    	/*
    	 * three panel name.
    	 */
    	obj.firstLevelTree = this.regulationTree;
    	obj.secondLevelTree = this.regprogramTree;
    	obj.thirdLevelTree = this.regcomplianceTree;
    	/*
    	 * menu title.
    	 */
    	obj.menuTitle_firstLevelTree = getMessage("regulation");
    	obj.menuTitle_secondLevelTree = getMessage("program");
    	obj.menuTitle_thirdLevelTree = getMessage("requirement");
    	
    	obj.tabsName = this.sbfDetailTabs;
    	
    	obj.firstTabName = 'regulation';
    	obj.secondTabName = 'comprogram';
    	obj.thirdTabName = 'requirement';
    	
    	
    	obj.firstNodeName = 'regulation.regulation';//first tree node show field
    	
    	obj.secondResNodeName = 'regprogram.reg_program';//current node key.
    	obj.secondResNodeName0 = 'regulation.regulation';//second tree node cas-name
    	
    	obj.thirdResNodeName = 'regrequirement.reg_requirement';//current node key.
    	obj.thirdResNodeName0 = 'regulation.regulation';//third tree node show cas-name
    	obj.thirdResNodeName1 = 'regprogram.reg_program';//third tree node show cas-name
    	/*
    	 * three edit form panel.
    	 */
    	obj.abCompDefineRegulation = this.abCompDefineRegulation;
    	obj.abCompDefineProgram = this.abCompDefineProgram;
    	obj.abCompDefineRequirement = this.abCompDefineRequirement;
    	
//    	obj.abCompDefineRegulation = this.getSubTabController("regulation").abCompDefineRegulation;
//    	obj.abCompDefineProgram = this.getSubTabController("comprogram").abCompDefineProgram;
//    	obj.abCompDefineRequirement = this.getSubTabController("requirement").abCompDefineRequirement;
    	/*
    	 * message 
    	 */
    	obj.messageFormSaved = getMessage('formSaved');
    	defineLocationFL.configure(obj);

    	//if there is a console exists, put current controller to the console controller array
		 if (typeof controllerConsole != "undefined") {
			 controllerConsole.controllers.push(abCompRptLocConsoleController);
		 }
    },
    /**
     * private method
     * parent find child.
     */
    getSubTabController: function(selectedTabName){
		var tab = abCompRptLocConsoleController.sbfDetailTabs.findTab(selectedTabName);
		var iframe = tab.getContentFrame();                                  
        var childView = iframe.View;
        return childView.controllers.get(0);
    },
    
    /**
	 * Refresh tree by console causes.
	 */
	refreshFromConsole:function(){
		
		//call this method for fields 'Compliance Level, Responsible Person, Vendor Code'
		overWriteConsoleSpecialVariable("isProgram");
		
		//add restriction for regulationRes
		this.regulationRes = generateRegulationRestriction();
		
		
		//add restriction for programRes
		this.programRes = generateProgramRestriction("programRpt");
		
		overWriteConsoleSpecialVariable();
		//Generate restriction for requirement.
		this.requirementRes = generateRequirementRestriction();

		
		//Add location restriction for this.regulationRes which use for regulation tab.
		addConsoleLocationResToTabRes(abCompRptLocConsoleController,this.regulationRes,this.programRes,this.requirementRes);
		
		this.regulationTree.addParameter('consoleResRegulation', this.regulationRes);
		this.regulationTree.addParameter('consoleResRegprogram', this.programRes);
		this.regulationTree.addParameter('consoleResRegcompliance', this.requirementRes);
		this.regulationTree.refresh();
		//first tree node extend by default.
    	var root=this.regulationTree.treeView.getRoot();
    	for (var i = 0; i < root.children.length; i++) {
            root.children[i].expand();
            break;
    	}
	},
	
    
    /**
     * first tab panel save button click 
     */
    abCompDefineRegulation_onSaveAndAddNew: function(abCompDefineRegulation){
    	defineLocationFL.abCompDefineRegulation = abCompDefineRegulation;
    	defineLocationFL.refreshTree('first');
    },
    
    /**
     * Event handle when 'Save' button click.
     */
    abCompDefineRegulation_onSave: function(abCompDefineRegulation){
    	defineLocationFL.abCompDefineRegulation = abCompDefineRegulation;
    	defineLocationFL.refreshTree('first');
    },

    /**
     * Event handle when 'Delete' button click.
     */
    abCompDefineRegulation_onDelete: function(abCompDefineRegulation){
    	defineLocationFL.abCompDefineRegulation = abCompDefineRegulation;
    	defineLocationFL.refreshTreePanelAfterUpdate('first');
    },
    /**
     * second tab panel save button click 
     */
    abCompDefineProgram_onSaveAndAddNew: function(abCompDefineProgram){
    	defineLocationFL.abCompDefineProgram = abCompDefineProgram;
    	defineLocationFL.refreshTree('second');
    },
    
    abCompDefineProgram_onSave: function(abCompDefineProgram){
    	defineLocationFL.abCompDefineProgram = abCompDefineProgram;
    	defineLocationFL.refreshTree('second');
    },
    
    abCompDefineProgram_onDelete: function(abCompDefineProgram){
    	defineLocationFL.abCompDefineProgram = abCompDefineProgram;
    	defineLocationFL.refreshTreePanelAfterUpdate('second');
    },
    /**
     * three tab panel save button click 
     */
    abCompDefineRequirement_onSaveAndAddNew: function(abCompDefineRequirement){
    	defineLocationFL.abCompDefineRequirement = abCompDefineRequirement;
    	defineLocationFL.refreshTree('third');
//    	var regulation = this.abCompDefineRequirement.getFieldValue("regcompliance.reg_program");
//    	this.abCompDefineRequirement.newRecord= true;
//    	this.abCompDefineRequirement.refresh();
//    	this.abCompDefineRequirement.setFieldValue("regcompliance.reg_program",regulation);
    },
    abCompDefineRequirement_onSave: function(abCompDefineRequirement){
    	defineLocationFL.abCompDefineRequirement = abCompDefineRequirement;
    	defineLocationFL.refreshTree('third');
    },
    abCompDefineRequirement_onDelete: function(abCompDefineRequirement){
    	defineLocationFL.abCompDefineRequirement = abCompDefineRequirement;
    	defineLocationFL.refreshTreePanelAfterUpdate('third');
    },
    
    /**
     * If Regulation = Egress or HAZMAT, disable Regulation field and Delete button.
     */
    setPanelsAttributes: function(selectedTabName, flag){
    	var tab = abCompRptLocConsoleController.sbfDetailTabs.findTab(selectedTabName);
    	var iframe = tab.getContentFrame();                                  
    	var childView = iframe.View;
    	if(childView){
			var controller = childView.controllers.get(0);
			controller.abCompDefineRegulation.enableField("regulation.regulation", flag);
			controller.abCompDefineRegulation.actions.get("delete").show(flag);
    	}
    }
}); 