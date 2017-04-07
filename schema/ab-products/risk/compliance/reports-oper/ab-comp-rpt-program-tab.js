
var abReportProgramController = View.createController('abReportProgramController', {
	
	afterInitialDataFetch: function(){
		
		//if this view is used as part of the program map view, remove the select button
		var openerView = View.getOpenerView();
		if(openerView&& openerView.usedInMapView){
		}	
		//change back to get 'common controller'.
		commonRptController = View.getOpenerView().controllers.get(0);
		
		//if this view is opened as popup, get the restriction from parent view and refresh the grid
		var openerView = View.getOpenerView().getOpenerView();
		//for default datasource.
		var query=this.getQuerySqlForPopUp();
		
		this.abCompSelectProgram.addParameter('query', query);
		if(openerView.popUpRestriction){
			this.abCompSelectProgram.addParameter('programRes', openerView.popUpRestriction);
		
			
		}else if(openerView.whichView){
			this.abCompSelectProgram.actions.get('doc').show(false);
			//for count program and requirement tasks.
			if(openerView.whichView&&(openerView.whichView=='countprogrambylevelandloc'||openerView.whichView=='countprogrambyregulationandloc'||openerView.whichView=='countregulationbylocandrank'||openerView.whichView=='countprogramwithoutlocation')){
				query=this.getQuerySqlForPopUp(openerView,openerView.whichView);
				this.abCompSelectProgram.addParameter('query',query);
			}else{
				this.abCompSelectProgram.addParameter('programRes', openerView.popUpRestrictionForProgram);
			}
		}
		
		if(commonRptController.sbfDetailTabs.findTab("regulation")==null){
			if(commonRptController.sbfDetailTabs.findTab("comprogram")!=null){
				
				this.abCompSelectProgram.refresh();

				//set grid title by default.
				this.abCompSelectProgram.setTitle(getMessage("gridTitle"));
			}
		}

		// Modified for 22.1 Compliance and Building Operations Integration: put current controller to the console controller array
		if (typeof controllerConsole != "undefined") {
			controllerConsole.controllers.push(abReportProgramController);
	    }

	},
	
	/**
	 * Generate custom datasource for popup from chart .
	 */
	getQuerySqlForPopUp:function(openerView,whichView){
		var query='';
		if(whichView&&(whichView=='countprogrambylevelandloc'||whichView=='countprogrambyregulationandloc')){
			
			  query = ' SELECT distinct regulation, reg_program,  ctry_id,state_id,regn_id1 ,city_id1 ,county_id,site_id,pr_id,bl_id, ' 
				  + '  status,	priority,em_id,'
				  +	' regprog_cat,regprog_type,date_start,date_end, '		
				  + '  vn_id,criteria_type,hold_reason, project_id,contact_id,'		
					
				  +  '(CASE WHEN progloc_lvl IS NOT NULL THEN progloc_lvl  '
				  +  ' WHEN reqloc_avg_lvl_loc IS NOT NULL THEN reqloc_avg_lvl_loc '
				  +  ' WHEN prog_lvl IS NOT NULL THEN prog_lvl '
				  +  ' WHEN prog_lvl_calc IS NOT NULL THEN prog_lvl_calc   '
				  +  ' ELSE  \'Not Entered\' END '
				  +  ') as comp_level ,'
				  +  ' level_number '
				  +  'FROM  '

				  +  '(SELECT regulation, reg_program, '
				  
				  + '  status,	priority,em_id,'
				  +	' regprog_cat,regprog_type,date_start,date_end, '		
				  + '  vn_id,criteria_type,hold_reason, project_id,contact_id,'		
					
						
				  +  ' regcomplevel.level_number level_number, ctry_id,state_id,regn_id1 ,city_id1 ,county_id,site_id,pr_id,bl_id, '
				  +  ' prog_lvl, prog_lvl_calc, progloc_lvl, reqloc_avg_lvlnum_loc, regcomplevel.comp_level AS reqloc_avg_lvl_loc '
				  +  ' FROM '

				  +  '(SELECT regloc.regulation AS regulation, regloc.reg_program AS reg_program, '
				  
				  +  ' regprogram.status AS status,regprogram.priority AS priority,regprogram.em_id AS em_id,'
				  +	' regprogram.regprog_cat AS regprog_cat,regprogram.regprog_type AS regprog_type,regprogram.date_start AS date_start,regprogram.date_end AS date_end, '		
				  + ' regprogram.vn_id AS vn_id,regprogram.criteria_type AS criteria_type, regprogram.summary AS hold_reason, regprogram.project_id AS project_id,regprogram.contact_id  AS contact_id,'		
					
				  +  'ctry_id,state_id, (ctry_id${sql.concat}\'-\'${sql.concat}regn_id)regn_id1,(state_id${sql.concat}\'-\'${sql.concat}city_id)city_id1 ,county_id,site_id,pr_id,bl_id,   '
				  +  '		regprogram.comp_level AS prog_lvl,regprogram.comp_level_calc AS prog_lvl_calc, '
				  +  '		(CASE WHEN regloc.reg_requirement IS NULL THEN regloc.comp_level ELSE NULL END) AS progloc_lvl, '
				  +  ' 		AVG(CASE WHEN regloc.reg_requirement IS NOT NULL THEN level_number ELSE NULL END) AS reqloc_avg_lvlnum_loc '
				  +  'FROM regloc LEFT JOIN regulation ON regloc.regulation=regulation.regulation LEFT JOIN regprogram ON regloc.regulation=regprogram.regulation AND  regloc.reg_program =regprogram.reg_program '
				  +  '		LEFT JOIN regrequirement ON regloc.regulation= regrequirement.regulation AND  regloc.reg_program = regrequirement.reg_program  '
				  +  '			AND  regloc.reg_requirement = regrequirement.reg_requirement '
				  +  ' 			LEFT JOIN regcomplevel ON regloc.comp_level=regcomplevel.comp_level '
				  +  ' 			LEFT JOIN compliance_locations ON regloc.location_id= compliance_locations.location_id '
		  		  +  ' WHERE CONSOLE-AND-PARANET-RESTRICTION AND  regloc.reg_program IS NOT NULL '
				  +  ' GROUP BY regloc.regulation, regloc.reg_program,  ctry_id,state_id,regn_id,city_id,(ctry_id${sql.concat}\'-\'${sql.concat}regn_id),(state_id${sql.concat}\'-\'${sql.concat}city_id),county_id,site_id,pr_id,bl_id, regprogram.comp_level, regprogram.comp_level_calc, '
				 
				  +  '	regprogram.status,	regprogram.priority,regprogram.em_id,'
				  +	 '	regprogram.regprog_cat,regprogram.regprog_type,regprogram.date_start,regprogram.date_end, '		
				  +  '	regprogram.vn_id,regprogram.criteria_type,regprogram.summary, regprogram.project_id,regprogram.contact_id,'		
					
				  +  ' 	(CASE WHEN regloc.reg_requirement IS NULL THEN regloc.comp_level ELSE NULL END)  '
				  
				  +  '	) tbl1 LEFT JOIN regcomplevel ON regcomplevel.level_number=ROUND(tbl1.reqloc_avg_lvlnum_loc,0) '
				  +  ' ) tbl2 '	  
			 +' where'
			 +'  COMPLIACNE-LEVEL-RESTRICTION '; 
			  query = query.replace(/CONSOLE-AND-PARANET-RESTRICTION/g, openerView.popUpRestrictionForConsoleAndParent);
			  query = query.replace(/COMPLIACNE-LEVEL-RESTRICTION/g, openerView.popUpRestrictionForLevel);
			  
		}else 
			if(whichView&&whichView=='countregulationbylocandrank'){
				
				 query = ' select distinct '

					 	+ 'regloc.regulation AS regulation, regloc.reg_program AS reg_program, regprogram.comp_level AS comp_level,'
					  
					 	+ ' regprogram.status AS status,regprogram.priority AS priority,regprogram.em_id AS em_id,'
						+ ' regprogram.regprog_cat AS regprog_cat,regprogram.regprog_type AS regprog_type,regprogram.date_start AS date_start,regprogram.date_end AS date_end, '		
						+ ' regprogram.vn_id AS vn_id,regprogram.criteria_type AS criteria_type, regprogram.summary AS hold_reason,'
						+ 'regprogram.project_id AS project_id,regprogram.contact_id  AS contact_id'		
						
						+ ' from regloc '
						+ '         left join compliance_locations on compliance_locations.location_id = regloc.location_id'
						+ '         left join regulation on regulation.regulation = regloc.regulation'
						+ '         left join regprogram on regprogram.reg_program = regloc.reg_program and regprogram.regulation = regloc.regulation'
						+ '         left join regrequirement on regrequirement.reg_program = regloc.reg_program and regrequirement.regulation = regloc.regulation and regrequirement.reg_requirement = regloc.reg_requirement'
						+'  WHERE regloc.reg_program IS NOT NULL  AND '
				  		+'  CONSOLE-AND-PARANET-RESTRICTION ';
			  	  query = query.replace(/CONSOLE-AND-PARANET-RESTRICTION/g, openerView.popUpRestrictionForConsoleAndParent);
				  
		}else if(whichView&&whichView=='countprogramwithoutlocation'){
			
			
					query=	 ' SELECT '
						+'	regprogram.regulation,'
						+'	regprogram.reg_program,'
						+'	(${sql.isNull(\'(case when regprogram.comp_level IS NULL THEN regprogram.comp_level_calc ELSE regprogram.comp_level END)\', "\'Not Entered\'")} ) comp_level,'
						+'	regprogram.status,'
						+'	regprogram.priority,'
						+'	regprogram.em_id,'
						+'	regprogram.regprog_cat,'
						+'	regprogram.regprog_type,'
						+'	regprogram.date_start,'
						+'	regprogram.date_end,'
						+'	regprogram.vn_id,'
						+'	regprogram.criteria_type,'
						+'	regprogram.summary AS hold_reason,'
						+'	regprogram.project_id,'
						+'	regprogram.contact_id'
						+'	FROM regprogram left join regulation ON regprogram.regulation=regulation.regulation '
						+'	left outer join regcomplevel on regcomplevel.comp_level = regprogram.comp_level'
						+'  WHERE  CONSOLE-AND-PARANET-RESTRICTION ';
					
					 query = query.replace(/CONSOLE-AND-PARANET-RESTRICTION/g, openerView.popUpRestrictionForProgram);
					
			
			}else{
			query=	 ' SELECT '
				+'	regprogram.regulation,'
				+'	regprogram.reg_program,'
				+'	regprogram.comp_level,'
				+'	regprogram.status,'
				+'	regprogram.priority,'
				+'	regprogram.em_id,'
				+'	regprogram.regprog_cat,'
				+'	regprogram.regprog_type,'
				+'	regprogram.date_start,'
				+'	regprogram.date_end,'
				+'	regprogram.vn_id,'
				+'	regprogram.criteria_type,'
				+'	regprogram.summary AS hold_reason,'
				+'	regprogram.project_id,'
				+'	regprogram.contact_id'
				+'	FROM regprogram left join regulation ON regprogram.regulation=regulation.regulation '
				+'  WHERE  ${parameters[\'programRes\'] }';
		}
		return query
	},
	
    /**
     * first tab row record button click change to tab2 edit form.
     */
	abCompSelectProgram_onSelect: function(row){
		var record = row.getRecord();
	    
		var regulation = record.getValue("regprogram.regulation");
		var regprogram = record.getValue("regprogram.reg_program");
		
		commonRptController.objRestrictions.regulation = regulation;
		commonRptController.objRestrictions.reg_program = regprogram;
		commonRptController.objRestrictions.reg_requirement = null;

		commonRptController.exportRes = "requirement";
		// Mark all other tabs for refresh
		commonRptController.setOthersTabRefreshObj("comprogram", 1);
		
		commonRptController.sbfDetailTabs.selectTab("requirement");
		commonRptController.sbfDetailTabs.setAllTabsEnabled(true);
  },

    abCompSelectProgram_onView: function(row){
    	
		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var regulation = record.getValue("regprogram.regulation");
		var reg_program = record.getValue("regprogram.reg_program");
		var restriction = {
			'regprogram.regulation': regulation,
			'regprogram.reg_program': reg_program
		};
		Ab.view.View.openDialog('ab-comp-rpt-program-form.axvw', restriction, false, 0, 0, 800, 400);  
	},
	

	/**
	* Event Handler of action "Doc"
	*/
	abCompSelectProgram_onDoc : function(){
		
		var	parameters = {};
		
		var commonRptController = View.getOpenerView().controllers.get(0);
		//if this tab view is used as first tab in ab-comp-rpt-program.axvw, get the restriction from the grid parameters
		if(commonRptController.sbfDetailTabs.findTab("regulation")==null){
			if(commonRptController.sbfDetailTabs.findTab("comprogram")!=null){
				parameters.consoleRes = this.abCompSelectProgram.parameters['programRes']?this.abCompSelectProgram.parameters['programRes']:'1=1';
			}
		}else{
			parameters.consoleRes = this.abCompSelectProgram.restriction?this.abCompSelectProgram.restriction:'1=1';
		}
		
		View.openPaginatedReportDialog("ab-comp-prog-paginate-rpt.axvw" ,null, parameters);
	},
	
	/**
	 * 	Modified for 22.1 Compliance and Building Operations Integration: call by console method : 'abCompDrilldownConsole_onShow'
	 */  
	refreshFromConsole: function() {
		
		//add restriction for programRes
		this.programRes = generateProgramRestriction("programRpt");
		this.abCompSelectProgram.addParameter('programRes', this.programRes);
		this.abCompSelectProgram.refresh();
		
		//Add location restriction for this.regulationRes which use for regulation tab.
		addConsoleLocationResToTabRes(mainController,null,this.programRes,null);
		
		if (View.parentTab.parentPanel) {
			var parentTabs = View.parentTab.parentPanel;
			parentTabs.setAllTabsEnabled(false);
			parentTabs.enableTab('comprogram');
			parentTabs.selectTab('comprogram');
		}
	}
});

