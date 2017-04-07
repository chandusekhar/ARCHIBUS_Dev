var abBlSelectValueCtrl = View.createController('abBlSelectValueCtrl', {
	
	restriction: null,
	
	blId: null,
	
	callbackMethod: null,
	
	afterViewLoad: function(){
		if(valueExists(this.view.restriction)){
			this.restriction = this.view.restriction;
		} else if (valueExists(this.view.parameters) && valueExists(this.view.parameters.restriction)){
			this.restriction = this.view.parameters.restriction;
		}
		
		if (valueExists(this.view.parameters) && valueExists(this.view.parameters.blId)) {
			this.blId = this.view.parameters.blId;
			this.abBlSelectValue_list.filterValues = {'bl.bl_id': this.blId};
		}
		
		if (valueExists(this.view.parameters) && valueExists(this.view.parameters.callback)) {
			this.callbackMethod = this.view.parameters.callback;
		}
		
	},
	
	afterInitialDataFetch: function(){
		this.abBlSelectValue_list.refresh();
	},
	
	abBlSelectValue_list_afterRefresh: function(){
		if(valueExists(this.blId)){
			this.abBlSelectValue_list.filterValues = {'bl.bl_id': this.blId};
			this.abBlSelectValue_list.setFilterValue('bl.bl_id', this.blId);
			this.blId = null;
		}
	},
	
	abBlSelectValue_form_onSave: function(){
		if(this.abBlSelectValue_form.save()){
			this.abBlSelectValue_list.refresh(this.abBlSelectValue_list.restriction);
			this.abBlSelectValue_form.closeWindow();
		}
	}
});

/**
 * On select row event handler.
 */
function onSelectRow(ctx){
	var controller = View.controllers.get('abBlSelectValueCtrl');
	var selGridRow = controller.abBlSelectValue_list.gridRows.get(controller.abBlSelectValue_list.selectedRowIndex);
	if(valueExists(controller.callbackMethod) && 
			valueExists(selGridRow)){
		controller.callbackMethod(selGridRow); 
		View.closeThisDialog();
	}
}