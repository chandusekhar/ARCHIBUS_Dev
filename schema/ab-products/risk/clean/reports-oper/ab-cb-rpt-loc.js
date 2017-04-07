
View.createController('abCbRptLoc', {
	// console printable restriction for paginated report
    printableRestriction: [],

	abCbRptLocBlDetail_onDoc:function(){
		var bl_id = this.abCbRptLocBlDetail.getFieldValue('bl.bl_id');
		var restriction = {"abCbRptLocBlDetail_ds":" bl.bl_id  = '" + bl_id + "'"};

		var consolePrintableRestriction = View.controllers.get('abCbRptLoc').printableRestriction;
		
		var finalPrintableRestriction = null;
		if(consolePrintableRestriction){
			finalPrintableRestriction = consolePrintableRestriction;
		}
		
		finalPrintableRestriction = this.replacePrintableRestrictionValues(getMessage('building'),finalPrintableRestriction, bl_id);
		
		
		// set parameters for paginated report 
		var parameters = {
				 'printRestriction':true, 
				 'printableRestriction': finalPrintableRestriction
				 };
		
		
		View.openPaginatedReportDialog('ab-cb-rpt-bldg-pgrpt.axvw',restriction,parameters);
	},
	
	abCbRptLocFlDetail_onDoc:function(){
		var bl_id = this.abCbRptLocFlDetail.getFieldValue('fl.bl_id');
		var fl_id = this.abCbRptLocFlDetail.getFieldValue('fl.fl_id');
		var restriction = {"abCbRptLocFlDetail_ds":" fl.bl_id  = '" + bl_id + "' and fl.fl_id = '" + fl_id + "'"};

		var consolePrintableRestriction = View.controllers.get('abCbRptLoc').printableRestriction;
		var finalPrintableRestriction = null;
		if(consolePrintableRestriction){
			finalPrintableRestriction = consolePrintableRestriction;
		}
		
		finalPrintableRestriction = this.replacePrintableRestrictionValues(getMessage('building'),finalPrintableRestriction, bl_id);
		finalPrintableRestriction = this.replacePrintableRestrictionValues(getMessage('floor'),finalPrintableRestriction, fl_id);
				
		// set parameters for paginated report 
		var parameters = {
				 'printRestriction':true, 
				 'printableRestriction': finalPrintableRestriction
				 };
		
		
		View.openPaginatedReportDialog('ab-cb-rpt-fl-pgrpt.axvw',restriction,parameters);
	},
	
	abCbRptLocRmDetail_onDoc:function(){
		var bl_id = this.abCbRptLocRmDetail.getFieldValue('rm.bl_id');
		var fl_id = this.abCbRptLocRmDetail.getFieldValue('rm.fl_id');
		var rm_id = this.abCbRptLocRmDetail.getFieldValue('rm.rm_id');
		var restriction = {"abCbRptLocsRmPgRpt_ds":" rm.bl_id  = '" + bl_id + "' and rm.fl_id = '" + fl_id + "' and rm.rm_id = '" + rm_id + "'"};

		var consolePrintableRestriction = View.controllers.get('abCbRptLoc').printableRestriction;
		var finalPrintableRestriction = null;
		if(consolePrintableRestriction){
			finalPrintableRestriction = consolePrintableRestriction;
		}

		finalPrintableRestriction = this.replacePrintableRestrictionValues(getMessage('building'),finalPrintableRestriction, bl_id);
		finalPrintableRestriction = this.replacePrintableRestrictionValues(getMessage('floor'),finalPrintableRestriction, fl_id);
		finalPrintableRestriction = this.replacePrintableRestrictionValues(getMessage('room'),finalPrintableRestriction, rm_id);
		
		// set parameters for paginated report 
		var parameters = {
				 'printRestriction':true, 
				 'printableRestriction': finalPrintableRestriction
				 };
		
		
		View.openPaginatedReportDialog('ab-cb-rpt-rm-pgrpt.axvw',restriction,parameters);
	},
	/**
	 * Replace a value in a printable restriction. If site, building or floor are restricticted by filter and 
	 * by tree selection then the restriction from tree selection replaces the restriction in the filter restriction.
	 * @returns printable restriction obtain after replacement
	 */
	replacePrintableRestrictionValues: function(title, finalPrintableRestriction, treeValue){
		var filterValue = getMapValue(finalPrintableRestriction, title);
		if(filterValue && treeValue){
			finalPrintableRestriction = setMapValue(finalPrintableRestriction, title, treeValue);
		}else if(treeValue){
			finalPrintableRestriction.push({'title': title, 'value': treeValue});
		}
		return finalPrintableRestriction;
	}
})


function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abCbRptLocSiteTree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var siteCode = treeNode.data['site.site_id'];
        if (!siteCode) {
            labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + getMessage("noSite") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var buildingName = treeNode.data['bl.name'];
        var buildingId = treeNode.data['bl.bl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + buildingId + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + buildingName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var floorId = treeNode.data['fl.fl_id'];
        var floorName = treeNode.data['fl.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + floorId + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + floorName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 3) {
        var roomId = treeNode.data['rm.rm_id'];
        var roomName = treeNode.data['rm.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + roomId + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + roomName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

/**
 * Apply console restriction to the tree's data sources.
 * 
 * @param restriction
 */
function applyFilterRestriction(restrictions){
	View.controllers.get('abCbRptLoc').printableRestriction = restrictions.printableRestriction;
	
	View.panels.get('abCbRptLocSiteTree').addParameter('blRestriction', restrictions.blRestriction);
	View.panels.get('abCbRptLocSiteTree').addParameter("flRestriction", restrictions.flRestriction);
	View.panels.get('abCbRptLocSiteTree').addParameter("rmRestriction", restrictions.rmRestriction);
	
	View.panels.get('abCbRptLocSiteTree').refresh();
	View.panels.get('abCbRptLocBlDetail').show(false);
	View.panels.get('abCbRptLocFlDetail').show(false);
	View.panels.get('abCbRptLocRmDetail').show(false);
}

/**
 * Obtain a map({title,value}) value by title.
 * @param map
 * @param title
 * @returns map value for the specified title.
 */
function getMapValue(map, title){
	for ( var i = 0; i < map.length; i++) {
		if (map[i].title == title){
			return map[i].value;
		}
	}
}

/**
 * Replace a map({title,value}) value.
 * @param map
 * @param title
 * @param newVal
 * @returns map after replacement
 */
function setMapValue(map, title, newVal){
	for ( var i = 0; i < map.length; i++) {
		if (map[i].title == title){
			map[i].value = newVal;
			return map;
		}
	}
	return map;
}