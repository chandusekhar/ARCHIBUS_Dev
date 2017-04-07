var projMngProjsJoinController = View.createController('projMngProjsJoin',{
	projMngProjsJoin_projects_onJoinProjectTeams: function() {		
		var projRecords = this.projMngProjsJoin_projects.getSelectedRecords();
		if (projRecords.length < 1) {
			View.showMessage(getMessage('noProjects'));
			return;
		}
		View.openProgressBar();
		var numProjRecords = projRecords.length;
		for (var i = 0; i < numProjRecords; i++) {
			var member = this.getTeamMember();
			member.setValue('projteam.project_id', projRecords[i].getValue('project.project_id'));
			this.projMngProjsJoin_dsTeam.saveRecord(member);
			View.updateProgressBar(i/numProjRecords);
		}
		var openerController = View.getOpenerView().controllers.get('projMngProjs');
		openerController.projMngProjs_filter_onClear();
		View.closeProgressBar();
		View.closeThisDialog();
	},
	
	getTeamMember: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('em.em_id', View.user.employee.id);
		var record = this.projMngProjsJoin_dsEm.getRecord(restriction);
		var member = this.projMngProjsJoin_dsTeam.getDefaultRecord();
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
		return member;
	}
});

