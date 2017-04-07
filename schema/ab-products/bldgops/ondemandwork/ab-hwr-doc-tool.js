var hwrDocToolController = View.createController('hwrDocToolController', {

	abHwrDocToolGrid_onArchive: function(){
	  if(this.abHwrDocToolGrid.gridRows.length>0){
		  this.abHwrDocToolGrid.gridRows.each(function (row) {
			  var record = row.getRecord();
			  var wrId = record.getValue('afm_docs.pkey_value'); 
			  hwrDocToolController.archiveRequest(wrId);
	        });
		   
		   this.abHwrDocToolGrid.refresh();
	  }else{
		  View.alert('No Records');
	  }	
	   
    },
    
    archiveRequest: function(wrId){
    	try{
    		Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-archiveWorkRequestDocument','wr', parseInt(wrId));
    	} catch (e) {
    		Workflow.handleError(e);
        }
    }
});