var abGbFpDataOtherController = View.createController('abGbFpDataOtherCtrl', {
	//reference to dataConttroller which offers access to 'onDeleteSource' function
	dataController: View.getOpenerView().controllers.get("abGbFpDataCtrl"),

	abGbFpDataOther_gridFootprints_onAddNew: function(){
		this.abGbFpDataOther_formSource.refresh(this.abGbFpDataOther_gridFootprints.restriction, true);
	},

	abGbFpDataOther_formSource_onSaveAndAddNew: function(){
		if(this.abGbFpDataOther_formSource_onSave())
			this.abGbFpDataOther_gridFootprints_onAddNew();
	},

	abGbFpDataOther_formSource_onSave: function(){
		// save form
		if(!this.abGbFpDataOther_formSource.save())
			return false;
		
		// refresh grid
		this.abGbFpDataOther_gridFootprints.refresh();
		
		return true;
	},

	abGbFpDataOther_formSource_onDelete: function(){
		this.dataController.onDeleteSource(this.abGbFpDataOther_formSource, this.abGbFpDataOther_gridFootprints);
	}
});
