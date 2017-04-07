var projMngDashDocsController = View.createController('projMngDashDocs',{	
	projMngDashDocsGrid_afterRefresh: function() {
		
	},
	
	projMngDashDocsGrid_onSelectDoc: function(obj) {
	    var record = this.projMngDashDocsDs1.getRecord(obj.restriction);
	    var actionId = record.getValue('activity_log.activity_log_id');
	    var actionDocFileName = record.getValue('activity_log.doc');
	    var keys = {'activity_log_id': actionId}; 
		View.showDocument(keys, 'activity_log', 'doc', actionDocFileName); 
	}

});

