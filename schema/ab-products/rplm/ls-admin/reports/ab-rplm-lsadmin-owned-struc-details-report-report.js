var repOwnStructureController = View.createController('repOwnStructure', {
	bl_id:'',
	pr_id:' ',
	ls_id:'',

	initializeView:function(){
		this.ownStructureInformation.addParameter('owned', '\''+getMessage('owned')+'\'');
		this.ownStructureInformation.addParameter('leased', '\''+getMessage('leased')+'\'');
		this.ownStructureInformation.addParameter('neither', '\''+getMessage('neither')+'\'');
		this.ownStructureLeaseInformation.addParameter('active', '\''+getMessage('active')+'\'');
		this.ownStructureLeaseInformation.addParameter('inactive', '\''+getMessage('inactive')+'\'');
		
		this.ownStructureInformation.refresh({'property.pr_id': this.pr_id}, (this.pr_id == ' '));
		if(valueExistsNotEmpty(this.ownStructureInformation.getFieldValue('property.prop_photo'))){
			this.ownStructureInformation.showImageDoc('image_field', 'property.pr_id', 'property.prop_photo');
		}else{
			this.ownStructureInformation.fields.get('image_field').dom.src = null;
			this.ownStructureInformation.fields.get('image_field').dom.alt = getMessage('text_no_image');
		}
		this.ownStructureLeaseInformation.refresh({'ls.pr_id': this.pr_id}, (this.pr_id == ' '));
		this.ownStructureDocumentsInfo.refresh({'docs_assigned.pr_id': this.pr_id}, (this.pr_id == ' '));
		this.ownStructureContactsInfo.refresh({'contact.pr_id': this.pr_id}, (this.pr_id == ' '));
		
		this.ownStructureInformation.actions.get("paginatedReport").enableButton(valueExistsNotEmpty(this.pr_id));
	},
	ownStructureDocumentsInfo_onView: function(row) {
		View.showDocument({'doc_id':row.getRecord().getValue('docs_assigned.doc_id')}, 'docs_assigned', 'doc', row.getRecord().getValue('docs_assigned.doc'));
	},

	ownStructureInformation_onPaginatedReport: function(){
		var parameters = {
				'prId' : this.pr_id,
				'leased' : getMessage("leased"),
				'owned' : getMessage("owned"),
				'neither' : getMessage("neither"),
				'active' : getMessage("active"),
				'inactive' : getMessage("inactive")
			};
		View.openPaginatedReportDialog('ab-rplm-lsadmin-owned-struc-details-rpt.axvw', null, parameters);
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
