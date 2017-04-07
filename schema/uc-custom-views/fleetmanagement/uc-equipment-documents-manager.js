function getDocuments() {
	var row = this;
	var eq_form = View.panels.get('eq_form');
	var eq_docs = View.panels.get('eq_docs');
	
	var eq_restriction = {'eq.eq_id':row['eq.eq_id']};

	var pkey = row['eq.eq_id'];
	
	var docs_restriction = new Ab.view.Restriction();
	docs_restriction.addClause('uc_docs_extension.pkey',pkey);
	docs_restriction.addClause('uc_docs_extension.table_name','eq');
	
	eq_docs.refresh(docs_restriction);
	eq_docs.show(true);
		
	eq_form.refresh(eq_restriction);
	eq_form.show(true);
}

function addNewDocument() {
	var eq_form = View.panels.get('eq_form');
	var ds_docs = View.dataSources.get('ds_docs');
		
	var record = new Ab.data.Record({
		'uc_docs_extension.pkey': eq_form.getFieldValue('eq.eq_id'),
		'uc_docs_extension.table_name': 'eq',
		'uc_docs_extension.doc_type_code': 'FLEET MGMT IMAGE',
		'uc_docs_extension.created_by': View.user.name,
		'uc_docs_extension.modified_by': View.user.name},
		true); // true means new record
	var ds_object = ds_docs.saveRecord(record);
	
	var restriction = {'uc_docs_extension.uc_docs_extension_id':ds_object.getValue('uc_docs_extension.uc_docs_extension_id')};
	View.openDialog('uc-equipment-documents-dialog.axvw', restriction, false, {
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
	View.openDialog('uc-equipment-documents-dialog.axvw', restriction, false, {
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
	var eq_form = openingView.panels.get('eq_form');
	var eq_docs = openingView.panels.get('eq_docs');
	
	var pkey = eq_form.getFieldValue('eq.eq_id');
	
	var docs_restriction = new Ab.view.Restriction();
	docs_restriction.addClause('uc_docs_extension.pkey',pkey);
	docs_restriction.addClause('uc_docs_extension.table_name','eq');
	
	eq_docs.refresh(docs_restriction);
	
	openingView.closeDialog() ;
}

function grid_onShow(row) { 
    var docId = row['uc_docs_extension.uc_docs_extension_id']; 
    var DocFileName = row['uc_docs_extension.doc_name'];
    var keys = { 'uc_docs_extension_id': docId }; 

    View.showDocument(keys, 'uc_docs_extension', 'doc_name', DocFileName); 
}

function docDialogOnLoad() { 
    var eq_doc_form = View.panels.get('eq_doc_form');
	eq_doc_form.show(true); 
}

function saveCloseDialog(){
	var eq_form = View.panels.get("eq_form");
	if(eq_form.save()){
		var openingView = View.getOpenerWindow().View;
		openingView.closeDialog() ;
	}
}
