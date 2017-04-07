
var abCompRptLocConsoleController = View.createController('abCompRptLocConsoleController', {
//	Match Compliance Level in regprogram OR regrequirement.
//	- Responsible Person matches regprogram.em_id OR regrequirement.em_id
//	- Vendor Code matches regprogram.vn_id OR regrequirement.vn_id
	specialFields: ['vn_id','em_id','comp_level'],
	
	isReport: true,
	/**
	 * clicked tree node.
	 */
	clickedNodeName: '',
	
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
    	
    	obj.isReport = true;
    	
    	/*
    	 * message 
    	 */
    	obj.messageFormSaved = getMessage('formSaved');
    	defineLocationFL.configure(obj);

		controllerConsole.controllers.push(abCompRptLocConsoleController);
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
     * parent find child.
     */
    setPanelsReadOnly: function(selectedTabName){
		var tab = abCompRptLocConsoleController.sbfDetailTabs.findTab(selectedTabName);
		var panels = [];
		var iframe = tab.getContentFrame();                                  
		var childView = iframe.View;
		if(!childView){
        	abCompRptLocConsoleController.setPanelsReadOnly.defer(1000, this, [selectedTabName]);
		}else{
			
			
			var controller = childView.controllers.get(0);
			panels.push(controller.abCompDefineRegulation);
			panels.push(controller.abCompDefineProgram);
			panels.push(controller.abCompDefineRequirement);
//      	change all the fields to readOnly and remove all the button.
			for(var j=0;j<panels.length;j++){
				var panel = panels[j];
				if(panel){
					//change panel name.
			    	if(selectedTabName=='regulation'){
			    		controller.abCompDefineRegulation.setTitle(getMessage("viewRegulation"));
			    	}else if(selectedTabName=='comprogram'){
			    		controller.abCompDefineProgram.setTitle(getMessage("viewCompliance"));
			    	}else{
			    		controller.abCompDefineRequirement.setTitle(getMessage("viewRequirement"));
			    	}
			    	
					if(panel.fields){
						var items = panel.fields.items;
						for(var i=0;i<items.length;i++){
							var fieldEl = items[i];
							panel.enableField(fieldEl.fieldDef.id, false);
						}
					}
					var actions = panel.actions.items;
					for(var i=0;i<actions.length;i++){
						var action = actions[i];
						//alert(action.id);
						if(action.id=="delete"){
							action.enabled = false;
						}
						if(action.id=='pdf'||action.id=='docx'){
							action.show(true);
						}else{
							action.show(false);
						}
					}
				}
			}
		}
    },
    
    /**
     * set restriction to tabs 4,5,6,7.
     */
    filterOtherTabs: function(nodeName, nodeData){
    	
    	this.sbfDetailTabs.enableTab("locations", true);
    	this.sbfDetailTabs.enableTab("events", true);
    	this.sbfDetailTabs.enableTab("doc", true);
    	this.sbfDetailTabs.enableTab("commLog", true);
    	
//       kb 3036372 If program selected, docs_assigned.regulation;reg_program= PK of selected program AND docs_assigned.reg_requirement IS NULL.
//   	 If regulation selected, docs_assigned.regulation=selected regulation AND docs_assigned.reg_requirement IS NULL AND docs_assigned.reg_program IS NULL

    	var restriction = nodeName+"='"+nodeData[nodeName]+"'";
		if(restriction.indexOf('.')!=-1){
			restriction = restriction.substring(restriction.indexOf('.')+1, restriction.length);
		}    	
		var resWithNull = restriction; 
    	var resForEventTab = restriction;//event tab restriction
    	
    	var tabLocations = this.sbfDetailTabs.findTab("locations");
    	var tabEvents = this.sbfDetailTabs.findTab("events");
    	var tabDoc = this.sbfDetailTabs.findTab("doc");
    	var tabCommLog = this.sbfDetailTabs.findTab("commLog");
    	var objTabAndTable =  {"regloc": tabLocations, "activity_log": tabEvents, "docs_assigned":tabDoc ,"ls_comm": tabCommLog};

		for (tableName in objTabAndTable){
			var tab = objTabAndTable[tableName];
			if(nodeName=='regulation.regulation'){
				resWithNull+= " and "+tableName+".reg_requirement IS NULL AND "+tableName+".reg_program IS NULL";
			}else if(nodeName=='regprogram.reg_program'){
				resForEventTab+= " and "+tableName+".regulation = '"+nodeData["regprogram.regulation"]+"'";
				resWithNull+= " and "+tableName+".regulation = '"+nodeData["regprogram.regulation"]+"' and "+tableName+".reg_requirement IS NULL";
			}else if(nodeName=='regrequirement.reg_requirement'){
				resWithNull+= " and "+tableName+".regulation = '"+nodeData["regrequirement.regulation"]+"' and "+tableName+".reg_program = '"+nodeData["regrequirement.reg_program"]+"'";
				resForEventTab = resWithNull;
			}
			if(tab==tabEvents){
				tab.restriction = tableName+"."+resForEventTab;
			}else{
				tab.restriction = tableName+"."+resWithNull;
			}
//			reset value to default value.
	    	restriction = nodeName+"='"+nodeData[nodeName]+"'";
			if(restriction.indexOf('.')!=-1){
				restriction = restriction.substring(restriction.indexOf('.')+1, restriction.length);
			}    	
		    resWithNull = restriction; 
	    	resForEventTab = restriction;//event tab restriction
		}
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
