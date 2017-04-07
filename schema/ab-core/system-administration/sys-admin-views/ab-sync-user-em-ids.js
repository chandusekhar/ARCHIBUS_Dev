var syncUserEmIdsController = View.createController('syncUserEmIds', {
	
	syncUserEmIds_grid_onShowAll : function() {
		this.syncUserEmIds_grid.refresh("1=1");
	},
	
	syncUserEmIds_grid_onShowUsersWithUpdates : function() {
		var restriction = "afm_users.vpa_option4 IS NOT NULL";
		this.syncUserEmIds_grid.refresh(restriction);
	},
	
	syncUserEmIds_grid_onPropagateSelected : function() {
		var records = this.syncUserEmIds_grid.getSelectedRecords();
		if (records.length == 0) {
    		View.showMessage(getMessage('noRecordsSelected'));
    		return;
    	}
		var controller = this;
		var duplicated = false;
		View.confirm(getMessage('propagateSelected'), function(button) {
	        if (button == 'yes') {
	           	for (var i = 0; i < records.length; i++) {
	           		if (!controller.syncEmails(records[i])) duplicated = true;
	           	}
	           	controller.syncUserEmIds_grid.refresh();
	           	if (!duplicated) View.showMessage(getMessage('propagationComplete'));
	        } 
	    });
	},
	
	syncUserEmIds_form_onUpdate : function() {
		if (this.syncUserEmIds_form.getFieldValue('afm_users.vpa_option4') == '') return;
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_users.user_name', this.syncUserEmIds_form.getFieldValue('afm_users.user_name'));
		var record = this.syncUserEmIds_userDs.getRecord(restriction);
		record.setValue('afm_users.vpa_option4', this.syncUserEmIds_form.getFieldValue('afm_users.vpa_option4'));
		
		if (this.syncEmails(record)) {
			this.syncUserEmIds_form.refresh();
			this.syncUserEmIds_form.save();
			this.syncUserEmIds_grid.refresh();
		}
	},
	
	syncEmails : function(userRecord) {
		var emailUpdate = userRecord.getValue('afm_users.vpa_option4');
		var currentEmail = userRecord.getValue('afm_users.email');
		if (emailUpdate == currentEmail) return true; 
		if (emailUpdate == '') return true;

		if (this.checkForDuplicateEmails(userRecord)) return false;
		
		userRecord.setValue('afm_users.email', emailUpdate);
		this.syncUserEmIds_userDs.saveRecord(userRecord);
		
		var em_id = userRecord.getValue('afm_users.em_id');
		if (em_id) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('em.em_id', em_id);
			var emRecord = this.syncUserEmIds_emDs.getRecord(restriction);
			emRecord.setValue('em.email', emailUpdate);
			this.syncUserEmIds_emDs.saveRecord(emRecord);
		}
		return true;
	},
	
	checkForDuplicateEmails : function(userRecord) {
		var emailUpdate = userRecord.getValue('afm_users.vpa_option4');
		var user_name = userRecord.getValue('afm_users.user_name');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('em.email', emailUpdate);
		var records = this.syncUserEmIds_emDs.getRecords(restriction);
		if (records && records.length > 0) {
			var message = String.format(getMessage('duplicateEmail'), emailUpdate, user_name);
			alert(message);
			return true;
		}
		else return false;
	}
});