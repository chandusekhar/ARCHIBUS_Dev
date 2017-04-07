// Set up a UC javascript namespace
var UC = UC ? UC : new Object();

UC.Data = {

	////////////////////////////////////////////////////////////////////////////////
	// Retrieve a single data value from the database using Archibus workflows.
	//
	// Parameters:
	// table_name    The name of the table to retrieve from.
	// field_name    The name of the field to retrieve.
	// restriction	 The restriction to apply to the query.
	// raw           (Optional) Get the Enum (true) or the Display (false) value.  Default = false.
	//
	// Returns NULL if the workflow failed or no data returned.
	////////////////////////////////////////////////////////////////////////////////
	getDataValue: function(table_name, field_name, restriction, raw)
	{
		var retVal = null;

		var parameters =
		{
					tableName: table_name,
					fieldNames: toJSON([field_name]),
					restriction: toJSON(restriction)
		};
		var wfrResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecord',parameters);

		if (wfrResult.code == 'executed') {
			var record = wfrResult.data.records[0];
			if (typeof(record) != 'undefined') {
				var fullFieldName = table_name + "." + field_name;
				var rawValue = (raw == true) ? 'n' : 'l'
				retVal = (record[fullFieldName][rawValue] == null ? null : record[fullFieldName][rawValue]);
			}
		}

		return retVal;
	},

	////////////////////////////////////////////////////////////////////////////////
	// Retrieve a single record from the database using Archibus workflows.
	//
	// Parameters:
	// table_name    The name of the table to retrieve from.
	// field_name    An array of the fields to retrieve.
	// restriction	 The restriction to apply to the query.
	//
	// Returns NULL if the workflow failed or no data returned.
	////////////////////////////////////////////////////////////////////////////////
	getDataRecord: function(table_name, field_name, restriction)
	{
		var retVal = null;

		var parameters =
		{
					tableName: table_name,
					fieldNames: toJSON(field_name),
					restriction: toJSON(restriction)
		};
		var wfrResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecord',parameters);

		if (wfrResult.code == 'executed') {
			var record = wfrResult.data.records[0];
			if (typeof(record) != 'undefined') {
				retVal = record;
			}
		}

		return retVal;
	},

	////////////////////////////////////////////////////////////////////////////////
	// Retrieve records for the given table and restriction.
	//
	// Parameters:
	// tableName    The name of the table to get records from.
	// fieldNames   An array of names of the fields to return.
	// restriction  The restriction for the query (optional).
	//
	// Returns:   Array of Records (Ab.data.Record).
	//            null is returned if error occured.
	////////////////////////////////////////////////////////////////////////////////
	getDataRecords: function(tableName, fieldNames, restriction)
	{
		var records;

		var parameters = {
			tableName: tableName,
			fieldNames: toJSON(fieldNames),
			restriction: toJSON(restriction)
		};

		var wfrResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords',parameters);

		if (wfrResult.code == 'executed') {
			records = wfrResult.data.records;
		}

		return records;
	},

	////////////////////////////////////////////////////////////////////////////////
	// Processes the record of the panel for passing into Workflows.  This is for
    // Helpdesk/On Demand, but may also work for other modules depending on
    // how Archibus is writing their workflows.
	//
	// Parameters:
	// panel      The name of the panel/form to retreive the record from.
	//
	// Returns:   All the values contained in the datasource retrieved from the form.
	//BH 10-31-2012 added table parameter to function.  If it is passed, the script will only get the fields that match up with the table
	////////////////////////////////////////////////////////////////////////////////
	getDataRecordValuesFromForm: function(panel,table)
	{
		var dataSourceId = panel.dataSourceId;
		var dataSource = View.dataSources.get(dataSourceId);
		var formattedValues = {};

		for(var i=0;i<dataSource.fieldDefs.items.length;i++){

			var fieldId = dataSource.fieldDefs.items[i].id;
			if(panel.containsField(fieldId) == true){
				if (table ==null || table == fieldId.split(".")[0]) {
					formattedValues[fieldId] = panel.getFieldValue(fieldId) + '';
				}
			}
		}

		return formattedValues;
	}
}