// -------------------------------------------------------------------------------------------------
// This function is called automatically when the form is loaded into the browser.
// It sets the checked state of the radio button that matches the current project type.
//
function afterInitialDataFetch() {
    // get the current project type value
	var form = View.panels.get('formPanelRadioButtons_form');
    var project_type = form.getFieldValue("project.project_type");

    // get a list of radio buttons
    var radioButtons = document.getElementsByName("formPanelRadioButtons_projectTypes");

    // set the checked state of the radio button that matches the current project type
    for (var i=0; i<radioButtons.length; i++){
	    if (project_type == radioButtons[i].value) {
		    radioButtons[i].checked=1; 
            break;
	    }
    }
}

// -------------------------------------------------------------------------------------------------
// This function is called when the user clicks on any radio button.
// It sets the value of the hidden form field.
//
function set_project_type(value) {
	var form = View.panels.get('formPanelRadioButtons_form');
    form.setFieldValue('project.project_type', value);
}
