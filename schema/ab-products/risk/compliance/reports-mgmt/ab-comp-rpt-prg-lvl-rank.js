var abCompRptRegLvlPriorityController = View.createController('abCompRptRegLvlPriorityController', {

	controls : [],

	/**
	 * set controller property values after view initialized.
	 */
	afterViewLoad : function() {

		var chart1 = new ManageReportControl('chart', getMessage('chartTitle1'));
		chart1.mainTable = "regprogram";		
		chart1.firstGroupField = {
			'name' : 'comp_level',
			'title' : getMessage('firstGroupFieldTitle')
		};
		
		chart1.secondGroupField = {
			'name' : 'reg_rank',
			'title' : getMessage('secondGroupFieldTitle')
		};
		
		chart1.secondGroupFieldDef = 'rankFiledDef';
		chart1.firstGroupSortField = {
			'name' : 'level_number',
			'title' : ''
		};
		chart1.secondGroupSortField = {
			'name' : 'reg_rank',
			'title' : ''
		};
		chart1.firstCalcField = {
			'name' : 'count(reg_program)',
			'title' : getMessage('calcFieldTitle')
		};
		
		chart1.secondCalcField = {
				'name' : 'sum( reg_requirement)',
				'title' : getMessage('calcFieldTitle2')
			};
		var chart2 = new ManageReportControl('chart', getMessage('chartTitle2'));
		chart2.mainTable = "regprogram";
		chart2.firstGroupField = chart1.secondGroupField;
		chart2.secondGroupField = chart1.firstGroupField;
		chart2.firstGroupSortField = chart1.secondGroupSortField;
		chart2.secondGroupSortField = chart1.firstGroupSortField;
		chart2.firstCalcField = chart1.firstCalcField;
		chart2.firstGroupFieldDef = 'rankFiledDef';
		
		var scoreBoard = new ManageReportControl('scoreBoard', getMessage('scoreBoardTitle'));
		scoreBoard.mainTable = "regprogram";
		scoreBoard.firstGroupField = chart1.firstGroupField;
		scoreBoard.secondGroupField = chart1.secondGroupField;
		scoreBoard.firstGroupSortField = chart1.firstGroupSortField;
		scoreBoard.secondGroupSortField = chart1.secondGroupSortField;
		scoreBoard.firstCalcField = chart1.firstCalcField;
		scoreBoard.secondCalcField = chart1.secondCalcField;
		
    // KB 3037560, 3038720		
		this.controls.push(chart2);
		this.controls.push(chart1);
		this.controls.push(scoreBoard);
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
		var  clickObectrestrictionForProgram='';
		var  clickObectrestrictionForRequirement='';
		
		//first chart'firstGroupField.name is comp_level and secondGroupField.name is reg_rank
		if(control.firstGroupField.name=='comp_level'){
			clickObectrestrictionForProgram=this.getProgramResForPopup(consoleController,consoleRestriction,ob,control,null,ob.selectedChartData['regloc.firstGroupField'],control.secondGroupField.name,ob.selectedChartData['regloc.secondGroupField']);
			clickObectrestrictionForRequirement=this.getRequirementResForPopup(consoleController,subQueryConsoleRestriction,ob,control,null,ob.selectedChartData['regloc.firstGroupField']);
		}else{
			clickObectrestrictionForProgram=this.getProgramResForPopup(consoleController,consoleRestriction,ob,control,null,ob.selectedChartData['regloc.secondGroupField'],control.firstGroupField.name,ob.selectedChartData['regloc.firstGroupField']);
			clickObectrestrictionForRequirement=this.getRequirementResForPopup(consoleController,subQueryConsoleRestriction,ob,control,null,ob.selectedChartData['regloc.secondGroupField']);
		}
		
		//when the count  view is not by location  ,others we use popUpRestrictionForConsoleAndParent
		View.popUpRestrictionForProgram =clickObectrestrictionForProgram;
		View.popUpRestrictionForRequirement =clickObectrestrictionForRequirement;
		View.whichView='countprogramwithoutlocation';
		View.openDialog('ab-comp-rpt-prg-pop-up.axvw',null, false,{maximize:true});
		
	},
	
	/**
	 * Get restriction for program tab
	 */
	getProgramResForPopup:function(consoleController,consoleRestriction,ob,control ,firstGroupFieldName,firstGroupFieldValue,secondGroupFieldName,secondGroupFieldValue){
		
		
		var clickObectrestriction = ' 1=1 ';
		if(firstGroupFieldValue.indexOf('no value') != -1){
			 
			clickObectrestriction=' ${sql.isNull(\'(case when regprogram.comp_level IS NULL THEN regprogram.comp_level ELSE regprogram.comp_level_calc END)\', "\'Not Entered\'")} IS NULL ';
		}else{
			
			clickObectrestriction=  ' ${sql.isNull(\'(case when regprogram.comp_level IS NULL THEN regprogram.comp_level ELSE regprogram.comp_level_calc END)\', "\'Not Entered\'")} =\''  + firstGroupFieldValue+'\'';
		}
		if(secondGroupFieldValue.indexOf('no value') != -1){
			clickObectrestriction=clickObectrestriction+" and regulation."+secondGroupFieldName+" IS NULL";
		}else{
			clickObectrestriction=clickObectrestriction+" and regulation."+secondGroupFieldName+"='"+secondGroupFieldValue+"'";

		}
		return clickObectrestriction+" AND "+consoleRestriction ; 
	},
	
	/**
	 * Get restriction for requirement tab
	 */
	getRequirementResForPopup:function(consoleController,subQueryConsoleRestriction,ob,control,firstGroupFieldName,firstGroupFieldValue){
		var clickObectrestriction = ' 1=1 ';
		//subQueryConsoleRestriction only contain requirement and location restriction . 
		return clickObectrestriction+"  AND regrequirement.status = 'Active' AND "+subQueryConsoleRestriction ; 
		
	}
});