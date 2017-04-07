var projMngDashTeamEmController = View.createController('projMngDashTeamEm', {
	projMngDashTeam_em_onSelect: function() {
		var records = this.projMngDashTeam_em.getSelectedRecords();
		var openerController = View.getOpenerView().controllers.get('projMngDashTeam');
		for (var i = 0; i < records.length; i++) {
			var em_id = records[i].getValue('em.em_id');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('em.em_id', em_id);
			var record = this.projMngDashTeam_dsEm.getRecord(restriction);
			var member = openerController.projMngDashTeam_ds0.getDefaultRecord();
			member.setValue('projteam.member_id', record.getValue('em.em_id'));
			member.setValue('projteam.name_first', record.getValue('em.name_first'));
			member.setValue('projteam.name_last', record.getValue('em.name_last'));
			member.setValue('projteam.member_type', record.getValue('em.em_std'));
			member.setValue('projteam.image_file', record.getValue('em.image_file'));
			member.setValue('projteam.address1', record.getValue('bl.address1'));
			member.setValue('projteam.address2', record.getValue('bl.address2'));
			member.setValue('projteam.city_id', record.getValue('bl.city_id'));
			member.setValue('projteam.state_id', record.getValue('bl.state_id'));
			member.setValue('projteam.ctry_id', record.getValue('bl.ctry_id'));
			member.setValue('projteam.regn_id', record.getValue('bl.regn_id'));
			member.setValue('projteam.bl_id', record.getValue('em.bl_id'));
			member.setValue('projteam.email', record.getValue('em.email'));
			member.setValue('projteam.fax', record.getValue('em.fax'));
			member.setValue('projteam.honorific', record.getValue('em.honorific'));
			member.setValue('projteam.pager', record.getValue('em.pager_number'));
			member.setValue('projteam.phone', record.getValue('em.phone'));
			member.setValue('projteam.zip', record.getValue('bl.zip'));
			member.setValue('projteam.notes', record.getValue('em.cellular_number'));
			member.setValue('projteam.source_table', 'em');
			openerController.addMember(member);
		}
		
		if(View.parameters.callback){
			View.parameters.callback();
		}
		View.closeThisDialog();
	}
});
