
View.createController('locationFilters', {
	
	/**
     * Select the filters currently enabled in the database.
     */
    afterInitialDataFetch: function() {
    	var record = this.locationFiltersForm.getRecord();
    	var selectedFilters = record.getValue("afm_activity_params.param_value");
    	
    	var checkBoxes = document.getElementsByName('locationFiltersForm_locationFiltersCheckbox');
    	for (var i = 0; i < checkBoxes.length; ++i) {
    		if (selectedFilters.indexOf(checkBoxes[i].value) != -1) {
    			checkBoxes[i].checked = true;
    		}
    	}
    },
	
	/**
     * Saves the selected location filters to the database.
     */
    locationFiltersForm_onSaveFilters: function() {
    	var selectedFilters = this.locationFiltersForm.getCheckboxValues('locationFiltersCheckbox');
    	this.locationFiltersForm.setFieldValue("afm_activity_params.param_value", "" + selectedFilters);
        this.locationFiltersForm.save();
    }

});
