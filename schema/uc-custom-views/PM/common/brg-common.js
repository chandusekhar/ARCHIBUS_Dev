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
	getDataRecords: function(tableName, fieldNames, restriction)
	{
		var records;

		var parameters = {
			tableName: tableName,
			fieldNames: toJSON(fieldNames),
			restriction: toJSON(restriction)
		};

		var result = this.callWorkflow('AbCommonResources-getDataRecords', parameters);
		if (result != null) {
			records = result.data.records;
		}

		return records;
	},

	////////////////////////////////////////////////////////////////////////////////
	// Retrieve the data values from a single table and record using Archibus workflows
	//
	// Parameters:
	// tableName    The name of the table to get records from.
	// fieldNames   An array of names of the fields to return.
	// restriction  The restriction for the query (optional).
	//
	// Returns:   An array of values indexed by [tableName.fieldName].
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
	// Retrieve a single data value from a single table and record using Archibus workflows
	//
	// Parameters:
	// tableName    The name of the table to get records from.
	// fieldName    The name of the field to return.
	// restriction  The restriction for the query (optional).
	//
	// Returns:   An array of values indexed by [tableName.fieldName].
	//
	// Author: Eddy Wong
	// Modified Date: Aug. 15, 2008
	////////////////////////////////////////////////////////////////////////////////
	getDataValue: function(tableName, fieldName, restriction)
	{
		var record = null;
        var retVal = null;
		var parameters =
		{
			tableName: tableName,
			fieldNames: toJSON([fieldName]),
			restriction: toJSON(restriction)
		};


		var result = this.callWorkflow('AbCommonResources-getDataRecord', parameters);
		if (result != null) {
			record = result.data.records[0];
            if (record != null) {
                retVal = record[tableName+"."+fieldName]["l"];
            }
		}

		return retVal;
	},

	////////////////////////////////////////////////////////////////////////////////
	// Function : replaceSingleQuote(val)
	//
	// Add adding single quote if there are any single quote in the string
	//
	// Parameters:
	// val    Value to be replace
	//
	// Returns:   replaced string
	//
	// Author: Aaron So
	// Modified Date: June 19, 2009
	////////////////////////////////////////////////////////////////////////////////
	replaceSingleQuote: function(val) {
		if(val != null)
			return val.replace(/'/g, "''");
		else
			return null;
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

    // *****************************************************************************
    // Replaces lone LF (\n) with CR+LF (\r\n)
    // *****************************************************************************
    replaceLF: function(value)
    {
        String.prototype.reverse = function () {
            return this.split('').reverse().join('');
        };

        return value.reverse().replace(/\n(?!\r)/g, "\n\r").reverse();
    }
};