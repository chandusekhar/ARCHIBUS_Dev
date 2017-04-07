var mainController = commonRptController.extend({
	abConsoleController: null,
	


	//for all tabs except event
	consoleRestriction:"1=1",
	
	//for event tab
	consoleRestrictionForEvent:"1=1",
	
	//current value for tab Regulation Program Requirement tab
	currentRegulation:"1=1",
	currentProgram:"1=1",
	currentRequirement:"1=1",
	
	// sub query console restriction
	activitySubQueryRes:' 1=1 ',
	assignDocSubQueryRes:' 1=1 ',
	regviolationSubQueryRes:' 1=1 ',
	
	isReport:true,
    afterViewLoad:function(){
    	
    	//register main controller to console view.
    	controllerConsole.controllers.push(mainController);
    	
    	//tab and panel for we get panel by current tab use for after tab changed.
    	this.objTabAndGridPanelId = {
					    			"abCbRptDrilldown_tabCountry": "abCbRptDrilldown_panelCountry",
					                "abCbRptDrilldown_tabRegion": "abCbRptDrilldown_panelRegion",
					                "abCbRptDrilldown_tabState": "abCbRptDrilldown_panelState",
					                "abCbRptDrilldown_tabCity": "abCbRptDrilldown_panelCity",
					                "abCbRptDrilldown_tabSite": "abCbRptDrilldown_panelSite",
					                "abCbRptDrilldown_tabBldg": "abCbRptDrilldown_panelBldg",
					                "abCbRptDrilldown_tabFloor": "abCbRptDrilldown_panelFloor",
					                "abCbRptDrilldown_tabRoom": "abCbRptDrilldown_panelRoom",
    								
    								"abCbRptDrilldown_tabRegulation": "abCbRptDrilldown_panelRegulation",
					                "abCbRptDrilldown_tabProgram": "abCbRptDrilldown_panelProgram",
					                "abCbRptDrilldown_tabRequirement": "abCbRptDrilldown_panelRequirement",
					                "abCbRptDrilldown_tabEvents": "abCompEventActivityLogGrid"
					             	};
    	
    	this.tabNameRefresh = {
    							"abCbRptDrilldown_tabCountry": 0,
    							"abCbRptDrilldown_tabRegion": 0,
    							"abCbRptDrilldown_tabState": 0,
    							"abCbRptDrilldown_tabCity": 0,
    							"abCbRptDrilldown_tabSite": 0,
    							"abCbRptDrilldown_tabBldg": 0,
    							"abCbRptDrilldown_tabFloor": 0,
    							"abCbRptDrilldown_tabRoom": 0,
    							
				    			"abCbRptDrilldown_tabRegulation": 0,
				    			"abCbRptDrilldown_tabProgram": 0,
				    			"abCbRptDrilldown_tabRequirement": 0,
				    			"abCbRptDrilldown_tabEvents": 0
								
    						};
    	
    	this.firstTabTable = "abCbRptDrilldown_tabCountry";
    	
    	this.objRestrictions= [{id: "abCbRptDrilldown_panelCountry", restriction: null, currentKey: null},
    		                    {id: "abCbRptDrilldown_panelRegion", restriction: null, currentKey: null},
    		                    {id: "abCbRptDrilldown_panelState", restriction: null, currentKey: null},
    		                    {id: "abCbRptDrilldown_panelCity", restriction: null, currentKey: null},
    		                    {id: "abCbRptDrilldown_panelSite", restriction: null, currentKey: null},
    		                    {id: "abCbRptDrilldown_panelBldg", restriction: null, currentKey: null},
    		                    {id: "abCbRptDrilldown_panelFloor", restriction: null, currentKey: null},
    		                    {id: "abCbRptDrilldown_tabRoom", restriction: null, currentKey: null}
    		                    ],
    	
        this.abCbRptDrilldown_tabs.addEventListener('beforeTabChange', this.beforeTabChange);
    	this.abCbRptDrilldown_tabs.addEventListener('afterTabChange', this.afterTabChange);
    	
		this.setOthersTabRefreshObj('nothing', 1);
    	//forword first tab afterview load
		//after view load set datasource sql.
		var groupClause=this.getGroupClause('abCbRptDrilldown_tabCountry');
		View.panels.get("abCbRptDrilldown_panelCountry").addParameter('crosstable',this.getCrossTableSql(' 1=1 ',groupClause));
    	this.abCbRptDrilldown_tabs.selectTab('abCbRptDrilldown_tabCountry');
	},
	
	/**
	 * Rewrite parent method .
	 */
	afterTabChange: function(tabPanel,selectedTabName){
		mainController.objTabAndGridPanelId;
		var gridPanel=mainController.objTabAndGridPanelId[selectedTabName];
		mainController.doTabRefreshAndSetTitle(gridPanel, selectedTabName);
    },
	
    /**
     * Recover parent method ,make it do nothing
     */
    beforeTabChange: function(tabPanel,currentTabName,selectedTabName){
    	
    },
	
    /**
     * Refresh tab after tab changed by restriction (console, parent level ,etc)
     */
	doTabRefreshAndSetTitle:function(gridPanel, selectedTabName){
		   
		    var panel=View.panels.get(gridPanel);
		    var restriction = "";
		    
		    
		    var rmTabRes=this.getParentTabRestriction("abCbRptDrilldown_tabRoom");
			var roomAndConsoleRes="";
				if(this.consoleRestriction!=''&&this.consoleRestriction!=undefined){
					if(selectedTabName=='abCbRptDrilldown_tabEvents'){
						roomAndConsoleRes=this.getFinalRestriction(mainController.consoleRestrictionForEvent,rmTabRes);
					}else{
						roomAndConsoleRes=this.getFinalRestriction(mainController.consoleRestriction,rmTabRes);
					}
					
				}else{
					roomAndConsoleRes=this.getFinalRestriction('1=1', rmTabRes);
					
				}
		    
			if(selectedTabName=='abCbRptDrilldown_panelCountry'){
				
				panel.refresh(mainController.consoleRestriction);
				
			}else if(selectedTabName=='abCbRptDrilldown_tabRegulation'||selectedTabName=='abCbRptDrilldown_tabProgram'||selectedTabName=='abCbRptDrilldown_tabRequirement'){
				
				//refresh regulation tab
				if(selectedTabName=='abCbRptDrilldown_tabRegulation'){
					panel.addParameter('CONSOLE-RESTRICTION',roomAndConsoleRes);
					panel.addParameter('ACTIVITY-SUB-QUERY-RESTRICTION',mainController.activitySubQueryRes+" AND "+roomAndConsoleRes);

				}else if(selectedTabName=='abCbRptDrilldown_tabProgram'){
					if(this.currentRegulation!="1=1"){
						panel.addParameter('CONSOLE-RESTRICTION',roomAndConsoleRes+" AND regloc.regulation='"+this.currentRegulation+"'");
						panel.addParameter('ACTIVITY-SUB-QUERY-RESTRICTION',mainController.activitySubQueryRes+" AND activity_log.regulation='"+this.currentRegulation+"'" +" AND "+roomAndConsoleRes);
					}else{
						panel.addParameter('CONSOLE-RESTRICTION',roomAndConsoleRes);
						panel.addParameter('ACTIVITY-SUB-QUERY-RESTRICTION',mainController.activitySubQueryRes+" AND "+roomAndConsoleRes);
					
					}
					
				
				}else if(selectedTabName=='abCbRptDrilldown_tabRequirement'){
					
					var tempRes="";
					var activitySubQuery="";
					
					if(this.currentRegulation!="1=1"){
						
						tempRes=roomAndConsoleRes+" AND regloc.regulation='"+this.currentRegulation+"'";
						activitySubQuery=mainController.activitySubQueryRes+" AND activity_log.regulation='"+this.currentRegulation+"'";
						
						if(this.currentProgram!="1=1"){
							tempRes=tempRes+" AND  regloc.reg_program= '"+this.currentProgram+"'";
							activitySubQuery=activitySubQuery+" AND  activity_log.reg_program= '"+this.currentProgram+"'";
						}
						
					}else{
						
						tempRes=roomAndConsoleRes;
						activitySubQuery=mainController.activitySubQueryRes;
					}
					panel.addParameter('CONSOLE-RESTRICTION',tempRes);
					panel.addParameter('ACTIVITY-SUB-QUERY-RESTRICTION',activitySubQuery+" AND "+roomAndConsoleRes);
				}
				
				
				panel.refresh();
				
			}else if(selectedTabName=='abCbRptDrilldown_tabEvents'){
				
				var tempRes="1=1";
				
				if(this.currentRegulation!="1=1"){
					
					tempRes=" activity_log.regulation='"+this.currentRegulation+"'";
					
					if(this.currentProgram!="1=1"){
						tempRes=tempRes+" AND  activity_log.reg_program= '"+this.currentProgram+"'";
						
						if(this.currentRequirement!="1=1"){
							tempRes=tempRes+" AND  activity_log.reg_requirement= '"+this.currentRequirement+"'";
						}
					}
					
					
				}
				tempRes=tempRes+" AND "+roomAndConsoleRes;
				
				panel.addParameter('reglocRes',tempRes);
				panel.refresh();
				
			}else{
				 var parentTabRes=this.getParentTabRestriction(selectedTabName);
				if(this.consoleRestriction!=''&&this.consoleRestriction!=undefined){
					
					restriction=this.getFinalRestriction(mainController.consoleRestriction,parentTabRes);
					
				}else{
					restriction=this.getFinalRestriction('1=1', parentTabRes);
					
				}
				var groupClause=this.getGroupClause(selectedTabName);
				panel.addParameter('crosstable',this.getCrossTableSql(restriction,groupClause));
				panel.refresh();
			}
			this.setInstruction(panel,selectedTabName);
	},
	
	
	/**
	 * Get Group clause field 
	 */
	getGroupClause:function (selectedTabName){
		var arr=[];
		var groupWhereClause='';
		var groupBy='';
		if(selectedTabName=='abCbRptDrilldown_tabCountry'){
			groupWhereClause=" c.ctry_id  = compliance_locations.ctry_id ";
			groupBy="    compliance_locations.ctry_id ";
		}else if(selectedTabName=='abCbRptDrilldown_tabRegion'){
			groupWhereClause=" (c.ctry_id ${sql.concat} (CASE WHEN c.regn_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} c.regn_id )  = (compliance_locations.ctry_id ${sql.concat} (CASE WHEN compliance_locations.regn_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} compliance_locations.regn_id ) ";
			groupBy=" compliance_locations.ctry_id, compliance_locations.regn_id ";
		
		}else if(selectedTabName=='abCbRptDrilldown_tabState'){
			groupWhereClause=" (c.ctry_id ${sql.concat} (CASE WHEN c.state_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} c.state_id )=(compliance_locations.ctry_id ${sql.concat} (CASE WHEN compliance_locations.state_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} compliance_locations.state_id )";
			groupBy="  compliance_locations.ctry_id,  compliance_locations.state_id  ";
		
		}else if(selectedTabName=='abCbRptDrilldown_tabCity'){
			
			groupWhereClause=" ( c.ctry_id ${sql.concat} (CASE WHEN (c.state_id IS NOT NULL OR c.city_id IS NOT NULL) THEN ' / ' ELSE '' END) ${sql.concat} c.state_id  ${sql.concat} (CASE WHEN c.city_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} c.city_id ) = ( compliance_locations.ctry_id ${sql.concat} (CASE WHEN (compliance_locations.state_id IS NOT NULL OR compliance_locations.city_id IS NOT NULL) THEN ' / ' ELSE '' END) ${sql.concat} compliance_locations.state_id  ${sql.concat} (CASE WHEN compliance_locations.city_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} compliance_locations.city_id )";
			groupBy="   compliance_locations.ctry_id , compliance_locations.state_id , compliance_locations.city_id ";
		}else if(selectedTabName=='abCbRptDrilldown_tabSite'){
			groupWhereClause=" (c.ctry_id ${sql.concat} (CASE WHEN c.site_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} c.site_id )=(compliance_locations.ctry_id ${sql.concat} (CASE WHEN compliance_locations.site_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} compliance_locations.site_id ) ";
			groupBy="  compliance_locations.ctry_id , compliance_locations.site_id ";
			
		}else if(selectedTabName=='abCbRptDrilldown_tabBldg'){
			groupWhereClause=" ( c.ctry_id ${sql.concat} (CASE WHEN (c.site_id IS NOT NULL OR c.bl_id IS NOT NULL) THEN ' / ' ELSE '' END) ${sql.concat} c.site_id  ${sql.concat} (CASE WHEN c.bl_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} c.bl_id )=( compliance_locations.ctry_id ${sql.concat} (CASE WHEN (compliance_locations.site_id IS NOT NULL OR compliance_locations.bl_id IS NOT NULL) THEN ' / ' ELSE '' END) ${sql.concat} compliance_locations.site_id  ${sql.concat} (CASE WHEN compliance_locations.bl_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} compliance_locations.bl_id )";
			groupBy="   compliance_locations.ctry_id,compliance_locations.site_id ,compliance_locations.bl_id ";
		
		}else if(selectedTabName=='abCbRptDrilldown_tabFloor'){
			groupWhereClause=" (c.site_id ${sql.concat} (CASE WHEN (c.bl_id IS NOT NULL OR c.fl_id IS NOT NULL) THEN ' / ' ELSE '' END) ${sql.concat} c.bl_id  ${sql.concat} (CASE WHEN c.fl_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} c.fl_id   )=(compliance_locations.site_id ${sql.concat} (CASE WHEN (compliance_locations.bl_id IS NOT NULL OR compliance_locations.fl_id IS NOT NULL) THEN ' / ' ELSE '' END) ${sql.concat} compliance_locations.bl_id  ${sql.concat} (CASE WHEN compliance_locations.fl_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} compliance_locations.fl_id   ) ";
			groupBy="   compliance_locations.site_id ,compliance_locations.bl_id , compliance_locations.fl_id  ";
		
		}else if(selectedTabName=='abCbRptDrilldown_tabRoom'){
			groupWhereClause="( c.site_id ${sql.concat} (CASE WHEN (c.bl_id IS NOT NULL OR c.fl_id IS NOT NULL OR c.rm_id IS NOT NULL) THEN ' / ' ELSE '' END) ${sql.concat} c.bl_id  ${sql.concat} (CASE WHEN (c.fl_id IS NOT NULL OR c.rm_id IS NOT NULL) THEN ' / ' ELSE '' END) ${sql.concat} c.fl_id  ${sql.concat} (CASE WHEN c.rm_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} c.rm_id  )=( compliance_locations.site_id ${sql.concat} (CASE WHEN (compliance_locations.bl_id IS NOT NULL OR compliance_locations.fl_id IS NOT NULL OR compliance_locations.rm_id IS NOT NULL) THEN ' / ' ELSE '' END) ${sql.concat} compliance_locations.bl_id  ${sql.concat} (CASE WHEN (compliance_locations.fl_id IS NOT NULL OR compliance_locations.rm_id IS NOT NULL) THEN ' / ' ELSE '' END) ${sql.concat} compliance_locations.fl_id  ${sql.concat} (CASE WHEN compliance_locations.rm_id IS NOT NULL THEN ' / ' ELSE '' END) ${sql.concat} compliance_locations.rm_id  )";
			groupBy="    compliance_locations.site_id , compliance_locations.bl_id  , compliance_locations.fl_id   ,compliance_locations.rm_id ";
		}
		arr[0]=groupWhereClause;
		arr[1]=groupBy;
		return arr;
	},

	/**
	 * Set instruction for last three tabs
	 */
	setInstruction:function(panel,currentTab){
		var instruction="";
		
		var labels = "";
		if(currentTab=='abCbRptDrilldown_tabRegulation'||currentTab=='abCbRptDrilldown_tabProgram'||currentTab=='abCbRptDrilldown_tabRequirement'||currentTab=='abCbRptDrilldown_tabEvents'){
			instruction=this.setInstructionsElement('abCbRptDrilldown_tabRoom');
		}else{
			instruction=this.setInstructionsElement(currentTab);
		}
		
		for (var i = 0; i < instruction.length; i++) {
	        var field = instruction[i];
	        labels += field.title + ": " + field.value + "; ";
	    }
		
		
		if(currentTab=='abCbRptDrilldown_tabProgram'||currentTab=='abCbRptDrilldown_tabRequirement'||currentTab=='abCbRptDrilldown_tabEvents'){
			
			if(currentTab=='abCbRptDrilldown_tabProgram'){
				this.currentProgram="1=1";
				this.currentRequirement="1=1";
			}else if(currentTab=='abCbRptDrilldown_tabRequirement'){
				this.currentRequirement="1=1";
			}
			
			if(this.currentRequirement!='1=1'){
				panel.setInstructions(labels+" "+getMessage('requirementInstruction') +" "+this.currentRequirement);
			}else if(this.currentProgram!='1=1'){
				panel.setInstructions(labels+" "+getMessage('programInstruction') +" "+this.currentProgram);
			}else if(this.currentRegulation!='1=1'){
				panel.setInstructions(labels+" "+getMessage('regulationInstruction') +" "+this.currentRegulation);
			}else{
				panel.setInstructions(labels);
			}
			
		}else{
			this.currentRegulation="1=1";
			this.currentProgram="1=1";
			this.currentRequirement="1=1";
			
		    panel.setInstructions(labels);
		}
		
	},
	
	/**
	 * Get part sql for location cross table table .
	 * We need replace ACTIVITY-SUB-QUERY-RESTRICTION,DOC-SUB-QUERY-RESTRICTION,REGVIOLATION-SUB-QUERY-RESTRICTION,CONSOLE-RESTRICTION
	 */
	getCrossTableSql:function(restriction,groupClause){

		var crosstable=' count( distinct (CASE  WHEN regloc.regulation is not null THEN   regloc.regulation  ELSE  NULL  END))  ${sql.as}  regulation,'
				        + ' count(distinct (case when regloc.reg_program is not null then regloc.regulation  ${sql.concat} regloc.reg_program else null end ))  ${sql.as}  reg_program,'
				        + ' count( distinct ( case when regloc.reg_program is not null and regloc.reg_requirement is not null then  regloc.regulation  ${sql.concat} regloc.reg_program  ${sql.concat} regloc.reg_requirement else null end ))  ${sql.as}  reg_requirement,'
				        
				        +'  (SELECT COUNT(activity_log.activity_log_id)'
				        +'       FROM activity_log '
				        +'   LEFT OUTER JOIN compliance_locations c ON activity_log.location_id = c.location_id   '
				        +'  LEFT OUTER JOIN regulation ON activity_log.regulation = regulation.regulation   '
				        +'	LEFT OUTER JOIN regprogram ON activity_log.regulation = regprogram.regulation   '
				        +'								AND activity_log.reg_program = regprogram.reg_program   '
				       
				        +'   LEFT OUTER JOIN regrequirement ON activity_log.regulation =   regrequirement.regulation   '
				        +'                                 AND activity_log.reg_program =   regrequirement.reg_program   '
				        +'                                 AND activity_log.reg_requirement = regrequirement.reg_requirement  '
		
				        +'     WHERE GROUP-CLAUSE AND  ACTIVITY-SUB-QUERY-RESTRICTION'
				        +'        AND activity_log.activity_type=\'COMPLIANCE - EVENT\' '
				        +'                              AND ${sql.daysBeforeCurrentDate(\'activity_log.date_scheduled\')}  >-365'
				        +'                              AND  activity_log.date_scheduled >= ${sql.currentDate}  '
				        +'                              AND activity_log.status not in(\'COMPLETED\',\'COMPLETED-V\', \'CLOSED\', \'CANCELLED\')   '
				                   
				        +'           )  ${sql.as}  comp_level, '
				        +' ((SELECT COUNT(docs_assigned.doc_id) FROM docs_assigned  '
				        +'   LEFT OUTER JOIN compliance_locations c ON docs_assigned.location_id = c.location_id   '
				        +'  LEFT OUTER JOIN regulation ON docs_assigned.regulation = regulation.regulation   '
				        +'	LEFT OUTER JOIN regprogram ON docs_assigned.regulation = regprogram.regulation   '
				        +'	AND docs_assigned.reg_program = regprogram.reg_program   '
				       
				        +'   LEFT OUTER JOIN regrequirement ON docs_assigned.regulation =   regrequirement.regulation   '
				        +'                                 AND docs_assigned.reg_program =   regrequirement.reg_program   '
				        +'                                 AND docs_assigned.reg_requirement = regrequirement.reg_requirement  '
				        +'  WHERE  GROUP-CLAUSE AND DOC-SUB-QUERY-RESTRICTION))  ${sql.as}  resp_person, '
				        
				        +' ((SELECT COUNT(regviolation.violation_num) FROM regviolation '
				        +'   LEFT OUTER JOIN compliance_locations  c ON regviolation.location_id = c.location_id   '
				        +'  LEFT OUTER JOIN regulation ON regviolation.regulation = regulation.regulation   '
				        +'	LEFT OUTER JOIN regprogram ON regviolation.regulation = regprogram.regulation   '
				        +'	AND regviolation.reg_program = regprogram.reg_program   '
				       
				        +'   LEFT OUTER JOIN regrequirement ON regviolation.regulation =   regrequirement.regulation   '
				        +'                                 AND regviolation.reg_program =   regrequirement.reg_program   '
				        +'                                 AND regviolation.reg_requirement = regrequirement.reg_requirement  '
		
				        +' WHERE   GROUP-CLAUSE AND REGVIOLATION-SUB-QUERY-RESTRICTION))  ${sql.as}  vn_id  '
				              
				        + ' FROM regloc   '
				        + '   LEFT OUTER JOIN regprogram ON regloc.regulation = regprogram.regulation   '
				        + '                         AND regloc.reg_program = regprogram.reg_program   '
				        + '   LEFT OUTER JOIN compliance_locations ON regloc.location_id = compliance_locations.location_id   '
					    + '   LEFT OUTER JOIN regulation ON regloc.regulation = regulation.regulation   '
					    + '   LEFT OUTER JOIN regrequirement ON regloc.regulation =   regrequirement.regulation   '
					    + '                                 AND regloc.reg_program =   regrequirement.reg_program   '
					    + '                                AND regloc.reg_requirement = regrequirement.reg_requirement   '
					    + '                                WHERE  CONSOLE-RESTRICTION '
					    + ' GROUP BY GROUP-BY' ;
					   
					  
		
		
		crosstable = crosstable.replace(/CONSOLE-RESTRICTION/g,restriction);
		
		crosstable = crosstable.replace(/GROUP-CLAUSE/g, groupClause[0]);
		crosstable = crosstable.replace(/GROUP-BY/g, groupClause[1]);
		
		crosstable = crosstable.replace(/ACTIVITY-SUB-QUERY-RESTRICTION/g, mainController.activitySubQueryRes.replace(/compliance_locations/g,"c") );
		crosstable = crosstable.replace(/DOC-SUB-QUERY-RESTRICTION/g,mainController.assignDocSubQueryRes.replace(/compliance_locations/g,"c"));
		crosstable = crosstable.replace(/REGVIOLATION-SUB-QUERY-RESTRICTION/g,mainController.regviolationSubQueryRes.replace(/compliance_locations/g,"c"));
		return crosstable;
	},
	
	
	/**
	 * Get parent tab restriction which is saved after we click crosstable or grid record.
	 */
	getParentTabRestriction:function(selectedTabName){
	
		var parentTabRes=new Ab.view.Restriction();
		
		if(selectedTabName=='abCbRptDrilldown_tabCountry'){
		}else if(selectedTabName=='abCbRptDrilldown_tabRegion'){
			parentTabRes=this.objRestrictions[1].restriction;
		}else if(selectedTabName=='abCbRptDrilldown_tabState'){
			parentTabRes=this.objRestrictions[2].restriction;
		}else if(selectedTabName=='abCbRptDrilldown_tabCity'){
			parentTabRes=this.objRestrictions[3].restriction;
		}else if(selectedTabName=='abCbRptDrilldown_tabSite'){
			parentTabRes=this.objRestrictions[4].restriction;
		}else if(selectedTabName=='abCbRptDrilldown_tabBldg'){
			parentTabRes=this.objRestrictions[5].restriction;
		}else if(selectedTabName=='abCbRptDrilldown_tabFloor'){
			parentTabRes=this.objRestrictions[6].restriction;
		}else if(selectedTabName=='abCbRptDrilldown_tabRoom'){
			parentTabRes=this.objRestrictions[7].restriction;
		}
		return parentTabRes;
	},
	
	/**
	 * Shows the report grid according to the user restrictions
	 */
	refreshFromConsole: function(){
		this.setOthersTabRefreshObj('nothing', 1);
		//for console
		
		//Generate restriction from console for tree and center tabs except regulation,regprogram,requirement.
		this.consoleRestriction = generateConsoleRestriction();
		this.consoleRestrictionForEvent = generateConsoleRestriction('event');
		
		this.activitySubQueryRes = getActivitySubQuery();
		this.assignDocSubQueryRes = getAssignDocSubQuery();
		this.regviolationSubQueryRes = getRegviolationSubQuery();

		var groupClause=this.getGroupClause('abCbRptDrilldown_tabCountry');
		View.panels.get("abCbRptDrilldown_panelCountry").addParameter('crosstable',this.getCrossTableSql(mainController.consoleRestriction,groupClause));
		View.panels.get("abCbRptDrilldown_panelCountry").refresh();
		this.abCbRptDrilldown_tabs.selectTab(this.abCbRptDrilldown_tabs.tabs[0].name);
	},

	/**
	 * On click event
	 * @param {Object} commandObject The clicked line command
	 * @param {Object} tabIndex
	 */
	onClickItem: function(commandObject, tabIndex) {

		var selectedPanelRestr = new Ab.view.Restriction();
		if(this.objRestrictions[tabIndex].restriction){
			selectedPanelRestr.addClauses(this.objRestrictions[tabIndex].restriction);
		}
		
		for (var i = (tabIndex + 1); i < this.objRestrictions.length; i++) {
			var objRestrictions = this.objRestrictions[i];

			// set the restriction of the clicked panel
			objRestrictions.restriction = new Ab.view.Restriction();
			objRestrictions.restriction.addClauses(selectedPanelRestr);

			// build the restriction according to user's click in a row
			if(commandObject.restriction.clauses.length > 0){
				var splitRestriction = this.getCmdObjRestriction(commandObject.restriction);
				objRestrictions.restriction.addClauses(splitRestriction);
			}
			
			
			this.setTabRefreshObj(this.abCbRptDrilldown_tabs.tabs[i].name,1);
			
		}
		
		
		// select the next tab
		this.abCbRptDrilldown_tabs.selectTab(this.abCbRptDrilldown_tabs.tabs[tabIndex + 1].name);
	},

	/**
	 * Gets the instructions object from the filter controller
	 * and merge it with the restriction of the given panel,
	 * into a new instructions element for the given panel
	 */
	setInstructionsElement: function(currentTab){
		var instructions = [];
		var panelRestriction = this.getParentTabRestriction(currentTab);
		if (panelRestriction) {
			for (var i = 0; i < panelRestriction.clauses.length; i++) {
				var clause = panelRestriction.clauses[i];
				
				// remove the potential existent instruction
				for (var j = 0; j < instructions.length; j++) {
					if(instructions[j].field == clause.name){
						instructions.splice(j,1);
						break;
					}
				}
				
				instructions.push({field: clause.name, title: this.getFieldTitle(clause.name), value: clause.value});
			}
		}
		return instructions;
		
	},
	

	
	getFieldTitle: function(fieldName){
		switch (fieldName) {
		case "compliance_locations.ctry_id":
			return getMessage("title_country");
			break;

		case "compliance_locations.regn_id":
			return getMessage("title_region");
			break;

		case "compliance_locations.state_id":
			return getMessage("title_state");
			break;

		case "compliance_locations.city_id":
			return getMessage("title_city");
			break;

		case "compliance_locations.site_id":
			return getMessage("title_site");
			break;

		case "compliance_locations.bl_id":
			return getMessage("title_bldg");
			break;

		case "compliance_locations.fl_id":
			return getMessage("title_floor");
			break;

		case "compliance_locations.rm_id":
			return getMessage("title_room");
			break;

		default:
			return "";
			break;
		}
	},
	
	/**
	 * Builds the final restriction: (projects selection + console) + click in a crossTable row
	 */
	getFinalRestriction: function(restriction, clickRestriction){
		var finalRestr = restriction;
		
		if(clickRestriction){
			for ( var i = 0; i < clickRestriction.clauses.length; i++) {
				var clause = clickRestriction.clauses[i];
				if(clause.op === "IS NULL") {
					finalRestr += " AND " + clause.name + " " + clause.op;
				} else {
					finalRestr += " AND " + clause.name + " = " + "'" + clause.value + "'";
				}
			}
		}
		
		return finalRestr;
	},
	
	/**
	 * Returns a Restriction object from the given restriction,
	 * with the composed clauses split into simple clauses
	 * (ex: site + bl clause split into site clause and bl clause)
	 */
	getCmdObjRestriction: function(srcRestr){
		var destRestr = new Ab.view.Restriction();
		
		for(var i=0; i<srcRestr.clauses.length; i++){
			var clause = srcRestr.clauses[i];
			switch (clause.name) {
			case 'regloc.ctry_id':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // ctry_id
					destRestr.addClause('compliance_locations.ctry_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.ctry_id', "", "IS NULL", 'AND', true);
				}
			
				break;
				
			case 'regloc.vf_ctry_regn':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // ctry_id
					destRestr.addClause('compliance_locations.ctry_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.ctry_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // regn_id
					destRestr.addClause('compliance_locations.regn_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.regn_id', "", "IS NULL", 'AND', true);
				}
				break;

			case 'regloc.vf_ctry_state':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // ctry_id
					destRestr.addClause('compliance_locations.ctry_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.ctry_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // state_id
					destRestr.addClause('compliance_locations.state_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.state_id', "", "IS NULL", 'AND', true);
				}
				break;

			case 'regloc.vf_ctry_state_city':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // ctry_id
					destRestr.addClause('compliance_locations.ctry_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.ctry_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // state_id
					destRestr.addClause('compliance_locations.state_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.state_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[2])){ // city_id
					destRestr.addClause('compliance_locations.city_id', splitValue[2], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.city_id', "", "IS NULL", 'AND', true);
				}
				break;

			case 'regloc.vf_ctry_site':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // ctry_id
					destRestr.addClause('compliance_locations.ctry_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.ctry_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // site_id
					destRestr.addClause('compliance_locations.site_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.site_id', "", "IS NULL", 'AND', true);
				}
				break;

			case 'regloc.vf_ctry_site_bldg':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // ctry_id
					destRestr.addClause('compliance_locations.ctry_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.ctry_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // site_id
					destRestr.addClause('compliance_locations.site_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.site_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[2])){ // bl_id
					destRestr.addClause('compliance_locations.bl_id', splitValue[2], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.bl_id', "", "IS NULL", 'AND', true);
				}
				break;

			case 'regloc.vf_site_bldg_floor':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // site_id
					destRestr.addClause('compliance_locations.site_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.site_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // bl_id
					destRestr.addClause('compliance_locations.bl_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.bl_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[2])){ // fl_id
					destRestr.addClause('compliance_locations.fl_id', splitValue[2], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.fl_id', "", "IS NULL", 'AND', true);
				}
				break;

			case 'regloc.vf_site_bldg_floor_room':
				var splitValue = clause.value.split(" / ");
				if(valueExistsNotEmpty(splitValue[0])){ // site_id
					destRestr.addClause('compliance_locations.site_id', splitValue[0], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.site_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[1])){ // bl_id
					destRestr.addClause('compliance_locations.bl_id', splitValue[1], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.bl_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[2])){ // fl_id
					destRestr.addClause('compliance_locations.fl_id', splitValue[2], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.fl_id', "", "IS NULL", 'AND', true);
				}
				if(valueExistsNotEmpty(splitValue[3])){ // rm_id
					destRestr.addClause('compliance_locations.rm_id', splitValue[3], '=', 'AND', true);
				} else {
					destRestr.addClause('compliance_locations.rm_id', "", "IS NULL", 'AND', true);
				}
				break;
				
			default:
				destRestr.addClause(clause.name, clause.value, valueExistsNotEmpty(clause.value) ? clause.op : "IS NULL", clause.relop, true);
				break;
			}
		}
		
		return destRestr;
	},
	
	/**
	 * POP-UP when we click regulation row button
	 */
	abCbRptDrilldown_panelRegulation_onViewRegulations: function(row){
		
		var record = row.getRecord();
		var regulation = record.getValue("regloc.regulation");
		
		var restriction = {
			'regulation.regulation': regulation
		};
		Ab.view.View.openDialog('ab-comp-rpt-regulation-form.axvw', restriction, false, 0, 0, 700, 400);  
	},


	/**
	 * POP-UP when we click program row button
	 */
	abCbRptDrilldown_panelProgram_onViewPrograms: function(row){
		
		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var regulation = record.getValue("regloc.regulation");
		var reg_program = record.getValue("regloc.reg_program");
		var restriction = {
			'regprogram.regulation': regulation,
			'regprogram.reg_program': reg_program
		};
		Ab.view.View.openDialog('ab-comp-rpt-program-form.axvw', restriction, false, 0, 0, 800, 400);  
	},
	

	/**
	 * POP-UP when we click requirement row button
	 */
	abCbRptDrilldown_panelRequirement_onViewRequirements: function(row){
		
		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var regulation = record.getValue("regloc.regulation");
		var reg_program = record.getValue("regloc.reg_program");
		var reg_requirement = record.getValue("regloc.reg_requirement");
		var restriction = {
			'regrequirement.regulation': regulation,
			'regrequirement.reg_program': reg_program,
			'regrequirement.reg_requirement': reg_requirement
		};
		Ab.view.View.openDialog('ab-comp-rpt-requirement-form.axvw', restriction, false, 0, 0, 1100, 500);  
	}
});



/**
 * When we click control link on row 
 * @param panel
 * @param nextPanel
 * @param nexttabindex
 * @param field
 * @param toField
 * @returns
 */
function nextTab(panel,currentTabIndex){
	
    var grid = View.panels.get(panel);
    var selectedRow = grid.rows[grid.selectedRowIndex];
    
    var regulation="";
    var reg_program="";
    var reg_requirement="";
    
    if(currentTabIndex==8){
    	regulation = selectedRow['regloc.regulation'];
    	if(valueExistsNotEmpty(regulation)){
    		mainController.currentRegulation=regulation;
    	}
    	
    }
    else if(currentTabIndex==9){
    	
    	regulation = selectedRow['regloc.regulation'];
    	reg_program = selectedRow['regloc.reg_program'];
    	if(valueExistsNotEmpty(regulation)){
    		mainController.currentRegulation=regulation;
    	}
    	if(valueExistsNotEmpty(reg_program)){
    		mainController.currentProgram=reg_program;
    	}
    	
    	
    }else if(currentTabIndex==10){
	
    	regulation = selectedRow['regloc.regulation'];
    	reg_program = selectedRow['regloc.reg_program'];
    	reg_requirement = selectedRow['regloc.reg_requirement'];
    	
    	if(valueExistsNotEmpty(regulation)){
    		mainController.currentRegulation=regulation;
    	}
    	if(valueExistsNotEmpty(reg_program)){
    		mainController.currentProgram=reg_program;
    	}
    	if(valueExistsNotEmpty(reg_requirement)){
    		mainController.currentRequirement=reg_requirement;
    	}
    	
    }
    
 
    mainController.abCbRptDrilldown_tabs.selectTab(mainController.abCbRptDrilldown_tabs.tabs[currentTabIndex + 1].name);
   
}

/**
* Generate restriction from console for tree and center tabs except
*/
function generateConsoleRestriction(fortab){
	
	var res=getConsoleResWithoutLocation(fortab);
	//from visual field location restriction
	if(View.locationRestriction!=''&&View.locationRestriction!=undefined){
		res=" 1=1 "+View.locationRestriction+" AND "+res;
	}

	
	return res;
}

/**
 * Generate activitysub restriction
 * @returns
 */
function getActivitySubQuery(){
		 
	return generateConsoleRestriction('event');
}

/**
 * Generate regviolation restriction
 * @returns
 */
function getRegviolationSubQuery(){
		 
	return generateConsoleRestriction('regviolation');
}

/** 
 * Generate assign doc restriction
 * @returns
 */
function getAssignDocSubQuery(){
		 
	return generateConsoleRestriction('assigndoc');
}

/**
 * Generate console restriction without location.
 * @param fortab
 * @returns {String}
 */
function getConsoleResWithoutLocation(fortab){
	
	var param=controllerConsole.parameters;
	
//   Compliance by Location Drilldown (ab-comp-rpt-regloc-drilldown.axvw)
//	1. In all tabs except Events, Apply filter to regloc table, LEFT JOIN to regulation, regprogram, regrequirement, compliance_locations.  This is the same for all tabs except Events, only difference is group by the location level, regulation, program PK, or requirement PK, respectively in each tab.
//
//	   Responsible Person, Vendor Code: WHERE regloc.field IN (list)  OR regprogram.field IN (list) OR regrequirement.field IN (list)
//	Compliance Level:  WHERE ISNULL(regloc.comp_level, regloc.comp_level_calc) IN (list)  OR ISNULL(regprogram.comp_level,regprogram.comp_level_calc) IN (list) OR ISNULL(regrequirement.comp_level, regrequirement.comp_level_calc) IN (list) 
//
//	2. For Events tab, apply filter to activity_log (activity_type=’COMPLIANCE_EVENT?, LEFT JOIN to regulation, regprogram, regrequirement, compliance_locations.
//	Responsible Person, Vendor Code: WHERE activity_log.field IN (list)  OR regprogram.field IN (list) OR regrequirement.field IN (list)
//	Compliance Level:  WHERE ISNULL(regprogram.comp_level,regprogram.comp_level_calc) IN (list) OR ISNULL(regrequirement.comp_level, regrequirement.comp_level_calc) IN (list) 
//
//	3.  In the location related tab, there are number calculation for Regulations, Programs, Requirements, Events, Violations, Documents. The filters should apply to these columns.
	
	var compLevelForRes="";
	var respPersonRes="";
	var vnRes="";
	if(fortab=="event"){
		 
		 compLevelForRes=" (( "+param.programLevelNotNull+ " ) or ( "+param.requireLevelNotNull+ " ))";

		//response person
		 respPersonRes=" (( "+param.respPersonForProgram+ " ) or ( "+param.respPersonForRequire+ " ) or ( "+param.respPersonForActivityLog+" ))";
		
		//for vn
		 vnRes="( ( "+param.vnForProgram+ " ) or ( " + param.vnForRequire + " ) or ( " + param.vnForActivityLog + " ) )";
	}else if(fortab=="regviolation"||fortab=="assigndoc"){
		 	compLevelForRes=" (( "+param.programLevelNotNull+ " ) or ( "+param.requireLevelNotNull+ " ))";

			//response person
			 respPersonRes=" (( "+param.respPersonForProgram+ " ) or ( "+param.respPersonForRequire+ " ))";
			
			//for vn
			 vnRes="( ( "+param.vnForProgram+ " ) or ( " + param.vnForRequire + " ) )";

	}else {
		 compLevelForRes=" (( "+param.programLevelNotNull+ " ) or ( "+param.requireLevelNotNull+ " ) or ( "+param.locLevelNotNull+" ))";
			
			//response person
			 respPersonRes=" (( "+param.respPersonForProgram+ " ) or ( "+param.respPersonForRequire+ " ) or ( "+param.respPersonForRegLoc+" ))";
			
			//for vn
			 vnRes="( ( "+param.vnForProgram+ " ) or ( " + param.vnForRequire + " ) or ( " + param.vnForRegLoc + " ) )";

	}
	
	var orRes=" 1=1 ";
		
	if(respPersonRes.indexOf('AND')!=-1){
		orRes=orRes+ " AND "+respPersonRes;
	}
	
	if(vnRes.indexOf('AND')!=-1){
		orRes=orRes+ " AND "+vnRes;
	}
	if(compLevelForRes.indexOf('AND')!=-1){
		orRes=orRes+ " AND "+compLevelForRes;
	}
	var res=param.regulationRes+" AND " +param.regprogramRes +" AND "+param.regRequirementResOnlyForComplianceByLocRes+" AND  ( "+orRes+")";
	return res;
}


