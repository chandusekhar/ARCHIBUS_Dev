/**
 * Controller implementation
 */
var abGbFpDefVerCtrl = View.createController('abGbFpDefVerCtrl', {
	// if activity parameter enable delete
	isDeleteEnabled: false,
	
	afterViewLoad: function(){
		var paramValue = getActivityParameter("AbRiskGreenBuilding", "factors_ver_delete");
		this.isDeleteEnabled = (paramValue != 0);	
	},
	
	// Save version data
	abGbFpDefVer_editVersion_onSave: function(){
		var version_type = this.abGbFpDefVer_editVersion.getFieldValue("gb_fp_versions.version_type");
		var errorMessage = getMessage("error_version_type");
		
		if(version_type == "N/A")	{
			View.showMessage(errorMessage);
		}
		else {
			if(this.abGbFpDefVer_editVersion.canSave()){
				this.abGbFpDefVer_editVersion.save();
				this.abGbFpDefVer_types.refresh();
				this.abGbFpDefVer_versions.refresh();
			}
		}
	},
	
	abGbFpDefVer_editVersion_onDelete: function(){
		var controller = this;
		var ds = this.abGbFpDefVer_editVersion.getDataSource();
		var blCount = this.abGbFpDefVer_editVersion.getFieldValue("gb_fp_versions.vf_bl_fp_count");
		var versionName = this.abGbFpDefVer_editVersion.getFieldValue("gb_fp_versions.version_name");
		var record = new Ab.data.Record({
			'gb_fp_versions.version_name': this.abGbFpDefVer_editVersion.getFieldValue("gb_fp_versions.version_name"),
			'gb_fp_versions.version_type': this.abGbFpDefVer_editVersion.getFieldValue("gb_fp_versions.version_type")	
		}, false);

    var message = "";
    
		if (valueExistsNotEmpty(blCount) && blCount > 0){
			message= getMessage("confirm_delete_version").replace('{0}', blCount);
		}
		else {
			message= getMessage("confirm_delete_version_nocf").replace('{0}', versionName);			
	  }
		View.confirm(message, function(button){
			if(button == "yes"){
				try{
					var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-deleteVersion", record);
					controller.abGbFpDefVer_editVersion.show(false, true);
					controller.abGbFpDefVer_types.refresh();
					controller.abGbFpDefVer_versions.refresh();
				}catch(e){
					Workflow.handleError(e);
				}
			}
		});
	},
	
	abGbFpDefVer_editVersion_afterRefresh: function(){
		var blCount = this.abGbFpDefVer_editVersion.getFieldValue("gb_fp_versions.vf_bl_fp_count");
		if(!this.isDeleteEnabled && valueExistsNotEmpty(blCount) && blCount > 0 ){
			this.abGbFpDefVer_editVersion.actions.get("delete").enable(false);
		}
		// Set default value to be different than N/A as defined in afm_flds for new records
		if(this.abGbFpDefVer_editVersion.newRecord){
      var curVerType = 'gb_fp_egrid_subregions';
      var restriction = this.abGbFpDefVer_versions.restriction['gb_fp_versions.version_type'];
      if (restriction != undefined) { curVerType = restriction; }
			this.abGbFpDefVer_editVersion.setFieldValue('gb_fp_versions.version_type',curVerType);
		}
	}
	
});
