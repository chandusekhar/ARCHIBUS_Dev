var projMngDashTeamCfController = View.createController('projMngDashTeamCf', {
	afterInitialDataFetch: function() {
		this.projMngDashTeam_addCf.show(false);
	},
	
	projMngDashTeam_cf_onSelect: function() {
		var records = this.projMngDashTeam_cf.getSelectedRecords();
		for (var i = 0; i < records.length; i++) {
			var cf_id = records[i].getValue('cf.cf_id');
			this.addCfMember(cf_id);			
		}
		if(View.parameters.callback){
			View.parameters.callback();
		}
		View.closeThisDialog();
	},
	
	projMngDashTeam_addCf_onSave: function() {
		if (!this.projMngDashTeam_addCf.save()) return;
		this.addCfMember(this.projMngDashTeam_addCf.getFieldValue('cf.cf_id'));	

		if(View.parameters.callback){
			View.parameters.callback();
		}
		View.closeThisDialog();
	},
	
	addCfMember: function(cf_id) {
		var openerController = View.getOpenerView().controllers.get('projMngDashTeam');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('cf.cf_id', cf_id);
		var record = this.projMngDashTeam_dsCf.getRecord(restriction);
		var member = openerController.projMngDashTeam_ds0.getDefaultRecord();
		member.setValue('projteam.member_id', record.getValue('cf.cf_id'));
		member.setValue('projteam.email', record.getValue('cf.email'));
		member.setValue('projteam.name_first', record.getValue('cf.name'));
		member.setValue('projteam.member_type', record.getValue('cf.tr_id'));
		member.setValue('projteam.notes', record.getValue('cf.reports_to'));
		member.setValue('projteam.source_table', 'cf');
		openerController.addMember(member);
	}
});
