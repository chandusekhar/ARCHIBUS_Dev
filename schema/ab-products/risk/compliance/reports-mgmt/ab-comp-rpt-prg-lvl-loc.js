/**
 */
var abCompRptProLvlLoctController = View.createController('abCompRptProLvlLoctController', {

	controls : [],

	/**
	 * set controller property values after view initialized.
	 */
	afterViewLoad : function() {
		
		
		var chart = new ManageReportControl('chart', getMessage('chartTitle'),false);
		chart.mainTable = "regprogram";
		chart.byLocation = true;
		chart.secondGroupField = {
			'name' : 'comp_level',
			'title' : getMessage('secondGroupFieldTitle')
		};
		chart.secondGroupSortField = {
			'name' : 'level_number',
			'title' : ''
		};
		chart.firstCalcField = {
			'name' : 'count(distinct (case when reg_program is not null then regulation  ${sql.concat} reg_program else null end ))',
			'title' : getMessage('calcFieldTitle')
		};
		

		//for crosstable
		chart.secondCalcField = {
				'name' : 'count( distinct ( case when reg_program is not null and reg_requirement is not null then  regulation  ${sql.concat} reg_program  ${sql.concat} reg_requirement else null end ))',
				'title' : getMessage('calcFieldTitle2')
			};

		var crossTable = new ManageReportControl('crossTable', getMessage('crossTableTitle'),false);
		crossTable.mainTable = "regprogram";
		crossTable.byLocation = true;
		crossTable.firstGroupField = chart.firstGroupField;
		crossTable.secondGroupField = chart.secondGroupField;
		crossTable.firstGroupSortField = chart.firstGroupSortField;
		crossTable.secondGroupSortField = chart.secondGroupSortField;
		crossTable.firstCalcField = chart.firstCalcField;
		
		this.controls.push(chart);
		this.controls.push(crossTable);
		
		
	},
	
	/**
	 * call back method that will be called before control load.
	 */
	beforeControlLoad: function(control, panel,abCompRptCommManController) {
		new ManageReportLocList(control,panel,abCompRptCommManController);
	},
	
	openPopUpView: function(ob,control) {
		//get console restriction from parameter
		var consoleController = View.controllers.get('controllerConsole');
		
		//get console restriction from parameter
		var consoleRestriction = ' 1= 1 ';
		if(consoleController.consoleRestriction){
			consoleRestriction = consoleController.consoleRestriction;
		}
		
		this.getRestrictionForProgram(ob,control,consoleRestriction,consoleController);
		//Get restriction for requirment tab of pop-up
		
		View.openDialog('ab-comp-rpt-prg-pop-up.axvw',null, false,{maximize:true});
	},
	
	/**
	 * Get restriction for program tab of pop-up dialog
	 */
	getRestrictionForProgram:function(ob,control,consoleRestriction,consoleController){

		var clickObectrestrictionForLoc = ' 1=1 ';
		
		//for we clicked location restriction 
		if(ob.selectedChartData['regloc.firstGroupField'].indexOf('no value') != -1){
			clickObectrestrictionForLoc = this.getFirstGroupFieldName(control)+" IS NULL";
			   
		}else{
			clickObectrestrictionForLoc = this.getFirstGroupFieldName(control)+"='"+ob.selectedChartData['regloc.firstGroupField']+"'";
		}
		
		//for we clicked location restriction + consolerestriction except comp_level restriction 
		if(consoleRestriction.indexOf('AND')!=-1){
			//set pop up restriction union click object restriction and console restriction
			View.popUpRestrictionForConsoleAndParent = clickObectrestrictionForLoc + ' AND ' +consoleRestriction;
		}else{
			View.popUpRestrictionForConsoleAndParent = clickObectrestrictionForLoc;
		}
		
		//for complevel restriction
		var clickObectrestrictionForLevel=' 1=1 ';
		if(ob.selectedChartData['regloc.secondGroupField'].indexOf('no value') != -1){
			
			clickObectrestrictionForLevel=' (CASE WHEN progloc_lvl IS NOT NULL THEN progloc_lvl  '
				  +  ' WHEN reqloc_avg_lvl_loc IS NOT NULL THEN reqloc_avg_lvl_loc '
				  +  ' WHEN prog_lvl IS NOT NULL THEN prog_lvl '
				  +  ' WHEN prog_lvl_calc IS NOT NULL THEN prog_lvl_calc   '
				  +  ' ELSE  \'Not Entered\' END ) IS NULL';
		}else{
			clickObectrestrictionForLevel=  
				
				" (CASE WHEN progloc_lvl IS NOT NULL THEN progloc_lvl  "
				  +  " WHEN reqloc_avg_lvl_loc IS NOT NULL THEN reqloc_avg_lvl_loc"
				  +  " WHEN prog_lvl IS NOT NULL THEN prog_lvl "
				  +  " WHEN prog_lvl_calc IS NOT NULL THEN prog_lvl_calc   "
				  +  " ELSE  'Not Entered' END )='"+ob.selectedChartData['regloc.secondGroupField']+"'";
		}
		
		
		//get console restriction from parameter
		var complianceLevelRestriction = ' 1= 1 ';
		if(consoleController.complianceLevelRestriction){
			complianceLevelRestriction = consoleController.complianceLevelRestriction+" AND "+clickObectrestrictionForLevel;
		}
		View.popUpRestrictionForLevel=complianceLevelRestriction;
		
		View.whichView='countprogrambylevelandloc';
		//CONSOLE-AND-PARANET-RESTRICTION 
		
	},
	
	
	/**
	 * get first group field name from the click object and used for pop up restriction.
	 */
	getFirstGroupFieldName: function(control) {
		var name = control.firstGroupField.name;
		
		//for regn_id and city_id use two part PK
		if(name == 'regn_id'){
			name = '(ctry_id${sql.concat}\'-\'${sql.concat}regn_id)';
		}else if (name == 'city_id'){
			name = '(state_id${sql.concat}\'-\'${sql.concat}city_id)';
		}
		
		return name;
	}
});