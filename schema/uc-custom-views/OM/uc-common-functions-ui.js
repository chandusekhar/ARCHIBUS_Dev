// Set up a UC javascript namespace
var UC = UC ? UC : new Object();

UC.UI = {
	////////////////////////////////////////////////////////////////////////////////
	// Restrict a drop down (select) box to a specific range of Option values.
	// 
	// Parameters:
	// selectBox    The option box element.
	// startOption  The first option value to show (inclusive).
	// endOption    The last option value to show (inclusive).
	////////////////////////////////////////////////////////////////////////////////
	restrictDropDown: function(selectBox, startOption, endOption)
	{
		var inRange = false;
		var checkOption = endOption;
		
		if (selectBox == null || typeof(selectBox) == 'undefined') {
			return;
		}
		
		// loop through all the options, removing the ones that not within range.
		// Note: the loop is backwards because the options array is re-numbered when
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
	// Remove a specific Option from a drop down (select) box.
	// 
	// Parameters:
	// selectBox    The option box element.
	// removeOption The option to remove.
	////////////////////////////////////////////////////////////////////////////////
	removeOption: function(selectBox, removeOption)
	{
		var removed = false;
		
		if (selectBox == null || typeof(selectBox) == 'undefined') {
			return removed;
		}
		
		// loop through all the options, removing the one equal to the removeOption.
		for (var i=(selectBox.options.length-1); i >= 0; i--) {
			if (selectBox.options[i].value == removeOption) {
					selectBox.remove(i);
					removed = true;
					return removed;
			}
		}
		
		return removed;
	},

	////////////////////////////////////////////////////////////////////////////////
	// Fills the given select option box with the values in the enum list, you can
	// optionally restrict it to a specific range of enum values.
	// 
	// Parameters:
	// selectBox    The option box element.
	// enumList     The enumList from Archibus in the value;display pairs all separated by semi-colons.
	// startEnum    The first enum value to show (inclusive).  This value is enum and not the display value.
	// endEnum      The last enum value to show (inclusive).  This value is enum and not the display value.
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
	
	////////////////////////////////////////////////////////////////////////////////
	// Add an option to select box
	//
	// Parameters:
	// selectBox    The option box element to add the blank option to.
	// value        The value of the option.
	// text         The display text of the option.
	// index        (optional) The index to insert the option to.  Defaults to
	//              end of the select box.
	//
	// Remarks: For inserting a blank select option.
	//          addSelectOption(selectBox, '', '', 0);
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
	}
};

