/**
 * @author LEI
 */
var abGbDefCreditController = View.createController('abGbDefCreditController', {
    //Current Selected Node 
	curTreeNode: null,
	selectedCerfStdNode:'',
	selectedCredCatNode:'',
	
	
	afterInitialDataFetch : function() {
		this.abGbDefCreditForm.setMinValue('gb_cert_credits.min_points',0);
		this.abGbDefCreditForm.setMinValue('gb_cert_credits.max_points',0);
	},
    /**
     * Add new credit category
     */
	abGbDefCreditGrid_onAddNew: function(){
		this.abGbDefPrerequisiteForm.show(false);
		
		this.abGbDefCreditForm.newRecord = true;
		this.abGbDefCreditForm.show(true);
		this.abGbDefCreditForm.refresh();
		this.abGbDefCreditForm.clear();
		
		
		//Set credit_type field ='C'
		this.abGbDefCreditForm.setFieldValue("gb_cert_credits.credit_type",'C');
		if(valueExistsNotEmpty(this.selectedCerfStdNode)){
			this.abGbDefCreditForm.setFieldValue("gb_cert_credits.cert_std",this.selectedCerfStdNode);
		}
		if(valueExistsNotEmpty(this.selectedCredCatNode)){
			this.abGbDefCreditForm.setFieldValue("gb_cert_credits.cert_cat",this.selectedCredCatNode);
		}
		
    },
    
    /**
     * Add new credit category
     */
	abGbDefCreditGrid_onAddPrerequisite: function(){
    	this.abGbDefCreditForm.show(false);
    	var form =this.abGbDefPrerequisiteForm;
    	form.show(true);
    	form.newRecord = true;
    	form.refresh();
    	form.clear();
		
		form.setFieldValue('gb_cert_credits.credit_type', 'P');
		form.setFieldValue('gb_cert_credits.subcredit_num', '0');
		form.setFieldValue('gb_cert_credits.subcredit_name', '');
		form.setFieldValue('gb_cert_credits.min_points', 0);
		form.setFieldValue('gb_cert_credits.max_points', 1);
		
		if(valueExistsNotEmpty(this.selectedCerfStdNode)){
			form.setFieldValue("gb_cert_credits.cert_std",this.selectedCerfStdNode);
			
		}
		if(valueExistsNotEmpty(this.selectedCredCatNode)){
			form.setFieldValue("gb_cert_credits.cert_cat",this.selectedCredCatNode);
		}
		
    },
    
    /**
     * Delete  selected category record
     */
    abGbDefCreditForm_onDelete: function(){
    	this.commonDelete("abGbDefCreditFormDS", "abGbDefCreditForm", ['gb_cert_credits.credit_type','gb_cert_credits.credit_num','gb_cert_credits.subcredit_num','gb_cert_credits.cert_cat','gb_cert_credits.cert_std']);
    },
    
    /**
     * Delete  selected category record
     */
    abGbDefPrerequisiteForm_onDelete: function(){
    	this.commonDelete("abGbDefCreditFormDS", "abGbDefPrerequisiteForm", ['gb_cert_credits.credit_type','gb_cert_credits.credit_num','gb_cert_credits.subcredit_num','gb_cert_credits.cert_cat','gb_cert_credits.cert_std']);
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
     * Update or save credit category record
     */
    abGbDefCreditForm_onSave: function(){
    	var form=this.abGbDefCreditForm;
    	if (form.canSave()){
		if (form.getFieldValue("gb_cert_credits.min_points") != ''&&form.getFieldValue("gb_cert_credits.max_points") != ''){
			if(parseInt(form.getFieldValue("gb_cert_credits.min_points")) > parseInt(form.getFieldValue("gb_cert_credits.max_points"))) {
				View.showMessage(getMessage('minpointAndMaxpointError'));
				return ;
			}
		} 
		form.save();
    	this.refreshTree();
    	this.refreshGrid();
    	this.isNewRecord=false;
    	}
    },
    
    /**
     * Update or save credit category record
     */
    abGbDefPrerequisiteForm_onSave: function(){
    	this.abGbDefPrerequisiteForm.save();
    	this.refreshTree();
    	this.refreshGrid();
    },
    
    /**
     * Refresh top-right grid based on selected tree node 
     */
	refreshGrid:function(){
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('gb_cert_credits.cert_cat', this.selectedCredCatNode, '=');
    	restriction.addClause('gb_cert_credits.cert_std', this.selectedCerfStdNode, '=');
    	this.abGbDefCreditGrid.refresh(restriction);
    },
    
    /**
     * Refresh Tree after save and delete property record.
     */
    refreshTree : function() {
    	if (this.curTreeNode) {
    		if (this.curTreeNode.parent) {
    			this.parentNode = this.curTreeNode.parent;
    		}
    		this.abGbDefCreditTree.refreshNode(this.parentNode);
    		this.parentNode.expand();
    	}
    }
})

/**
 * Called when we click tree credit standard node  ,it saved the current selected tree node 
 */

function onClickCerfStdNode(){
	var curTreeNode = View.panels.get("abGbDefCreditTree").lastNodeClicked;
	curTreeNode.expand();
	abGbDefCreditController.abGbDefCreditGrid.show(false) ;
}

/**
 * Called when we click  tree property node  ,it saved the current selected tree node and site code
 */
function onClickCreditCatNode(){
    var curTreeNode = View.panels.get("abGbDefCreditTree").lastNodeClicked;
    abGbDefCreditController.selectedCredCatNode = curTreeNode.data['gb_cert_cat.cert_cat'];
    abGbDefCreditController.selectedCerfStdNode = curTreeNode.parent.data['gb_cert_std.cert_std'];
    abGbDefCreditController.refreshGrid();
	abGbDefCreditController.curTreeNode=curTreeNode;
	abGbDefCreditController.abGbDefCreditForm.show(false);
}

/**
 * Show credit type button  when we select one row 
 */
function showCreditType(){
	
	var grid = View.panels.get('abGbDefCreditGrid');
	var cert_cat = grid.rows[grid.selectedRowIndex]["gb_cert_credits.cert_cat"];
	var cert_std = grid.rows[grid.selectedRowIndex]["gb_cert_credits.cert_std"];
	var credit_type = grid.rows[grid.selectedRowIndex]["gb_cert_credits.credit_type.raw"];
	var credit_num = grid.rows[grid.selectedRowIndex]["gb_cert_credits.credit_num"];
	var subcredit_num = grid.rows[grid.selectedRowIndex]["gb_cert_credits.subcredit_num"];
	var c = abGbDefCreditController;
	c.abGbDefCreditForm.newRecord = false;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('gb_cert_credits.cert_cat', cert_cat);
	restriction.addClause('gb_cert_credits.cert_std', cert_std);
	var form="";
	 	if(credit_type=='P'){
	 		restriction.addClause('gb_cert_credits.credit_type', 'P');
	 		form=c.abGbDefPrerequisiteForm;
	 		c.abGbDefPrerequisiteForm.newRecord = false;
	 		form.show(true);
	 		c.abGbDefCreditForm.show(false)
		}else{
			restriction.addClause('gb_cert_credits.credit_type', 'C');
			form=c.abGbDefCreditForm;
			c.abGbDefCreditForm.newRecord = false;
			form.show(true);
	 		c.abGbDefPrerequisiteForm.show(false)
		}
		restriction.addClause('gb_cert_credits.credit_num', credit_num);
		restriction.addClause('gb_cert_credits.subcredit_num',subcredit_num);
		form.refresh(restriction); 
		
}