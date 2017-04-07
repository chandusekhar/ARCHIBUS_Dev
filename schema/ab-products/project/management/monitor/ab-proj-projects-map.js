var projProjectsMapPage1Controller = View.createController('projProjectsMapPage1', {	
	map: null,
	projectId: null,
	blId: null,
	
	afterViewLoad: function(){;
		var configObject = new Ab.view.ConfigObject();
		this.map = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject);	
		this.map.addMarkerAction(getMessage("labelShowDetails"), this.showBuildingDetails);
	},
	
	projProjectsMap_console_onClear: function() {
		this.projProjectsMap_console.clear();
		this.projectId = null;
		var projectParameter = '1=1';
		this.projProjectsMapPage1_buildingsGrid.addParameter('projectParameter', projectParameter);
		this.projProjectsMapPage1_buildingsGrid.refresh();
		this.projProjectsMapPage1_buildingsGrid.setAllRowsSelected(false);
		this.projProjectsMapPage1_itemsDetails.restriction=null;
		this.projProjectsMapPage1_itemsDetails.refresh();
		this.map.refresh(new Ab.view.Restriction());
		this.map.clear();
	},
	
	projProjectsMap_console_onFilter: function() {
		this.projectId = this.projProjectsMap_console.getFieldValue('project.project_id');
		var restriction = new Ab.view.Restriction();

		var projectParameter = '1=1';
		if (this.projectId) {
			projectParameter = " activity_log.project_id = '" + this.projectId + "'";
			restriction.addClause('activity_log.project_id', this.projectId);
		}
		this.projProjectsMapPage1_buildingsGrid.addParameter('projectParameter', projectParameter);
		this.projProjectsMapPage1_buildingsGrid.refresh();
		this.projProjectsMapPage1_itemsDetails.refresh(restriction);
	},
	
	projProjectsMapPage1_buildingsGrid_onShowBuildings: function() {
		
		var isValidGisLicense = hasValidArcGisMapLicense();
		if (isValidGisLicense) {
		
			this.map.clear();
			
			var markerProperty = new Ab.arcgis.ArcGISMarkerProperty('projProjectsMapPage1_buildingsDS', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.address1', 'bl.name', 'bl.site_id', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']);
			this.map.updateDataSourceMarkerPropertyPair('projProjectsMapPage1_buildingsDS', markerProperty);
		}	
		var restriction = new Ab.view.Restriction();
		
		if (this.projectId) {
			restriction.addClause('activity_log.project_id', this.projectId);
		}
		var blIds = this.projProjectsMapPage1_buildingsGrid.getFieldValuesForSelectedRows('bl.bl_id');
		if (blIds.length > 0) {
			restriction.addClause('bl.bl_id', blIds, "IN", "AND");
			
			if (isValidGisLicense) {
				var blRestriction = new Ab.view.Restriction();
				blRestriction.addClause('bl.bl_id', blIds, "IN", "AND");
				this.map.refresh(blRestriction);
			}
		}
		this.projProjectsMapPage1_itemsDetails.refresh(restriction);
 	},
	
	showBuildingDetails: function(title, attributes) {
		var controller = View.controllers.get('projProjectsMapPage1');
	    controller.blId = title;
	    View.openDialog('ab-proj-projects-map-page2.axvw');
	}
});