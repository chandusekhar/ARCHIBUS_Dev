var emNameLabelConfig = {lengthLimit : 150, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0} {1}<br/>{2}<br/>{3}",
        textColor : "#000000", defaultValue : "", raw : false };
//var vehicleIdLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}",
 //       textColor : "#000000", defaultValue : "", raw : false };

		
var reportTabController = View.createController('reportTabController', {

	wr_create_report_afterRefresh: function() {
		BRG.UI.addNameField('report_driver_info', this.wr_create_report, 'wr.driver', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.driver'}, emNameLabelConfig);
//		BRG.UI.addNameField('report_vehicle_info', this.wr_create_report, 'wr.eq_id', 'vehicle', ['vehicle_id'], {'vehicle.eq_id' : 'wr.eq_id'}, vehicleIdLabelConfig);
	}
})
	
function createNewRequest()
{
// clear/reload the create tabs and change to the "My Information" tab
			
	View.getControl('', 'my_info_form').refresh();
	View.getControl('', 'wr_create_details').refresh();
	View.panels.get('wr_create_tabs').selectTab('create_wr_info');
}
doc_gridReport_onShowDoc: function(row){

	var keys = { 'uc_docs_extension_id':  row.record['uc_docs_extension.uc_docs_extension_id'] }; 
	var doc = row.record['uc_docs_extension.doc_name']
    View.showDocument(keys, 'uc_docs_extension', 'doc_name',doc ); 
}