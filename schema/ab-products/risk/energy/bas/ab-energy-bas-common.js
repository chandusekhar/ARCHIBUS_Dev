var nullValueCode = 'WW99';

function onTreeSelectAll(panelId, select) {
	if (select) {
		View.panels.get(panelId).selectAll();
		onTreeExpandAll(panelId, true);
	} else {
		View.panels.get(panelId).unselectAll();
		onTreeExpandAll(panelId, false);
	}
}

function onTreeExpandAll(panelId, expandTree, treeNode){
	var treePanel = View.panels.get(panelId);
	if (!valueExists(treeNode)) treeNode = treePanel.treeView.getRoot();
	if (!treeNode.isRoot()) {
		if(expandTree){
			if (!treeNode.expanded) {
				treePanel.refreshNode(treeNode);
				treeNode.expand();
			}
		} else {
			if (treeNode.expanded) {
				treeNode.collapse();
			}
		}
	}
    if(treeNode.hasChildren()){
    	var i=0;
        for(i=0; i<treeNode.children.length; i++){
        	var node = null;
            node = treeNode.children[i];
            onTreeExpandAll(panelId, expandTree, node);
        }
    }
}

function onTreeSelectValues(panelId, level, values) {
	var treePanel = View.panels.get(panelId);
	var rootNode = treePanel.treeView.getRoot();
	for(i=0; i < rootNode.children.length; i++){
    	var ctryNode = rootNode.children[i];
    	var ctry_id = ctryNode.data['ctry.ctry_id'];
        if (ctry_id == 'USA') {
        	for(j=0; j < ctryNode.children.length; j++){
            	var cityNode = ctryNode.children[j];
            	if (level == 1) {
	            	var city_id = cityNode.data['city.city_id'];
	            	for (k=0; k < values.length; k++) {
	            		if (city_id == values[k]) {
	                    	cityNode.setSelected(true);
	                    }
	            	} 
            	} else if (level == 4) {
            		for (l=0; l < cityNode.children.length; l++) {
            			var siteNode = cityNode.children[l];
            			for (m=0; m < siteNode.children.length; m++) {
                			var blNode = siteNode.children[m];
                			for (n=0; n < blNode.children.length; n++) {
                    			var meterNode = blNode.children[n];
                    			var data_point_id = Number(meterNode.data['bl.count_fl']);
            	            	for (p=0; p < values.length; p++) {
            	            		if (data_point_id == values[p]) {
            	                    	meterNode.setSelected(true);
            	                    }
            	            	} 
                    		} 
                		} 
            		}            		
            	}
            }
        }
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = new Ab.view.Restriction();
    if (parentNode.data) {
        if (level == 1) {
            restriction.addClause('ctry.ctry_id', parentNode.data['ctry.ctry_id'], '=', 'AND', true);
        } 
        if (level == 2) {
        	restriction.addClause('city.ctry_id', parentNode.data['city.ctry_id'], '=', 'AND', true);
        	restriction.addClause('city.state_id', parentNode.data['city.state_id'], '=', 'AND', true);
            restriction.addClause('city.city_id', parentNode.data['city.city_id'], '=', 'AND', true);
        }        
        if (level == 3){
            restriction.addClause('site.site_id', parentNode.data['site.site_id'], '=', 'AND', true);
        }
        if (level == 4){
            restriction.addClause('bl.site_id', parentNode.data['bl.site_id'], '=', 'AND', true);
            restriction.addClause('bl.bl_id', parentNode.data['bl.bl_id'], '=', 'AND', true);
        }
        if (level == 5){
            restriction.addClause('bas_measurement_scope.data_point_id', parentNode.data['bl.count_fl'], '=', 'AND', true);
        } 
    }
    return restriction;
}

function afterGeneratingTreeNode(node){
	var label = node.label;
	var levelIndex = node.level.levelIndex;
	var msg_id = '';
	if (levelIndex == 0){
		msg_id = 'msg_no_ctry_id';
	} else if (levelIndex == 1){
		msg_id = 'msg_no_city_id';
	} else if (levelIndex == 2){
		msg_id = 'msg_no_site_id';
	} else if (levelIndex == 3){
		msg_id = 'msg_no_bl_id';
	}
	if(label.indexOf(nullValueCode)!= -1){
		var labelText = label.replace(nullValueCode, getMessage(msg_id));
		node.setUpLabel(labelText);
	}
}

function onClickTreeNode(panelId){
	var objTree = View.panels.get(panelId);
	var crtNode = objTree.lastNodeClicked;
	var levelIndex = crtNode.level.levelIndex;
	var restriction = new Ab.view.Restriction();
	if (levelIndex == 4){
		var data_point_id = crtNode.data['bl.count_fl'];
		restriction.addClause('bas_data_point.data_point_id', Number(data_point_id));   	
		View.openDialog('ab-energy-bas-dtl.axvw', restriction, false, {
	    	width: 800,
	    	height: 500,
			closeButton : true
		});
	}
}

function setStartDate(consoleId) {
	var console = View.panels.get(consoleId);
	var date = new Date();
	date.setYear(date.getFullYear()-1);
	var date_start = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD');
	console.setFieldValue('bl.date_start', date_start);
}

function getChartTitle(groupByField, normField, unit, billType) {
	var groupBy = $(groupByField).value;
	var title = getMessage(billType);

	title += ' ' + getMessage(groupBy);
	title += " (" + unit;
	if ($(normField).checked) {
		title += "/";
		title += (View.project.units == 'imperial')? getMessage('unitTitleImperial') : getMessage('unitTitleMetric');
	}
	title += ")";
	return title;
}

function getAxisLabelTitle(billType) {
	var title = getMessage("consumption");
	if (billType == 'electricD') title = getMessage("power");
	else if (billType == 'sewer') title = getMessage("usage");
	return title;
}

function getCommonConsoleRestriction(consoleId) {
	var console = View.panels.get(consoleId);
	var restriction = " 1=1 ";
	restriction += " AND " + getConsoleBlRestriction(consoleId);
	return restriction;
}

function getTreeRestriction(panelId) {	
	var restriction = " 1=1 ";	
	var ids = getMetersList(panelId);
	if (ids != '') {
		ids = "(" + ids + ")";
		restriction += 'AND (bas_data_point.data_point_id IN ' + ids;
	}
	restriction += (restriction == ' 1=1 ')?'':')';
	return restriction;
}

function getMetersList(panelId) {
	var tree = View.panels.get(panelId);
	var levelIndex = 4;
	var nodes = tree.getSelectedNodes(levelIndex);
	var ids = '';
	for (var i = 0; i < nodes.length; i++){
		var id = nodes[i].data['bl.count_fl'];
		ids += (ids=='')?'':', ';			
		ids += "'" + id + "'";
	}
	return ids;
}

function checkVirtualMeterOverlap(panelId, locDtlField) {
	var noOverlap = true;
	var locDtl = $(locDtlField).value;
	if (locDtl != 'byMeter') {
		var ids = getMetersList(panelId);
		if (ids != '') {
			var dsOverlap = View.dataSources.get('energyBasCommon_dsOverlap');
			dsOverlap.addParameter('metersList', ids);
			var records = dsOverlap.getRecords();
			var virtualMeters = "";
			for (var i = 0; i < records.length; i++) {
				virtualMeters += (virtualMeters != "")?", ":"";
				virtualMeters += records[i].getValue('bas_data_point.data_point_id');
			}
			if (virtualMeters != "") {
				var message = String.format(getMessage('virtualMeterOverlap'), virtualMeters);
				View.alert(message);
				noOverlap = false;
			}
		}
	}
	return noOverlap;
}

function getConsoleBlRestriction(consoleId) {
	var console = View.panels.get(consoleId);
	var restriction = " 1=1 ";
	var construction_type = console.getFieldValue('bl.construction_type');
	if (construction_type != '') restriction += " AND bl.construction_type = '" + construction_type + "' ";
	var use1 = console.getFieldValue('bl.use1');
	if (use1 != '') restriction += " AND bl.use1 = '" + use1 + "' ";
	return restriction;
}

function getConsoleMeterRestriction(consoleId,view) {
	var console = View.panels.get(consoleId);
	var restriction = " 1=1 ";
	var value="";
	if(view == "loc"){
		value = $('energyBasLoc_billTypeSelect').value;
	}else{
		value = $('energyBasTime_billTypeSelect').value;
	}
	switch(value){
		case "electricC": restriction += "AND bill_unit.rollup_type = 'Energy' AND bill_unit.bill_type_id = 'ELECTRIC'"; break;
		case "electricD":  restriction += "AND bill_unit.rollup_type = 'Power' AND bill_unit.bill_type_id = 'ELECTRIC'"; break;
		case "gasNatural":  restriction += "AND bill_unit.rollup_type = 'Energy' AND bill_unit.bill_type_id = 'GAS - NATURAL'"; break;
		case "gasPropane":  restriction += "AND bill_unit.rollup_type = 'Energy' AND bill_unit.bill_type_id = 'GAS - PROPANE'"; break;
		case "oil":  restriction += "AND bill_unit.rollup_type = 'Energy' AND bill_unit.bill_type_id = 'FUEL OIL 1'"; break;
		case "oil2":  restriction += "AND bill_unit.rollup_type = 'Energy' AND bill_unit.bill_type_id = 'FUEL OIL 2'"; break;
		case "water":  restriction += "AND bill_unit.rollup_type = 'Volume' AND bill_unit.bill_type_id = 'WATER'"; break;
		case "sewer":  restriction += "AND bill_unit.rollup_type = 'Volume' AND bill_unit.bill_type_id = 'SEWER'"; break;
		default :  restriction += "AND bill_unit.rollup_type = 'Power' AND bill_unit.bill_type_id = 'ELECTRIC'"; break;
	}
	
	return restriction;
}

function isElectricDemand(consoleId,view){
	var console = View.panels.get(consoleId);
	var value="";
	if(view == "loc"){
		value = $('energyBasLoc_billTypeSelect').value;
	}else{
		value = $('energyBasTime_billTypeSelect').value;
	}
	if(value == "electricD"){
		return true;
	}else{
		return false;
	}
}

function getLocDtl(value) {
	var locDtl = '';
	switch (value) {
		case'byCity': 
				locDtl = " (CASE WHEN (bas_measurement_scope.site_id IS NULL AND bas_measurement_scope.bl_id IS NULL) ";
				locDtl += "	THEN ${parameters['noCity']} ";
				locDtl += "	WHEN (bas_measurement_scope.site_id IS NOT NULL AND bas_measurement_scope.bl_id IS NULL) ";
				locDtl += "	THEN (RTRIM(site.state_id) ${sql.concat} '-' ${sql.concat} RTRIM(site.city_id)) "; 
				locDtl += "	ELSE (RTRIM(bl.state_id) ${sql.concat} '-' ${sql.concat} RTRIM(bl.city_id)) END) "; break;
		case 'bySite': 
				locDtl = " (CASE WHEN (bas_measurement_scope.site_id IS NULL AND bl.site_id IS NULL) ";
				locDtl += "	THEN ${parameters['noSite']} ";
				locDtl += "	WHEN (bas_measurement_scope.site_id IS NOT NULL AND bas_measurement_scope.bl_id IS NULL) ";
				locDtl += "	THEN bas_measurement_scope.site_id "; 
				locDtl += "	ELSE bl.site_id END) "; break;
		case 'byBuilding': 	
				locDtl = " (CASE WHEN (bas_measurement_scope.site_id IS NULL AND bas_measurement_scope.bl_id IS NULL) ";
				locDtl += "	THEN ${parameters['noSite']} ${sql.concat} '-' ${sql.concat} ${parameters['noBuilding']} ";
				locDtl += "	WHEN (bas_measurement_scope.site_id IS NOT NULL AND bas_measurement_scope.bl_id IS NULL) ";
				locDtl += "	THEN (RTRIM(bas_measurement_scope.site_id) ${sql.concat} '-' ${sql.concat} ${parameters['noBuilding']}) ";
				locDtl += "	ELSE (RTRIM(bl.site_id) ${sql.concat} '-' ${sql.concat} RTRIM(bl.bl_id)) END) "; break;
		default: 
				locDtl = " (RTRIM(bas_data_point.data_point_id) ${sql.concat} '-' ${sql.concat} RTRIM(bas_data_point.name)) ";
	}
	return locDtl;
}

function setDates(consoleId, value) {
	var console = View.panels.get(consoleId);
	var dateEnd = new Date();
	dateEnd.setDate(dateEnd.getDate() - 1);
	var date_end = FormattingDate(dateEnd.getDate(), dateEnd.getMonth() + 1, dateEnd.getFullYear(), 'YYYY-MM-DD');
	var date_start = getDateStart(value);
	
	var	date_start = console.setFieldValue('bl.date_start', date_start);
	var	date_end = console.setFieldValue('bl.date_end', date_end);
}

function getDateStart(value) {
	var dateStart = new Date();
	switch (value) {
		case '5year': dateStart.setYear(dateStart.getFullYear() - 5);  break;
		case 'year': dateStart.setYear(dateStart.getFullYear() - 1);  break;
		case 'qtr': dateStart.setMonth(dateStart.getMonth() - 3);  break;
		case 'month': dateStart.setMonth(dateStart.getMonth() - 1);  break;
		case 'week': dateStart.setDate(dateStart.getDate() - 7);  break;
		case 'day': dateStart.setDate(dateStart.getDate() - 1); break;
	}
	return FormattingDate(dateStart.getDate(), dateStart.getMonth() + 1, dateStart.getFullYear(), 'YYYY-MM-DD');
}

function getConversionFactor(billTypeSelect, billUnitId){
	var rollUpType='';
	var billTypeId='';
	switch(billTypeSelect){
		case "electricC": rollUpType = 'Energy'; billTypeId = 'ELECTRIC'; break;
		case "electricD": rollUpType = 'Power'; billTypeId = 'ELECTRIC'; break;
		case "gasNatural": rollUpType = 'Energy'; billTypeId = 'GAS - NATURAL'; break;
		case "gasPropane": rollUpType = 'Energy'; billTypeId = 'GAS - PROPANE'; break;
		case "oil": rollUpType = 'Energy'; billTypeId = 'FUEL OIL 1'; break;
		case "oil2": rollUpType = 'Energy'; billTypeId = 'FUEL OIL 2'; break;
		case "water": rollUpType = 'Volume'; billTypeId = 'WATER'; break;
		case "sewer": rollUpType = 'Volume'; billTypeId = 'SEWER'; break;
		default : rollUpType = 'Energy'; billTypeId = 'ELECTRIC'; break;
	}
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("bill_unit.bill_type_id", billTypeId);
	restriction.addClause("bill_unit.bill_unit_id", billUnitId);
	restriction.addClause("bill_type.activity_id", 'NULL');
	if (rollUpType != '') {
		restriction.addClause("bill_unit.rollup_type", rollUpType);
	}    	
	var ds = View.dataSources.get('energyBasCommon_dsBillUnits');
	var unitsRecords = ds.getRecords(restriction);
	
	if (unitsRecords.length > 0) {
		var conversionFactor = parseFloat(unitsRecords[0].getValue("bill_unit.conversion_factor"));
		conversionFactor = (conversionFactor == 0)?1:conversionFactor;
		return conversionFactor;
	} else {
		return 1;
	}
}

function setBillUnitsSelect(billTypeSelectId, billUnitsSelectId) {
	var value = $(billTypeSelectId).value;
	switch(value){
		case "electricC": createOptionsforUnits("Energy","ELECTRIC", billUnitsSelectId); break;
		case "electricD": createOptionsforUnits("Power","ELECTRIC", billUnitsSelectId); break;
		case "gasNatural": createOptionsforUnits("Energy","GAS - NATURAL", billUnitsSelectId); break;
		case "gasPropane": createOptionsforUnits("Energy","GAS - PROPANE", billUnitsSelectId); break;
		case "oil": createOptionsforUnits("Energy","FUEL OIL 1", billUnitsSelectId); break;
		case "oil2": createOptionsforUnits("Energy","FUEL OIL 2", billUnitsSelectId); break;
		case "water": createOptionsforUnits("Volume","WATER", billUnitsSelectId); break;
		case "sewer": createOptionsforUnits("Volume","SEWER", billUnitsSelectId); break;
		default : createOptionsforUnits("Energy","ELECTRIC", billUnitsSelectId); break;
	}	
}

function createOptionsforUnits(rollup, id, billUnitsSelectId){
	var ds = View.dataSources.get('energyBasCommon_dsBillUnits');
	var restriction = "bill_type.activity_id IS NULL AND bill_unit.rollup_type ='"+rollup+"' AND bill_unit.bill_type_id = '"+id+"'";
	var records = ds.getRecords(restriction);
	var selectNode = $(billUnitsSelectId);
	$(billUnitsSelectId).innerHTML="";
	if(records.length > 0 ){
		for(var i = 0; i< records.length; i++){
			var record = records[i];
			var value = record.values["bill_unit.bill_unit_id"];	
			var optionNode = document.createElement('option');
			optionNode.value = value;
			optionNode.appendChild(document.createTextNode(value));
			selectNode.appendChild(optionNode);
		}
	}
}

function getSelectBillTypeOptions(billTypeSelectId){
	var ds = View.dataSources.get('energyBasCommon_dsBillExists');
	var opt;
	var restriction = "exists(select 1 from bas_data_point, bill_unit,bill_type where bas_data_point.bill_unit_id=bill_unit.bill_unit_id AND " +
			"bas_data_point.bill_type_id = 'ELECTRIC' AND bill_unit.rollup_type ='Energy' AND bill_type.activity_id is NULL AND bill_type.bill_type_id = bill_unit.bill_type_id)";
	var records = ds.getRecords(restriction);
	if(records.length == 0){
		opt = $(billTypeSelectId + '_electricConsumption');
		opt.parentNode.removeChild(opt);
	}
	restriction = "exists(select 1 from bas_data_point, bill_unit,bill_type where bas_data_point.bill_unit_id=bill_unit.bill_unit_id AND " +
	"bas_data_point.bill_type_id = 'ELECTRIC' AND bill_unit.rollup_type ='Power' AND bill_type.activity_id is NULL AND bill_type.bill_type_id = bill_unit.bill_type_id)";
	records = ds.getRecords(restriction);
	if(records.length == 0){
		opt = $(billTypeSelectId + '_electricDemand');
		opt.parentNode.removeChild(opt);
	}
	restriction = "exists(select 1 from bas_data_point, bill_unit,bill_type where bas_data_point.bill_unit_id=bill_unit.bill_unit_id AND " +
	"bas_data_point.bill_type_id = 'GAS - NATURAL' AND bill_type.activity_id is NULL AND bill_type.bill_type_id = bill_unit.bill_type_id)";
	records = ds.getRecords(restriction);
	if(records.length == 0){
		opt = $(billTypeSelectId + '_gasNatural');
		opt.parentNode.removeChild(opt);
	}
	restriction = "exists(select 1 from bas_data_point, bill_unit,bill_type where bas_data_point.bill_unit_id=bill_unit.bill_unit_id AND " +
	"bas_data_point.bill_type_id = 'GAS - PROPANE' AND bill_type.activity_id is NULL AND bill_type.bill_type_id = bill_unit.bill_type_id)";
	records = ds.getRecords(restriction);
	if(records.length == 0){
		opt = $(billTypeSelectId + '_gasPropane');
		opt.parentNode.removeChild(opt);
	}
	restriction = "exists(select 1 from bas_data_point, bill_unit,bill_type where bas_data_point.bill_unit_id=bill_unit.bill_unit_id AND " +
	"bas_data_point.bill_type_id = 'FUEL OIL 1' AND bill_type.activity_id is NULL AND bill_type.bill_type_id = bill_unit.bill_type_id)";
	records = ds.getRecords(restriction);
	if(records.length == 0){
		opt = $(billTypeSelectId + '_oil');
		opt.parentNode.removeChild(opt);
	}
	restriction = "exists(select 1 from bas_data_point, bill_unit,bill_type where bas_data_point.bill_unit_id=bill_unit.bill_unit_id AND " +
	"bas_data_point.bill_type_id = 'FUEL OIL 2' AND bill_type.activity_id is NULL AND bill_type.bill_type_id = bill_unit.bill_type_id)";
	records = ds.getRecords(restriction);
	if(records.length == 0){
		opt = $(billTypeSelectId + '_oil2');
		opt.parentNode.removeChild(opt);
	}
	restriction = "exists(select 1 from bas_data_point, bill_unit,bill_type where bas_data_point.bill_unit_id=bill_unit.bill_unit_id AND " +
	"bas_data_point.bill_type_id = 'WATER' AND bill_type.activity_id is NULL AND bill_type.bill_type_id = bill_unit.bill_type_id)";
	records = ds.getRecords(restriction);
	if(records.length == 0){
		opt = $(billTypeSelectId + '_water');
		opt.parentNode.removeChild(opt);
	}
	restriction = "exists(select 1 from bas_data_point, bill_unit,bill_type where bas_data_point.bill_unit_id=bill_unit.bill_unit_id AND " +
	"bas_data_point.bill_type_id = 'SEWER' AND bill_type.activity_id is NULL AND bill_type.bill_type_id = bill_unit.bill_type_id)";
	records = ds.getRecords(restriction);
	if(records.length == 0){
		opt = $(billTypeSelectId + '_sewer');
		opt.parentNode.removeChild(opt);
	}
}

function getDemoMode() {
	var isDemoMode = false;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', ['HQ','JACQUES','LX','CHICMAN','DALLASOF'], 'IN');
	var records = View.dataSources.get('energyBasCommon_dsDemo').getRecords(restriction);
	if (records.length == 5) {
		isDemoMode = true;
	}
	return isDemoMode;
}

function getDateObject(ISODate) {
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

function getValidRestVal(value)
{
	value = value.replace(/\'/g, "\'\'");
	value = value.replace(/&apos;/g, "\'\'");
	return value;
}