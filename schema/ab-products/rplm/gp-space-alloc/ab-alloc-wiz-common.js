function checkOverAlloc(record, panel) {
	try {
        var result = Workflow.callMethod(
            'AbRPLMGroupSpaceAllocation-PortfolioForecastingService-getOverAllocJSON', record);
        var json = eval('(' + result.jsonExpression + ')');
        var isOverAlloc = json.isOverAlloc;
        if (isOverAlloc == '1') {
        	var date_review = json.date_review;
          	var gp_area = json.gp_area;
           	var fl_area = json.fl_area;
           	var su_area = json.su_area;
           	var su_exists = json.su_exists;
           	var bl_id = record.getValue('gp.bl_id');
           	var fl_id = record.getValue('gp.fl_id');
           	var instructions = '';
           	if (su_exists == 1) instructions = String.format(getMessage('overAllocInstrucSu'), bl_id, fl_id, date_review, gp_area, su_area);
           	else instructions = String.format(getMessage('overAllocInstrucFl'), bl_id, fl_id, date_review, gp_area, fl_area);
           	if (View.parameters && !View.parameters.isGapChartMonthly) instructions += "  " + getMessage('viewFloorDetails');
           	if (panel) panel.setInstructions(instructions);
           	else View.showMessage(instructions);
           	return true;
        }
        if (panel) panel.setInstructions('');
        return false;
    } catch (e) {
        Workflow.handleError(e);
    }
}

function getFlAreaUsable(blId, flId, date_start) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause('fl.bl_id', blId);
	restriction.addClause('fl.fl_id', flId);
	var ds = View.dataSources.get('allocWizCommon_dsFl');
	ds.addParameter('dateReview', date_start);
	var records = ds.getRecords(restriction);
	var area_usable = '';
	if (records.length > 0) area_usable =  records[0].getValue('fl.area_usable');
	return area_usable;
}

function calcPctFloor(bl_id, fl_id, gp_area_manual, date_start) {
	var pct_floor = 0;
	var area_usable = asFloat(getFlAreaUsable(bl_id, fl_id, date_start));	
	if (area_usable == 0) return '';
	if (area_usable != '' && area_usable > 0) {
		pct_floor = gp_area_manual * 100.00/ area_usable;
	}
	pct_floor = truncToTwoDecimals(pct_floor, 'gp.pct_floor');
	return pct_floor;
}

function onApplyPercent(formId) {
	if (!checkRequiredFields(formId)) return false;
	var form = View.panels.get(formId);
	var blId = form.getFieldValue('gp.bl_id');
	var flId = form.getFieldValue('gp.fl_id');
	var pct_floor = form.getFieldValue('gp.pct_floor');
	var gp_area = form.getFieldValue('gp.area');
	var date_start = form.getFieldValue('gp.date_start');
	
	if (pct_floor > 120) {
		form.addInvalidField('gp.pct_floor', '');
		form.displayValidationResult('');
		View.showMessage(getMessage('pctFloorExceedsHundred'));
		return;
	}
	if (pct_floor < 0) {
		pct_floor = 0;
		form.setFieldValue('gp.pct_floor', 0);
	}
	
	var area_usable = asFloat(getFlAreaUsable(blId, flId, date_start));
	if (area_usable == 0) {
		View.showMessage(getMessage('error_no_floor_area'));
		return;			
	}

	var gp_area_manual = (pct_floor * area_usable) / 100.0;
	if (gp_area_manual >= 0) {
		gp_area_manual = Math.round(gp_area_manual*100)/100;
		form.setFieldValue('gp.area_manual', gp_area_manual.toString());
	}
}

function checkRequiredFields(formId) {
	var valid = true;
	var form = View.panels.get(formId);
	form.clearValidationResult();
	var blId = form.getFieldValue('gp.bl_id');
	var flId = form.getFieldValue('gp.fl_id');
	var date_start = form.getFieldValue('gp.date_start');
	if (blId == '' || flId == '' || date_start == '') {
		if (blId == '') form.addInvalidField('gp.bl_id', getMessage('requiredField'));
		if (flId == '') form.addInvalidField('gp.fl_id', getMessage('requiredField'));
		if (date_start == '') form.addInvalidField('gp.date_start', getMessage('requiredField'));
		form.displayValidationResult('');
		valid = false;
	}
	return valid;
}

function allocWizEvtsEdit_eventEdit_onSelectName (formId) {
	var scn_id = View.panels.get(formId).getFieldValue('gp.portfolio_scenario_id');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('gp.portfolio_scenario_id', scn_id);
	restriction.addClause('gp.ls_id', '');
	restriction.addClause('gp.is_available', 1);
	View.selectValue(formId,
			getMessage('groupName'),
			['gp.name'],
			'gp',
			['gp.name'],
			['gp.name', 'gp.portfolio_scenario_id'],
			restriction
	);
}

function allocWizEvtsEdit_eventEdit_onSelectBl (formId) {
	var scn_id = View.panels.get(formId).getFieldValue('gp.portfolio_scenario_id');
	var restriction = "";
	restriction += "EXISTS (SELECT 1 FROM gp WHERE bl.bl_id = gp.bl_id AND gp.portfolio_scenario_id ='" + getValidRestVal(scn_id) + "')";
	View.selectValue(formId,
			getMessage('buildings'),
			['gp.bl_id'],
			'bl',
			['bl.bl_id'],
			['bl.site_id','bl.bl_id','bl.name'],
			restriction
	);
}

function allocWizEvtsEdit_eventEdit_onSelectFl (formId) {
	var scn_id = View.panels.get(formId).getFieldValue('gp.portfolio_scenario_id');
	var bl_id = View.panels.get(formId).getFieldValue('gp.bl_id');
	var restriction = "";
	restriction += "EXISTS (SELECT 1 FROM gp WHERE fl.bl_id = gp.bl_id AND gp.portfolio_scenario_id ='" + getValidRestVal(scn_id) + "')";
	if (bl_id) restriction += " AND fl.bl_id = '" + bl_id + "'";
	View.selectValue(formId,
			getMessage('floors'),
			['gp.bl_id','gp.fl_id'],
			'fl',
			['fl.bl_id','fl.fl_id'],
			['fl.bl_id','fl.fl_id','fl.name'],
			restriction
	);
}

function setFormReadOnly(formId) {
	var form = View.panels.get(formId);
	form.fields.each(function(field) {
		var id = field.getId();
		form.enableField(id, false);
	});
	form.actions.each(function(action) {
		action.show(false);
	});
	var count_em_field = form.fields.get('gp.count_em');
	if (count_em_field) {
		count_em_field.actions.get(0).show(false);
	}
	var pct_floor_field = form.fields.get('gp.pct_floor');
	if (pct_floor_field) {
		pct_floor_field.actions.get(0).show(false);
	}
}

function truncToTwoDecimals(number, fieldName) {
	number = parseFloat(number);
	number = number.toFixed(2);
	if (fieldName) number = View.dataSources.get('allocWizCommon_ds0').formatValue(fieldName, number, true);
	return number;
}

function asFloat(s) {
	var val = parseFloat(String(s).replace(/,/g, ""));
	if(isNaN(val)) val = 0;
	return val;
}

function getValidRestVal(value)
{
	value = value.replace(/\'/g, "\'\'");
	value = value.replace(/&apos;/g, "\'\'");
	return value;
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

function addDateRestriction(panels, filter, checkOracleDataSource){
	var fromDate = filter['from_date'];
	var endDate = filter['end_date'];
	var isOracle = isOracleDataBase();
	
	for (var i=0; i<panels.length; i++){
		addDateRestrictionParameterToPanel(panels[i], "dateStartRestriction", "gp.date_start ", fromDate, endDate, isOracle);
		addDateRestrictionParameterToPanel(panels[i], "dateEndRestriction", "gp.date_end ", fromDate, endDate, isOracle);
	}
}

function addDateRestrictionParameterToPanel(panel, paraId, fieldId, fromDate, endDate, isOracle) {
	var dateRestriction = "";
	if (fromDate) {
		if (isOracle == 1) {
			dateRestriction = fieldId+">= to_date('" + fromDate + "', 'YYYY-MM-DD')";
		} else {
			dateRestriction = fieldId+">= '" + fromDate + "'";
		}
	}
	if(endDate) {
		if (fromDate) {
			if (isOracle == 1) {
				dateRestriction = dateRestriction + " AND "+fieldId+"<= to_date('" + endDate + "', 'YYYY-MM-DD')";
			} else {
				dateRestriction = dateRestriction + " AND "+fieldId+"<= '" + endDate + "'";
			}
		} else {
			if (oracle == 1) {
				dateRestriction = dateRestriction +fieldId +"<= to_date('" + endDate + "', 'YYYY-MM-DD')";
			} else {
				dateRestriction = dateRestriction + fieldId +"<= '" + endDate + "'";
			}
		}
	}

	if(dateRestriction != "") {
		panel.addParameter(paraId, dateRestriction);
	} else {
		panel.addParameter(paraId, '1=1');
	}
}

/**
 * If the database the project used is oracle database.
 */
function isOracleDataBase(checkOracleDataSource) {
	if (!checkOracleDataSource){
		checkOracleDataSource = View.dataSources.get('checkOracleDataSource');
	}

	if(valueExistsNotEmpty(checkOracleDataSource.getRecord().records)){
		return checkOracleDataSource.getRecord().records[0].values['afm_tbls.table_name']
	} else {
		//older database.
		return checkOracleDataSource.getRecord().getValue("afm_tbls.table_name");
	}
}
	
function addLocationRestriction(panels, filter){
	var siteIdRestriction = null;
	var siteId = filter['site_id'];
	if(siteId != null && siteId != "") {
		siteIdRestriction = "bl.site_id ='" + siteId + "'";
	}

	var blIdRestriction = null;
	var blId = filter['bl_id'];
	if(blId != null && blId != "") {
		blIdRestriction = "bl.bl_id ='" + blId + "'";
	}

	for (var i=0; i<panels.length; i++){
		if ( siteId ) {
			panels[i].addParameter('siteIdRestriction', siteIdRestriction);
		} else {
			panels[i].addParameter('siteIdRestriction', "1=1");
		}

		if ( blId ) {
			panels[i].addParameter('blIdRestriction', blIdRestriction);
		} else {
			panels[i].addParameter('blIdRestriction', "1=1");
		}
	}
}

function addOrganizationRestriction(panels, filter) {
	var orgFilterFieldsArray = ['planning_bu_id', 'dv_id', 'dp_id', 'gp_function'];
	
	for (var j=0; j<panels.length; j++){
		for (var i=0; i<orgFilterFieldsArray.length; i++){
			var paraName = orgFilterFieldsArray[i];
			var value = filter[paraName];
			if(value) {
				panels[j].addParameter(paraName, 'gp.'+paraName+"='"+value+"'");
			} else {
				panels[j].addParameter(paraName, "1=1");
			}
		}
	}
}

function getScenarioIdRestriction(scn_id) {
	var indexOfQuote = scn_id.indexOf("'");
	var scnId = scn_id;
	if ( indexOfQuote != -1 ){
		scnId	 = scn_id.replace(/\'/g, "''");
	}
	return "gp.portfolio_scenario_id = '" + scnId + "'";
}

function encodePattern(colorValue){
	var pattern = new Object();
	pattern.style="0";
	pattern.rgbColor = ( colorValue.substring(0, 1) === '#' ?  colorValue : '#'+colorValue );		

	var parameters = {
		"pattern": toJSON(pattern)
	};

	try {
		var result = Workflow.call('AbCommonResources-HighlightPatternService-encodePattern', parameters);
		return result.jsonExpression;
	} 
	catch (e) {
		Workflow.handleError(e);
	}
}
    
function decodePattern(patternString){
	var parameters = {
		"patternString": patternString //'14 3 INVSPHERICAL 0.0000 1 4227072 0.0000 16777215 1.0000'
	};
	
	try {
		var result = Workflow.call('AbCommonResources-HighlightPatternService-decodePattern', parameters);
	} 
	catch (e) {
		Workflow.handleError(e);
	}
	
	return eval("(" + result.jsonExpression + ")");
}