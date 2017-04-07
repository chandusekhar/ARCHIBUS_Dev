
/**
 * Response for clicking on chart panel/cross table.
 * In general, it pops up a dialog to list all related records.
 * 
 * @param {Object} obj the obj from panel, chart panel/cross table
 */
function ABEP_showReportOnCrossTablePanel(obj, url, applyParentPanelRestriction) {
	var restriction = obj.restriction;
	
	if (valueExists(applyParentPanelRestriction) 
			&& applyParentPanelRestriction == true) {
		var consoleRestriction = View.panels.get(obj.parentPanelId).restriction;
		restriction.addClauses(consoleRestriction);
	}
	
	View.openDialog(url, restriction);
}


/**
 * show/hidden the given panel according the parameter visible.
 * 
 * @param {Object} panelId panelId
 * @param {Object} visible show panel if visible is ture, otherwise hidden it.
 */
function ABEP_showPanel(panelId, visible) {
	var panel = View.panels.get(panelId);
	panel.show(visible);
	
}

/**
 * Apply a custom color highlight for enumeration value recovery_status.
 * 
 * @param tableName the table name (rm, eq, em, system_bl)
 * @param drawingPanel the drawing panel
 * @param dataSource the highlight data source
 */
function ABEP_appendRuleSetForRecoveryStatus(tableName, drawingPanel, dataSource) {
	
	if (typeof drawingPanel === 'string' ||  drawingPanel instanceof String) {
		drawingPanel = View.panels.get(drawingPanel);
	}
	if (typeof dataSource === 'string' ||  dataSource instanceof String) {
		dataSource = View.dataSources.get(dataSource);
	}
	
	var ruleset = new DwgHighlightRuleSet();
	
	var fieldName = tableName+".recovery_status";	 	 
	ruleset.appendRule(fieldName, dataSource.fieldDefs.get(fieldName).formatValue("NONE", true), "C0C0C0", "==");
	ruleset.appendRule(fieldName, dataSource.fieldDefs.get(fieldName).formatValue("NONE-REVIEW", true), "8080C0", "==");
	ruleset.appendRule(fieldName, dataSource.fieldDefs.get(fieldName).formatValue("FIT-ONLINE", true), "00FF00", "==");  
	ruleset.appendRule(fieldName, dataSource.fieldDefs.get(fieldName).formatValue("FIT-OFFLINE", true), "80FFFF", "==");
	ruleset.appendRule(fieldName, dataSource.fieldDefs.get(fieldName).formatValue("UNFIT-TEMP", true), "FF9933", "==");
	ruleset.appendRule(fieldName, dataSource.fieldDefs.get(fieldName).formatValue("UNFIT-PERM", true), "FF0000", "=="); 
	
	drawingPanel.appendRuleSet(dataSource.id, ruleset);
}



function getColorForHighlight(vals, showBy) { 	 
	 if (showBy == 'rank') {
		var rankPattern = vals['cb_hazard_rank.hpattern_acad'];	 
		if (rankPattern == '') {
			return null;
		}
		return getColorFromPattern(rankPattern); 
	} else if (showBy == 'rating') {
		var ratingPattern = vals['cb_hazard_rating.hpattern_acad'];	
		if (ratingPattern == '') {
			return null;
		}
		return getColorFromPattern(ratingPattern);  
	} else {
		// default color
		return 0x999999;	 
	}   
}

function getColorFromPattern(pattern) {
	// return as hex
	var color = gAcadColorMgr.getRGBFromPatternForGrid(pattern, true);
	if (color == "-1") { 
		color = gAcadColorMgr.getUnassignedColor(true); 
	}
	return parseInt('0x' + color);
} 

function isDark(color) {
	 var rgb = parseInt(color, 16);   // convert rrggbb to decimal
	 var r = (rgb >> 16) & 0xff;  // extract red
	 var g = (rgb >>  8) & 0xff;  // extract green
	 var b = (rgb >>  0) & 0xff;  // extract blue

	 var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
	 
	 return (luma < 160);
}
