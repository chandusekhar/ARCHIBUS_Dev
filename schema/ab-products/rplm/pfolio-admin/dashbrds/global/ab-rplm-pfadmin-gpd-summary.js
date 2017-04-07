var abRplmGpdSummaryCtrl = View.createController('abRplmGpdSummaryCtrl', {
	
	objFilter: null,
	
	afterViewLoad: function(){
		this.loadLogoImage();
		// set more label
		var objMore = $("more");
		if (objMore) {
			objMore.innerHTML = getMessage("msgMore");
		}
		// set UOM units for area fields
		if (View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"] == "1") {
			for (var i = 0; i < this.abRplmGpdSummary.fieldDefs.length; i++) {
				if (this.abRplmGpdSummary.fieldDefs[i].id == "bl.area_gross_int_sum" 
					|| this.abRplmGpdSummary.fieldDefs[i].id == "bl.area_avg_em_sum") {
					this.abRplmGpdSummary.fieldDefs[i].title = this.abRplmGpdSummary.fieldDefs[i].title + " " + View.user.areaUnits.title;
				}
			}
		}
		
	},
	
	afterInitialDataFetch: function(){
		// try to get restriction object
/*
		if (this.view.restriction != null) {
			this.objFilter = this.view.restriction;
		}
*/
		this.htmlLogo.actions.get("htmlLogo_showAsDialog").show(false);
		var restriction = this.getSqlRestriction(this.objFilter);
		this.abRplmGpdSummary.addParameter("filterRestriction", restriction);
		this.abRplmGpdSummary.refresh();
	},

	abRplmGpdSummary_afterRefresh: function(){
		this.appendMoreDetailsButton();
	},
	
	appendMoreDetailsButton: function(){
		var tableId = this.abRplmGpdSummary.parentElementId + '_table';
		var table =  Ext.get(tableId);
		if (table) {
			var tFoot = document.createElement('tfoot');
			var tRow = document.createElement('tr');
			var tCell = document.createElement('td');
			tCell.colSpan = 4;
			tCell.style.borderStyle = 'none';
			tCell.style.textAlign = 'center';
			var linkHtml = '<a align="center" href="#" onClick="abRplmGpdSummaryCtrl.showDetails();">';
			linkHtml += '<span align="center" id="more" class="mainBar">' + getMessage("msgMore") + '</span>';
			linkHtml += '</a>';
			tCell.innerHTML = linkHtml;
			
			tRow.appendChild(tCell);
			tFoot.appendChild(tRow);
            table.appendChild(tFoot);
		}
	},

	
	loadLogoImage: function(){
		var objLogo = $("Logo");
		if (objLogo) {
			objLogo.innerHTML = '<img height="80" src="'+View.contextPath+'/schema/ab-system/graphics/archibus-logo.gif" title="ARCHIBUS Logo" ALT="ARCHIBUS Logo" border="5"/>';
		}
	},

	showDetails: function(){
		var restriction = this.getSqlRestriction(this.objFilter)
		View.openDialog('ab-rplm-pfadmin-gpd-summary-details.axvw', restriction, false);
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