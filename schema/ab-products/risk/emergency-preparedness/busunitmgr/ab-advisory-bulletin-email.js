
var abAdvisoryBulletinEmailController = View.createController('abAdvisoryBulletinEmailController', {
	
	method : 'bcc',
	
	consolePanel_onFilter: function() {  
		
	    this.method = jQuery('input:radio[name=email_method]:checked').val();
	    
	    if (this.method == null) {
	    	View.showMessage(getMessage("methodRequired"))
	    	return;
	    }
	    
		this.recipientsPanel.addParameter("employee_checkbox1",  $('employee_checkbox1').checked ? 1 : 0 );
		this.recipientsPanel.addParameter("employee_checkbox2", $('employee_checkbox2').checked ? 1 : 0  );
		this.recipientsPanel.addParameter("contact_checkbox1", $('contact_checkbox1').checked ? 1 : 0  );
		this.recipientsPanel.addParameter("contact_checkbox2", $('contact_checkbox2').checked ? 1 : 0 );
		this.recipientsPanel.addParameter("vendor_checkbox1", $('vendor_checkbox1').checked ? 1 : 0 );
		this.recipientsPanel.addParameter("vendor_checkbox2", $('vendor_checkbox2').checked ? 1 : 0  );
		this.recipientsPanel.addParameter("visitor_checkbox",  $('visitor_checkbox').checked ? 1 : 0  );		
		  		
		if (this.consolePanel.getFieldValue("bl.site_id") != '') {
			this.recipientsPanel.addParameter("sites", this.escapeStrings(this.consolePanel.getFieldValue("bl.site_id")) );
			this.recipientsPanel.addParameter("siteRestriction", " ((tbl.send_general=1 AND bl.site_id IN (${parameters['sites']})) OR (tbl.send_emergency=1 AND team.site_id IN (${parameters['sites']}))) ");
	 	} else {
	 		this.recipientsPanel.addParameter("siteRestriction", "0=0");
	 	}		
		if (this.consolePanel.getFieldValue("bl.pr_id") != '') {
			this.recipientsPanel.addParameter("properties", this.escapeStrings(this.consolePanel.getFieldValue("bl.pr_id")) );
			this.recipientsPanel.addParameter("propertyRestriction", " ((tbl.send_general=1 AND bl.pr_id IN (${parameters['properties']})) OR (tbl.send_emergency=1 AND team.pr_id IN (${parameters['properties']}))) ");
	 	} else {
	 		this.recipientsPanel.addParameter("propertyRestriction", "0=0");
	 	}		
		if (this.consolePanel.getFieldValue("em.bl_id") != '') {
			this.recipientsPanel.addParameter("buildings", this.escapeStrings(this.consolePanel.getFieldValue("em.bl_id")) );
			this.recipientsPanel.addParameter("buildingRestriction", " ((tbl.send_general=1 AND bl.bl_id IN (${parameters['buildings']})) OR (tbl.send_emergency=1 AND team.bl_id IN (${parameters['buildings']}))) ");
	 	} else {
	 		this.recipientsPanel.addParameter("buildingRestriction", "0=0");
	 	}	
		if (this.consolePanel.getFieldValue("em.fl_id") != '') {
			this.recipientsPanel.addParameter("floors", this.escapeStrings(this.consolePanel.getFieldValue("em.fl_id")) );
			this.recipientsPanel.addParameter("floorRestriction", " ( tbl.fl_id IN ( ${parameters['floors']} )  ) ");
	 	} else {
	 		this.recipientsPanel.addParameter("floorRestriction", "0=0");
	 	} 
		if (this.consolePanel.getFieldValue("em.rm_id") != '') {
			this.recipientsPanel.addParameter("rooms", this.escapeStrings(this.consolePanel.getFieldValue("em.rm_id")) );
			this.recipientsPanel.addParameter("roomRestriction", " ( tbl.rm_id IN ( ${parameters['rooms']})  ) ");
	 	} else {
	 		this.recipientsPanel.addParameter("roomRestriction", "0=0");
	 	}
		if (this.consolePanel.getFieldValue("em.dv_id") != '') {
			this.recipientsPanel.addParameter("divisions", this.escapeStrings(this.consolePanel.getFieldValue("em.dv_id")) );
			this.recipientsPanel.addParameter("divisionRestriction", " ( tbl.dv_id IN ( ${parameters['divisions']})  ) ");
	 	} else {
	 		this.recipientsPanel.addParameter("divisionRestriction", "0=0");
	 	}
		if (this.consolePanel.getFieldValue("em.dp_id") != '') {
			this.recipientsPanel.addParameter("departments", this.escapeStrings(this.consolePanel.getFieldValue("em.dp_id")) );
			this.recipientsPanel.addParameter("departmentRestriction", " ( tbl.dp_id IN ( ${parameters['departments']})  ) ");
	 	} else {
	 		this.recipientsPanel.addParameter("departmentRestriction", "0=0");
	 	}
		if (this.consolePanel.getFieldValue("dv.bu_id") != '') {
			this.recipientsPanel.addParameter("businessUnits", this.escapeStrings(this.consolePanel.getFieldValue("dv.bu_id")) );
			this.recipientsPanel.addParameter("businessUnitRestriction", " ( dv.bu_id IN ( ${parameters['businessUnits']})  ) ");
	 	} else {
	 		this.recipientsPanel.addParameter("businessUnitRestriction", "0=0");
	 	}
		if (this.consolePanel.getFieldValue("em.em_std") != '') {
			this.recipientsPanel.addParameter("standards", this.escapeStrings(this.consolePanel.getFieldValue("em.em_std")) );
			this.recipientsPanel.addParameter("standardRestriction", " ( tbl.em_std IN ( ${parameters['standards']})  ) ");
	 	} else {
	 		this.recipientsPanel.addParameter("standardRestriction", "0=0");
	 	}
		if (this.consolePanel.getFieldValue("contact.contact_type") != '') {
			this.recipientsPanel.addParameter("contactTypes", this.escapeStrings(this.consolePanel.getFieldValue("contact.contact_type")) );
			this.recipientsPanel.addParameter("contactTypeRestriction", " ( tbl.contact_type IN ( ${parameters['contactTypes']})  ) ");
	 	} else {
	 		this.recipientsPanel.addParameter("contactTypeRestriction", "0=0");
	 	}
		if (this.consolePanel.getFieldValue("vn.vendor_type") != '') {
			this.recipientsPanel.addParameter("vendorTypes", this.escapeStrings(this.consolePanel.getFieldValue("vn.vendor_type")) );
			this.recipientsPanel.addParameter("vendorTypeRestriction", " ( tbl.vendor_type IN ( ${parameters['vendorTypes']})  ) ");
	 	} else {
	 		this.recipientsPanel.addParameter("vendorTypeRestriction", "0=0");
	 	}
		if (this.consolePanel.getFieldValue("property.county_type") != '') {
			this.recipientsPanel.addParameter("countyTypes", this.escapeStrings(this.consolePanel.getFieldValue("property.county_type")) );
			this.recipientsPanel.addParameter("countyTypeRestriction", " (pr.county_id IN (${parameters['countyTypes']}) OR tbl.county_id IN (${parameters['countyTypes']})) ");
	 	} else {
	 		this.recipientsPanel.addParameter("countyTypeRestriction", "0=0");
	 	}
		if (this.consolePanel.getFieldValue("bl.state_id") != '') {
			this.recipientsPanel.addParameter("states", this.escapeStrings(this.consolePanel.getFieldValue("bl.state_id")) );
			this.recipientsPanel.addParameter("stateRestriction", " ( tbl.state_id IN (${parameters['states']}) ) ");
	 	} else {
	 		this.recipientsPanel.addParameter("stateRestriction", "0=0");
	 	}
		if (this.consolePanel.getFieldValue("bl.city_id") != '') {
			this.recipientsPanel.addParameter("cities", this.escapeStrings(this.consolePanel.getFieldValue("bl.city_id")) );
			this.recipientsPanel.addParameter("cityRestriction", " ( tbl.city_id IN (${parameters['cities']}) ) ");
	 	} else {
	 		this.recipientsPanel.addParameter("cityRestriction", "0=0");
	 	}		
		if (this.consolePanel.getFieldValue("bl.regn_id") != '') {
			this.recipientsPanel.addParameter("regions", this.escapeStrings(this.consolePanel.getFieldValue("bl.regn_id")) );
			this.recipientsPanel.addParameter("regionRestriction", " ( tbl.regn_id IN (${parameters['regions']})  ) ");
	 	} else {
	 		this.recipientsPanel.addParameter("regionRestriction", "0=0");
	 	}
		if (this.consolePanel.getFieldValue("bl.ctry_id") != '') {
			this.recipientsPanel.addParameter("countries", this.escapeStrings(this.consolePanel.getFieldValue("bl.ctry_id")) );
			this.recipientsPanel.addParameter("countryRestriction", " ( tbl.ctry_id IN (${parameters['countries']})  ) ");
	 	} else {
	 		this.recipientsPanel.addParameter("countryRestriction", "0=0");
	 	}		
		
		this.recipientsPanel.refresh();
		this.recipientsPanel.show(true);
		
		// change the title of the action button
		var actionButton = this.recipientsPanel.actions.get("sendEmail");		
		var title = getMessage("buttonTitle").replace("{0}", this.recipientsPanel.rows.length);		
		actionButton.setTitle(title);		
		
		// show status for emergency contacts only
		this.recipientsPanel.gridRows.each(function(row) {
			if (row.getFieldValue("team.send_emergency") == 0) {
				row.setFieldValue("team.status", "");
			}
		});
		
	},
	
	consolePanel_onClear: function() {  
		this.consolePanel.clear();

		$('employee_checkbox1').checked = false;
		$('employee_checkbox2').checked = false;
		$('contact_checkbox1').checked = false;
		$('contact_checkbox2').checked = false;
		$('vendor_checkbox1').checked = false;
		$('vendor_checkbox2').checked = false;
		$('visitor_checkbox').checked = false;
	},
	
	recipientsPanel_onSendEmail: function() { 		
		var records =  new Array();
		var allRecords = this.recipientsPanel.gridRows.each(function(row) {			 
			var email = row.getFieldValue("team.email");
			records.push(email);			
		});
		
		var panel = View.getOpenerView().panels.get("adAdvisoryBulletinEdit_form_advisory");
		
		// get the advisory code 
		var advisoryId = panel.getFieldValue("advisory.advisory_id");
		var emailFrom = panel.getFieldValue("advisory.email_from");
		var subject = panel.getFieldValue("advisory.subject");
		var body = panel.getFieldValue("advisory.bulletin");
		
		if (emailFrom == "" || subject == "") {
			View.showMessage(getMessage("emailFieldsRequired"))
			return;
		}
		
		this.method = jQuery('input:radio[name=email_method]:checked').val();
		var sendAsIndividual = (this.method == "individual") ? 1 : 0;
		
		try {
            var result = Workflow.callMethod('AbRiskEmergencyPreparedness-EPCommonService-emailAdvisoryBulletin', records, subject, body, emailFrom, sendAsIndividual);	
            
            if (result.code == 'executed') {        
                var numberOfFailed = result.value; 
            	
                if (numberOfFailed == 0) {
                	View.showMessage(getMessage("emailSent"));
                } else {
                	View.showMessage(getMessage("emailFailed").replace("{0}", numberOfFailed));
                }	
                 
            } else {
                Workflow.handleError(result);
            }            
        
        } catch(e){
            Workflow.handleError(e);
        }        
		
	},
	
	escapeStrings: function(ids) { 
		var parts = ids.split(',');
		var result = "";
		for (var i=0; i < parts.length; i++) {			
			result += ",'" + parts[i].trim().replace("'","''") + "'";
		}		
		return result.substring(1); 
	}	
	
});