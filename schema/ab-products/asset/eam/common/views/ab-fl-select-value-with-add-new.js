var abFlSelectValueCtrl = View.createController('abFlSelectValueCtrl', {
	restriction: null,
	
	selectValueType: null,
	multipleSelectionEnabled: false,
	
	blId: null,
	flId: null,
	
	callbackMethod: null,
	
	afterViewLoad: function(){
		if(valueExists(this.view.restriction)){
			this.restriction = this.view.restriction;
		} else if (valueExists(this.view.parameters) && valueExists(this.view.parameters.restriction)){
			this.restriction = this.view.parameters.restriction;
		}

		if (valueExists(this.view.parameters) && valueExists(this.view.parameters.selectValueType)) {
			this.selectValueType = this.view.parameters.selectValueType;
			this.multipleSelectionEnabled = this.selectValueType == 'multiple';
		}

		if (valueExists(this.view.parameters) && valueExists(this.view.parameters.blId)) {
			this.blId = this.view.parameters.blId;
			this.abFlSelectValue_list.filterValues = {'fl.bl_id': this.blId};
		}
		
		if (valueExists(this.view.parameters) && valueExists(this.view.parameters.flId)) {
			this.flId = this.view.parameters.flId;
			this.abFlSelectValue_list.filterValues = {'fl.fl_id': this.flId};
		}
		
		if (valueExists(this.view.parameters) && valueExists(this.view.parameters.callback)) {
			this.callbackMethod = this.view.parameters.callback;
		}
		this.abFlSelectValue_list.addEventListener('onMultipleSelectionChange', abFlSelectValue_list_onMultipleSelectionChange); 
		
	},
	
	afterInitialDataFetch: function(){
		this.abFlSelectValue_list.showColumn('multipleSelectionColumn', this.multipleSelectionEnabled);
		this.abFlSelectValue_list.update();
		this.abFlSelectValue_list.refresh();
		if(this.multipleSelectionEnabled){
			this.abFlSelectValue_list.enableAction('saveSelected', this.abFlSelectValue_list.getSelectedRows().length > 0);
		}
	},
	
	abFlSelectValue_list_afterRefresh: function(){
		var doRefresh = false;
		if(valueExists(this.blId)){
			this.abFlSelectValue_list.filterValues = {'fl.bl_id': this.blId};
			this.abFlSelectValue_list.setFilterValue('fl.bl_id', this.blId);
			this.blId = null;
			doRefresh = true;
		}
		if(valueExists(this.flId)){
			this.abFlSelectValue_list.filterValues = {'fl.fl_id': this.flId};
			this.abFlSelectValue_list.setFilterValue('fl.fl_id', this.flId);
			this.flId = null;
			doRefresh = true;
		}
		
		if(doRefresh){
			this.abFlSelectValue_list.refresh();
		}
	},
	
	abFlSelectValue_form_onSave: function(){
		if(this.abFlSelectValue_form.save()){
			this.abFlSelectValue_list.refresh(this.abFlSelectValue_list.restriction);
			this.abFlSelectValue_form.closeWindow();
		}
	},
	
	abFlSelectValue_list_onMultipleSelectionChange: function(row){
		this.abFlSelectValue_list.enableAction('saveSelected', this.abFlSelectValue_list.getSelectedRows().length > 0);
	},
	
	abFlSelectValue_list_onSaveSelected: function(){
		var rows = this.abFlSelectValue_list.getSelectedGridRows();
		if(valueExists(this.callbackMethod) && 
				rows.length > 0 ){
			this.callbackMethod(rows); 
			View.closeThisDialog();
		}
	}
});

/**
 * On select row event handler.
 */
function onSelectRow(ctx){
	var controller = View.controllers.get('abFlSelectValueCtrl');
	var selGridRow = controller.abFlSelectValue_list.gridRows.get(controller.abFlSelectValue_list.selectedRowIndex);
	var rows = new Array();
	rows.push(selGridRow);
	if(valueExists(controller.callbackMethod) && 
			rows.length > 0){
		controller.callbackMethod(rows); 
		View.closeThisDialog();
	}
}

function abFlSelectValue_list_onMultipleSelectionChange(row){
	var controller = View.controllers.get('abFlSelectValueCtrl');
	controller.abFlSelectValue_list_onMultipleSelectionChange(row);
}