/**
 */
var abCompRptProLvlRegtController = View.createController('abCompRptProLvlRegtController', {

	controls : [],

	/**
	 * set controller property values after view initialized.
	 */
	afterViewLoad : function() {
		var chart = new ManageReportControl('chart', getMessage('chartTitle'), false);
		chart.mainTable = "regprogram";
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
			'name' : 'count(reg_program)',
			'title' : getMessage('calcFieldTitle')
		};
		//for crosstable
		chart.secondCalcField = {
				'name' : 'sum( reg_requirement)',
				'title' : getMessage('calcFieldTitle2')
			};
		

		var crossTable = new ManageReportControl('crossTable', getMessage('crossTableTitle'), false);
		crossTable.mainTable = "regprogram";
		crossTable.firstGroupField = chart.firstGroupField;
		crossTable.secondGroupField = chart.secondGroupField;
		crossTable.firstGroupSortField = chart.firstGroupSortField;
		crossTable.secondGroupSortField = chart.secondGroupSortField;
		crossTable.firstCalcField = chart.firstCalcField;
		crossTable.secondCalcField = chart.secondCalcField;

		this.controls.push(chart);
		this.controls.push(crossTable);
	},
	
	openPopUpView: function(ob,control) {
		
		//get console restriction from parameter
		var consoleController = View.controllers.get('controllerConsole');
		
		//get console restriction from parameter
		var consoleRestriction = ' 1= 1 ';
		if(consoleController.consoleRestriction){
			consoleRestriction = consoleController.consoleRestriction;
		}
		var subQueryConsoleRestriction = ' 1= 1 ';
		if(consoleController.subQueryConsoleRestriction){
			subQueryConsoleRestriction = consoleController.subQueryConsoleRestriction;
		}
		
		
		var  clickObectrestrictionForProgram=this.getProgramResForPopup(consoleController,consoleRestriction,ob,control);
		var  clickObectrestrictionForRequirement=this.getRequirementResForPopup(consoleController,subQueryConsoleRestriction,ob,control);
		
		//when the count  view is not by location  ,others we use popUpRestrictionForConsoleAndParent
		View.popUpRestrictionForProgram =clickObectrestrictionForProgram;
		View.popUpRestrictionForRequirement =clickObectrestrictionForRequirement;
		View.whichView='countprogramwithoutlocation';
		View.openDialog('ab-comp-rpt-prg-pop-up.axvw',null, false,{maximize:true});
		
	},
	
	getProgramResForPopup:function(consoleController,consoleRestriction,ob,control){
		
		
		var clickObectrestriction = ' 1=1 ';
		
		// firstGroupName is comp_level
		if(ob.selectedChartData['regloc.secondGroupField'].indexOf('no value') != -1){
			 
			clickObectrestriction=' ${sql.isNull(\'(case when regprogram.comp_level IS NOT NULL THEN regprogram.comp_level_calc ELSE regprogram.comp_level END)\', "\'Not Entered\'")} IS NULL ';
		}else{
			
			clickObectrestriction=  ' ${sql.isNull(\'(case when regprogram.comp_level IS NOT NULL THEN regprogram.comp_level_calc ELSE regprogram.comp_level END)\', "\'Not Entered\'")} =\''  +ob.selectedChartData['regloc.secondGroupField']+'\'';
		}
		
		if(ob.selectedChartData['regloc.firstGroupField'].indexOf('no value') != -1){
			clickObectrestriction=clickObectrestriction+" and regprogram."+control.firstGroupField.name+" IS NULL";
		}else{
			clickObectrestriction=clickObectrestriction+" and regprogram."+control.firstGroupField.name+"='"+ ob.selectedChartData['regloc.firstGroupField']+"'";

		}
		return clickObectrestriction+" AND "+consoleRestriction ; 
	},
	
	getRequirementResForPopup:function(consoleController,subQueryConsoleRestriction,ob,control){
		
		var clickObectrestriction = ' 1=1 ';
		
		return clickObectrestriction+" AND regrequirement.status = 'Active' AND  "+subQueryConsoleRestriction ; 
		
	}
});