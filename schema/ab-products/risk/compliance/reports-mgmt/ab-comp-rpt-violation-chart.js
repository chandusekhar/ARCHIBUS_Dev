/**
 * @author Guo Jiangtao
 */
var abCompRptRegLvlLocController = View.createController('abCompRptRegLvlLocController', {

	controls : [],

	/**
	 * set controller property values after view initialized.
	 */
	afterViewLoad : function() {

		//create chart control
		var chart = new ManageReportControl('chart', getMessage('chartTitle'));

		//set chart control properites
		chart.mainTable = "regviolation";
		chart.byLocation = true;
		chart.firstGroupField = {
			'name' : 'severity',
			'title' : getMessage('secondGroupFieldTitle')
		};
		chart.firstGroupFieldDef = 'severityFiledDef'
		chart.secondGroupField = {
			'name' : 'severity',
			'title' : getMessage('secondGroupFieldTitle')
		};
		chart.secondGroupFieldDef = 'severityFiledDef'
		chart.secondGroupSortField = chart.secondGroupField
		chart.firstCalcField = {
			'name' : 'count(violation_num)',
			'title' : getMessage('calcFieldTitle')
		};
		
		//create cross table control
		var crossTable = new ManageReportControl('crossTable', getMessage('crossTableTitle'));

		//set coss table control properites
		crossTable.mainTable = "regviolation";
		crossTable.byLocation = true;
		crossTable.firstGroupField = chart.firstGroupField;
		crossTable.firstGroupFieldDef = 'severityFiledDef'
		crossTable.secondGroupField = chart.secondGroupField;
		crossTable.secondGroupFieldDef = 'severityFiledDef'
		crossTable.firstGroupSortField = chart.firstGroupSortField;
		crossTable.secondGroupSortField = chart.secondGroupSortField;
		crossTable.firstCalcField = chart.firstCalcField;
		
		//create line chart control
		var lineChart = new ManageReportControl('lineChart', getMessage('lineChartTitle'));
		lineChart.mainTable = "regviolation";
		lineChart.byLocation = true;
		lineChart.firstGroupField = {
			'name' : "${sql.yearOf('date_assessed')}",
			'title' : getMessage('yearAsset')
		};
		lineChart.firstGroupSortField = lineChart.firstGroupField;
		lineChart.firstCalcField = chart.firstCalcField;
		lineChart.permanentParameter = ' date_assessed is not null ';
		
		//put all the three controls to main controller's gloable varible controls.
		this.controls.push(chart);
		this.controls.push(crossTable);
		this.controls.push(lineChart);

	},

	/**
	 * call back method that will be called before control load.
	 */
	beforeControlLoad: function(control, panel, abCompRptCommManController) {

		if(control.type != 'lineChart'){
			var locList= new ManageReportLocList(control,panel,abCompRptCommManController);
			new ManageReportVialationChartByList(control,panel,locList, abCompRptCommManController);
		}else{
			var locList= new ManageReportLocList(control,panel,abCompRptCommManController,true);
			new ManageReportVialationLineChartByList(control,panel,locList);
		}

	},
	
	openPopUpView: function(ob,control) {
		//get console controller
		var consoleController = View.controllers.get('controllerConsole');
		
		//get console restriction from parameter
		var consoleRestriction = ' 1= 1 ';
		if(consoleController.consoleRestriction){
			consoleRestriction =  consoleController.consoleRestriction;
		}

		//get the first group by restriction from the click object
		var restriction = this.getPopUpSqlField(control.firstGroupField.name)+this.getPopUpSqlClauseByValue(ob.selectedChartData['regloc.firstGroupField']);
		
		//get the second group by restriction from the click object if exist second group by field
		if(ob.selectedChartData['regloc.secondGroupField']){
			restriction+=" and "+ this.getPopUpSqlField(control.secondGroupField.name)+this.getPopUpSqlClauseByValue(ob.selectedChartData['regloc.secondGroupField']);
		}
		
		//open the pop up view
		View.mode = 'report';
		View.popUpRestriction = restriction + ' and ' + consoleRestriction;
		View.openDialog('ab-comp-violation-grid-rpt.axvw',null, null,{maximize:true});
		
	},
	
	getPopUpSqlField: function(field) {

		if(field=="(regulation${sql.concat}'-'${sql.concat}reg_program)"){
			return "(regviolation.regulation${sql.concat}'-'${sql.concat}regviolation.reg_program)";
		}else if(field=='regulation' || field=='reg_program'){
			return 'regviolation.'+field;
		}else if(field=='priority'){
			return 'regrequirement.'+field;
		}else if(field=='reg_rank'){
			return 'regulation.'+field;
		}else if(field=='regn_id'){
			return '(ctry_id${sql.concat}\'-\'${sql.concat}regn_id)';
		}else if(field=='city_id'){
			return '(state_id${sql.concat}\'-\'${sql.concat}city_id)';
		}else{
			return field;
		}

	},
	
	getPopUpSqlClauseByValue: function(value) {

		if(value.indexOf('no value') != -1){
			return ' IS NULL ';
		}else{
			return " = '"+value+"'";
		}

	}
});