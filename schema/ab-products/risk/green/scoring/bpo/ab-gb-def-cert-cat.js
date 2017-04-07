/**
 * @author LEI
 */
var abGbDefCreditCatController = View.createController('abGbDefCreditCatController', {
    //Current Selected Node 
	curTreeNode: null,
    stdId:'',
    parentNode:'',
	afterInitialDataFetch: function(){
		this.abGbDefCreditCatTree.enableButton('addNew', false) ;
    },
    
    /**
     * Add new credit category
     */
    abGbDefCreditCatTree_onAddNew: function(){
	    this.abGbDefCreditCertCatForm.clear();
		this.abGbDefCreditCertCatForm.newRecord = true;
		this.abGbDefCreditCertCatForm.show(true);
		this.abGbDefCreditCertCatForm.refresh();
		if(valueExistsNotEmpty(this.stdId)){
    		this.abGbDefCreditCertCatForm.setFieldValue("gb_cert_cat.cert_std",this.stdId);
    	}
		var max_cat_order=this.abGbDefCreditCatCertMaxCatOrderDS.getRecords()[0].values["gb_cert_cat.maxCatOrder"];
		this.abGbDefCreditCertCatForm.setFieldValue("gb_cert_cat.cat_order",max_cat_order);
    },
    
    /**
     * Delete  selected category record
     */
    abGbDefCreditCertCatForm_onDelete: function(){
    	this.commonDelete("abGbDefCreditCatCertCatFormDS", "abGbDefCreditCertCatForm", ['gb_cert_cat.cert_cat','gb_cert_cat.cert_std']);
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
     * Update or save credit category record
     */
    abGbDefCreditCertCatForm_onSave: function(){
    	var certStd=this.abGbDefCreditCertCatForm.getFieldValue("gb_cert_cat.cert_std");
    	this.abGbDefCreditCertCatForm.save();
    	if(certStd!=this.stdId){
    		this.abGbDefCreditCatTree.refresh();
    	}else{
    		this.refreshTree();
    	}
    },
    
    /**
     * Refresh Tree after save and delete property record.
     */
    refreshTree:function(){
    	if (this.curTreeNode) {
    		if (this.curTreeNode.parent=="RootNode") {
    			var currentNode=this.curTreeNode;
    			this.abGbDefCreditCatTree.refreshNode(currentNode);
    			currentNode.expand();
    		}else {
    			
    			if(this.curTreeNode.parent){
    				this.parentNode=this.curTreeNode.parent;
    			}
    			this.abGbDefCreditCatTree.refreshNode(this.parentNode);
    			this.parentNode.expand();
    		}
    	}
    }
})

/**
 * Called when we click tree credit standard node  ,it saved the current selected tree node 
 */
function onClickCerfStdNode(){
    var curTreeNode = View.panels.get("abGbDefCreditCatTree").lastNodeClicked;
    curTreeNode.expand();
    abGbDefCreditCatController.stdId = curTreeNode.data['gb_cert_std.cert_std'];
    abGbDefCreditCatController.abGbDefCreditCatTree.enableButton('addNew', true) ;
    abGbDefCreditCatController.curTreeNode=curTreeNode;
}

/**
 * Called when we click  tree property node  ,it saved the current selected tree node and site code
 */
function onClickCreditCatNode(){
    var curTreeNode = View.panels.get("abGbDefCreditCatTree").lastNodeClicked;
    abGbDefCreditCatController.stdId = curTreeNode.parent.data['gb_cert_std.cert_std'];
    abGbDefCreditCatController.abGbDefCreditCatTree.enableButton('addNew', true) ;
    abGbDefCreditCatController.curTreeNode=curTreeNode;
    var restriction = new Ab.view.Restriction();
	restriction.addClause('gb_cert_cat.cert_std', curTreeNode.parent.data['gb_cert_std.cert_std']);
	restriction.addClause('gb_cert_cat.cert_cat', curTreeNode.data['gb_cert_cat.cert_cat']);
	abGbDefCreditCatController.abGbDefCreditCertCatForm.newRecord=false;
	abGbDefCreditCatController.abGbDefCreditCertCatForm.refresh(restriction);
}


