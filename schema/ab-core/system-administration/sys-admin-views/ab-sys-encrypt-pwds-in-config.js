
var encryptPasswords = View.createController('encryptPasswords', {

	encryptPasswordsForm_onEncryptPasswords: function() {
	    var result = SecurityService.encryptPasswordsInConfigurationFiles({
	        callback: function(result){
	            Ab.view.View.showMessage(result);
	        },
	        errorHandler: function(m, e){
	            Ab.view.View.showException(e);
	        }
	    });
	}
});
