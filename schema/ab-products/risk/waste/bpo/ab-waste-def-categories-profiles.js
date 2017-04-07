/**

* @author xianchao

*/
var abWasteDefCatProController = View.createController('abWasteDefCatProController',
{
	category : '',
	
	//Operaton Data Type //'category','profile'
	operDataType: "",
	
	typeSelect:null,
	/*
	*  after Initial DataFetch ,create menu for add new button
	*/
	afterInitialDataFetch : function() {
		var titleObj = Ext.get('addNew');
		titleObj.on('click', this.showMenu, this, null);
		this.objTree = View.panels.get('abWasteDefCatProTree1');
	},
	/*
	*  after View Load,fill dropdown list
	*/
	afterViewLoad: function(){
		var typeSelect = $('unitsType');
		this.typeSelect=typeSelect;
		fillList('abWasteDefCatProType','unitsType','bill_type.bill_type_id','');
	},
	/*
	*  create menu for add new button
	* @param {Object} e
	* @param {Object} item
	*/
	showMenu: function(e, item){
		var menuItems = [];
		var menutitle_cat = getMessage("titleCategory");
		var menutitle_pro = getMessage("titleProfile");
		menuItems.push({
			text: menutitle_cat,
			handler: this.onAddNewButtonPush.createDelegate(this, ['category'])
		});
		menuItems.push({
			text: menutitle_pro,
			handler: this.onAddNewButtonPush.createDelegate(this, ['profile'])
		});

		var menu = new Ext.menu.Menu({
			items: menuItems
		});
		menu.showAt(e.getXY());
	},

	/**
	* click on menu item
	* @param {Object} menuItemId
	*/
	onAddNewButtonPush: function(menuItemId){
		this.operDataType = menuItemId;
		switch(menuItemId){
			case "category":
			this.abWasteDefCatForm.clear();
			this.abWasteDefCatForm.newRecord = true;
			this.abWasteDefProForm.show(false);
			this.abWasteDefCatForm.show(true);
			this.abWasteDefCatForm.refresh();
			break;
			case "profile":
			if(this.category==''){
				View.showMessage(getMessage("errorAddProfile"))
			}else{
				this.abWasteDefProForm.clear();
				this.abWasteDefProForm.newRecord = true;
				this.abWasteDefCatForm.show(false);
				this.abWasteDefProForm.show(true);
				this.abWasteDefProForm.refresh();
				var optionIndexType = null;
				optionIndexType = getOptionIndex(this.typeSelect, '');
				this.typeSelect.options[optionIndexType].setAttribute('selected', true);
				this.typeSelect.value = '';
				// set the edit panel's "waste_profiles.waste_category" field
				this.abWasteDefProForm.setFieldValue("waste_profiles.waste_category", this.category);
			}
			break;
		}
	},

	/**
	* Update or save cat record
	*/
	abWasteDefCatForm_onSave: function(){
		if (this.abWasteDefCatForm.canSave()) {
			this.abWasteDefCatForm.save();
			this.category = this.abWasteDefCatForm.getFieldValue("waste_categories.waste_category");
			this.refreshTree();
		}
	},

	/**
	* Update or save pro record
	*/
	abWasteDefProForm_onSave: function(){
		var isEmpty=validateUnitAndUnittype('unitsType','unitsType','fieldNoNull');
		if(isEmpty){
			return;
		}
		var typeSelect = $('unitsType');
		this.abWasteDefProForm.setFieldValue("waste_profiles.units_type", typeSelect.value);
		if (this.abWasteDefProForm.canSave()) {
			this.abWasteDefProForm.save();
			this.category = this.abWasteDefProForm.getFieldValue("waste_profiles.waste_category");
			this.refreshTree();
		}
	},

	/**
	* Refresh Tree after save and delete  record.
	*/
	refreshTree:function(){
		this.abWasteDefCatProTree1.refresh();
		this.expandTreeNodeByCurEditData();
	},
	
    /**
     * private method: find current tree node according to form data
     */
	expandTreeNodeByCurEditData: function( ){
    	var root=this.abWasteDefCatProTree1.treeView.getRoot();
        	for (var i = 0; i < this.abWasteDefCatProTree1.treeView.getRoot().children.length; i++) {
                var node = this.abWasteDefCatProTree1.treeView.getRoot().children[i];
                if(node.data['waste_categories.waste_category'] == this.category){
                	this.abWasteDefCatProTree1.refreshNode(node);
                	node.expand();
                    break;	
                }
        	}
    }
});
/**
 * Refresh tree after delete form record
 */
function refreshTree1(){
	abWasteDefCatProController.category = '';
	abWasteDefCatProController.refreshTree();
}

/**
 * Refresh tree after delete form record
 */
function refreshTree2(){
	abWasteDefCatProController.refreshTree();
}
/**
* event click category node.
*/
function selectCatFromTree() {
	abWasteDefCatProController.abWasteDefProForm.show(false);
	var curTreeNode = View.panels.get("abWasteDefCatProTree1").lastNodeClicked;
	curTreeNode.expand();
	var category = curTreeNode.data['waste_categories.waste_category'];
	abWasteDefCatProController.category=category;
	var catForm=abWasteDefCatProController.abWasteDefCatForm;
	catForm.clear();
	catForm.newRecord = false;
	var restriction = new Ab.view.Restriction();

	//restriction record which has been clicked apply to details panel
	restriction.addClause('waste_categories.waste_category', category);
	catForm.refresh(restriction);

}

/**
* event click profile node.
*/
function selectProFromTree() {
	abWasteDefCatProController.abWasteDefCatForm.show(false);
	var curTreeNode = View.panels.get("abWasteDefCatProTree1").lastNodeClicked;
	var proForm=abWasteDefCatProController.abWasteDefProForm;
	var profile = curTreeNode.data['waste_profiles.waste_profile'];
	var category = curTreeNode.data['waste_profiles.waste_category'];
	abWasteDefCatProController.category=category;
	proForm.clear();
	proForm.newRecord = false;
	var restriction = new Ab.view.Restriction();
	//restriction record which has been clicked apply to details panel
	restriction.addClause('waste_profiles.waste_profile', profile);
	var record = abWasteDefCatProController.abWasteDefCatProTree2DS.getRecord(restriction);
	var type=record.values['waste_profiles.units_type'];
	var typeSelect = $('unitsType');
	var optionIndexType = null;
	optionIndexType = getOptionIndex(typeSelect, type);
	typeSelect.options[optionIndexType].setAttribute('selected', true);
	typeSelect.value = type;
	proForm.refresh(restriction);
	

}

/*
 * KB3031946:
 * After the msds_id value is selected, automatically populate the following fields 
 * in the form if the field is null in the form:
 * 	Form Field: "Waste Name"  with msds_data.product_name
 * 	Form Field: "Specific Gravity" with msds_data.specific_gravity_high
 * 	Form Field: "CAS Number" with msds_constituent.cas_number (when there is only one unique cas_number 
 * 		associated with the msds_id).
 */
function afterSelectMsdsId(fieldName, selectedValue, previousValue) {
	var form  = abWasteDefCatProController.abWasteDefProForm;
	var msdsDs = abWasteDefCatProController.abWasteDefPro_msdsDs;
	var restriction = new Ab.view.Restriction(); 
	restriction.addClause(fieldName, selectedValue, "=");
	var msdsRecord = msdsDs.getRecord(restriction);
	
    if(!valueExistsNotEmpty(form.getFieldValue('waste_profiles.waste_name'))){
    	form.setFieldValue('waste_profiles.waste_name', msdsRecord.getValue('msds_data.product_name'));
    }
    if(form.getFieldValue('waste_profiles.specific_gravity') == 0){
    	form.setFieldValue('waste_profiles.specific_gravity', msdsRecord.getValue('msds_data.specific_gravity_high'));
    }
    if(!valueExistsNotEmpty(form.getFieldValue('waste_profiles.cas_number'))){
    	var msdsCasDs = abWasteDefCatProController.abWasteDefPro_msdsCasDs;
    	var restriction = new Ab.view.Restriction(); 
    	restriction.addClause('msds_constituent.msds_id', selectedValue, "=");
    	var msdsCasRecords = msdsCasDs.getRecords(restriction);
    	if(msdsCasRecords.length == 1){
    		form.setFieldValue('waste_profiles.cas_number', msdsCasRecords[0].getValue('msds_chemical.cas_number'));
    	}
    }
    
    return true;
}