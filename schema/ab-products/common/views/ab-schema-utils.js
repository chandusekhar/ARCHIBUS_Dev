/**
 * Provide methods to check schema definition from js. 
 */

/**
 * Check if specified tables are defined in afm_tbls table.
 * @param tables array with table names
 * @result {Boolean} return true when ALL tables are defined.
 */
function schemaHasTables(tables){
	var hasTables = false;
	try {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_tbls.table_name', tables, 'IN');

		var params = {
				tableName: 'afm_tbls',
				fieldNames: toJSON(['afm_tbls.table_name']),
				restriction: toJSON(restriction)
		};
		var result = Workflow.call('AbCommonResources-getDataRecords', params);
		if (result.code == 'executed') {
			hasTables = result.dataSet.records.length == tables.length;
		}
		return hasTables;
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Check if specified field are defined in afm_flds.
 * @param fields array with field names (full field name).
 * @returns {Boolean} return true when ALL fields are defined.
 */
function schemaHasFields(fields){
	var hasFields = false;
	try {
		var restriction = new Ab.view.Restriction();
		for (var i = 0; i < fields.length; i++) {
			var field = fields[i].split('.');
			restriction.addClause('afm_flds.table_name', field[0], '=', ')OR(', false);
			restriction.addClause('afm_flds.field_name', field[1], '=', 'AND', false);
		}

		var params = {
				tableName: 'afm_flds',
				fieldNames: toJSON(['afm_flds.table_name', 'afm_flds.field_name']),
				restriction: toJSON(restriction)
		};
		var result = Workflow.call('AbCommonResources-getDataRecords', params);
		if (result.code == 'executed') {
			hasFields = result.dataSet.records.length == fields.length;
		}
		return hasFields;
	} catch (e) {
		Workflow.handleError(e);
	}
}

