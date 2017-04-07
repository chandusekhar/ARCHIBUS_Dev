
var changePasswordController = View.createController('ab-change-password', {

    username: null,
    projectId: null,
    
    isPwdUpperCase: false,
    
    // callback function that will be called after password is changed
    afterPasswordChanged: function(username, newPassword, projectId){
        // default implementation: close this dialog
        View.closeThisDialog();
    },
    
    afterInitialDataFetch: function(){
        // focus on the Old Password intially
        Ext.get('oldPassword').focus();
    
        // map the ENTER key for the window to the change password event handler
        new Ext.KeyMap(document, {
            key: 13, // or Ext.EventObject.ENTER
            fn: this.changePasswordForm_onChange,
            scope: this
        });
    },
    
    afterViewLoad: function() {
    	var openerView = View.getOpenerView();
    	if(openerView){
    		var preferencesFormPanel = openerView.panels.get('preferencesForm');
    		if(preferencesFormPanel){
    			var user_pwd_field = preferencesFormPanel.getDataSource().fieldDefs.get("afm_users.user_pwd");
    			if(user_pwd_field){
    				this.isPwdUpperCase = user_pwd_field.isUpperCase();	
    			}
    			
    		}
    	}
    },
    
    changePasswordForm_onCancel: function(){
        View.closeThisDialog();
    },
    
    changePasswordForm_onChange: function(){
        var oldPassword = $('oldPassword').value;
        var newPassword = $('newPassword').value;
        var newPasswordConfirm = $('newPasswordConfirm').value;
        
        if(this.isPwdUpperCase){
        	if(valueExistsNotEmpty(oldPassword)){
        		oldPassword = oldPassword.toUpperCase();
        	}
        	if(valueExistsNotEmpty(newPassword)){
        		newPassword = newPassword.toUpperCase();
        	}
        	if(valueExistsNotEmpty(newPasswordConfirm)){
        		newPasswordConfirm = newPasswordConfirm.toUpperCase();
        	}
        }
        
        // verify that new password is different from the old one
        if (newPassword == oldPassword) {
            // display error message to the user
            var message = getMessage('newPasswordSameAsOld');
            View.showMessage('error', message);
            
            // clear new password controls
            $('newPassword').value = '';
            $('newPasswordConfirm').value = '';
            
            return;
        }
        
        // verify that both new passwords match
        if (newPassword != newPasswordConfirm) {
            // display error message to the user
            var message = getMessage('newPasswordsNoMatch');
            View.showMessage('error', message);
            
            // clear new password controls
            $('newPassword').value = '';
            $('newPasswordConfirm').value = '';
            
            return;
        }
        
        this.changePassword(oldPassword, newPassword);
    },
    
    changePassword: function(oldPassword, newPassword){
        var controller = this;
        SecurityService.changePassword(doSecure(this.username), doSecure(oldPassword), doSecure(newPassword), this.projectId, {
            callback: function(){
                // call the callback
                controller.afterPasswordChanged(controller.username, newPassword, controller.projectId);
            },
            errorHandler: function(m, e){
                // show error message
                View.showException(e);
            }
        });
    }
});
