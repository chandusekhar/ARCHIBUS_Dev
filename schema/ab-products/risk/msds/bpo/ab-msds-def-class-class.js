/**
 * @author LEI
 */
var msdsHazardSysController = View.createController('msdsHazardSysController', {
    //Current Selected Node 
	curTreeNode: null,
    sysId:'',
    parentNode:'',
	afterInitialDataFetch: function(){
		this.msdsHazardSysTree.enableButton('addNew', false) ;
    },
    
    /**
     * Add new system
     */
    msdsHazardSysTree_onAddNew: function(){
	    this.msdsHazardClassForm.clear();
		this.msdsHazardClassForm.newRecord = true;
		this.msdsHazardClassForm.show(true);
		this.msdsHazardClassForm.refresh();
		if(valueExistsNotEmpty(this.sysId)){
    		this.msdsHazardClassForm.setFieldValue("msds_hazard_class.hazard_system_id",this.sysId);
    	}
	
    },
    
    /**
     * Delete  selected class record
     */
    msdsHazardClassForm_onDelete: function(){
    	this.commonDelete("msdsHazardClassDS", "msdsHazardClassForm", ['msds_hazard_class.hazard_class_id','msds_hazard_class.hazard_system_id']);
    },
    
    /**
     * Call when we delete form record
     */
	commonDelete: function(dataSourceID, formPanelID, primaryFieldFullName){
        var dataSource = View.dataSources.get(dataSourceID);
        var formPanel = View.panels.get(formPanelID);
        if(formPanel.newRecord){
        	return;
        }
        var record = formPanel.getRecord();
        var primaryField="";
        for(var i=0 ;i<primaryFieldFullName.length;i++){
        	primaryField=primaryField+" "+record.getValue(primaryFieldFullName[i]);
        }
        if (!primaryField) {
            return;
        }
        var controller = this;
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryField);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                } 
                catch (e) {
                    var errMessage = getMessage("errorDelete");
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
                controller.refreshTree();
                formPanel.show(false);
                
            }
        })
    },
    
    /**
     * Save and add new class
     */
    msdsHazardClassForm_onSaveAndAddNew: function(){
    	var sysId=this.msdsHazardClassForm.getFieldValue("msds_hazard_class.hazard_system_id");
    	var classId=this.msdsHazardClassForm.getFieldValue("msds_hazard_class.hazard_class_id");
    	this.msdsHazardClassForm.save();
    	if(classId!=''){
    		this.msdsHazardSysTree.refresh();
    		this.refreshTree();
    		this.msdsHazardSysTree_onAddNew();
    	}
    		
    },
    /**
     * Update or save class record
     */
    msdsHazardClassForm_onSave: function(){
    	var sysId=this.msdsHazardClassForm.getFieldValue("msds_hazard_class.hazard_system_id");
    	this.msdsHazardClassForm.save();
		this.msdsHazardSysTree.refresh();
		this.refreshTree();
    },
    
 
    /**
     * private method: find current tree node according to form data
     */
    refreshTree: function(){
    	var tree=this.msdsHazardSysTree;
    	var root=tree.treeView.getRoot();
    	for (var i = 0; i < root.children.length; i++) {
            var node = root.children[i];
            if(node.data['msds_hazard_system.hazard_system_id'] == this.sysId){
            	tree.refreshNode(node);
            	node.expand();
                    	break;
        	}
        }
	}
})

/**
 * Called when we click tree system node  ,it saved the current selected tree node 
 */
function onClickSysNode(){
    var curTreeNode = View.panels.get("msdsHazardSysTree").lastNodeClicked;
    curTreeNode.expand();
    msdsHazardSysController.sysId = curTreeNode.data['msds_hazard_system.hazard_system_id'];
    msdsHazardSysController.msdsHazardSysTree.enableButton('addNew', true) ;
    msdsHazardSysController.curTreeNode=curTreeNode;
    msdsHazardSysController.msdsHazardClassForm.show(false);
}

/**
 * Called when we click  tree class node  ,it saved the current selected tree node 
 */
function onClickClassNode(){
    var curTreeNode = View.panels.get("msdsHazardSysTree").lastNodeClicked;
    msdsHazardSysController.sysId = curTreeNode.parent.data['msds_hazard_system.hazard_system_id'];
    msdsHazardSysController.msdsHazardSysTree.enableButton('addNew', true) ;
    msdsHazardSysController.curTreeNode=curTreeNode;
    var restriction = new Ab.view.Restriction();
	restriction.addClause('msds_hazard_class.hazard_system_id', curTreeNode.parent.data['msds_hazard_system.hazard_system_id']);
	restriction.addClause('msds_hazard_class.hazard_class_id', curTreeNode.data['msds_hazard_class.hazard_class_id']);
	msdsHazardSysController.msdsHazardClassForm.newRecord=false;
	msdsHazardSysController.msdsHazardClassForm.refresh(restriction);
}


