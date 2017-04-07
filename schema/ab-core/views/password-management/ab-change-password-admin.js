
View.createController('changePasswordAdmin', {

    username: '',
	oldPassword: '',
	newPassword: '',
    
    afterInitialDataFetch: function() {
        var record = this.changePasswordForm.getRecord();
        this.username = record.getValue('afm_users.user_name');
        this.oldPassword = record.getValue('afm_users.user_pwd');
		
        // map the ENTER key for the window to the change password event handler
        new Ext.KeyMap(document, {
            key: 13, // or Ext.EventObject.ENTER
            fn: this.changePasswordForm_onChange,
            scope: this
        });
    },
    
    changePasswordForm_onCancel: function(){
        View.closeThisDialog();
    },
    
    changePasswordForm_onChange: function(){
		var record = this.changePasswordForm.getRecord();
        this.newPassword = record.getValue('afm_users.user_pwd');
        this.savePassword();
    },
	
	afterPasswordChanged: function() {
        View.getOpenerView().panels.get('user').setFieldValue('afm_users.user_pwd', this.newPassword);

        if ($('sendEmail').checked) {
			try {
	            this.sendPassword();
	        } catch (e) {
	            View.showMessage('error', getMessage('sendPasswordError'), e.message, e.data);
				return;
	        }
        }
        
        View.closeThisDialog();
	},
	
	/**
	 * Saves password to the database.
	 */
	savePassword: function() {
        var controller = this;
        SecurityService.changePassword(
		    doSecure(controller.username), 
			doSecure(controller.oldPassword), 
			doSecure(controller.newPassword), 
			// user is authenticated, do not supply projectId
			null, 
			{
            callback: function() {
                controller.afterPasswordChanged();
            },
            errorHandler: function(m, e) {
                View.showException(e);
            }
        });
	},
	
	/**
	 * Sends new password to the user.
	 */
    sendPassword: function() {
        Workflow.call('AbSystemAdministration-sendNewPassword', {
            username: this.username,
			password: this.newPassword
        });
    }
});
