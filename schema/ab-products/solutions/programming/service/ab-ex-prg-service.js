
View.createController('exService', {
	
	exService_onCallServiceOld: function() {
	    AdminService.getUser({
	        callback: function(userVO){
	            Ab.view.View.showMessage('message', userVO);
	        },
	        errorHandler: function(m, e){
	            Ab.view.View.showException(e);
	        }
	    });
	},
	
	exService_onCallServiceNew: function() {
		var user = this.callService('AdminService', 'getUser');
	    View.showMessage('message', user);
	},
	
	callService: function(serviceId, methodName) {
		var service = window[serviceId];
		var method = service[methodName];
		var result = null;

		method({
	        callback: function(serviceResult){
	        	result = serviceResult;
	        },
	        errorHandler: function(m, e){
	            Workflow.handleError(e);
	        },
            async: false
	    });
		
		return result;
	}
});