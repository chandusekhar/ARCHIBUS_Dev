
/**
 * Example form controller class. Shows how to change field labels from JS code. 
 */
var formController = View.createController('simpleForm', {
    
    /**
     * This function is called then the view is loaded.
     */
    afterInitialDataFetch: function() {
	    // get the label cell TD element
        var labelElement = this.prgFormSetLabel_form1.getFieldLabelElement('em.em_std');
        alert(labelElement.innerHTML);
        
        // replace the lebl text in both form panels
	    this.prgFormSetLabel_form1.setFieldLabel('em.em_std', '<b>Standard</b>');
	    this.prgFormSetLabel_form2.setFieldLabel('em.em_std', '<b>Standard</b>');
    }
});