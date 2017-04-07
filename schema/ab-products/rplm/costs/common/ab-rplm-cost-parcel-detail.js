var parcelDetailController = View.createController('itemDetailCtrl',{
	itemId: null,
	
	loadPanel: function(){
		this.parcelForm.refresh({'parcel.parcel_id':this.itemId}, false);
		if(valueExistsNotEmpty(this.parcelForm.getFieldValue('parcel.parcel_photo'))){
			this.parcelForm.showImageDoc('image_field', ['parcel.pr_id', 'parcel.parcel_id'], 'parcel.parcel_photo');
		}else{
			var imageField = this.parcelForm.fields.get('image_field');
			imageField.dom.src = null;
			imageField.dom.alt = getMessage('text_no_image');
		}
	}
});
