/**
 * @author Guo Jiangtao
 */
var abCompRptCommManCrossTableController = View.createController('abCompRptCommManCrossTableController', {

	/**
	 * the main view controller which contain this common chart view
	 */
	mainController : null,
	
	/**
	 * the console view controller
	 */
	consoleController : null,	

	/**
	 * type of ManageReportControl
	 */
	control : null,
	
	/**
	 * priority field define
	 */
	priorityFiledDef : null,
	
	/**
	 * rank field define
	 */
	rankFiledDef : null,
	
	/**
	 * severity field define
	 */
	severityFiledDef : null,

	/**
	 * reset the panel title after the cross table loaded.
	 */
	afterInitialDataFetch : function() {
		this.priorityFiledDef = View.dataSources.get('abCompRptCommManChart_fieldDef_DS').fieldDefs.get('regrequirement.priority');
		this.rankFiledDef = View.dataSources.get('abCompRptCommManChart_fieldDef_DS').fieldDefs.get('regulation.reg_rank');
		this.severityFiledDef = View.dataSources.get('abCompRptCommManChart_fieldDef_DS').fieldDefs.get('regviolation.severity');
		// get console view controller from opener view
		this.consoleController = View.getOpenerView().controllers.get('controllerConsole');
		//register to console controller
		if (this.consoleController) {
			this.consoleController.controllers.push(this);
		}
		
		// get main controller from opener view
		this.mainController = View.getOpenerView().controllers.get(0);

		// get property value from main controller
		if (this.mainController && this.mainController.controls) {

			var controls = this.mainController.controls;
			for ( var i = 0; i < controls.length; i++) {
				if (controls[i].type == 'crossTable' && !controls[i].isLoad) {
					this.control = controls[i];
					break;
				}
			}
			
			if(this.mainController.beforeControlLoad){
				this.mainController.beforeControlLoad(this.control,this.abCompRptCommManCrossTable,abCompRptCommManCrossTableController);
			}
		}
		
		var calculatedFields = [];
		calculatedFields.push(this.abCompRptCommManCrossTable.calculatedFields[0]);
		if(this.control.secondCalcField){
			calculatedFields.push(this.abCompRptCommManCrossTable.calculatedFields[1]);
		}
		this.abCompRptCommManCrossTable.calculatedFields = calculatedFields;

		// set all parameters
		this.setParameters();
		
		// reset the chart panel title
		this.abCompRptCommManCrossTable.config.title = this.control.title
		
		this.abCompRptCommManCrossTable.addEventListener('afterGetData', this.afterGetData, this);

		this.control.isLoad = true;
		
		//if showOnLoad = true, load the cross table data
		if(this.control.showOnLoad){
			this.showCrossTableAfterLoad();
		}
	},
	
	/**
	 * show cross table after the view load.
	 */
	showCrossTableAfterLoad: function() {
		
		// refresh and show cross table
		if(this.consoleController.consoleRestriction){
			// fix KB3035927 - refreshed according to the console restrictions when switch from one tab to anothe
			this.refreshFromConsole();
		}else{
			this.abCompRptCommManCrossTable.refresh();
		}
	},

	/**
	 * set required parameters of this view.
	 */
	setParameters : function() {
		var crossTable = this.abCompRptCommManCrossTable;
		this.setQuery();
		crossTable.addParameter('firstGroupField', this.control.firstGroupField.name);
		crossTable.addParameter('secondGroupField', this.control.secondGroupField.name);
		crossTable.addParameter('calcField', this.control.firstCalcField.name);
		crossTable.addParameter('firstGroupSortField', this.control.firstGroupSortField.name);
		crossTable.addParameter('secondGroupSortField', this.control.secondGroupSortField.name);

		crossTable.groupByFields[0].title = this.control.firstGroupField.title;
		crossTable.groupByFields[1].title = this.control.secondGroupField.title;
		crossTable.calculatedFields[0].title = this.control.firstCalcField.title;
		
		if(this.control.permanentParameter){
			crossTable.addParameter('permanentParameter', this.control.permanentParameter);
		}
		
		if(this.control.secondCalcField){
			crossTable.addParameter('calcField2', this.control.secondCalcField.name);
			crossTable.calculatedFields[1].title = this.control.secondCalcField.title;
		}
	},
	
	
	/**
	 * set database query base on the main table name.
	 */
	setQuery : function() {
		var crossTable = this.abCompRptCommManCrossTable;
		var query = ' '
		var mainTable = this.control.mainTable;	
		var byLocation = this.control.byLocation;	
		switch(mainTable){
		  case 'regrequirement': 
			  //qurery from table regrequirement
			  query = 'select regrequirement.reg_requirement reg_requirement,(${sql.isNull(\'(case when regrequirement.comp_level IS NULL THEN regprogram.comp_level ELSE regrequirement.comp_level END)\', "\'Not Entered\'")} ) comp_level, regrequirement.priority priority,'
				    + '       regrequirement.regreq_type regreq_type,regrequirement.reg_program reg_program,regulation.reg_rank  reg_rank,'
				    + '       regrequirement.regulation regulation,(SELECT regcomplevel.level_number FROM regcomplevel WHERE regcomplevel.comp_level = (${sql.isNull(\'(case when regrequirement.comp_level IS NULL THEN regprogram.comp_level ELSE regrequirement.comp_level END)\', "\'Not Entered\'")} )) level_number '
				    + ' from regrequirement left join regulation on regulation.regulation = regrequirement.regulation'
				    + '                     left join regprogram on regprogram.reg_program = regrequirement.reg_program and regprogram.regulation = regrequirement.regulation';
			  
			  if(byLocation){
				  query = 'SELECT regulation,reg_program,reg_requirement, ctry_id,state_id,regn_id,city_id,county_id,site_id,pr_id,bl_id,'
					    +' (CASE WHEN reqloc_lvl IS NOT NULL THEN reqloc_lvl WHEN req_lvl IS NOT NULL THEN  req_lvl  WHEN progloc_lvl IS NOT NULL THEN  progloc_lvl WHEN prog_lvl IS NOT NULL THEN prog_lvl ELSE \'Not Entered\' END)  comp_level, '
						+ '(SELECT regcomplevel.level_number FROM regcomplevel WHERE regcomplevel.comp_level = (CASE WHEN reqloc_lvl IS NOT NULL THEN reqloc_lvl WHEN req_lvl IS NOT NULL THEN  req_lvl  WHEN progloc_lvl IS NOT NULL THEN  progloc_lvl WHEN prog_lvl IS NOT NULL THEN prog_lvl ELSE \'Not Entered\' END)  )  level_number'
					    + ' from (  SELECT regloc.regulation,regloc.reg_program, regloc.reg_requirement  reg_requirement, ctry_id,state_id,(ctry_id${sql.concat}\'-\'${sql.concat}regn_id)regn_id,(state_id${sql.concat}\'-\'${sql.concat}city_id)city_id,county_id,site_id,pr_id,bl_id, regprogram.comp_level  prog_lvl,regloc.comp_level  reqloc_lvl,regrequirement.comp_level  req_lvl,regloc.comp_level_calc  progloc_lvl '
					    + '          FROM regloc,regulation,regprogram,regrequirement,compliance_locations'
					    + '          WHERE regloc.reg_program is NOT NULL AND regulation.regulation = regloc.regulation AND regprogram.regulation = regloc.regulation AND regprogram.reg_program = regloc.reg_program AND regrequirement.regulation = regloc.regulation AND regrequirement.reg_program = regloc.reg_program AND regrequirement.reg_requirement = regloc.reg_requirement AND compliance_locations.location_id = regloc.location_id'
					    + '          AND CONSOLE-RESTRICTION'
					    + '   UNION SELECT regloc.regulation,regloc.reg_program, regrequirement.reg_requirement  reg_requirement,ctry_id,state_id,(ctry_id${sql.concat}\'-\'${sql.concat}regn_id)regn_id,(state_id${sql.concat}\'-\'${sql.concat}city_id) city_id,county_id,site_id,pr_id,bl_id, regprogram.comp_level  prog_lvl, NULL  reqloc_lvl, regrequirement.comp_level  req_lvl, regloc.comp_level  progloc_lvl'
					    + '          FROM regloc,regulation,regprogram,regrequirement,compliance_locations'
					    + '          WHERE regloc.reg_program is NOT NULL AND regloc.reg_requirement IS NULL AND regulation.regulation = regloc.regulation AND regprogram.regulation = regloc.regulation  AND regprogram.reg_program = regloc.reg_program AND regrequirement.regulation = regloc.regulation AND regrequirement.reg_program = regloc.reg_program AND compliance_locations.location_id = regloc.location_id AND regprogram.reqs_inherit_locs = 1'
					    + '          AND NOT EXISTS (SELECT 1  FROM regloc regloc2  WHERE regloc2.regulation = regloc.regulation  AND regloc2.reg_program = regloc.reg_program AND regloc2.reg_requirement IS NOT NULL)'
					    + '          AND CONSOLE-RESTRICTION'
					    + ' ) tbl1 ';
			  }

			  break;
		  case 'regulation': 
			  //qurery from table regrequirement
			  query = 'select regulation.regulation regulation,regulation.reg_rank reg_rank, regulation.reg_cat reg_cat,'
				    + " ( case when (select count(1) from regprogram where regprogram.regulation=regulation.regulation and " +
				    		" SUB-QUERY-CONSOLE-RESTRICTION ) >0 " +
				    		" then (select count(1) from regprogram where regprogram.regulation=regulation.regulation " +
				    		"  AND SUB-QUERY-CONSOLE-RESTRICTION) else 0 end  )  reg_program from regulation ";
			  
			  if(byLocation){
				  
				  query = ' select compliance_locations.*,regloc.comp_level comp_level,regloc.comp_level_calc comp_level_calc,'
					    + '        (case when (regloc.comp_level is not null) then (select regcomplevel.level_number from regcomplevel where regcomplevel.comp_level = regloc.comp_level) '
						+ '              when (regrequirement.comp_level is not null) then (select regcomplevel.level_number from regcomplevel where regcomplevel.comp_level = regrequirement.comp_level) '
						+ '              when (regprogram.comp_level is not null) then (select regcomplevel.level_number from regcomplevel where regcomplevel.comp_level = regprogram.comp_level)'
						+ '              else null end) as level_number,'
					    + '       regloc.reg_requirement reg_requirement, regrequirement.priority priority,'
					    + '       regrequirement.regreq_type regreq_type,regloc.reg_program reg_program,regulation.reg_rank  reg_rank,'
					    + '       regloc.regulation regulation '
						
					    + ' from regloc '
					    + '         left join compliance_locations on compliance_locations.location_id = regloc.location_id'
					    + '         left join regulation on regulation.regulation = regloc.regulation'
					    + '         left join regprogram on regprogram.reg_program = regloc.reg_program and regprogram.regulation = regloc.regulation'
					    + '         left join regrequirement on regrequirement.reg_program = regloc.reg_program and regrequirement.regulation = regloc.regulation and regrequirement.reg_requirement = regloc.reg_requirement';
	  
			  }
			  break;  
		  case 'regprogram': 
			  //qurery from table regrequirement
			  query = 'select regprogram.reg_program reg_program,(${sql.isNull(\'(case when regprogram.comp_level IS  NULL THEN regprogram.comp_level_calc ELSE regprogram.comp_level END)\', "\'Not Entered\'")} ) comp_level, regprogram.priority priority ,'
				    + '       regulation.reg_rank reg_rank,regprogram.regulation regulation,regcomplevel.level_number level_number,'
				    + " ( case when (select count(1) from regrequirement where regrequirement.regulation=regprogram.regulation and regrequirement.reg_program=regprogram.reg_program and regrequirement.status='Active' AND SUB-QUERY-CONSOLE-RESTRICTION ) >0 then (select count(1) from regrequirement where regrequirement.regulation=regprogram.regulation and regrequirement.reg_program=regprogram.reg_program and regrequirement.status='Active' AND SUB-QUERY-CONSOLE-RESTRICTION) else 0 end  )  reg_requirement "

				    + ' from regprogram left join regulation on regulation.regulation = regprogram.regulation'
			        + '                 left join regcomplevel on regcomplevel.comp_level = regprogram.comp_level';
			  
			  if(byLocation){
				  
				  query = ' SELECT  regulation, reg_program, reg_requirement,ctry_id,state_id,regn_id ,city_id ,county_id,site_id,pr_id,bl_id, ' 
					  +  '(CASE WHEN progloc_lvl IS NOT NULL THEN progloc_lvl  '
					  +  ' WHEN reqloc_avg_lvl_loc IS NOT NULL THEN reqloc_avg_lvl_loc '
					  +  ' WHEN prog_lvl IS NOT NULL THEN prog_lvl '
					  +  ' WHEN prog_lvl_calc IS NOT NULL THEN prog_lvl_calc   '
					  +  ' ELSE  \'Not Entered\' END '
					  +  ') as comp_level, '
					  +  ' level_number '
					  +  'FROM  '

					  +  '(SELECT regulation, reg_program,reg_requirement,  regcomplevel.level_number level_number, ctry_id,state_id,regn_id ,city_id ,county_id,site_id,pr_id,bl_id, '
					  +  ' prog_lvl, prog_lvl_calc, progloc_lvl, reqloc_avg_lvlnum_loc, regcomplevel.comp_level AS reqloc_avg_lvl_loc '
					  +  ' FROM '

					  +  '(SELECT regloc.regulation AS regulation, regloc.reg_program AS reg_program, '
					  +  ' (CASE WHEN regrequirement.status=\'Active\' THEN regloc.reg_requirement ELSE NULL END) AS reg_requirement, ctry_id,state_id, (ctry_id${sql.concat}\'-\'${sql.concat}regn_id)regn_id,(state_id${sql.concat}\'-\'${sql.concat}city_id)city_id ,county_id,site_id,pr_id,bl_id,   '
					  +  '		regprogram.comp_level AS prog_lvl,regprogram.comp_level_calc AS prog_lvl_calc, '
					  +  '		(CASE WHEN regloc.reg_requirement IS NULL THEN regloc.comp_level ELSE NULL END) AS progloc_lvl, '
					  +  ' 		AVG(CASE WHEN regloc.reg_requirement IS NOT NULL THEN level_number ELSE NULL END) AS reqloc_avg_lvlnum_loc '
					  +  'FROM regloc LEFT JOIN regulation ON regloc.regulation=regulation.regulation LEFT JOIN regprogram ON regloc.regulation=regprogram.regulation AND  regloc.reg_program =regprogram.reg_program '
					  +  '		LEFT JOIN regrequirement ON regloc.regulation= regrequirement.regulation AND  regloc.reg_program = regrequirement.reg_program  '
					  +  '			AND  regloc.reg_requirement = regrequirement.reg_requirement '
					  +  ' 			LEFT JOIN regcomplevel ON regloc.comp_level=regcomplevel.comp_level '
					  +  ' 			LEFT JOIN compliance_locations ON regloc.location_id= compliance_locations.location_id '
			  		  +  ' WHERE CONSOLE-RESTRICTION AND  regloc.reg_program IS NOT NULL  '
					  +  ' GROUP BY regloc.regulation, regloc.reg_program, regloc.reg_requirement, ctry_id,state_id,regn_id,city_id,(ctry_id${sql.concat}\'-\'${sql.concat}regn_id),(state_id${sql.concat}\'-\'${sql.concat}city_id),county_id,site_id,pr_id,bl_id, regprogram.comp_level, regprogram.comp_level_calc, '
					  +  ' 			(CASE  WHEN regrequirement.status = \'Active\' THEN    regloc.reg_requirement    ELSE    NULL END),'
					  +	 '(CASE WHEN regloc.reg_requirement IS NULL THEN regloc.comp_level ELSE NULL END)  '
					  
					  +  '	) tbl1 LEFT JOIN regcomplevel ON regcomplevel.level_number=ROUND(tbl1.reqloc_avg_lvlnum_loc,0) '
					  +  ' ) tbl2 '	  ;	  
					}

			  break;  
			  
		  case 'regviolation': 
			  //qurery from table regrequirement
			  query = 'select ctry_id,state_id,(ctry_id${sql.concat}\'-\'${sql.concat}regn_id)regn_id,(state_id${sql.concat}\'-\'${sql.concat}city_id)city_id,county_id,site_id,pr_id,bl_id,' 
			        + '       regviolation.severity severity, regviolation.cost_total cost_total,'
				    + '       regviolation.reg_program reg_program,regviolation.regulation regulation,'
				    + '       regviolation.date_assessed date_assessed ,regviolation.violation_num violation_num,'
				    + '       regrequirement.priority priority, regulation.reg_rank reg_rank'
				    + ' from regviolation'
				    + '      left join regloc on regloc.location_id = regviolation.location_id'
			        + '      left join compliance_locations on compliance_locations.location_id = regviolation.location_id'
			        + '      left join regulation on regulation.regulation = regviolation.regulation'
			        + '      left join regprogram on regprogram.reg_program = regviolation.reg_program and regprogram.regulation = regviolation.regulation'
			        + '      left join regrequirement on regrequirement.regulation = regviolation.regulation'
			        +'               and regrequirement.reg_program = regviolation.reg_program'
			        +'               and regrequirement.reg_requirement = regviolation.reg_requirement';
			  break;

		  case 'activity_log': 
			  //query from table activity_log
			  query = 'select regrequirement.reg_requirement reg_requirement,regrequirement.comp_level comp_level, regrequirement.priority priority,'
				    + '       regrequirement.regreq_type regreq_type,activity_log.reg_program reg_program,regulation.reg_rank  reg_rank,activity_log.activity_log_id  activity_log_id,'
				    + '       activity_log.regulation regulation,regcomplevel.level_number level_number '
				    + ' from activity_log   left join regrequirement on regrequirement.reg_requirement = activity_log.reg_requirement and regrequirement.reg_program = activity_log.reg_program and regrequirement.regulation = activity_log.regulation '
				    + '                     left join regulation on regulation.regulation = activity_log.regulation'
				    + '                     left join regprogram on regprogram.reg_program = activity_log.reg_program and regprogram.regulation = activity_log.regulation '
				    + '                     left join compliance_locations on compliance_locations.location_id = activity_log.location_id'
			        + '                     left join regcomplevel on regcomplevel.comp_level = regrequirement.comp_level';
			  if(byLocation){
				  query = ' select compliance_locations.*, activity_log.activity_type,activity_log.status,'
					    + '                      activity_log.date_scheduled_end ,activity_log.date_scheduled,'
					    + ' regulation.regulation location_regulation, '
					    +'        (case when (regloc.comp_level is not null) then regloc.comp_level '
					    + '              when (regrequirement.comp_level is not null) then regrequirement.comp_level '
					    + '              when (regprogram.comp_level is not null) then regprogram.comp_level' 
					    + '              else  null end) as location_comp_level,'
					    + '        (case when (regloc.comp_level is not null) then (select regcomplevel.level_number from regcomplevel where regcomplevel.comp_level = regloc.comp_level) '
						+ '              when (regrequirement.comp_level is not null) then (select regcomplevel.level_number from regcomplevel where regcomplevel.comp_level = regrequirement.comp_level) '
						+ '              when (regprogram.comp_level is not null) then (select regcomplevel.level_number from regcomplevel where regcomplevel.comp_level = regprogram.comp_level)'
						+ '              else null end) as level_number,'
						+ '  regrequirement.reg_requirement reg_requirement, regrequirement.priority priority,'
					    + '      regrequirement.regreq_type regreq_type,regrequirement.reg_program reg_program,regulation.reg_rank  reg_rank,'

					    + '  compliance_locations.site_id  location_site_id, '
					    + '  compliance_locations.pr_id  location_pr_id, '
					    + '  compliance_locations.bl_id  location_bl_id, '
					    
					    + '  activity_log.activity_log_id  activity_log_id,'
					    + '  regrequirement.regulation regulation, '
					    +' compliance_locations.ctry_id  location_ctry_id, compliance_locations.state_id  location_state_id, '
					    +' (ctry_id${sql.concat}\'-\'${sql.concat}regn_id) location_regn_id, '
					    +' (state_id${sql.concat}\'-\'${sql.concat}city_id) location_city_id, '
					    +' compliance_locations.county_id  location_county_id, compliance_locations.site_id  v_site_id,'
					    +' compliance_locations.pr_id  v_pr_id,  compliance_locations.bl_id  v_bl_id '
					    + ' from activity_log '
					    + '         left join compliance_locations on compliance_locations.location_id = activity_log.location_id'
					    + '         left join regloc on regloc.location_id = activity_log.location_id '
					    + '         left join regulation on regulation.regulation = activity_log.regulation'
					    + '         left join regprogram on regprogram.reg_program = activity_log.reg_program and regprogram.regulation = activity_log.regulation'
					    + '         left join regrequirement on regrequirement.reg_program = activity_log.reg_program and regrequirement.regulation = activity_log.regulation '
					    + '         and regrequirement.reg_requirement = activity_log.reg_requirement ';
			  }
			  break;
		}
		
		crossTable.addParameter('query', query);
	},
	
	
	/**
	 * refresh chart from console filter.
	 */
	refreshFromConsole: function() {
		if(this.consoleController){
			var crossTable = this.abCompRptCommManCrossTable;
			
			//set parameter to the crossTable panel
			if(this.consoleController.consoleRestriction){
				var mainTable = this.control.mainTable;
				var byLocation = this.control.byLocation;	
				//for special crossTable : Compliance Program Count by Compliance Level and Location and Compliance Requirements Count by Compliance Level and Location
				//the console restriction is divided to two parts: 1- console restriction excluding compliance level, 
				//2, calculated compliance level field restriction 
				if((mainTable=='regrequirement'|| mainTable=='regprogram') && byLocation){
					this.setQuery();
					var query = crossTable.parameters['query'];
					var consoleRestriction = this.consoleController.consoleRestriction;
					if(valueExistsNotEmpty(this.control.permanentParameter)){
						consoleRestriction = consoleRestriction+" AND "+this.control.permanentParameter;
					}
					//add console restriction excluding compliance level to the query
					query = query.replace(/CONSOLE-RESTRICTION/g, consoleRestriction);
					
					crossTable.addParameter('query',query);
					crossTable.addParameter('permanentParameter','1=1');
					
					//add calculated compliance level field restriction to the parameter
					if(this.consoleController.complianceLevelRestriction){
						crossTable.addParameter('consoleRestriction', this.consoleController.complianceLevelRestriction);
					}
				}
				else if(!byLocation&&(mainTable=='regulation'||mainTable=='regprogram')){
					this.setQuery();
					var query = crossTable.parameters['query'];
					var subQueryConsoleRestriction = this.consoleController.subQueryConsoleRestriction;
					query = query.replace(/SUB-QUERY-CONSOLE-RESTRICTION/g, subQueryConsoleRestriction);
					crossTable.addParameter('consoleRestriction', this.consoleController.consoleRestriction);
					crossTable.addParameter('query',query);
					
				}
				//for the other charts, only need one console restriction parameter 
				else{
					if(valueExistsNotEmpty(this.control.permanentParameter)){
						crossTable.addParameter('permanentParameter',this.control.permanentParameter);
					}
					crossTable.addParameter('consoleRestriction', this.consoleController.consoleRestriction);
				}
			}
			
			crossTable.refresh();
		}
	},
	
	afterGetData: function(panel, dataSet){
		var firstGroupFieldDef = abCompRptCommManCrossTableController[abCompRptCommManCrossTableController.control.firstGroupFieldDef];
		var secondGroupFieldDef = abCompRptCommManCrossTableController[abCompRptCommManCrossTableController.control.secondGroupFieldDef];
		
		//integer regular expression
		var intRegExp  = /^-?\d+$/;
		
		if(firstGroupFieldDef){
			for(var i=0; i<dataSet.rowValues.length;i++){
				//if the value is integer, then get the display value in enum 
				if(intRegExp.test(dataSet.rowValues[i].n)){
					dataSet.rowValues[i].l = firstGroupFieldDef.formatValue(dataSet.rowValues[i].l);
				}
			}
		}
	
	    if(secondGroupFieldDef){
	    	for(var i=0; i<dataSet.columnValues.length;i++){
	    		//if the value is integer, then get the display value in enum 
	    		if(intRegExp.test(dataSet.columnValues[i].n)){
	    			dataSet.columnValues[i].l = secondGroupFieldDef.formatValue(dataSet.columnValues[i].l);
	    		}
			}
		}
	}
});