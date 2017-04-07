// ab-reg-authority-edit.js
// Handle initilization for ab-reg-authority-edit.axvw

// setupPage() is called from body.onLoad() event
function setupPage()
{
	//set up warning_message
	var warning_message_object = document.getElementById("general_warning_message_empty_required_fields");
	if(warning_message_object!=null)
		warning_message = warning_message_object.innerHTML;
	//set up warning_message
	var delete_warning_message_object = document.getElementById("general_delete_warning_message_empty_required_fields");
	if(delete_warning_message_object!=null)
		delete_warning_message = delete_warning_message_object.innerHTML;
		
	// See if we have to react to AddNew action
	if (!bAddNew) return;
	
	// Get our form
	var objForm = document.forms[0];
	if (typeof objForm == 'undefined' || !objForm) return;
	
	// Get our field
	var listOptions = objForm.elements['contact.contact_type'];
	if (typeof listOptions == 'undefined' || !listOptions) return;
	
	// Select the default value for contact_type
	var nCount = listOptions.options.length;
	for (var nIdx = 0; nIdx < nCount; nIdx++)
	{
	  if (listOptions.options[nIdx].value == 'REGULATION AUTH.')
	  {
	    listOptions.selectedIndex = nIdx;
	    break;
	  }
	}
}
