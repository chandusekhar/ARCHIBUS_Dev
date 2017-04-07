var lsChrbkAgreeController = View.createController('lsChrbkAgreeCtrl',{
	
	ls_id: null,
	
	cost_cat_id:null,

	afterInitialDataFetch: function(){
		if (valueExistsNotEmpty(this.ls_id)) {
			showLsDetails(this.ls_id);
		}
	},
	
	refreshView: function(lsId){
		this.ls_id = lsId;
		showLsDetails(this.ls_id);
	},
	
	gridChgbkAgrements_onRefresh: function(){
		if( valueExistsNotEmpty(this.ls_id) && valueExists(this.gridChgbkAgrements)){
			this.gridChgbkAgrements.refresh(new Ab.view.Restriction({'ls_chrgbck_agree.ls_id':this.ls_id}));
		}
	},
	gridChgbkAgrements_onNew: function(){
		if(!valueExistsNotEmpty(this.ls_id)){
			View.showMessage(getMessage('err_no_lease'));
			return;
		}
		this.cost_cat_id = null;
		this.formChgbkAgrement_refresh();
	},
	formChgbkAgrement_refresh: function(){
		if (valueExists(this.formChgbkAgrement)) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('ls_chrgbck_agree.ls_id', this.ls_id, '=');
			if(valueExistsNotEmpty(this.cost_cat_id)){
				restriction.addClause('ls_chrgbck_agree.cost_cat_id', this.cost_cat_id, '=');
			}
			this.formChgbkAgrement.refresh(restriction, this.cost_cat_id == null);
		}
	},
	formChgbkAgrement_onSave: function(){
		this.formChgbkAgrement.save();
		this.cost_cat_id = this.formChgbkAgrement.getFieldValue('ls_chrgbck_agree.cost_cat_id');
		this.gridChgbkAgrements_onRefresh();
	},
	formChgbkAgrement_onDelete: function(){
		if(!valueExistsNotEmpty(this.cost_cat_id)){
			return;
		}
		var controller = this;
		View.confirm(getMessage('confirm_delete'), function(button){
			if(button == 'yes'){
				controller.dsChgbkAgrement.deleteRecord(controller.formChgbkAgrement.getRecord());
				controller.cost_cat_id = null;
				controller.formChgbkAgrement_refresh();
				controller.gridChgbkAgrements_onRefresh();
			}
		});
	},
	formChgbkAgrement_onCancel: function(){
		View.closeThisDialog();
	}
});

function showLsDetails(lsId){
	lsChrbkAgreeController.ls_id = lsId;
	lsChrbkAgreeController.cost_cat_id = null;
	lsChrbkAgreeController.gridChgbkAgrements_onRefresh();
	lsChrbkAgreeController.formChgbkAgrement_refresh();
}

function editAgreement(row){
	lsChrbkAgreeController.cost_cat_id = row['ls_chrgbck_agree.cost_cat_id'];
	lsChrbkAgreeController.formChgbkAgrement_refresh();
}
