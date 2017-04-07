
/**
 * Controller for the Manage User Passwords task view.
 */
View.createController('reissuePasswords', {
    
    // reference to the managePasswords controller
    manageController: null,

    afterInitialDataFetch: function() {
        this.manageController = View.controllers.get('managePasswords');
		this.selectConsole_onFilter();
	},
	
	selectConsole_onFilter: function() {
        var restriction = this.selectConsole.getFieldRestriction(true);
        if ($('showGuest').checked) {
            
        } else {
            restriction.addClause('afm_users.user_name', 'GUEST', '!=');
        }
        this.selectGrid.refresh(restriction);
	},
    
    selectConsole_onClear: function() {
    	
    	this.selectConsole.setFieldValue("afm_users.role_name", '');
    	$('showGuest').checked = false;
    		
        this.selectGrid.restriction = null;
        this.selectGrid.refresh();
    },
    
    selectGrid_onNext: function() {
        // display only selected user accounts in the second tab
        var selectedRows = this.selectGrid.getSelectedGridRows();
        var restriction = this.createRestrictionForSelectedUsers(selectedRows);
        this.manageGrid.refresh(restriction);
        this.tabs.selectTab('manage');
    },
	
	manageGrid_onBack: function() {
		this.tabs.selectTab('select');
	},
    
    manageGrid_onResetPasswords: function() {
        var selectedRows = this.manageGrid.gridRows.getRange();
        
        var controller = this;
        View.prompt(getMessage('resetConfirm'), getMessage('resetPrompt'), function(button, keyPhrase) {
            if (button == 'ok') {
                try {
                    // call WFR to migrate selected accounts
                    controller.resetPasswords(keyPhrase, selectedRows);
                    
                    // display result message
                    View.showMessage(getMessage('resetFinish'));
					
					// refresh the grid to display new passwords
                    controller.manageGrid.refresh();                  
                    controller.selectGrid.refresh();                    
                    
                } catch (e) {
                    View.showMessage('error', getMessage('resetError'), e.message, e.data);
                    controller.selectGrid.refresh();                    
                    controller.selectGrid.refresh();                    
                }
            }
        });
    },

    manageGrid_onSendPasswords: function() {
        var selectedRows = this.manageGrid.gridRows.getRange();
        
        var controller = this;
        View.confirm(getMessage('sendConfirm'), function(button) {
            if (button == 'yes') {
                try {
                    // call WFR to migrate selected accounts
                    controller.sendPasswords(selectedRows);
                    
                    // display result message
                    View.showMessage(getMessage('sendFinish'));
                    
                    // refresh the grid to display new passwords
                    controller.manageGrid.refresh();                  
                    controller.selectGrid.refresh();                    
                    
                } catch (e) {
                    View.showMessage('error', getMessage('sendError'), e.message, e.data);
                    controller.manageGrid.refresh();                    
                    controller.selectGrid.refresh();                    
                }
            }
        });
    },
	    
    manageGrid_onEncryptPasswords: function() {
        var selectedRows = this.manageGrid.gridRows.getRange();
        
        var controller = this;
        View.confirm(getMessage('encryptConfirm'), function(button) {
            if (button == 'yes') {
                try {
                    // call WFR to migrate selected accounts
                    controller.encryptPasswords(selectedRows);
                    
                    // display result message
                    View.showMessage(getMessage('encryptFinish'));
                    
                    // refresh the grid to display new passwords
                    controller.manageGrid.refresh();                  
                    controller.selectGrid.refresh();                    
                    
                } catch (e) {
                    View.showMessage('error', getMessage('encryptError'), e.message, e.data);
                    controller.manageGrid.refresh();                    
                    controller.selectGrid.refresh();                    
                }
            }
        });
    },
        
    // ----------------------- helper methods -----------------------------------------------------
    
    resetPasswords: function(keyPhrase, selectedRows) {
        var restriction = this.createRestrictionForSelectedUsers(selectedRows);
        Workflow.call('AbSystemAdministration-resetPasswords', {
			keyPhrase: keyPhrase,
            restriction: toJSON(restriction)
        });
    },
    
    sendPasswords: function(selectedRows) {
        var restriction = this.createRestrictionForSelectedUsers(selectedRows);
		Workflow.call('AbSystemAdministration-sendTemporaryPasswords', {
            restriction: toJSON(restriction)
        });
    },
    
    encryptPasswords: function(selectedRows) {
        var restriction = this.createRestrictionForSelectedUsers(selectedRows);
        Workflow.call('AbSystemAdministration-encryptPasswords', {
            restriction: toJSON(restriction)
        });
    },
    
    createRestrictionForSelectedUsers: function(selectedRows) {
        var restriction = new Ab.view.Restriction();
        for (var i = 0; i < selectedRows.length; i++) {
            var record = selectedRows[i].getRecord();
            var username = record.getValue('afm_users.user_name');
            var clause = new Ab.view.RestrictionClause('afm_users.user_name', username, '=', 'OR');
            restriction.clauses.push(clause);
        }
        return restriction;
    }
});
