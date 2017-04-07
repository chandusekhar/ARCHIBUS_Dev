View.createController('storageLocationDetails', {
	pkeyValue:null,
	
	initializeView:function(){
		this.storageLocationForm.refresh({'waste_areas.storage_location':this.pkeyValue}, false);
	}
})
