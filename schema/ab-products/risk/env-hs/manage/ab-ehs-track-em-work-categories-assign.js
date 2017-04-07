/**
 * Controller of the view
 */
var abEhsTrackEmWorkCategoriesAssignCtrl = View.createController('abEhsTrackEmWorkCategoriesAssignCtrl', {
	itemIdsToAssign: [],
	
	// "training"/"ppe"/"medicalMonitoring"
	itemType: "ppe",
	
	emId: null,
	
	afterInitialDataFetch: function(){
		// get the view parameters and set them to the controller
		if(View.parameters.itemIdsToAssign){
			this.itemIdsToAssign = View.parameters.itemIdsToAssign;
		}
		
		if(View.parameters.itemType){
			this.itemType = View.parameters.itemType;
		}
		
		if(View.parameters.emId){
			this.emId = View.parameters.emId;
		}
		
		// change labels in the view
		this.setLabels();
		
		// hide fields
		this.hideFields();
	},

	/**
	 * Set labels depending on the items type to assign
	 */
	setLabels: function(){
		if(this.itemType == "training"){
			View.setTitle(getMessage("view_title_training"));
			this.abEhsTrackEmWorkCategoriesAssign_console.setFieldLabel("ehs_em_ppe_types.date_use", "<span style='color:red'>*</span>" + getMessage("field_title_training"));
			this.abEhsTrackEmWorkCategoriesAssign_console.actions.get("assign").setTitle(getMessage("action_title_training"));
			this.abEhsTrackEmWorkCategoriesAssign_console.setInstructions(getMessage("instructions_training"));
		} else if(this.itemType == "medicalMonitoring"){
			View.setTitle(getMessage("view_title_med_mon"));
			this.abEhsTrackEmWorkCategoriesAssign_console.setFieldLabel("ehs_em_ppe_types.date_use", "<span style='color:red'>*</span>" + getMessage("field_title_med_mon"));
			this.abEhsTrackEmWorkCategoriesAssign_console.actions.get("assign").setTitle(getMessage("action_title_med_mon"));
			this.abEhsTrackEmWorkCategoriesAssign_console.setInstructions(getMessage("instructions_med_mon"));
		}
	},
	
	/**
	 * Hide bl, fl, rm fields for training and medical monitoring
	 */
	hideFields: function(){
		if(this.itemType == "training" || this.itemType == "medicalMonitoring"){
			this.abEhsTrackEmWorkCategoriesAssign_console.showField("ehs_em_ppe_types.bl_id", false);
			this.abEhsTrackEmWorkCategoriesAssign_console.showField("ehs_em_ppe_types.fl_id", false);
			this.abEhsTrackEmWorkCategoriesAssign_console.showField("ehs_em_ppe_types.rm_id", false);
		}
	},
	
	/**
	 * Assign training, ppe or medical monitoring to employee
	 */
	abEhsTrackEmWorkCategoriesAssign_console_onAssign: function(){
		var initialDate = this.abEhsTrackEmWorkCategoriesAssign_console.getFieldValue("ehs_em_ppe_types.date_use");
		var buildingId = this.abEhsTrackEmWorkCategoriesAssign_console.getFieldValue("ehs_em_ppe_types.bl_id");
		var floorId = this.abEhsTrackEmWorkCategoriesAssign_console.getFieldValue("ehs_em_ppe_types.fl_id");
		var roomId = this.abEhsTrackEmWorkCategoriesAssign_console.getFieldValue("ehs_em_ppe_types.rm_id");
		
		if(!valueExistsNotEmpty(initialDate)){
			View.showMessage(getMessage('selectDate'));
			return;
		}
		
		var callbackFunction = function(){View.closeThisDialog();};
		
		var employeeIds = [this.emId];
		
		switch (this.itemType) {
		case "training":
			assignTrainingToEmployees(this.itemIdsToAssign, employeeIds, initialDate, "", callbackFunction);
			break;

		case "medicalMonitoring":
			assignMonitoringToEmployees(this.itemIdsToAssign, employeeIds, initialDate, "", callbackFunction);
			break;

		case "ppe":
		default:
			assignPPEToEmployees(this.itemIdsToAssign, employeeIds, initialDate, buildingId, floorId, roomId, "", callbackFunction);
			
			break;
		}
	}
});
