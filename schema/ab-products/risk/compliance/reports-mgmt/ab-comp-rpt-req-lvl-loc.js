/**
 * @author Guo Jiangtao
 */
var abCompRptRegLvlLocController = View.createController('abCompRptRegLvlLocController', {

	controls : [],

	/**
	 * set controller property values after view initialized.
	 */
	afterViewLoad : function() {
		var chart = new ManageReportControl('chart', getMessage('chartTitle'), false);
		chart.mainTable = "regrequirement";
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
			'name' : 'count(distinct reg_requirement ${sql.concat} reg_program ${sql.concat} regulation)',
			'title' : getMessage('calcFieldTitle')
		};

		var crossTable = new ManageReportControl('crossTable', getMessage('crossTableTitle'), false);
		crossTable.mainTable = "regrequirement";
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
		//get console controller
		var consoleController = View.controllers.get('controllerConsole');
		
		//get console restriction from parameter
		var consoleRestriction = ' 1= 1 ';
		if(consoleController.consoleRestriction){
			consoleRestriction = consoleController.consoleRestriction;
		}
		
		var clickObectrestriction = ' 1=1 ';
		if(ob.selectedChartData['regloc.firstGroupField'].indexOf('no value') != -1){
			clickObectrestriction = 
				
			   " (exists(select 1 from regloc left join compliance_locations on regloc.location_id = compliance_locations.location_id where "
			   +this.getFirstGroupFieldName(control)+" IS NULL"
			   +"  and regloc.reg_requirement = regrequirement.reg_requirement  "
			   +"  and regloc.reg_program = regrequirement.reg_program"
			   +"  and regloc.regulation = regrequirement.regulation"
			   +"  and (CASE WHEN regloc.comp_level IS NOT NULL THEN regloc.comp_level WHEN regrequirement.comp_level IS NOT NULL " 
			   +"     THEN  regrequirement.comp_level  WHEN regloc.comp_level_calc IS NOT NULL THEN  regloc.comp_level_calc WHEN regprogram.comp_level IS NOT NULL " 
			   +"     THEN regprogram.comp_level ELSE \'Not Entered\' END)"
			   +"        ='"+ob.selectedChartData['regloc.secondGroupField']+"'"
			   +"  ) " 
			   +"  OR not exists(select 1 from regloc where regloc.reg_requirement = regrequirement.reg_requirement"
			   +"    and  regloc.reg_program = regrequirement.reg_program"          
			   +"    and  regloc.regulation = regrequirement.regulation)"             
			   +" )";
		}else{
			clickObectrestriction = 
			   " exists(select 1 from regloc left join compliance_locations on regloc.location_id = compliance_locations.location_id where "
			   +this.getFirstGroupFieldName(control)+"='"+ob.selectedChartData['regloc.firstGroupField']+"'"
			   +" and (CASE WHEN regloc.comp_level IS NOT NULL THEN regloc.comp_level WHEN regrequirement.comp_level IS NOT NULL " 
			   + " THEN  regrequirement.comp_level  WHEN regloc.comp_level_calc IS NOT NULL THEN  regloc.comp_level_calc WHEN regprogram.comp_level IS NOT NULL " 
			   + " THEN regprogram.comp_level ELSE \'Not Entered\' END)"
			   +" ='"+ob.selectedChartData['regloc.secondGroupField']+"'"
			   +" and regloc.reg_requirement = regrequirement.reg_requirement  "
			   +" and regloc.reg_program = regrequirement.reg_program"
			   +" and regloc.regulation = regrequirement.regulation)";
		}
		
		//set pop up restriction union click object restriction and console restriction
		View.popUpRestriction = clickObectrestriction + ' and ' + consoleRestriction;
		
		//open the pop up view show as maximize
		View.openDialog('ab-comp-rpt-req-pop-up.axvw',null, false,{maximize:true});
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