var projMngDashTeamVnController = View.createController('projMngDashTeamVn', {
	afterInitialDataFetch: function() {
		this.projMngDashTeam_addVn.show(false);
	},
	
	projMngDashTeam_vn_onSelect: function() {
		var records = this.projMngDashTeam_vn.getSelectedRecords();
		for (var i = 0; i < records.length; i++) {
			var vn_id = records[i].getValue('vn.vn_id');
			this.addVnMember(vn_id);			
		}
		if(View.parameters.callback){
			View.parameters.callback();
		}
		View.closeThisDialog();
	},
	
	projMngDashTeam_addVn_onSave: function() {
		if (!this.projMngDashTeam_addVn.save()) return;
		this.addVnMember(this.projMngDashTeam_addVn.getFieldValue('vn.vn_id'));

		if(View.parameters.callback){
			View.parameters.callback();
		}
		View.closeThisDialog();
	},
	
	addVnMember: function(vn_id) {
		var openerController = View.getOpenerView().controllers.get('projMngDashTeam');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('vn.vn_id', vn_id);
		var record = this.projMngDashTeam_dsVn.getRecord(restriction);
		var member = openerController.projMngDashTeam_ds0.getDefaultRecord();
		member.setValue('projteam.member_id', record.getValue('vn.vn_id'));
		member.setValue('projteam.notes', record.getValue('vn.company'));
		member.setValue('projteam.name_first', record.getValue('vn.contact'));
		member.setValue('projteam.member_type', record.getValue('vn.vendor_type'));
		member.setValue('projteam.address1', record.getValue('vn.address1'));
		member.setValue('projteam.address2', record.getValue('vn.address2'));
		member.setValue('projteam.city_id', record.getValue('vn.city'));
		member.setValue('projteam.state_id', record.getValue('vn.state'));
		member.setValue('projteam.ctry_id', record.getValue('vn.country'));
		member.setValue('projteam.email', record.getValue('vn.email'));
		member.setValue('projteam.fax', record.getValue('vn.fax'));
		member.setValue('projteam.phone', record.getValue('vn.phone'));
		member.setValue('projteam.zip', record.getValue('vn.postal_code'));
		member.setValue('projteam.source_table', 'vn');
		openerController.addMember(member);
	}
});
