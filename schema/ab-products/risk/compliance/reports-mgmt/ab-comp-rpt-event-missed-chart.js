/**
 */
var abCompRptMissedOverdueChartController = View.createController('abCompRptMissedOverdueChartController', {

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

	/**
	 * set controller property values after view initialized.
	 */
	afterViewLoad : function() {
		var chart = new ManageReportControl('chart', getMessage('chartTitle'));
		chart.mainTable = "activity_log";
		
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
			'name' : 'count(distinct activity_log_id)',
			'title' : getMessage('calcFieldTitle')
		};

		var crossTable = new ManageReportControl('crossTable', getMessage('crossTableTitle'));
		crossTable.mainTable = "activity_log";
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
	beforeControlLoad: function(control, panel, abCompRptCommManController) {

		//initial current date, clear hour,minute,second and millisecond.
		var currentDate = new Date();
		currentDate.setHours(0);
		currentDate.setMinutes(0);
		currentDate.setSeconds(0);
		currentDate.setMilliseconds(0);
    currentDate = getIsoFormatDate(currentDate);

		//permanent restriction for "Missed" and "Overdue" event		
		control.permanentParameter = " activity_type = 'COMPLIANCE - EVENT' AND activity_log.status NOT IN ('CANCELLED','COMPLETED', 'COMPLETED-V', 'CLOSED') " + 
			" AND ( activity_log.date_scheduled_end < ${sql.date('"+currentDate+"')} OR  ( activity_log.date_scheduled < ${sql.date('"+currentDate+"')} and activity_log.status!='IN PROGRESS' ) )";
		this.permanentParameter = control.permanentParameter;
		
		control.mainTable = "activity_log";
		
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
		
		var restriction = "";//get the restriction from the click objectã€�
		
		var firstFieldCheck = this.checkIfContiansLocation(control.firstGroupField.name);
		var firstFieldValueCheck = ob.selectedChartData['regloc.firstGroupField'].indexOf('no value') == -1&&this.checkIfContiansLocation(control.firstGroupField.name);
		var secondFieldCheck = this.checkIfContiansLocation(control.secondGroupField.name);
		var secondFieldValueCheck = ob.selectedChartData['regloc.secondGroupField'].indexOf('no value') == -1&&this.checkIfContiansLocation(control.firstGroupField.name);

		
			//check if exists activity_log related location_id.
		
			if( (typeof control.byLocation != "undefined"&&control.byLocation==true)&&((firstFieldCheck&&firstFieldValueCheck)||(secondFieldCheck&&secondFieldValueCheck))){
				this.isLocation = true;
				// add 'permanentParameter' and change table name for comp_level.
				restriction =" exists (select 1 from  regloc where regloc.location_id = activity_log.location_id and " +
			    this.getPopUpSqlField(control.firstGroupField.name)+this.getPopUpSqlClauseByValue(ob.selectedChartData['regloc.firstGroupField'])
				+" and "+ this.getPopUpSqlField(control.secondGroupField.name)+this.getPopUpSqlClauseByValue(ob.selectedChartData['regloc.secondGroupField'])
				+" and "+  this.permanentParameter+")";
			}else{
				this.isLocation = false;
				// add 'permanentParameter' and change table name for comp_level.
				restriction = this.getPopUpSqlField(control.firstGroupField.name)+this.getPopUpSqlClauseByValue(ob.selectedChartData['regloc.firstGroupField'])
				+" and "+ this.getPopUpSqlField(control.secondGroupField.name)+this.getPopUpSqlClauseByValue(ob.selectedChartData['regloc.secondGroupField']) 
				+" and "+  this.permanentParameter+"";
			}
			View.mode = 'report';
			View.popUpRestriction = restriction+" AND "+consoleRestriction ;
			View.openDialog('ab-comp-rpt-events-pop-up.axvw',null, null,{maximize:true});
		
	},

	/**
	 * call by 'openPopUpView'.
	 */
	getPopUpSqlField: function(field) {

		if(field=="(regulation${sql.concat}'-'${sql.concat}reg_program)"){
			return "(regrequirement.regulation${sql.concat}'-'${sql.concat}regrequirement.reg_program)";
		}else if(field=='regulation' || field=='reg_program'){
			return 'activity_log.'+field;
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
					 return " (case when (regloc.comp_level is not null) then regloc.comp_level " +
				 		" when (regrequirement.comp_level is not null) then regrequirement.comp_level " +
				 		" when (regprogram.comp_level is not null) then regprogram.comp_level " +
				 		" else null end) ";
				 }else{
					 return "regrequirement.comp_level"; 
				 }
			 }else{
				 if(this.checkIfContiansLocation(field)){
					 return 'compliance_locations.'+field;
				 }
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
