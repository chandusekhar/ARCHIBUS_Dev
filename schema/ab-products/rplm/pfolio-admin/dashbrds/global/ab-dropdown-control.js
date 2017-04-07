Ab.namespace('dropdown');
/**********************************************************************
 * 
 * Dropdown Controller for Partners HealthCare RSMG Project
 * Author: Mike Garabedian
 * Date:  5/10/2010
 * Version: 2.0
 * Revision: 03.31
 * 
 * This control will allow users to add dropdowns to any view.
 * The current version requires System Integrators to manually place a select box on the form.
 * The select will be empty, and must include an id which should be
 * recognizable as a pointer back to the actual database field if possible.
 * The user should also add an event handler onchange to point to one of the onchange
 * handlers in this class. (TODO create specs for various onchange handlers)
 * 
 * The System Integrator when calling the dropdown control, will pass the following
 * parameters:
 * 	
 * 	 selectObj: The dropdown object to populate from the form
 *   idField: (string) The table.field name for the database field that will be used to populate the value to store in the database.
 *   nameField: (string) Shows the display value corresponding to the id field (may also be the same as the id field)
 *   
 *  
 * 
 * Revision Notes: Removed the records object from the constructor, and put it back into the populate method.
 * 		This allows the user to create separate dropdown controls onload so refreshing only requires a new record set.
 * 
 **********************************************************************/
Ab.dropdown.control = Base.extend({
	firstOptionEmpty: true,
	recordObj: null,
	selectObj: null,
	idString: null,
	nameString: null,
	
	constructor: function(selectObj, idString, nameString, firstOptionEmpty){
		if (firstOptionEmpty == false || firstOptionEmpty == 'false' ){
			this.firstOptionEmpty = false;
		}		
		this.selectObj = selectObj;
		this.idString = idString;
		// if nameString is not provided, use the idString for both value and display
		if (nameString == undefined || nameString == ''){
			this.nameString = this.idString;
		}
		else
			this.nameString = nameString;
		
	},

	/** 
	* Create Dropdown List Data 
	* @param records: records retrieved from datasource 
	* @param firstOptionText: if firstOptionEmpty=true, this allows alternate text e.g. <select a category> 	
	**/
	populateDropDownList: function(records, firstOptionText, enumValues){
		
		// Create an empty option as a default value in select list
		if (this.firstOptionEmpty){
			var option = document.createElement('option');			
			option.value = '';
			// if user chooses alternate text for empty value use that, otherwise use a blank space
			firstOptionText = (firstOptionText == null) ? ' ' : firstOptionText;
			option.appendChild(document.createTextNode(firstOptionText));
			this.selectObj.appendChild(option);
		}
		
		
		for (var i = 0; i < records.length; i++) {
	        var orgId = records[i].values[this.idString];
	        var orgName = records[i].values[this.nameString];
	        if (valueExists(enumValues)) {
	        	orgName = enumValues[orgId];
	        }
	        var option = document.createElement('option');
	        option.value = orgId;
	        option.appendChild(document.createTextNode(orgName));
	        this.selectObj.appendChild(option);
		}
				
	},
	
	
	/** Create Dropdown List Data 
	@param recordObj: records retrieved from retrieveDbRecords List <Map<k,v>>
	@param selectId: ID value of the select list to be populated
	**/
	populateDropDownListFromMap: function(recordObj, selectObj, idString, nameString, removeBlankFirstOption){
		// Create an empty option as a default value in select list
		if (this.firstOptionEmpty && !removeBlankFirstOption){
			var option = document.createElement('option');
			option.value = '';
			option.appendChild(document.createTextNode(' '));
			selectObj.appendChild(option);
		}
		if (idString == undefined || idString == '' ){
			idString = this.getIdString(selectObj.name);
			nameString= this.getNameString(selectObj.name);
		}
		else if (nameString == undefined || nameString == ''){
			nameString = idString;
		}
		
		for (var i = 0; i < recordObj.records.length; i++) {
	        var values = recordObj.records[i]; 
			var orgId = values[idString];
	        var orgName = values[nameString];
	        var option = document.createElement('option');
	        option.value = orgId;
	        option.appendChild(document.createTextNode(orgName));
	        selectObj.appendChild(option);
		}
	}
	
});

