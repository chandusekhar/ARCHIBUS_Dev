
View.createController('sqlSecurity', {

    username: '',
    userId: '',
	password: '',
    
    afterViewLoad: function() {
        $('instructions').innerHTML = getMessage('instructionText');
    },

    afterInitialDataFetch: function() {
		var record = this.sqlSecurityForm.getRecord();
        this.username = record.getValue('afm_users.user_name');

        // map the ENTER key for the window to the change password event handler
        new Ext.KeyMap(document, {
            key: 13, // or Ext.EventObject.ENTER
            fn: this.sqlSecurityForm_onChange,
            scope: this
        });
    },
    
    sqlSecurityForm_onCancel: function(){
        View.closeThisDialog();
    },
    
    sqlSecurityForm_onChange: function(){
		var record = this.sqlSecurityForm.getRecord();
        this.userId = record.getValue('afm_users.sql_uid');
        this.password = record.getValue('afm_users.sql_pwd');

        this.saveChanges();
    },
	

	/**
	 * Saves password to the database.
	 */
	saveChanges: function() {
        var controller = this;
        SecurityService.changeSqlSecurityForUserAccount(
		    doSecure(controller.username), 
		    doSecure(controller.userId), 
			doSecure(controller.password), 
			View.project.name, 
			{
            callback: function() {
		        View.closeThisDialog();
            },
            errorHandler: function(m, e) {
                View.showMessage('error', getMessage('changeSqlSecurityError'), e.message, e.data);
            }
        });
	}
});
