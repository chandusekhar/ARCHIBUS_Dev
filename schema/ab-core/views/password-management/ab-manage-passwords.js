
/**
 * Controller that handle common password management tasks.
 */
View.createController('managePasswords', {
	
    // how many user accounts are selected    
    selectedRows: 0,
    
    selectGrid_afterRefresh: function() {
        this.initState();
    },
    
    selectGrid_onMultipleSelectionChange: function(row) {
        var gridRow = this.selectGrid.gridRows.get(row.index);
        if (gridRow.isSelected()) {
            this.selectedRows++;
        } else {
            this.selectedRows--;
        }
        this.updateState();
    },
    
    selectGrid_onSelectAll: function() {
        this.selectGrid.setAllRowsSelected(true);
        this.selectedRows = this.selectGrid.gridRows.getCount();
        this.updateState();
    },  

    selectGrid_onSelectNone: function() {
        this.selectGrid.setAllRowsSelected(false);
        this.selectedRows = 0;
        this.updateState();
    },
    
    selectGrid_onChangePassword: function(row) {
        var username = row.getFieldValue('afm_users.user_name');
        var title = getMessage('changePasswordTitle');
		var text = getMessage('changePasswordText');
		if (username === View.preferences.coreUserId) {
			title = getMessage('changePasswordTitleCore');
			text = getMessage('changePasswordTextCore');
		} else if (username === View.preferences.guestUserId) {
            title = getMessage('changePasswordTitleGuest');
            text = getMessage('changePasswordTextGuest');
        }
		
        var controller = this;
        
        //XXX: since no way to add css text transform into Ext.MessageBox's input, force input as password type
        //TODO: IE case???
        if(!Ext.isIE){
        	Ext.MessageBox.getDialog().body.child('input').dom.type = 'password';
        }
        View.prompt(title, text, function(button, text) {
            if (button == 'ok') {
				// preserve the current password in the row object
                var record = row.getRecord();
				row.previousPassword = record.getValue('afm_users.user_pwd');
				
				if(valueExistsNotEmpty(text) && View.dataSources.get("usersDs").fieldDefs.get("afm_users.user_pwd").isUpperCase()){
					text = text.toUpperCase();
				}
						
                // save record with updated password
				var username = record.getValue('afm_users.user_name'),
				    oldPassword = record.getValue('afm_users.user_pwd'),
				    newPassword = text;
                
                controller.changePasswordSecurely(row, username, oldPassword, newPassword);
                
                /* MPG End Edit  */
                
                var username = record.getValue('afm_users.user_name');
                View.log('Changed password for ' + username + ': ' + row.previousPassword + ' => ' + text);
				
                // store new password in the grid row record and display it in the grid
                row.setFieldValue('afm_users.user_pwd', text);

                // set cell background color for changed values
                var cell = row.cells.get('afm_users.user_pwd');
                Ext.get(cell.dom).setStyle('background-color', '#ccf');
                
                // select the row (it is clear that the user want to migrate this account)
                if (!row.isSelected()) {
                    row.select();
                    controller.selectedRows++;
                    controller.updateState();
                }
                
                // enable Undo button
                row.actions.get(2).enable(true);
            }
        });
    },

    changePasswordSecurely: function(row, username, oldPassword, newPassword) {
    	var controller = this;
    	SecurityService.changePassword(
		    doSecure(username), 
			doSecure(oldPassword), 
			doSecure(newPassword), 
			// user is authenticated, do not supply projectId
			null, {
            callback: function() {
               // controller.afterPasswordChanged();
            },
            errorHandler: function(m, e) {
        	    controller.selectGrid_onUndoChangePassword(row);
                View.showMessage('error', getMessage('changePasswordError'), e.localizedMessage, e.data);
            }
        });
    },

    selectGrid_onUndoChangePassword: function(row) {
        // get the current (modified) record
        var record = row.getRecord();
        var username = record.getValue('afm_users.user_name');
        var password = record.getValue('afm_users.user_pwd');

        // restore the previous password and save
        record.setValue('afm_users.user_pwd', row.previousPassword);
        this.usersDs.saveRecord(record);
        View.log('Changed password for ' + username + ': ' + password + ' => ' + row.previousPassword);

        // store previous password in the grid row record and display it in the grid
        row.setFieldValue('afm_users.user_pwd', row.previousPassword);

        // restore cell background color
        var cell = row.cells.get('afm_users.user_pwd');
        Ext.get(cell.dom).setStyle('background-color', '#FFF6DC');
        
        // unselect the row
        row.select(false);
        this.selectedRows--;
        this.updateState();
        
        // disable Undo button
        row.actions.get(2).enable(false);
    },
    
    // ----------------------- helper methods -----------------------------------------------------
    
	/**
	 * Initializes controller state.
	 */
    initState: function() {
        this.selectedRows = 0;
        this.updateState();
        
        this.selectGrid.gridRows.each(function(row) {
            row.actions.get(2).enable(false);
        });
    },
    
	/**
	 * Updates action buttons.
	 */
    updateState: function() {
		// can Next if there are selected rows
		var nextAction = this.selectGrid.actions.get('next');
        if (nextAction) {
        	nextAction.forceDisable(false);
            nextAction.enable(this.selectedRows > 0);
        }

        // can Migrate if there are selected rows
        var migrateAction = this.selectGrid.actions.get('migrate');
        if (migrateAction) {
        	migrateAction.forceDisable(false);
            migrateAction.enable(this.selectedRows > 0);
        }
    },
    
    /**
     * Formats the list of usernames/passwords from the list of updated records.
     * @param {selectedRows} Array of Ab.grid.GridRow objects.
     */
    getSelectedUserPasswordList: function(selectedRows) {
        var list = '';
        for (var i = 0; i < selectedRows.length; i++) {
            var record = selectedRows[i].updatedRecord;
            if (!valueExists(record)) {
                record = selectedRows[i].getRecord();
            }
            var username = record.getValue('afm_users.user_name');
            var password = record.getValue('afm_users.user_pwd');
            list = list + username + ' (' + password + ')<br/>';
        }
        return list;
    }
});
