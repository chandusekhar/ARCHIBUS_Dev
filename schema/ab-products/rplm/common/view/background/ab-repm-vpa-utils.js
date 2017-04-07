/**
 * Get VPA restriction for user.
 * Default table names used : bl for bl_id_list and site for site_id_list.
 * 
 * @param userId - user id
 * @returns VPA restriction object
 */
function getVpaRestriction(userName){
	var vpaValues = getVpaValues(userName);
	var vpaObject = {};
	if(valueExistsNotEmpty(vpaValues.blIdList)){
		formatVpaValue(vpaObject, "bl.bl_id", vpaValues.blIdList);
	}
	if(valueExistsNotEmpty(vpaValues.siteIdList)){
		formatVpaValue(vpaObject, "site.site_id", vpaValues.siteIdList);
	}
	if(!valueExists(vpaObject.restriction) && !valueExists(vpaObject.string)){
		vpaObject = null;
	}
	return vpaObject;
}

/**
 * Get VPA restriction formatted as sql string for specified table.
 */
function getVpaParameterForTable(userName, tableName, isForBldg, isForSite){
	if(!valueExists(isForBldg)){
		isForBldg = true;
	}
	if(!valueExists(isForSite)){
		isForSite = true;
	}
	var vpaObject = getVpaRestriction(userName);
	var result = "";
	tableName = tableName + ".";
	if(valueExists(vpaObject) && valueExists(vpaObject.string)){
		var vpaString = vpaObject.string;
		var vpaBlId = "";
		var vpaSiteId = "";
		var relOp = "";
		if(valueExists(vpaString["bl.bl_id"])){
			vpaBlId =  removeFirstOperator(vpaString["bl.bl_id"], "AND");
		}
		if(valueExists(vpaString["site.site_id"])){
			vpaSiteId = removeFirstOperator(vpaString["site.site_id"], "AND");
		}
		if(vpaBlId.length > 0 && isForBldg){
			result += vpaBlId.replace(/bl\./g, tableName);
			relOp = " OR ";
		}
		if(vpaSiteId.length > 0 && isForSite){
			result += relOp + vpaSiteId.replace(/site\./g, tableName);
		}
	}
	if(result.length > 0){
		result = "( " + result + " )";
	}else{
		result = "1 = 1";
	}
	return result;
}

/**
 * Remove specified operator if is found on first position.
 * @param string
 * @param operator
 */
function removeFirstOperator(string, operator){
	if(string.indexOf(operator) == 0){
		string = string.slice(operator.length, string.length);
	}
	return string;
}


/**
 * Get VPA restriction values for current user.
 * 
 * @param userId
 * @returns object with bl_id_list and site_id_list values
 */
function getVpaValues(userName){
	var objResult = {};
	var params = {
			tableName: 'afm_users',
			fieldNames: toJSON(['afm_users.user_name', 'afm_users.bl_id_list', 'afm_users.site_id_list']),
			restriction: toJSON({
				'afm_users.user_name': userName
			})
	};
	try{
		var result = Workflow.call('AbCommonResources-getDataRecord', params);
		if(result.code == 'executed'){
			var record = result.dataSet;
			var blIdList = record.getValue('afm_users.bl_id_list');
			if(valueExistsNotEmpty(blIdList)){
				objResult['blIdList'] = blIdList;
			}
			var siteIdList = record.getValue('afm_users.site_id_list');
			if(valueExistsNotEmpty(siteIdList)){
				objResult['siteIdList'] = siteIdList;
			}
			return objResult;
		}
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
	
}

/**
 * Format vpa value and save it to result object.
 * @param vpaObject
 * @param fieldName
 * @param vpaValue
 */
function formatVpaValue(resultObject, fieldName, vpaValue){
	var restrObject = new Ab.view.Restriction();
	var restrSQL = [];
	var values = vpaValue.split(",");
	var fixedValues = [];
	var relOp = ")AND(";
	for(var i = 0; i < values.length; i++){
		var value = trim(values[i]);
		if(value == 'NULL'){
			restrObject.addClause(fieldName, '', 'IS NULL', relOp, false);
			restrSQL.push(fieldName + " IS NULL");
			relOp = "OR";
		}else if(value.indexOf('%') == 0 || value.indexOf('%') == value.length -1){
			restrObject.addClause(fieldName, value, 'LIKE', relOp, false);
			restrSQL.push(fieldName + " LIKE '" + value + "'");
			relOp = "OR";
		}else{
			fixedValues.push(value);
		}
	}
	// add fixed values if we have 
	if(fixedValues.length > 0){
		restrObject.addClause(fieldName, fixedValues, 'IN', relOp, false);
		restrSQL.push(fieldName + " IN ('" + fixedValues.join("','") + "')");
	}
	// prepare result object
	if(restrObject.clauses.length > 0){
		if(!valueExists(resultObject.restriction)){
			resultObject["restriction"] = [];
		}
		resultObject.restriction[fieldName] = restrObject;
	}
	
	if(restrSQL.length > 0){
		if(!valueExists(resultObject.string)){
			resultObject["string"] = [];
		}
		resultObject.string[fieldName] = "AND (" + restrSQL.join(" OR ") + ")";
	}
	
}


/**
 * Trim string function. 
 */
function trim(value){
	if(value.constructor == String || typeof(value) === 'string'){
		return value.replace(/^\s*/, "").replace(/\s*$/, "");
	}
	return value;
}
