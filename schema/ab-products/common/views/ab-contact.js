var abContactsController = View.createController('abContactsController', {
	
	restriction: null,
	
	callbackFunction: null,
	
	isMultipleSelection: false,
	
	buttonConfig: null,
	
	afterViewLoad: function(){
		if (valueExists(View.parameters)) {
			if (valueExists(View.parameters.restriction)) {
				this.restriction = View.parameters.restriction;
			}
			if (valueExists(View.parameters.isMultipleSelection)) {
				this.isMultipleSelection = View.parameters.isMultipleSelection;
			}
			if (valueExists(View.parameters.callback)) {
				this.callbackFunction = View.parameters.callback;
			}
			
			if (this.isMultipleSelection) {
				this.abContacts_list.hideColumn('edit');
			}else {
				this.abContacts_list.hideColumn(Ab.grid.ReportGrid.COLUMN_NAME_MULTIPLE_SELECTION);
//				this.abContacts_list.removeAction('saveSelected');
//				this.abContacts_list.removeAction('clear');

				this.abContacts_list.actions.get('saveSelected').show(false);
				this.abContacts_list.actions.get('clear').show(false);
			}

			if (valueExists(View.parameters.buttonConfig)) {
				this.buttonConfig = View.parameters.buttonConfig;
				this.configActions();
			}
			this.abContacts_list.update();
		}
		this.abContacts_list.addEventListener('onMultipleSelectionChange', this.onMultipleSelectedChange.createDelegate(this)); 
	},
	
	afterInitialDataFetch: function(){
		this.abContacts_list.refresh(this.restriction);
	},
	
	onClickRow: function(restriction) {
		if (this.isMultipleSelection) {
			this.editContact(restriction, false);
		}else{
			var clause = restriction.findClause('contact.contact_id');
			var contactId = clause.value;
			this.executeCallback([contactId]);
		}
	},
	
	abContacts_list_onNew: function(){
		this.editContact(null, true);
	},
	
	editContact: function(restriction, newRecord) {
		this.abContacts_form.refresh(restriction, newRecord);
		this.abContacts_form.showInWindow({
			width: 1024,
			height: 400,
			closeButton: true
		});
	},
	
	abContacts_list_onSaveSelected: function(){
		var res = [];
		var selectedRows = this.abContacts_list.getSelectedRows();
		for (var i = 0 ; i < selectedRows.length; i++) {
			var row = selectedRows[i];
			res.push(row['contact.contact_id']);
		}
		this.executeCallback(res);
	},

	abContacts_list_onClear: function(){
		this.abContacts_list.unselectAll();
		this.enableActions();
	},
	
	abContacts_list_afterRefresh: function(){
		this.enableActions();
	},
	
	abContacts_list_edit_onClick: function(row){
		var restriction = new Ab.view.Restriction({
			'contact.contact_id': row.record['contact.contact_id']
		});
		this.editContact(restriction, false);
	},
	
	abContacts_form_onSave: function() {
		if (this.abContacts_form.canSave() && this.validateGeographicalFields()) {
			if(this.abContacts_form.save()){
				this.abContacts_list.refresh(this.restriction);
				this.abContacts_form.closeWindow();
			}
		}
	},
	
	onMultipleSelectedChange: function(row) {
		this.enableActions();
	},
	
	enableActions: function(){
		var enabled = this.abContacts_list.getSelectedRows().length > 0;
		if (enabled && this.abContacts_list.actions.get('saveSelected').forcedDisabled) {
			this.abContacts_list.actions.get('saveSelected').forceDisable(false);
		}
		if (enabled && this.abContacts_list.actions.get('clear').forcedDisabled) {
			this.abContacts_list.actions.get('clear').forceDisable(false);
		}
		this.abContacts_list.enableAction('saveSelected', enabled);
		this.abContacts_list.enableAction('clear', enabled);
		this.configActions();
	},
	
	configActions: function(){
		if (valueExists(this.buttonConfig)) {
			for (var i = 0; i < this.buttonConfig.length; i++) {
				var btnCfg = this.buttonConfig[i];
				if (!btnCfg.visible) {
					this.abContacts_list.actions.get(btnCfg.id).show(false);
				}
				if (valueExistsNotEmpty(btnCfg.title)) {
					this.abContacts_list.actions.get(btnCfg.id).setTitle(btnCfg.title);
				}
				
			}
		}
	},
	
	executeCallback: function(res){
		this.callbackFunction(res);
	},
	
	validateGeographicalFields: function(){
		var result = true;
		var ctryId = this.abContacts_form.getFieldValue('contact.ctry_id');
		var stateId = this.abContacts_form.getFieldValue('contact.state_id');
		var cityId = this.abContacts_form.getFieldValue('contact.city_id');
		
		// validate state value
		if(valueExistsNotEmpty(stateId) && valueExistsNotEmpty(ctryId)){
			var restriction = new Ab.view.Restriction();
			restriction.addClause('state.ctry_id', ctryId, '=');
			restriction.addClause('state.state_id', stateId, '=');
			
			var parameters = {
					tableName: 'state',
					fieldNames: toJSON(['state.state_id', 'state.ctry_id']),
					restriction: toJSON(restriction)
			};
			var record = getRecord(parameters);
			if (!valueExists(record.isNew) || (valueExists(record.isNew) && record.isNew) ) {
				// 
				this.abContacts_form.addInvalidField('contact.state_id', getMessage('errorInvalidGeographicalField'));
				this.abContacts_form.addInvalidField('contact.ctry_id', '');
				this.abContacts_form.displayValidationResult();
				result = false;
			}
		}
		// validate city_id
		if(result && valueExistsNotEmpty(cityId)){
			var restriction = new Ab.view.Restriction();
			restriction.addClause('city.city_id', cityId, '=');
			if (valueExistsNotEmpty(stateId)) {
				restriction.addClause('city.state_id', stateId, '=');
			}
			if (valueExistsNotEmpty(ctryId)) {
				restriction.addClause('city.ctry_id', ctryId, '=');
			}
			
			var parameters = {
					tableName: 'city',
					fieldNames: toJSON(['city.city_id', 'city.state_id', 'city.ctry_id']),
					restriction: toJSON(restriction)
			};
			var record = getRecord(parameters);
			if (!valueExists(record.isNew) || (valueExists(record.isNew) && record.isNew) ) {
				// 
				this.abContacts_form.addInvalidField('contact.city_id', getMessage('errorInvalidGeographicalField'));
				if (valueExistsNotEmpty(stateId)) {
					this.abContacts_form.addInvalidField('contact.state_id', '');
				}
				if (valueExistsNotEmpty(ctryId)) {
					this.abContacts_form.addInvalidField('contact.ctry_id', '');
				}
				this.abContacts_form.displayValidationResult();
				result = false;
			}
		}
		return result;
	}
	
});

/**
 * On click row event handler.
 * @param ctx context
 */
function onClickRow(ctx){
	var restriction = new Ab.view.Restriction(ctx.restriction);
	View.controllers.get('abContactsController').onClickRow(restriction);
}

/**
 * Get database record
 * @param parameters input parameters
 * @returns record
 */
function getRecord(parameters){
	var record = null;
	try{
		var result = Workflow.call('AbCommonResources-getDataRecord', parameters);
		if(result.code == 'executed'){
			record = result.dataSet;
		}
		return record;
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
}