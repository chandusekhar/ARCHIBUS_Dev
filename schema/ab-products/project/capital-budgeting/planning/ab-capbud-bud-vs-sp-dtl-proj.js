var capbudBudVsSpDtlProjController = View.createController('capbudBudVsSpDtlProj',{
	quest: null,
    
    capbudBudVsSpDtlProj_projectForm4_afterRefresh: function() {	
		var q_id = 'Project - '.toUpperCase() + this.capbudBudVsSpDtlProj_projectForm.getFieldValue('project.project_type');	
		this.quest = new Ab.questionnaire.Quest(q_id, 'capbudBudVsSpDtlProj_projectForm4');
    },

	capbudBudVsSpDtlProj_projectForm_afterRefresh: function() {
		var project_id = this.capbudBudVsSpDtlProj_projectForm.getFieldValue('project.project_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', project_id);
		this.capbudBudVsSpDtlProj_projectForm2.refresh(restriction);
		this.capbudBudVsSpDtlProj_projectForm3.refresh(restriction);
		this.capbudBudVsSpDtlProj_projectForm4.refresh(restriction);
	}
});
