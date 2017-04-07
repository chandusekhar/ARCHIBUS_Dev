var abGbFpDataS3OutAct_ctrl = View.createController('abGbFpDataS3OutAct_ctrl', {


	tabScope3_ctrl: View.getOpenerView().controllers.get('abGbFpDataS3_ctrl'),
      
	abGbFpDataS3OutAct_grid_onAddNew: function(){
		this.abGbFpDataS3OutAct_form.refresh(this.abGbFpDataS3OutAct_grid.restriction, true);
	},
	
	abGbFpDataS3OutAct_form_onSaveAndAddNew: function(){
		if(this.abGbFpDataS3OutAct_form_onSave())
			this.abGbFpDataS3OutAct_grid_onAddNew();
	},

	/**
     * Listener for 'save' action from 'abGbFpDataS3OutAct_form' panel
     */
    abGbFpDataS3OutAct_form_onSave: function(){
    
        if (!this.abGbFpDataS3OutAct_form.canSave())
        	return false;
        
		try {
			this.abGbFpDataS3OutAct_form.save();
			
			var bl_id = this.abGbFpDataS3OutAct_form.getFieldValue("gb_fp_s3_outs.bl_id");
			var calc_year = parseInt(this.abGbFpDataS3OutAct_form.getFieldValue("gb_fp_s3_outs.calc_year"));
			var scenario_id = this.abGbFpDataS3OutAct_form.getFieldValue("gb_fp_s3_outs.scenario_id");
			var source_id = parseInt(this.abGbFpDataS3OutAct_form.getFieldValue("gb_fp_s3_outs.source_id"));
			
			
			Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3Outsourced", bl_id, calc_year, scenario_id, source_id);
			
			this.abGbFpDataS3OutAct_grid.refresh();
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
        
        return true;
    },
	
	/**
     * Listener for 'delete' action from 'abGbFpDataS3OutAct_form' panel
     */
	abGbFpDataS3OutAct_form_onDelete: function(){

		this.tabScope3_ctrl.dataController.onDeleteSource(this.abGbFpDataS3OutAct_form ,this.abGbFpDataS3OutAct_grid);
		
	}
	
});