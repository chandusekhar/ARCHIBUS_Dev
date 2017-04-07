function showPhoto(formPanelId, fieldId, pkId){
	
	var panel = View.panels.get(formPanelId);
	
	if(valueExistsNotEmpty(panel.getFieldValue(fieldId))){
		panel.showImageDoc('image_field', pkId, fieldId);
	}else{
		panel.fields.get('image_field').dom.src = null;
	}
	
	
}