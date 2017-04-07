////////////////////////////////////////////////////////////////////////////////
// brg-common.js
//
// Brg Common Support Functions
////////////////////////////////////////////////////////////////////////////////

// Set up the Brg javascript namespace

var BRG = BRG ? BRG : new Object();


// Wrap all functions in this file in the Common object.
BRG.Common = {
	////////////////////////////////////////////////////////////////////////////////
	// Calls an Archibus workflow and returns the result.
	//
	// Parameters:
	// workflowName    The name of the archibus workflow.
	// parameters      The parameters to pass into the workflow
	//
	// Returns:   The result from the workflow if successful, NULL otherwise.
	//
	// This function will handle the errors that are returned by the workflow.
	// Mainly used for the difference in workflow calling method between different
	// Archibus versions.
	////////////////////////////////////////////////////////////////////////////////
	callWorkflow: function(workflowName, parameters)
	{
		var returnVal = null;

		/*
			// 17.2 Method
			try {
				var result = Workflow.call(workflowName, parameters);
				returnVal = result;
			}
			catch (e) {
				Workflow.handleError(e);
			}
		*/

		// pre-17.2
		var result = AFM.workflow.Workflow.runRuleAndReturnResult(workflowName,parameters);
		if (result.code == 'executed'){
			returnVal = result;
		} else {
			AFM.workflow.Workflow.handleError(result);
		}

		return returnVal;
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
	//
	// Author: Eddy Wong
	// Modified Date: June 01, 2009
	////////////////////////////////////////////////////////////////////////////////
	getDataRecords: function(tableName, fieldNames, restriction, sortValues)
	{
		var records;

		var parameters = {
			tableName: tableName,
			fieldNames: toJSON(fieldNames),
			restriction: toJSON(restriction),
			sortValues: sortValues
		};

		var result = this.callWorkflow('AbCommonResources-getDataRecords', parameters);
		if (result != null) {
			records = result.data.records;
		}

		return records;
	},

	////////////////////////////////////////////////////////////////////////////////
	// Retrieve the data values from a single table using Archibus workflows
	//
	// Parameters:
	// em_id    The em_id of the employee.
	//
	// Returns:   The full name of the employee in the format (LastName, FirstName) or
	//            empty string if not found.
	//
	// Author: Eddy Wong
	// Modified Date: Aug. 15, 2008
	////////////////////////////////////////////////////////////////////////////////
	getDataValues: function(tableName, fieldNames, restriction)
	{
		var record = null;

		var parameters =
		{
			tableName: tableName,
			fieldNames: toJSON(fieldNames),
			restriction: toJSON(restriction)
		};


		var result = this.callWorkflow('AbCommonResources-getDataRecord', parameters);
		if (result != null) {
			record = result.data.records[0];
		}

		return record;
	},

	////////////////////////////////////////////////////////////////////////////////
	// Retrieve a single data value from the database using Archibus workflows.
	//
	// Parameters:
	// table_name    The name of the table to retrieve from.
	// field_name    The name of the field to retrieve.
	// restriction   The restriction to apply to the query.
	// raw           (Optional) Return the raw data or the display data. Default to raw
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

		var result = this.callWorkflow('AbCommonResources-getDataRecord', parameters);
		if (result != null) {
			var record = result.data.records[0];
			if (typeof(record) != 'undefined') {
				var fullFieldName = table_name + "." + field_name;
				retVal = (record[fullFieldName] == null ? null : record[fullFieldName]);

				var rawVal = (raw == null || raw) ? 'n' : 'l';
				retVal = typeof(retVal) == 'object' ? retVal[rawVal] : retVal;
			}
		}

		return retVal;
	},

	////////////////////////////////////////////////////////////////////////////////
	// Function : literalOrNull(val, emptyString)
	//
	// Returns the parameter val as a SQL string literal, with single quotes
	// escaped.
	//
	// Parameters:
	// val           Value to be replace
	// emptyString   (Optional) A boolean indicating if empty strings should be
	//               treated empty string or NULL.  True returns '', false returns
	//               the string NULL.
	//
	// Returns:   replaced string
	//
	// Remarks: A null value for val will always return NULL regardless of the
	//          value of emptyString
	//
	// Author: Eddy Wong
	// Modified Date: July 29, 2009
	////////////////////////////////////////////////////////////////////////////////
	literalOrNull: function(val, emptyString) {
		if(val == undefined || val == null)
			return "NULL";
		else if (!emptyString && val == "")
			return "NULL";
		else
			return "'" + val.replace(/'/g, "''") + "'";
	},

	////////////////////////////////////////////////////////////////////////////////
	// Function : getMlHeading(tableName, fieldName)
	//
	// Return the Muilt-Line Heaing based on table and field name
	//
	// Parameters:
	// tableName
	// fieldName
	//
	// Returns:   Muilt-Line Heaing
	//
	// Author: Aaron So
	// Modified Date: July 1, 2009
	////////////////////////////////////////////////////////////////////////////////
	getMlHeading: function(tableName, fieldName){

		var record;
		var ml_heading;

		record = this.getDataRecords("afm_flds",["afm_flds.ml_heading"], "afm_flds.table_name='"+tableName+"' and afm_flds.field_name='"+fieldName+"'")

		if(record.length >0)
			return record[0]["afm_flds.ml_heading"];
		else
			return "";
	},

	///////////////////////////////////////////////////////////////////////////////
	// Retrieve the enum list from the specified table and field.
	//
	// Parameters:
	// table_name   The database table name.
	// field_name   The name of the field.
	//
	// Returns:   The enum_list of the specifed table and field.
	//
	// Author: Eddy Wong
	// Modified Date: Aug. 15, 2008
	////////////////////////////////////////////////////////////////////////////////
	getEnumList: function(table_name, field_name)
	{
		if (typeof(table_name) == null || table_name == '' ||
			typeof(field_name) == null || field_name == '')
			return "";

		var restriction = new AFM.view.Restriction();
		restriction.addClause('afm_flds.table_name', table_name, '=');
		restriction.addClause('afm_flds.field_name', field_name, '=');

		var record = this.getDataRecords('afm_flds', ['afm_flds.enum_list'], restriction);

		var enumList = "";
		if (typeof(record) != 'undefined' && record.length > 0) {
		  enumList = (record[0]['afm_flds.enum_list'] == null ? "" : record[0]['afm_flds.enum_list']);
		}

	  return enumList;
	},

	////////////////////////////////////////////////////////////////////////////////
	// Retrieve the full text of the given enum value.
	//
	// Parameters:
	// enumlist   The semicolon separated enum_list.
	// value      The db value.
	//
	// Returns:   The full text of the enum value.
	//
	// Author: Eddy Wong
	// Modified Date: Sept. 29, 2008
	////////////////////////////////////////////////////////////////////////////////
	getEnumText: function(enumlist, value)
	{
	  var fullText = "";

	  if (enumlist != null) {
		enumArr = enumlist.split(';');
		for (iLoop = 0; iLoop < enumArr.length; iLoop=iLoop+2) {
		  if (enumArr[iLoop] == value) {
			fullText = enumArr[iLoop+1];
		  }
		}
	  }

	  return fullText;
	},

	////////////////////////////////////////////////////////////////////////////////
	// Retrieve a parameter value from the Activity Parameters table for the
	// specified activity and code.
	//
	// Parameters:
	// activity      The name activity of the parameter.
	// paramCode     The name of the the parameter.
	//
	// Returns NULL if the workflow failed or no data returned.
	////////////////////////////////////////////////////////////////////////////////
	getActivityParam: function(activity, paramCode)
	{
		var table_name = 'afm_activity_params';
		var field_name = 'param_value';
		var rest = "activity_id = "+this.literalOrNull(activity)+" AND param_id = "+this.literalOrNUll(paramCode);

		var paramValue = this.getDataValue(table_name, field_name, rest);

		return paramValue;
	},

	////////////////////////////////////////////////////////////////////////////////
	// Retrieve the message value from the Messages table for the
	// specified activity, reference and code.
	//
	// Parameters:
	// activity      The name of the table to retrieve from.
	// refBy         The message Reference By.
	// msgCode       The name of the message.
	//
	// Returns NULL if the workflow failed or no data returned.
	////////////////////////////////////////////////////////////////////////////////
	getMessageText: function(activity, refBy, msgCode)
	{
		var table_name = 'messages';
		var field_name = 'message_text';

		var rest = "activity_id = "+this.literalOrNull(activity)+" AND referenced_by = "+this.literalOrNull(refBy)+" AND message_id = "+this.literalOrNull(msgCode);

		var msgValue = this.getDataValue(table_name, field_name, rest);

		return msgValue;
	},

	/*/////////////////////////////////////////////////////////////////////////////////////////////////////
		generateInSQL(primaryKeys, arrayToConvert)

		parm:
			primaryKeyNames - array of primary keys Names
			arrayToConvert - this holds the array from grid.getPrimaryKeysForSelectedRows()
			renameQueryTo - (optional) if you want to change the value for the pk,use this value eg. (eq.eq_id IN (..)) but you want (eq_id IN (..))

		return:
			sql - "" if arrayToConvert is empty else the sql will return string like " (eq.eq_id in (..) or eq.eq_id in (..) )"

	/////////////////////////////////////////////////////////////////////////////////////////////////////*/
	generateInSQL: function(primaryKeyNames, arrayToConvert, renameQueryTo){
		var sql;
		var limit = 999;
		var arrayLength = arrayToConvert.length;
		var primaryKeyNamesLength = primaryKeyNames.length;
		var fieldsToQuery = "";

		if(renameQueryTo != undefined){
			fieldsToQuery = renameQueryTo;
		}
		else{
			if(primaryKeyNamesLength == 1){
				fieldsToQuery = primaryKeyNames[0];
			}
			else{
				fieldsToQuery = "(";
				for(var x=0;x<primaryKeyNamesLength; x++){
					fieldsToQuery = fieldsToQuery + primaryKeyNames[x];
					if(x < primaryKeyNamesLength-1)
						fieldsToQuery = fieldsToQuery + ",";
				}
				fieldsToQuery = fieldsToQuery+")";
			}
		}

		var temp="";
		if(arrayLength > 0){
			sql = " (";
			for(var i=0;i<arrayLength;i++){

				//create the IN statment
				if(i%limit==0)
					sql = sql+fieldsToQuery+ " IN (";

				if(primaryKeyNamesLength == 1){
					sql= sql+ this.literalOrNull(arrayToConvert[i][primaryKeyNames[0]]);
				}
				else{
					temp="(";
					for(var z=0; z<primaryKeyNamesLength; z++){
						temp = temp + this.literalOrNull(arrayToConvert[i][primaryKeyNames[z]]);
						if(z < primaryKeyNamesLength-1)
							temp = temp + ",";

					}
					temp= temp + ")";
					sql = sql+temp;
				}


				//determine is it a comma or close blanket
				if((i%limit!=limit-1)&&(i < arrayLength - 1)){
					sql = sql + ",";
				}
				else{
					if(i >= arrayLength - 1)
						sql = sql + ") ";
					else
						sql = sql + ") OR ";
				}
			}
			sql = sql+") ";
		}

		return 	sql;
	}
};