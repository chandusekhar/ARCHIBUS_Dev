// -------------------------------------------------------------------------------------------------
// This function is called when the user clicks on any radio button.
// It sets the value of the hidden form field.
// Uses: get_check_value()



function set_project_type(value) {
    //alert(document.getElementsByName("abated_check").checked);
    document.getElementById('fhbm_form_fhbm.abated').value = get_check_value();

}

//--------------------------------------------------------------------------------------------------
// this fucntion checks the value of the checkbox (checked or unchecked)
// and returns the value
//
function get_check_value()
{
//changes the hidden abated field to YES or NO based on the check value
	var c_value = "";
	var checkButton = document.getElementsByName("abated_check");
	
	for (var i=0; i < checkButton.length; i++) {
		if (checkButton[i].checked) {
			c_value = 'YES';			
		}	
		else {
			c_value = 'NO';
		}
	}

	return(c_value);
}

/*
function user_form_onload(){
    // get the current project type value
    var abated = document.getElementById("fhbm_form_fhbm.abated").value;
    // get a list of radio buttons
    var checkButton = document.getElementsByName("abated_check");
    alert(abated);
    if (abated == 'YES') {
	    for (var i=0; i < checkButton.length; i++) {
    		checkButton[i].checked = true;
    		break;
    	    }
    }
}
*/