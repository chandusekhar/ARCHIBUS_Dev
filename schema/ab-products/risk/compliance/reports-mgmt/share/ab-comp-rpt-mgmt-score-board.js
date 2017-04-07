/**
 * @author Guo Jiangtao
 */
var abCompRptCommManScoreBoardController = View.createController('abCompRptCommManScoreBoardController', {

	/**
	 * the main view controller which contain this common chart view
	 */
	mainController : null,
	
	/**
	 * the console view controller
	 */
	consoleController : null,
	calcField2:null,

	/**
	 * reset the panel title after the cross table loaded.
	 */
	afterInitialDataFetch : function() {
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
				if (controls[i].type == 'scoreBoard' && !controls[i].isLoad) {
					this.control = controls[i];
					break;
				}
			}
		}
		
		var calculatedFields = [];
		calculatedFields.push(this.abCompRptCommManScoreBoard.calculatedFields[0]);
		if(this.control.secondCalcField){
			calculatedFields.push(this.abCompRptCommManScoreBoard.calculatedFields[1]);
		}
		this.abCompRptCommManScoreBoard.calculatedFields = calculatedFields;

		// set all parameters
		this.setParameters();
		
		// reset the chart panel title
		this.abCompRptCommManScoreBoard.config.title = this.control.title

		// refresh and show cross table
		if(this.consoleController.consoleRestriction){
			// fix KB3035927 - refreshed according to the console restrictions when switch from one tab to anothe
			this.refreshFromConsole();
		}else{
			this.abCompRptCommManScoreBoard.refresh();
		}
		
		this.control.isLoad = true;
	},

	/**
	 * set required parameters of this view.
	 */
	setParameters : function() {
		var scoreBoard = this.abCompRptCommManScoreBoard;
		this.setQuery();
		scoreBoard.addParameter('firstGroupField', this.control.firstGroupField.name);
		scoreBoard.addParameter('secondGroupField', this.control.secondGroupField.name);
		scoreBoard.addParameter('calcField', this.control.firstCalcField.name);
		scoreBoard.addParameter('firstGroupSortField', this.control.firstGroupSortField.name);
		scoreBoard.addParameter('secondGroupSortField', this.control.secondGroupSortField.name);
		scoreBoard.groupByFields[0].title = this.control.firstGroupField.title;
		scoreBoard.groupByFields[1].title = this.control.secondGroupField.title;
		scoreBoard.calculatedFields[0].title = this.control.firstCalcField.title;
		
		if(this.control.permanentParameter){
			crossTable.addParameter('permanentParameter', this.control.permanentParameter);
		}
		
		if(this.control.secondCalcField){
			scoreBoard.addParameter('calcField2', this.control.secondCalcField.name);
			scoreBoard.calculatedFields[1].title = this.control.secondCalcField.title;
			this.calcField2=this.control.secondCalcField.name
		}else{
			//default value
			scoreBoard.addParameter('calcField2', '1');
		}
	},
	

	/**
	 * set database query base on the main table name.
	 */
	setQuery : function() {
		var scoreBoard = this.abCompRptCommManScoreBoard;
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
					    + '          WHERE regloc.reg_program is NOT NULL AND regulation.regulation = regloc.regulation AND regprogram.reg_program = regloc.reg_program AND regrequirement.regulation = regloc.regulation AND regrequirement.reg_program = regloc.reg_program AND regrequirement.reg_requirement = regloc.reg_requirement AND compliance_locations.location_id = regloc.location_id'
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
			  query = 'select regulation.regulation regulation,regulation.reg_rank reg_rank, regulation.reg_cat reg_cat'
				    + ' from regulation ';
			  
			  if(byLocation){
				  query = 'SELECT regulation, reg_program,  ctry_id,state_id,v_regn_id regn_id,v_city_id city_id,county_id,site_id,pr_id,bl_id,reg_rank,'   
						+  '(CASE WHEN progloc_lvl IS NOT NULL THEN progloc_lvl   WHEN prog_lvl IS NOT NULL THEN prog_lvl  WHEN prog_lvl_calc IS NOT NULL THEN prog_lvl_calc   ELSE  \'Not Entered\' END ) as comp_level ,'
						+  '(SELECT regcomplevel.level_number FROM regcomplevel WHERE regcomplevel.comp_level = (CASE WHEN progloc_lvl IS NOT NULL THEN progloc_lvl   WHEN prog_lvl IS NOT NULL THEN prog_lvl WHEN prog_lvl_calc IS NOT NULL THEN prog_lvl_calc   ELSE  \'Not Entered\' END ) )  level_number '
					  
						+ ' FROM '
							+	 '(SELECT regloc.regulation AS regulation, regloc.reg_program AS reg_program,   ctry_id,state_id,(ctry_id${sql.concat}\'-\'${sql.concat}regn_id)v_regn_id,(state_id${sql.concat}\'-\'${sql.concat}city_id)v_city_id,county_id,site_id,pr_id,bl_id, reg_rank,' 
							+	 ' regprogram.comp_level AS prog_lvl, regprogram.comp_level_calc AS prog_lvl_calc,'
							+	 '	 (CASE WHEN regloc.reg_requirement IS NULL THEN regloc.comp_level ELSE NULL END) AS progloc_lvl'

							+	 '	 FROM regloc LEFT JOIN regulation ON regulation.regulation=regloc.regulation  LEFT JOIN regprogram ON regloc.regulation=regprogram.regulation AND  regloc.reg_program =regprogram.reg_program'
							+	 '	 LEFT JOIN regrequirement ON regloc.regulation= regrequirement.regulation AND  regloc.reg_program = regrequirement.reg_program AND  regloc.reg_requirement = regrequirement.reg_requirement'
							+	 '	 LEFT JOIN compliance_locations ON regloc.location_id= compliance_locations.location_id'
							+	 '	 LEFT JOIN regcomplevel ON regloc.comp_level=regcomplevel.comp_level'
							+	 '	 WHERE CONSOLE-RESTRICTION AND regloc.reg_program IS NOT NULL'
							+	 '	 GROUP BY regloc.regulation, regloc.reg_program,  ctry_id,state_id,(ctry_id${sql.concat}\'-\'${sql.concat}regn_id),(state_id${sql.concat}\'-\'${sql.concat}city_id),county_id,site_id,pr_id,bl_id,reg_rank, '
							+    '   (CASE WHEN regloc.reg_program IS NULL THEN regloc.comp_level ELSE NULL END), regprogram.comp_level ,regprogram.comp_level_calc '

							+	 '	 ) regprogram	'	;	
			  
			  }
			  
			  break;  
		  case 'regprogram': 
			  //qurery from table regrequirement
			  query = 'select regprogram.reg_program reg_program,(${sql.isNull(\'(case when regprogram.comp_level IS  NULL THEN regprogram.comp_level_calc ELSE regprogram.comp_level END)\', "\'Not Entered\'")} ) comp_level, regprogram.priority priority ,'
				    + '       regulation.reg_rank reg_rank,regprogram.regulation regulation,regcomplevel.level_number level_number,'
				    + " ( case when (select count(1) from regrequirement where regrequirement.regulation=regprogram.regulation " +
				    		" and regrequirement.reg_program=regprogram.reg_program and regrequirement.status='Active' AND SUB-QUERY-CONSOLE-RESTRICTION) >0 then" +
				    		" (select count(1) from regrequirement where regrequirement.regulation=regprogram.regulation and" +
				    		" regrequirement.reg_program=regprogram.reg_program and regrequirement.status='Active' AND SUB-QUERY-CONSOLE-RESTRICTION ) else 0 end  )  " +
				    		" reg_requirement "

				    + ' from regprogram left join regulation on regulation.regulation = regprogram.regulation'
			        + '                 left join regcomplevel on regcomplevel.comp_level = regprogram.comp_level';
			  
			  if(byLocation){
				  query = ' SELECT  regulation, reg_program,  ctry_id,state_id,regn_id ,city_id ,county_id,site_id,pr_id,bl_id, ' 
					  +  '(CASE WHEN progloc_lvl IS NOT NULL THEN progloc_lvl  '
					  +  ' WHEN reqloc_avg_lvl_loc IS NOT NULL THEN reqloc_avg_lvl_loc '
					  +  ' WHEN prog_lvl IS NOT NULL THEN prog_lvl '
					  +  ' WHEN prog_lvl_calc IS NOT NULL THEN prog_lvl_calc   '
					  +  ' ELSE  \'Not Entered\' END '
					  +  ') as comp_level, '
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
		}
		
		scoreBoard.addParameter('query', query);
	},

	/**
	 * insert missing values for X and Y axis
	 * 
	 * @param {Object}
	 *            panel
	 * @param {Object}
	 *            dataSet
	 */
	abCompRptCommManScoreBoard_afterGetData : function(panel, dataSet) {
		var defaultColumnSubtotal = new Ab.data.Record({
			'regloc.regloc_id' : {
				l : '0',
				n : '0'
			},
			'regloc.firstGroupField' : {
				l : '0',
				n : '0'
			},
			'regloc.calcField' : {
				l : '0',
				n : '0'
			}
		});
		var defaultRowSubtotal = new Ab.data.Record({
			'regloc.regloc_id' : {
				l : '0',
				n : '0'
			},
			'regloc.secondGroupField' : {
				l : '0',
				n : '0'
			},
			'regloc.calcField' : {
				l : '0',
				n : '0'
			}
		});
		
		if(this.calcField2){
			defaultColumnSubtotal = new Ab.data.Record({
				'regloc.regloc_id' : {
					l : '0',
					n : '0'
				},
				'regloc.firstGroupField' : {
					l : '0',
					n : '0'
				},
				'regloc.calcField' : {
					l : '0',
					n : '0'
				},
				'regloc.calcField2' : {
					l : '0',
					n : '0'
				}
			});
			defaultRowSubtotal = new Ab.data.Record({
				'regloc.regloc_id' : {
					l : '0',
					n : '0'
				},
				'regloc.secondGroupField' : {
					l : '0',
					n : '0'
				},
				'regloc.calcField' : {
					l : '0',
					n : '0'
				},
				'regloc.calcField2' : {
					l : '0',
					n : '0'
				}
			});
		}

		var columnValues = new Ext.util.MixedCollection();
		columnValues.add('1', defaultColumnSubtotal);
		columnValues.add('2', defaultColumnSubtotal);
		columnValues.add('3', defaultColumnSubtotal);
		columnValues.add('4', defaultColumnSubtotal);
		columnValues.add('5', defaultColumnSubtotal);
		columnValues.add('6', defaultColumnSubtotal);
		columnValues.add('7', defaultColumnSubtotal);
		columnValues.add('8', defaultColumnSubtotal);
		columnValues.add('9', defaultColumnSubtotal);

		var levels = this.abCompRptCommManScoreBoard_Level_DS.getRecords();
		var rowValues = new Ext.util.MixedCollection();
		for ( var i = 0; i < levels.length; i++) {
			rowValues.add(levels[i].getValue('regcomplevel.comp_level'), defaultRowSubtotal);
		}

		for ( var c = 0; c < dataSet.columnValues.length; c++) {
			var columnValue = dataSet.columnValues[c].n;
			var columnSubtotal = dataSet.columnSubtotals[c];

			columnValues.replace(columnValue, columnSubtotal);
		}
		// use new column values and sub-totals
		dataSet.columnValues = [];
		dataSet.columnSubtotals = [];
		var priorityEnum = this.abCompRptCommManScoreBoard_regcompliance_DS.fieldDefs.get(0).enumValues;

		columnValues.eachKey(function(columnValue) {
			var columnSubtotal = columnValues.get(columnValue);
			dataSet.columnValues.push({
				l : priorityEnum[columnValue],
				n : columnValue
			});
			dataSet.columnSubtotals.push(columnSubtotal);
		});

		for ( var r = 0; r < dataSet.rowValues.length; r++) {
			var rowValue = dataSet.rowValues[r].n;
			var rowSubtotal = dataSet.rowSubtotals[r];

			rowValues.replace(rowValue, rowSubtotal);
		}
		// use new column values and sub-totals
		dataSet.rowValues = [];
		dataSet.rowSubtotals = [];

		rowValues.eachKey(function(rowValue) {
			var rowSubtotal = rowValues.get(rowValue);

			dataSet.rowValues.push({
				l : rowValue,
				n : rowValue
			});
			dataSet.rowSubtotals.push(rowSubtotal);
		});
	},

	/**
	 * after refresh we need to set the colors
	 */
	abCompRptCommManScoreBoard_afterRefresh : function() {
		this.panelScoreboard_colorcode();
	},

	/**
	 * set scoreboard colors
	 */
	panelScoreboard_colorcode : function() {
		var levels = this.abCompRptCommManScoreBoard_Level_DS.getRecords();
		var styleCode = [
		                 ['1', '1', '2', '3', '4', '5'], 
		                 ['1', '2', '2', '3', '4', '5'], 
		                 ['2', '2', '2', '3', '4', '5'], 
		                 ['2', '2', '3', '3', '4', '5'], 
		                 ['3', '3', '3', '3', '4', '5'],
		                 ['3', '3', '3', '3', '4', '5'], 
		                 ['4', '4', '4', '4', '4', '5'], 
		                 ['4', '4', '4', '4', '5', '5'], 
		                 ['4', '4', '4', '5', '5', '5'], 
		                 ['4', '4', '5', '5', '5', '5'],
		                 ['5', '5', '5', '5', '5', '5'] ];
		for ( var i = 0; i < levels.length; i++) {
			for ( var j = 0; j < 9; j++) {
				colorBlock(i, j, 'PriorityRating5');
				if (i < 10 && j<6) {
					colorBlock(i, j, 'PriorityRating' + styleCode[i][j]);
				} else {
					colorBlock(i, j, 'PriorityRating5');
				}
			}
		}
	},
	
	
	/**
	 * refresh chart from console filter.
	 */
	refreshFromConsole: function() {
		if(this.consoleController){
			var crossTable = this.abCompRptCommManScoreBoard;
			
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
					crossTable.addParameter('consoleRestriction', this.consoleController.complianceLevelRestriction);
					
				}else if(!byLocation&&mainTable=='regprogram'){
					this.setQuery();
					var query = crossTable.parameters['query'];
					var subQueryConsoleRestriction = this.consoleController.subQueryConsoleRestriction;
					query = query.replace(/SUB-QUERY-CONSOLE-RESTRICTION/g, subQueryConsoleRestriction);
					crossTable.addParameter('consoleRestriction', this.consoleController.consoleRestriction);
					crossTable.addParameter('query',query);
					
				}
				//for the other charts, only need one console restriction parameter 
				else{
					crossTable.addParameter('consoleRestriction', this.consoleController.consoleRestriction);
				}
			}
			
			crossTable.refresh();
		}
	}
});

/**
 * set style for a specific cell
 * 
 * @param {Object}
 *            row
 * @param {Object}
 *            column
 * @param {Object}
 *            class_name
 */
function colorBlock(row, column, class_name) {
	var panel = Ab.view.View.getControl(window, 'abCompRptCommManScoreBoard');
	var node = panel.getCellElement(row, column, 0);
	if (node) {
		node.parentNode.className = class_name;
	}
	
	if(abCompRptCommManScoreBoardController.calcField2){
		var node = panel.getCellElement(row, column, 1);
		if (node) {
			node.parentNode.className = class_name;
		}
	}
}