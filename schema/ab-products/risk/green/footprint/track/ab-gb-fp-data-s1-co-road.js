var abGbFpDataS1CoRoadController = View.createController('abGbFpDataS1CoRoadCtrl', {
	tabScope1_ctrl: View.getOpenerView().controllers.get('abGbFpDataS1Ctrl'),
	
	afterInitialDataFetch: function(){
	    var units_type = this.abGbFpDataS1CoRoad_formSource.getDataSource().fieldDefs.get("gb_fp_s1_s3_mobile.units_type").defaultValue;
	    customizeUnitField(this.abGbFpDataS1CoRoad_formSource, "gb_fp_s1_s3_mobile.units", units_type);
	},
	
	abGbFpDataS1CoRoad_gridFootprints_onAddNew: function(){
		this.abGbFpDataS1CoRoad_formSource.refresh(this.abGbFpDataS1CoRoad_gridFootprints.restriction, true);
	},

	abGbFpDataS1CoRoad_formSource_onSaveAndAddNew: function(){
		if(this.abGbFpDataS1CoRoad_formSource_onSave())
			this.abGbFpDataS1CoRoad_gridFootprints_onAddNew();
	},

	abGbFpDataS1CoRoad_formSource_onSave: function(){
		this.abGbFpDataS1CoRoad_formSource.fields.get("gb_fp_s1_s3_mobile.distance").clear();
		
		if(!this.abGbFpDataS1CoRoad_formSource.canSave())
			return false;
		
		if(!validateVehicle(this.abGbFpDataS1CoRoad_formSource,'Road'))
			return false;
		
		// convert the user entered distance
		if(!convertUserEntry(this.abGbFpDataS1CoRoad_formSource,
    			"gb_fp_s1_s3_mobile.distance_entry", "gb_fp_s1_s3_mobile.distance",
    			"gb_fp_s1_s3_mobile.units", "gb_fp_s1_s3_mobile.units_type"))
			return false;
		
		// save form
		if(!this.abGbFpDataS1CoRoad_formSource.save())
			return false;
		
		if(!this.calculateScope1Scope3Mobile())
			return false;
		
		// refresh grid
		this.abGbFpDataS1CoRoad_gridFootprints.refresh();
		
		return true;
	},

	abGbFpDataS1CoRoad_formSource_onDelete: function(){
		this.tabScope1_ctrl.dataController.onDeleteSource(this.abGbFpDataS1CoRoad_formSource, this.abGbFpDataS1CoRoad_gridFootprints);
	},
	
    /**
     * TODO Implement this function and call it on Save
     * Calls the WFR calculateScope1Scope3Mobile to calculate the emissions for this source
     */
    calculateScope1Scope3Mobile: function(){
		var bl_id = this.abGbFpDataS1CoRoad_formSource.getFieldValue("gb_fp_s1_s3_mobile.bl_id");
		var calc_year = parseInt(this.abGbFpDataS1CoRoad_formSource.getFieldValue("gb_fp_s1_s3_mobile.calc_year"));
		var scenario_id = this.abGbFpDataS1CoRoad_formSource.getFieldValue("gb_fp_s1_s3_mobile.scenario_id");
		var source_id = parseInt(this.abGbFpDataS1CoRoad_formSource.getFieldValue("gb_fp_s1_s3_mobile.source_id"));
		var scope_cat = this.abGbFpDataS1CoRoad_formSource.getFieldValue("gb_fp_s1_s3_mobile.scope_cat");
		
	    try {
			var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope1Scope3Mobile", bl_id, calc_year, scenario_id, source_id, scope_cat);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	        return false;
	    }
	    
	    return true;
    }
});
