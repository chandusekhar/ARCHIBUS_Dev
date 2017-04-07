var ucVehicleMngmtDocsCntrl = View.createController('ucVehicleMngmtDocsCntrl', {

	additionalDocsGrid_onShowDoc: function(row){
		var keys = { 'vehicle_id':  row.record['uc_docs_extension.pkey'] };
		var doc = row.record['uc_docs_extension.doc_name'];
		var table_name = row.record['uc_docs_extension.table_name'];
		var field_name = row.record['uc_docs_extension.field'];
		View.showDocument(keys, table_name, field_name, doc );
	}

});
