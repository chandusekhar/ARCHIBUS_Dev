var abGbFpDataS3OffSiteSrv_ctrl = View.createController('abGbFpDataS3OffSiteSrv_ctrl', {


	tabScope3_ctrl: View.getOpenerView().controllers.get('abGbFpDataS3_ctrl'),
    
    afterInitialDataFetch: function(){
    
        customizeUnitField(this.abGbFpDataS3OffSiteSrv_form, "gb_fp_s3_serv.units", "ELECTRICITY CONSUMPTION");
        
    },

	abGbFpDataS3OffSiteSrv_grid_onAddNew: function(){
		this.abGbFpDataS3OffSiteSrv_form.refresh(this.abGbFpDataS3OffSiteSrv_grid.restriction, true);
	},

	abGbFpDataS3OffSiteSrv_form_onSaveAndAddNew: function(){
		if(this.abGbFpDataS3OffSiteSrv_form_onSave())
			this.abGbFpDataS3OffSiteSrv_grid_onAddNew();
	},

	/**
     * Listener for 'save' action from 'abGbFpDataS3OffSiteSrv_form' panel
     */
	abGbFpDataS3OffSiteSrv_form_onSave: function(){
		this.abGbFpDataS3OffSiteSrv_form.fields.get("gb_fp_s3_serv.consumption").clear();
		
        if (!this.abGbFpDataS3OffSiteSrv_form.canSave())
        	return false;
        
        try {
            if (!convertUserEntry(this.abGbFpDataS3OffSiteSrv_form, "gb_fp_s3_serv.consumption_entry", "gb_fp_s3_serv.consumption", "gb_fp_s3_serv.units", "gb_fp_s3_serv.units_type")) {
                return false;
            }
           
            this.abGbFpDataS3OffSiteSrv_form.save();
            
            var bl_id = this.abGbFpDataS3OffSiteSrv_form.getFieldValue("gb_fp_s3_serv.bl_id");
            var calc_year = parseInt(this.abGbFpDataS3OffSiteSrv_form.getFieldValue("gb_fp_s3_serv.calc_year"));
            var scenario_id = this.abGbFpDataS3OffSiteSrv_form.getFieldValue("gb_fp_s3_serv.scenario_id");
            var source_id = parseInt(this.abGbFpDataS3OffSiteSrv_form.getFieldValue("gb_fp_s3_serv.source_id"));
			
            Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3OffSiteServers",bl_id, calc_year, scenario_id, source_id);
            
            this.abGbFpDataS3OffSiteSrv_grid.refresh();
        } 
        catch (e) {
            Workflow.handleError(e);
            return false;
        }
		
        return true;
	},
	
	/**
     * Listener for 'delete' action from 'abGbFpDataS3OffSiteSrv_form' panel
     */
	abGbFpDataS3OffSiteSrv_form_onDelete: function(){

		this.tabScope3_ctrl.dataController.onDeleteSource(this.abGbFpDataS3OffSiteSrv_form ,this.abGbFpDataS3OffSiteSrv_grid);
		
	}
	
});