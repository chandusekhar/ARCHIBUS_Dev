var lsChrbkAgreeController = View.createController('lsChrbkAgreeCtrl',{
	ls_id:null,
	cost_cat_id:null,
	gridLease_onRefresh: function(){
		this.gridLease.refresh();
	},
	gridChgbkAgrements_onRefresh: function(){
		if(this.ls_id != null){
			this.gridChgbkAgrements.refresh({'ls_chrgbck_agree.ls_id':this.ls_id});
		}
	},
	gridChgbkAgrements_onNew: function(){
		if(this.ls_id == null){
			View.showMessage(getMessage('err_no_lease'));
			return;
		}
		this.cost_cat_id = null;
		this.formChgbkAgrement_refresh();
	},
	formChgbkAgrement_refresh: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls_chrgbck_agree.ls_id', this.ls_id, '=');
		if(this.cost_cat_id !=  null){
			restriction.addClause('ls_chrgbck_agree.cost_cat_id', this.cost_cat_id, '=');
		}
		this.formChgbkAgrement.refresh(restriction, this.cost_cat_id == null);
	},
	formChgbkAgrement_onSave: function(){
		this.formChgbkAgrement.save();
		this.cost_cat_id = this.formChgbkAgrement.getFieldValue('ls_chrgbck_agree.cost_cat_id');
		this.gridChgbkAgrements_onRefresh();
	},
	formChgbkAgrement_onDelete: function(){
		if(this.cost_cat_id == null){
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
		this.formChgbkAgrement_refresh();
	}
});

function showLsDetails(row){
	lsChrbkAgreeController.ls_id = row['ls.ls_id'];
	lsChrbkAgreeController.cost_cat_id = null;
	lsChrbkAgreeController.gridChgbkAgrements_onRefresh();
	lsChrbkAgreeController.formChgbkAgrement_refresh();
}

function editAgreement(row){
	lsChrbkAgreeController.cost_cat_id = row['ls_chrgbck_agree.cost_cat_id'];
	lsChrbkAgreeController.formChgbkAgrement_refresh();
}
