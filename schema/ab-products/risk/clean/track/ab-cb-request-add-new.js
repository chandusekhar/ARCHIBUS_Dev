var abCbRequestAddCtrl = View.createController('abCbRequestAddCtrl', {
	// project id
	projectId: null,
	
	//problem type
	projProbType: null,
	
	// current selected row
	selectedRowIndex: -1,
	
	afterViewLoad: function(){
		if(valueExists(this.view.parameters.projectId)){
			this.projectId = this.view.parameters.projectId;
		}
		
		if(valueExists(this.view.parameters.projProbType)){
			this.projProbType = this.view.parameters.projProbType;
		}
		
	},
	
	afterInitialDataFetch: function(){
		this.abCbRequestAddNewPlaces.removeSorting();
		
		// on Add New, initialize site and building from the project
		if(this.abCbRequestAddNewLocation.newRecord && this.projectId){
			initFormFromProject(this.projectId, this.abCbRequestAddNewLocation);
		}
	},
	
	/**
	 * Save place. 
	 * Add new grid row.
	 */
	abCbRequestAddNewPlaceEdit_onSave: function(){
		if(this.abCbRequestAddNewPlaceEdit.canSave()){
			var record = this.abCbRequestAddNewPlaceEdit.getRecord();
			if(this.selectedRowIndex > -1){
				this.abCbRequestAddNewPlaces.removeGridRow(this.selectedRowIndex);
				this.abCbRequestAddNewPlaces.addGridRow(record, this.selectedRowIndex);
			}else{
				this.abCbRequestAddNewPlaces.addGridRow(record);
				this.selectedRowIndex = this.abCbRequestAddNewPlaces.gridRows.length;
			}
			this.abCbRequestAddNewPlaces.update();
			this.abCbRequestAddNewPlaces.removeSorting();
		}
	},
	/**
	 * 
	 */
	abCbRequestAddNewPlaceEdit_onDelete: function(){
		if(this.selectedRowIndex != -1){
			var controller = this;
			View.confirm(getMessage("msgConfirmDelete"), function(button){
				if(button == 'yes'){
					controller.abCbRequestAddNewPlaces.removeGridRow(controller.selectedRowIndex);  
					controller.abCbRequestAddNewPlaces.update();
					controller.abCbRequestAddNewPlaces.removeSorting();
					controller.selectedRowIndex = -1;
				}
			});
		}
		this.abCbRequestAddNewPlaceEdit.show(false, true);
	},
	/**
	 * on next event handler.
	 * save current data into js object and send this to caller view.
	 */
	abCbRequestAddNewLocation_onNext: function(){
		this.abCbRequestAddNewLocation.clearValidationResult();
		var siteId = this.abCbRequestAddNewLocation.getFieldValue('activity_log.site_id');
		var blId = this.abCbRequestAddNewLocation.getFieldValue('activity_log.bl_id');
		var probType = this.abCbRequestAddNewLocation.getFieldValue("activity_log.prob_type");
		if(!valueExistsNotEmpty(siteId)){
			var fldSite = this.abCbRequestAddNewLocation.fields.get('activity_log.site_id');
			//var displayedMessage = getMessage('msg_field_mandatory').replace('{0}', fldSite.fieldDef.title);
			this.abCbRequestAddNewLocation.validationResult.valid = false;
			this.abCbRequestAddNewLocation.validationResult.message = this.abCbRequestAddNewLocation.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
			this.abCbRequestAddNewLocation.validationResult.invalidFields['activity_log.site_id'] = "";
			this.abCbRequestAddNewLocation.displayValidationResult();
			//View.showMessage(displayedMessage);
			return false;
		}
		if(!valueExistsNotEmpty(probType)){
			var fldProbType = this.abCbRequestAddNewLocation.fields.get('activity_log.prob_type');
			//var displayedMessage = getMessage('msg_field_mandatory').replace('{0}', fldSite.fieldDef.title);
			this.abCbRequestAddNewLocation.validationResult.valid = false;
			this.abCbRequestAddNewLocation.validationResult.message = this.abCbRequestAddNewLocation.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
			this.abCbRequestAddNewLocation.validationResult.invalidFields['activity_log.prob_type'] = "";
			this.abCbRequestAddNewLocation.displayValidationResult();
			//View.showMessage(displayedMessage);
			return false;
		}
		// validate site and building
		if(!validateSiteAndBldg(siteId, blId)){
			return false;
		}
		
		var resObject = {};
		resObject.probType = probType;
		var locationTypes;
		if(this.abCbRequestAddNewLocation.hasFieldMultipleValues("activity_log.hcm_loc_typ_id")){
			locationTypes = this.abCbRequestAddNewLocation.getFieldMultipleValues("activity_log.hcm_loc_typ_id");
		}else{
			locationTypes = this.abCbRequestAddNewLocation.getFieldValue("activity_log.hcm_loc_typ_id");
		}
		resObject.hcmLocTypId = locationTypes;
		resObject.siteId = this.abCbRequestAddNewLocation.getFieldValue("activity_log.site_id");
		resObject.blId = this.abCbRequestAddNewLocation.getFieldValue("activity_log.bl_id");
		resObject.flId = this.abCbRequestAddNewLocation.getFieldValue("activity_log.fl_id");
		resObject.rmId = this.abCbRequestAddNewLocation.getFieldValue("activity_log.rm_id");
		
		var places = [];
		for(var i=0; i< this.abCbRequestAddNewPlaces.gridRows.length ;i++){
			var gridRow = this.abCbRequestAddNewPlaces.gridRows.get(i);
			var row = {};
			row.blId = gridRow.getFieldValue("cb_hcm_places.bl_id");
			row.flId = gridRow.getFieldValue("cb_hcm_places.fl_id");
			row.rmId = gridRow.getFieldValue("cb_hcm_places.rm_id");
			places.push(row);
		}
		
		resObject.places = places;
		
		if(this.view.parameters.callback){
			this.view.parameters.callback.call(this, resObject);
		}
	}
})

/**
 * edit current row
 */
function editRow(){
	var grid = View.panels.get("abCbRequestAddNewPlaces");
	var form = View.panels.get("abCbRequestAddNewPlaceEdit");
	var controller = View.controllers.get("abCbRequestAddCtrl");
	var selectedRowIndex = grid.selectedRowIndex;
	var gridRow = grid.gridRows.get(selectedRowIndex);
	var blId = gridRow.getFieldValue("cb_hcm_places.bl_id");
	var flId = gridRow.getFieldValue("cb_hcm_places.fl_id");
	var rmId = gridRow.getFieldValue("cb_hcm_places.rm_id");
	controller.selectedRowIndex = selectedRowIndex;
	form.refresh(null, false);
	form.setFieldValue("cb_hcm_places.bl_id", blId);
	form.setFieldValue("cb_hcm_places.fl_id", flId);
	form.setFieldValue("cb_hcm_places.rm_id", rmId);
}