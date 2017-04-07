function saveDocsForm() {
	var activity_log_form = View.panels.get("activity_log_form");
	if(activity_log_form.save()){
		var openingView = View.getOpenerWindow().View;
		openingView.closeDialog() ;
	}
}

function addNewDocument() {
	var activity_log_form = View.panels.get('activity_log_form');
	var ds_docs = View.dataSources.get('ds_docs');
		
	var record = new Ab.data.Record({
		'uc_docs_extension.pkey': activity_log_form.getFieldValue('activity_log.activity_log_id'),
		'uc_docs_extension.table_name': 'activity_log',
		'uc_docs_extension.created_by': View.user.name,
		'uc_docs_extension.modified_by': View.user.name},
		true); // true means new record
	var ds_object = ds_docs.saveRecord(record);
	
	var restriction = {'uc_docs_extension.uc_docs_extension_id':ds_object.getValue('uc_docs_extension.uc_docs_extension_id')};
	View.openDialog('uc-activity-documents-dialog.axvw', restriction, false, {
		width: 600, 
		height: 400, 
		closeButton: false,
		maximize: false 
	});
}

function editDocument() {
	var row = this;
	var uc_docs_extension_id = row['uc_docs_extension.uc_docs_extension_id'];
	
	var restriction = {'uc_docs_extension.uc_docs_extension_id':uc_docs_extension_id};
	View.openDialog('uc-activity-documents-dialog.axvw', restriction, false, {
		width: 600, 
		height: 400, 
		closeButton: false,
		maximize: false 
	});
}

/**
 * Close the dialog now
 */
function closeDialog() {
	var openingView = View.getOpenerWindow().View;
	var activity_log_form = openingView.panels.get('activity_log_form');
	var pkey = activity_log_form.getFieldValue('activity_log.activity_log_id');
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('uc_docs_extension.pkey',pkey);
	restriction.addClause('uc_docs_extension.table_name','activity_log');

	var activity_log_docs = openingView.panels.get('activity_log_docs');

	activity_log_docs.refresh(restriction);
	activity_log_docs.show(true);

	openingView.closeDialog();
}

function grid_onShow(row) { 
    var docId = row['uc_docs_extension.uc_docs_extension_id']; 
    var DocFileName = row['uc_docs_extension.doc_name'];
    var keys = { 'uc_docs_extension_id': docId }; 

    View.showDocument(keys, 'uc_docs_extension', 'doc_name', DocFileName); 
}

function docDialogOnLoad() { 
    var activity_log_doc_form = View.panels.get('activity_log_doc_form');
	activity_log_doc_form.show(true); 
}
