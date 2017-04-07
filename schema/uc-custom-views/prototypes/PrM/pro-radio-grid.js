// uc-radio-grid.js
//
// Functions for handling of the creation and processing of a custom
// grid of radio buttons.

// Set up a UC javascript namespace
var UC = UC ? UC : new Object();

// Set up a UC.UI namespace
UC.UI = UC.UI ? UC.UI : new Object();


////////////////////////////////////////////////////////////////////////////////
// The Radio Grid component
////////////////////////////////////////////////////////////////////////////////
UC.UI.RadioGrid = Base.extend({
	id: null,
	name: null,
	configObject: null,
	
	form: null,
	categoryIds: null,
	optionValues: null,
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Constructor
	// 
	// Parameters:
	// id						The id of the grid.
	////////////////////////////////////////////////////////////////////////////////
	constructor: function(id, configObject) {
		this.id = id;
		this.name = id;
		this.configObject = configObject;
		
		this.categoryIds = configObject.categoryIds;
		this.optionValues = configObject.optionValues;
	},

	////////////////////////////////////////////////////////////////////////////////
	// Returns an array of all radio button selections and it's selected value.
	// 
	// Parameters:
	// 
	// Returns a named array of all the button selections and their checked value.
	////////////////////////////////////////////////////////////////////////////////
	getSelectedOptions: function() {
		this.form = document.getElementsByName(this.categoryIds[0])[0].form;
		
		var checkedValues = new Object();

		// loop through each category to find the checked value
		for (var i = 0; i < this.categoryIds.length; i++ ) {
			var nodeName = this.categoryIds[i];
			var nodeList = this.form.elements[nodeName];
			// find the value that is checked.
			for (var j = 0; j < nodeList.length; j++ ) {
				if (nodeList[j].checked) {
					checkedValues[nodeName] = nodeList[j].value;
					break;
				}
			}
		}
		
		return checkedValues;
	},
	
	////////////////////////////////////////////////////////////////////////////////
	// Sets the selected option in the radio button grid from the supplied
	// array.  If the array does not contain a group in the radio button grid,
	// or if the selected value is not a valid selection, the defaultValue 
	// will be used.
	// 
	// Parameters:
	// checkedValues		Object array of the selected values.
	// defaultValue			The default value to set.
	////////////////////////////////////////////////////////////////////////////////
	setSelectedOptions: function(checkedValues, defaultValue) {
		this.form = document.getElementsByName(this.categoryIds[0])[0].form;
		
		// loop through each category to find the checked value
		for (var i = 0; i < this.categoryIds.length; i++ ) {
			var nodeName = this.categoryIds[i];
			var nodeList = this.form.elements[nodeName];
			// find the value that is checked.
			for (var j = 0; j < nodeList.length; j++ ) {
				// found default, select (but continue trying to find the selected)
				if (nodeList[j].value == defaultValue) {
					nodeList[j].checked = true;
				}
				// set checked and continue to next category/group
				if (nodeList[j].value == checkedValues[nodeName]) {
					nodeList[j].checked = true;
					break;
				}
			}
		}
		return checkedValues;
	}
});
