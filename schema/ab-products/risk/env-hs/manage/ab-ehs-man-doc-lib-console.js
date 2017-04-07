var controllerConsole = View.createController('controllerConsole', {

	//fields array of docs_assigned for console to get proper restriction
	docsFieldsArraysForRes: new Array(['docs_assigned.training_id'],['docs_assigned.ppe_type_id'],['docs_assigned.medical_monitoring_id'],
			['docs_assigned.incident_id'],['docs_assigned.restriction_id'],			
			['docs_assigned.doc_folder'], ['docs_assigned.doc_cat'],['docs_assigned.doc_type'],
			['docs_assigned.name','like'],['docs_assigned.description','like'],['docs_assigned.doc_note','like'],
			['docs_assigned.doc_author','like'], ['docs_assigned.site_id'],['docs_assigned.pr_id'],['docs_assigned.bl_id']),

	//fields array of docs_assigned for console to get proper restriction
	docsDateFieldsArraysForRes: new Array(['docs_assigned.date_doc']),  

	 /**
      * event handle when search button click.
      */
	abCompDocLibConsole_onShow: function(){
		var console = this.abCompDocLibConsole;
		  
		var docsRes = getRestrictionStrFromConsole(console, this.docsFieldsArraysForRes) + " AND " + 
			 getDatesRestrictionFromConsole(console, this.docsDateFieldsArraysForRes);	
		
		var relatedToRestriction = this.getRelatedToRestriction();

		//get select controller of first tab and call refresh function
		var selectController=View.controllers.get("abCompDocLibSelectController");
		selectController.onRefresh(docsRes + " AND " + relatedToRestriction);
     },
     
     getRelatedToRestriction: function() {
    	var relatedTo = $("related_to").value;
    	 
    	if (relatedTo == 'all') return " 0=0 ";
    	if (relatedTo == 'training') return " docs_assigned.training_id IS NOT NULL  ";
    	if (relatedTo == 'ppe_type') return " docs_assigned.ppe_type_id IS NOT NULL ";
    	if (relatedTo == 'medical') return " docs_assigned.medical_monitoring_id IS NOT NULL ";
    	if (relatedTo == 'incident') return " docs_assigned.incident_id IS NOT NULL ";
    	if (relatedTo == 'restriction') return " docs_assigned.restriction_id IS NOT NULL ";
     },

	 /**
      * event handle when search button click.
      */
	abCompDocLibConsole_onClear: function(){
		this.abCompDocLibConsole.clear(); 		
		 $("related_to").value = "all";
		
		//clear restriction variables of select controller
		var selectController=View.controllers.get("abCompDocLibSelectController");
		selectController.onClear();
	}
	
});