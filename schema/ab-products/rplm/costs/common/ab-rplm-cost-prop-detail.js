var propDetailController = View.createController('itemDetailCtrl',{
	itemId: null,
	loadPanel: function(){
		this.formProperty.refresh({'property.pr_id':this.itemId}, false);
		if(valueExistsNotEmpty(this.formProperty.getFieldValue('property.prop_photo'))){
			this.formProperty.showImageDoc('image_field', 'property.pr_id', 'property.prop_photo');
		}else{
			var imageField = this.formProperty.fields.get('image_field');
			imageField.dom.src = null;
			imageField.dom.alt = getMessage('text_no_image');
		}
	},
	
	afterViewLoad:function(){
		this.formProperty.addParameter('owned', '\''+getMessage('owned')+'\'');
		this.formProperty.addParameter('leased', '\''+getMessage('leased')+'\'');
		this.formProperty.addParameter('neither', '\''+getMessage('neither')+'\'');
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

