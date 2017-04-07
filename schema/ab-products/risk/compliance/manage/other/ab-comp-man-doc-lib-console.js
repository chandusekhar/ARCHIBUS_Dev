var controllerConsole = View.createController('controllerConsole', {

	//fields array of docs_assigned for console to get proper restriction
	docsFieldsArraysForRes: new Array(['docs_assigned.regulation'],['docs_assigned.reg_program'],['docs_assigned.reg_requirement'],
			['docs_assigned.doc_folder'], ['docs_assigned.doc_cat'],['docs_assigned.doc_type'],
			['docs_assigned.name','like'],['docs_assigned.description','like'],['docs_assigned.doc_note','like'],
			['docs_assigned.doc_author','like']),

	//fields array of docs_assigned for console to get proper restriction
	docsDateFieldsArraysForRes: new Array(['docs_assigned.date_doc']),

	//fields array of activity_log for console to get proper restriction
	eventFieldsArraysForRes: new Array(['activity_log.action_title','like']),

	//fields array of regrequirement for console to get proper restriction
	reqFieldsArraysForRes: new Array(['regrequirement.regreq_type']),		


	 /**
      * event handle when search button click.
      */
	abCompDocLibConsole_onShow: function(){

		var console = this.abCompDocLibConsole;
		
		var eventRes = getRestrictionStrFromConsole(console, this.eventFieldsArraysForRes);
		var reqRes = getRestrictionStrFromConsole(console, this.reqFieldsArraysForRes);
		var docsRes = getRestrictionStrFromConsole(console, this.docsFieldsArraysForRes) + " AND " + 
			 getDatesRestrictionFromConsole(console, this.docsDateFieldsArraysForRes);
		
		var locRes="";
		//location restriction.
		if(View.locationRestriction){
			locRes = " AND exists (select 1 from compliance_locations where docs_assigned.location_id=compliance_locations.location_id " 
				+ View.locationRestriction+")";
		}

		//get select controller of first tab and call refresh function
		var selectController=View.controllers.get("abCompDocLibSelectController");
		selectController.onRefresh(eventRes+" AND "+reqRes+" AND "+docsRes+locRes);
     },

	 /**
      * event handle when search button click.
      */
	abCompDocLibConsole_onClear: function(){
		this.abCompDocLibConsole.clear();
		$("virtual_location").value="";
		View.locationRestriction = "";
		
		//clear restriction variables of select controller
		var selectController=View.controllers.get("abCompDocLibSelectController");
		selectController.onClear();
	}
	
});