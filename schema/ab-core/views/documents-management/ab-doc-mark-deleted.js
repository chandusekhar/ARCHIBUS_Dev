/********************************************
 * created for Yalta 5
 * S. Meyer
 * 10-15-2007
 *
 ********************************************/

var controller = View.createController('deleteController', {

    afterViewLoad: function() {
        this.inherit();
        
    	setManagerVarsFromOpener();
    
    	var warningElement = document.getElementById('delete_warning');
    	var warningMessage = getMessage('document_delete_warning_message');
    	warningElement.innerHTML = warningMessage;
    }
});

