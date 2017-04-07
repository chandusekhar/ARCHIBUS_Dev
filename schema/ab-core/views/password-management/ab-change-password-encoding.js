
/**
 * Controller for the Change Password Encoding task view.
 */
View.createController('changePasswordEncoding', {
	
	// reference to the managePasswords controller
	manageController: null,
	
	afterViewLoad: function() {
		this.manageController = View.controllers.get('managePasswords');
		
		this.information.setInstructions(getMessage('instructions'));
	
	    // get and display current and migrate password encoder names and properties
	    var controller = this;	
		AdminService.getBeanConfig('passwordEncoder', ['useEncoding'], function(encoder) {
			controller.information.getFieldElement('currentEncoder').innerHTML = encoder.beanClass;
            controller.information.getFieldElement('currentUseEncoding').innerHTML = encoder.beanProperties.useEncoding;
		});
        AdminService.getBeanConfig('passwordEncoderMigrateTo', ['useEncoding'], function(encoder) {
            controller.information.getFieldElement('migrateEncoder').innerHTML = encoder.beanClass;
            controller.information.getFieldElement('migrateUseEncoding').innerHTML = encoder.beanProperties.useEncoding;
        });
    },
	
	afterInitialDataFetch: function() {
        this.selectConsole_onFilter();
	},
	
    selectConsole_onFilter: function() {
        var restriction = this.selectConsole.getFieldRestriction(true);
        this.selectGrid.refresh(restriction);
    },
    
    selectConsole_onClear: function() {
    	this.selectConsole.setFieldValue("afm_users.role_name", '');
        this.selectGrid.restriction = null;
        this.selectGrid.refresh();
    },
    
	selectGrid_onMigrate: function() {
		var selectedRows = this.selectGrid.getSelectedGridRows();
		
		var controller = this;
        var list = this.manageController.getSelectedUserPasswordList(selectedRows);
        var message = String.format(getMessage('migrateConfirm'), list);
		View.confirm(message, function(button) {
			if (button == 'yes') {
		        try {
		            // call WFR to migrate selected accounts
	                controller.migrateSelectedAccounts(selectedRows);
		            
		            // display result message
		            var message = String.format(getMessage('migrateFinish'), list);
		            View.showMessage(message);
		            View.log(message);
		            
		        } catch (e) {
		            View.showMessage('error', getMessage('migrateError'), e.message, e.data);
		        }
			}
		});
	},
	
	migrateSelectedAccounts: function(selectedRows) {
		var restriction = new Ab.view.Restriction();
        for (var i = 0; i < selectedRows.length; i++) {
            var record = selectedRows[i].getRecord();
            if (valueExists(record)) {
                var username = record.getValue('afm_users.user_name');
                var clause = new Ab.view.RestrictionClause('afm_users.user_name', username, '=', 'OR');
                restriction.clauses.push(clause);
            }
        }
		Workflow.call('AbSystemAdministration-encryptPasswords', {
			restriction: toJSON(restriction)
		});
	}
});
