var projAssignTeamSelectMemberController = View.createController('projAssignTeamSelectMember', {
	em_id : '',
	cf_id : '',
	vn_id : '',
	
	projAssignTeamSelectMemberGridEm_onSelectEm : function(row) {
		this.em_id = row.record['em.em_id.key'];
		this.selectMember(this.em_id, "em");		
	},
	
	projAssignTeamSelectMemberGridCf_onSelectCf : function(row) {
		this.cf_id = row.record['cf.cf_id.key'];
		this.selectMember(this.cf_id, "cf");
	},
	
	projAssignTeamSelectMemberGridVn_onSelectVn : function(row) {
		this.vn_id = row.record['vn.vn_id.key'];
		this.selectMember(this.vn_id, "vn");
	},
	
	selectMember : function(member_id, member_id_table) {
		var controller = View.getOpenerView().controllers.get('projAssignTeam');
		var parameters = {'member_id':member_id, 'member_id_table':member_id_table};	
	  	var result = Workflow.callMethodWithParameters('AbProjectManagement-ProjectManagementService-getContactInfo', parameters);
	  	
	  	if (result.code == 'executed') {
		  	var contactInfo = eval("(" + result.jsonExpression + ")");
			controller.projAssignTeamForm.setFieldValue('projteam.member_id', contactInfo.member_id?contactInfo.member_id:"");
		  	controller.projAssignTeamForm.setFieldValue('projteam.source_table', contactInfo.member_id_table?contactInfo.member_id_table:"");
			controller.projAssignTeamForm.setFieldValue('projteam.email', contactInfo.email?contactInfo.email:"");
			controller.projAssignTeamForm.setFieldValue('projteam.bl_id', contactInfo.bl_id?contactInfo.bl_id:"");
			controller.projAssignTeamForm.setFieldValue('projteam.name_first', contactInfo.name_first?contactInfo.name_first:"");
			controller.projAssignTeamForm.setFieldValue('projteam.name_last', contactInfo.name_last?contactInfo.name_last:"");
			controller.projAssignTeamForm.setFieldValue('projteam.honorific', contactInfo.honorific?contactInfo.honorific:"");
			controller.projAssignTeamForm.setFieldValue('projteam.member_type', contactInfo.tr_id?contactInfo.tr_id:"");
			controller.projAssignTeamForm.setFieldValue('projteam.phone', contactInfo.phone?contactInfo.phone:"");
			controller.projAssignTeamForm.setFieldValue('projteam.fax', contactInfo.fax?contactInfo.fax:"");
			controller.projAssignTeamForm.setFieldValue('projteam.pager', contactInfo.pager?contactInfo.pager:"");
			controller.projAssignTeamForm.setFieldValue('projteam.ctry_id', contactInfo.ctry_id?contactInfo.ctry_id:"");
			controller.projAssignTeamForm.setFieldValue('projteam.address1', contactInfo.address1?contactInfo.address1:"");
			controller.projAssignTeamForm.setFieldValue('projteam.address2', contactInfo.address2?contactInfo.address2:"");
			controller.projAssignTeamForm.setFieldValue('projteam.city_id', contactInfo.city_id?contactInfo.city_id:"");
			controller.projAssignTeamForm.setFieldValue('projteam.state_id', contactInfo.state_id?contactInfo.state_id:"");
			controller.projAssignTeamForm.setFieldValue('projteam.zip', contactInfo.zip?contactInfo.zip:"");
			controller.projAssignTeamForm.setFieldValue('projteam.regn_id', contactInfo.regn_id?contactInfo.regn_id:"");
			//controller.projAssignTeamForm.setFieldValue('projteam.company', contactInfo.company?contactInfo.company:"");
		
			//These values are not listed in either of the em, cf, or vn tables.  
			//Set to default values when a different member_id is selected	
			controller.projAssignTeamForm.setFieldValue('projteam.county_id', '');
			controller.projAssignTeamForm.setFieldValue('projteam.status', '','CURRENT');
			controller.projAssignTeamForm.setFieldValue('projteam.notes', '');
				
			View.closeThisDialog();
	  	} 
	  	else 
	  	{
	  		controller.projAssignTeamForm.setFieldValue('projteam.member_id', member_id);
	  		controller.projAssignTeamForm.setFieldValue('projteam.source_table', member_id_table);
	  		View.closeThisDialog();
	  	}
	}
});
