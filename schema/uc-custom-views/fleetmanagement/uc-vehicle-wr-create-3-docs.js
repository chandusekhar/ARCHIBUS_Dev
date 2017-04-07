var emNameLabelConfig = {lengthLimit : 150, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0} {1}<br/>{2}<br/>{3}",
        textColor : "#000000", defaultValue : "", raw : false };
//var vehicleIdLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}",
//        textColor : "#000000", defaultValue : "", raw : false };
		
var docsTabController = View.createController('docsTabController', {
	afterViewLoad: function() {
		docCntrl.docTable='wr';
		docCntrl.docTitle = "Work Request";
		//docCntrl.docPkeyLabel = ["wr","Work Request"];
		//defaults
		
		docCntrl.docShowTable = false ;
	},
	wr_form_afterRefresh: function() {
		BRG.UI.addNameField('wr_driver_info', this.wr_form, 'wr.driver', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.driver'}, emNameLabelConfig);
//		BRG.UI.addNameField('wr_vehicle_info', this.wr_form, 'wr.eq_id', 'vehicle', ['vehicle_id'], {'vehicle.eq_id' : 'wr.eq_id'}, vehicleIdLabelConfig);
	},

	// ***************************************************************************
	// Fills the information on the details with information from the Info Tab.
	// ***************************************************************************
	prefillDocsInfo: function() {
		// Pre-fill fields with em information.

		// Cannot use the "user" object because the request may be completed
		// for someone else.
		// Get the information from the "wr_create_details" in the prev tab.
		var wr_create_details = View.getControl('','wr_create_details');

		this.wr_form.setFieldValue('wr.requestor', wr_create_details.getFieldValue('activity_log.requestor'));
		this.wr_form.setFieldValue('wr.dv_id', wr_create_details.getFieldValue('activity_log.dv_id'));
		this.wr_form.setFieldValue('wr.dp_id', wr_create_details.getFieldValue('activity_log.dp_id'));
		this.wr_form.setFieldValue('wr.budget_owner', wr_create_details.getFieldValue('activity_log.budget_owner'));
		this.wr_form.setFieldValue('wr.driver', wr_create_details.getFieldValue('activity_log.driver'));
		BRG.UI.addNameField('wr_driver_info', this.wr_form, 'wr.driver', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.driver'}, emNameLabelConfig);
//		BRG.UI.addNameField('wr_vehicle_info', this.wr_form, 'wr.eq_id', 'vehicle', ['vehicle_id'], {'vehicle.eq_id' : 'wr.eq_id'}, vehicleIdLabelConfig);
		this.wr_form.setFieldValue('wr.status', wr_create_details.getFieldValue('activity_log.status'));
		this.wr_form.setFieldValue('wr.prob_type', wr_create_details.getFieldValue('activity_log.prob_type'));
		this.wr_form.setFieldValue('wr.cause_type', wr_create_details.getFieldValue('activity_log.cause_type'));
		this.wr_form.setFieldValue('wr.location', wr_create_details.getFieldValue('activity_log.location'));
		this.wr_form.setFieldValue('wr.tr_id', wr_create_details.getFieldValue('activity_log.tr_id'));
		this.wr_form.setFieldValue('wr.towing', wr_create_details.getFieldValue('activity_log.towing'));
		this.wr_form.setFieldValue('wr.description', wr_create_details.getFieldValue('activity_log.description'));
		this.wr_form.setFieldValue('wr.eq_id', wr_create_details.getFieldValue('activity_log.eq_id'));
		this.wr_form.setFieldValue('vehicle_id', wr_create_details.getFieldValue('vehicle_id'));
		this.wr_form.setFieldValue('wr.status', 'I');
		this.wr_form.save();
	},
	wr_form_onSubmit: function() {
	
	//tabsPanel.refreshTab('create_wr_report');
	this.doc_gridReport.refresh()
	var tabsPanel = View.getControl('', 'wr_create_tabs');
	tabsPanel.selectTab('create_wr_report');
	
	//sendRequestorEmail();
	/*var wr_form = View.panels.get("wr_form");
	
	var pkey = wr_form.getFieldValue('wr.wr_id');
	
	
	if(wr_form.save()){
		docCntrl.docAdd = false;
		docCntrl.docEdit=false;
		
		var rest = {'wr.wr_id':wr_form.getFieldValue('wr.wr_id')};
		var tabsPanel = View.getControl('', 'wr_create_tabs');
		tabsPanel.setTabRestriction('create_wr_report',rest);
		tabsPanel.refreshTab('create_wr_report');
		tabsPanel.selectTab('create_wr_report');
		//rest = "uc_docs_extension.table_name='wr' and uc_docs_extension.pkey='" + docCntrl.docPkey+ "'"
		//this.doc_grid.refresh(rest)
	}
	*/
}
});




