/**
 * @author Valentina Sandu
 * 11/02/2016
 */
var abAcEditCtrl = View.createController('abAcEditCtrl',{

	/**
	 * get the parent node depending on the action done on the tree nodes
	 * 
	 */
	getParentNode: function(treePanel, detailsPanel, isNewRecord){
		var currentNode = treePanel.lastNodeClicked;
		if(isNewRecord){
			if(currentNode!=null){
				return treePanel.lastNodeClicked;
			}else{
				return treePanel.treeView.getRoot();
			}
			
		}else{
			var oldFieldValue = detailsPanel.getOldFieldValues()["ac.ac_id"];
			if(currentNode != null){
				for(var i=0;i<currentNode.children.length;i++){
					var tmpNode = currentNode.children[i];
					if(tmpNode.data["ac.ac_id"] == oldFieldValue){
						currentNode = tmpNode;
						break;
					}
				}
				return currentNode.parent;
			}else{
				return treePanel.treeView.getRoot();
			}
		}
		
    },
	
	/**
	 *  refresh tree based on parent node, expand the child 
	 *  in case the action is done on it
	 */
	refreshTree: function(parentNode){
		var treePanel = this.abAcEdit_treePanel;
		if(parentNode.isRoot()){
			treePanel.refresh();
		}else{
			treePanel.expandNode(parentNode);
		}
		
	},
	
	/**
	 * refresh tree panel and set the details panel invisible
	 */
	
	abAcEdit_treePanel_onRefresh: function(){
        this.abAcEdit_treePanel.refresh();
        this.abAcEdit_detailsPanel.show(false);
	},
	
    /**
     * action after adding a record using Add New button, 
     * the method checks if parent node is root, parent or a child:
     * hierarchy_ids will be updated accordingly
     */
	
	addNewRecord: function(parentNode, newRecordId){
		if(parentNode.isRoot()){
			this.abAcEdit_detailsPanel.setFieldValue("ac.hierarchy_ids", newRecordId + '|');
		}else{
			var hierarchyIds = parentNode.data["ac.hierarchy_ids"];
			this.abAcEdit_detailsPanel.setFieldValue("ac.hierarchy_ids", hierarchyIds + newRecordId + '|');
		}
		this.abAcEdit_detailsPanel.save();
	},
	
	/**
	 * called on Save action, when saving a record after modification
	 * updates all children nodes
	 * 
	 */	
	updateChildNodes: function(newRecordId, oldRecordId){
		var dataSource = this.abAcEdit_ds_0;
	    var restriction = "ac.hierarchy_ids LIKE '%" + oldRecordId + "|%'";
		var dataRecords = dataSource.getRecords(restriction);
		for(var i= 0; i < dataRecords.length; i++ ) {
			var record = dataRecords[i];
			var hierarchyId = record.getValue("ac.hierarchy_ids");
			record.setValue("ac.hierarchy_ids", hierarchyId.replace("|" + oldRecordId + "|", "|" + newRecordId + "|"));
			record.isNew = false;
			dataSource.saveRecord(record);
		}
	},
	
	/**
	 * method called on Delete action
	 * deletes all records and its children 
	 */	
	deleteNodes: function(detailsPanel){
		var dataSource = this.abAcEdit_ds_0;
		var recordForDel = detailsPanel.getFieldValue("ac.ac_id");
	    var restriction = "ac.hierarchy_ids LIKE '%" + recordForDel + "|%'";
		var dataRecords = dataSource.getRecords(restriction);
		for(var i= 0; i < dataRecords.length; i++ ) {
			var record = dataRecords[i];
			dataSource.deleteRecord(record);
		}
	},
	
	/**
	 * Action when pressing Filter button
	 * added custom restrictions for database  
	 * Each filter option has also multiple selection options
	 * Check hierarchyIds of records for both parent and children
	 */	
	abAcEditFilterConsole_onFilter: function(){
		var sqlRestriction = "";
		
		var acId = [];
		var filterConsole = this.abAcEditFilterConsole;
		var treePanel = this.abAcEdit_treePanel;
		
		if(filterConsole.hasFieldMultipleValues('ac.ac_id')){
			acId = filterConsole.getFieldMultipleValues('ac.ac_id');
			
			for(var i=0;i<acId.length;i++){
				if(valueExistsNotEmpty(filterConsole.getFieldValue('ac.ac_id'))){
					sqlRestriction +=  (valueExistsNotEmpty(sqlRestriction) ? (i==0 ? " AND " : " OR ") : "") + " ac.ac_id LIKE '%" + acId[i]+"%' ";
					
				}
			}
			sqlRestriction = "(" + sqlRestriction +  ")";
		}else if(valueExistsNotEmpty(filterConsole.getFieldValue('ac.ac_id'))){
			acId = filterConsole.getFieldValue('ac.ac_id');
			sqlRestriction += (valueExistsNotEmpty(sqlRestriction) ? " AND " : "") + " ac.ac_id LIKE '%"+ acId +"%' ";
		}
		
		var coaSourceId = [];
		
		if(filterConsole.hasFieldMultipleValues('ac.coa_source_id')){
			coaSourceId = filterConsole.getFieldMultipleValues('ac.coa_source_id');
			sqlRestriction += (valueExistsNotEmpty(sqlRestriction) ? " AND " : "") + " ac.coa_source_id IN ('" + coaSourceId.join("','")+"')";
		}else if(valueExistsNotEmpty(filterConsole.getFieldValue('ac.coa_source_id'))){
			coaSourceId = filterConsole.getFieldValue('ac.coa_source_id');
			sqlRestriction += (valueExistsNotEmpty(sqlRestriction) ? " AND " : "") + "ac.coa_source_Id LIKE '"+ coaSourceId +"%'";
		}
		
		var coaCostGroupId = [];
		
		if(this.abAcEditFilterConsole.hasFieldMultipleValues('ac.coa_cost_group_id')){
			coaCostGroupId = filterConsole.getFieldMultipleValues('ac.coa_cost_group_id');
			sqlRestriction += (valueExistsNotEmpty(sqlRestriction) ? " AND " : "") + " ac.coa_cost_group_id IN ('" + coaCostGroupId.join("','")+"')";
		}else if(valueExistsNotEmpty(filterConsole.getFieldValue('ac.coa_cost_group_id'))){
			coaCostGroupId = filterConsole.getFieldValue('ac.coa_cost_group_id');
			sqlRestriction += (valueExistsNotEmpty(sqlRestriction) ? " AND " : "") + "ac.coa_cost_group_id LIKE '"+ coaCostGroupId +"%'";
		}
		
		var description = null;
		
		if(valueExistsNotEmpty(filterConsole.getFieldValue('ac.description'))){
			description = filterConsole.getFieldValue('ac.description');
			sqlRestriction += (valueExistsNotEmpty(sqlRestriction) ? " AND " : "") + "ac.description LIKE '%"+ description +"%'";
		}
		
		sqlRestriction += (valueExistsNotEmpty(sqlRestriction) ? " OR " : "") +" EXISTS (SELECT * FROM ac ${sql.as} ac_int where ac_int.hierarchy_ids LIKE '' ${sql.concat} LTRIM(RTRIM(ac.ac_id)) ${sql.concat} '|%'"
			+ (valueExistsNotEmpty(sqlRestriction) ? " AND ( " : "")  + sqlRestriction.replace(/ac\./g, 'ac_int.') 
			+ (valueExistsNotEmpty(sqlRestriction) ? " )) " : ")")+
			" OR EXISTS (SELECT * FROM ac ${sql.as} ac_int where ac_int.hierarchy_ids LIKE '%' ${sql.concat} LTRIM(RTRIM(ac.ac_id)) ${sql.concat} '|%'"
			+(valueExistsNotEmpty(sqlRestriction) ? " AND ( " : "") 
			+sqlRestriction.replace(/ac\./g, 'ac_int.') 
			+ (valueExistsNotEmpty(sqlRestriction) ? " )) " : ")");
		
		
		treePanel.addParameter('sqlRestriction', sqlRestriction);
		treePanel.refresh();
		
		this.abAcEdit_detailsPanel.show(false, true);
	
	},
	
	
	/**
	 * action for Save button, treated differently for update of a record
	 * or adding new record
	 */
	abAcEdit_detailsPanel_onSave: function(){
		var isNewRecord = this.abAcEdit_detailsPanel.newRecord;
		var oldRecordId = this.abAcEdit_detailsPanel.getOldFieldValues()["ac.ac_id"];
		var newRecordId = this.abAcEdit_detailsPanel.getFieldValue("ac.ac_id");
		var lastNode = this.abAcEdit_treePanel.lastNodeClicked;
		var parentNode = this.getParentNode(this.abAcEdit_treePanel, this.abAcEdit_detailsPanel, isNewRecord);
		
		if (this.abAcEdit_detailsPanel.save()) {
			if (!isNewRecord) {
				this.updateChildNodes(newRecordId, oldRecordId);
			}else{
				this.addNewRecord(parentNode, newRecordId);
			}
			this.refreshTree(parentNode);
			this.abAcEdit_detailsPanel.show(false, true);
		}
	},
	
	/**
	 * action for Delete button, the message will be generic,
	 * the children of the selected record for deletion will also be deleted
	 */
	 abAcEdit_detailsPanel_onDelete: function() {
		var controller = this; 
		var dataSource = this.abAcEdit_ds_1;
		var treePanel = this.abAcEdit_treePanel;
		var detailsPanel = this.abAcEdit_detailsPanel;
		var record = this.abAcEdit_detailsPanel.getRecord();
		var acIdFieldValue = record.getValue("ac.ac_id");
		var node = treePanel.lastNodeClicked;
		var parentNode = this.getParentNode(treePanel, detailsPanel, false);
		
        if (!acIdFieldValue) {
            return;
        }
		
        var deleteMessage="";
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', acIdFieldValue);
        
        View.confirm(confirmMessage, function(button){
                 if (button == 'yes') {
                     try {
                    	    controller.deleteNodes(detailsPanel);
                         	if(treePanel.lastNodeClicked != null && acIdFieldValue === treePanel.lastNodeClicked.data["ac.ac_id"]){
                         		treePanel.lastNodeClicked = null;
                         	}
                         	detailsPanel.show(false);
                         	controller.refreshTree(parentNode);
                    	    
                     } 
                     catch (e) {
                         var errMessage = getMessage("errorDelete").replace('{0}', acIdFieldValue);
                         View.showMessage('error', errMessage, e.message, e.data);
                         return;
                     }
                 }
             })
	}

})
