View.createController('teamSupportController', {
    callbackMethod: null,
    afterViewLoad: function () {
        if (valueExists(this.view.parameters) && valueExists(this.view.parameters.callback)) {
            this.callbackMethod = this.view.parameters.callback;
        }
    },
    setTeamMember: function (sourceTable, record) {
        this.abTeam_form.setFieldValue('team.source_table', sourceTable);
        this.abTeam_form.setFieldValue('team.status', 'Active');
        if ('em' === sourceTable) {
            this.abTeam_form.setFieldValue('team.team_member_id', record.getValue("em.em_id"));
            this.abTeam_form.setFieldValue('team.em_id', record.getValue("em.em_id"));
            this.abTeam_form.setFieldValue('em.em_id', record.getValue("em.em_id"));
            this.abTeam_form.setFieldValue('team.contact_id', '');
            this.abTeam_form.setFieldValue('team.vn_id', '');
            this.abTeam_form.setFieldValue('team.email_archive', record.getValue("em.email"));
            this.abTeam_form.setFieldValue('team.cell_num_archive', record.getValue("em.cellular_number"));
            this.abTeam_form.setFieldValue('team.name_archive', record.getValue("em.name_last") + ', ' + record.getValue("em.name_first"));
            this.abTeam_form.setFieldValue('em.em_photo', record.getValue("em.em_photo"));
        }
        if ('contact' === sourceTable) {
            this.abTeam_form.setFieldValue('team.team_member_id', record.getValue("contact.contact_id"));
            this.abTeam_form.setFieldValue('team.contact_id', record.getValue("contact.contact_id"));
            this.abTeam_form.setFieldValue('contact.contact_id', record.getValue("contact.contact_id"));
            this.abTeam_form.setFieldValue('team.em_id', '');
            this.abTeam_form.setFieldValue('team.vn_id', '');
            this.abTeam_form.setFieldValue('team.email_archive', record.getValue("contact.email"));
            this.abTeam_form.setFieldValue('team.cell_num_archive', record.getValue("contact.cellular_number"));
            this.abTeam_form.setFieldValue('team.name_archive', record.getValue("contact.name_last") + ', ' + record.getValue("contact.name_first"));
            this.abTeam_form.setFieldValue('contact.contact_photo', record.getValue("contact.contact_photo"));
        }
        if ('vn' === sourceTable) {
            this.abTeam_form.setFieldValue('team.team_member_id', record.getValue("vn.vn_id"));
            this.abTeam_form.setFieldValue('team.vn_id', record.getValue("vn.vn_id"));
            this.abTeam_form.setFieldValue('vn.vn_id', record.getValue("vn.vn_id"));
            this.abTeam_form.setFieldValue('team.em_id', '');
            this.abTeam_form.setFieldValue('team.contact_id', '');
            this.abTeam_form.setFieldValue('team.email_archive', record.getValue("vn.email"));
            this.abTeam_form.setFieldValue('team.cell_num_archive', record.getValue("vn.phone"));
            this.abTeam_form.setFieldValue('team.name_archive', record.getValue("vn.contact"));
            this.abTeam_form.setFieldValue('vn.vendor_photo', record.getValue("vn.vendor_photo"));
        }
        
      //KB 3053207 - display image depending on the selected type
        if(valueExistsNotEmpty(this.abTeam_form.getFieldValue('team.contact_id'))){
    		if (valueExistsNotEmpty(this.abTeam_form.getFieldValue('contact.contact_photo'))) {
    			this.abTeam_form.showImageDoc('team_image', 'contact.contact_id', 'contact.contact_photo');
    		}
    	}else if(valueExistsNotEmpty(this.abTeam_form.getFieldValue('team.em_id'))){
    		if (valueExistsNotEmpty(this.abTeam_form.getFieldValue('em.em_photo'))) {
    			this.abTeam_form.showImageDoc('team_image', 'em.em_id','em.em_photo');
    		}
    	}else if(valueExistsNotEmpty(this.abTeam_form.getFieldValue('team.vn_id'))){
    		if (valueExistsNotEmpty(this.abTeam_form.getFieldValue('vn.vendor_photo'))) {
    			this.abTeam_form.showImageDoc('team_image', 'vn.vn_id', 'vn.vendor_photo');
    		}
    	}
        
    },
    abTeam_form_onSave: function () {
        if (this.abTeam_form.save()) {
            if (valueExists(this.callbackMethod)) {
                this.callbackMethod();
            }
        }
    },
    abTeam_form_afterRefresh: function (form) {
    	//KB 3053207 - display image depending on the selected type
    	if(valueExistsNotEmpty(this.abTeam_form.getFieldValue('team.contact_id'))){
    		if (valueExistsNotEmpty(this.abTeam_form.getFieldValue('contact.contact_photo'))) {
    			this.abTeam_form.showImageDoc('team_image', 'contact.contact_id', 'contact.contact_photo');
    		}
    	}else if(valueExistsNotEmpty(this.abTeam_form.getFieldValue('team.em_id'))){
    		if (valueExistsNotEmpty(this.abTeam_form.getFieldValue('em.em_photo'))) {
    			this.abTeam_form.showImageDoc('team_image', 'em.em_id', 'em.em_photo');
    		}
    	}else if(valueExistsNotEmpty(this.abTeam_form.getFieldValue('team.vn_id'))){
    		if (valueExistsNotEmpty(this.abTeam_form.getFieldValue('vn.vendor_photo'))) {
    			this.abTeam_form.showImageDoc('team_image', 'vn.vn_id', 'vn.vendor_photo');
    		}
    	}
    	
        if (form.newRecord) {
            Ext.get('abTeam_form_instructions').hide();
        }
    },
    abTeam_form_onDelete: function () {
        var dataSource = this.abTeam_form.getDataSource();
        var record = this.abTeam_form.record;
        View.confirm(getMessage('confirmDelete'), function (button) {
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    callCallbackMethod();
                } catch (e) {
                    var message = String.format(getMessage('errorDelete'));
                    View.showMessage('error', message, e.message, e.data);
                }
            }
        });
    }
});
function selectTeamMember() {
    View.openDialog('ab-team-member-select.axvw', null, false, {
        callback: function (sourceTable, record) {
            View.closeDialog();
            View.controllers.get('teamSupportController').setTeamMember(sourceTable, record);
        }
    });
}
function callCallbackMethod() {
    var controller = View.controllers.get('teamSupportController');
    if (valueExists(controller.callbackMethod)) {
        controller.callbackMethod();
    }
    return true;
}
