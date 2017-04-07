/**
 * Controller for Incidents Map - Console view
 */
var abEhsRptIncidentsMapConsoleCtrl = View.createController('abEhsRptIncidentsMapConsoleCtrl', {
	
	restriction: null,
	
	restrictionString: "1=1",
	
	abEhsRptIncidentsMapConsole_console_onShow: function(){
		// we just call refresh tabs function from tabs controller.
		var tabsView = View.panels.get('panel_row1col2').getContentFrame().View;
		var tabsController = tabsView.controllers.get('abEhsRptIncidentsMapLocTabsCtrl');
		tabsController.refreshTabs();
		
	},
	
	validateFilter: function(){
		// validate date from date to
		var objConsole = this.abEhsRptIncidentsMapConsole_console;
		var dateFrom = objConsole.getFieldValue("date_incident_from");
		var dateTo = objConsole.getFieldValue("date_incident_to");
		if (valueExistsNotEmpty(dateFrom) && valueExistsNotEmpty(dateTo)){
			var objDateFrom = objConsole.getDataSource().parseValue("ehs_incidents.date_incident", dateFrom, false);
			var objDateTo = objConsole.getDataSource().parseValue("ehs_incidents.date_incident", dateTo, false);
			if (objDateFrom >= objDateTo) {
				View.showMessage(getMessage("errDateFromGreaterThanDateTo"));
				return false;
			}
		}
		
		return true;
	},
	
	getConsoleRestriction: function(){
		var restriction = new Ab.view.Restriction();
		var restrictionString = "1=1";
		var objConsole = this.abEhsRptIncidentsMapConsole_console;

		var incidentType = objConsole.getFieldValue("ehs_incidents.incident_type");
		if (valueExistsNotEmpty(incidentType)) {
			restriction.addClause("ehs_incidents.incident_type", incidentType, "=");
			restrictionString += " AND ehs_incidents.incident_type = '" + incidentType + "'";
		}

		var emIdAffected = objConsole.getFieldValue("ehs_incidents.em_id_affected");
		if (valueExistsNotEmpty(emIdAffected)) {
			restriction.addClause("ehs_incidents.em_id_affected", emIdAffected, "=");
			restrictionString += " AND ehs_incidents.em_id_affected = '" + emIdAffected + "'";
		}

		var eqId = objConsole.getFieldValue("ehs_incidents.eq_id");
		if (valueExistsNotEmpty(eqId)) {
			restriction.addClause("ehs_incidents.eq_id", eqId, "=");
			restrictionString += " AND ehs_incidents.eq_id = '" + eqId + "'";
		}

		var responsibleMgr = objConsole.getFieldValue("ehs_incidents.responsible_mgr");
		if (valueExistsNotEmpty(responsibleMgr)) {
			restriction.addClause("ehs_incidents.responsible_mgr", responsibleMgr, "=");
			restrictionString += " AND ehs_incidents.responsible_mgr = '" + responsibleMgr + "'";
		}

		var causeCategoryId = objConsole.getFieldValue("ehs_incidents.cause_category_id");
		if (valueExistsNotEmpty(causeCategoryId)) {
			restriction.addClause("ehs_incidents.cause_category_id", causeCategoryId, "=");
			restrictionString += " AND ehs_incidents.cause_category_id = '" + causeCategoryId + "'";
		}

		var injuryCategoryId = objConsole.getFieldValue("ehs_incidents.injury_category_id");
		if (valueExistsNotEmpty(injuryCategoryId)) {
			restriction.addClause("ehs_incidents.injury_category_id", injuryCategoryId, "=");
			restrictionString += " AND ehs_incidents.injury_category_id = '" + injuryCategoryId + "'";
		}

		var injuryAreaId = objConsole.getFieldValue("ehs_incidents.injury_area_id");
		if (valueExistsNotEmpty(injuryAreaId)) {
			restriction.addClause("ehs_incidents.injury_area_id", injuryAreaId, "=");
			restrictionString += " AND ehs_incidents.injury_area_id = '" + injuryAreaId + "'";
		}
		
		var dateFrom = objConsole.getFieldValue("date_incident_from");
		if (valueExistsNotEmpty(dateFrom)) {
			restriction.addClause("ehs_incidents.date_incident", dateFrom, ">=", 'AND', false);
			restrictionString += " AND ehs_incidents.date_incident >= ${sql.date('" + dateFrom + "')}";
		}
		
		var dateTo = objConsole.getFieldValue("date_incident_to");
		if (valueExistsNotEmpty(dateTo)) {
			restriction.addClause("ehs_incidents.date_incident", dateTo, "<=", 'AND', false);
			restrictionString += " AND ehs_incidents.date_incident <= ${sql.date('" + dateTo + "')}";
		}
		this.restriction = restriction;
		this.restrictionString = restrictionString;
		
		return {consoleRestriction: this.restriction,
			consoleRestrictionString: this.restrictionString};
	},
	
	getIncidentLocations: function(){
		var locations = {
				buildings : new Array(),
				floors: new Array(),
				rooms: new Array()
		}
		if (valueExists(this.restriction) && this.restriction.clauses.length > 0) {
			var records = this.abEhsRptIncidentsMapConsole_ds.getRecords(this.restriction);
			for (var i = 0; i < records.length; i++) {
				var record = records[i];
				var buildingId = record.getValue("ehs_incidents.bl_id");
				if (valueExistsNotEmpty(buildingId)){
					locations.buildings.push(buildingId);
				}
				var floorId = record.getValue("ehs_incidents.fl_id");
				if (valueExistsNotEmpty(floorId)){
					locations.floors.push(floorId);
				}
				var roomId = record.getValue("ehs_incidents.rm_id");
				if (valueExistsNotEmpty(roomId)){
					locations.rooms.push(roomId);
				}
			}
		}
		return locations;
	}
});