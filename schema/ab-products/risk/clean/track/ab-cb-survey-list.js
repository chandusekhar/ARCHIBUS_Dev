var abCbSurveyListCtrl = View.createController('abCbSurveyListCtrl', {
	// task mode 
	taskMode: null,
	
	// selected project id
	projectId: null,
	
	// problem Type of selected project
	projProbType: null,
	
	afterViewLoad: function(){
		// read input data
		if(valueExists(this.view.parameters.taskMode)){
			this.taskMode = this.view.parameters.taskMode;
		}
		if(valueExists(this.view.parameters.projectId)){
			this.projectId = this.view.parameters.projectId;
		}
		if(valueExists(this.view.parameters.projProbType)){
			this.projProbType = this.view.parameters.projProbType;
		}

		// initialize the Add/Edit Assessment view
		var assessEditCtrl = View.controllers.get("abCbAssessEditCtrl");
		var controller = this;
		
		assessEditCtrl.taskMode = this.taskMode;
		assessEditCtrl.projectId = this.projectId;
		assessEditCtrl.projProbType = this.projProbType;
		assessEditCtrl.pageMode = "survey";
		assessEditCtrl.callbackMethod = function(res){
			var restriction = controller.abCbSurveyList.restriction;
			if(valueExistsNotEmpty(res)){
				restriction.addClause("activity_log.activity_log_id", res, "=", "OR");
			}
			controller.abCbSurveyList.refresh(restriction);
		}
	},
	
	/**
	 * Edit event handler.
	 */
	abCbSurveyList_edit_onClick: function(row){
		var activityLogId = row.getFieldValue("activity_log.activity_log_id");
		var controller = this;
		var assessEditCtrl = View.controllers.get("abCbAssessEditCtrl");
		
		assessEditCtrl.activityLogId = activityLogId;
		this.abCbSurveyListTabs.selectTab("abCbSurveyListTab_2");
		assessEditCtrl.afterInitialDataFetch();
	},
	
	abCbSurveyList_onDoc: function(){
		var activityLogIds = this.abCbSurveyList.restriction.clauses[1].value;
		var restriction = {
				'abCbAssessListPgRptProj_ds': " activity_log.activity_log_id IN('" + activityLogIds.join("','") + "')",
				'abCbAssessListPgRptItems_ds': " activity_log.activity_log_id IN('" + activityLogIds.join("','") + "')"
			};
		
		var printableRestriction = [];
		printableRestriction.push({'title':getMessage('itemIdLabel'), 'value':activityLogIds.join(", ")});
		
		// set parameters for paginated report
		var parameters = {
				 'printRestriction':true, 
				 'printableRestriction': printableRestriction
			};
		
		View.openPaginatedReportDialog('ab-cb-assess-list-pgrpt.axvw', restriction, parameters);
	}
});