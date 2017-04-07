////////////////////////////////////////////////////////////////////////////////
// brg-common-ui.js
//
// Brg Common User Interface Support Functions
////////////////////////////////////////////////////////////////////////////////

// Set up the Brg javascript namespace
var BRG = BRG ? BRG : new Object();

// Wrap all functions in this file in the UI object.
BRG.UI = BRG.UI ? BRG.UI : {
	////////////////////////////////////////////////////////////////////////////////
	// Updates a text field with a value taken from the database.
	//
	// Parameters:
	// elementId    The name of the element (usually a text input box) to update.
	// tableName    The name of the table to get records from.
	// fieldName    The name of the fields to return.
	// restriction  The restriction for the query.
	////////////////////////////////////////////////////////////////////////////////
	updateTextField: function(elementId, tableName, fieldName, restriction)
	{
		var element = $(elementId);
		var tempvalue = "";

		if (element != null)  {
			// Get the value from the database.
			var records = BRG.Common.getDataRecords(tableName, [fieldName], restriction);

			// Take the first record and update the input field.
			if (records != null && records.length >0){

				if(fieldName.indexOf(".") <0){	//07.27.2010 if user did not put table prefix into fieldName, grab it from tableName
					tempvalue = records[0][tableName+"."+fieldName]
				}
				else{
					tempvalue = records[0][fieldName]
				}

			}

			//aso: added condtion so that if tagName="INPUT", put value into element.value else put it into innerHTML
				if(element.tagName == 'INPUT')
					element.value = tempvalue;
				else
					element.innerHTML = tempvalue;
		}
	},


	////////////////////////////////////////////////////////////////////////////////
	// Add an option to select box
	//
	// Parameters:
	// selectBox    The option box element to add the option to.
	// value        The value of the option.
	// text         The display text of the option.
	// index        (optional) The index to insert the option to.  Defaults to
	//              end of the select box.
	//
	// Remarks: For inserting a blank select option, use:
	//          addSelectOption(selectBox, '', '', 0);
	//
	// Author: Eddy Wong
	// Modified Date: Aug. 15, 2008
	////////////////////////////////////////////////////////////////////////////////
	addSelectOption: function(selectBox, value, text, index)
	{
		var newOptionElement = document.createElement('option');
		newOptionElement.text = text;
		newOptionElement.value = value;

		if (index == null || typeof(index) == 'undefined') {
			try {
				selectBox.add(newOptionElement, null); // standards compliant, not IE.
			}
			catch (ex) {
				selectBox.add(newOptionElement);  // IE only.
			}
		}
		else {
			var insertBeforeElement = selectBox.options[index];
			try {
				selectBox.add(newOptionElement, insertBeforeElement); // standards compliant, not IE.
			}
			catch (ex) {
				selectBox.add(newOptionElement, index);  // IE only.
			}
		}
	},

	////////////////////////////////////////////////////////////////////////////////
	// Removes an option from a select box
	//
	// Parameters:
	// selectBox    The option box element to remove an option from.  this.<panel>.fields.get("<Field>").dom
	// value        The value of the option.
	//
	// Returns:   true if a select option was remove, false otherwise.
	//
	// Author: Eddy Wong
	// Modified Date: July 10, 2009
	////////////////////////////////////////////////////////////////////////////////
	removeSelectOption: function(selectBox, value)
	{
		// loop through all the options, removing the one specified.
		for (var i=(selectBox.options.length-1); i >= 0; i--) {
			if (selectBox.options[i].value == value) {
				selectBox.remove(i);
				return true;
			}
		}

		return false;
	},

	///////////////////////////////////////////////////////////////////////////////
	// Restrict a drop down (select) box to a specific range of option values.
	//
	// Parameters:
	// selectBox      The option box element.
	// startOption    The first option value to show (inclusive).  This value is option value and not the display value.
	// endOption      The last option value to show (inclusive).  This value is optin value and not the display value.
	//
	// Author: Eddy Wong
	// Modified Date: Aug. 15, 2008
	////////////////////////////////////////////////////////////////////////////////
	restrictSelect: function(selectBox, startOption, endOption)
	{
		var inRange = false;
		var checkOption = endOption;

		if (selectBox == null || typeof(selectBox) == 'undefined') {
			return;
		}

		// loop through all the options, removing the ones that not within range.
		// Note: the loop is backwards because the options array is renumbered when
		//       an option is removed.
		for (var i=(selectBox.options.length-1); i >= 0; i--) {
			if (inRange == false) {
				if (selectBox.options[i].value == checkOption && checkOption == endOption) {
					// the endOption has been reached, it is now in the range we want until
					// we reach startOption.
					checkOption = startOption;
					inRange = true;
				}
				else {
					selectBox.remove(i);
				}
			}

			// checked before the loop is exited because it's possible that
			// start/endOption are the same.
			if (inRange == true) {
				// we are in the section that we want to show.
				if (selectBox.options[i].value == checkOption && checkOption == startOption) {
					// now we are going out of the desired range.
						checkOption = "";
						inRange = false;
				}
			}
		}
	},

	////////////////////////////////////////////////////////////////////////////////
	// Fills the given select option box with the values in an enum list, you can
	// optionally restrict it to a specific range of enum values.
	//
	// Parameters:
	// selectBox    The option box element.
	// enumList     The enumList from Archibus in the value;display pairs all separated by semi-colons.
	// startEnum    The first enum value to show (inclusive).  This value is enum and not the display value.
	// endEnum      The last enum value to show (inclusive).  This value is enum and not the display value.
	//
	// Author: Eddy Wong
	// Modified Date: Aug. 15, 2008
	////////////////////////////////////////////////////////////////////////////////
	setEnumSelect: function(selectBox, enumList, startEnum, endEnum)
	{
		var inRange = false;
		var checkEnum = endEnum;

		if (selectBox == null || typeof(selectBox) == 'undefined') {
			return;
		}

		// clear the select box
		selectBox.options.length = 0;

		var enumArray;
		if (enumList != null || typeof(enumList) != 'undefined') {
			enumArray = enumList.split(";");
		}
		else
			// empty enumList;
			return;

		// Create the options
		var counter = 0;
		var inRange = false;
		var checkEnum = startEnum;

		if (checkEnum == null || typeof(checkEnum) == 'undefined') {
			inRange = true;
		}

		while (counter < (enumArray.length-1)) {
			// check if it's going into range
			if (!inRange && enumArray[counter] == checkEnum) {
				checkEnum = endEnum;
				inRange = true;
			}

			if (inRange) {
				this.addSelectOption(selectBox, enumArray[counter], enumArray[(counter+1)]);
			}

			// check if it's going out of range
			if (inRange && enumArray[counter] == checkEnum) {
				checkEnum = null;
				inRange = false;
			}

			counter = counter + 2;  // need to skip by 2 because it's value/display pair.
		}
	},


	//--------------------------------------------------------------------------------
	// Support Functions and variables for the addNameField function
	afterSelectValueSequence : function() {
		var parameters = Ab.view.View.selectValueParameters;
		var panel = View.panels.get(parameters.formId);

		// run the setNameField on all fields that could have been changed by
		// selectValue and if it has a description set.
		for (var i = 0; i < parameters.fieldNames.length; i++) {
			var fieldName = trim(parameters.fieldNames[i]);

			try {
				var field = panel.fields.get(fieldName);
				if (typeof(field) != 'undefined') {
					var nameFieldParameters = field.brgNameFieldParameters;
					if (typeof(nameFieldParameters) != 'undefined') {
						var fieldDom = field.dom;
						fieldDom.onchange.call();
						/*
						for(var paramKeys in nameFieldParameters) {
							this.updateNameField(nameFieldParameters[paramKeys]);
						}
						*/
					}
				}
			}
			catch(ex) {

			}
		}
	},

	updateNameField: function(nameFieldParameters) {
		var listenFields = nameFieldParameters.listenFields;
		var panel = nameFieldParameters.panel;

		// Obtain the new field values.
		var keyFieldValues = new Object();
		for (var key in listenFields) {
			if (listenFields.hasOwnProperty(key)) {
				keyFieldValues[key] = panel.getFieldValue(listenFields[key]);

				// check for upper case
				var field = panel.fields.get(listenFields[key]);
				if (typeof(field) != 'undefined' && field.fieldDef.format == "Upper") {
					keyFieldValues[key] = keyFieldValues[key].toUpperCase();
				}
			}
		}

		// Call the actual update function/
		this.setNameField(
			nameFieldParameters.id,
			nameFieldParameters.panel,
			nameFieldParameters.fieldName,
			nameFieldParameters.nameTable,
			nameFieldParameters.nameField,
			keyFieldValues,
			nameFieldParameters.configObj);
	},
	// End of addNameField Support
	//--------------------------------------------------------------------------------

	////////////////////////////////////////////////////////////////////////////////
	// Adds in a "Name" field under the field text box.
	//
	// This function will automatically hook into the onchange event and the
	// afterSelectValue listeners to update the name/description if the text box is
	// updated by the user through typing or from the selectValue.  If any of the fields
	// that is "listened" to changes, the name will update.
	//
	// Any other programmatic changes to the text box will not update the name due
	// the way javascript works.  Call the addNameField again or the setNameName to
	// change the text in this case.
	//
	// Calling this function multiple times with the same id/panel/fieldName combination
	// will the override the parameters of the name field with the same combination
	// and it will not cause multiple instance of the name field to be created.  But
	// name fields with different ids can appear under the same field.
	//
	// Example Calls:
	//
	//  BRG.UI.addNameField('to_rm_type_desc', moveform, 'mo.to_rm_id', 'rm', 'rm_type',
	//     {'rm.bl_id' : 'mo.to_bl_id', 'rm.fl_id' : 'mo.to_fl_id', 'rm.rm_id' : 'mo.to_rm_id' },
	//     {lengthLimit : 50, textTemplate : "<span style='color:black;'>Room Type:</span> {0}", textColor : "#FF0000", defaultValue : "No Data" , raw : false});
	//
	//  BRG.UI.addNameField('em_full_name', moveform, 'mo.em_id', 'em', ['name_first', 'name_last'],
	//     {'em.em_id' : 'mo.em_id'},
	//     {nameFieldTemplate : "{0} {1}"});
	//
	// Parameters:
	// id            The id of the Name field.
	// panel         The panel of the field.
	// fieldName     The field name of the field where the name will appear under.
	// nameTable     The name of the lookup table.
	// nameField     The field(s) of the lookup table.  Either a single string or an array of strings.
	// listenFields  The fields to listen for changes (these are also the fields it'll restrict by)
	// configObj     (Optional) The configuration object.  Allows for maxLength, a template, text colors, etc.
	//                  lengthLimit : The maximum length of the value to show, truncates and appends "..."
	//                  textTemplate : Add in a template for extra info. use {0} to hold where the
	//                                 queried value should go.  ex. "Room Type: {0}"
	//                  textColor : The color of the shown text.
	//                  defaultValue : Value to show if no values are returned.
	//                  nameFieldTemplate : Template on how to format multiple nameFields. (required if
	//                                      fieldName is an array.  Otherwise will always return empty string).
	//                  raw : Determines if it shows the raw value or display value (for enums).  Default to raw.
	//
	// Author: Eddy Wong
	// Modified Date: Sep. 20, 2010
	////////////////////////////////////////////////////////////////////////////////
	addNameField: function(id, panel, fieldName, nameTable, nameField, listenFields, configObj)
	{

		var currKeyValues = new Object();

		var setNamedParameters = new Object();
		setNamedParameters.id = id;
		setNamedParameters.panel = panel;
		setNamedParameters.fieldName = fieldName;
		setNamedParameters.nameTable = nameTable;
		setNamedParameters.nameField = nameField;
		setNamedParameters.listenFields = listenFields;
		setNamedParameters.configObj = configObj;

		var mainField = panel.fields.get(fieldName);
		if (mainField == null) {
			// field does not exist, exit
			return;
		}

		if (!mainField.brgNameFieldParameters) {
			mainField.brgNameFieldParameters = new Object();
		}

		mainField.brgNameFieldParameters[id] = setNamedParameters;

		for (var fieldKeys in listenFields) {
			// append a onchange function to each of the fields that affects the value.
			var field = panel.fields.get(listenFields[fieldKeys]);
			currKeyValues[fieldKeys] = panel.getFieldValue(listenFields[fieldKeys]);

			var fieldDom;
			if (typeof(field) != 'undefined') {
				fieldDom = field.dom;
			}

			if (typeof(fieldDom) != 'undefined' && !fieldDom[id+'_BrgNameAdd']) {
				// define the update function
				var updateNameFunc = function() {
					// get listenFields values (needs to be done each time the function is called)
					var keyValues = new Object();

					for (var key in listenFields) {
						if (listenFields.hasOwnProperty(key)) {
							keyValues[key] = panel.getFieldValue(listenFields[key]);
						}
					}

					BRG.UI.setNameField(id, panel, fieldName, nameTable, nameField,
						keyValues, configObj);
				};

				// Set the onchange event of the field
				fieldDom.onchange = (fieldDom.onchange == null) ? updateNameFunc : fieldDom.onchange.createSequence(updateNameFunc);


				// Set the namedFieldAdded flag
				fieldDom[id+'_BrgNameAdd'] = true;
			}
		}

		BRG.UI.setNameField(id, panel, fieldName, nameTable, nameField, currKeyValues, configObj);

	},

	////////////////////////////////////////////////////////////////////////////////
	// Set in a "Name" field under the field text box.
	//
	// This function does not automatically update on user changes and it's a one time
	// addition of the Name.  Use addNameField if it needs to updated based on changes.
	//
	// Example Call:
	//
	//  BRG.UI.setNameField('to_rm_type_desc', moveform, 'mo.to_rm_id', 'rm', 'rm_type',
	//     {'rm.bl_id' : 'BLDGA', 'rm.fl_id' : 'FL01', 'rm.rm_id' : '101' },
	//     {lengthLimit : 50, textTemplate : "<span style='color:black;'>Room Type:</span> {0}", textColor : "#FF0000", defaultValue : "No Data" });
	//
	// Parameters:
	// id            The id of the Name field.
	// panel         The panel of the field.
	// fieldName     The field name of the field where the name will appear under.
	// nameTable     The name of the lookup table.
	// nameField     The field of the lookup table.
	// restrictValues  The values to query and restrict by.
	// configObj     (Optional) The configuration object.  Allows for maxLength, a template, text colors, etc.
	//                  lengthLimit : The maximum length of the value to show, truncates and appends "..."
	//                  textTemplate : Add in a template for extra info. use {0} to hold where the
	//                                 queried value should go.  ex. "Room Type: {0}"
	//                  textColor : The color of the shown text.
	//                  defaultValue : Value to show if no values are returned.
	//
	// Author: Eddy Wong
	// Modified Date: Sep. 20, 2010
	////////////////////////////////////////////////////////////////////////////////
	setNameField: function(id, panel, fieldName, nameTable, nameField, restrictValues, configObj)
	{

		var config = typeof(configObj) == 'undefined' ? new Object() : configObj;

		var fieldId = panel.id + "_" + fieldName;
		var spanId = id + '_brgname';

		// Check if there is already a name span tag, if so replace, otherwise create
		var spanElement = document.getElementById(spanId);

		if (spanElement == null) {
			var fieldElement = document.getElementById(fieldId);
			var parentElement = fieldElement.parentNode;
			parentElement.appendChild(document.createElement('br'));

			spanElement = document.createElement('span');
			spanElement.id = spanId;
			parentElement.appendChild(spanElement);

			spanElement.style.fontsize = 'x-small';
		}

		// Set configuration
		if (typeof(config['textColor']) != 'undefined') {
			spanElement.style.color = config['textColor'];
		}

		// query database for display value if needed.
		if (typeof(nameField) != 'undefined') {
			var rest = new AFM.view.Restriction();

			// Add in the primary keys
			var allNulls = true;
			for (var key in restrictValues) {
				if (restrictValues.hasOwnProperty(key)) {
					rest.addClause(key, restrictValues[key], "=");
					allNulls = restrictValues[key] != "" ? false : allNulls;
				}
			}

			if (allNulls && typeof(config['defaultValue']) == 'undefined') {
				spanElement.innerHTML = "";
				spanElement.visibility = 'hidden';
				return;
			}
			else if (allNulls) {
				spanElement.innerHTML = config['defaultValue'];
				spanElement.visibility = 'visible';
				return;
			}

			var result = null;
			var resultOutput = null;

			if (typeof(nameField) != 'object') {

				result = BRG.Common.getDataValue(nameTable, nameField, rest, config['raw']);

				if (result != null) {
					resultOutput = result;
				}
			}
			else {

				result = BRG.Common.getDataValues(nameTable, nameField, rest);
				if (result != null) {
					var resultOutput = typeof(config['nameFieldTemplate']) != 'undefined' ? config['nameFieldTemplate'] : "";
					var rawVal = (config['raw'] == null || config['raw']) ? 'n' : 'l';
					for (var i = 0; i < nameField.length; i++) {
						var repl = "{"+i+"}"
						resultOutput = resultOutput.replace(repl, result[nameTable+"."+nameField[i]][rawVal]);
					}
				}
			}

			// Apply text configuration.
			var outputText = "";
			if (resultOutput == null) {
				outputText = typeof(config['defaultValue']) == 'undefined' ? "" : config['defaultValue'];
			}
			else {
				var lengthLimit = config['lengthLimit'];
				if (typeof(lengthLimit) != 'undefined' && lengthLimit != 0 && resultOutput.length > lengthLimit) {
					outputText = resultOutput.substr(0, lengthLimit) + "...";
				}
				else {
					outputText = resultOutput;
				}

				if (typeof(config['textTemplate']) != 'undefined') {
					outputText = config['textTemplate'].replace(/\{0\}/g, outputText);
				}
			}

			spanElement.innerHTML = outputText;
			spanElement.visibility = 'visible';
		}
		else if (typeof(nameTable)=='string') {
			spanElement.innerHTML = nameTable;
			spanElement.visibility = 'visible';
		}
		else {
			spanElement.visibility = 'hidden';
		}
	},

	////////////////////////////////////////////////////////////////////////////////
	// Refreshes the specified NamedField.
	//
	// This function will requery and refresh the named field programmically.  Due
	// to javascript's event handling, on change events are not called normally if
	// a control is updated automatically.  Calling this function will refresh an
	// already added NamedField.
	//
	// Author: Eddy Wong
	// Modified Date: Oct. 13, 2011
	////////////////////////////////////////////////////////////////////////////////
	refreshNamedField : function(panel, fieldName) {
		var field = panel.fields.get(fieldName);
		if (typeof(field) != 'undefined') {
			var nameFieldParameters = field.brgNameFieldParameters;
			if (typeof(nameFieldParameters) != 'undefined') {
				var fieldDom = field.dom;
				fieldDom.onchange.call();
			}
		}
	},

	////////////////////////////////////////////////////////////////////////////////
	// Removes extra button "bars" for hidden buttons.
	//
	// This function will remove any extraeous separator bars left from hidden
	// buttons from the panel's title bar.
	//
	// Author: Bryan Hill
	// Modified Date:
	////////////////////////////////////////////////////////////////////////////////
	removeButtonBars : function (pnl){
		var btnBar, i;
		for (i = 0; i < pnl.actions.length - 1 ; i++) {
			btnBar = document.getElementById(pnl.actions.get(i).id).parentNode.nextSibling;
			if (btnBar) {
				if (pnl.actions.get(i).button.hidden) {
					btnBar.className = 'x-hide-display';
				}
				else {
					btnBar.className = null;
				}
			}
		}
	},


	overrideSelectValueSort : false,
	////////////////////////////////////////////////////////////////////////////////
	// Force all SelectValue in the page to sort by the primary key values
	//
	// This function adds additional sort of the primary key to all the select
	// value boxes in the page.
	//
	// Author: Eddy Wong
	// Modified Date: Oct. 14, 2011
	////////////////////////////////////////////////////////////////////////////////
	sortSelectValuesByPrimaryKey : function (asc) {
		if (asc == null) {
			asc = true;
		}

		// Only override once.
		if (!this.overrideSelectValueSort) {
			// Would like to override constructor, but does not appear to work.
			// We will add in the sort before the records are retrieved/displayed
			var originaldisplaySelectValueRecords = Ab.grid.SelectValue.prototype.displaySelectValueRecords;

			Ext.override(Ab.grid.SelectValue,{
				displaySelectValueRecords: function(convertedFilterValues) {
					// get the primary keys
					var tableName = this.viewDef.tableName;
					var result = BRG.Common.getDataRecords('afm_flds', ['field_name'], "table_name = '"+tableName+"' and primary_key <> 0", toJSON([{fieldName : "afm_flds.primary_key", sortOrder:1}]));
					if (result != undefined) {
						if (typeof this.sortColumns != 'object') {
							// sometimes sortColumns isn't initialized?
							this.sortColumns = [];
						}

						var sortColumnLength = this.sortColumns.length;

						for (var i = 0; i < result.length; i++) {
							// add to sortColumns if it doesn't already exist.
							var keyFieldName = tableName+"."+result[i]["afm_flds.field_name"];
							var sortExists = false;

							for (var j = 0; j < sortColumnLength; j++) {
								if (this.sortColumns[j].fieldName == keyFieldName) {
									sortExists = true;
									break;
								}
							}

							if (!sortExists) {
								this.sortColumns.push({'fieldName':keyFieldName,'ascending':asc});
							}
						}

						this.sortColumnOrder = true;
					}

					originaldisplaySelectValueRecords.apply(this, arguments);
				}
			});

			this.overrideSelectValueSort = true;
		}
	}
};


// Overrides the default selectValues to attach the field listener. (Only override once)
BRG.afterSelectNamedSeqSet = BRG.afterSelectNamedSeqSet ? BRG.afterSelectNamedSeqSet : false;

(function() {
	if (!BRG.afterSelectNamedSeqSet) {
		var originalSaveSelected = Ab.grid.SelectValue.prototype.saveSelected;

		Ext.override(Ab.grid.SelectValue,{
			saveSelected: function() {
				originalSaveSelected.apply(this, arguments);
				BRG.UI.afterSelectValueSequence();
			}
		});

		// Pre 19.3 grid.
		if (typeof(afterSelectValue) != 'undefined') {
			afterSelectValue = afterSelectValue.createSequence(BRG.UI.afterSelectValueSequence);
		}
		if (typeof(afterSelectValueTree) != 'undefined') {
			afterSelectValueTree = afterSelectValueTree.createSequence(BRG.UI.afterSelectValueSequence);
		}

		BRG.afterSelectNamedSeqSet = true;
	}
})();

/*
Ab.tree.SelectValueTree = Ab.tree.SelectValueTree.extend({
	constructor: function(dialog) {
		this.inherit(dialog);
	},

	saveSelected : function(row) {
		this.inherit(row);
		BRG.UI.afterSelectValueSequence();
	}
});
*/