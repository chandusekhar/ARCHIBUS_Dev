var connectorSelectController = View.createController('connectorSelectController', {
	
	connector_list_onSelect : function(row){		
	    var restConnector = new Ab.view.Restriction();
	    var restFields = new Ab.view.Restriction();
	    var restLogs = new Ab.view.Restriction();
	    var restWorkFlowRules = new Ab.view.Restriction();	    	  
	    var connector_id = row.record['afm_connector.connector_id'];
	    restConnector.addClause("afm_connector.connector_id",connector_id,'=');
	    restFields.addClause("afm_conn_flds.connector_id",connector_id,'=');
	    restLogs.addClause("afm_conn_log.connector_id",connector_id,'=');
	    restWorkFlowRules.addClause("afm_wf_rules.activity_id","AbSystemAdministration",'=');
	    restWorkFlowRules.addClause("afm_wf_rules.rule_id","scheduledConnector_" + connector_id,'=');
	   
	    
	    var tabPanel = View.getView('parent').panels.get('tabs_connector');
	    var controller = View.getView('parent').controllers.get('connectorTabsController');
	    
	    controller.connector_id = connector_id;
	    controller.activity_id = "AbSystemAdministration";
	    
	    tabPanel.findTab('page-2').restriction = restConnector;
	    tabPanel.findTab('page-3').restriction = restFields;
	    tabPanel.findTab('page-5').restriction = restLogs;
	    tabPanel.findTab('page-6').restriction = restWorkFlowRules;
	   
	    tabPanel.selectTab('page-2', restConnector, false, false, false);
		
	},
	connector_list_onAddNew : function(){
		var controller = View.getView('parent').controllers.get('connectorTabsController');
		controller.connector_id = null;
	    controller.activity_id = "AbSystemAdministration";
		var tabPanel = View.getView('parent').panels.get('tabs_connector');		
		 
	    tabPanel.findTab('page-3').restriction = "1=2";
	    tabPanel.findTab('page-5').restriction = "1=2";
	    tabPanel.findTab('page-6').restriction = "1=2";
	    
	    tabPanel.selectTab('page-2', "", true, false, false);
	}
	
	
});



