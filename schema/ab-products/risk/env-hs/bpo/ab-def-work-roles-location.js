/**
 * View's controller
 */
var abDefWorkRolesLocationController = View.createController('abDefWorkRolesLocationCtrl',{
	//the Work Role Name from the last selected record, used for expand tree on refresh
	savedWorkRoleName: null,
	
	afterInitialDataFetch: function(){
		//expand tree panel
		this.abDefWorkRolesLocation_treeWorkRoles.expand();
	},
	
	abDefWorkRolesLocation_form_afterRefresh: function(){	
		//set the Work Role Name from the last selected record
		this.savedWorkRoleName = this.abDefWorkRolesLocation_form.getFieldValue('work_roles_location.work_role_name');
	},
	
	abDefWorkRolesLocation_form_beforeSave: function(){
		var formPanel = this.abDefWorkRolesLocation_form;
		
		// check that only one of the location fields has been entered (property or site or building)
		var filledLocationCount = 0;
		
		if(valueExistsNotEmpty(formPanel.getFieldValue("work_roles_location.pr_id"))){
			filledLocationCount++;
		}
		if(valueExistsNotEmpty(formPanel.getFieldValue("work_roles_location.site_id"))){
			filledLocationCount++;
		}
		if(valueExistsNotEmpty(formPanel.getFieldValue("work_roles_location.bl_id"))){
			filledLocationCount++;
		}
		
		if (filledLocationCount == 1){
			return true;
		}else if(filledLocationCount < 1){
			View.showMessage(getMessage("selectOneLocation"));
			return false;
		}else{
			View.showMessage(getMessage("selectOnlyOneLocation"));
			return false;
		}
	},
	
	/**
	 * Show the edit form
	 */
	showEditForm: function(show, newRecord, cmdObject){
		this.abDefWorkRolesLocation_form.show(show);

		if (show) {
			this.abDefWorkRolesLocation_form.refresh(cmdObject ? cmdObject.restriction : null, newRecord);
			this.initForm();
        }
	},
	
	/**
	 * Initialize the form with the Work Role Name of the last clicked node in the tree or the first node
	 */
	initForm: function(){
		var currentNode = this.abDefWorkRolesLocation_treeWorkRoles.lastNodeClicked;
		if(!currentNode){
			if(this.abDefWorkRolesLocation_treeWorkRoles._nodes.length > 0){
				currentNode = this.abDefWorkRolesLocation_treeWorkRoles._nodes[0];
			}
		}
		if(currentNode){
			var workRoleName = currentNode.data['work_roles.work_role_name'];
			if(!valueExistsNotEmpty(workRoleName)){
				workRoleName = currentNode.data['work_roles_location.work_role_name'];
			}
			if(valueExistsNotEmpty(workRoleName)){
				this.abDefWorkRolesLocation_form.setFieldValue('work_roles_location.work_role_name', workRoleName);
			}
		}
	},
	
	/**
	 * Refreshes the tree and selects the work role of the last selected record, if any
	 */
	refreshTreeAndSelect: function(){
		this.abDefWorkRolesLocation_treeWorkRoles.refresh();
		
		var rootNode = this.abDefWorkRolesLocation_treeWorkRoles.treeView.getRoot();
		if(valueExistsNotEmpty(this.savedWorkRoleName)){
			/* Search the node of the work role, to expand it */
	        for (var i = 0; i < rootNode.children.length; i++) {
	            var node = rootNode.children[i];
	            if (node.data['work_roles.work_role_name'] == this.savedWorkRoleName) {
	            	this.abDefWorkRolesLocation_treeWorkRoles.expandNode(node);

	            	break;
	            }
	        }
		}
	}
})