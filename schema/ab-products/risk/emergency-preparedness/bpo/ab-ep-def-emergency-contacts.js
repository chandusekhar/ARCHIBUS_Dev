var epDefEmergencyContactsController = View.createController('epDefEmergencyContactsController', {
	
	afterViewLoad: function() {
		 Workflow.callMethod('AbRiskEmergencyPreparedness-EPCommonService-updateEmergencyContacts');		 
	},
	
	emergencyContactForm_onDelete: function() {		
		this.emergencyContactForm.fields.removeKey('team.contact_code');		
		this.emergencyContactForm.deleteRecord();		
		this.emergencyContactForm.show(false);		
		this.emergencyContactSelectPanel.refresh();
	},
	
	emergencyContactForm_afterRefresh: function() {
		var contact_code = $('ShowemergencyContactForm_team.contact_code').innerHTML;
        if (contact_code=='') {            
            this.hideRow(8);
            this.hideRow(9);
            this.hideRow(10);
            this.hideRow(11); 
            this.hideRow(12); 
            this.hideRow(13);             
            this.hideRow(14);  		
            this.hideRow(15);
            this.hideRow(16);
            
		    this.showRow(17); 
        }
        else {
		    this.hideRow(17); 
            var source = this.emergencyContactForm.getFieldValue("team.source_table");
            if (source == 'contact') {
                this.showContactDetails();
            } else if (source == 'vn') {
                this.showVendorDetails();
            } else {
                this.showEmployeeDetails();
            } 
        }
        var contact_status = this.emergencyContactForm.getFieldValue("team.status");
        if (contact_code!='' || contact_status!='Removed') {
            this.emergencyContactForm.enableField('team.status',true);
        }        
	},
	
	showEmployeeDetails: function() {	 
 		this.hideRow(8);
 		this.hideRow(9);
		this.hideRow(10);
		this.hideRow(11); 
		this.hideRow(12); 
		this.hideRow(13); 
        
		this.showRow(14);  		
		this.showRow(15);
		this.showRow(16);
	},
	
	showContactDetails: function() { 
		this.showRow(8);  		
		this.showRow(9);
		this.showRow(10);
		
		this.hideRow(11);
		this.hideRow(12); 
		this.hideRow(13); 
		this.hideRow(14);  		
		this.hideRow(15);
		this.hideRow(16);

        var contact_type = this.emergencyContactForm.getRecord().getLocalizedValue('contact.contact_type');
		this.emergencyContactForm.setFieldValue('team.contact_type_archive', contact_type); 
	},
	
 	showVendorDetails: function() { 
 		this.hideRow(8);
 		this.hideRow(9);
		this.hideRow(10);
 		 	
 		this.showRow(11);
 		this.showRow(12); 
 		this.showRow(13); 
        
		this.hideRow(14);  		
		this.hideRow(15);
		this.hideRow(16);
        
        var contact_type = this.emergencyContactForm.getRecord().getLocalizedValue('vn.vendor_type');
		this.emergencyContactForm.setFieldValue('team.contact_type_archive', contact_type); 
        
	},
	
	hideRow: function(rowNumber){
		var id = this.emergencyContactForm.getParentElementId();
		var table = $(id);
		if (rowNumber < table.rows.length) {
			table.rows[rowNumber].style.display = 'none';
		}		
	}, 
	
	showRow: function(rowNumber){
		var id = this.emergencyContactForm.getParentElementId();
		var table = $(id);
		if (rowNumber < table.rows.length) {
			table.rows[rowNumber].style.display = 'table-row';
		}		
	}
	
});