var billDocumentsController = View.createController('billDocuments', {
   panel_bill_archive_popup_onView: function(row){
		    var record = row.getRecord();
		    var billId = record.getValue('bill_archive.bill_id');
		    var vnId = record.getValue('bill_archive.vn_id');
		    var billDocFileName = record.getValue('bill_archive.doc');
    		    var keys = {'bill_id': billId, 'vn_id': vnId}; 
		View.showDocument(keys, 'bill_archive', 'doc', billDocFileName); 
     },
   panel_billArchiveData_onView: function(row){
		    var record = row.getRecord();
		    var billId = record.getValue('bill_archive.bill_id');
		    var vnId = record.getValue('bill_archive.vn_id');
		    var billDocFileName = record.getValue('bill_archive.doc');
    		    var keys = {'bill_id': billId, 'vn_id': vnId}; 
		View.showDocument(keys, 'bill_archive', 'doc', billDocFileName); 
     },
   panel_totalCostTypeData_onViewCostTypeData: function(row){
		    var record = row.getRecord();
		    var billId = record.getValue('bill_archive.bill_id');
		    var vnId = record.getValue('bill_archive.vn_id');
		    var billDocFileName = record.getValue('bill_archive.doc');
    		    var keys = {'bill_id': billId, 'vn_id': vnId}; 
		View.showDocument(keys, 'bill_archive', 'doc', billDocFileName); 
     },
   panel_totalCostConsumpData_onViewCostConsumpData: function(row){
		    var record = row.getRecord();
		    var billId = record.getValue('bill_archive.bill_id');
		    var vnId = record.getValue('bill_archive.vn_id');
		    var billDocFileName = record.getValue('bill_archive.doc');
    		    var keys = {'bill_id': billId, 'vn_id': vnId}; 
		View.showDocument(keys, 'bill_archive', 'doc', billDocFileName); 
     },	 
   panel_elecCostRateData_onViewElecRateData: function(row){
		    var record = row.getRecord();
		    var billId = record.getValue('bill_archive.bill_id');
		    var vnId = record.getValue('bill_archive.vn_id');
		    var billDocFileName = record.getValue('bill_archive.doc');
    		    var keys = {'bill_id': billId, 'vn_id': vnId}; 
		View.showDocument(keys, 'bill_archive', 'doc', billDocFileName); 
     },     
   panel_gasCostRateData_onViewGasRateData: function(row){
		    var record = row.getRecord();
		    var billId = record.getValue('bill_archive.bill_id');
		    var vnId = record.getValue('bill_archive.vn_id');
		    var billDocFileName = record.getValue('bill_archive.doc');
    		    var keys = {'bill_id': billId, 'vn_id': vnId}; 
		View.showDocument(keys, 'bill_archive', 'doc', billDocFileName); 
     },      
   panel_elecLoadFactorData_onViewElecLoadFactor: function(row){
		    var record = row.getRecord();
		    var billId = record.getValue('bill_archive.bill_id');
		    var vnId = record.getValue('bill_archive.vn_id');
		    var billDocFileName = record.getValue('bill_archive.doc');
    		    var keys = {'bill_id': billId, 'vn_id': vnId}; 
		View.showDocument(keys, 'bill_archive', 'doc', billDocFileName); 
     },
   billsGrid_onView: function(row){
		    var record = row.getRecord();
		    var billId = record.getValue('bill_archive.bill_id');
		    var vnId = record.getValue('bill_archive.vn_id');
		    var billDocFileName = record.getValue('bill_archive.doc');
    		    var keys = {'bill_id': billId, 'vn_id': vnId}; 
		View.showDocument(keys, 'bill_archive', 'doc', billDocFileName); 
     }     
})