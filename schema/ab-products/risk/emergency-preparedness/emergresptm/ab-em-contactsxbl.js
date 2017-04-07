/**
 * @author Kevenxi
 */
View.createController('abEmContactsxblController', {
	
	afterViewLoad: function() {
		 Workflow.callMethod('AbRiskEmergencyPreparedness-EPCommonService-updateEmergencyContacts');
	},
	
	abEmContacts_report_team_afterRefresh: function() {
		var contact_code = this.abEmContacts_report_team.getFieldValue("team.contact_code");
        if (contact_code!='') {            
            var source = this.abEmContacts_report_team.getFieldValue("team.source_table");
            if (source == 'contact') {
                var contact_type = this.abEmContacts_report_team.getRecord().getLocalizedValue('contact.contact_type');
                $('abEmContacts_report_team_team.contact_type_archive').innerHTML = contact_type; 
            } else if (source == 'vn') {
                var contact_type = this.abEmContacts_report_team.getRecord().getLocalizedValue('vn.vendor_type');
                $('abEmContacts_report_team_team.contact_type_archive').innerHTML = contact_type; 
            }
        }
	},
    
	/**
	 * generate paginated report for user selection
	 */
	abEmContactsxbl_grid_bl_onPaginatedReport: function(){
		View.openPaginatedReportDialog('ab-em-contactsxbl-pgrp.axvw');
	},
    
	abEmContacts_report_team_onPaginatedReport: function(){
		var contactid = this.abEmContacts_report_team.getFieldValue("team.autonumbered_id");
        var restriction = new Ab.view.Restriction();
        restriction.addClause("team.autonumbered_id",contactid,"=");
        View.openPaginatedReportDialog('ab-em-contacts-pgrp.axvw', {'ds_ab-em-teams_grid_team':restriction}, null);
	}

});

function onClickBuilding(){
    var blGrid = View.panels.get("abEmContactsxbl_grid_bl");
    var selectedRow = blGrid.rows[blGrid.selectedRowIndex];
    var bl_id = selectedRow["bl.bl_id"];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("team.bl_id", bl_id, "=");
	
	var contactGrid = View.panels.get("abEmContactsxbl_report_contact");
    contactGrid.refresh(restriction);
    contactGrid.setTitle(getMessage("titleContactDetails").replace("{0}", bl_id));
}
