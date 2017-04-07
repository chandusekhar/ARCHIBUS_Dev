var allocWizEvtsListController = View.createController('allocWizEvtsList',{
	scn_id: '',
	
    afterInitialDataFetch: function(){
    	this.allocWizEvtsList_events.setCategoryColors({'default': '#6600CC'});
		this.allocWizEvtsList_events.setCategoryConfiguration({
    		fieldName: 'gp.name',
    		getStyleForCategory: this.getStyleForCategory
    	});
    	this.allocWizEvtsList_events.update();
    },
	
	getStyleForCategory: function(record) {
    	var style = {};
    	var name = record.getValue('gp.name');
    	var targetPanel = View.panels.get('allocWizEvtsList_events');
    	style.color = targetPanel.getCategoryColors()['default']; 
    	return style;
    },
    
    allocWizEvtsList_console_afterRefresh: function() {
    	this.scn_id = View.getOpenerView().controllers.get('allocWiz').scn_id;
    	
    	var allocWizEvts = View.controllers.get('allocWizEvts');
    	allocWizEvts.refreshSelectionTree();
    },
    
    allocWizEvtsList_events_beforeRefresh: function() {
    	this.allocWizEvtsList_events.setCategoryOrder([]);
    	this.allocWizEvtsList_events.setOrderAndStyle();
    }      
});

