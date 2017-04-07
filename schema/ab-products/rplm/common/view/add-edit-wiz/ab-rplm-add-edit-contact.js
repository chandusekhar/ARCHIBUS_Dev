var addEditContactController = View.createController('addEditContact', {
    itemId: null,
    itemType: null,
    leaseId: null,
    contactId: null,
    refreshPanels: new Array(),
    refreshTree: null,
    formAddEditContact_onSave: function(){
        if (!validateFields(this.formAddEditContact, this.dsAddEditContact, this.contactId)) {
            return;
        }
        var record = null;
        if (this.contactId == null) {
            record = new Ab.data.Record({
                'contact.contact_id': this.formAddEditContact.getFieldValue('contact.contact_id'),
                'contact.company': this.formAddEditContact.getFieldValue('contact.company'),
                'contact.name_first': this.formAddEditContact.getFieldValue('contact.name_first'),
                'contact.honorific': this.formAddEditContact.getFieldValue('contact.honorific'),
                'contact.name_last': this.formAddEditContact.getFieldValue('contact.name_last'),
                'contact.email': this.formAddEditContact.getFieldValue('contact.email'),
                'contact.address1': this.formAddEditContact.getFieldValue('contact.address1'),
                'contact.phone': this.formAddEditContact.getFieldValue('contact.phone'),
                'contact.address2': this.formAddEditContact.getFieldValue('contact.address2'),
                'contact.cellular_number': this.formAddEditContact.getFieldValue('contact.cellular_number'),
                'contact.city_id': this.formAddEditContact.getFieldValue('contact.city_id'),
                'contact.fax': this.formAddEditContact.getFieldValue('contact.fax'),
                'contact.state_id': this.formAddEditContact.getFieldValue('contact.state_id'),
                'contact.pager': this.formAddEditContact.getFieldValue('contact.pager'),
                'contact.zip': this.formAddEditContact.getFieldValue('contact.zip'),
				'contact.regn_id': this.formAddEditContact.getFieldValue('contact.regn_id'),
                'contact.contact_type': this.formAddEditContact.getFieldValue('contact.contact_type'),
                'contact.ctry_id': this.formAddEditContact.getFieldValue('contact.ctry_id'),
                'contact.status': this.formAddEditContact.getFieldValue('contact.status'),
                'contact.notes': this.formAddEditContact.getFieldValue('contact.notes'),
                'contact.bl_id': (this.itemType == 'BUILDING' ? this.itemId : null),
                'contact.pr_id': (this.itemType == 'LAND' || this.itemType == 'STRUCTURE' ? this.itemId : null),
                'contact.ls_id': (this.itemType == 'LEASE' ? this.leaseId : null)
            }, true);
            
        }
        else {
            record = this.formAddEditContact.getRecord();
            record.setValue('contact.contact_id', this.formAddEditContact.getFieldValue('contact.contact_id'));
            record.setValue('contact.company', this.formAddEditContact.getFieldValue('contact.company'));
            record.setValue('contact.name_first', this.formAddEditContact.getFieldValue('contact.name_first'));
            record.setValue('contact.honorific', this.formAddEditContact.getFieldValue('contact.honorific'));
            record.setValue('contact.name_last', this.formAddEditContact.getFieldValue('contact.name_last'));
            record.setValue('contact.email', this.formAddEditContact.getFieldValue('contact.email'));
            record.setValue('contact.address1', this.formAddEditContact.getFieldValue('contact.address1'));
            record.setValue('contact.phone', this.formAddEditContact.getFieldValue('contact.phone'));
            record.setValue('contact.address2', this.formAddEditContact.getFieldValue('contact.address2'));
            record.setValue('contact.cellular_number', this.formAddEditContact.getFieldValue('contact.cellular_number'));
            record.setValue('contact.city_id', this.formAddEditContact.getFieldValue('contact.city_id'));
            record.setValue('contact.fax', this.formAddEditContact.getFieldValue('contact.fax'));
            record.setValue('contact.state_id', this.formAddEditContact.getFieldValue('contact.state_id'));
            record.setValue('contact.pager', this.formAddEditContact.getFieldValue('contact.pager'));
            record.setValue('contact.zip', this.formAddEditContact.getFieldValue('contact.zip'));
			record.setValue('contact.regn_id', this.formAddEditContact.getFieldValue('contact.regn_id'));
            record.setValue('contact.contact_type', this.formAddEditContact.getFieldValue('contact.contact_type'));
            record.setValue('contact.ctry_id', this.formAddEditContact.getFieldValue('contact.ctry_id'));
            record.setValue('contact.status', this.formAddEditContact.getFieldValue('contact.status'));
            record.setValue('contact.notes', this.formAddEditContact.getFieldValue('contact.notes'));
        }
        
        try {
            this.dsAddEditContact.saveRecord(record);
            for (var i = 0; i < this.refreshPanels.length; i++) {
                View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
            }
			View.getOpenerView().controllers.get('rplmContacts').restoreSettings();
            if (this.refreshTree) {
                View.getOpenerView().controllers.get('rplmContacts').buildTree();
            }
        } 
        catch (e) {
            var message = String.format(getMessage('error_update'));
            View.showMessage('error', e.message, e.data);
            return;
        }
        
        View.closeThisDialog();
    },
    formAddEditContact_onReset: function(){
        View.closeThisDialog();
    }
})

function validateFields(form, ds, crtId){
    if (form.getFieldValue('contact.contact_id').length == 0) {
        View.showMessage(getMessage('error_no_contact_code'));
        return false;
    }
    if (crtId == null && ds.getRecords({
        'contact.contact_id': form.getFieldValue('contact.contact_id')
    }).length > 0) {
        View.showMessage(getMessage('error_contact_code'));
        return false;
    }
    return (true);
}

/**
 * Copy to Contact the location fields of the selected Company
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 */
function afterSelectCompany(fieldName, selectedValue, previousValue){
	var panel = View.panels.get("formAddEditContact");
	
	if(!panel.newRecord)
		return;
	
	var dsCompany = View.dataSources.get("abRplmAddEditContact_dsCompany");
	var companyRecord = dsCompany.getRecord(new Ab.view.Restriction({"company.company": selectedValue}));
	
	if(panel.getFieldValue("contact.address1") == "")
		panel.setFieldValue("contact.address1", companyRecord.getValue("company.address1"));
	
	if(panel.getFieldValue("contact.address2") == "")
		panel.setFieldValue("contact.address2", companyRecord.getValue("company.address2"));
	
	if(panel.getFieldValue("contact.city_id") == "")
		panel.setFieldValue("contact.city_id", companyRecord.getValue("company.city_id"));
	
	if(panel.getFieldValue("contact.ctry_id") == "")
		panel.setFieldValue("contact.ctry_id", companyRecord.getValue("company.ctry_id"));
	
	if(panel.getFieldValue("contact.regn_id") == "")
		panel.setFieldValue("contact.regn_id", companyRecord.getValue("company.regn_id"));
	
	if(panel.getFieldValue("contact.state_id") == "")
		panel.setFieldValue("contact.state_id", companyRecord.getValue("company.state_id"));
	
	if(panel.getFieldValue("contact.zip") == "")
		panel.setFieldValue("contact.zip", companyRecord.getValue("company.zip"));
}
