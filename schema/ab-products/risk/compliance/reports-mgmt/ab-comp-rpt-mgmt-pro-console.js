var regprogramConsoleController = View.createController('controllerConsole', {

	controllers : [],

	parameters : null,
	
	consoleRestriction: " 1=1 ",
	
	subQueryConsoleRestriction:' 1=1 ',
	
	reglocFieldsArraysForRes : new Array(),

	regulationFieldsArray : new Array( ['regprogram.regulation','=','regulation.regulation'],['regulation.reg_class'], ['regulation.reg_cat'], ['regulation.reg_type'], ['regulation.authority'], ['regulation.reg_rank']),

	regprogramFieldsArrays : new Array(['regprogram.reg_program'], ['regprogram.project_id'],['regprogram.regprog_cat'], ['regprogram.regprog_type'], ['regprogram.priority'], ['regprogram.status'],
		['regprogram.project_id']
	),
	
	regrequirementFieldsArray : new Array(),
	
	respPersonAndVn:new Array(['regloc.resp_person','=','regprogram.em_id'],['regloc.vn_id','=','regprogram.vn_id']),
	
	respPersonAndVnForReq:new Array(['regloc.resp_person','=','regrequirement.em_id'],['regloc.vn_id','=','regrequirement.vn_id']),
	
	/**
	 * get restriction from console values.
	 */
	getConsoleRestriction : function() {
		
		//get regulation restriction		
		var regulationRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regulationFieldsArray);	
		
		//get regprogram restriction
		var regprogramRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regprogramFieldsArrays);
		
		//get regrequirement restriction
		
		var regrequirementRestriction = this.getRequirementRestriction();
	
		//get Responsible Person and Vendor Code restriction
		var responsiblePersonAndVnRestriction = this.getResponsiblePersonAndVnRestriction();
	
		//get location restriction
		var locationRestriction = this.getLocationRestriction();
		
		//get compliance level restriction
		var complianceLevelRestriction = this.getComplianceLevelRestriction();
		
		var dateRestriction = this.getDateRestriction();
		
		
		this.consoleRestriction = regulationRestriction + ' AND ' + regprogramRestriction + ' AND ' + regrequirementRestriction 
		      + ' AND ' + responsiblePersonAndVnRestriction  + ' AND ' + locationRestriction + ' AND ' + complianceLevelRestriction+' AND (' +dateRestriction+")";

		
		var subRequirementRes=getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regrequirementFieldsArray);;
		var subRequirementVnRes=getRestrictionStrFromConsole(this.abCompDrilldownConsole,this.respPersonAndVnForReq);
		var subLocationRes=this.getLocationRestrictionForSubQuery();
		var subCompLevelRes=this.getSubComplianceLevelRestriction();
		
		this.subQueryConsoleRestriction=subRequirementRes+" AND "+subRequirementVnRes+" AND "+subLocationRes+" AND "+subCompLevelRes;
	
	},
	
	abCompDrilldownConsole_onClear : function() {
		this.abCompDrilldownConsole.clear();
		clearConsoleFields();
	},
	
	/**
	 * Get restriction for date range
	 */
	getDateRestriction:function(){
		var date_started=this.abCompDrilldownConsole.getFieldValue("regprogram.date_start");
		var date_completed=this.abCompDrilldownConsole.getFieldValue("regprogram.date_end");
		if(date_started==''){
			date_started='1900-01-01';
		}
		
		if(date_completed==''){
			date_completed='2200-01-01';
		}

		var	str=" (regprogram.date_start >= ${sql.date('"+date_started+"')} " +" and regprogram.date_start <= ${sql.date('"+date_completed+"')}) " +
					"or(regprogram.date_end >= ${sql.date('"+date_started+"')} " +"and regprogram.date_end <= ${sql.date('"+date_completed+"')} ) " +
					" or( regprogram.date_start is null and regprogram.date_end is null) ";
		return str;
	
	},
	
	/**
	 * Get location restriction from console values.
	 */
	getLocationRestrictionForSubQuery : function() {
		
		var locationRestriction = ' 1=1 ';

		if(View.locationRestriction){
			locationRestriction = ' EXISTS(select 1 FROM regloc left join compliance_locations on regloc.location_id = '
				+ 'compliance_locations.location_id WHERE  ' 
				+ '  regloc.regulation = regrequirement.regulation ' 
				+ '  AND regloc.reg_program = regrequirement.reg_program ' 
				+ '  AND regloc.reg_requirement = regrequirement.reg_requirement ' 
				+ View.locationRestriction+')';
		}
		
		return locationRestriction;
		
	},
	
	/**
	 * get location restriction from console values.
	 */
	getLocationRestriction : function() {
		
		var locationRestriction = ' 1=1 ';

		if(View.locationRestriction){
			locationRestriction = ' exists(select 1 from regloc left join compliance_locations on regloc.location_id = '
				+ 'compliance_locations.location_id where  ' 
				+ '  regloc.regulation = regprogram.regulation ' 
				+ ' AND regloc.reg_program = regprogram.reg_program ' 
				+ View.locationRestriction+')';
		}
		
		return locationRestriction;
		
	},
	
	/**
	 * get compliance level restriction from console values.
	 */
	getComplianceLevelRestriction : function() {
		
		var calculatedField = ' ${sql.isNull(\'(case when regprogram.comp_level IS NULL THEN regprogram.comp_level_calc ELSE regprogram.comp_level END)\', "\'Not Entered\'")} ';
		
		var complianceLevelRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole,
                new Array(['regloc.comp_level','=',calculatedField]));
		
		return complianceLevelRestriction;
		
	},
	
	/**
	 * get compliance level restriction from console values.
	 */
	getSubComplianceLevelRestriction : function() {
		
		var calculatedField = ' ${sql.isNull(\'(case when regrequirement.comp_level IS NULL THEN regprogram.comp_level ELSE  regprogram.comp_level END)\', "\'Not Entered\'")} ';
		
		var complianceLevelRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole,
                new Array(['regloc.comp_level','=',calculatedField]));
		
		return complianceLevelRestriction;
		
	},
	
	
	/**
	 * get Responsible Person and Vendor Code restriction from console values.
	 */
	getResponsiblePersonAndVnRestriction : function() {
		
		return getRestrictionStrFromConsole(this.abCompDrilldownConsole,this.respPersonAndVn);
		 
	},
	
	/**
	 * get regrequirement restriction
	 */
	getRequirementRestriction : function() {
		return '1=1';		 
	},

	/**
	 * event handle when show button click.
	 */
	abCompDrilldownConsole_onShow : function() {
		//get console restriction
		this.getConsoleRestriction();
		
		//refresh all controls that register to this console
		for ( var i = 0; i < this.controllers.length; i++) {
			this.controllers[i].refreshFromConsole();
		}
	}

});