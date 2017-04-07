View.createController('viewAllEm', {
    
    emPhotoForm_afterRefresh: function(){
		var distinctPanel = View.panels.get('emPhotoForm');
		var em_photo = distinctPanel.getFieldValue('em.em_photo').toLowerCase();
		var em_id = distinctPanel.getFieldValue('em.em_id');
		if (valueExistsNotEmpty(em_photo)) {
			distinctPanel.showImageDoc('image_field', 'em.em_id', 'em.em_photo');
		}
		else {
			distinctPanel.fields.get('image_field').dom.src = null;
			distinctPanel.fields.get('image_field').dom.alt = getMessage('noImage');
		}
	}
});
