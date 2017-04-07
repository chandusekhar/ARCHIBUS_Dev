var projFcpmDashQcProjsController = View.createController('projFcpmDashQcProjs',{
	
	afterViewLoad: function(){
		this.projFcpmDashQcProjs_grid.afterCreateDataRows = this.projFcpmDashQcProjs_grid_afterCreateDataRows;
	},
	
	afterInitialDataFetch: function() {
		this.projFcpmDashQcProjs_grid.setCategoryColors({'Issued-On Hold': '#FF3300', 'Issued-Stopped': '#FF3300', 'Issued-In Process': '#33CC33', 'Approved': '#6600CC', 'Completed-Pending': '#000000', 'Completed-Not Ver': '#000000', 'Completed-Verified': '#000000', 'Closed': '#000000', 'Approved-Cancelled': '#000000'});
		this.projFcpmDashQcProjs_grid.setCategoryConfiguration({
    		fieldName: 'project.status',
    		order: ['Approved','Issued-In Process','Issued-On Hold','Issued-Stopped','Completed-Pending', 'Completed-Not Ver', 'Completed-Verified', 'Closed','Approved-Cancelled'],
    		getStyleForCategory: this.getStyleForCategory
    	});
    	this.projFcpmDashQcProjs_grid.update();
	},
	
	getStyleForCategory: function(record) {
    	var style = {};
    	var status = record.getValue('project.status');
    	var targetPanel = View.panels.get('projFcpmDashQcProjs_grid');
    	style.color = targetPanel.getCategoryColors()[status]; 
    	return style;
   },
   
   projFcpmDashQcProjs_grid_afterCreateDataRows: function(parentElement, columns){
	   this.gridRows.each(function(gridRow){
		   var projectStatus = gridRow.getFieldValue('project.status');
		   var btnLabel = null;
		   if (projectStatus == 'Approved') {
			   btnLabel = getMessage('btnLabel_issue');
		   }else if (projectStatus == 'Issued-In Process') {
			   btnLabel = getMessage('btnLabel_complete');
		   }else if (projectStatus == 'Completed-Not Ver') {
			   btnLabel = getMessage('btnLabel_verify');
		   } else if (projectStatus == 'Completed-Verified') {
			   btnLabel = getMessage('btnLabel_close');
		   }
		   if (valueExistsNotEmpty(btnLabel)) {
			   gridRow.cells.get('updateStatus').dom.firstChild.value = btnLabel;
		   }else{
			   gridRow.cells.get('updateStatus').dom.firstChild.style.display = 'none';
		   }
	   });
   },
   
   abProjRecord_form_afterRefresh: function(){
	   var objStatusValues = {
			   'Created':'Created',
			   'Requested':'Requested',
			   'Requested-Estimated':'Requested-Estimated',
			   'Requested-On Hold':'Requested-On Hold',
			   'Requested-Routed':'Requested-Routed for Approval',
			   'Requested-Rejected':'Requested-Rejected'
	   };
	   
	   this.abProjRecord_form.fields.get('project.status').removeOptions(objStatusValues);
   },
   
   abProjRecord_form_onSave: function(){
	   if (this.abProjRecord_form.canSave()) {
		   var dataSource = this.abProjRecord_form.getDataSource();
		   var dateStart =  dataSource.parseValue('project.date_start',  this.abProjRecord_form.getFieldValue('project.date_start'), false);
		   var dateTargetEnd = dataSource.parseValue('project.date_start',  this.abProjRecord_form.getFieldValue('project.date_target_end'), false);
		   if (dateTargetEnd < dateStart) {
			   View.showMessage(getMessage('errDateTargetEnd'));
			   return false;
		   }
		   
		   try {
			   this.abProjRecord_form.save();
			   this.projFcpmDashQcProjs_grid.refresh(this.projFcpmDashQcProjs_grid.restriction);
			   this.abProjRecord_form.closeWindow();
		   }catch (e) {
			   Workflow.handleError(e);
		   }
	   }
   }
});


function openProjectDetails(ctx){
	var projectId = ctx.row.getFieldValue('project.project_id');
	var viewContent = View.getParentViewPanel();
	viewContent.loadView('ab-proj-mng.axvw', new Ab.view.Restriction({'project.project_id': projectId}), true);
}


function onUpdateStatus(ctx){
	var objProjectDs = View.dataSources.get('abProjRecord_ds');
	var gridRow = ctx.row;
	var projectRecord = objProjectDs.getRecord(new Ab.view.Restriction({'project.project_id': gridRow.getFieldValue('project.project_id')}));
	var projectStatus = gridRow.getFieldValue('project.status');
	if (projectStatus == 'Approved') {
		projectRecord.setValue('project.status', 'Issued-In Process');
	}else if (projectStatus == 'Issued-In Process') {
		projectRecord.setValue('project.status', 'Completed-Not Ver');
	}else if (projectStatus == 'Completed-Not Ver') {
		projectRecord.setValue('project.status', 'Completed-Verified');
	} else if (projectStatus == 'Completed-Verified') {
		projectRecord.setValue('project.status', 'Closed');
	}
	
	try{
		projectRecord.isNew = false;
		objProjectDs.saveRecord(projectRecord);
		ctx.grid.refresh(ctx.grid.restriction);
		
	}catch(e){
		Workflow.handleError(e);
	}
}