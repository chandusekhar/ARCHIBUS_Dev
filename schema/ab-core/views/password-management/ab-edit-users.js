
View.createController('manageUsers', {
	
	afterViewLoad: function() {
        var localeSelector = Ext.get('user_afm_users.locale');
		localeSelector.on('change', this.selectUserLocale.createDelegate(this));
	},
    
    afterInitialDataFetch: function() {
		this.user.getFieldElement('afm_users.user_pwd').disabled = true;
		this.user.getFieldElement('afm_users.num_retries').disabled = true;
    },
	
	/**
	 * Select listener for the Locale combobox.
	 */
	selectUserLocale: function(e, option) {
		this.showLocaleProperties(option.value);
	},
	
	showLocaleProperties: function(localeId) {
        var cultureInfo = View.cultureInfos[localeId];
        if (valueExists(cultureInfo)) {
        	this.user.setFieldValue('vf_ctry_id', cultureInfo.country);
        	this.user.setFieldValue('vf_currency_id', cultureInfo.currency);
        }
	},

	user_afterRefresh: function() {
    	$('createEmployee').checked = false;
		var username = this.user.getFieldValue('afm_users.user_name');
		var isAdd = (username === '');
		
		var title = isAdd ? getMessage('addUserTitle') : getMessage('editUserTitle');
		this.user.setTitle(title);
		
		var passwordField = this.user.getFieldElement('afm_users.user_pwd');
		var passwordRow = Ext.get(passwordField.parentNode.parentNode);
    	passwordRow.setDisplayed(!isAdd);

    	this.showLocaleProperties(this.user.getFieldValue('afm_users.locale'));
	},
	 
    user_onResetNumRetries: function(){
    	this.user.setFieldValue('afm_users.num_retries', '0');
    },
	
	user_onSave: function() {
		var createEmployee = $('createEmployee').checked;
		if (this.user.save()) {
			if (createEmployee) {
				var em_id = this.user.getFieldValue('afm_users.user_name');
				var email = this.user.getFieldValue('afm_users.email');
				var record = null;
				
				var restriction = new Ab.view.Restriction();
				restriction.addClause('em.em_id', em_id);
				var records = this.employeeDs.getRecords(restriction);
				
				if (records.length == 0) {
					// create new employee record with same user_name
					record = new Ab.data.Record();
					record.setValue('em.em_id', em_id);					
				}
				else {
					record = records[0];
				}
				record.setValue('em.email', email);
				this.employeeDs.saveRecord(record);
			}
			this.users.refresh();
		}
	}
});
