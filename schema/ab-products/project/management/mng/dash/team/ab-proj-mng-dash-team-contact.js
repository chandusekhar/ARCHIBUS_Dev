var projMngDashTeamContactController = View.createController('projMngDashTeamContact', {
	afterInitialDataFetch: function() {
		this.projMngDashTeam_addContact.show(false);
	},
	
	projMngDashTeam_contact_onSelect: function() {
		var records = this.projMngDashTeam_contact.getSelectedRecords();
		for (var i = 0; i < records.length; i++) {
			var contact_id = records[i].getValue('contact.contact_id');
			this.addContactMember(contact_id);			
		}
		if(View.parameters.callback){
			View.parameters.callback();
		}
		View.closeThisDialog();
	},
	
	projMngDashTeam_addContact_onSave: function() {
		if (!this.projMngDashTeam_addContact.save()) return;
		this.addContactMember(this.projMngDashTeam_addContact.getFieldValue('contact.contact_id'));	

		if(View.parameters.callback){
			View.parameters.callback();
		}
		View.closeThisDialog();
	},
	
	addContactMember: function(contact_id) {
		var openerController = View.getOpenerView().controllers.get('projMngDashTeam');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('contact.contact_id', contact_id);
		var record = this.projMngDashTeam_dsContact.getRecord(restriction);
		var member = openerController.projMngDashTeam_ds0.getDefaultRecord();
		member.setValue('projteam.member_id', record.getValue('contact.contact_id'));
		member.setValue('projteam.company', record.getValue('contact.company'));
		member.setValue('projteam.name_first', record.getValue('contact.name_first'));
		member.setValue('projteam.name_last', record.getValue('contact.name_last'));
		member.setValue('projteam.member_type', record.getValue('contact.contact_type'));
		member.setValue('projteam.image_file', record.getValue('contact.image_file'));
		member.setValue('projteam.address1', record.getValue('contact.address1'));
		member.setValue('projteam.address2', record.getValue('contact.address2'));
		member.setValue('projteam.city_id', record.getValue('contact.city_id'));
		member.setValue('projteam.state_id', record.getValue('contact.state_id'));
		member.setValue('projteam.ctry_id', record.getValue('contact.ctry_id'));
		member.setValue('projteam.county_id', record.getValue('contact.county_id'));
		member.setValue('projteam.regn_id', record.getValue('contact.regn_id'));
		member.setValue('projteam.bl_id', record.getValue('contact.bl_id'));
		member.setValue('projteam.email', record.getValue('contact.email'));
		member.setValue('projteam.fax', record.getValue('contact.fax'));
		member.setValue('projteam.honorific', record.getValue('contact.honorific'));
		member.setValue('projteam.pager', record.getValue('contact.pager'));
		member.setValue('projteam.phone', record.getValue('contact.phone'));
		member.setValue('projteam.zip', record.getValue('contact.zip'));
		member.setValue('projteam.notes', record.getValue('contact.cellular_number'));
		member.setValue('projteam.source_table', 'contact');
		openerController.addMember(member);
	}
});
