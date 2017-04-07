/**

* @author xianchao

*/


var abWasteAsgnCodeProController = View.createController('abWasteAsgnCodeProController',
{
	category : '',
	
	profile:'',


	// Control add new button status after refreshed
	afterInitialDataFetch : function() {
		
		this.abWasteAsgnCodeProTree1.actions.get('addNew')
		.forceDisable(true);
	},

	// Press addNew action
	abWasteAsgnCodeProTree1_onAddNew : function() {
		if((this.category!='')&&(this.profile!='')){
			this.abWasteAsgnCodeProForm.newRecord = true;
			this.abWasteAsgnCodeProForm.show(true);
			this.abWasteAsgnCodeProForm.refresh();
			this.abWasteAsgnCodeProForm.clear();
			// set the edit panel's "waste_profile_reg_codes.waste_profile" field
			this.abWasteAsgnCodeProForm.setFieldValue("waste_profile_reg_codes.waste_profile", this.profile);
		}else{
			View.showMessage(getMessage("errorAdd"));

		}

	},
	
	/**
	* Update or save property record
	*/
	abWasteAsgnCodeProForm_onSave: function(){
		var form = this.abWasteAsgnCodeProForm;
		if (form.canSave()) {
			form.save();
			this.profile = form.getFieldValue('waste_profile_reg_codes.waste_profile');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('waste_profiles.waste_profile', this.profile);
			this.category = this.abWasteAsgnCodeProTree2DS.getRecord(restriction).getValue('waste_profiles.waste_category');
			this.refreshTree();
		}
	},
	
    /**
	* Refresh Tree after save and delete  record.
	*/
	refreshTree:function(){
		this.abWasteAsgnCodeProTree1.refresh();
		this.expandTreeNodeByCurEditData();
	},
	
    /**
     * private method: find current tree node according to form data
     */
	expandTreeNodeByCurEditData: function( ){
    	var root=this.abWasteAsgnCodeProTree1.treeView.getRoot();
        	for (var i = 0; i < this.abWasteAsgnCodeProTree1.treeView.getRoot().children.length; i++) {
                var node = this.abWasteAsgnCodeProTree1.treeView.getRoot().children[i];
                if(node.data['waste_categories.waste_category'] == this.category){
                	this.abWasteAsgnCodeProTree1.refreshNode(node);
                	node.expand();
                	for (var j = 0; j < node.children.length; j++) {
                    	var node2=node.children[j];
	                    if (node2.data['waste_profiles.waste_profile'] == this.profile ) {
	                    	this.abWasteAsgnCodeProTree1.refreshNode(node2);
	                    	node2.expand();
	                    	break;
	                    }
                   }
                   break;	
                }
        	}
    }

});

/**
 * Refresh tree after delete form record
 */
function refreshTree(){
	abWasteAsgnCodeProController.refreshTree();
}
/**
* event click category node.
*/
function selectCatFromTree() {
	abWasteAsgnCodeProController.abWasteAsgnCodeProForm.show(false);
	var curTreeNode = View.panels.get("abWasteAsgnCodeProTree1").lastNodeClicked;
	curTreeNode.expand();
	abWasteAsgnCodeProController.abWasteAsgnCodeProTree1.actions.get('addNew').forceDisable(true);
}

/**
* event click profile node.
*/
function selectProFromTree() {
	abWasteAsgnCodeProController.abWasteAsgnCodeProForm.show(false);
	abWasteAsgnCodeProController.abWasteAsgnCodeProTree1.actions.get('addNew').forceDisable(false);
	var curTreeNode = View.panels.get("abWasteAsgnCodeProTree1").lastNodeClicked;
	curTreeNode.expand();
	var proFrom=abWasteAsgnCodeProController.abWasteAsgnCodeProForm;
	var profile = curTreeNode.data['waste_profiles.waste_profile'];
	var category = curTreeNode.data['waste_profiles.waste_category'];
	abWasteAsgnCodeProController.category=category;
	abWasteAsgnCodeProController.profile=profile;
}

/**
* event click category node.
*/
function selectcodeFormTree() {
	var curTreeNode = View.panels.get("abWasteAsgnCodeProTree1").lastNodeClicked;
	var codeType = curTreeNode.data['waste_profile_reg_codes.regulated_code_type'];
	var code = curTreeNode.data['waste_profile_reg_codes.regulated_code'];
	var category = curTreeNode.parent.data['waste_profiles.waste_category'];
	var profile = curTreeNode.data['waste_profile_reg_codes.waste_profile'];
	abWasteAsgnCodeProController.category=category;
	abWasteAsgnCodeProController.profile=profile;
	
	var codeForm=abWasteAsgnCodeProController.abWasteAsgnCodeProForm;
	codeForm.show(true);
	codeForm.clear();
	codeForm.newRecord = false;
	var restriction = new Ab.view.Restriction();

	//restriction record which has been clicked apply to details panel
	restriction.addClause('waste_profile_reg_codes.regulated_code_type', codeType);
	restriction.addClause('waste_profile_reg_codes.regulated_code', code);
	restriction.addClause('waste_profile_reg_codes.waste_profile', profile);
	codeForm.refresh(restriction);
	
	abWasteAsgnCodeProController.abWasteAsgnCodeProTree1.actions.get('addNew').forceDisable(false);

}