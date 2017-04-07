var projectTemplatesEditController = View.createController('projectTemplatesEdit', {
	projectTemplatesEdit_actionsGrid_afterRefresh : function() {
		if (this.projectTemplatesEdit_actionsGrid.restriction) {
			var project_id = this.projectTemplatesEdit_actionsGrid.restriction['project.project_id'];
			this.projectTemplatesEdit_actionsGrid.appendTitle(project_id);
		}
	}
});