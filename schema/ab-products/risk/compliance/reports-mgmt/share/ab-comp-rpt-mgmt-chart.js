/**
 * @author Guo Jiangtao
 */
var abCompRptCommManChartController = View.createController('abCompRptCommManChartController', {

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
	 * requirement type field define
	 */
	reqTypeFieldDef : null,
	
	/**
	 * compliance level and level number map
	 */
	complianceLevelNumberdColorMap : {},
	
	/**
	 * compliance level filled color map
	 */
	complianceLevelFilledColorMap : {
		 0:'0xFF0000', 1:'0xC00000', 2:'0xFFC000', 3:'0xFFFF00', 4:'0x996633', 5:'0x7030A0', 6:'0x00B0F0', 7:'0x0000FF', 8:'0x00FF00'
	},
	
	/**
	 * priority and severity filled color map
	 */
	priorityAndSeverityFilledColorMap : {
		 1:'0xFF0000', 2:'0xC00000', 3:'0xFFC000', 4:'0xFFFF00', 5:'0x996633', 6:'0x7030A0', 7:'0x00B0F0', 8:'0x0000FF', 9:'0x00FF00'
	},

	/**
	 * reset the panel title after the chart loaded.
	 */
	afterInitialDataFetch : function() {
		//get compliance level and level number map
		this.complianceLevelNumberdColorMap = this.getComplianceLevelNumberdColorMap();
		
		//get enum type field define
		this.priorityFiledDef = View.dataSources.get('abCompRptCommManChart_fieldDef_DS').fieldDefs.get('regrequirement.priority');
		this.rankFiledDef = View.dataSources.get('abCompRptCommManChart_fieldDef_DS').fieldDefs.get('regulation.reg_rank');
		this.severityFiledDef = View.dataSources.get('abCompRptCommManChart_fieldDef_DS').fieldDefs.get('regviolation.severity');
		this.reqTypeFieldDef = View.dataSources.get('abCompRptCommManChart_fieldDef_DS').fieldDefs.get('regrequirement.regreq_type');
		
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
				if (controls[i].type == 'chart' && !controls[i].isLoad) {
					this.control = controls[i];
					break;
				}
			}
			
			if(this.mainController.beforeControlLoad){
				this.mainController.beforeControlLoad(this.control,this.abCompRptCommManChart,abCompRptCommManChartController);
			}
		}
		
		// set all parameters
		this.setParameters();
		
		// reset the chart panel title
		this.abCompRptCommManChart.config.title = this.control.title

		//set isload flag
		this.control.isLoad = true;
		
		//if showOnLoad = true, load the chart data
		if(this.control.showOnLoad){
			this.showChartAfterLoad();
		}
		
	},
	
	/**
	 * show chart panel after the view load.
	 */
	showChartAfterLoad: function() {
		
		// refresh and show chart
		if(this.consoleController.consoleRestriction){
			// fix KB3035927 - refreshed according to the console restrictions when switch from one tab to another
			this.refreshFromConsole();
		}
	},
	
	/**
	 * get compliance level and level number map.
	 */
	getComplianceLevelNumberdColorMap : function() {
		
		var complianceLevelNumberdColorMap = {};
		
		//prepare parameter for WFR AbCommonResources-getDataRecords
		var parameters = {
				tableName: 'regcomplevel',
				fieldNames: toJSON(['regcomplevel.comp_level','regcomplevel.level_number']),
				restriction: toJSON('1=1')
		};
		
		//get all compliance level records and put the data to map
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		if(result.code == "executed" && result.data.records.length > 0){
			for(var i=0;i<result.data.records.length;i++){
				complianceLevelNumberdColorMap[result.data.records[i]['regcomplevel.comp_level']] 
				= result.data.records[i]['regcomplevel.level_number.raw']
			}
		}
		
		//return the map
		return complianceLevelNumberdColorMap;
		
	},

	/**
	 * set required parameters of this view.
	 */
	setParameters : function() {
		var chart = this.abCompRptCommManChart;
		this.setQuery();
		chart.setDataAxisTitle(this.control.firstCalcField.title);
		chart.addParameter('firstGroupField', this.control.firstGroupField.name);
		chart.addParameter('secondGroupField', this.control.secondGroupField.name);
		chart.addParameter('firstGroupSortField', this.control.firstGroupSortField.name);
		chart.addParameter('secondGroupSortField', this.control.secondGroupSortField.name);
		chart.addParameter('calcField', this.control.firstCalcField.name);
		if(this.control.permanentParameter){
			chart.addParameter('permanentParameter', this.control.permanentParameter);
		}		
		
		chart.configObj.groupingAxis[0].title = this.control.firstGroupField.title;
	},
	
	/**
	 * set database query base on the main table name.
	 */
	setQuery : function() {
		var chart = this.abCompRptCommManChart;
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
			  query = ' select regulation.regulation regulation,regulation.reg_rank reg_rank, regulation.reg_cat reg_cat '
				    + ' from regulation ';
			  
			  if(byLocation){
				  
				  query = ' select compliance_locations.*,regloc.comp_level comp_level,regloc.comp_level_calc comp_level_calc,'
					    + '        (case when (regloc.comp_level is not null) then (select regcomplevel.level_number from regcomplevel where regcomplevel.comp_level = regloc.comp_level) '
						+ '              when (regrequirement.comp_level is not null) then (select regcomplevel.level_number from regcomplevel where regcomplevel.comp_level = regrequirement.comp_level) '
						+ '              when (regprogram.comp_level is not null) then (select regcomplevel.level_number from regcomplevel where regcomplevel.comp_level = regprogram.comp_level)'
						+ '              else null end) as level_number,'
					    + '       regulation.regulation regulation,regulation.reg_rank reg_rank, regulation.reg_cat reg_cat '
					    + ' from regloc '
					    + '         left join compliance_locations on compliance_locations.location_id = regloc.location_id'
					    + '         left join regulation on regulation.regulation = regloc.regulation'
					    + '         left join regprogram on regprogram.reg_program = regloc.reg_program and regprogram.regulation = regloc.regulation'
					    + '         left join regrequirement on regrequirement.reg_program = regloc.reg_program and regrequirement.regulation = regloc.regulation and regrequirement.reg_requirement = regloc.reg_requirement';
	  
		  			}
			  break;  
		  case 'regprogram': 
			  //qurery from table regrequirement
			  query = 'select (${sql.isNull(\'(case when regprogram.comp_level IS  NULL THEN regprogram.comp_level_calc ELSE regprogram.comp_level END)\', "\'Not Entered\'")} ) comp_level, regprogram.reg_program reg_program, regprogram.priority priority ,'
				    + '       regulation.reg_rank reg_rank,regprogram.regulation regulation,regcomplevel.level_number level_number'
				    + ' from regprogram left join regulation on regulation.regulation = regprogram.regulation'
			        + '                 left join regcomplevel on regcomplevel.comp_level = regprogram.comp_level';
			  
			  if(byLocation){
				  
				  query = ' SELECT  regulation, reg_program,  ctry_id,state_id,regn_id ,city_id ,county_id,site_id,pr_id,bl_id, ' 
					  +  '(CASE WHEN progloc_lvl IS NOT NULL THEN progloc_lvl  '
					  +  ' WHEN reqloc_avg_lvl_loc IS NOT NULL THEN reqloc_avg_lvl_loc '
					  +  ' WHEN prog_lvl IS NOT NULL THEN prog_lvl '
					  +  ' WHEN prog_lvl_calc IS NOT NULL THEN prog_lvl_calc   '
					  +  ' ELSE  \'Not Entered\' END '
					  +  ') as comp_level ,'
					  +  ' level_number '
					  +  'FROM  '

					  +  '(SELECT regulation, reg_program,   regcomplevel.level_number level_number, ctry_id,state_id,regn_id ,city_id ,county_id,site_id,pr_id,bl_id, '
					  +  ' prog_lvl, prog_lvl_calc, progloc_lvl, reqloc_avg_lvlnum_loc, regcomplevel.comp_level AS reqloc_avg_lvl_loc '
					  +  ' FROM '

					  +  '(SELECT regloc.regulation AS regulation, regloc.reg_program AS reg_program,  ctry_id,state_id, (ctry_id${sql.concat}\'-\'${sql.concat}regn_id)regn_id,(state_id${sql.concat}\'-\'${sql.concat}city_id)city_id ,county_id,site_id,pr_id,bl_id,   '
					  +  '		regprogram.comp_level AS prog_lvl,regprogram.comp_level_calc AS prog_lvl_calc, '
					  +  '		(CASE WHEN regloc.reg_requirement IS NULL THEN regloc.comp_level ELSE NULL END) AS progloc_lvl, '
					  +  ' 		AVG(CASE WHEN regloc.reg_requirement IS NOT NULL THEN level_number ELSE NULL END) AS reqloc_avg_lvlnum_loc '
					  +  'FROM regloc LEFT JOIN regulation ON regloc.regulation=regulation.regulation LEFT JOIN regprogram ON regloc.regulation=regprogram.regulation AND  regloc.reg_program =regprogram.reg_program '
					  +  '		LEFT JOIN regrequirement ON regloc.regulation= regrequirement.regulation AND  regloc.reg_program = regrequirement.reg_program  '
					  +  '			AND  regloc.reg_requirement = regrequirement.reg_requirement '
					  +  ' 			LEFT JOIN regcomplevel ON regloc.comp_level=regcomplevel.comp_level '
					  +  ' 			LEFT JOIN compliance_locations ON regloc.location_id= compliance_locations.location_id '
			  		  +  ' WHERE CONSOLE-RESTRICTION AND  regloc.reg_program IS NOT NULL '
					  +  ' GROUP BY regloc.regulation, regloc.reg_program,  ctry_id,state_id,regn_id,city_id,(ctry_id${sql.concat}\'-\'${sql.concat}regn_id),(state_id${sql.concat}\'-\'${sql.concat}city_id),county_id,site_id,pr_id,bl_id, regprogram.comp_level, regprogram.comp_level_calc, '
					  +  ' 			(CASE WHEN regloc.reg_requirement IS NULL THEN regloc.comp_level ELSE NULL END)  '
					  
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
		
		
		chart.addParameter('query', query);
	},
	
	/**
	 * refresh chart from console filter.
	 */
	refreshFromConsole: function() {
		if(this.consoleController){
			//get chart panel
			var chart = this.abCompRptCommManChart;
			
			//set parameter to the chart panel
			if(this.consoleController.consoleRestriction){
				var mainTable = this.control.mainTable;
				var byLocation = this.control.byLocation;	
				//for special charts : Compliance Program Count by Compliance Level and Location and Compliance Requirements Count by Compliance Level and Location
				//the console restriction is divided to two parts: 1- console restriction excluding compliance level, 
				//2, calculated compliance level field restriction 
				if((mainTable=='regrequirement'|| mainTable=='regprogram') && byLocation){
					this.setQuery();
					var query = chart.parameters['query'];
					var consoleRestriction = this.consoleController.consoleRestriction;
					if(valueExistsNotEmpty(this.control.permanentParameter)){
						consoleRestriction = consoleRestriction+" AND "+this.control.permanentParameter;
					}
					//add console restriction excluding compliance level to the query
					query = query.replace(/CONSOLE-RESTRICTION/g, consoleRestriction);
					chart.addParameter('query',query);
					chart.addParameter('permanentParameter','1=1');
					
					//add calculated compliance level field restriction to the parameter
					chart.addParameter('consoleRestriction', this.consoleController.complianceLevelRestriction);
				}
				//for the other charts, only need one console restriction parameter 
				else{
					if(valueExistsNotEmpty(this.control.permanentParameter)){
						chart.addParameter('permanentParameter',this.control.permanentParameter);
					}
					chart.addParameter('consoleRestriction', this.consoleController.consoleRestriction);
				}
			}
			
			//check the chart type and switch between stackedBarChart chart and columnChart chart
			chart.checkChartType();
			
			//refresh the chart data
			if(!chart.isLoadComplete){
				firstTimeLoadChart.defer(1000);
			}else{
				chart.refresh();
			}
		}
	},
	
	/**
	 * open the pop up view, and pass the click object as parameter.
	 */
	openPopUpView: function(ob) {
		//call main controller method to open pup up
		if(this.mainController.openPopUpView){
			this.mainController.openPopUpView(ob,this.control);
		}
	}
});


/**
 * onclick event handler for the chart panel.
 */
function onClickChart(ob){
	//get field defines in the ManageReportControl object
	var firstGroupFieldDef = abCompRptCommManChartController[abCompRptCommManChartController.control.firstGroupFieldDef];
	var secondGroupFieldDef = abCompRptCommManChartController[abCompRptCommManChartController.control.secondGroupFieldDef];
	
	//if exist first field group field define, convert the display value to raw value in the click object base on enum list  
	if(firstGroupFieldDef){
		ob.selectedChartData['regloc.firstGroupField'] = getRawValueFromEnum(firstGroupFieldDef,ob.selectedChartData['regloc.firstGroupField']);
	}
	
	//if exist second field group field define, convert the display value to raw value in the click object base on enum list
    if(secondGroupFieldDef){
    	ob.selectedChartData['regloc.secondGroupField'] = getRawValueFromEnum(secondGroupFieldDef,ob.selectedChartData['regloc.secondGroupField']);
	}
    
    //open the pop up view
	abCompRptCommManChartController.openPopUpView(ob);
}

/**
 * convert the display value to raw value base on enum list
 */
function getRawValueFromEnum(fiedDef, displayedValue){
	for(var name in fiedDef.enumValues){
		if(fiedDef.enumValues[name] == displayedValue){
			return name;
			break;
		}
	}
}

/**
 * over-write the getDataFromDataSources method in the core chart control to reset fill color and format the enum field values
 */
Ab.chart.ChartControl.prototype.getDataFromDataSources = function(restriction){	 
	try {
	    var parameters = this.getParameters(restriction);
	    //XXX: default time-out is 20S, but for charts, it should be longer (120S?)
        var result = Workflow.call(this.refreshWorkflowRuleId, parameters, 120);
        
        this.rawData = toJSON(result.data);
        
        //KB3036039 - assign colors to priority, severity, and compliance level (level_number) values the same way as in map views
        this.setCustomFillColor();
        
        //format data record values for the enum type fields
        this.formatDataRecords(result);
    
        //return the data
        return toJSON(result.data);
	} catch (e) {
		this.handleError(e);
	}
 }

/**
 * extend method resetFillColor in the core chart control to format the enum field values
 */
Ab.chart.ChartControl.prototype.setCustomFillColor =  function() {
	var customFillColors = [];
	
	//get second group field name
	var secondGroupFieldName = this.parameters['secondGroupField'];
	var data =  eval("(" + this.rawData + ")");
	
	//if field name is compliance level, using abCompRptCommManChartController.complianceLevelFilledColorMap to get customized color
	if(secondGroupFieldName.indexOf('comp_level')!=-1){
		for(var i=0; i<data.length;i++){
			var levelNumber = abCompRptCommManChartController.complianceLevelNumberdColorMap[data[i]['regloc.secondGroupField']];
			//if the value in the map, get color from the map, otherwise set to black(no value)
			if(abCompRptCommManChartController.complianceLevelFilledColorMap[levelNumber]){
				customFillColors.push(abCompRptCommManChartController.complianceLevelFilledColorMap[levelNumber]);
			}else{
				customFillColors.push('0x000000');
			}
		}
	//if field name is priority or severity, using abCompRptCommManChartController.priorityAndSeverityFilledColorMap to get customized color	
	}else if(secondGroupFieldName.indexOf('priority')!=-1 || secondGroupFieldName.indexOf('severity')!=-1 || secondGroupFieldName.indexOf('reg_rank')!=-1){
		for(var i=0; i<data.length;i++){
			//if the value in the map, get color from the map, otherwise set to black(no value)
			if(abCompRptCommManChartController.priorityAndSeverityFilledColorMap[data[i]['regloc.secondGroupField']]){
				customFillColors.push(abCompRptCommManChartController.priorityAndSeverityFilledColorMap[data[i]['regloc.secondGroupField']]);
			}else{
				customFillColors.push('0x000000');
			}
		}
	}
	
	//set customized color to the chart control
	this.setSolidFillColors(customFillColors)
}

/**
 * extend method formatDataRecords in the core chart control to format the enum field values
 */
Ab.chart.ChartControl.prototype.formatDataRecords =  function(result) {
	//get field defines in the ManageReportControl object
	var firstGroupFieldDef = abCompRptCommManChartController[abCompRptCommManChartController.control.firstGroupFieldDef];
	var secondGroupFieldDef = abCompRptCommManChartController[abCompRptCommManChartController.control.secondGroupFieldDef];
	
	//if exist second field group field define, convert the raw value to display value in the click object base on enum list  
	if(secondGroupFieldDef){
		for(var i=0; i<result.data.length;i++){
			result.data[i]['regloc.secondGroupField'] = secondGroupFieldDef.formatValue(result.data[i]['regloc.secondGroupField']);
		}
	}
	
	//if exist first field group field define, convert the raw value to display value in the click object base on enum list  
    if(firstGroupFieldDef){
    	for(var i=0; i<result.data.length;i++){
    		for(var j=0; j<result.data[i].data.length;j++){
    			result.data[i].data[j]['regloc.firstGroupField'] = firstGroupFieldDef.formatValue(result.data[i].data[j]['regloc.firstGroupField']);
    		}
		}
	}
}

/**
 * extent the chart control to support stackedBarChart chart and columnChart chart
 */
Ab.chart.ChartControl.prototype.checkChartType = function(){	 
	if(this.chartType!=abCompRptCommManChartController.control.chartType){
		//reset the chart control type 
		this.chartType = abCompRptCommManChartController.control.chartType;
		this.setSwfPath();
		// reload the swf to flash plugin
		this.loadChartSWFIntoFlash();
	}
 }

/**
 * called when first time load chart to make sure the costomized fill color work
 */
function firstTimeLoadChart(){
	//get the chart and swf control
	var chart = abCompRptCommManChartController.abCompRptCommManChart;
	var swfControl = chart.getSWFControl();
	
	//get the chart data
	chart.data = chart.getDataFromDataSources();
	
	//load data into chart control
	swfControl.refreshData(chart.data);
	
	//set the customized fill color
	chart.setCustomFillColor();
	
	//do again load data to chart control, this step cannot be removed, it make sure the customized fill color work 
	swfControl.refreshData(chart.data);
	
	// kb#3044128: set chart title manually when first time create and show chart
	var ctx = chart.createEvaluationContext();
	var evaluatedTitle = Ab.view.View.evaluateString(chart.config.title, ctx);
	chart.setTitle(evaluatedTitle);
}