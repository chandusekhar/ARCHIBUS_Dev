var projectRequestEditSubmitController = View.createController('projectRequestEditSubmit',{	
	quest: null,
	
	afterViewLoad: function() {
		this.projectRequestEditSubmit_summary.addParameter('created', getMessage('createdSummary'));
		this.projectRequestEditSubmit_summary.addParameter('requested', getMessage('requestedSummary'));
		this.projectRequestEditSubmit_summary.addParameter('routed', getMessage('routedSummary'));
		this.projectRequestEditSubmit_summary.addParameter('approved', getMessage('approvedSummary'));
		this.projectRequestEditSubmit_summary.addParameter('issued', getMessage('issuedSummary'));
		this.projectRequestEditSubmit_summary.addParameter('completed', getMessage('completedSummary'));
		this.projectRequestEditSubmit_summary.addParameter('closed', getMessage('closedSummary'));
	},
	
	afterInitialDataFetch: function(){
		var title = View.taskInfo.taskId;
		if(View.title != title){
			View.setTitle(title);
		}
	},
    
    projectRequestEditSubmit_projectForm_afterRefresh: function() {	
		var q_id = 'Project - ' + this.projectRequestEditSubmit_projectForm.getFieldValue('project.project_type');	
		this.quest = new Ab.questionnaire.Quest(q_id, 'projectRequestEditSubmit_projectForm');
    },
    
    projectRequestEditSubmit_projectForm_beforeSave: function() {
    	if (!this.validateDates(this.projectRequestEditSubmit_projectForm)) return false;

    	return this.quest.beforeSaveQuestionnaire();  	
    },  
    
    projectRequestEditSubmit_projectForm_onRequest : function() {
    	if (!this.projectRequestEditSubmit_projectForm.save()) return;
    	
    	var projectId = this.projectRequestEditSubmit_projectForm.getFieldValue('project.project_id');
		var parameters = {};
		parameters.fieldValues = toJSON({'project.project_id': projectId, 'project.status': 'CREATED'});
		var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-requestProject', parameters);
  		if (result.code == 'executed') {
  			var statusRestriction = new Ab.view.Restriction();
			statusRestriction.addClause('project.status', 'Requested');
  			this.projectRequestEditSubmit_projectForm.refresh();
  			this.projectRequestEditSubmit_projects.refresh(statusRestriction);
  			this.projectRequestEditSubmit_summary.refresh();
  		} 
  		else 
  		{
    		alert(result.code + " :: " + result.message);
  		}		
    },
    
    projectRequestEditSubmit_projectForm_onRouteForApproval : function() {
    	if (!this.projectRequestEditSubmit_projectForm.save()) return;
    	this.projectRequestEditSubmit_projects.refresh();
    	this.projectRequestEditSubmit_summary.refresh();
    	
    	var restriction = new Ab.view.Restriction();
    	var project_id = this.projectRequestEditSubmit_projectForm.getFieldValue('project.project_id');
    	restriction.addClause('project.project_id', project_id);
    	
        var controller = this;
        var dialog = View.openDialog('ab-project-route-for-approval-dialog.axvw', restriction, false, {
            closeButton: false,
            maximize: false,

            afterInitialDataFetch: function(dialogView) {
                var dialogController = dialogView.controllers.get('projectRouteForApprovalDialog');           
                dialogController.onRouteForApproval = controller.dialog_onRouteForApproval.createDelegate(controller);
            }
        });
    	this.projectRequestEditSubmit_projectForm.closeWindow();
    },
    
    /**
     * Called when the user routes the project for approval from the dialog.
     */
    dialog_onRouteForApproval: function(dialogController) {
    	var statusRestriction = new Ab.view.Restriction();
		statusRestriction.addClause('project.status', 'Requested-Routed');
    	this.projectRequestEditSubmit_projects.refresh(statusRestriction);
    	this.projectRequestEditSubmit_summary.refresh();
    },
    
	projectRequestEditSubmit_projectForm_onSave: function(){
		if (!this.projectRequestEditSubmit_projectForm.save()) return;
		this.projectRequestEditSubmit_projects.refresh();
		this.projectRequestEditSubmit_summary.refresh();
	},
	
	validateDates: function(form) {
    	var curDate = new Date();
    	var date_start = getDateObject(form.getFieldValue('project.date_start'));//note that getFieldValue returns date in ISO format
    	var date_end = getDateObject(form.getFieldValue('project.date_end'));
    	if (date_end < date_start) {
    		form.addInvalidField('project.date_end', getMessage('endBeforeStart'));
    		return false;
    	}
    	if ((curDate - date_start)/(1000*60*60*24) >= 1) {
    		if (!confirm(getMessage('dateBeforeCurrent'))) return false;		
    	}
    	return true;
	}
	

});

function showProjects(obj) {
	if (obj.restriction.clauses.length < 1) return;
	var value = obj.restriction.clauses[0].value;
	value = value.substring(0,1);
	var restriction = new Ab.view.Restriction();
	switch(value)
	{
	case '1':
		restriction.addClause('project.status','Created');
	  	break;
	case '2':
		restriction.addClause('project.status',['Requested','Requested-Estimated','Requested-On Hold','Requested-Rejected'],'IN');
		break;
	case '3':
		restriction.addClause('project.status','Requested-Routed');
	  	break;
	case '4':
		restriction.addClause('project.status','Approved%','LIKE');
		break;
	case '5':
		restriction.addClause('project.status','Issued%','LIKE');
	  	break;
	case '6':
		restriction.addClause('project.status','Completed%','LIKE');
		break;
	case '7':
		restriction.addClause('project.status','Closed');
	  	break;
	}
	View.panels.get('projectRequestEditSubmit_projects').refresh(restriction);
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}