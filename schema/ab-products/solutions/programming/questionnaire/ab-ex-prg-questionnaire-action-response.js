var questionnaireActionResponseController = View.createController('questionnaireActionResponse', {
    
    quest : null,
    project_id : '',
    
    afterInitialDataFetch: function() {	
	    var instructionText = getMessage('instructionTitle') 
	    + getMessage('instructionStep1')
	    + getMessage('instructionStep2')
	    + getMessage('instructionStep3')
	    + getMessage('instructionStep4');
	    $('exPrgQuestionnaireActionResponse_instructions').innerHTML = instructionText;
	},

    exPrgQuestionnaireActionResponse_report_afterRefresh : function() {	
		var project_type = this.exPrgQuestionnaireActionResponse_report.getFieldValue('project.project_type');
		var q_id = 'Project - ' + project_type;
		this.quest = new Ab.questionnaire.Quest(q_id, 'exPrgQuestionnaireActionResponse_report');
    },
    
    exPrgQuestionnaireActionResponse_report_onApprove : function() {
        var record = this.exPrgQuestionnaireActionResponse_projectDs.getRecord();
    	record.setValue('project.status', 'Approved');
    	this.exPrgQuestionnaireActionResponse_projectDs.saveRecord(record);
    	
	    this.project_id = this.exPrgQuestionnaireActionResponse_report.getFieldValue('project.project_id');
	    this.quest.generateActions([
	                                ['activity_log.project_id', this.project_id],
	                                ['activity_log.created_by', Ab.view.View.user.employee.id],
	                                ['activity_log.requestor', Ab.view.View.user.employee.id],
	                                ['activity_log.description', getMessage('actionDescription')]
	    ]);
	    
	    View.showMessage(getMessage('projectApproved'));
	    this.exPrgQuestionnaireActionResponse_report.actions.get('approve').enable(false);
	    this.exPrgQuestionnaireActionResponse_actions.refresh();
	    this.exPrgQuestionnaireActionResponse_projects.refresh();
    }
});