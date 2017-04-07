var projMngPkgBidsAddVnController = View.createController('projMngPkgBidsAddVn', {
	afterInitialDataFetch: function() {
		this.projMngPkgBidsAdd_addVn.show(false);
	},
	
	projMngPkgBidsAdd_vn_onSelectVn: function(obj) {
		var vn_id = obj.restriction['vn.vn_id'];
		if(View.parameters.callback){
			View.parameters.callback(vn_id);
		}
		View.closeThisDialog();
	},
	
	projMngPkgBidsAdd_addVn_onSave: function() {
		if (!this.projMngPkgBidsAdd_addVn.save()) return;
		var vn_id = this.projMngPkgBidsAdd_addVn.getFieldValue('vn.vn_id');

		if(View.parameters.callback){
			View.parameters.callback(vn_id);
		}
		View.closeThisDialog();
	}
});
