
/**
 * Get geographical tree restriction.
 *
 * @param filterRestriction
 * @param parameters
 * @returns
 */
function getGeographicalTreeRestrictionFromAssetFilter(filterRestriction, parameters, customViewRestriction){
	if(customViewRestriction == undefined){
		customViewRestriction = null;
	}
	var tmpParameters = cloneObject(parameters);
	var levels = ['geo_region', 'ctry', 'regn', 'state', 'city', 'site', 'bl', 'fl', 'rm'];

	for(var i = 0; i < levels.length; i++){
		var level = levels[i];
		var levelRestriction = getGeographicalTreeRestrictionFromAssetFilterForLevel(level, filterRestriction, customViewRestriction);
		tmpParameters[level+"_restriction"] = levelRestriction;
	}
	return tmpParameters;
}

/**
 * Get location tree restriction.
 *
 * @param filterRestriction
 * @param parameters
 * @returns
 */
function getLocationTreeRestrictionFromAssetFilter(filterRestriction, parameters, customViewRestriction){
	if(customViewRestriction == undefined){
		customViewRestriction = null;
	}
	var tmpParameters = cloneObject(parameters);
	var levels = ['site', 'bl', 'fl'];

	for(var i = 0; i < levels.length; i++){
		var level = levels[i];
		var levelRestriction = getGeographicalTreeRestrictionFromAssetFilterForLevel(level, filterRestriction, customViewRestriction);
		tmpParameters[level+"_restriction"] = levelRestriction;
	}
	return tmpParameters;
}


/**
 * Get geographical tree restriction for level.
 *
 * @param level
 * @param filterRestriction
 * @returns {String}
 */
function getGeographicalTreeRestrictionFromAssetFilterForLevel(level, filterRestriction, customViewRestriction){
	var blRestriction = "EXISTS(SELECT bl.bl_id FROM bl WHERE ${sql.getVpaRestrictionForTable('bl')} ";
	var prRestriction = "EXISTS(SELECT property.pr_id FROM property WHERE ${sql.getVpaRestrictionForTable('property')} ";

	if(valueExists(customViewRestriction)){
		if(valueExists(customViewRestriction['blCustomViewRestriction'])){
			blRestriction += " AND " + customViewRestriction['blCustomViewRestriction'];
		}
		if(valueExists(customViewRestriction['propertyCustomViewRestriction'])){
			prRestriction += " AND " + customViewRestriction['propertyCustomViewRestriction'];
		}
	}
	// add asset type restriction
	var blAssetAndDepRestriction = getAssetAndDepRestrictionForTable('bl', filterRestriction);
	if(valueExistsNotEmpty(blAssetAndDepRestriction)){
		blRestriction += " AND " + blAssetAndDepRestriction;
	}
	var prAssetAndDepRestriction = getAssetAndDepRestrictionForTable('property', filterRestriction);
	if(valueExistsNotEmpty(prAssetAndDepRestriction)){
		prRestriction += " AND " + prAssetAndDepRestriction;
	}

	//organization and program restriction
	var blOrgAndProgRestriction = getOrgAndProgRestrictionForTable('bl', filterRestriction);
	if(valueExistsNotEmpty(blOrgAndProgRestriction)){
		blRestriction += " AND " + blOrgAndProgRestriction;
	}
	var prOrgAndProgRestriction = getOrgAndProgRestrictionForTable('property', filterRestriction);
	if(valueExistsNotEmpty(prOrgAndProgRestriction)){
		prRestriction += " AND " + prOrgAndProgRestriction;
	}

	switch (level) {
		case 'geo_region':
			{
				blRestriction += "AND EXISTS(SELECT ctry_a_bl.ctry_id FROM ctry ${sql.as} ctry_a_bl WHERE ctry_a_bl.geo_region_id = geo_region.geo_region_id AND ctry_a_bl.ctry_id = bl.ctry_id) ";
				blRestriction +=  getGeographicalRestrictionForTable("bl", filterRestriction) + ")";
				var tmpRestriction = getGeographicalRestrictionForTable("property", filterRestriction);
				if(tmpRestriction == null){
					prRestriction = null;
				}else{
					prRestriction += "AND EXISTS(SELECT ctry_a_property.ctry_id FROM ctry ${sql.as} ctry_a_property WHERE ctry_a_property.geo_region_id = geo_region.geo_region_id AND ctry_a_property.ctry_id = property.ctry_id) ";
					prRestriction +=  tmpRestriction + ")";
				}
				break;
			}
		case 'ctry':
			{
				blRestriction += " AND bl.ctry_id = ctry.ctry_id " + getGeographicalRestrictionForTable("bl", filterRestriction) + ")";
				var tmpRestriction = getGeographicalRestrictionForTable("property", filterRestriction);
				if(tmpRestriction == null){
					prRestriction = null;
				}else{
					prRestriction += " AND property.ctry_id = ctry.ctry_id " + tmpRestriction + ")";
				}
				break;
			}
		case 'regn':
			{
				blRestriction += " AND bl.regn_id = regn.regn_id " + getGeographicalRestrictionForTable("bl", filterRestriction) + ")";
				var tmpRestriction = getGeographicalRestrictionForTable("property", filterRestriction);
				if(tmpRestriction == null){
					prRestriction = null;
				}else{
					prRestriction += " AND property.regn_id = regn.regn_id " + tmpRestriction + ")";
				}
				break;
			}
		case 'state':
			{
				blRestriction += " AND bl.state_id = state.state_id " + getGeographicalRestrictionForTable("bl", filterRestriction) + ")";
				var tmpRestriction = getGeographicalRestrictionForTable("property", filterRestriction);
				if(tmpRestriction == null){
					prRestriction = null;
				}else{
					prRestriction += " AND property.state_id = state.state_id " + tmpRestriction + ")";
				}
				break;
			}
		case 'city':
			{
				blRestriction += " AND bl.city_id = city.city_id " + getGeographicalRestrictionForTable("bl", filterRestriction) + ")";
				var tmpRestriction = getGeographicalRestrictionForTable("property", filterRestriction);
				if(tmpRestriction == null){
					prRestriction = null;
				}else{
					prRestriction += " AND property.city_id = city.city_id " + tmpRestriction + ")";
				}
				break;
			}
		case 'site':
			{
				blRestriction += " AND bl.site_id = site.site_id " + getGeographicalRestrictionForTable("bl", filterRestriction) + ")";
				var tmpRestriction = getGeographicalRestrictionForTable("property", filterRestriction);
				if(tmpRestriction == null){
					prRestriction = null;
				}else{
					prRestriction += " AND property.site_id = site.site_id " + tmpRestriction + ")";
				}
				break;
			}
		case 'bl':
			{
				blRestriction = getProgRestrictionForAssetType("bl", filterRestriction);
				if (valueExistsNotEmpty(blRestriction)) {
					blRestriction += " AND ";
				}
				blRestriction += " (1=1 ";
				if(valueExists(customViewRestriction) && valueExists(customViewRestriction['blCustomViewRestriction'])){
					blRestriction += " AND " + customViewRestriction['blCustomViewRestriction'];
				}
				blRestriction += getGeographicalRestrictionForTable("bl", filterRestriction) + ")";
				prRestriction = null;
				break;
			}
		case 'fl':
			{
			 	blRestriction = " 1=1 " + getFilterClauseRestrictionForTable("fl", "bl.fl_id", filterRestriction);
			 	var organizationRestriction = getOrganizationRestrictionForTable("rm", filterRestriction);
			 	var rmRestriction = getFilterClauseRestrictionForTable("rm", "bl.rm_id", filterRestriction)
			 	if(valueExistsNotEmpty(organizationRestriction) || valueExistsNotEmpty(rmRestriction)){
				 	blRestriction += " AND EXISTS(SELECT rm.rm_id FROM rm WHERE rm.bl_id = fl.bl_id AND rm.fl_id = fl.fl_id ";
				 	blRestriction += organizationRestriction;
				 	blRestriction += rmRestriction;
				 	blRestriction += ")";
			 	}
			 	prRestriction = null;
				break;
			}
		case 'rm':
			{
				blRestriction = " 1=1 " + getFilterClauseRestrictionForTable("rm", "bl.rm_id", filterRestriction);
			 	blRestriction += getOrganizationRestrictionForTable("rm", filterRestriction);
			 	prRestriction = null;
				break;
			}
	}

	var restriction = "";
	if (valueExistsNotEmpty(blRestriction)) {
		restriction = blRestriction;
	}
	if (valueExistsNotEmpty(prRestriction)) {
		restriction += (valueExistsNotEmpty(blRestriction)?" OR ":"") + prRestriction;
	}
	if(valueExistsNotEmpty(restriction)) {
		restriction = "(" + restriction + ")";
	}else{
		restriction = "(1 = 1)";
	}
	return restriction;
}


/**
 * Get geographical fields restriction for table.
 * @param tableName table name
 * @param filterRestriction restriction object
 * @returns {String}
 */
function getGeographicalRestrictionForTable(tableName, filterRestriction){
	var restriction = "";
	var resetProperty = false;
	// ctry.geo_region_id
	var filterClause = filterRestriction.findClause('bl.geo_region_id');
	if (filterClause){
		restriction += " AND EXISTS(SELECT ctry_b_" + tableName + ".ctry_id FROM ctry ${sql.as} ctry_b_" + tableName + " WHERE ctry_b_" + tableName + ".ctry_id = " + tableName +".ctry_id AND ctry_b_" + tableName + ".geo_region_id " + getSqlClauseValue(filterClause.op, filterClause.value) + " )";
	}
	// bl.ctry_id
	var filterClause = filterRestriction.findClause('bl.ctry_id');
	if (filterClause){
		restriction += " AND " + tableName + ".ctry_id " + getSqlClauseValue(filterClause.op, filterClause.value);
	}

	// bl.state_id
	var filterClause = filterRestriction.findClause('bl.state_id');
	if (filterClause){
		restriction += " AND " + tableName + ".state_id " + getSqlClauseValue(filterClause.op, filterClause.value);
	}
	// bl.city_id
	var filterClause = filterRestriction.findClause('bl.city_id');
	if (filterClause){
		restriction += " AND " + tableName + ".city_id " + getSqlClauseValue(filterClause.op, filterClause.value);
	}
	// bl.site_id
	var filterClause = filterRestriction.findClause('bl.site_id');
	if (filterClause){
		restriction += " AND " + tableName + ".site_id " + getSqlClauseValue(filterClause.op, filterClause.value);
	}
	//bl.bl_id
	var filterClause = filterRestriction.findClause('bl.bl_id');
	if (filterClause){
		if(tableName == 'bl'){
			restriction += " AND " + tableName + ".bl_id " + getSqlClauseValue(filterClause.op, filterClause.value);
		}else{
			resetProperty = true
		}
	}
	//bl.fl_id
	var filterClause = filterRestriction.findClause('bl.fl_id');
	if (filterClause){
		if(tableName == 'bl'){
			restriction += " AND EXISTS(SELECT fl.fl_id FROM fl WHERE fl.bl_id = bl.bl_id AND fl.fl_id " + getSqlClauseValue(filterClause.op, filterClause.value) + " )";
		}else{
			resetProperty = true
		}
	}
	//bl.rm_id
	var filterClause = filterRestriction.findClause('bl.rm_id');
	if (filterClause){
		if(tableName == 'bl'){
			restriction += " AND EXISTS(SELECT rm.rm_id FROM rm WHERE rm.bl_id = bl.bl_id AND rm.rm_id " + getSqlClauseValue(filterClause.op, filterClause.value) + " )";
		}else{
			resetProperty = true
		}
	}
	if(tableName == "property" && resetProperty && !valueExistsNotEmpty(restriction)){
		restriction = null;
	}
	return restriction;
}

/**
 * Get specified clause restriction for table
 * @param tableName table name
 * @param clauseName clause name
 * @param filterRestriction restriction object
 * @returns {String}
 */
function getFilterClauseRestrictionForTable(tableName, clauseName, filterRestriction){
	var restriction = "";
	var filterClause = filterRestriction.findClause(clauseName);
	var clauseField = clauseName.substring(clauseName.indexOf(".") + 1 );
	if (filterClause){
		restriction += " AND "+ tableName + "." + clauseField + " " + getSqlClauseValue(filterClause.op, filterClause.value);
	}
	return restriction;
}

/**
 * Get organization and program restriction. Used for tree controls only.
 * @param tableName table name
 * @param filterRestriction filter restriction
 */
function getOrgAndProgRestrictionForTable(tableName, filterRestriction){
	// asset type
	var clause = filterRestriction.findClause('bl.asset_type');
	var assetType = "";
	if(clause){
		assetType = clause.value;
	}
	var restriction = "";
	if(tableName == "bl"){
		if(assetType == ""){
			//when no asset type is filtered, use 'bl' as default asset to get geo location
			restriction = getProgRestrictionForAssetType("bl", filterRestriction);
			var applyAssetRestriction = false;
			var eqRestriction = (valueExistsNotEmpty(restriction) ? " OR " : "") + "EXISTS(SELECT eq.eq_id FROM eq WHERE eq.bl_id = bl.bl_id ";
			var orgRestrValue = getOrgRestrictionForAssetType("eq", filterRestriction);
			if (valueExistsNotEmpty(orgRestrValue)) {
				eqRestriction += " AND " + orgRestrValue;
				applyAssetRestriction = true;
			}
			var progRestrValue = getProgRestrictionForAssetType("eq", filterRestriction);
			if (valueExistsNotEmpty(progRestrValue)) {
				eqRestriction += " AND " + progRestrValue;
				applyAssetRestriction = true;
			}
			eqRestriction += ")";
			if (applyAssetRestriction) {
				restriction += eqRestriction;
			}

			applyAssetRestriction = false;
			var taRestriction = (valueExistsNotEmpty(restriction) ? " OR " : "") + "EXISTS(SELECT ta.ta_id FROM ta WHERE ta.bl_id = bl.bl_id ";
			var orgRestrValue = getOrgRestrictionForAssetType("ta", filterRestriction);
			if (valueExistsNotEmpty(orgRestrValue)) {
				taRestriction += " AND " + orgRestrValue;
				applyAssetRestriction = true;
			}
			var progRestrValue = getProgRestrictionForAssetType("ta", filterRestriction);
			if (valueExistsNotEmpty(progRestrValue)) {
				taRestriction += " AND " + progRestrValue;
				applyAssetRestriction = true;
			}
			taRestriction += ")";
			if (applyAssetRestriction) {
				restriction += taRestriction;
			}

			if(valueExistsNotEmpty(restriction)){
				restriction = "(" + restriction +")";
			}
		}else if(assetType == 'bl'){
			restriction = getProgRestrictionForAssetType(assetType, filterRestriction);
		}else if(assetType == 'eq'){
			restriction = "EXISTS(SELECT eq.eq_id FROM eq WHERE eq.bl_id = bl.bl_id ";
			var orgRestrValue = getOrgRestrictionForAssetType(assetType, filterRestriction);
			if(valueExistsNotEmpty(orgRestrValue)){
				restriction += " AND " + orgRestrValue;
			}
			var progRestrValue = getProgRestrictionForAssetType(assetType, filterRestriction);
			if(valueExistsNotEmpty(progRestrValue)){
				restriction += " AND " + progRestrValue;
			}
			restriction += ")";

		}else if(assetType == 'ta'){
			restriction = "EXISTS(SELECT ta.ta_id FROM ta WHERE ta.bl_id = bl.bl_id ";
			var orgRestrValue = getOrgRestrictionForAssetType(assetType, filterRestriction);
			if(valueExistsNotEmpty(orgRestrValue)){
				restriction += " AND " + orgRestrValue;
			}
			var progRestrValue = getProgRestrictionForAssetType(assetType, filterRestriction);
			if(valueExistsNotEmpty(progRestrValue)){
				restriction += " AND " + progRestrValue;
			}
			restriction += ")";
		}else if(assetType == 'property'){
			restriction= "1=2";
		}
	}else if(tableName == 'property'){
		if(assetType == ""){
			var eqOrgRestrValue = getOrgRestrictionForAssetType("eq", filterRestriction);
			var taOrgRestrValue = getOrgRestrictionForAssetType("ta", filterRestriction);
			if(valueExistsNotEmpty(eqOrgRestrValue) || valueExistsNotEmpty(taOrgRestrValue)){
				restriction = "1=2";
			}else{
				restriction = getProgRestrictionForAssetType("property", filterRestriction);
			}

		}else if(assetType == 'bl'){
			restriction = "1=2";
		}else if(assetType == 'eq'){
			restriction= "1=2";
		}else if(assetType == 'ta'){
			restriction= "1=2";
		}else if(assetType == 'property'){
			restriction = getProgRestrictionForAssetType(assetType, filterRestriction);
		}
	}
	return restriction;
}

/**
 * Get organization restriction for asset type.
 * @param assetType asset type
 * @param filterRestriction filter restriction
 */
function getOrgRestrictionForAssetType(assetType, filterRestriction){
	var restriction = "";
	if(assetType == 'eq'){
		// bu_id
		var clause = filterRestriction.findClause('bl.bu_id');
		if(clause){
			restriction = "EXISTS(SELECT dv.bu_id FROM dv WHERE dv.dv_id = eq.dv_id AND dv.bu_id " + getSqlClauseValue(clause.op, clause.value) + ")";
		}
	}else if(assetType == 'ta'){
		// bu_id
		var clause = filterRestriction.findClause('bl.bu_id');
		if(clause){
			restriction = "EXISTS(SELECT dv.bu_id FROM dv WHERE dv.dv_id = ta.dv_id AND dv.bu_id " + getSqlClauseValue(clause.op, clause.value) + ")";
		}
	}
	// dv_id
	var clause = filterRestriction.findClause('bl.dv_id');
	if(clause){
		restriction += (valueExistsNotEmpty(restriction)? " AND ": "") + assetType + ".dv_id " +  getSqlClauseValue(clause.op, clause.value);
	}
	// dp_id
	var clause = filterRestriction.findClause('bl.dp_id');
	if(clause){
		restriction += (valueExistsNotEmpty(restriction)? " AND ": "") + assetType + ".dp_id " +  getSqlClauseValue(clause.op, clause.value);
	}

	return restriction;
}

/**
 * Get program restriction for asset type.
 * @param assetType asset type
 * @param filterRestriction filter restriction
 */
function getProgRestrictionForAssetType(assetType, filterRestriction){
	var projSqlRestriction = "";
	var clause = filterRestriction.findClause('project.program_id');
	if(clause){
		projSqlRestriction = " EXISTS(SELECT project.project_id FROM project WHERE project.status NOT IN ('Closed', 'Completed', 'Canceled') AND project.program_id "
			+ getSqlClauseValue(clause.op, clause.value)
			+ " AND activity_log.project_id = project.project_id ) ";
	}

	var clause = filterRestriction.findClause('bl.project_id');
	if(clause){
		projSqlRestriction += (valueExistsNotEmpty(projSqlRestriction)?" AND ": "") + " activity_log.project_id " + getSqlClauseValue(clause.op, clause.value);
	}

	var clause = filterRestriction.findClause('work_pkgs.work_pkg_id');
	if(clause){
		projSqlRestriction += (valueExistsNotEmpty(projSqlRestriction)?" AND ": "") + " activity_log.work_pkg_id " + getSqlClauseValue(clause.op, clause.value);
	}

	var result = "";
	if(valueExistsNotEmpty(projSqlRestriction)){
		projSqlRestriction = " AND " + projSqlRestriction;
		if (assetType == 'bl'){
			result = "EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.bl_id = bl.bl_id " + projSqlRestriction + ")";
		}else if (assetType == 'property') {
			result = "EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.pr_id = property.pr_id " + projSqlRestriction + ")";
		} else if (assetType == 'eq') {
			result = "EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.eq_id = eq.eq_id " + projSqlRestriction + ")";
		} else if (assetType == 'ta') {
			result = "EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.ta_id = ta.ta_id " + projSqlRestriction + ")";
		}
	}
	return result;
}

/**
 * Get asset type restriction for specified table. USed for tree controls.
 * @param tableName  building or property table
 * @param filterRestriction filter restriction
 */
function getAssetAndDepRestrictionForTable(tableName, filterRestriction){
	// asset type
	var clause = filterRestriction.findClause('bl.asset_type');
	var assetType = "";
	if(clause){
		assetType = clause.value;
	}
	// asset standard
	var clause = filterRestriction.findClause('bl.asset_std');
	var assetStd = "";
	if(clause){
		if(assetType == 'eq'){
			assetStd = "eq.eq_std " + getSqlClauseValue(clause.op, clause.value);
		} else if(assetType == 'ta'){
			assetStd = "ta.fn_std " + getSqlClauseValue(clause.op, clause.value);
		}
	}
	// status
	var clause = filterRestriction.findClause('bl.asset_status');
	var assetStatus = "";
	if(clause){
		assetStatus = assetType + ".status " + getSqlClauseValue(clause.op, clause.value);
	}
	// pending action
	var clause = filterRestriction.findClause('bl.pending_action');
	var pendingAction = "";
	if(clause){
		pendingAction = assetType + ".pending_action " + getSqlClauseValue(clause.op, clause.value);
	}
	// asset id
	var clause = filterRestriction.findClause('bl.asset_id');
	var assetId = "";
	if(clause){
		var pkField = getPkFieldByAssetType(assetType);
		assetId = assetType  + "." + pkField + " " + getSqlClauseValue(clause.op, clause.value);
	}
	// depreciation method
	var clause = filterRestriction.findClause('deprec_method');
	var depreciationMethod = "";
	if(clause){
		if(assetType == 'eq'){
			depreciationMethod= getDepreciationMethodForAssetType(assetType, filterRestriction);
		}else if(assetType == 'ta'){
			depreciationMethod= getDepreciationMethodForAssetType(assetType, filterRestriction);
		}
	}
	// depreciation value
	var clause = filterRestriction.findClause('deprec_value_type');
	var depreciationValue = "";
	if(clause){
		if(assetType == 'bl'){
			depreciationValue = getDepreciationValueForAssetType(assetType, filterRestriction);
		} else if(assetType == 'property'){
			depreciationValue = getDepreciationValueForAssetType(assetType, filterRestriction);
		} else if (assetType == 'eq'){
			depreciationValue = getDepreciationValueForAssetType(assetType, filterRestriction);
		} else if (assetType == 'ta'){
			depreciationValue = getDepreciationValueForAssetType(assetType, filterRestriction);
		}
	}
	var sqlStatement = "";
	if(tableName == 'bl'){
		if(assetType == ""){
			var blDepValue = getDepreciationValueForAssetType('bl', filterRestriction);
			var eqDepValue = getDepreciationValueForAssetType('eq', filterRestriction);
			var taDepValue = getDepreciationValueForAssetType('ta', filterRestriction);
			var eqDepMethod = getDepreciationMethodForAssetType('eq', filterRestriction);
			var taDepMethod = getDepreciationMethodForAssetType('ta', filterRestriction);

			sqlStatement = blDepValue;
			if(valueExistsNotEmpty(eqDepValue) || valueExistsNotEmpty(taDepMethod)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" OR ":"") + "EXISTS(SELECT eq.eq_id FROM eq WHERE eq.bl_id = bl.bl_id AND " + eqDepValue + ((valueExistsNotEmpty(eqDepValue) && valueExistsNotEmpty(eqDepMethod))?" AND ":"") + eqDepMethod + ")";
			}

			if(valueExistsNotEmpty(taDepValue) || valueExistsNotEmpty(taDepMethod)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" OR ":"") + "EXISTS(SELECT ta.ta_id FROM ta WHERE ta.bl_id = bl.bl_id AND " + taDepValue + ((valueExistsNotEmpty(taDepValue) && valueExistsNotEmpty(taDepMethod))?" AND ":"") + taDepMethod +")";
			}
			if(valueExistsNotEmpty(sqlStatement)){
				sqlStatement = "(" + sqlStatement +")";
			}
		}else if (assetType == 'bl'){
			sqlStatement = assetStatus;
			if(valueExistsNotEmpty(pendingAction)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + pendingAction;
			}
			if(valueExistsNotEmpty(assetId)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + assetId;
			}
			if(valueExistsNotEmpty(depreciationValue)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + depreciationValue;
			}else {

			}
		}else if(assetType == 'property'){
			sqlStatement = " 1 = 2 ";
		}else if(assetType == 'eq'){
			sqlStatement = "EXISTS(SELECT eq.eq_id FROM eq WHERE eq.bl_id = bl.bl_id ";
			if(valueExistsNotEmpty(assetStatus)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + assetStatus;
			}
			if(valueExistsNotEmpty(pendingAction)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + pendingAction;
			}
			if(valueExistsNotEmpty(assetStd)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + assetStd;
			}

			if(valueExistsNotEmpty(assetId)){
				sqlStatement +=  (valueExistsNotEmpty(sqlStatement)?" AND ": "") + assetId;
			}
			if(valueExistsNotEmpty(depreciationMethod)){
				sqlStatement +=  (valueExistsNotEmpty(sqlStatement)?" AND ": "") + depreciationMethod;
			}
			if(valueExistsNotEmpty(depreciationValue)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + depreciationValue;
			}
			sqlStatement+= ")"
		}else if(assetType == 'ta'){
			sqlStatement = "EXISTS(SELECT ta.ta_id FROM ta WHERE ta.bl_id = bl.bl_id ";
			if(valueExistsNotEmpty(assetStatus)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + assetStatus;
			}
			if(valueExistsNotEmpty(pendingAction)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + pendingAction;
			}
			if(valueExistsNotEmpty(assetStd)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + assetStd;
			}

			if(valueExistsNotEmpty(assetId)){
				sqlStatement +=  (valueExistsNotEmpty(sqlStatement)?" AND ": "") + assetId;
			}
			if(valueExistsNotEmpty(depreciationMethod)){
				sqlStatement +=  (valueExistsNotEmpty(sqlStatement)?" AND ": "") + depreciationMethod;
			}
			if(valueExistsNotEmpty(depreciationValue)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + depreciationValue;
			}
			sqlStatement+= ")"
		}

	}else if(tableName == 'property'){
		if(assetType == ""){
			var prDepValue = getDepreciationValueForAssetType("property", filterRestriction);
			if(valueExistsNotEmpty(prDepValue)){
				sqlStatement = prDepValue;
			}
		}else if(assetType == 'bl'){
			sqlStatement = " 1 = 2 ";
		}else if(assetType == 'property'){
			sqlStatement = assetStatus;
			if(valueExistsNotEmpty(pendingAction)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + pendingAction;
			}
			if(valueExistsNotEmpty(assetId)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + assetId;
			}
			if(valueExistsNotEmpty(depreciationValue)){
				sqlStatement += (valueExistsNotEmpty(sqlStatement)?" AND ": "") + depreciationValue;
			}
		}else if(assetType == 'eq'){
			sqlStatement = " 1 = 2 ";
		}else if(assetType == 'ta'){
			sqlStatement = " 1 = 2 ";
		}
	}

	return sqlStatement;
}

/**
 * Used for tree control.
 * @param assetType asset type
 * @param filterRestriction filter restriction
 */
function getDepreciationMethodForAssetType(assetType, filterRestriction){
	var clause = filterRestriction.findClause('deprec_method');
	var depreciationMethod = "";
	if(clause){
		if(assetType == 'eq'){
			depreciationMethod = "EXISTS(SELECT property_type.property_type FROM property_type WHERE property_type.property_type = eq.property_type AND property_type.deprec_method " + getSqlClauseValue(clause.op, clause.value) + " )";
		}else if(assetType == 'ta'){
			depreciationMethod = "EXISTS(SELECT property_type.property_type FROM property_type WHERE property_type.property_type = ta.property_type AND property_type.deprec_method " + getSqlClauseValue(clause.op, clause.value) + " )";
		}
	}
	return depreciationMethod;
}

/**
 * Used for tree control.
 * @param assetType asset type
 * @param filterRestriction filter restriction
 */
function getDepreciationValueForAssetType(assetType, filterRestriction){
	// depreciation value
	var clause = filterRestriction.findClause('deprec_value_type');
	var depreciationValue = "";
	if(clause){
		if(assetType == 'bl'){
			if(clause.value == 'zero'){
				depreciationValue = "bl.value_book = 0.0 ";
			} else if(clause.value == 'non_zero'){
				depreciationValue = "bl.value_book > 0.0 ";
			} else if(clause.value == 'greater_than'){
				var depValClause = filterRestriction.findClause('deprec_value');
				depreciationValue = "bl.value_book >= " + depValClause.value + " ";
			}

		} else if(assetType == 'property'){
			if(clause.value == 'zero'){
				depreciationValue = "property.value_book = 0.0 ";
			} else if(clause.value == 'non_zero'){
				depreciationValue = "property.value_book > 0.0 ";
			} else if(clause.value == 'greater_than'){
				var depValClause = filterRestriction.findClause('deprec_value');
				depreciationValue = "property.value_book >= " + depValClause.value + " ";
			}
		} else if (assetType == 'eq'){
			var depCondition = "";
			if(clause.value == 'zero'){
				depCondition = "eq_dep.value_accum_dep = 0.0 ";
			} else if(clause.value == 'non_zero'){
				depCondition = "eq_dep.value_accum_dep > 0.0 ";
			} else if(clause.value == 'greater_than'){
				var depValClause = filterRestriction.findClause('deprec_value');
				depCondition = "eq_dep.value_accum_dep >= " + depValClause.value + " ";
			}
			depreciationValue = "EXISTS(SELECT eq_dep.value_accum_dep FROM  eq_dep WHERE eq_dep.eq_id = eq.eq_id AND " + depCondition + " AND eq_dep.report_id = (SELECT dep_reports.report_id FROM dep_reports WHERE dep_reports.last_date = (SELECT MAX(dep_reports.last_date) FROM dep_reports)))";
		} else if (assetType == 'ta'){
			var depCondition = "";
			if(clause.value == 'zero'){
				depCondition = "ta_dep.value_accum_dep = 0.0 ";
			} else if(clause.value == 'non_zero'){
				depCondition = "ta_dep.value_accum_dep > 0.0 ";
			} else if(clause.value == 'greater_than'){
				var depValClause = filterRestriction.findClause('deprec_value');
				depCondition = "ta_dep.value_accum_dep >= " + depValClause.value + " ";
			}
			depreciationValue = "EXISTS(SELECT ta_dep.value_accum_dep FROM  ta_dep WHERE ta_dep.ta_id = ta.ta_id AND " + depCondition + " AND ta_dep.report_id = (SELECT dep_reports.report_id FROM dep_reports WHERE dep_reports.last_date = (SELECT MAX(dep_reports.last_date) FROM dep_reports))) ";
		}
	}
	return depreciationValue;
}


/**
 * Get organization restriction for table.
 * @param tableName table name
 * @param filterRestriction restriction
 */
function getOrganizationRestrictionForTable(tableName, filterRestriction){
	var result = "";
	// bu_id
	var filterClause = filterRestriction.findClause('bl.bu_id');
	if(filterClause){
		result += "AND EXISTS(SELECT dv.dv_id FROM dv WHERE dv.dv_id = " + tableName + ".dv_id AND dv.bu_id " + getSqlClauseValue(filterClause.op, filterClause.value) + " )";
	}
	// dv_id
	result += getFilterClauseRestrictionForTable(tableName, "bl.dv_id", filterRestriction);
	//dp_id
	result += getFilterClauseRestrictionForTable(tableName, "bl.dp_id", filterRestriction);

	return result;
}

/**
 * Get project restriction for table.
 * @param tableName table name
 * @param filterRestriction restriction
 */
function getProjectRestrictionForTable(tableName, filterRestriction){
	var result = "";
	// program_id
	var filterClause = filterRestriction.findClause('project.program_id');
	if(filterClause){
		result += "AND EXISTS(SELECT project.project_id FROM project WHERE project.project_id = " + tableName + ".project_id AND project.program_id " + getSqlClauseValue(filterClause.op, filterClause.value) + " )";
	}
	// project_id
	result += getFilterClauseRestrictionForTable(tableName, "bl.project_id", filterRestriction);
	//work package id
	result += getFilterClauseRestrictionForTable(tableName, "work_pkgs.work_pkg_id", filterRestriction);

	return result;
}


/**
 * Get organization tree restriction.
 *
 * @param filterRestriction
 * @param parameters
 * @returns
 */
function getOrganizationTreeRestrictionFromAssetFilter(filterRestriction, parameters){
	var tmpParameters = cloneObject(parameters);
	var levels = ['bu', 'dv', 'dp'];

	for(var i = 0; i < levels.length; i++){
		var level = levels[i];
		var levelRestriction = getOrganizationTreeRestrictionFromAssetFilterForLevel(level, filterRestriction);
		tmpParameters[level+"_restriction"] = levelRestriction;
	}
	return tmpParameters;
}

/**
 *
 * @param level
 * @param filterRestriction
 * @returns {String}
 */
function getOrganizationTreeRestrictionFromAssetFilterForLevel(level, filterRestriction){
	var result = "1=1 ";
	var dvClause = filterRestriction.findClause('bl.dv_id');
	var dpClause = filterRestriction.findClause('bl.dp_id');

	switch(level){
	case 'bu':
		{
			result += getFilterClauseRestrictionForTable('bu', 'bl.bu_id', filterRestriction);
			var tmp = "EXISTS(SELECT dv.dv_id FROM dv WHERE dv.bu_id = bu.bu_id ";
			var isClause = false;
			if(dvClause){
				tmp += " AND dv.dv_id " + getSqlClauseValue(dvClause.op, dvClause.value);
				isClause = true;
			}
			if(dpClause){
				tmp += " AND EXISTS(SELECT dp.dp_id FROM dp WHERE dp.dv_id = dv.dv_id AND dp.dp_id " + getSqlClauseValue(dpClause.op, dpClause.value) + " )";
				isClause = true;
			}
			tmp += ")";
            
			result += isClause?"AND "+ tmp: "";
			break;
		}
	case 'dv':
		{
			result += getFilterClauseRestrictionForTable('dv', 'bl.dv_id', filterRestriction);
			if(dpClause){
				result += " AND EXISTS(SELECT dp.dp_id FROM dp WHERE dp.dv_id = dv.dv_id ";
				result += " AND dp.dp_id " + getSqlClauseValue(dpClause.op, dpClause.value) + ")";
			}
			break;
		}
	case 'dp':
		{
			result += getFilterClauseRestrictionForTable('dp', 'bl.dp_id', filterRestriction);
			break;
		}
	}
	return result;
}

/**
 * Get project tree restriction.
 *
 * @param filterRestriction
 * @param parameters
 * @returns
 */
function getProjectTreeRestrictionFromAssetFilter(filterRestriction, parameters){
	var tmpParameters = cloneObject(parameters);
	var levels = ['program', 'project', 'work_pkgs', 'activity_log'];

	for(var i = 0; i < levels.length; i++){
		var level = levels[i];
		var levelRestriction = getProjectTreeRestrictionFromAssetFilterForLevel(level, filterRestriction);
		tmpParameters[level+"_restriction"] = levelRestriction;
	}
	return tmpParameters;
}

/**
 *
 * @param level
 * @param filterRestriction
 * @returns {String}
 */
function getProjectTreeRestrictionFromAssetFilterForLevel(level, filterRestriction){
	var result = "1=1 ";
	var projectClause = filterRestriction.findClause('bl.project_id');
	var workPkgsClause = filterRestriction.findClause('work_pkgs.work_pkg_id');

	switch(level){
	case 'program':
		{
			result += getFilterClauseRestrictionForTable('program', 'project.program_id', filterRestriction);
			var tmp = "EXISTS(SELECT project.project_id FROM project WHERE project.program_id = program.program_id ";
			var isClause = false;
			if(projectClause){
				tmp += " AND project.project_id " + getSqlClauseValue(projectClause.op, projectClause.value);
				isClause = true;
			}
			if(workPkgsClause){
				tmp += " AND EXISTS(SELECT work_pkgs.work_pkg_id FROM work_pkgs WHERE work_pkgs.project_id = project.project_id AND work_pkgs.work_pkg_id " + getSqlClauseValue(workPkgsClause.op, workPkgsClause.value) + " )";
				isClause = true;
			}
			tmp += ")";
			result += isClause?"AND "+ tmp: "";
			break;
		}
	case 'project':
		{
			result += getFilterClauseRestrictionForTable('project', 'bl.project_id', filterRestriction);
			if(workPkgsClause){
				result += " AND EXISTS(SELECT work_pkgs.work_pkg_id FROM work_pkgs WHERE work_pkgs.project_id = project.project_id ";
				result +=  " AND work_pkgs.work_pkg_id " + getSqlClauseValue(workPkgsClause.op, workPkgsClause.value) + ")";
			}
			break;
		}
	case 'work_pkgs':
		{
			result += getFilterClauseRestrictionForTable('work_pkgs', 'work_pkgs.work_pkg_id', filterRestriction);
			break;
		}
	case 'activity_log':
		{

			break;
		}
	}
	return result;
}


/**
 * Prepare restriction for asset registry panel.
 *
 * @param treeType tree type (geographical, organization, project)
 * @param nodeRestriction selected node restriction
 * @param filterRestriction asset filter restriction
 *
 * @returns {'restriction': Ab.view.Restriction, 'sql': sql statement}
 */
function getRestrictionForAssetRegistry(treeType, nodeRestriction, filterRestriction, customViewRestriction){
	if(customViewRestriction ==  undefined){
		customViewRestriction = null;
	}
	var restriction = new Ab.view.Restriction();
	var sql = "";
	var blSql = "";
	var eqSql = "";
	var taSql = "";
	var propertySql = "";

	if(valueExistsNotEmpty(treeType) 
			&& valueExists(nodeRestriction) ){
		var result = getRestrictionForAssetRegistryFromTreeNode(treeType, nodeRestriction);
		if(valueExistsNotEmpty(result.sql)){
			sql += result.sql
		}
		if(valueExists(result.restriction) && result.restriction.clauses.length > 0){
			for(var i=0; i< result.restriction.clauses.length; i++){
				var clause = result.restriction.clauses[i];
				restriction.addClause(clause.name, clause.value, clause.op, clause.relOp, false);
			}
		}
	}
	filterRestriction = filterRestriction || {};
	if(valueExistsNotEmpty(filterRestriction.restriction) && filterRestriction.restriction.clauses.length > 0 ){
		for(var i=0; i< filterRestriction.restriction.clauses.length; i++){
			var clause = filterRestriction.restriction.clauses[i];
			restriction.addClause(clause.name, clause.value, clause.op, clause.relOp, false);
		}
	}

	if(valueExistsNotEmpty(filterRestriction.sql)){
		sql += (valueExistsNotEmpty(sql)?" AND ":"") + filterRestriction.sql;
	}

	if(valueExistsNotEmpty(filterRestriction.blSql)){
		blSql += (valueExistsNotEmpty(blSql)?" AND ":"") + filterRestriction.blSql;
	}
	if(valueExistsNotEmpty(filterRestriction.eqSql)){
		eqSql += (valueExistsNotEmpty(eqSql)?" AND ":"") + filterRestriction.eqSql;
	}
	if(valueExistsNotEmpty(filterRestriction.taSql)){
		taSql += (valueExistsNotEmpty(taSql)?" AND ":"") + filterRestriction.taSql;
	}

	if(valueExistsNotEmpty(filterRestriction.propertySql)){
		propertySql += (valueExistsNotEmpty(propertySql)?" AND ":"") + filterRestriction.propertySql;
	}

	if(valueExistsNotEmpty(customViewRestriction) && valueExists(customViewRestriction.blSql)){
		blSql += (valueExistsNotEmpty(blSql)?" AND ":"") + customViewRestriction.blSql;
	}
	if(valueExistsNotEmpty(customViewRestriction) && valueExists(customViewRestriction.eqSql)){
		eqSql += (valueExistsNotEmpty(eqSql)?" AND ":"") + customViewRestriction.eqSql;
	}
	if(valueExistsNotEmpty(customViewRestriction) && valueExists(customViewRestriction.taSql)){
		taSql += (valueExistsNotEmpty(taSql)?" AND ":"") + customViewRestriction.taSql;
	}

	if(valueExistsNotEmpty(customViewRestriction) && valueExists(customViewRestriction.propertySql)){
		propertySql += (valueExistsNotEmpty(propertySql)?" AND ":"") + customViewRestriction.propertySql;
	}

	return {'restriction': restriction,
		'sql': sql,
		'blSql' : blSql,
		'eqSql' : eqSql,
		'taSql' : taSql,
		'propertySql' : propertySql};
}

/**
 * Get asset registry restriction from tree node restriction.
 * @param treeType
 * @param nodeRestriction
 * @returns {'restriction': Ab.view.Restriction, 'sql': sql statement}
 */
function getRestrictionForAssetRegistryFromTreeNode(treeType, nodeRestriction){
	var objRestriction = new Ab.view.Restriction();
	var sqlStatement = null;
	if (treeType == 'geographical' || treeType == 'location') {
		for (var i=0; i< nodeRestriction.clauses.length; i++){
			var tmpObjClause = nodeRestriction.clauses[i];
			var clauseName = 'bl' + tmpObjClause.name.substring(tmpObjClause.name.indexOf('.'));
			objRestriction.addClause(clauseName, tmpObjClause.value, tmpObjClause.op, tmpObjClause.relOp);
		}
	} else if (treeType == 'organization') {
		var blSql = "EXISTS(SELECT rm.bl_id FROM rm WHERE rm.bl_id = bl.asset_id ";
		var genSql = "(1 = 1 ";
		for(var i=0; i< nodeRestriction.clauses.length; i++){
			var tmpObjClause = nodeRestriction.clauses[i];
			if(tmpObjClause.name == 'bu.bu_id'){
				blSql += " AND EXISTS(SELECT dv.dv_id FROM dv WHERE dv.dv_id = rm.dv_id AND dv.bu_id " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value) + " )";
			}else{
				blSql += "AND rm" + tmpObjClause.name.substring(tmpObjClause.name.indexOf('.')) + " " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value);
			}
			genSql += " AND bl" + tmpObjClause.name.substring(tmpObjClause.name.indexOf('.')) + " " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value);
		}

		blSql += ")";
		genSql += ")";

		if(nodeRestriction.clauses.length > 0){
			//KB3048053
			//sqlStatement = "(" + blSql + " OR " + genSql + ")";
			sqlStatement = "(" + genSql + ")";
		}
	} else if (treeType == 'project') {
		//restrict using activity_log table
		sqlStatement = "EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE ( ";
		sqlStatement += "(bl.asset_type = 'bl' AND activity_log.bl_id = bl.asset_id) ";
		sqlStatement += "OR (bl.asset_type = 'eq' AND activity_log.eq_id = bl.asset_id) ";
		sqlStatement += "OR (bl.asset_type = 'ta' AND activity_log.ta_id = bl.asset_id) ";
		sqlStatement += "OR (bl.asset_type = 'property' AND activity_log.pr_id = bl.asset_id)) ";
		sqlStatement += "AND EXISTS(SELECT project.project_id FROM project WHERE project.is_template = 0 AND project.project_id = activity_log.project_id";
		var activityLogStr = "";
		for(var i=0; i< nodeRestriction.clauses.length; i++){
			var tmpObjClause = nodeRestriction.clauses[i];
			if(tmpObjClause.name == 'activity_log.activity_log_id'){
				activityLogStr += tmpObjClause.name + " " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value);
			} else if (tmpObjClause.name == 'work_pkgs.work_pkg_id') {
				sqlStatement += " AND EXISTS(SELECT work_pkgs.work_pkg_id FROM work_pkgs WHERE work_pkgs.project_id = project.project_id AND work_pkgs.work_pkg_id = activity_log.work_pkg_id";
				sqlStatement += " AND " + tmpObjClause.name + " " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value) + ")";
			} else {
				sqlStatement +=  " AND project" + tmpObjClause.name.substring(tmpObjClause.name.indexOf('.')) + " " + getSqlClauseValue(tmpObjClause.op, tmpObjClause.value);
			}
		}
		sqlStatement += ")";
		if(valueExistsNotEmpty(activityLogStr)){
			sqlStatement += "AND " + activityLogStr;
		}
		sqlStatement += ")";
	} else if (treeType == 'systems') {
		objRestriction.addClause('bl.asset_type', 'eq');
		var clause = nodeRestriction.findClause('eq.eq_id');
		objRestriction.addClause('bl.asset_id', clause.value, 'IN');
	}
	return {'restriction': objRestriction, 'sql': sqlStatement};
}

/**
 * Get asset registry restriction from tree node restriction.
 *
 * @param filterRestriction
 * @returns {'restriction': Ab.view.Restriction, 'sql': sql statement}
 */
function getRestrictionForAssetRegistryFromFilter(filterRestriction){
	var objRestriction = new Ab.view.Restriction();
	var sqlStatement = "";
	var blSqlStatement = "";
	var eqSqlStatement = "";
	var taSqlStatement = "";
	var propertySqlStatement = "";

	// geographical fields - remain  on restriction object
	var geoClauseNames = ['bl.geo_region_id', 'bl.ctry_id', 'bl.state_id', 'bl.city_id', 'bl.site_id', 'bl.bl_id', 'bl.fl_id', 'bl.rm_id'];
	for(var i=0; i< geoClauseNames.length ; i++){
		var clause = filterRestriction.findClause(geoClauseNames[i]);
		if(clause){
			objRestriction.addClause(clause.name, clause.value, clause.op, clause.relOp, false);
		}
	}

	//organization - remain  on restriction object
	var orgClauseNames = ['bl.bu_id', 'bl.dv_id', 'bl.dp_id'];
	for(var i=0; i< orgClauseNames.length ; i++){
		var clause = filterRestriction.findClause(orgClauseNames[i]);
		if(clause){
			objRestriction.addClause(clause.name, clause.value, clause.op, clause.relOp, false);
		}
	}

	//project
	var orgClauseNames = ['project.program_id', 'bl.project_id', 'work_pkgs.work_pkg_id'];
	var projSqlRestriction = "";
	var clause = filterRestriction.findClause('project.program_id');
	if(clause){
		projSqlRestriction = " EXISTS(SELECT project.project_id FROM project WHERE project.status NOT IN ('Closed', 'Completed', 'Canceled') AND project.program_id "
			+ getSqlClauseValue(clause.op, clause.value)
			+ " AND activity_log.project_id = project.project_id ) ";
	}

	var clause = filterRestriction.findClause('bl.project_id');
	if(clause){
		projSqlRestriction += (valueExistsNotEmpty(projSqlRestriction)?" AND ": "") + " activity_log.project_id " + getSqlClauseValue(clause.op, clause.value);
	}

	var clause = filterRestriction.findClause('work_pkgs.work_pkg_id');
	if(clause){
		projSqlRestriction += (valueExistsNotEmpty(projSqlRestriction)?" AND ": "") + " activity_log.work_pkg_id " + getSqlClauseValue(clause.op, clause.value);
	}

	if(valueExistsNotEmpty(projSqlRestriction)){
		projSqlRestriction = " AND " + projSqlRestriction;
		blSqlStatement += (valueExistsNotEmpty(blSqlStatement)?" AND ": "") + "EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.bl_id = bl.bl_id " + projSqlRestriction + ")";
		eqSqlStatement += (valueExistsNotEmpty(eqSqlStatement)?" AND ": "") + "EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.eq_id = eq.eq_id " + projSqlRestriction + ")";
		taSqlStatement += (valueExistsNotEmpty(taSqlStatement)?" AND ": "") + "EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.ta_id = ta.ta_id " + projSqlRestriction + ")";
		propertySqlStatement += (valueExistsNotEmpty(propertySqlStatement)?" AND ": "") + "EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.pr_id = property.pr_id " + projSqlRestriction + ")";
	}

	// asset restriction
	var assetClauseNames = ['bl.asset_id', 'bl.asset_type', 'bl.asset_std', 'bl.asset_status', 'bl.pending_action'];
	for(var i=0; i< assetClauseNames.length ; i++){
		var clause = filterRestriction.findClause(assetClauseNames[i]);
		if(clause){
			objRestriction.addClause(clause.name, clause.value, clause.op, clause.relOp, false);
		}
	}
	
	// depreciation
	var depClauseNames = ['deprec_method','deprec_value_type', 'deprec_value'];
	var clause = filterRestriction.findClause('deprec_method');
	if(clause && valueExistsNotEmpty(clause.value)){
		eqSqlStatement += (valueExistsNotEmpty(eqSqlStatement)?" AND ": "") + "EXISTS(SELECT property_type.property_type FROM property_type WHERE property_type.property_type = eq.property_type AND property_type.deprec_method " + getSqlClauseValue(clause.op, clause.value) + " )";
		taSqlStatement += (valueExistsNotEmpty(taSqlStatement)?" AND ": "") + "EXISTS(SELECT property_type.property_type FROM property_type WHERE property_type.property_type = ta.property_type AND property_type.deprec_method " + getSqlClauseValue(clause.op, clause.value) + " )";
	}
	var clause = filterRestriction.findClause('deprec_value_type');
	if(clause && valueExistsNotEmpty(clause.value)){
		if(clause.value == 'zero'){
			objRestriction.addClause('bl.cost_dep_value', '0.0', '=', 'AND', false);
		} else if(clause.value == 'non_zero'){
			objRestriction.addClause('bl.cost_dep_value', '0.0', '>', 'AND', false);
		} else if(clause.value == 'greater_than'){
			var depValClause = filterRestriction.findClause('deprec_value');
			objRestriction.addClause('bl.cost_dep_value', depValClause.value, '>=', 'AND', false);
		}
	}

	return {'restriction': objRestriction,
				'sql': sqlStatement,
				'blSql' : blSqlStatement,
				'eqSql' : eqSqlStatement,
				'taSql' : taSqlStatement,
				'propertySql' : propertySqlStatement};
}

/**
 * On show details from asset registry panel.
 *
 * @param restriction
 */
function onShowDetailsFromAssetRegistry(parentPanel, restriction, callbackMethod){
	var assetType = restriction.findClause('bl.asset_type').value;
	var assetId = restriction.findClause('bl.asset_id').value;
	var originalRestriction = restriction;
	var viewName = '';
	var restriction = new Ab.view.Restriction();
	var dialogConfig = null;
	if(assetType == 'bl'){
		viewName = 'ab-eam-def-geo-loc.axvw';
		restriction.addClause('bl.bl_id', assetId, '=');
		dialogConfig = {
				width: 1024,
				height: 800,
				closeButton: true,
				type: assetType,
				hideTabs: true,
				callback: function(){
					parentPanel.refresh(parentPanel.restriction);
					if(valueExists(callbackMethod)){
						callbackMethod(parentPanel, originalRestriction);
					}
				}};

	}else if(assetType == 'property'){
		viewName = 'ab-rplm-properties-define-form.axvw';
		restriction.addClause('property.pr_id', assetId, '=');
		dialogConfig = {
				width: 1024,
				height: 800,
				closeButton: true,
				callback: function(){
					parentPanel.refresh(parentPanel.restriction);
					if(valueExists(callbackMethod)){
						callbackMethod(parentPanel, originalRestriction);
					}
				}};

	}else if(assetType == 'eq'){
		viewName = 'ab-eq-edit-form.axvw';
		restriction.addClause('eq.eq_id', assetId, '=');
		dialogConfig = {
				width: 1024,
				height: 800,
				closeButton: true,
				callback: function(){
					parentPanel.refresh(parentPanel.restriction);
					if(valueExists(callbackMethod)){
						callbackMethod(parentPanel, originalRestriction);
					}
				}};

	}else if(assetType == 'ta'){
		viewName = 'ab-ta-edit-form.axvw';
		restriction.addClause('ta.ta_id', assetId, '=');
		dialogConfig = {
				width: 1024,
				height: 800,
				closeButton: true,
				callback: function(){
					parentPanel.refresh(parentPanel.restriction);
					if(valueExists(callbackMethod)){
						callbackMethod(parentPanel, originalRestriction);
					}
				}};

	}
	View.getOpenerView().openDialog(viewName, restriction, false, dialogConfig);
}

/**
 * Update asset field
 * @param selectedRecords
 * @param pendingAction
 */
function updateAssetField(assetRegistryView, selectedRecords, fieldName, fieldValue){
	for(var i=0; i < selectedRecords.length; i++){
		var selRecord = selectedRecords[i];
		var assetType = selRecord.getValue('bl.asset_type');
		var assetId= selRecord.getValue('bl.asset_id');

		var objDs = assetRegistryView.dataSources.get('abAssetRegistry_' + assetType + '_ds');
		if(objDs){
			var pkField = getPkFieldByAssetType(assetType);
			var restriction = new Ab.view.Restriction();
			restriction.addClause(assetType + '.' + pkField, assetId, '=');
			var record = objDs.getRecord(restriction);
			record.setValue(assetType + '.' + fieldName, fieldValue);
			try{
				objDs.saveRecord(record)
			} catch(e){
				Workflow.handleError(e);
				return false;
			}
		}
	}
	return true;
}

/**
 * Returns pk field for asset type
 * @param assetType asset type
 * @returns {String}
 */
function getPkFieldByAssetType(assetType){
	var pkField = null;
	if(assetType == 'bl'){
		pkField = 'bl_id';
	} else if (assetType == 'property') {
		pkField = 'pr_id'
	} else if (assetType == 'eq') {
		pkField = 'eq_id'
	} else if (assetType == 'ta') {
		pkField = 'ta_id'
	}
	return pkField
}