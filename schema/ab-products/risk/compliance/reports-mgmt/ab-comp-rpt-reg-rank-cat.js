/**
 */
var abCompRptProLvlRegtController = View.createController('abCompRptProLvlRegtController', {

	controls : [],

	/**
	 * set controller property values after view initialized.
	 */
	afterViewLoad : function() {
		var chart = new ManageReportControl('chart', getMessage('chartTitle'));
		chart.mainTable = "regulation";
		chart.firstGroupField = {
			'name' : 'reg_rank',
			'title' : getMessage('firstGroupFieldTitle')
		};
		chart.firstGroupFieldDef = 'rankFiledDef';
		chart.secondGroupField = {
			'name' : 'reg_cat',
			'title' : getMessage('secondGroupFieldTitle')
		};
		chart.firstGroupSortField = {
			'name' : 'reg_rank',
			'title' : ''
		};
		chart.secondGroupSortField = {
			'name' : 'reg_cat',
			'title' : ''
		};
		chart.firstCalcField = {
			'name' : 'count(distinct regulation)',
			'title' : getMessage('calcFieldTitle')
		};
		//for crosstable
		chart.secondCalcField = {
				'name' : 'sum( reg_program)',
				'title' : getMessage('calcFieldTitle2')
			};
		

		var crossTable = new ManageReportControl('crossTable', getMessage('crossTableTitle'));
		crossTable.mainTable = "regulation";
		crossTable.firstGroupField = chart.firstGroupField;
		crossTable.secondGroupField = chart.secondGroupField;
		crossTable.firstGroupSortField = chart.firstGroupSortField;
		crossTable.secondGroupSortField = chart.secondGroupSortField;
		crossTable.firstCalcField = chart.firstCalcField;
		crossTable.secondCalcField = chart.secondCalcField;
		crossTable.firstGroupFieldDef = 'rankFiledDef';
		
		this.controls.push(chart);
		this.controls.push(crossTable);
	},
	
	openPopUpView: function(ob,control) {
		//get console restriction from parameter
		var consoleController = View.controllers.get('controllerConsole');
		
		this.getRegulationResForPopup(consoleController,ob,control);
		this.getProgramResForPopup(consoleController);
		this.getRequirementResForPopup(consoleController);
		
		View.whichView='countregulationbyrankandcat';
		View.openDialog('ab-comp-rpt-reg-pop-up.axvw',null, false,{maximize:true});
	},
	
	/**
	 *  Get restriction for regulation tab
	 */
	getRegulationResForPopup:function(consoleController,ob,control){
		//get console restriction from parameter
		var consoleRestriction = ' 1= 1 ';
		if(consoleController.consoleRestriction){
			consoleRestriction = consoleController.consoleRestriction;
		}
		
		if(ob.selectedChartData['regloc.firstGroupField'].indexOf('no value')==-1){
			View.popUpRestrictionForRegulation = " regulation."+control.firstGroupField.name+"='"+ob.selectedChartData['regloc.firstGroupField']+"'";
			
		}else{
			View.popUpRestrictionForRegulation = " regulation."+control.firstGroupField.name+" IS NULL";
		}
		
		if(ob.selectedChartData['regloc.secondGroupField'].indexOf('no value')==-1){
			View.popUpRestrictionForRegulation=View.popUpRestrictionForRegulation+" and regulation."+control.secondGroupField.name+"='"+ob.selectedChartData['regloc.secondGroupField']+"'";
		}else{
			View.popUpRestrictionForRegulation=View.popUpRestrictionForRegulation+ " and regulation."+control.secondGroupField.name+" IS NULL";
		}
		
		View.popUpRestrictionForRegulation=View.popUpRestrictionForRegulation+" AND " +consoleRestriction;
	
		
	},
	
	/**
	 * Get restriction for program tab
	 */
	getProgramResForPopup:function(consoleController ){
		
		//get console restriction from parameter
		var subQueryConsoleRestriction = ' 1= 1 ';
		if(consoleController.subQueryConsoleRestriction){
			subQueryConsoleRestriction = consoleController.subQueryConsoleRestriction;
		}
		
		View.popUpRestrictionForProgram=subQueryConsoleRestriction;
	
	},
	
	/**
	 * Get restriction for requirement tab
	 */
	getRequirementResForPopup:function(consoleController){
		//get console restriction from parameter
		var subQueryConsoleRestrictionForPopUpRequirmentTab = ' 1= 1 ';
		if(consoleController.subQueryConsoleRestrictionForPopUpRequirmentTab){
			subQueryConsoleRestrictionForPopUpRequirmentTab = consoleController.subQueryConsoleRestrictionForPopUpRequirmentTab;
		}
		
		View.popUpRestrictionForRequirement=subQueryConsoleRestrictionForPopUpRequirmentTab;
		
	}
});