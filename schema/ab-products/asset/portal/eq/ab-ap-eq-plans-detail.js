var eqDisplayController = View.createController('eqDisplay',{

	afterInitialDataFetch: function(){
		if(valueExistsNotEmpty(this.eqDetailsForm.getFieldValue('eqstd.doc_graphic'))){
			this.eqDetailsForm.showImageDoc('eq_doc_image', 'eqstd.eq_std', 'eqstd.doc_graphic');
		}else{
			this.eqDetailsForm.fields.get('eq_doc_image').dom.src = null;
		}
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