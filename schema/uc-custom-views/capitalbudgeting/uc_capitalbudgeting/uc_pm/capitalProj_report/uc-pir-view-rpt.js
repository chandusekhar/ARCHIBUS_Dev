var isReport = true;
var cpEditController = View.createController('cpEditController', {
    
    afterViewLoad: function(){
		
	 	//readOnlyPanelFields(this.projectInitiationViewSummaryForm);  //make all panels readOnly
		
    },
	afterInitialDataFetch:function(){
		if (!this.projectViewGrid && View.restriction != null){this.onProjectSelection(View.restriction)}
	},
	  
	onProjectSelection: function(theRest){
		this.projectInitiationViewSummaryForm.refresh(theRest);
		this.campusPlanningPanel.refresh(theRest);
		this.pmoPanel.refresh(theRest);
		this.endorserPanel.refresh(theRest);
		
       this.projectInitiationViewSummaryForm.refresh(theRest);

       this.appendicesPanel.refresh(theRest);
       this.campusArchitecturePanel.refresh(theRest);
       this.pagPanel.refresh(theRest);
	       
	        
		var theTitle = ""
		if (this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.project_id") != ""){
			theTitle = "Project Approved [" + this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.project_id") + "]"
		} else {
		   var review_by = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.review_by");
		   var review_byValue = this.projectInitiationViewSummaryForm.fields.get("uc_pir.review_by").fieldDef.enumValues[review_by];
		   var status = this.projectInitiationViewSummaryForm.getFieldValue("uc_pir.status");
		   var status_byValue = this.projectInitiationViewSummaryForm.fields.get("uc_pir.status").fieldDef.enumValues[status];
		   if (status_byValue == 'Returned') {
				theTitle = status_byValue + " To: " + review_byValue;
		   } else {
				theTitle = status_byValue + " By: " + review_byValue;
		   }
		}
		this.projectInitiationViewSummaryForm.setTitle (theTitle); //use the long name from enum list
		this.projectInitiationViewSummaryForm.actions.get("generateReportPM").show(true);
	//	this.readOnlyPanelFields(this.projectInitiationViewSummaryForm)
    
   },
   
	readOnlyPanelFields: function(panel){
		//get all panel fields
		var panelFields = panel.fields.items;
		for (var i =0 ; i< panelFields.length; i++){
			panelFields[i].config.readOnly = true;
		}
   }
   
  
});
    
function onProjectSelect(row){
	cpEditController.onProjectSelection(row.getRestriction());
}