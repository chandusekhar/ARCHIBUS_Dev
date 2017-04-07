var abEamAddEditActionController = View.createController('abEamAddEditActionController', {
	// array object
	projectIds: null,
	
	restriction: null,
	
	newRecord: null,
	// array object
	floors: null,
	
	callbackMethod: null,

	afterViewLoad: function(){
		if(valueExists(this.view.parameters) && valueExists(this.view.parameters.projectIds)){
			this.projectIds = this.view.parameters.projectIds;
		}

		if(valueExists(this.view.parameters) && valueExists(this.view.parameters.floors)){
			this.floors = this.view.parameters.floors;
		}

		if(valueExists(this.view.parameters) && valueExists(this.view.parameters.callback)){
			this.callbackMethod = this.view.parameters.callback;
		}
		this.restriction = this.view.restriction;
		this.newRecord = this.view.newRecord;
	},

	afterInitialDataFetch: function(){
		this.abEamAction_form.refresh(this.restriction);
		if(valueExists(this.projectIds)){
			this.abEamAction_form.setFieldValue('activity_log.project_id', this.projectIds[0]);
			this.abEamAction_form.enableField('activity_log.project_id', this.projectIds.length > 1);
		}
	},
	
	abEamAction_form_afterRefresh: function(){
		var title = this.abEamAction_form.newRecord?getMessage('titleAddNew'):getMessage('titleEdit');
		this.abEamAction_form.setTitle(title);
	},
	
	rollupActionCostToProject: function(projectId){
		if (valueExistsNotEmpty(projectId)) {
			try{

				var parameters = {
						'project_id': projectId
				};
				
				Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-rollUpActionCostsToProjects',parameters);			
				return true;
				
			} catch(e){
				
				Workflow.handleError(e);
				return false;
			}
		}
	}
	
});

function callCallbackMethod(){
	var controller = View.controllers.get('abEamAddEditActionController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
	return true;
}

function selectValueProject(){
	var controller = View.controllers.get('abEamAddEditActionController');
	var restriction = new Ab.view.Restriction();
	if (valueExists(controller.projectIds)) {
		restriction.addClause('project.project_id', controller.projectIds, 'IN');
	}
	
	View.selectValue(
		'abEamAction_form',
		getMessage('titleSelectValueProjectId'),
		['activity_log.project_id'],
		'project',
		['project.project_id'],
		['project.project_id', 'project.project_name', 'project.status', 'project.summary'],
		restriction
	);
}

function rollupCost(){
	var controller = View.controllers.get('abEamAddEditActionController');
	var projectId = controller.abEamAction_form.getFieldValue('activity_log.project_id');
	controller.rollupActionCostToProject(projectId);
}

function saveMultipleFloors(){
	var controller = View.controllers.get('abEamAddEditActionController');
	var floors = controller.floors;
	if(valueExists(floors) && floors.length > 1){
		if(floors.length > 1){
			var record = controller.abEamAction_form.getRecord();
			var dataSource = controller.abEamAction_form.getDataSource(); 
			for(var i =0 ; i< floors.length-1; i++ ){
				record.setValue('activity_log.fl_id', floors[i]);
				dataSource.saveRecord(record);
			}
			controller.abEamAction_form.setFieldValue('activity_log.fl_id', floors[floors.length-1]);
		}else{
			controller.abEamAction_form.setFieldValue('activity_log.fl_id', floors[0]);
		}
	}
	return true;
}


