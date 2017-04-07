var abCbActionListCtrl = View.createController('abCbActionListCtrl', {
	// selected action items
	pKeys: [],
	
	// callback method 
	callback: null,
	
	projProbType: null,
	
	// read input data
	afterViewLoad: function(){
		// pKeys
		if(valueExists(this.view.parameters.pKeys)){
			this.pKeys = this.view.parameters.pKeys;
		}
		if(valueExists(this.view.parameters.projProbType)){
			this.projProbType = this.view.parameters.projProbType;
		}
		// callback method if exists
		if(valueExists(this.view.parameters.callback)){
			this.callback = this.view.parameters.callback;
			this.callback.call();
		}
		
	},
	// refresh action list
	afterInitialDataFetch: function(){
		var restriction = new Ab.view.Restriction();
		if(this.pKeys.length > 0){
			restriction.addClause("activity_log.activity_log_id", this.pKeys, "IN");
		}	
		this.abCbActionList.refresh(restriction);
	},
	/**
	 * Edit handler.
	 */
	abCbActionList_edit_onClick: function(row){
		var projectId = row.getFieldValue("activity_log.project_id");
		var controller = this;
		View.openDialog('ab-cb-action-add-edit.axvw', null, false, {
			width: 1024,
			height: 900,
			projectId: projectId,
			projProbType: controller.projProbType,
			selKeys: [],
			selRow: row.record,
			pageMode: 'action',
			callback: function(res){
				if(res){
					controller.pKeys.push(res);
				}
				controller.afterInitialDataFetch();
				controller.callback.call();
			}
		});
	},
	
	abCbActionList_afterRefresh:function(){
		aux=1;
	}
	
});