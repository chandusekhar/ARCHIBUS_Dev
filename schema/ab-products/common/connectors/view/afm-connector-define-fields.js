var connectorController = View.createController('connectorController', {
	// KB 3045192 - Clear the content of "Edit Connector Fields" form when the Fields tab is changed	
	connector_flds_list_afterRefresh: function() {
		this.connector_flds.show(false);
	},
	
	connector_flds_list_onAddNew : function(){

		var controller = View.getView('parent').controllers.get('connectorTabsController');		
		//this.connector_flds.newRecord(true);
		//this.connector_flds.show(true);
		
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_conn_flds.connector_id', controller.connector_id);
		this.connector_flds.newRecord = true;
		this.connector_flds.refresh(restriction);	
		
		
		///this.connector_flds.setFieldValue("afm_conn_flds.connector_id", controller.connector_id)
		
	}
		
			
});

