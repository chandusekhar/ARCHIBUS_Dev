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
		BRG.UI.addNameField('wr_requestor_info', this.wr_form, 'wr.requestor', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.requestor'}, emNameLabelConfig);
		this.wr_form.setFieldValue('wr.dv_id', wr_create_details.getFieldValue('activity_log.dv_id'));
		this.wr_form.setFieldValue('wr.dp_id', wr_create_details.getFieldValue('activity_log.dp_id'));
		this.wr_form.setFieldValue('wr.driver', wr_create_details.getFieldValue('activity_log.driver'));
		BRG.UI.addNameField('wr_driver_info', this.wr_form, 'wr.driver', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.driver'}, emNameLabelConfig);
		this.wr_form.setFieldValue('wr.prob_type', wr_create_details.getFieldValue('activity_log.prob_type'));
		this.wr_form.setFieldValue('wr.vehicle_type_req', wr_create_details.getFieldValue('activity_log.vehicle_type_req'));
		this.wr_form.setFieldValue('wr.destination_type', wr_create_details.getFieldValue('activity_log.destination_type'));
		this.wr_form.setFieldValue('wr.destination', wr_create_details.getFieldValue('activity_log.destination'));
		this.wr_form.setFieldValue('wr.duration_est_baseline', wr_create_details.getFieldValue('activity_log.duration_est_baseline'));
		this.wr_form.setFieldValue('wr.passenger_count', wr_create_details.getFieldValue('activity_log.passenger_count'));
		this.wr_form.setFieldValue('wr.distance_est', wr_create_details.getFieldValue('activity_log.distance_est'));
		this.wr_form.setFieldValue('wr.date_pickup', wr_create_details.getFieldValue('wr.date_pickup'));
		this.wr_form.setFieldValue('wr.time_pickup', wr_create_details.getFieldValue('wr.time_pickup'));
		//this.wr_form.setFieldValue('wr.time_pickup', formatTime(wr_create_details.getFieldValue('activity_log.time_required')));
		this.wr_form.setFieldValue('wr.date_dropoff', wr_create_details.getFieldValue('wr.date_dropoff'));
		this.wr_form.setFieldValue('wr.time_dropoff', wr_create_details.getFieldValue('wr.time_dropoff'));
		this.wr_form.setFieldValue('wr.budget_owner', wr_create_details.getFieldValue('activity_log.budget_owner'));
		this.wr_form.setFieldValue('wr.description', wr_create_details.getFieldValue('activity_log.description'));

		this.wr_form.save();
	}
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




