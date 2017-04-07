var abPropertiesDefineForm_ownershipTransactionController = View.createController('abPropertiesDefineForm_ownershipTransactionController', {
	callbackMethod: null,
	
	afterInitialDataFetch: function() {
		if (valueExists(this.view.parameters) && valueExists(this.view.parameters.callbackMethod)){
			this.callbackMethod = this.view.parameters.callbackMethod;
		}
	},
	
	abPropertiesDefineForm_ownershipTransaction_onDelete: function () {
		var form = this.abPropertiesDefineForm_ownershipTransaction;
		var dataSource = form.getDataSource();
		var record = form.record;
		
		View.confirm(getMessage('confirmDelete'), function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    callCallbackMethod();
                    View.closeThisDialog();
                } catch (e) {
                    var message = String.format(getMessage('errorDelete'));
                    View.showMessage('error', message, e.message, e.data);
                }
            }
        });
	}
});

function callCallbackMethod() {
	var controller = View.controllers.get('abPropertiesDefineForm_ownershipTransactionController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
	return true;
}
