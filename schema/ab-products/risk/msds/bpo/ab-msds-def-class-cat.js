/**
 * @author LEI
 */
var msdsDefCategoryController = View.createController('msdsDefCategoryController', {
    //Current Selected Node 
	curTreeNode: null,
	selectedSysNode:'',
	selectedCategoryNode:'',
	
	
    /**
     * Add new category
     */
	categoryGrid_onAddNew: function(){
		
		this.categoryForm.newRecord = true;
		this.categoryForm.show(true);
		this.categoryForm.refresh();
		this.categoryForm.clear();
	
		if(valueExistsNotEmpty(this.selectedSysNode)){
			this.categoryForm.setFieldValue("msds_hazard_category.hazard_system_id",this.selectedSysNode);
		}
		if(valueExistsNotEmpty(this.selectedCategoryNode)){
			this.categoryForm.setFieldValue("msds_hazard_category.hazard_class_id",this.selectedCategoryNode);
		}
		
    },
    
    /**
     * Delete  selected category record
     */
    categoryForm_onDelete: function(){
    	this.commonDelete("msdsHazardCatDS", "categoryForm", ['msds_hazard_category.hazard_category_id','msds_hazard_category.hazard_class_id','msds_hazard_category.hazard_system_id']);
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
	            controller.refreshGrid();
	            formPanel.show(false);
	            
	        }
	    })
	},
	
    /**
     * Update or save category record
     */
	categoryForm_onSave: function(){
    	var form=this.categoryForm;
    	if (form.canSave()){
		
		form.save();
    	this.refreshTree();
    	this.refreshGrid();
    	this.isNewRecord=false;
    	}
    },
    
    /**
     * Save and add new category
     */
    categoryForm_onSaveAndAddNew: function(){
    	var sysId=this.categoryForm.getFieldValue("msds_hazard_category.hazard_system_id");
    	var hClassId=this.categoryForm.getFieldValue("msds_hazard_category.hazard_class_id");
    	var catId=this.categoryForm.getFieldValue("msds_hazard_category.hazard_category_id");
    	this.categoryForm.save();
    	if(catId!=''){
		this.refreshGrid();
		this.categoryGrid_onAddNew();
    	}
    },
    
    
    /**
     * Refresh top-right grid based on selected tree node 
     */
	refreshGrid:function(){
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('msds_hazard_class.hazard_class_id', this.selectedCategoryNode, '=');
    	restriction.addClause('msds_hazard_class.hazard_system_id', this.selectedSysNode, '=');
    	this.categoryGrid.refresh(restriction);
    },
    
    /**
     * Refresh Tree after save and delete property record.
     */
    refreshTree : function() {
    	if (this.curTreeNode) {
    		if (this.curTreeNode.parent) {
    			this.parentNode = this.curTreeNode.parent;
    		}
    		this.msdsHazardSysTree.refreshNode(this.parentNode);
    		this.parentNode.expand();
    	}
    }
})

/**
 * Called when we click tree system node  ,it saved the current selected tree node 
 */

function onClickSysNode(){
	var curTreeNode = View.panels.get("msdsHazardSysTree").lastNodeClicked;
	curTreeNode.expand();
	msdsDefCategoryController.categoryGrid.show(false) ;
	msdsDefCategoryController.categoryForm.show(false) ;
}

/**
 * Called when we click  tree class node  ,it saved the current selected tree node and class 
 */
function onClickClassNode(){
    var curTreeNode = View.panels.get("msdsHazardSysTree").lastNodeClicked;
    msdsDefCategoryController.selectedCategoryNode = curTreeNode.data['msds_hazard_class.hazard_class_id'];
    msdsDefCategoryController.selectedSysNode = curTreeNode.parent.data['msds_hazard_system.hazard_system_id'];
    msdsDefCategoryController.refreshGrid();
	msdsDefCategoryController.curTreeNode=curTreeNode;
	msdsDefCategoryController.categoryForm.show(false) ;
}

