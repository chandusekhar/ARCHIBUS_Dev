/**
 * common functions for CA highlight reports
 * 
 */

/**
 * overwrite function to make add project on node restriction
 * @param {Object} parentNode
 * @param {Object} level
 */
Ab.tree.TreeControl.prototype._createRestrictionForLevel = function(parentNode, level) {
    var restriction = this.createRestrictionForLevel(parentNode, level);
	
	if (!restriction) {
		restriction = new Ab.view.Restriction();
		// add the tree restriction to parameter list if not null.
		if (this.restriction && this.restriction.clauses != undefined && this.restriction.clauses.length > 0) {
			restriction.addClauses(this.restriction, true);
		}
		
		// add the tree level's restriction to parameter list if not null.
		var levelRest = this.getRestrictionForLevel(level);
		if (levelRest && levelRest.clauses != undefined && levelRest.clauses.length > 0) {
			restriction.addClauses(levelRest, true);
		}
		
		// add the parent node's restriction to parameter list. it should always contain something
		if (!parentNode.isRoot()){
			if(this.type=='hierTree' || this.type=='selectValueHierTree'){
				restriction.addClauses(parentNode.restriction, true);
		    } else {
		    	if (this._panelsData[level].useParentRestriction==true) {
					restriction.addClauses(parentNode.restriction, true);
				}
			}
		}
		// bldg level, we must add project
		if(level == 2 && parentNode.parent.data['city.city_id'] != undefined){
			restriction.addClause('bl.city_id', parentNode.parent.data['city.city_id']);
		}
		//floor level, we must add project and site
		if(level == 3 && parentNode.parent.data['site.site_id'] != undefined && parentNode.parent.parent.data['city.city_id'] != undefined){
			restriction.addClause('rm.site_id', parentNode.parent.data['site.site_id']);
			restriction.addClause('rm.city_id', parentNode.parent.parent.data['city.city_id']);
		}
	}
	
	return restriction;
}


/**
 * check if curent building is geocoded (lat, lon exist)
 * if not the not_geocoded icon is added to curent node
 * @param {Object} treeNode - tree node
 */
function afterGeneratingTreeNode(treeNode){
	if (treeNode.level.levelIndex == 2 && treeNode.data['bl.bl_id'] != undefined) {
		if (hasValidArcGisMapLicense()) {
			var geocoded = true;
			var labelText = treeNode.label;
			var itemId = treeNode.data['bl.bl_id'];
			var parameters = null;
			parameters = {
				tableName: 'bl',
				fieldNames: toJSON(['bl.bl_id', 'bl.lat', 'bl.lon', 'bl.address1', 'bl.address2', 'bl.city_id', 'bl.state_id']),
				restriction: toJSON({
					'bl.bl_id': itemId
				})
			};
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if (result.code == 'executed') {
				geocoded = (valueExistsNotEmpty(result.data.records[0]['bl.lat']) && valueExistsNotEmpty(result.data.records[0]['bl.lon']));
			}
			else {
				Workflow.handleError(result);
			}
			if (!geocoded) {
				labelText = labelText + "<img alt='" + getMessage('not_geocoded') + "' border='0' src='/archibus/schema/ab-system/graphics/no_geocode.png'/>";
			}
			treeNode.setUpLabel(labelText);
		}
	}
}

/**
 * Start the paginated report job passing user console restriction
 * 
 * @param {Object} fileName - name of the paginated report definition file
 * @param {Object} consolePanel - console restriction panel
 */
function createPaginatedReport(fileName, consolePanel){
	var parameters = null;
	
	var consoleRestriction = filterToSQLString(consolePanel);
	var drawPanelRest = consoleRestriction.replace(/activity_log\./g, "a.");

	//prepare a custom printable restrictions - paired title and value (localized)
	var printableRestrictions = [];
			
	var site_id = consolePanel.getFieldValue('activity_log.site_id');
	if(	site_id){
		printableRestrictions.push({'title': getMessage('siteId'), 'value': site_id});
	}
	var bl_id = consolePanel.getFieldValue('activity_log.bl_id');
	if(bl_id){
		printableRestrictions.push({'title': getMessage('blId'), 'value': bl_id});
	}
	var fl_id = consolePanel.getFieldValue('activity_log.fl_id');
	if(fl_id){
		printableRestrictions.push({'title': getMessage('flId'), 'value': fl_id});
	}
	var csi_id = consolePanel.getFieldValue('activity_log.csi_id');
	if(csi_id){
		printableRestrictions.push({'title': getMessage('csiId'), 'value': csi_id});
	}
		
	
	parameters = {
        'consoleRestriction': consoleRestriction,
        'drawPanelRest': drawPanelRest,
		'printRestriction':true, 
		'printableRestriction':printableRestrictions
	};
	
	
    View.openPaginatedReportDialog(fileName, null, parameters);
}

/**
 * read console filter as sql string
 * @param {Object} consolePanel
 */
function filterToSQLString(consolePanel){
	var consoleRestriction = "";
	var site_id = consolePanel.getFieldValue('activity_log.site_id');
	if(valueExistsNotEmpty(site_id)){
		consoleRestriction += " AND activity_log.site_id = '" + site_id + "'";
	}
	var bl_id = consolePanel.getFieldValue('activity_log.bl_id');
	if(valueExistsNotEmpty(bl_id)){
		consoleRestriction += " AND activity_log.bl_id = '" + bl_id + "'";
	}
	var fl_id = consolePanel.getFieldValue('activity_log.fl_id');
	if(valueExistsNotEmpty(fl_id)){
		consoleRestriction += " AND activity_log.fl_id = '" + fl_id + "'";
	}
	var csi_id = consolePanel.getFieldValue('activity_log.csi_id');
	if(valueExistsNotEmpty(csi_id)){
		consoleRestriction += " AND activity_log.csi_id = '" + csi_id + "'";
	}
	return (consoleRestriction);
}

/**
 * configure map object and display selected building
 */
function createMarker(mapPanel, mapObj, blId, ds){
    mapPanel.className = 'claro';
	
    mapObj.removeThematicLegend();
    if (mapObj && mapObj.map && mapObj.map.infoWindow) {
        mapObj.map.infoWindow.hide();
    }
	
    var markerProperty = new Ab.arcgis.ArcGISMarkerProperty(ds, ['bl.lat', 'bl.lon'], 'bl.bl_id', ['bl.address']);
    mapObj.updateDataSourceMarkerPropertyPair(ds, markerProperty);
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', blId, '=');
    mapObj.refresh(restriction);
}

/**
 * highligt selected items on dwg
 * @param {Object} panel - Drawig panel
 * @param {Object} items - selected items
 * @param dwgName selected drawing name
 */
function setDwgHighlight(dwgPanel, items, dwgName){
	if (valueExistsNotEmpty(dwgName)) {
		var opts = new DwgOpts();
		opts.rawDwgName = dwgName;
	    for (var i = 0; i < items.length; i++) {
	        var vals = items[i].record;
	        var id = vals['activity_log.bl_id'] + ";" + vals['activity_log.fl_id'] + ";" + vals['activity_log.rm_id'];
	       	opts.appendRec(id);
	    }
		items = null;
	    showDwgToolbar(true);
	    dwgPanel.highlightAssets(opts);
	}
}
