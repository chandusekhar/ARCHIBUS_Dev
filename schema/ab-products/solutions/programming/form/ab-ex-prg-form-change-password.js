
changePasswordController = View.createController('changePassword', {
	
	afterViewLoad: function() {
		this.inherit();
	},
	
	prgFormChangePassword_form_onChange: function() {
		var oldPassword = $('prgFormChangePassword_oldPassword').value;
        var newPassword = $('prgFormChangePassword_newPassword').value;
        var newPassword2 = $('prgFormChangePassword_newPassword2').value;
		
		var message = String.format('Old password = [{0}], new password = [{1}]', oldPassword, newPassword);
		View.showMessage(message);
	},
	
	prgFormChangePassword_form_onCancel: function() {
		View.closeThisDialog();
	}
});
