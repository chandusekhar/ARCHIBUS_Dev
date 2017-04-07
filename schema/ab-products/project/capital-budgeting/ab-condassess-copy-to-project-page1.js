var condassessCopyToProjectPage1Controller = View.createController('condassessCopyToProjectPage1', {
	
	condassessCopyToProjectPage1Grid_afterRefresh: function(){
		this.condassessCopyToProjectPage1Grid.setTitle(getMessage("gridTitle")+" - " + this.condassessCopyToProjectPage1Grid.restriction['project.project_id']);
	},
	
	condassessCopyToProjectPage1Grid_onCopy : function() {
		var selectedItems = new Array();	
		var selectedRows = this.condassessCopyToProjectPage1Grid.getSelectedRows();
		if (selectedRows.length == 0) {
			View.alert(getMessage('noItemsSelected'));
			return;
		}
	    for (var i = 0; i < selectedRows.length; i++) {
	        var row = selectedRows[i];
	
	        var action_id = row['activity_log.activity_log_id'];
	        selectedItems.push(action_id);
	    }
	    
		var condassessCopyToProjectController = View.getOpenerView().controllers.get('condassessCopyToProject');
	    condassessCopyToProjectController.strSelectedItems = selectedItems.toString();
	    condassessCopyToProjectController.condassessProject = this.condassessCopyToProjectPage1Grid.restriction['project.project_id'];
	    
	    this.condassessCopyToProjectPage1Grid.show(false);
		var tabs = View.getOpenerView().panels.get('condassessCopyToProjectTabs');
		tabs.selectTab('condassessCopyToProjectPage2');
	}
});