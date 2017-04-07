View.createController('sqlSecurity', {

	roleId : '',
	userId : '',
	password : '',

	afterViewLoad : function() {
		$('instructions').innerHTML = getMessage('instructionText');
	},

	afterInitialDataFetch : function() {
		var record = this.sqlSecurityForm.getRecord();
		this.roleId = record.getValue('afm_roles.role_name');
		// map the ENTER key for the window to the change password event handler
		new Ext.KeyMap(document, {
			key : 13, // or Ext.EventObject.ENTER
			fn : this.sqlSecurityForm_onChange,
			scope : this
		});
	},

	sqlSecurityForm_onCancel : function() {
		View.closeThisDialog();
	},

	sqlSecurityForm_onChange : function() {
		var record = this.sqlSecurityForm.getRecord();
		this.userId = record.getValue('afm_roles.sql_uid');
		this.password = record.getValue('afm_roles.sql_pwd');

		this.saveChanges();
	},

	/**
	 * Saves password to the database.
	 */
	saveChanges : function() {
		var controller = this;
		SecurityService.changeSqlSecurityForUserRole(
				doSecure(controller.roleId), doSecure(controller.userId),
				doSecure(controller.password), {
					callback : function() {
						View.closeThisDialog();
					},
					errorHandler : function(m, e) {
						View.showMessage('error',
								getMessage('changeSqlSecurityError'),
								e.message, e.data);
					}
				});
	}
});
