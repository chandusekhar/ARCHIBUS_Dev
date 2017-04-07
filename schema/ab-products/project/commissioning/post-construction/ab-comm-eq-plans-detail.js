var eqDisplayController = View.createController('eqDisplay',{

	eqDetailsForm_onShowDoc: function() {
    	var record = this.eqDetailsForm.getRecord();		
		var eqStd = record.getValue('eqstd.eq_std');
		var eqDocFileName = record.getValue('eqstd.doc_graphic');
		var keys = {'eq_std': eqStd};
		View.showDocument(keys, 'eqstd', 'doc_graphic', eqDocFileName);
	},

	eqDetailsForm_onEdit: function() {
    	var record = this.eqDetailsForm.getRecord();		
		var eqId = record.getValue('eq.eq_id');
		var restriction = {'eq.eq_id':eqId};

		this.editForm(restriction);
	},

    editForm: function(restriction) {
		this.editEqForm.refresh(restriction, false);
        this.editEqForm.showInWindow({
			newRecord: false,
            closeButton: false
        });
    },

	editEqForm_onSave: function() {
        if (this.editEqForm.save()) {
			this.editEqForm.closeWindow();
			this.eqDetailsForm.refresh();
		}
	}
});