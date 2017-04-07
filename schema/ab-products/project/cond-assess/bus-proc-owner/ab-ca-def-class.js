/**
 * @author Cristina Moldovan
 * 07/15/2009
 * 08/04/2009 - Ioan Draghici  changed to use hier tree 
 * TO DO :
 *  - fix automatic expand after save - when will be fixed from web core
 */

var defClassCtrl = View.createController('defClassCtrl',{
	
	afterViewLoad: function(){
		// check if root node exists, if not insert new record
		var record = this.dsClassifications.getRecord();
		if (record.isNew) {
			var recRoot = new Ab.data.Record({
				'csi.description':'Top Level',
				'csi.hierarchy_ids':'0|',
				'csi.csi_id':'0'
			}, true);
			this.dsClassifications.saveRecord(recRoot);
		}
	},
	
	/**
	 *  insert /update  csi 
	 */
	classificationDetailsPanel_onSave: function(){
		if(!this.canChange()){
			return;
		}
		var isNew = this.classificationDetailsPanel.newRecord;
		var oldId = this.classificationDetailsPanel.getOldFieldValues()["csi.csi_id"];
		var newId = this.classificationDetailsPanel.getFieldValue("csi.csi_id");
		var parentNode = this.getParent(this.classificationsTreePanel, this.classificationDetailsPanel, isNew);
		this.setHierId(this.classificationDetailsPanel, parentNode, "csi.csi_id", "csi.hierarchy_ids");
		if (this.classificationDetailsPanel.save()) {
			// update all childs 
			if (!isNew) {
				this.updateChildNodes(newId, oldId);
			}
			this.refreshTreeAfterSave(parentNode, newId);
			this.classificationDetailsPanel.show(false, true);
		}
	},
	
	canChange: function(){
		if(trim(this.classificationDetailsPanel.getOldFieldValues()[("csi.csi_id")]) == "0"){
			View.showMessage(getMessage("error_top_level"));
			return false;
		}else{
			return true;
		}
	},
	
	/**
	 * Set new value for hierId field
	 * @param {Object} panel
	 * @param {Object} parentNode
	 * @param {Object} field
	 * @param {Object} hierField
	 */
	setHierId: function(panel, parentNode, field, hierField){
		var newId = panel.getFieldValue(field);
		if(parentNode.isRoot()){
			panel.setFieldValue(hierField, '0|'+newId+'|');
		}else{
			panel.setFieldValue(hierField, parentNode.data[hierField]+newId+'|');
		}
	},
	
	/**
	 * Update hierId for all child nodes of updated node
	 */
	updateChildNodes: function(newId, oldId){
		var dataSource = this.dsClassifications;
		var restriction = "csi.hierarchy_ids LIKE '%|" + oldId + "|%'";
		var records = dataSource.getRecords(restriction);
		for(var i= 0; i < records.length; i++ ) {
			var record = records[i];
			var hierId = record.getValue("csi.hierarchy_ids");
			record.setValue("csi.hierarchy_ids", hierId.replace("|" + oldId + "|", "|" + newId + "|"));
			record.isNew = false;
			dataSource.saveRecord(record);
		}
	},
	
	/**
	 * get parent for current selection
	 * @param {Object} panel
	 * @param {Object} isNew
	 */
	getParent: function(panel, editForm, isNew){
		if(panel.lastNodeClicked == null){
			return panel.treeView.getNodeByIndex(1);
		}else{
			if (isNew) {
				return panel.lastNodeClicked;
			}
			else {
				var pkFieldValue = editForm.getOldFieldValues()["csi.csi_id"];
				var node = panel.lastNodeClicked;
		        for (var i = 0; i < panel.lastNodeClicked.children.length; i++) {
		            var tmp_node = panel.lastNodeClicked.children[i];
		            if (tmp_node.data["csi.csi_id"] == pkFieldValue) {
		                node =  tmp_node;
						break;
		            }
		        }
				return node.parent;
			}
		}
	},
	
	/**
	 * refresh tree after save 
	 * @param {Object} parentNode
	 */
	refreshTreeAfterSave: function(parentNode, pkFieldValue){
		var treeView = this.classificationsTreePanel;
		if(parentNode.isRoot()){
			treeView.refresh();
		}else{
			treeView.expandNode(parentNode);
		}
	},
	
	/**
	 * delete csi
	 */
	classificationDetailsPanel_onDelete: function() {
		if(!this.canChange()){
			return;
		}
        var controller = this;
		var dataSource = this.dsClassificationDetails;
		var record = this.classificationDetailsPanel.getRecord();
        var primaryFieldValue = record.getValue("csi.csi_id");
		var parentNode = this.getParent(this.classificationsTreePanel, this.classificationDetailsPanel, false);
		var objTree = this.classificationsTreePanel;
        if (!primaryFieldValue) {
            return;
        }
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
					/*
					 * 06/14/2010 IOAN KB 3027940
					 */
                    dataSource.deleteRecord(record);
					if(objTree.lastNodeClicked != null && primaryFieldValue ===  objTree.lastNodeClicked.data["csi.csi_id"]){
						objTree.lastNodeClicked = null;
                } 
					controller.classificationDetailsPanel.show(false);
                	controller.refreshTreeAfterSave(parentNode);
                } 
                catch (e) {
                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
            }
        })
	}
});

/**
 * remove hierarchy_ids from node label
 * @param {Object} treeNode
 */
function afterGeneratingTreeNode(treeNode){
	var hierIds = treeNode.data["csi.hierarchy_ids"];
	var labelText = treeNode.label.replace(hierIds, '');
	treeNode.label = labelText;
}
