/**
 * Controller for the Select Value configuration example (ab-ex-form-panel-select-value-configured.axvw).
 */
var abTestSelectValueCtrl = View.createController('abTestSelectValueCtrl', {

	rmFilterPanel_onSearch: function(){
		var restriction = "";
		var console = this.rmFilterPanel;
		restriction = console.getFieldRestriction();
		
		// apply restriction to the grid
		var grid = this.rmDetailPanel;
		grid.refresh(restriction);
		// show the grid
		grid.show(true);
	},
	
	rmFilterPanel_onSelectFloor: function() {
		var restriction = this.rmFilterPanel.getFieldRestriction();

		View.selectValue({
	    	formId: 'rmFilterPanel',
	    	title: 'Select Floor',
	    	fieldNames: ['bl.site_id','rm.bl_id','rm.fl_id'],
	    	selectTableName: 'fl',
	    	selectFieldNames: ['bl.site_id','fl.bl_id','fl.fl_id'],
	    	visibleFields: [
				{fieldName: 'bl.site_id', title: getMessage('titleBldgSite')},
				{fieldName: 'fl.bl_id', title: getMessage('titleBldgName')},
				{fieldName: 'fl.fl_id', title: getMessage('titleFloorId')},
				{fieldName: 'fl.name', title: getMessage('titleFloorName')}
			],
	    	sortFields: [
    			{fieldName: 'bl.site_id', sortAscending: true},
				{fieldName: 'fl.bl_id', sortAscending: true},
				{fieldName: 'fl.name', sortAscending: true}
			],
	    	restriction: restriction,
	    	showIndex: false,
	    	applyVpaRestrictions: false,
	    	selectValueType: 'multiple'
		});
	}
});

/**
 * Called by the custom Select Value dialog command before the dialog opens.
 * Can override the command parameters.
 */
function beforeSelectRoom(command) {
    command.dialogRestriction = "rm.rm_std = 'OFF-A'";
}

/**
 * Called by the custom Select Value dialog after the value is selected,
 * but before it is saved to the form field.
 * The function can return false to prevent the value from being selected.
 */
function afterSelectRoom(fieldName, selectedValue, previousValue) {
    // alert(fieldName + ": " + previousValue + " --> " + selectedValue);
    // OK to copy the selected value to the form field
    return true;
}