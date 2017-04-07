var abEhsDefWorkCategCtrl = View.createController('abEhsDefWorkCategCtrl',{
	
	afterViewLoad: function(){
		this.abEhsDefWorkCateg_tree.setTreeNodeConfigForLevel(0,   
				[{fieldName: 'work_categories.work_category_id'},
                 {fieldName: 'work_categories.description', length: 50}]);
	},
	
	afterInitialDataFetch: function(){
		this.abEhsDefWorkCateg_tree.expand();
	},
	
	abEhsDefWorkCateg_form_afterRefresh: function(){
		var hierarchyIds = this.abEhsDefWorkCateg_form.getFieldValue("work_categories.hierarchy_ids");
		var workCategoryId = this.abEhsDefWorkCateg_form.getFieldValue("work_categories.work_category_id");
		if(!this.abEhsDefWorkCateg_form.newRecord){
			//show the current selection for Work Category Code in the work Category Code field, but NOT in the Hierarchy Trace field
			
			//remove hierarchyIds last element
			var hierarchyIdsArray = hierarchyIds.split("|");
			//hierarchyIds ends with | sign and the last element of array is empty
			
			var hierarchyIdsArrayLength = hierarchyIdsArray.length;
			if(hierarchyIdsArrayLength>1){
				hierarchyIdsArray.remove(hierarchyIdsArray[hierarchyIdsArrayLength-2]);
			}
			this.abEhsDefWorkCateg_form.setFieldValue("work_categories.hierarchy_ids", hierarchyIdsArray.join("|"));
		}
	},
	
	abEhsDefWorkCateg_tree_onAddNew: function(){
		this.abEhsDefWorkCateg_form.refresh(null, true);
		var node = this.abEhsDefWorkCateg_tree.lastNodeClicked;
		var hierarchyIds = "";
		var workCategoryId = "";
		if(node){
			hierarchyIds = node.data["work_categories.hierarchy_ids"];
			workCategoryId = node.data["work_categories.work_category_id"];
		}
		if(valueExistsNotEmpty(hierarchyIds)){
			this.abEhsDefWorkCateg_form.setFieldValue("work_categories.hierarchy_ids", hierarchyIds);
		}
	},
	
	abEhsDefWorkCateg_form_beforeSave: function(){
		var hierarchyIds = this.abEhsDefWorkCateg_form.getFieldValue("work_categories.hierarchy_ids");
		var workCategoryId = this.abEhsDefWorkCateg_form.getFieldValue("work_categories.work_category_id");
		if(this.abEhsDefWorkCateg_form.newRecord){
			if(valueExistsNotEmpty(hierarchyIds)){
				this.abEhsDefWorkCateg_form.setFieldValue("work_categories.hierarchy_ids", hierarchyIds + workCategoryId + "|");
			}else{
				this.abEhsDefWorkCateg_form.setFieldValue("work_categories.hierarchy_ids", workCategoryId + "|");
			}
		}else{
			//if current category has subcategories Work Category Code can't be changed
			var oldValues = this.abEhsDefWorkCateg_form.getOldFieldValues();
			var newValues = this.abEhsDefWorkCateg_form.getFieldValues();
			var isRoot = false;
			
			if(!valueExistsNotEmpty(hierarchyIds)){
				isRoot = true;
			}
			
			if(oldValues["work_categories.work_category_id"]!=newValues["work_categories.work_category_id"]){
				var restriction = new Ab.view.Restriction();
				restriction.addClause("work_categories.hierarchy_ids", oldValues["work_categories.hierarchy_ids"], "LIKE", "OR");
				var records = this.abEhsDefWorkCateg_ds.getRecords(restriction).length;
				if(records>1){
					View.showMessage(getMessage("hasChild"));
					return false;
				}
			}
			
			//replace hierarchyIds last element with the new workCategoryId
			hierarchyIdsArray = hierarchyIds.split("|");
			
			//hierarchyIds ends with | sign and the last element of array is empty
			if(hierarchyIdsArray.length>1){
				hierarchyIdsArray[hierarchyIdsArray.length-1] = workCategoryId;
			}
			if(isRoot){
				hierarchyIdsArray[0] = workCategoryId;
			}
			
			var newHierarchyId = hierarchyIdsArray.join("|");
			
			if(newHierarchyId.charAt(newHierarchyId.length-1) != "|"){
				newHierarchyId += "|";
			}
			
			this.abEhsDefWorkCateg_form.setFieldValue("work_categories.hierarchy_ids", newHierarchyId);
		}
		return true;
	},
	
	refreshTree: function(){
		this.abEhsDefWorkCateg_tree.refresh();
		this.abEhsDefWorkCateg_tree.expand();
	},
		
	/**
	 * Delete selected record and all its child records.
	 */
	abEhsDefWorkCateg_form_onDelete: function(){
		var controller = this;
		var confirmMessage = getMessage('confirmDelete').replace("{0}",this.abEhsDefWorkCateg_form.getFieldValue("work_categories.work_category_id"));
		View.confirm(confirmMessage, function(button){
	        if (button == 'yes') {
	        	try{
	        		var workCategoryId = controller.abEhsDefWorkCateg_form.getFieldValue("work_categories.work_category_id");
	        		var hierarchyIds = controller.abEhsDefWorkCateg_form.getFieldValue("work_categories.hierarchy_ids");
	        		var restriction = new Ab.view.Restriction();
	        		if(valueExistsNotEmpty(hierarchyIds)){
	    				restriction.addClause("work_categories.hierarchy_ids", hierarchyIds + workCategoryId + "|", "LIKE", "OR");
	    			}else{
	    				restriction.addClause("work_categories.hierarchy_ids", workCategoryId + "|", "LIKE", "OR");
	    			}
	        		
	        		var records = controller.abEhsDefWorkCateg_ds.getRecords(restriction);
	        		for (var index = 0; index < records.length; index++ ){
	        			controller.abEhsDefWorkCateg_ds.deleteRecord(records[index]);
	        		}
	        		controller.abEhsDefWorkCateg_form.show(false);
	        		controller.refreshTree();
	        		clearLastNodeClicked();
		        }catch(e){
		    		Workflow.handleError(e);
		    		return false;
		    	}
	        }
	    });
	}
})

function clearLastNodeClicked(){
	abEhsDefWorkCategCtrl.abEhsDefWorkCateg_tree.lastNodeClicked = null;
}
