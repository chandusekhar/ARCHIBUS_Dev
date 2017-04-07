function afterGeneratingTreeNode(treeNode){
	
	var indexLevel = treeNode.level.levelIndex;
	var labelText = "";
	if(indexLevel == 0){
		treeNode.restriction.addClause('activity_log.site_id', treeNode.data['activity_log.site_id']);
		labelText = "<span class='" + treeNode.level.cssPkClassName + "'>" + treeNode.data['activity_log.site_id'] + "</span> ";
        labelText += "<span class='" + treeNode.level.cssClassName + "'>" + treeNode.data['site.name'] + "</span> ";
        treeNode.setUpLabel(labelText);
	}
	
	if(indexLevel == 1){
		treeNode.restriction.addClause('activity_log.bl_id', treeNode.data['activity_log.bl_id']);
		labelText = "<span class='" + treeNode.level.cssPkClassName + "'>" + treeNode.data['activity_log.bl_id'] + "</span> ";
        labelText += "<span class='" + treeNode.level.cssClassName + "'>" + treeNode.data['bl.name'] + "</span> ";
        treeNode.setUpLabel(labelText);
	}
	
	if(indexLevel == 2){
		treeNode.restriction.addClauses(treeNode.parent.restriction, true, false);
		treeNode.restriction.addClause('activity_log.fl_id', treeNode.data['activity_log.fl_id']);
		
		labelText = "<span class='" + treeNode.level.cssPkClassName + "'>" + treeNode.data['activity_log.fl_id'] + "</span> ";
        labelText += "<span class='" + treeNode.level.cssClassName + "'>" + treeNode.data['fl.name'] + "</span> ";
        treeNode.setUpLabel(labelText);
	}
	

		if (indexLevel == 3) {
		labelText = "<span class='" + treeNode.level.cssPkClassName + "'>" + treeNode.data['activity_log.rm_id'] + "</span> ";
		labelText += "<span class='" + treeNode.level.cssClassName + "'>" + treeNode.data['rm.name'] + "</span> ";
		treeNode.setUpLabel(labelText);

	}
}



var abCbRptAssessLocController = View.createController('abCbRptAssessLoc', {

	restriction: "1=1",
	
	printableRestriction: [],
	
	nodePrintableRestriction: [],
	
	abCbRptAssessLoc_filter_onShow:function(){
    	// validateDates
    	var startDate = this.abCbRptAssessLoc_filter.getFieldValue("dateFrom");
    	var endDate = this.abCbRptAssessLoc_filter.getFieldValue("dateTo");
    	if(!validateDates(startDate, endDate))
        	return;
		
		this.printableRestriction = [];
		this.restriction = this.getSqlRestriction();
		this.abCbRptAssessLocSiteTree.addParameter('filterRestriction' , this.restriction);
		this.abCbRptAssessLocHazAssess.addParameter('filterRestriction' , this.restriction);
		
		this.abCbRptAssessLocHazAssess.show(false);
		this.abCbRptAssessLocSamples.show(false);
		this.abCbRptAssessLocSamplesResultList.show(false);
		this.abCbRptAssessLocSiteTree.refresh();
		
		
	},
	
	/**
	 * Event listener for clicking on node's tree.
	 */
	onClickTreeNode:function(){
		
		var nodeData = this.abCbRptAssessLocSiteTree.lastNodeClicked.data;
		var nodeRestriction = " 1=1 ";
		this.nodePrintableRestriction = [];
		
		
		if (nodeData['activity_log.site_id']){
			nodeRestriction += " and activity_log.site_id = '" + nodeData['activity_log.site_id'] + "'";
			this.nodePrintableRestriction.push({'title': this.abCbRptAssessLoc_filter.fields.get('activity_log.site_id').fieldDef.title, 'value': nodeData['activity_log.site_id']});
			
		}
		
		if (nodeData['activity_log.bl_id'] ){
			nodeRestriction += " and activity_log.bl_id = '" + nodeData['activity_log.bl_id'] + "'";
			this.nodePrintableRestriction.push({'title': this.abCbRptAssessLoc_filter.fields.get('activity_log.bl_id').fieldDef.title, 'value': nodeData['activity_log.bl_id']});
		}
		
		if (nodeData['activity_log.fl_id'] ){
			nodeRestriction += " and activity_log.fl_id = '" + nodeData['activity_log.fl_id'] + "'";
			this.nodePrintableRestriction.push({'title': this.abCbRptAssessLoc_filter.fields.get('activity_log.fl_id').fieldDef.title, 'value': nodeData['activity_log.fl_id']});
		}
		
		if (nodeData['activity_log.rm_id'] ){
			nodeRestriction += " and activity_log.rm_id = '" + nodeData['activity_log.rm_id'] + "'";
			this.nodePrintableRestriction.push({'title': getMessage('room'), 'value': nodeData['activity_log.rm_id']});
		}
		
		var fullRestriction = this.restriction + ' AND '  + nodeRestriction;
		
		this.abCbRptAssessLocHazAssess.refresh(fullRestriction);
		this.abCbRptAssessLocSamples.refresh(fullRestriction);
		this.abCbRptAssessLocSamplesResultList.addParameter("consoleRestriction", fullRestriction);
		this.abCbRptAssessLocSamplesResultList.refresh();
		this.abCbRptAssessLoc_panelResultsSum.addParameter("consoleRestriction", fullRestriction);
		this.abCbRptAssessLoc_panelResultsSum.refresh();
	},
	
	
	/**
	 * Read filter's fields and returns a sql restriction based on fields' values.
	 * 
	 */
	getSqlRestriction: function(){
		var restriction = "1=1";

		var fields = this.abCbRptAssessLoc_filter.fields.items;
		for(var i = 0; i < fields.length; i++){
			var field = fields[i];
			var fieldName = field.fieldDef.id;
			var fieldValue = this.abCbRptAssessLoc_filter.getFieldValue(fieldName);
			var fieldTitleHazard = "";
			var fieldValueHazard = "";
			var consoleDs = this.abCbRptAssessLoc_filter.getDataSource();
			
			if(fieldValue){
				if (fieldName == 'hcm_is_hazard_or1'){
					var fieldValueOr = this.abCbRptAssessLoc_filter.getFieldValue('hcm_is_hazard_or2');
					if(fieldValueOr){
						restriction += " and (activity_log.hcm_is_hazard = '" + fieldValue + "' or activity_log.hcm_is_hazard ='" + fieldValueOr + "')";
						fieldValueHazard =  consoleDs.formatValue("activity_log.hcm_is_hazard", fieldValue, true) + " " + this.abCbRptAssessLoc_filter.fields.get('hcm_is_hazard_or2').fieldDef.title + " " + consoleDs.formatValue("activity_log.hcm_is_hazard", fieldValueOr, true);
					}else{
						restriction += " and activity_log.hcm_is_hazard = '" + fieldValue + "'";
						fieldValueHazard = consoleDs.formatValue("activity_log.hcm_is_hazard", fieldValue, true);
					}
					fieldTitleHazard = field.fieldDef.title;
					this.printableRestriction.push({'title': fieldTitleHazard, 'value': fieldValueHazard});
				} else if(fieldName == 'hcm_is_hazard_or2'){	
					//already added to restriction if hcm_is_hazard_or1 has value
					var fieldValue1 = this.abCbRptAssessLoc_filter.getFieldValue('hcm_is_hazard_or1');
					if(!fieldValue1){
						restriction += " and activity_log.hcm_is_hazard = '" + fieldValue + "'";
						fieldTitleHazard = this.abCbRptAssessLoc_filter.fields.get('hcm_is_hazard_or1').fieldDef.title;
						fieldValueHazard = consoleDs.formatValue("activity_log.hcm_is_hazard", fieldValue, true);
						this.printableRestriction.push({'title': fieldTitleHazard, 'value': fieldValueHazard});
					}
				} else if (field.fieldDef.isEnum){
					restriction += " and " + fieldName + " = '" + fieldValue + "' ";
				} else if (field.fieldDef.isDate){
					if(fieldName == 'dateFrom'){
					restriction += " and " + field.getFullName() + " >= ${sql.date('" + fieldValue + "')} ";
					}else if(fieldName == 'dateTo'){
						restriction += " and " + field.getFullName() + " <= ${sql.date('" + fieldValue + "')} ";
					}
				}else {
					var fieldIds = this.abCbRptAssessLoc_filter.getFieldMultipleValues(field.getFullName());
					restriction += " and " + field.getFullName() + " in ('" + fieldIds.join("','") + "') ";
				}
				if(fieldName != 'hcm_is_hazard_or1' && fieldName != 'hcm_is_hazard_or2'){
					var fieldIds = this.abCbRptAssessLoc_filter.getFieldMultipleValues(field.getFullName());
					this.printableRestriction.push({'title': field.fieldDef.title, 'value': fieldIds.join(", ")});
				}
			}
		
		}
		return restriction;
	},
	
	abCbRptAssessLocHazAssess_onDoc: function(){
		var finalPrintableRestriction = this.printableRestriction;
		
		finalPrintableRestriction = this.replacePrintableRestrictionValues('activity_log.site_id', finalPrintableRestriction);
		finalPrintableRestriction = this.replacePrintableRestrictionValues('activity_log.bl_id', finalPrintableRestriction);
		finalPrintableRestriction = this.replacePrintableRestrictionValues('activity_log.fl_id', finalPrintableRestriction);
		
		var rmTitle = getMessage('room');
		var rmTree = getMapValue(this.nodePrintableRestriction,rmTitle);
		if(rmTree){
			finalPrintableRestriction.push({'title': rmTitle, 'value': rmTree});
		}
		
		var parameters = {
		        'consoleRestriction': this.restriction + " AND " + this.abCbRptAssessLocHazAssess.restriction + 
		        " and activity_log.project_id in (select project_id from project where project_type = 'ASSESSMENT - HAZMAT') ",
		        'printRestriction': true, 
		        'printableRestriction': finalPrintableRestriction
		    };
			
		View.openPaginatedReportDialog('ab-cb-rpt-assess-pgrp.axvw', null, parameters)
	},
	
	/**
	 * Replace a value in a printable restriction. If site, building or floor are restricticted by filter and 
	 * by tree selection then the restriction from tree selection replaces the restriction in the filter restriction,
	 * else tree selection restriction is added.
	 * @returns printable restriction obtain after replacement
	 */
	replacePrintableRestrictionValues: function(fieldId, finalPrintableRestriction){
		var title = this.abCbRptAssessLoc_filter.fields.get(fieldId).fieldDef.title;
		var filterValue = getMapValue(finalPrintableRestriction, title);
		var treeValue = getMapValue(this.nodePrintableRestriction, title);
		if(filterValue && treeValue){
			finalPrintableRestriction = setMapValue(finalPrintableRestriction, title, treeValue);
		}else if(treeValue){
			finalPrintableRestriction.push({'title': title, 'value': treeValue});
		}
		return finalPrintableRestriction;
	}
	
    
  
})

/**
 * onClick event handler for viewSamples button
 * 
 * @param {Object} row
 */
function onClickViewSamples(row){
	var controller = abCbRptAssessLocController;
	var restriction = abCbRptAssessLocController.restriction + " AND cb_samples.activity_log_id = '" + row["activity_log.activity_log_id"] + "'";
	
	controller.abCbRptAssessLocSamples.refresh(restriction);
	controller.abCbRptAssessLoc_tabs.selectTab("abCbRptAssessLocSamples_tabSamples");
}

/**
 * onClick event handler for viewLabResults button in Assessments panel
 * 
 * @param {Object} row
 */
function onClickAssessLabResults(row){
	var controller = abCbRptAssessLocController;
	var restriction = controller.restriction
					+ " AND activity_log.activity_log_id = '" + row["activity_log.activity_log_id"] + "'";
	
	controller.abCbRptAssessLocSamplesResultList.addParameter("consoleRestriction", restriction);
	controller.abCbRptAssessLocSamplesResultList.refresh();
	controller.abCbRptAssessLoc_panelResultsSum.addParameter("consoleRestriction", restriction);
	controller.abCbRptAssessLoc_panelResultsSum.refresh();
	controller.abCbRptAssessLoc_tabs.selectTab("abCbRptAssessLocSamplesResultList_tab");
}

/**
 * onClick event handler for viewLabResults button in Samples panel
 * 
 * @param {Object} row
 */
function onClickSampleLabResults(row){
	var controller = abCbRptAssessLocController;
	var restriction = controller.restriction
					+ " AND cb_samples.sample_id = '" + row["cb_samples.sample_id"] + "'";
	
	controller.abCbRptAssessLocSamplesResultList.addParameter("consoleRestriction", restriction);
	controller.abCbRptAssessLocSamplesResultList.refresh();
	controller.abCbRptAssessLoc_panelResultsSum.addParameter("consoleRestriction", restriction);
	controller.abCbRptAssessLoc_panelResultsSum.refresh();
	controller.abCbRptAssessLoc_tabs.selectTab("abCbRptAssessLocSamplesResultList_tab");
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

/**
 * Custom 'selectValue' action used by fields: fl_id. 
 * Add to restriction project_id if selected.
 */
function selectValue() {
	
	var restriction = "1=1";
	var projectId = View.panels.get('abCbRptAssessLoc_filter').getFieldMultipleValues('activity_log.project_id');
	if (projectId.length>0 && projectId[0] != undefined && projectId[0] != "") {
		restriction = "(EXISTS (select 1 from activity_log where activity_log.fl_id = fl.fl_id and activity_log.bl_id = fl.bl_id and activity_log.project_id in ('"
				+ projectId.join("','") + "')))";
	}

	View.selectValue('abCbRptAssessLoc_filter', 
					getMessage('floor'), 
					['activity_log.bl_id','activity_log.fl_id'],
					'fl', 
					['fl.bl_id','fl.fl_id'], 
					['fl.bl_id','fl.fl_id','fl.name'], 
					restriction,
					null, null, null, null, null, null, 
					'multiple');
	
}