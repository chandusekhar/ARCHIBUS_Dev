var controller = View.createController('formPanelInputValuesController', {
	
	afterInitialDataFetch: function() {	
    	this.formPanelInputValues_form2.clear();
    	
    	this.formPanelInputValues_form1.addActionListener('copy', this.formPanelInputValues_form1_copy, this);
    	this.formPanelInputValues_form2.addActionListener('clear', this.formPanelInputValues_form2_clear, this);
    },
    
    formPanelInputValues_form1_copy: function() {		
		// getFieldValue() converts localized date/time values into neutral format
		this.wr_id = this.formPanelInputValues_form1.getFieldValue('wr.wr_id');
	    this.date_requested = this.formPanelInputValues_form1.getFieldValue('wr.date_requested');
	    this.time_requested = this.formPanelInputValues_form1.getFieldValue('wr.time_requested');
	    this.description = this.formPanelInputValues_form1.getFieldValue('wr.description');
	    
	    // copy values: form will format date/time values
	    this.formPanelInputValues_form2.setFieldValue('wr.wr_id', this.wr_id);
	    this.formPanelInputValues_form2.setFieldValue('wr.date_requested.copy', this.date_requested);
        // use setInputValue() for time values
	    this.formPanelInputValues_form2.setInputValue('wr.time_requested.copy', this.time_requested);
	    this.formPanelInputValues_form2.setFieldValue('wr.description.copy', this.description)
	},
	
	formPanelInputValues_form2_clear: function() {
		this.formPanelInputValues_form2.clear();
	}
    
});