var mainController = commonRptController.extend({
	
	// console restriction.
	consoleRestriction:'',
	
	//tree and console restriction
	treeAndConsoleRes:' 1=1 ',

	//When we click show button
	treeRestriction:' 1=1 ',
	
    //use for tab forward        
    nextTabArr:new Array({
    			panelName: 'regulationGrid',
				field: new Array(
						["regloc.regulation","regloc.regulation"]
					)
			},
			{
				
				panelName: 'programGrid',	
				field: new Array(
						["regloc.regulation","regloc.regulation"],
						["regloc.reg_program","regloc.reg_program"]
					)
				
			},
			{
				panelName: 'requireGrid',
				field: new Array(
						["regloc.regulation","regloc.regulation"],
						["regloc.reg_program","regloc.reg_program"],
						["regloc.reg_requirement","regloc.reg_requirement"]
					)
				
			}
		) ,     

    //console restriction for three tabs
    regulationRes:" 1=1 ", 
	programRes:" 1=1 ", 
	requirementRes:" 1=1 ", 
	
	disableTabsArr:new Array(['comprogram',false],['requirement',false],['events',false],['docs',false],['commLog',false],['violations',false]),
	enableTabsArr:new Array(['comprogram',true],['requirement',true],['events',true],['docs',true],['commLog',true],['violations',true]),
	
	//decide if the view is first loading for refresh tree
	firstLoad:true,
	//for paginate report restriction
	selectRes:' 1=1 ',
	
	afterInitialDataFetch: function(){
		
		controllerConsole.controllers.push(mainController);
		
    	this.objPanelTitles = {"comprogram": null,"requirement": null,"events": null,"docs": null,"commLog": null,"violations": null};
   
    	
    	this.objTabAndGridPanelId = {"comprogram": "programGrid",
					                "requirement": "requireGrid",
					                "events": "abCompEventActivityLogGrid",
					                "docs": "documentsGrid",
					                "commLog": "commGrid",
					                "violations": "abCompViolationGrid"};
    	
    	this.tabNameRefresh = {"regulation": 0,"comprogram": 0,"requirement": 0,"events": 0,
				"docs": 0,"commLog": 0,"violations": 0};
    	
    	this.firstTabTable = "regulation";
    	
    	
		this.sbfDetailTabs.addEventListener('beforeTabChange', this.beforeTabChange);
		this.sbfDetailTabs.addEventListener('afterTabChange', this.afterTabChange);
		
		controllerConsole.abCompDrilldownConsole_onShow();		
		enableAndDisableTabs(this.sbfDetailTabs,this.disableTabsArr);
	},
    
	doTabRefreshAndSetTitle:function(gridPanel, selectedTabName){
			enableAndDisableTabs(this.sbfDetailTabs,this.enableTabsArr);
			var tableName ='';
			
			if(selectedTabName=='regulation'||selectedTabName=='comprogram'||selectedTabName=='requirement'){
				tableName='regloc';
			}else{
				tableName = this.getTableName(selectedTabName);
			}
		
			var restriction="";
			
			//set restriction for different tab.
			if(selectedTabName=='regulation'){
				
				restriction=mainController.regulationRes+" AND "+mainController.treeRestriction;
				//restriction for calculate doc count of regulation
				
				
			}else if(selectedTabName=='comprogram'){
				
				restriction=mainController.programRes+" AND "+mainController.treeRestriction;
				
			}else if(selectedTabName=='requirement'){
				
				restriction=mainController.treeAndConsoleRes;
				
			}else {
				restriction=mainController.treeAndConsoleRes;
				
			}
			
			
			this.refreshTabPanel(gridPanel, tableName, selectedTabName,restriction);
			
	},
	
	/**
	 * Refresh tab panel called by after tab changed.
	 */
	refreshTabPanel:function(gridPanel,tableName,selectedTabName,restriction){
		var regulation = this.objRestrictions["regulation"];
		var reg_program = this.objRestrictions["reg_program"];
		var reg_requirement = this.objRestrictions["reg_requirement"];
		
		var nullSql=" ";
		//Running when we select regulation record then we change tab.
		if(regulation!=null&&reg_program==null&&reg_requirement==null){
			
			
			if(selectedTabName=='events'||selectedTabName=='docs'||selectedTabName=='commLog'||selectedTabName=='violations'){
				nullSql=tableName+".reg_program is  null AND ";
			}
			this.selectRes=nullSql+tableName+".location_id is not null AND "+tableName+".regulation  = '"+regulation+"' AND "+mainController.treeAndConsoleRes;
			
			gridPanel.refresh(nullSql+tableName+".location_id is not null AND "+tableName+".regulation  = '"+regulation+"' AND "+restriction);
			gridPanel.setTitle(getMessage("title_"+selectedTabName)+": "+regulation);
		
		}else if(regulation!=null&&reg_program!=null&&reg_requirement==null){
			//Running when we select a program record then we change tab.
			if(selectedTabName=='events'||selectedTabName=='docs'||selectedTabName=='commLog'||selectedTabName=='violations'){
				nullSql=tableName+".reg_requirement is  null AND ";
			}
			
			this.selectRes=nullSql+tableName+".location_id is not null  AND "+tableName+".regulation  = '"+regulation+"' AND "+tableName+".reg_program = '"+reg_program+"' AND "+mainController.treeAndConsoleRes;
			gridPanel.refresh(nullSql+tableName+".location_id is not null  AND "+tableName+".regulation  = '"+regulation+"' AND "+tableName+".reg_program = '"+reg_program+"' AND "+restriction);
			gridPanel.setTitle((getMessage("title1_"+selectedTabName).replace("<{0}>", reg_program)).replace("<{1}>", regulation));
		
		}else if(regulation!=null&&reg_program!=null&&reg_requirement!=null){
			//Running when we select a reg_requirement record then we change tab.
			this.selectRes=tableName+".location_id is not null AND "+tableName+".regulation  = '"+regulation+"' AND "+tableName+".reg_program = '"+reg_program+"' AND "+tableName+".reg_requirement = '"+reg_requirement+"' AND "+mainController.treeAndConsoleRes;
			gridPanel.refresh(tableName+".location_id is not null AND "+tableName+".regulation  = '"+regulation+"' AND "+tableName+".reg_program = '"+reg_program+"' AND "+tableName+".reg_requirement = '"+reg_requirement+"' AND "+restriction);
			gridPanel.setTitle( ((getMessage("title2_"+selectedTabName).replace("<{0}>", reg_requirement)).replace("<{1}>", reg_program)).replace("<{2}>", regulation));
		}else{
			this.selectRes= tableName+".location_id is not null AND "+mainController.treeAndConsoleRes;
			//Running when we change tab and we do not select any regulation,program,requirement record.
			gridPanel.refresh(tableName+".location_id is not null AND "+restriction);
		}
		hideEmptyColumnsByPrefix(gridPanel,'compliance_locations');    	
	},
		
	/**
	 * Step1 when we click console show button, 
	 * Refresh tree by console causes.
	 */
	refreshFromConsole:function(){
		
		enableAndDisableTabs(this.sbfDetailTabs,this.enableTabsArr);
			//add restriction for regulationRes
		this.regulationRes = generateRegulationRestriction();
			
			//add restriction for programRes
		this.programRes = generateProgramRestriction();
			
		//Generate restriction from console for tree and center tabs except regulation,regprogram,requirement.
		this.consoleRestriction = generateConsoleRestriction();
		
		//1 refresh tree when we click console show button.
		this.refreshTree();
		
		//2 refresh center panel when we click console show button.
		if(!this.firstLoad){
			this.refreshCenterTabs();	
		}else{
			this.firstLoad=false;
		}
	},
	
	/** 
	 * Step1 2 
	 * params ,tree restriction 
	 * consoleRestriction, from console restriction.
	 * Refresh center tabs .
	 */
	refreshCenterTabs:function(params){
		
		  //set the current tab value is null before we change it.
	    mainController.objRestrictions= {"regulation": null,"reg_program": null,"reg_requirement": null};
	    
		 // Mark all other tabs for refresh except current tab when we click show button on tree or console panel
		mainController.setOthersTabRefreshObj('regulation', 1);
		
		this.treeAndConsoleRes=this.consoleRestriction;
		
		
		//set tree and console restriction
		if(params){
			if(this.treeAndConsoleRes.indexOf('AND')!=-1){
				this.treeAndConsoleRes=this.treeAndConsoleRes+" AND "+this.getRestrictionFromTree(params);
				
			}else{
				this.treeAndConsoleRes=this.getRestrictionFromTree(params);
			}
			this.treeRestriction=this.getRestrictionFromTree(params);
		}else{
			this.treeRestriction=' 1=1 ';
		}
		
		var consoleRegulationAndTreeRes=this.regulationRes;
		
		if(this.treeRestriction.indexOf('AND')!=-1){
		
			consoleRegulationAndTreeRes=consoleRegulationAndTreeRes+" AND "+this.treeRestriction;
		}
		var subController = this.sbfDetailTabs.findTab('regulation').getContentFrame().View.controllers.get(0);
		
		this.sbfDetailTabs.selectTab('regulation');

		this.selectRes=this.treeAndConsoleRes;
		
		//get regulation tab grid
		var regulationGrid = subController.view.panels.get('regulationGrid');
		regulationGrid.refresh(consoleRegulationAndTreeRes);
   	hideEmptyColumnsByPrefix(regulationGrid,'compliance_locations');
				
	},
	
	/**
	 * Generate restriction string that match the center grid.
	 */
	getRestrictionFromTree:function(params){
	    	var levelFields=new Array("compliance_locations.ctry_id","compliance_locations.regn_id","compliance_locations.state_id",
	    			"compliance_locations.city_id","compliance_locations.site_id","compliance_locations.pr_id","compliance_locations.bl_id","compliance_locations.fl_id","compliance_locations.rm_id",
	    			"compliance_locations.eq_id");
	    	var levelFromFields=new Array("ctry.ctry_id","regn.regn_id","state.state_id",
	    			"city.city_id","site.site_id","property.pr_id","bl.bl_id","fl.fl_id","rm.rm_id",
	    			"eq.eq_id");
	    	var res=' 1=1 ';
	    	for(var i=0;i<params.length;i++){
	    		var param=params[i];
	    		var levelRes="";
		    	for(var j=0;j<param.length;j++){
		    		if(param[j]+"['"+levelFromFields[i]+"']"){
		    			
		    			//generate level restriction for 'OR' relation
		    			if(levelRes==""){
		    				
		    				levelRes=levelFields[i]+"= '"+param[j].values[levelFromFields[i]]+"' ";
		    			}else{
		    				levelRes=levelRes +" OR "+levelFields[i]+"= '"+param[j].values[levelFromFields[i]]+"' ";
		    			}
		    		}
		    	}
		    	// if level restriction is not null ,we generate total tree restriction.
		    	if(levelRes!=""){
		    		res=res +" AND ("+levelRes+")";
		    	}
		    	
	    	}
	    	return res;
	},
	
	/** 
	 * Step1 1 Refresh tree  level when we click console show button.
	 */
	refreshTree:function(){
		var tree=View.controllers.get('treeController').abSpAsgnEmToRm_blTree;
		
		var connectClause="";
		
		connectClause=" ctry.ctry_id=compliance_locations.ctry_id  ";
		tree.addParameter('ctryRes',this.getConsoleResForTree(connectClause));
		
		connectClause=" regn.regn_id=compliance_locations.regn_id AND regn.ctry_id=compliance_locations.ctry_id    ";
		tree.addParameter('regnRes',this.getConsoleResForTree(connectClause));
		
		connectClause=" state.state_id=compliance_locations.state_id AND   state.regn_id=compliance_locations.regn_id  ";
		tree.addParameter('stateRes',this.getConsoleResForTree(connectClause));
		
		connectClause=" city.city_id=compliance_locations.city_id AND city.state_id=compliance_locations.state_id ";
		tree.addParameter('consoleCityRes',this.getConsoleResForTree(connectClause));
		
		connectClause=" county.county_id=compliance_locations.county_id AND county.state_id=compliance_locations.state_id ";
		tree.addParameter('consoleCountyRes',this.getConsoleResForTree(connectClause));
		
		connectClause=" site.site_id=compliance_locations.site_id  ";
		tree.addParameter('siteRes',this.getConsoleResForTree(connectClause));
		
		connectClause=" property.pr_id=compliance_locations.pr_id  ";
		tree.addParameter('propertyRes',this.getConsoleResForTree(connectClause));
		
		connectClause=" bl.bl_id=compliance_locations.bl_id  ";
		tree.addParameter('blRes',this.getConsoleResForTree(connectClause));
		
		connectClause=" fl.fl_id=compliance_locations.fl_id  AND fl.bl_id=compliance_locations.bl_id";
		tree.addParameter('flRes',this.getConsoleResForTree(connectClause));
		
		connectClause=" rm.rm_id=compliance_locations.rm_id AND  rm.fl_id=compliance_locations.fl_id  AND rm.bl_id=compliance_locations.bl_id  ";
		tree.addParameter('rmRes',this.getConsoleResForTree(connectClause));
		
		connectClause=" eq.eq_id=compliance_locations.eq_id  ";
		tree.addParameter('eqstdRes',this.getConsoleResForTree(connectClause));
		
		tree.refresh();
	},
	
	/**
	 * Sub function for function refreshTree 
	 * Get restriction from console for tree 
	 */
	getConsoleResForTree:function(connectClause){
		
		var consoleRes=" 1=1 ";
		
		//if console restriction is not null ,we generate it. Or we utilize 1=1
		if( mainController.consoleRestriction.indexOf("AND")!=-1){
			consoleRes=mainController.consoleRestriction;
		}
			
		var res=" exists( select 1 from regloc left outer 	" +
			" join regulation on regloc.regulation= regulation.regulation " +
			" left join regprogram on  regloc.regulation= regprogram.regulation AND  regloc.reg_program= regprogram.reg_program" +
			" left join regrequirement on regloc.regulation= regrequirement.regulation AND regloc.reg_program= regrequirement.reg_program AND   regloc.reg_requirement= regrequirement.reg_requirement  " +
			" left join compliance_locations on regloc.location_id = compliance_locations.location_id " +
			" where "+connectClause+" AND " + consoleRes+
		")";
		
		return res;
	}
	
});
