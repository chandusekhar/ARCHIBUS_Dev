var projectRequestPage3Controller = View.createController('projectRequestPage3',{	
	quest: null,
	
    afterInitialDataFetch: function(){      
        this.project_id = View.getOpenerView().controllers.get('projectRequest').project_id;
        var restriction = new Ab.view.Restriction();
        restriction.addClause('project.project_id', this.project_id);
        this.projectRequestPage3_projectForm.refresh(restriction);
    },
    
    projectRequestPage3_projectForm4_afterRefresh: function() {	
		var q_id = 'Project - '.toUpperCase() + this.projectRequestPage3_projectForm.getFieldValue('project.project_type');	
		this.quest = new Ab.questionnaire.Quest(q_id, 'projectRequestPage3_projectForm4');
    },

	projectRequestPage3_projectForm_afterRefresh: function() {
		var project_id = this.projectRequestPage3_projectForm.getFieldValue('project.project_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', project_id);
		this.projectRequestPage3_projectForm2.refresh(restriction);
		this.projectRequestPage3_projectForm3.refresh(restriction);
		this.projectRequestPage3_projectForm4.refresh(restriction);
	}
});

