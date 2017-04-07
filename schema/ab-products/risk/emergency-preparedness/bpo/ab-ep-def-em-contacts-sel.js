var epAssignTeamSelectMember = View.createController('epAssignTeamSelectMember', {
	em_id : '',
	contact_id : '',
	vn_id : '',
	
	epAssignTeamSelectMemberGridEm_onSelectEm : function(row) {
		this.em_id = row.record['em.em_id.key'];
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("em.em_id", this.em_id);
		
		var record = this.epAssignTeamSelectMemberDsEm.getRecord(restriction);
		
		if (record != null) {
			var emergencyContactForm = View.getOpenerView().panels.get("emergencyContactForm");
			 
			emergencyContactForm.setFieldValue('team.contact_code', this.em_id);
			emergencyContactForm.setFieldValue('team.em_id', this.em_id);
			emergencyContactForm.setFieldValue('team.contact_id', '');
			emergencyContactForm.setFieldValue('team.vn_id', '');
		  	emergencyContactForm.setFieldValue('team.source_table', 'em');
			emergencyContactForm.setFieldValue('team.contact_type_archive', record.getValue("em.em_std")); 
			emergencyContactForm.setFieldValue('team.company_archive', ''); 
			emergencyContactForm.setFieldValue('team.email_archive', record.getValue("em.email")); 
			emergencyContactForm.setFieldValue('team.phone_archive',  record.getValue("em.phone"));
			emergencyContactForm.setFieldValue('team.fax_archive',  record.getValue("em.fax"));
			emergencyContactForm.setFieldValue('team.cell_num_archive',  record.getValue("em.cellular_number")); 
			emergencyContactForm.setFieldValue('team.address_archive', record.getValue("em.bl_id") + '-' + record.getValue("em.fl_id") +'-' + record.getValue("em.rm_id")); 
			emergencyContactForm.setFieldValue('team.name_archive', record.getValue("em.name_last") + ', ' + record.getValue("em.name_first") ); 
		
			//These values are not listed in either of the em, contact, or vn tables.  
			//Set to default values when a different member_id is selected	 
			emergencyContactForm.setFieldValue('team.status', 'Active');
			emergencyContactForm.setFieldValue('team.notes', '');			

			// set related fields
			emergencyContactForm.setFieldValue('em.bl_id', record.getValue("em.bl_id"));
			emergencyContactForm.setFieldValue('em.fl_id', record.getValue("em.fl_id"));
			emergencyContactForm.setFieldValue('em.rm_id', record.getValue("em.rm_id"));
			emergencyContactForm.setFieldValue('em.dv_id', record.getValue("em.dv_id"));
			emergencyContactForm.setFieldValue('em.dp_id', record.getValue("em.dp_id"));
			
			var controller = View.getOpenerView().controllers.get(0);
			controller.emergencyContactForm_afterRefresh();
			
		}		
			
		View.closeThisDialog(); 
	},
	 
	epAssignTeamSelectMemberGridContact_onSelectContact : function(row) {
		this.contact_id = row.record['contact.contact_id.key'];
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("contact.contact_id", this.contact_id);
		
		var record = this.epAssignTeamSelectMemberDsContact.getRecord(restriction);
		if (record != null) {
			var emergencyContactForm = View.getOpenerView().panels.get("emergencyContactForm");
			
			emergencyContactForm.setFieldValue('team.contact_code', this.contact_id);
			emergencyContactForm.setFieldValue('team.contact_id', this.contact_id);
			emergencyContactForm.setFieldValue('team.em_id', '');
			emergencyContactForm.setFieldValue('team.vn_id', '');
		  	emergencyContactForm.setFieldValue('team.source_table', 'contact');
			emergencyContactForm.setFieldValue('team.contact_type_archive', record.getLocalizedValue("contact.contact_type")); 
			emergencyContactForm.setFieldValue('team.company_archive', record.getValue("contact.company")); 
			emergencyContactForm.setFieldValue('team.email_archive', record.getValue("contact.email")); 
			emergencyContactForm.setFieldValue('team.phone_archive',  record.getValue("contact.phone"));
			emergencyContactForm.setFieldValue('team.fax_archive',  record.getValue("contact.fax"));
			emergencyContactForm.setFieldValue('team.cell_num_archive',  record.getValue("contact.cellular_number")); 
			emergencyContactForm.setFieldValue('team.address_archive',  record.getValue("contact.address1") + ' ' + record.getValue("contact.address2") + ', ' 
					+ record.getValue("contact.city_id") + ', ' + record.getValue("contact.state_id")  + ' ' + record.getValue("contact.zip")  + ' ' + record.getValue("contact.ctry_id") ); 
			emergencyContactForm.setFieldValue('team.name_archive',  record.getValue("contact.name_last") + ', ' + record.getValue("contact.name_first") ); 
		
			//These values are not listed in either of the em, contact, or vn tables.  
			//Set to default values when a different member_id is selected	 
			emergencyContactForm.setFieldValue('team.status', 'Active');
			emergencyContactForm.setFieldValue('team.notes', '');			
			
			// set related fields
			emergencyContactForm.setFieldValue('contact.ctry_id', record.getValue("contact.ctry_id"));
			emergencyContactForm.setFieldValue('contact.state_id', record.getValue("contact.state_id"));
			emergencyContactForm.setFieldValue('contact.city_id', record.getValue("contact.city_id"));
			emergencyContactForm.setFieldValue('contact.zip', record.getValue("contact.zip"));
			emergencyContactForm.setFieldValue('contact.address1', record.getValue("contact.address1"));
			emergencyContactForm.setFieldValue('contact.address2', record.getValue("contact.address2"));
			
			var controller = View.getOpenerView().controllers.get(0);
			controller.emergencyContactForm_afterRefresh();
		}		
			
		View.closeThisDialog(); 
	},
	
	epAssignTeamSelectMemberGridVn_onSelectVn : function(row) {
		this.vn_id = row.record['vn.vn_id.key'];
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("vn.vn_id", this.vn_id);
		
		var record = this.epAssignTeamSelectMemberDsVn.getRecord(restriction);
		if (record != null) {
			var emergencyContactForm = View.getOpenerView().panels.get("emergencyContactForm");
			
			emergencyContactForm.setFieldValue('team.contact_code', this.vn_id);
			emergencyContactForm.setFieldValue('team.vn_id', this.vn_id);
			emergencyContactForm.setFieldValue('team.em_id', '');
			emergencyContactForm.setFieldValue('team.contact_id', '');
		  	emergencyContactForm.setFieldValue('team.source_table', 'vn');
			emergencyContactForm.setFieldValue('team.contact_type_archive', record.getLocalizedValue("vn.vendor_type")); 
			emergencyContactForm.setFieldValue('team.company_archive', record.getValue("vn.company")); 
			emergencyContactForm.setFieldValue('team.email_archive', record.getValue("vn.email")); 
			emergencyContactForm.setFieldValue('team.phone_archive',  record.getValue("vn.phone"));
			emergencyContactForm.setFieldValue('team.fax_archive',  record.getValue("vn.fax")); 
			
			emergencyContactForm.setFieldValue('team.address_archive',  record.getValue("vn.address1") + ' ' + record.getValue("vn.address2") + ', ' 
					+ record.getValue("vn.city") + ', ' + record.getValue("vn.state")  + ' ' + record.getValue("vn.zip")  + ' ' + record.getValue("vn.country") ); 
		
			emergencyContactForm.setFieldValue('team.name_archive', record.getValue("vn.contact")); 
		
			//These values are not listed in either of the em, contact, or vn tables.  
			//Set to default values when a different member_id is selected	 
			emergencyContactForm.setFieldValue('team.status', 'Active');
			emergencyContactForm.setFieldValue('team.notes', '');
			
			// set related fields
			emergencyContactForm.setFieldValue('vn.country', record.getValue("vn.country"));
			emergencyContactForm.setFieldValue('vn.state', record.getValue("vn.state"));
			emergencyContactForm.setFieldValue('vn.city', record.getValue("vn.city")); 
			emergencyContactForm.setFieldValue('vn.address1', record.getValue("vn.address1"));
			emergencyContactForm.setFieldValue('vn.address2', record.getValue("vn.address2"));
			
			var controller = View.getOpenerView().controllers.get(0);
			controller.emergencyContactForm_afterRefresh();
			 
		}		
			
		View.closeThisDialog(); 
	} 
});
