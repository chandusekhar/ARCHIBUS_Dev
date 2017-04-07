/**
 */
var abCompRptProLvlLoctController = View.createController('abCompRptProLvlLoctController', {

	controls : [],

	/**
	 * set controller property values after view initialized.
	 */
	afterViewLoad : function() {
		
		
		var chart = new ManageReportControl('chart', getMessage('chartTitle'),false);
		chart.mainTable = "regulation";
		chart.byLocation = true;
		chart.secondGroupField = {
			'name' : 'reg_rank',
			'title' : getMessage('secondGroupFieldTitle')
		};
		chart.secondGroupFieldDef = 'rankFiledDef';
		chart.secondGroupSortField = {
			'name' : 'reg_rank',
			'title' : getMessage('secondGroupFieldTitle')
		};
		chart.firstCalcField = {
			'name' : 'count(distinct regulation)',
			'title' : getMessage('calcFieldTitle')
		};
		
		//for crosstable
		chart.secondCalcField = {
				'name' : 'count( distinct (case when reg_program is not null then  regulation ${sql.concat} reg_program else null end ))',
				'title' : getMessage('calcFieldTitle2')
			};
		
		var crossTable = new ManageReportControl('crossTable', getMessage('crossTableTitle'),false);
		crossTable.mainTable = "regulation";
		crossTable.byLocation = true;
		crossTable.firstGroupField = chart.firstGroupField;
		crossTable.secondGroupField = chart.secondGroupField;
		crossTable.firstGroupSortField = chart.firstGroupSortField;
		crossTable.secondGroupSortField = chart.secondGroupSortField;
		crossTable.firstCalcField = chart.firstCalcField;
		crossTable.secondCalcField = chart.secondCalcField;
		crossTable.firstGroupField = 'rankFiledDef';
		
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
		var consoleController = View.controllers.get('controllerConsole');
		
		//get console restriction from parameter
		var consoleRestriction = ' 1= 1 ';
		if(consoleController.consoleRestriction){
			consoleRestriction = consoleController.consoleRestriction;
		}
		var clickObectrestriction = ' 1=1 ';
		
		if(ob.selectedChartData['regloc.firstGroupField'].indexOf('no value') != -1){
			clickObectrestriction = "compliance_locations."+control.firstGroupField.name+" IS NULL";
		}else{
			clickObectrestriction = "compliance_locations."+control.firstGroupField.name+"='"+ob.selectedChartData['regloc.firstGroupField']+"'";
		}
		
		if(ob.selectedChartData['regloc.secondGroupField'].indexOf('no value') != -1){
			clickObectrestriction=clickObectrestriction+ " AND  regulation."+control.secondGroupField.name+" IS NULL";
		}else{
			clickObectrestriction=clickObectrestriction+ " AND regulation."+control.secondGroupField.name+"='"+ob.selectedChartData['regloc.secondGroupField']+"'";
		}
		View.whichView = 'countregulationbylocandrank';
		View.popUpRestrictionForConsoleAndParent = clickObectrestriction + ' AND ' + consoleRestriction;
		
		View.openDialog('ab-comp-rpt-reg-pop-up.axvw',null, false,{maximize:true});
	}
});