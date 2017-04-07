var createUserIdFromEmController = View.createController('createUserIdFromEm', {
	createUserIdFromEm_grid_onSelectEmployee : function(row) {
		var em_id = row.record['em.em_id.key'];
		var email = row.record['em.email'];
		var user_name = row.record['em.user_name'];
		
		if (user_name) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('afm_users.user_name', user_name);
			this.createUserIdFromEm_form.refresh(restriction);
			this.createUserIdFromEm_form.setFieldValue('afm_users.email', email);
		}
		else {
			var em_number = row.record['em.em_number'];
			user_name = getUserNameFromEmId(em_id);
			this.createUserIdFromEm_form.refresh(null, true);
			this.createUserIdFromEm_form.setFieldValue('afm_users.em_id', em_id);
			this.createUserIdFromEm_form.setFieldValue('afm_users.em_number', em_number);
			this.createUserIdFromEm_form.setFieldValue('afm_users.em_email', email);
			this.createUserIdFromEm_form.setFieldValue('afm_users.email', email);
			this.createUserIdFromEm_form.setFieldValue('afm_users.user_name', user_name);
		}
	},
	
	createUserIdFromEm_grid_onShowEmployeesWithoutUserIds : function() {
		this.createUserIdFromEm_grid.refresh("em.user_name IS NULL");
	},
	
	createUserIdFromEm_grid_onShowAllEmployees : function() {
		this.createUserIdFromEm_grid.refresh("1=1");
	},
	
	createUserIdFromEm_grid_onPropagateSelected : function() {
		var records = this.createUserIdFromEm_grid.getSelectedRecords();
    	if (records.length == 0) {
    		View.showMessage(getMessage('noRecordsSelected'));
    		return;
    	}
		var controller = this;
		View.confirm(getMessage('propagateSelected'), function(button) {
            if (button == 'yes') {
               	for (var i = 0; i < records.length; i++) {
               		var record = records[i];
	           		var em_id = record.getValue('em.em_id');
	           		var email = record.getValue('em.email');
	           		var user_name = record.getValue('em.user_name');
	           		if (!user_name) {
	           			user_name = getUserNameFromEmId(em_id);
		           		var userRecord = new Ab.data.Record();
		           		userRecord.setValue('afm_users.user_name', user_name);
		           		userRecord.setValue('afm_users.email', email);
		           		controller.createUserIdFromEm_userDs.saveRecord(userRecord);
	           		}
               	}
               	controller.createUserIdFromEm_grid.refresh();
               	View.showMessage(getMessage('propagationComplete'));
            } 
        });
	}
});


function getUserNameFromEmId(em_id) {
	var user_name = em_id;
	user_name = user_name.replace(/, /g, "_");
	user_name = user_name.replace(/,/g, "_");
	user_name = user_name.toUpperCase();
	return user_name;
}