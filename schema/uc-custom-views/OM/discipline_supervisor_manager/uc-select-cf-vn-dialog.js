var selectCfVnDialogController = View.createController('selectCfVnDialogController', {

	parentPanel: "",
	tragetTbl: "",
	tragetFld: "",
	rest: "",

	afterViewLoad: function() {
		this.inherit();
		this.parentPanel = window.location.parameters['parentPanel'];
		this.tragetTbl = window.location.parameters['tragetTbl'];
		this.tragetFld = window.location.parameters['tragetFld'];
		if (window.location.parameters['filter'] != null) {
			this.rest = window.location.parameters['filter'];
		}
	},

	afterInitialDataFetch: function() {
		this.inherit();

		if (this.rest != "") {
			this.gridPanel.refresh("cf_id like '%"+this.rest.replace(/'/g,"''")+"%'");
		}
		else {
			this.gridPanel.refresh();
		}
	},

	onSelectCfVn: function(row){
		var cf_vn = row['cf.cf_id'];
		var parentView = View.getOpenerView();
		var form_parent = parentView.panels.get(selectCfVnDialogController.parentPanel);
		form_parent.setFieldValue(selectCfVnDialogController.tragetTbl+"."+selectCfVnDialogController.tragetFld,cf_vn);
		parentView.closeDialog();
	}
});