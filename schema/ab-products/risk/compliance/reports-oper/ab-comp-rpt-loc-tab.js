
var abReportLocController = View.createController('abReportLocController', {
	
	afterInitialDataFetch: function(){
		//if this view is opened as popup, get the restriction from parent view 
		var openerView = View.getOpenerView().getOpenerView();
		if(openerView && openerView.popUpRestriction){
			//hide DOC button when open as pop up 
			this.regLocGrid.actions.get('exportDOCX').show(false);
			
			this.regLocGrid.addParameter('regRequireRes', openerView.popUpRestriction);
		}
	},

	regLocGrid_onView: function(row){
		
		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var location_id = record.getValue("regloc.location_id");
		if (valueExistsNotEmpty(location_id)) {
			restriction.addClause('regloc.location_id', location_id, '=');
		}	
		var panel=this.regLocForm;
		panel.refresh(restriction);
		panel.show(true);
		this.regLocForm.showInWindow({
			width: 800,
			height: 500,
			buttonsPosition: "footer",
			closeButton: true
		});
		

	    this.mainController=View.getOpenerView().controllers.get('defineLocationFL');
	    if(!this.mainController) 
		    this.mainController=View.getOpenerView().controllers.get(0);
    	if(this.mainController){

	  		var nodeName = this.mainController.firstTabTable;
	  		if(!valueExistsNotEmpty(nodeName) || nodeName.indexOf('requirement')!=-1){
    			this.regLocForm.setTitle(getMessage("formTitleRequirement"));
	  		}else if(!valueExistsNotEmpty(nodeName) || nodeName.indexOf('program')!=-1){
    			this.regLocForm.setTitle(getMessage("formTitleProgram"));
	  		}else if(!valueExistsNotEmpty(nodeName) || nodeName.indexOf('regulation')!=-1){
    			this.regLocForm.setTitle(getMessage("formTitleRegulation"));
	  		}
    	 }
		
		},
	
	/**
	* Event Handler of action "Doc"
	*/
	regLocGrid_onExportDOCX: function(){
		var	parameters = {};
		parameters.selectRes = this.regLocGrid.restriction?this.regLocGrid.restriction:"1=1";
	    this.mainController=View.getOpenerView().controllers.get('defineLocationFL');//for view ab-comp-rpt-drilldown.axvw
	    if(!this.mainController) 
		    this.mainController=View.getOpenerView().controllers.get(0);//for view ab-comp-rpt-regulation/program/requirement.axvw
	  	if(this.mainController){
	  		var nodeName = this.mainController.firstTabTable;
	  		//kb 3037411
	  		if(this.mainController.id != 'defineLocationFL'){
	  			nodeName = this.mainController.exportRes;
	  		}
	  		
	  		if(!valueExistsNotEmpty(nodeName) || nodeName.indexOf('requirement')!=-1){
	  			View.openPaginatedReportDialog("ab-comp-req-loc-paginate-rpt.axvw" ,null, parameters);
	  		}else if(!valueExistsNotEmpty(nodeName) || nodeName.indexOf('program')!=-1){
			    View.openPaginatedReportDialog("ab-comp-prog-loc-paginate-rpt.axvw" ,null, parameters);
	  		}else if(!valueExistsNotEmpty(nodeName) || nodeName.indexOf('regulation')!=-1){
	  			View.openPaginatedReportDialog("ab-comp-reg-loc-paginate-rpt.axvw" ,null, parameters);
	  		}
	  	}
	
	}
	
});

