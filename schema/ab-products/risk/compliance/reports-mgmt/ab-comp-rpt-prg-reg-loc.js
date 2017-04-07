/**
 */
var abCompRptProLvlLoctController = View.createController('abCompRptProLvlLoctController', {

	controls : [],

	/**
	 * set controller property values after view initialized.
	 */
	afterViewLoad : function() {
		
		
		var chart1 = new ManageReportControl('chart', getMessage('chartTitle1'),false);
		chart1.chartType = Ab.chart.ChartControl.prototype.CHARTTYPE_COLUMN;
		chart1.mainTable = "regprogram";
		chart1.byLocation = true;
		chart1.secondGroupField = {
			'name' : 'regulation',
			'title' : getMessage('secondGroupFieldTitle')
		};
		chart1.secondGroupSortField = {
			'name' : 'level_number',
			'title' : ''
		};
		chart1.firstCalcField = {
			'name' : 'count(distinct (case when reg_program is not null then regulation  ${sql.concat} reg_program else null end ))',
			'title' : getMessage('calcFieldTitle')
		};
		
		chart1.secondCalcField = {
				'name' : 'count( distinct ( case when reg_program is not null and reg_requirement is not null then  regulation  ${sql.concat} reg_program  ${sql.concat} reg_requirement else null end ))',
				'title' : getMessage('calcFieldTitle2')
			};
		
		
		var chart2 = new ManageReportControl('chart', getMessage('chartTitle2'),false);
		chart2.chartType = Ab.chart.ChartControl.prototype.CHARTTYPE_COLUMN;
		chart2.mainTable = "regprogram";
		chart2.byLocation = true;
		chart2.locationSecondGroup = true;
		chart2.firstGroupField = {
			'name' : 'regulation',
			'title' : getMessage('secondGroupFieldTitle')
		};
		chart2.firstGroupSortField = {
			'name' : 'level_number',
			'title' : ''
		};
		chart2.firstCalcField = {
			'name' : 'count(distinct reg_program)',
			'title' : getMessage('calcFieldTitle')
		};
		//for crosstable
		chart2.secondCalcField = {
				'name' : 'count( distinct reg_requirement)',
				'title' : getMessage('calcFieldTitle2')
			};
		
		
		//for crosstable
		
		var crossTable = new ManageReportControl('crossTable', getMessage('crossTableTitle'),false);
		crossTable.mainTable = "regprogram";
		crossTable.byLocation = true;
		crossTable.firstGroupField = chart1.firstGroupField;
		crossTable.secondGroupField = chart1.secondGroupField;
		crossTable.firstGroupSortField = chart1.firstGroupSortField;
		crossTable.secondGroupSortField = chart1.secondGroupSortField;
		crossTable.firstCalcField = chart1.firstCalcField;
		
		this.controls.push(chart1);
		this.controls.push(chart2);
		this.controls.push(crossTable);
		
		
	},
	
	/**
	 * call back method that will be called before control load.
	 */
	beforeControlLoad: function(control, panel,abCompRptCommManController) {
		if(control.locationSecondGroup){
			new ManageReportLocList(control,panel,abCompRptCommManController, true);			
			panel.addParameter('locationISNotNULL', " 1=1 ");
		}else{
			new ManageReportLocList(control,panel,abCompRptCommManController);
		}
	},
	
	/**
	 * Pop up a dialog when we click chart .
	 */
	openPopUpView: function(ob,control) {
		var consoleController = View.controllers.get('controllerConsole');
		
		//get console restriction from parameter
		var consoleRestriction = ' 1= 1 ';
		if(consoleController.consoleRestriction){
			consoleRestriction = consoleController.consoleRestriction;
		}
		
		//If the tab is Regulation by location chart
		if(control.firstGroupField.name=='regulation'){
			this.getPopUpRestriction(consoleController ,consoleRestriction,"regloc."+control.firstGroupField.name, ob.selectedChartData['regloc.firstGroupField'], this.getSecondGroupFieldName(control), ob.selectedChartData['regloc.secondGroupField']);
			
		}else{
			//if chart is location by regulation chart.
			this.getPopUpRestriction(consoleController ,consoleRestriction,"regloc."+control.secondGroupField.name, ob.selectedChartData['regloc.secondGroupField'],this.getFirstGroupFieldName(control), ob.selectedChartData['regloc.firstGroupField']);

		}
		
		View.openDialog('ab-comp-rpt-prg-pop-up.axvw',null, false,{maximize:true});
	},
	
	/**
	 * Default firstGroupFieldName is regulation. default secondGroupFieldName is location
	 */
	getPopUpRestriction:function(consoleController ,consoleRestriction,firstGroupFieldName,firstGroupFieldValue,secondGroupFieldName,secondGroupFieldValue){
		var clickObectrestrictionForLoc='';
		if(firstGroupFieldValue.indexOf('no value') != -1){
			clickObectrestrictionForLoc=firstGroupFieldName+' IS NULL';
		
		}else{
			clickObectrestrictionForLoc=firstGroupFieldName+"='"+firstGroupFieldValue+"'";
		}
		
		if(secondGroupFieldValue.indexOf('no value') != -1){
			clickObectrestrictionForLoc=clickObectrestrictionForLoc+" AND "+ secondGroupFieldName+' IS NULL';
		
		}else{
			clickObectrestrictionForLoc=clickObectrestrictionForLoc+" AND "+secondGroupFieldName+"='"+secondGroupFieldValue+"'";
		}
		
		//for we clicked location restriction + consolerestriction except comp_level restriction 
		if(consoleRestriction.indexOf('AND')!=-1){
			//set pop up restriction union click object restriction and console restriction
			View.popUpRestrictionForConsoleAndParent = clickObectrestrictionForLoc + ' AND ' +consoleRestriction;
		}else{
			View.popUpRestrictionForConsoleAndParent = clickObectrestrictionForLoc;
		}
		
		//get console restriction from parameter
		var complianceLevelRestriction = ' 1= 1 ';
		if(consoleController.complianceLevelRestriction){
			complianceLevelRestriction = consoleController.complianceLevelRestriction;
		}
		View.popUpRestrictionForLevel=complianceLevelRestriction;
		
		View.whichView='countprogrambyregulationandloc';
		
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
	},

	/**
	 * get first group field name from the click object and used for pop up restriction.
	 */
	getSecondGroupFieldName: function(control) {
		var name = control.secondGroupField.name;
		
		//for regn_id and city_id use two part PK
		if(name == 'regn_id'){
			name = '(ctry_id${sql.concat}\'-\'${sql.concat}regn_id)';
		}else if (name == 'city_id'){
			name = '(state_id${sql.concat}\'-\'${sql.concat}city_id)';
		}
		
		return name;
	}
	
});