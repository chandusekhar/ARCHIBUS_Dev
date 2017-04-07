var costCatByClassController = View.createController('costCatByClassCtrl',{
	costClass: null,
	costCateg: null,
	recCateg: null,
	afterInitialDataFetch: function(){
		this.gridCostCateg.refresh({'cost_cat.cost_cat_id': '0'});
		this.setLabels();
	},
	/**
	 * set cost category form to selected cost category
	 */
	setCategoryDetails: function(){
		if(this.recCateg == null){
			if(this.costClass == null){
				this.formCostCateg.refresh({}, true);
			}else{
				this.formCostCateg.refresh({'cost_cat.cost_class_id':this.costClass}, true);
			}
			var objRadio = document.getElementsByName("objChargeBack");
			objRadio[objRadio.length -1].checked = 1;
		}else{
			this.formCostCateg.setRecord(this.recCateg);
			this.formCostCateg.newRecord = false;
			var rollupProrate = this.recCateg.getValue('cost_cat.rollup_prorate');
			var objRadio = document.getElementsByName("objChargeBack");
		    for (var i=0; i<objRadio.length; i++){
			    if (objRadio[i].value == rollupProrate) {
				    objRadio[i].checked = 1; 
		            break;
			    }
		    }
		}
	},
	
	formCostCateg_afterRefresh: function(){
		this.formChargeback.refresh();
	},
	
	/**
	 * add new cost category
	 * refresh form for new record
	 */
	gridCostCateg_onNew: function(){
		if(this.costClass == null){
			View.showMessage(getMessage('msg_no_class'));
			return;
		}
		this.costCateg = null;
		this.recCateg = null;
		this.setCategoryDetails();
	},
	/**
	 * delete selected cost category
	 */
	formCostCateg_onDelete: function(){
		if(this.recCateg == null){
			return;
		}
		var ds = this.dsCostCateg;
		var record = this.recCateg;
		var controller = this;
		View.confirm(getMessage('msg_confirm_delete'), function(button){
			if(button == 'yes'){
				// If dB is Oracle or SQL Server and category is in use delete does not cascade
				// exception is thrown so show message and move on.
				try {
					ds.deleteRecord(record);	
				}
				catch (e) {
					View.showMessage(getMessage('msg_category_in_use'));
					return;
				}
				
				controller.costCateg = null;
				controller.recCateg = null;
				controller.hideCategForm();
				refreshCategories();
			}
		})
	},
	/**
	 * save action from cost category details
	 */
	formCostCateg_onSave: function(){
		var rollupProrate = null;
		var objRadio = document.getElementsByName("objChargeBack");
	    for (var i=0; i<objRadio.length; i++){
		    if (objRadio[i].checked) {
			    rollupProrate = objRadio[i].value;
	            break;
		    }
	    }
		this.formCostCateg.setFieldValue('cost_cat.rollup_prorate', rollupProrate);
		this.formCostCateg.save();
		refreshCategories();
		this.recCateg = this.formCostCateg.getRecord();
	},
	/**
	 * Cancel action from cost category details
	 */
	formCostCateg_onCancel: function(){
		this.hideCategForm();
	},
	/**
	 * set labels for cost category form
	 */
	setLabels: function(){
		$('chgbk_title').innerHTML = getMessage('msg_chgbk_title');
		$('chgbk_head1').innerHTML = getMessage('msg_chgbk_head1');
		$('chgbk_head2').innerHTML = getMessage('msg_chgbk_head2');
		$('chgbk_head3').innerHTML = getMessage('msg_chgbk_head3');
		$('chgbk_all').innerHTML = getMessage('msg_chgbk_all');
		$('chgbk_none').innerHTML = getMessage('msg_chgbk_none');
		$('chgbk_none_1').innerHTML = getMessage('msg_chgbk_none');
		$('chgbk_none_2').innerHTML = getMessage('msg_chgbk_none');
		$('chgbk_none_3').innerHTML = getMessage('msg_chgbk_none');
		$('chgbk_none_4').innerHTML = getMessage('msg_chgbk_none');
		$('chgbk_none_5').innerHTML = getMessage('msg_chgbk_none');
		$('chgbk_none_6').innerHTML = getMessage('msg_chgbk_none');
		$('chgbk_none_7').innerHTML = getMessage('msg_chgbk_none');
		$('chgbk_direct').innerHTML = getMessage('msg_chgbk_direct');
		$('chgbk_bldg').innerHTML = getMessage('msg_chgbk_bldg');
		$('chgbk_bldg_1').innerHTML = getMessage('msg_chgbk_bldg');
		$('chgbk_bldg_2').innerHTML = getMessage('msg_chgbk_bldg');
		$('chgbk_bldg_3').innerHTML = getMessage('msg_chgbk_bldg');
		$('chgbk_bldg_4').innerHTML = getMessage('msg_chgbk_bldg');
		$('chgbk_prop').innerHTML = getMessage('msg_chgbk_prop');
		$('chgbk_prop_1').innerHTML = getMessage('msg_chgbk_prop');
		$('chgbk_prop_2').innerHTML = getMessage('msg_chgbk_prop');
		$('chgbk_prop_3').innerHTML = getMessage('msg_chgbk_prop');
		$('chgbk_prop_4').innerHTML = getMessage('msg_chgbk_prop');
		$('chgbk_lease').innerHTML = getMessage('msg_chgbk_lease');
		$('chgbk_lease_1').innerHTML = getMessage('msg_chgbk_lease');
		$('chgbk_lease_2').innerHTML = getMessage('msg_chgbk_lease');
		$('chgbk_lease_3').innerHTML = getMessage('msg_chgbk_lease');
		$('chgbk_lease_4').innerHTML = getMessage('msg_chgbk_lease');
		$('chgbk_lease_5').innerHTML = getMessage('msg_chgbk_lease');
		$('chgbk_dept').innerHTML = getMessage('msg_chgbk_dept');
	},
	/**
	 * Hide the add/edit/delete cost category form.
	 */
	hideCategForm: function(){
		this.formCostCateg.show(false);
		this.formChargeback.show(false);
	}
});
/**
 * load cost categories for selected cost class
 * @param {Object} row - selected cost class row
 */
function loadClass(row){
	var costClass = row.row.getFieldValue('cost_class.cost_class_id');
	costCatByClassController.costClass = costClass;
	costCatByClassController.costCateg = null;
	costCatByClassController.recCateg = null;
	costCatByClassController.gridCostCateg.refresh({'cost_cat.cost_class_id':costClass});
	costCatByClassController.hideCategForm();
}
/**
 * load details for selected cost category
 * @param {Object} row - selected cost category row
 */
function loadCateg(row){
	costCatByClassController.gridCostCateg.refresh({'cost_cat.cost_class_id':costCatByClassController.costClass});
	var costCateg = row.row.getFieldValue('cost_cat.cost_cat_id');
	costCatByClassController.costCateg = costCateg;
	costCatByClassController.gridCostCateg_onNew();
	costCatByClassController.recCateg = row.row.getRecord();
	costCatByClassController.setCategoryDetails();
}

/**
 * refresh cost classes panel
 */
function refreshClasses(){
	costCatByClassController.gridCostClasses.refresh();
}

/**
 * refresh cost category panel
 * if a cost class is selected refresh panel with restriction
 */
function refreshCategories(){
	var costClass = (costCatByClassController.costClass == null)?'0':costCatByClassController.costClass;
	costCatByClassController.gridCostCateg.refresh({'cost_cat.cost_class_id':costClass});
}
