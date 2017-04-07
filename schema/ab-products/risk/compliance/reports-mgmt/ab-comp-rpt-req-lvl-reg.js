/**
 * @author Guo Jiangtao
 */
var abCompRptRegLvlRegtController = View.createController('abCompRptRegLvlRegtController', {

	controls : [],

	/**
	 * set controller property values after view initialized.
	 */
	afterViewLoad : function() {
		var chart = new ManageReportControl('chart', getMessage('chartTitle'), false);
		chart.mainTable = "regrequirement";
		chart.firstGroupField = {
			'name' : 'regulation',
			'title' : getMessage('firstGroupFieldTitle')
		};
		chart.secondGroupField = {
			'name' : 'comp_level',
			'title' : getMessage('secondGroupFieldTitle')
		};
		chart.firstGroupSortField = {
			'name' : 'regulation',
			'title' : ''
		};
		chart.secondGroupSortField = {
			'name' : 'level_number',
			'title' : ''
		};
		chart.firstCalcField = {
			'name' : 'count(1)',
			'title' : getMessage('calcFieldTitle')
		};

		var crossTable = new ManageReportControl('crossTable', getMessage('crossTableTitle'), false);
		crossTable.mainTable = "regrequirement";
		crossTable.firstGroupField = chart.firstGroupField;
		crossTable.secondGroupField = chart.secondGroupField;
		crossTable.firstGroupSortField = chart.firstGroupSortField;
		crossTable.secondGroupSortField = chart.secondGroupSortField;
		crossTable.firstCalcField = chart.firstCalcField;

		this.controls.push(chart);
		this.controls.push(crossTable);
	},
	
	openPopUpView: function(ob,control) {
		
		//get console controller
		var consoleController = View.controllers.get('controllerConsole');
		
		//get console restriction from parameter
		var consoleRestriction = ' 1= 1 ';
		if(consoleController.consoleRestriction){
			consoleRestriction  = consoleController.consoleRestriction;
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
	
	getPopUpSqlClauseByValue: function(value) {
		if(value.indexOf('no value') != -1){
			return ' IS NULL ';
		}else{
			return " = '"+value+"'";
		}
	}
});