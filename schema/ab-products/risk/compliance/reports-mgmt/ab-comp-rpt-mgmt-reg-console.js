var regulationConsoleController = View.createController('controllerConsole', {

	controllers : [],

	parameters : null,

	consoleRestriction: " 1=1  ",
	
	subQueryConsoleRestriction:' 1=1 ',
	regulationFieldsArray : new Array(['regulation.regulation'], ['regulation.reg_class'], ['regulation.reg_cat'], ['regulation.reg_type'], ['regulation.authority'], ['regulation.reg_rank']),
	reglocFieldsArraysForRes : new Array(['regloc.resp_person'],['regloc.vn_id']),
	
	regprogramFieldsArrays : new Array(['regprogram.regprog_cat'], ['regprogram.regprog_type'],['regprogram.priority'], ['regprogram.project_id'], ['regprogram.status']),
		
	regrequirementFieldsArray : new Array(),
	
	/**
	 * Get restriction from console values.
	 */
	getConsoleRestriction : function() {
		//get regulation restriction		
		var regulationRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regulationFieldsArray);	
		
		//get regprogram restriction
		var regprogramRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regprogramFieldsArrays);
		
		//get regrequirement restriction
		var regrequirementRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole, this.regrequirementFieldsArray);
	
		//get Responsible Person and Vendor Code restriction
		var responsiblePersonAndVnRestriction = this.getResponsiblePersonAndVnRestriction();
	
		//get location restriction
		var locationRestriction = this.getLocationRestriction();
		
		//get compliance level restriction
		var complianceLevelRestriction = this.getComplianceLevelRestriction();
		
		this.consoleRestriction = regulationRestriction + ' AND ' + regprogramRestriction + ' AND ' + regrequirementRestriction 
		      + ' AND ' + responsiblePersonAndVnRestriction  + ' AND ' + locationRestriction +' AND '+complianceLevelRestriction;
		
		//for group by contain location.
	},
	
	/**
	 * Clear console field.
	 */
	abCompDrilldownConsole_onClear : function() {
		this.abCompDrilldownConsole.clear();
		clearConsoleFields();
	},
	

	/**
	 * Get location restriction from console values.
	 */
	getLocationRestriction : function() {
		
		var locationRestriction = ' 1=1 ';

		if(View.locationRestriction){
			locationRestriction = locationRestriction+ View.locationRestriction;
		}
		
		return locationRestriction;
		
	},
	
	
	/**
	 * Get compliance level restriction from console values.
	 */
	getComplianceLevelRestriction : function() {
		var complianceLevelRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole,
                new Array(['regloc.comp_level']));
		var complianceLevelCalRestriction = getRestrictionStrFromConsole(this.abCompDrilldownConsole,
				new Array(['regloc.comp_level','=','regloc.comp_level_calc']));
		
		var calculatedFieldRes=' 1=1 ';
		if(complianceLevelRestriction.indexOf('AND')!=-1){
		
			calculatedFieldRes =  " regloc.reg_requirement IS NULL AND (("+complianceLevelRestriction+
							") OR (regloc.comp_level IS NULL AND "+complianceLevelCalRestriction+" ))";
		}
		
		return calculatedFieldRes;
		
	},
	

	/**
	 * get Responsible Person and Vendor Code restriction from console values.
	 */
	getResponsiblePersonAndVnRestriction : function() {
		var respRes = getRestrictionStrFromConsole(this.abCompDrilldownConsole,
                new Array(['regloc.resp_person','=','regloc.resp_person']));
        var responsiblePersonRestriction =' 1=1 ';        
		if(respRes.indexOf('AND')!=-1){
			//Responsible Person restriction
			 responsiblePersonRestriction = '(( regloc.reg_requirement IS NULL AND '+
						respRes+') OR ('+getRestrictionStrFromConsole(this.abCompDrilldownConsole,new Array(['regloc.resp_person','=','regprogram.em_id'])) +') )';
		}
		
		
		var vnRes = getRestrictionStrFromConsole(this.abCompDrilldownConsole,
                new Array(['regloc.vn_id','=','regloc.vn_id']));
        var vnRestriction =' 1=1 '; 

		//Vendor Code restriction

        if(vnRes.indexOf('AND')!=-1){
        	
        	 vnRestriction = '((  regloc.reg_requirement IS NULL AND'+vnRes +') OR ('+
    							getRestrictionStrFromConsole(this.abCompDrilldownConsole,new Array(['regloc.vn_id','=','regprogram.vn_id'])) +'))';
    		
        }
		
		return responsiblePersonRestriction+ ' AND ' + vnRestriction;
		
		
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