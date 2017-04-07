var bldgDetailController = View.createController('itemDetailCtrl',{
	itemId: null,
	
	loadPanel: function(){
		this.formBuilding.refresh({'bl.bl_id':this.itemId}, false);
		if(valueExistsNotEmpty(this.formBuilding.getFieldValue('bl.bldg_photo'))){
			this.formBuilding.showImageDoc('image_field', 'bl.bl_id', 'bl.bldg_photo');
		}else{
			var imageField = this.formBuilding.fields.get('image_field');
			imageField.dom.src = null;
			imageField.dom.alt = getMessage('text_no_image');
		}
	},
	
	afterViewLoad:function(){
		
		this.formBuilding.addParameter('owned', '\''+getMessage('owned')+'\'');
		this.formBuilding.addParameter('leased', '\''+getMessage('leased')+'\'');
		this.formBuilding.addParameter('neither', '\''+getMessage('neither')+'\'');
	}
});


/**
 * Format form field to show currency symbol when are read only.
 * @param form
 */
function formatCurrency(form){
	var dataSource = form.getDataSource();
	var fieldValues = form.record.values;
	var record = form.record;
	dataSource.fieldDefs.each(function(fieldDef){
		var fieldName = fieldDef.fullName;
		if(valueExistsNotEmpty(fieldDef.currencyField) 
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly){
			
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
			form.setFieldValue(fieldName, formattedValue, neutralValue, false);
		}else if(valueExistsNotEmpty(fieldDef.currency)
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly ){
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
			form.setFieldValue(fieldName, formattedValue, neutralValue, false);
		}
	});
}

