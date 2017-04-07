/* *****************************************************************************
Script to run though all elements for all forms on the page.  Finds name of element
and values and creates the following XML data:  (note the difference between text boxes, 
radio/checkboxes and select drop downs.

<uc-auditFields>
	<element>
		<name>My Text Area Field</name>
		<value>the value of my text area</value>
	</element>
	<element>
		<name>My Checkbox</name>
		<value>Red</value>
		<selected>false</selected>
	</element>
	element>
		<name>Drop Down ListBox</name>
		<value>Item 3|Item 5</value>
	</element>
</uc-auditFields>

Corey Kaye
2009-06-06
****************************************************************************** */

var uc_auditFields_str = "";

	
function uc_captureDOMelements() {
	uc_auditFields_str = "<uc-auditFields>\n";
	for (var f=0; f<document.forms.length; f++) {
		uc_captureForm(document.forms[f]);
	}
	uc_auditFields_str += "</uc-auditFields>";
	
	return uc_auditFields_str;
}

function uc_captureForm(theForm) {
	for (var i=0; i<theForm.length; i++) {
		var theElement = theForm.elements[i];
		var element_type = theElement.type;
		var element_name = theElement.name;
		var element_value = theElement.value;
		var selected_values = "";
		var checkThis = false;
		
// Check Text boxes and textareas
		if ((element_type == "text") || (element_type == "textarea")) {
			if (element_value.length == 0) {
				element_value = "NULL";
			}
//			uc_auditFields_str += "<element><type>" + element_type + "</type><name>" + element_name + "</name><value>" + element_value + "</value></element>\n\n";
			uc_auditFields_str += "<element><name>" + element_name + "</name><value>" + element_value + "</value></element>\n\n";
		}

// Check Radio buttons and check boxes
		if ((element_type == "radio") || (element_type == "checkbox")) {
//			uc_auditFields_str += "<element><type>" + element_type + "</type><name>" + element_name + "</name><value>" + element_value + "</value><selected>"+ theElement.checked + "</selected></element>\n\n";
			uc_auditFields_str += "<element><name>" + element_name + "</name><value>" + element_value + "</value><selected>"+ theElement.checked + "</selected></element>\n\n";
		}

		
		
// Check Drop-Down lists ...
		if (element_type.indexOf("select") > -1) {
			selected_values = "";
			for (var dd = 0; dd < theElement.options.length; dd++) {
				if (theElement.options[dd].selected) {
					if (selected_values != "") {
						selected_values += "|";
					}
					selected_values += theElement.options[dd].value;
				}
			}
//			uc_auditFields_str += "<element><type>" + element_type + "</type><name>" + element_name + "</name><value>" + selected_values + "</value></element>\n\n";
			uc_auditFields_str += "<element><name>" + element_name + "</name><value>" + selected_values + "</value></element>\n\n";
		}
		
		
 	// .... End of loop through form elements ....
	}
 }
 