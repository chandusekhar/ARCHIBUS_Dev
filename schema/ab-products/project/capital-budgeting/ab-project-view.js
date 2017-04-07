var projectViewController = View.createController('projectView',{
	crtTreeNode: null,// selected tree node
	objTree: null,	
	nullValueCode: 'WW99',	
	quest: null,
	
    afterInitialDataFetch: function() {
        this.objTree = View.panels.get('projectView_projectTree');
    },
    
    projectView_console_onClear: function() {
    	$('status').value = "All";
    	this.projectView_console.clear();
    },
    
    projectView_console_onShow: function() {
    	var restriction = "1=1";
    	restriction += this.getConsoleRestrictionClause('project.bl_id');
    	restriction += this.getConsoleRestrictionClause('project.site_id');
    	restriction += this.getConsoleRestrictionClause('project.project_type');
    	restriction += this.getConsoleRestrictionClause('project.program_id');
    	restriction += this.getConsoleRestrictionClause('project.project_id');
    	var status = $('status').value;
    	if (status != 'All') restriction += " AND project.status = '" + status + "'";
    	this.projectView_projectTree.addParameter('project_restriction', restriction);
    	this.projectView_projectTree.refresh();
    },
    
    getConsoleRestrictionClause: function(fieldName) {
    	var restrictionClause = '';
    	var fieldValue = this.projectView_console.getFieldValue(fieldName);
    	if (fieldValue) restrictionClause += " AND " + fieldName + " LIKE \'%" + fieldValue.replace(/\'/g, "\'\'") + "%\'";
    	return restrictionClause;
    },
    
    projectView_projectForm4_afterRefresh: function() {	
		var q_id = 'Project - '.toUpperCase() + this.projectView_projectForm.getFieldValue('project.project_type');	
		this.quest = new Ab.questionnaire.Quest(q_id, 'projectView_projectForm4');
    },

	projectView_projectForm_afterRefresh: function() {
		var project_id = this.projectView_projectForm.getFieldValue('project.project_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', project_id);
		this.projectView_projectForm2.refresh(restriction);
		this.projectView_projectForm3.refresh(restriction);
		this.projectView_projectForm4.refresh(restriction);
	},
	
	projectView_workpkgForm_afterRefresh: function() {
		var work_pkg_id = this.projectView_workpkgForm.getFieldValue('work_pkgs.work_pkg_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
		this.projectView_workpkgForm2.refresh(restriction);
	},
	
	projectView_actionForm_afterRefresh: function() {
		var action_id = this.projectView_actionForm.getFieldValue('activity_log.activity_log_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_log_id', action_id);
		this.projectView_actionForm2.refresh(restriction);
		this.projectView_actionForm3.refresh(restriction);
		this.projectView_actionForm4.refresh(restriction);
	}
});

function onClickTreeNode(){
	var objTree = View.panels.get('projectView_projectTree');
	var crtNode = objTree.lastNodeClicked;
	var levelIndex = crtNode.level.levelIndex;
	var objTabs = View.panels.get('projectViewTabs');
	var controller = View.controllers.get('projectView');
	if(levelIndex == 0){
		projectView_onShowTab(objTabs, "projectView_projectTab", "project.project_id", crtNode, controller.nullValueCode);
	}
	if(levelIndex == 1){
		projectView_onShowTab(objTabs, "projectView_workpkgTab", "work_pkgs.work_pkg_id", crtNode, controller.nullValueCode);
	}
	if(levelIndex == 2){
		projectView_onShowTab(objTabs, "projectView_actionTab", "activity_log.activity_log_id", crtNode, controller.nullValueCode);
	}
	controller.crtTreeNode = crtNode;
}

function projectView_onShowTab(tabs, tab, field, crtNode, nullValue){
	var restriction = new Ab.view.Restriction();
	restriction.addClauses(crtNode.restriction);
	var clause = restriction.findClause(field);
	if(clause.value == nullValue){
		return;
	}
	restriction = removeNullClauses(restriction, nullValue);
	tabs.selectTab(tab, restriction, false, false, false);
}

function removeNullClauses(restriction, nullValue){
	var result = new Ab.view.Restriction();
	for( var i = 0; i< restriction.clauses.length; i++){
		var clause = restriction.clauses[i];
		if(clause.value != nullValue){
			result.addClause(clause.name, clause.value, clause.op, clause.relOp, false);
		}
	}
	return result;
}

function afterGeneratingTreeNode(node){
	var label = node.label;
	var controller = View.controllers.get('projectView');
	var levelIndex = node.level.levelIndex;
	var msg_id = '';
	if(levelIndex == 0){
		msg_id = 'msg_no_project_id';
	}else if(levelIndex == 1){
		msg_id = 'msg_no_workpkg_id';
	}
	if(label.indexOf(controller.nullValueCode)!= -1){
		var labelText = label.replace(controller.nullValueCode, getMessage(msg_id));
		node.setUpLabel(labelText);
	}
}