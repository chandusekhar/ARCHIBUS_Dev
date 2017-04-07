var abRplmPfadminGpdOwnedByCtrl = View.createController('abRplmPfadminGpdOwnedByCtrl', {
	
	objFilter: null,
	
	chartLevel: null,
	
	afterViewLoad: function(){

	},
	
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
				this.abRplmPfadminGpdOwnedByLocation_chart.setInstructions(instructionLabel);
			}
		}
		
		this.chartLevel = this.getChartLevel(this.objFilter);
		
		var objMap = View.panels.get("abRplmPfadminGpdOwnedByLocation_chart");
		//var detailsPanelId = detailsPanelsObj.get(this.chartLevel).panelId;
		//var objDetailsPanel = View.panels.get(detailsPanelId);
		var restriction = this.getSqlRestriction(this.objFilter);
		objMap.addParameter("filterRestriction", restriction);
		//objDetailsPanel.addParameter("filterRestriction", restriction);
		objMap.loadChartSWFIntoFlash();
		objMap.refresh();
		objMap.setTitle(getMessage("labelOwnedLeasedBy") + " " + this.getTitleByLevel(this.chartLevel));
		
	},
	
	abRplmPfadminGpdOwnedByLocation_chart_afterRefresh: function(){
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			this.abRplmPfadminGpdOwnedByLocation_chart.config.dataAxis[0].title = getMessage("labelOwned") + " " + View.user.areaUnits.title;
			this.abRplmPfadminGpdOwnedByLocation_chart.config.dataAxis[1].title = getMessage("labelLeased") + " " + View.user.areaUnits.title;
		}else{
			this.abRplmPfadminGpdOwnedByLocation_chart.config.dataAxis[0].title = getMessage("labelOwned");
			this.abRplmPfadminGpdOwnedByLocation_chart.config.dataAxis[1].title = getMessage("labelLeased");
		}
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
	},
	
	getChartLevel: function(objFilter){
		var chartLevel = "geo_region_id";
		if (objFilter != null) {
			if (valueExists(objFilter.bu_id)) {
				
			}else{
				if (valueExistsNotEmpty(objFilter.site_id)) {
					chartLevel = "bl_id";
				} else if (valueExistsNotEmpty(objFilter.ctry_id)) {
					chartLevel = "site_id";
				} else if (valueExistsNotEmpty(objFilter.geo_region_id)) {
					chartLevel = "ctry_id";
				} else {
					chartLevel = "geo_region_id";
				}
			}
		}
		return chartLevel;
	},
	
	getTitleByLevel: function(level){
		if (level == "geo_region_id") {
			return getMessage("labelGeoRegion");
		} else if (level == "ctry_id") {
			return getMessage("labelCountry");
		}else if (level == "site_id") {
			return getMessage("labelSite");
		}else if (level == "bl_id") {
			return getMessage("labelBuilding");
		}
	}
});