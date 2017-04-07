var regulationRankAndCatController =regulationConsoleController.extend({
	
	//compliance level restriction
	complianceLevelRestriction : ' 1=1 ',
	
	//for count program count and popup program tab
	subQueryConsoleRestriction:' 1=1 ' ,
	
	//only for pop-up requirement tab
	subQueryConsoleRestrictionForPopUpRequirmentTab:' 1=1 ' ,
	
	
	/**
	 * Get restriction from console values.
	 */
	getConsoleRestriction : function() {
		
		//get regulation restriction
		var regulationRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regulationFieldsArray);
		
		//get regprogram restriction
		var regprogramRestriction = this.getProgramFieldRestriction(this.abCompDrilldownConsole, this.regprogramFieldsArrays);

		//get Responsible Person and Vendor Code restriction
		var responsiblePersonAndVnRestriction = this.getResponsiblePersonAndVnRestriction();
		
		//get location restriction
		var locationRestriction = this.getLocationRestriction();
		
		var complianceLevelRestriction = this.getComplianceLevelRestriction();
		
		this.consoleRestriction = regulationRestriction + ' AND ' + regprogramRestriction + ' AND ' + responsiblePersonAndVnRestriction  + ' AND ' + locationRestriction+' AND '+complianceLevelRestriction;
		
		var subProgramRes=getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regprogramFieldsArrays);
		var subProgramVnRes=getRestrictionStrFromConsole(this.abCompDrilldownConsole,new Array(['regloc.resp_person','=','regprogram.em_id'],['regloc.vn_id','=','regprogram.vn_id']));
		var subLocationRes=this.getLocationRestrictionForSubQuery();
		var subCompLevelRes=this.getSubComplianceLevelRestriction();
		
		this.subQueryConsoleRestriction=subProgramRes+" AND "+subProgramVnRes+" AND "+subLocationRes+" AND "+subCompLevelRes;
		
		
		
		//only for pop-up requirement tab
		var subRequirementVnRes=getRestrictionStrFromConsole(this.abCompDrilldownConsole,new Array(['regloc.resp_person','=','regrequirement.em_id'],['regloc.vn_id','=','regrequirement.vn_id']));
		var subLocationResForRequirementPopupTab=this.getLocationRestrictionForSubRequirementTabQuery();
		var subCompLevelResForRequirementPopupTab=this.getSubComplianceLevelRestrictionForRequirement();
		
		this.subQueryConsoleRestrictionForPopUpRequirmentTab=subRequirementVnRes+" AND "+subLocationResForRequirementPopupTab+" AND "+subCompLevelResForRequirementPopupTab;
		
	},
	
	/**
	 * Clear console field.
	 */
	abCompDrilldownConsole_onClear : function() {
		this.abCompDrilldownConsole.clear();
		clearConsoleFields();
	},
	
	/**
	 * Get program field res of console.
	 */
	getProgramFieldRestriction:function(){
		var res=getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regprogramFieldsArrays);
		if(res.indexOf('AND')!=-1){
			res=" EXISTS(SELECT 1 FROM regprogram WHERE regprogram.regulation=regulation.regulation AND "+res+")"
		}
		return res;
	},
	
	
	
	/**
	 * Get location restriction from console values.
	 */
	getLocationRestriction : function() {
		
		var locationRestriction = ' 1=1 ';

		if(View.locationRestriction){
			locationRestriction = ' exists(select 1 from regloc left join compliance_locations on regloc.location_id = '
				+ 'compliance_locations.location_id where  ' 
				+ '  regloc.regulation = regulation.regulation ' 
				+ View.locationRestriction+')';
		}
		
		return locationRestriction;
		
	},
	
	/**
	 * Get location restriction from console values.
	 */
	getLocationRestrictionForSubQuery : function() {
		
		var locationRestriction = ' 1=1 ';

		if(View.locationRestriction){
			locationRestriction = ' exists(select 1 from regloc left join compliance_locations on regloc.location_id = '
				+ 'compliance_locations.location_id where  ' 
				+ '  regloc.regulation = regprogram.regulation ' 
				+ '  AND regloc.reg_program = regprogram.reg_program ' 
				+ View.locationRestriction+')';
		}
		
		return locationRestriction;
		
	},
	

	/**
	 * Get location restriction from console values.
	 */
	getLocationRestrictionForSubRequirementTabQuery : function() {
		
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
	 * Get compliance level restriction from console values.
	 */
	getComplianceLevelRestriction : function() {
		var levelRes=getRestrictionStrFromConsole(this.abCompDrilldownConsole,new Array(['regloc.comp_level','=','regprogram.comp_level']));
		var levelResOfCalc=getRestrictionStrFromConsole(this.abCompDrilldownConsole,new Array(['regloc.comp_level','=','regprogram.comp_level_calc']));
		
		var complianceLevelRestriction=" 1=1 ";
		if(levelRes.indexOf('AND')!=-1){
			complianceLevelRestriction=" EXISTS (SELECT 1 FROM regprogram WHERE regprogram.regulation=regulation.regulation AND ( ("+levelRes+") OR (regprogram.comp_level IS NULL AND "+levelResOfCalc+")))";
		}
	
		return complianceLevelRestriction;
	},
	
	/**
	 * Get sub compliance level restriction from console values.
	 */
	getSubComplianceLevelRestriction : function() {
		var levelRes=getRestrictionStrFromConsole(this.abCompDrilldownConsole,new Array(['regloc.comp_level','=','regprogram.comp_level']));
		var levelResOfCalc=getRestrictionStrFromConsole(this.abCompDrilldownConsole,new Array(['regloc.comp_level','=','regprogram.comp_level_calc']));
		
		var complianceLevelRestriction=" 1=1 ";
		if(levelRes.indexOf('AND')!=-1){
			complianceLevelRestriction="( ("+levelRes+") OR (regprogram.comp_level IS NULL AND "+levelResOfCalc+"))";
		}
	
		return complianceLevelRestriction;
	},
	
	
	/**
	 * get compliance level restriction from console values.
	 */
	getSubComplianceLevelRestrictionForRequirement : function() {
		
		var calculatedField = ' ${sql.isNull(\'(case when regrequirement.comp_level IS NULL THEN regprogram.comp_level ELSE  regprogram.comp_level END)\', "\'Not Entered\'")} ';
		
		var complianceLevelRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole,
                new Array(['regloc.comp_level','=',calculatedField]));
		
		return complianceLevelRestriction;
		
	},
	/**
	 * get Responsible Person and Vendor Code restriction from console values.
	 */
	getResponsiblePersonAndVnRestriction : function() {
		var res=getRestrictionStrFromConsole(this.abCompDrilldownConsole,new Array(['regloc.resp_person','=','regprogram.em_id'],['regloc.vn_id','=','regprogram.vn_id']));

		if(res.indexOf('AND')!=-1){
			res=" EXISTS(SELECT 1 FROM regprogram WHERE regprogram.regulation=regulation.regulation AND "+res+")"
		}
		return res;
	},
	
	/**
	 * Event handle when show button click.
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