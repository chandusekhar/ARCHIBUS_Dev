/**
 * @author Guo Jiangtao
 */
var abCompRptRegLvlPriorityController = View.createController('abCompRptRegLvlPriorityController', {

	controls : [],

	/**
	 * set controller property values after view initialized.
	 */
	afterViewLoad : function() {

		var chart1 = new ManageReportControl('chart', getMessage('chartTitle1'));
		chart1.mainTable = "regrequirement";
		chart1.firstGroupField = {
			'name' : 'comp_level',
			'title' : getMessage('firstGroupFieldTitle')
		};
		chart1.secondGroupField = {
			'name' : 'priority',
			'title' : getMessage('secondGroupFieldTitle')
		};
		chart1.secondGroupFieldDef = 'priorityFiledDef';
		chart1.firstGroupSortField = {
			'name' : 'level_number',
			'title' : ''
		};
		chart1.secondGroupSortField = {
			'name' : 'priority',
			'title' : ''
		};
		chart1.firstCalcField = {
			'name' : 'count(1)',
			'title' : getMessage('calcFieldTitle')
		};

		var chart2 = new ManageReportControl('chart', getMessage('chartTitle2'));
		chart2.mainTable = chart1.mainTable;
		chart2.firstGroupField = chart1.secondGroupField;
		chart2.secondGroupField = chart1.firstGroupField;
		chart2.firstGroupSortField = chart1.secondGroupSortField;
		chart2.secondGroupSortField = chart1.firstGroupSortField;
		chart2.firstCalcField = chart1.firstCalcField;
		chart2.firstGroupFieldDef = 'priorityFiledDef';

		var scoreBoard = new ManageReportControl('scoreBoard',  getMessage('chartTitle3'));
		scoreBoard.mainTable = chart1.mainTable;
		scoreBoard.firstGroupField = chart1.firstGroupField;
		scoreBoard.secondGroupField = chart1.secondGroupField;
		scoreBoard.firstGroupSortField = chart1.firstGroupSortField;
		scoreBoard.secondGroupSortField = chart1.secondGroupSortField;
		scoreBoard.firstCalcField = chart1.firstCalcField;

    // KB 3037560, 3038720		
		this.controls.push(chart2);
		this.controls.push(chart1);
		this.controls.push(scoreBoard);
	},
	
	/**
	 * open pop up view.
	 */
	openPopUpView: function(ob,control) {
		//get console controller
		var consoleController = View.controllers.get('controllerConsole');
		
		//get console restriction from parameter
		var consoleRestriction = ' 1= 1 ';
		if(consoleController.consoleRestriction){
			consoleRestriction = consoleController.consoleRestriction;
		}

		//get restriction from click object
		var clickObectrestriction = this.getPopUpSqlFieldName(control.firstGroupField.name)+this.getPopUpSqlClauseByValue(ob.selectedChartData['regloc.firstGroupField'])
		   +' and '+this.getPopUpSqlFieldName(control.secondGroupField.name)+this.getPopUpSqlClauseByValue(ob.selectedChartData['regloc.secondGroupField']);
		
		//set pop up restriction union click object restriction and console restriction
		View.popUpRestriction = clickObectrestriction + ' and ' + consoleRestriction;
		
		//open the pop up view show as maximize
		View.openDialog('ab-comp-rpt-req-pop-up.axvw',null, false,{maximize:true});
		
	},
	
	/**
	 * get pop up view restriction filed name.
	 */
	getPopUpSqlFieldName: function(name) {
		if(name=='comp_level'){
			name = '(${sql.isNull(\'(case when regrequirement.comp_level IS NULL THEN regprogram.comp_level ELSE regrequirement.comp_level END)\', "\'Not Entered\'")} )'
		}else{
			name = " regrequirement."+name;
		}
		
		return name;
	},
	
	/**
	 * get pop up view restriction filed value.
	 */
	getPopUpSqlClauseByValue: function(value) {
		if(value.indexOf('no value') != -1){
			return ' IS NULL ';
		}else{
			return " = '"+value+"'";
		}
	}
});