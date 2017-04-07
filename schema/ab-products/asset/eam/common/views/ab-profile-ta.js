var abProfileFurnitureCtrl = View.createController('abProfileFurnitureCtrl', {
	
	abProfileTa_form_afterRefresh: function(){
		if(valueExistsNotEmpty(this.abProfileTa_form.getFieldValue('fnstd.doc_graphic'))){
			this.abProfileTa_form.showImageDoc('image_field', 'fnstd.fn_std', 'fnstd.doc_graphic');
		}else{
			this.abProfileTa_form.fields.get(this.abProfileTa_form.fields.indexOfKey('image_field')).dom.src = null;
			this.abProfileTa_form.fields.get(this.abProfileTa_form.fields.indexOfKey('image_field')).dom.alt = getMessage('text_no_image');
		}
	}
})