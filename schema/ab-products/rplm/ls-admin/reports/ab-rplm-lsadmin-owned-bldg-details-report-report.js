var repOwnBuildingController = View.createController('repOwnBuilding', {
	bl_id:' ',
	pr_id:'',
	ls_id:'',
	
	initializeView:function(){
		this.ownBuildingInformation.addParameter('owned', '\''+getMessage('owned')+'\'');
		this.ownBuildingInformation.addParameter('leased', '\''+getMessage('leased')+'\'');
		this.ownBuildingInformation.addParameter('neither', '\''+getMessage('neither')+'\'');
		this.ownBuildingLeaseInformation.addParameter('active', '\''+getMessage('active')+'\'');
		this.ownBuildingLeaseInformation.addParameter('inactive', '\''+getMessage('inactive')+'\'');
		
		this.ownBuildingInformation.refresh({'bl.bl_id': this.bl_id}, (this.bl_id == ' '));
		if(valueExistsNotEmpty(this.ownBuildingInformation.getFieldValue('bl.bldg_photo'))){
			this.ownBuildingInformation.showImageDoc('image_field', 'bl.bl_id', 'bl.bldg_photo');
		}else{
			this.ownBuildingInformation.fields.get('image_field').dom.src = null;
			this.ownBuildingInformation.fields.get('image_field').dom.alt = getMessage('text_no_image');
		}
		this.ownBuildingLeaseInformation.refresh({'ls.bl_id': this.bl_id}, (this.bl_id == ' '));
		this.ownBuildingSuiteInfo.refresh({'su.bl_id': this.bl_id}, (this.bl_id == ' '));
		this.ownBuildingDocumentsInfo.refresh({'docs_assigned.bl_id': this.bl_id}, (this.bl_id == ' '));
		this.ownBuildingContactsInfo.refresh({'contact.bl_id': this.bl_id}, (this.bl_id == ' '));
		
		this.ownBuildingInformation.actions.get("paginatedReport").enableButton(valueExistsNotEmpty(this.bl_id));
	},
	ownBuildingDocumentsInfo_onView: function(row) {
		View.showDocument({'doc_id':row.getRecord().getValue('docs_assigned.doc_id')}, 'docs_assigned', 'doc', row.getRecord().getValue('docs_assigned.doc'));
	},

	ownBuildingInformation_onPaginatedReport: function(){
		var parameters = {
				'blId' : this.bl_id,
				'leased' : getMessage("leased"),
				'owned' : getMessage("owned"),
				'neither' : getMessage("neither"),
				'active' : getMessage("active"),
				'inactive' : getMessage("inactive")
			};
		View.openPaginatedReportDialog('ab-rplm-lsadmin-owned-bldg-details-rpt.axvw', null, parameters);
	}
})


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
