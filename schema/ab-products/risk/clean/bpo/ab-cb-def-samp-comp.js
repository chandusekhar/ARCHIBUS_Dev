var abCbDefSampCompCtrl = View.createController('abCbDefSampCompCtrl',{
	afterViewLoad: function(){
		this.showMsdsLookupButton();
	},

	/**
	 * Show the MSDS Lookup button only if the user has license for AbRiskMSDS
	 */
	showMsdsLookupButton: function(){
		var lookupButton = this.abCbDefSampComp_formPanel.actions.get("msdsLookup");
		
		lookupButton.show(false);
		
		try {
			var result = Workflow.callMethod("AbRiskCleanBuilding-CleanBuildingService-isActivityLicense", "AbRiskMSDS");
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	        return;
	    }
	    
	    if(result.value) {
	    	lookupButton.show(true);
	    }
	},
    
	abCbDefSampComp_formPanel_onMsdsLookup: function(){
		var form = this.abCbDefSampComp_formPanel;
		View.openDialog('ab-cb-msds-lookup.axvw', null, false, {
		    callback: function(chemicalId, casNumber) {
		    	form.setFieldValue('cb_sample_comp.sample_comp_id', chemicalId);
		    	form.setFieldValue('cb_sample_comp.name', chemicalId);
		    	form.setFieldValue('cb_sample_comp.cas_num', casNumber);
		    }
		});
	}
}); 
