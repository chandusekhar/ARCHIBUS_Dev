function user_form_onload() {
	var formPanel = Ab.view.View.getControl('', 'email_form');
	
    formPanel.setFieldValue('subject', getMessage('messageLinkTo') + ': ' + parent.Ab.view.View.title);
	//formPanel.setFieldValue('message', parent.Ab.view.View.viewName);
	formPanel.setFieldValue('message', parent.Ab.view.View.originalRequestURL);
}

function sendEmail() {
    var formPanel = Ab.view.View.getControl('', 'email_form');
	// validate required fields
	formPanel.clearValidationResult();
	var validRes = formPanel.validateFields();

    var to = formPanel.getFieldValue('to');
    if (to == '') {
        formPanel.getFieldElement('to').focus();    
        return;
    }
    to = to + '?';
    
    var cc = formPanel.getFieldValue('cc');
    if (cc != '') {
        cc = "cc=" + cc + "&";
    }
        
    var subject = formPanel.getFieldValue('subject');
    subject = encodeURIComponent(subject);
    subject = "subject=" + subject;
    
    var body = formPanel.getFieldValue('message');
    body = encodeURIComponent(body);
    body = "&body=" + body;
    
    var action = "MAILTO:" + to + cc + subject + body;
    
    alert(action);

    var form = document.forms['hidden_email_form'];

	// IE has trouble getting the right form. For some reason there are duplicate 'hidden_email_form' forms and getting by name gets a form with no method
	if (form == null || form.method == null) {
//
//alert('document has ' + document.forms.length + 'forms.');
//for (var j=0, documentForm; documentForm = document.forms[j]; j++) {
//alert('document form ' + j + ' has the name <' + documentForm.name + '> and the method <' + documentForm.method + '>');
//}
		for (var i=0, docForm; docForm = document.forms[i]; i++) {
			if (docForm.name == 'hidden_email_form') {
				form = docForm;
				break;
			}
		}
	}

    form.action = action;

    form.submit();   
  	parent.Ab.view.View.closeDialog();
}

