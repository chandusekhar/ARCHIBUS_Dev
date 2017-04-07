/**
 */
var abCompRptProLvlRegtController = View.createController('abCompRptProLvlRegtController', {
	/*
	 * list all the locations.
	 */
	locations: ['ctry_id', 'state_id', 'regn_id', 'city_id', 'county_id', 'site_id', 'pr_id', 'bl_id'],

	controls : [],
	
	locListDisabled: true,
	
	//permanent Parameter
	permanentParameter: '',
	/*
	 * check if with location condition.
	 */
	isLocation: false,

	/*
	 * check if first drop down list selected 'Regulation by Location' or 'Location by Regulation',
	 * determine use custom comp_level overwrite. use in file: ab-comp-rpt-req-expired-console.js
	 */
	isRegulationLocation: false,
	
	/**
	 * set controller property values after view initialized.
	 */
	afterViewLoad : function() {
		var chart = new ManageReportControl('chart', getMessage('chartTitle'));
		chart.mainTable = "regrequirement";		
	
		chart.firstGroupField = {
			'name' : 'priority',
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
		chart.firstGroupFieldDef = 'priorityFiledDef';
		chart.firstCalcField = {
			'name' : 'count(distinct reg_requirement ${sql.concat} reg_program ${sql.concat} regulation)',
			'title' : getMessage('calcFieldTitle')
		};

		var crossTable = new ManageReportControl('crossTable', getMessage('crossTableTitle'));
		crossTable.mainTable = "regrequirement";
		crossTable.firstGroupField = chart.firstGroupField;
		crossTable.secondGroupField = chart.secondGroupField;
		crossTable.firstGroupSortField = chart.firstGroupSortField;
		crossTable.secondGroupSortField = chart.secondGroupSortField;
		crossTable.firstCalcField = chart.firstCalcField;

		
		this.controls.push(chart);
		this.controls.push(crossTable);
	},
	
	afterInitialDataFetch : function() {
		
		this.costomlizeConsole();

		consoleController.abCompDrilldownConsole_onShow();
	
	},
	
	 /**
     * Requirement Type is a virtual field with static text string value of "License or Permit". 
	 * The virtual field is not used in the restriction, as that is already specified in the permanent 
	 * restriction below.  Requirement Status is disabled and set to "Active"
     */
    costomlizeConsole: function(){
    	
    	var regreq_type = this.abCompDrilldownConsole.getFieldElement("regrequirement.regreq_type");
    	var license = "License";
    	var permit = "Permit";
    	var objLicense = findOption(regreq_type, license);
    	var objPermit = findOption(regreq_type, permit);
    	regreq_type.innerHTML = "";
    	addOption(regreq_type, "", "");
    	addOption(regreq_type, objLicense.value, objLicense.name);
    	addOption(regreq_type, objPermit.value, objPermit.name);
    	
    	this.abCompDrilldownConsole.setFieldValue("regrequirement.status", 'Active');
    	this.abCompDrilldownConsole.enableField("regrequirement.status", false);
    },
	
	/**
	 * call back method that will be called before control load.
	 */
	beforeControlLoad: function(control, panel, abCompRptCommManController) {
		//refactor: declare globle variable 'permanentParameter' and set value.
		this.permanentParameter = "regrequirement.regreq_type in ('License', 'Permit') and regrequirement.status = 'Active' and (regrequirement.date_expire< ${sql.currentDate}) ";
		control.permanentParameter = this.permanentParameter;
		control.mainTable = "regrequirement";

		var locList= new ManageReportLocList(control,panel,abCompRptCommManController);
		new ManageReportVialationChartByList(control,panel,locList,abCompRptCommManController);		
	},
	
	/**
	 * check if location involved when click chart.
	 */
	checkIfContiansLocation: function(name){
		for(var i=0; i< this.locations.length; i++){
			if(name == this.locations[i]){
				return true;
			}
		}
		return false;
	},
	
	/**
	 * call when click chart or crossTable.
	 */
	openPopUpView: function(ob,control) {

		//get console restriction from parameter
		var consoleController = View.controllers.get('controllerConsole');
		
		//get console restriction from parameter
		var consoleRestriction = ' 1= 1 ';
		if(consoleController.consoleRestriction){
			consoleRestriction = consoleController.consoleRestriction;
		}
		
		var restriction = "";//get the restriction from the click object
			//check if exists activity_log related location_id.
			var firstFieldCheck = this.checkIfContiansLocation(control.firstGroupField.name);
			var firstFieldValueCheck = ob.selectedChartData['regloc.firstGroupField'].indexOf('no value') == -1&&this.checkIfContiansLocation(control.firstGroupField.name);
			var secondFieldCheck = this.checkIfContiansLocation(control.secondGroupField.name);
			var secondFieldValueCheck = ob.selectedChartData['regloc.secondGroupField'].indexOf('no value') == -1&&this.checkIfContiansLocation(control.firstGroupField.name);
			
			if((typeof control.byLocation != "undefined"&&control.byLocation==true)&&((firstFieldCheck&&firstFieldValueCheck)||(secondFieldCheck&&secondFieldValueCheck))){
				this.isLocation = true;
				// add 'permanentParameter' and change table name for comp_level.
				restriction =" exists (select 1 from compliance_locations, regloc where " +
				" regrequirement.reg_requirement = regloc.reg_requirement and " +
				" regprogram.reg_program = regloc.reg_program and " +
				" regulation.regulation = regloc.regulation and " +
				" compliance_locations.location_id = regloc.location_id and " +
				this.getPopUpSqlField(control.firstGroupField.name)+this.getPopUpSqlClauseByValue(ob.selectedChartData['regloc.firstGroupField'])
				+" and "+ this.getPopUpSqlField(control.secondGroupField.name)+this.getPopUpSqlClauseByValue(ob.selectedChartData['regloc.secondGroupField'])
				+" ) and "+  this.permanentParameter;
			}else{
				this.isLocation = false;
				// add 'permanentParameter' and change table name for comp_level.
				restriction =this.getPopUpSqlField(control.firstGroupField.name)+this.getPopUpSqlClauseByValue(ob.selectedChartData['regloc.firstGroupField'])
				+" and "+ this.getPopUpSqlField(control.secondGroupField.name)+this.getPopUpSqlClauseByValue(ob.selectedChartData['regloc.secondGroupField']) 
				+" and "+  this.permanentParameter;
			}
			View.mode = 'report';
			View.popUpRestriction = restriction+" AND "+consoleRestriction ;
			View.openDialog('ab-comp-rpt-req-pop-up.axvw',null, null,{maximize:true});
	},
	
	/**
	 * call by 'openPopUpView'.
	 */
	getPopUpSqlField: function(field) {
		
		if(field=="(regulation${sql.concat}'-'${sql.concat}reg_program)"){
			return "(regrequirement.regulation${sql.concat}'-'${sql.concat}regrequirement.reg_program)";
		}else if(field=='regulation' || field=='reg_program'){
			return 'regrequirement.'+field;
		}else if(field=='priority'){
			return 'regrequirement.'+field;
		}else if(field=='reg_rank'){
			return 'regulation.'+field;
		}else if(field=='regn_id'){
			return '(ctry_id${sql.concat}\'-\'${sql.concat}regn_id)';
		}else if(field=='city_id'){
			return '(state_id${sql.concat}\'-\'${sql.concat}city_id)';
		}else{
			 if(field=='comp_level'){
				 if(this.isLocation){
					 return "(CASE WHEN regloc.comp_level IS NOT NULL THEN regloc.comp_level WHEN regrequirement.comp_level IS NOT NULL " 
					 +"     THEN  regrequirement.comp_level  WHEN regloc.comp_level_calc IS NOT NULL THEN  regloc.comp_level_calc WHEN regprogram.comp_level IS NOT NULL " 
					 +"     THEN regprogram.comp_level ELSE \'Not Entered\' END)";
				 }else{
					 return "(CASE WHEN regrequirement.comp_level IS NOT NULL THEN  regrequirement.comp_level " +
					 		" WHEN regprogram.comp_level IS NOT NULL THEN regprogram.comp_level ELSE \'Not Entered\' END)";
				 }
			 }else{
				 return field;
			 }
		}

	},
	
	/**
	 * call by 'openPopUpView'.
	 */
	getPopUpSqlClauseByValue: function(value) {

		if(value.indexOf('no value') != -1){
			return ' IS NULL ';
		}else{
			return " = '"+value+"'";
		}

	}
});


