var abRplmPfadminGpdBldgAgeCtrl = View.createController('abRplmPfadminGpdBldgAgeCtrl', {
	objFilter: null,
	
	afterInitialDataFetch: function(){
		// try to get restriction object from current view or from opener
		if (View.restriction != null){
			this.objFilter = View.restriction;
		} else if (View.getOpenerView().restriction != null){
			this.objFilter = View.getOpenerView().restriction;
		}
		
		var instructionLabel = '';
		// try to get instructionLabel object from filter controller
		if (View.controllers.get('ctrlGpdFilter') != null){
			instructionLabel = View.controllers.get('ctrlGpdFilter').instructionLabel;
		} else if (View.getOpenerView().controllers.get('ctrlGpdFilter') != null){
			instructionLabel = View.getOpenerView().controllers.get('ctrlGpdFilter').instructionLabel;
		}
		
		// display filter restriction as an instruction for maximized view
		if(this.view.parameters){
			if(this.view.parameters.maximize){
				this.abRplmPfadminGpdBldgAge_chart.setInstructions(instructionLabel);
			}
		}
		
		var restriction = this.getSqlRestriction(this.objFilter);
		this.abRplmPfadminGpdBldgAge_chart.addParameter("filterRestriction", restriction);
		this.abRplmPfadminGpdBldgAgeDetails.addParameter("filterRestriction", restriction);
		this.abRplmPfadminGpdBldgAge_chart.refresh();
		
	},
	
	getSqlRestriction: function( objFilter ){
		var result = "";
		if (objFilter != null) {
			if (valueExists(objFilter.bu_id)) {
				// is organization
				if(valueExistsNotEmpty(objFilter.dp_id)){
					result += "AND rm.dp_id = '" + objFilter.dp_id + "' ";
				}
				if(valueExistsNotEmpty(objFilter.dv_id)){
					result += "AND rm.dv_id = '" + objFilter.dv_id + "' ";
				}
				if(valueExistsNotEmpty(objFilter.bu_id) && result.length == 0 ){
					result += "AND EXISTS(SELECT dv.dv_id FROM dv WHERE dv.dv_id = rm.dv_id AND dv.bu_id = '" + objFilter.bu_id + "')";
				}
				if (result.length > 0 ) {
					result = "AND EXISTS(SELECT rm.bl_id FROM rm WHERE rm.bl_id = bl.bl_id " + result + ") ";
				}
			}else {
				// is location
				if (valueExistsNotEmpty(objFilter.site_id)) {
					result += "AND bl.site_id = '"+ objFilter.site_id +"' ";
				}
				if (valueExistsNotEmpty(objFilter.ctry_id)) {
					result += "AND bl.ctry_id = '"+ objFilter.ctry_id +"' ";
				}
				if (valueExistsNotEmpty(objFilter.geo_region_id) && result.length == 0 ) {
					result += "AND EXISTS(SELECT ctry.ctry_id FROM ctry WHERE ctry.ctry_id = bl.ctry_id AND ctry.geo_region_id = '" + objFilter.geo_region_id + "') ";
				}
			}
			
			if (valueExistsNotEmpty(objFilter.use1)) {
				result += "AND bl.use1 = '" + objFilter.use1 + "' ";
			}
			
			if (result.length == 0) {
				result = " 1 = 1 ";
			}else {
				if (result.indexOf("AND") == 0) {
					result = result.slice(3);
				}
			}
			
		} else {
			result = " 1 = 1 ";
		}
		return result;
	}

});

