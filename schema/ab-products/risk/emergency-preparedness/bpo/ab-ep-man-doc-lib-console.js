var controllerConsole = View.createController('controllerConsole', {

	//fields array of docs_assigned for console to get proper restriction
	docsFieldsArraysForRes: new Array(['docs_assigned.state_id'],['docs_assigned.city_id'], 			 		
			['docs_assigned.doc_folder'], ['docs_assigned.doc_cat'],['docs_assigned.doc_type'],
			['docs_assigned.name','like'],['docs_assigned.description','like'],['docs_assigned.doc_note','like'],
			['docs_assigned.doc_author','like'], ['docs_assigned.site_id'],['docs_assigned.pr_id'],['docs_assigned.bl_id'],
			['docs_assigned.fl_id'],['docs_assigned.rm_id'],['docs_assigned.eq_id'],['docs_assigned.ls_id']),

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
    	var relatedTo = $("list_options").value;
    	 
    	if (relatedTo == 'all') return " 0=0 ";
    	if (relatedTo == 'location') return " (docs_assigned.state_id IS NOT NULL or docs_assigned.site_id IS NOT NULL or docs_assigned.pr_id IS NOT NULL or docs_assigned.bl_id IS NOT NULL) ";
    	if (relatedTo == 'equipment') return " docs_assigned.eq_id IS NOT NULL ";
    	if (relatedTo == 'lease') return " docs_assigned.ls_id IS NOT NULL "; 
     },

	 /**
      * event handle when search button click.
      */
	abCompDocLibConsole_onClear: function(){
		this.abCompDocLibConsole.clear(); 
		
		//clear restriction variables of select controller
		var selectController=View.controllers.get("abCompDocLibSelectController");
		selectController.onClear();
	}
	
});