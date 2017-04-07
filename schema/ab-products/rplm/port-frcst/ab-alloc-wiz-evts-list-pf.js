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
    },
    
    allocWizEvtsList_events_afterRefresh: function() {
    	if (this.allocWizEvtsList_events.restriction && this.allocWizEvtsList_events.restriction.findClause('gp.fl_id')) {
    		this.allocWizEvtsList_console.actions.get('splitFloor').show(true);
    	}
    	else this.allocWizEvtsList_console.actions.get('splitFloor').show(false);
    	    	
        var controller = this;
        this.allocWizEvtsList_events.gridRows.each(function (row) {
        	var record = row.getRecord(); 
        	var isOverAlloc = record.getValue('gp.option1');
        	
    	   	var alertIcon = row.actions.get('alertIcon');   	   	
    		if (isOverAlloc == '1') {		  
    			alertIcon.show(true);
    		}
    		else alertIcon.show(false);
        });
    },
    
    allocWizEvtsList_console_onSplitFloor: function() {
    	View.openDialog('ab-alloc-wiz-split-fl.axvw-pf', this.allocWizEvtsList_events.restriction, true, {
    		maximize:true
    	});
    },
    
    allocWizEvtsList_console_onDelete: function() {
    	var records = this.allocWizEvtsList_events.getSelectedRecords();
    	if (records.length == 0) {
    		View.showMessage(getMessage('error_no_records_selected'));
    		return;
    	}
    	var controller = this;
    	View.confirm(getMessage('confirmDelete'), function(button){
	         if (button == 'yes') {
	        	 View.openProgressBar(getMessage('deletingRecords'));
	        	 for (var i = 0; i < records.length; i++) {
	        		View.updateProgressBar(i/records.length);
	     			var record = records[i];
	     			var gp_id = record.getValue('gp.gp_id');
	     			var restriction = new Ab.view.Restriction();
	     			restriction.addClause('gp.gp_id', gp_id);
	     			var gpRecord = controller.allocWizEvtsList_ds0.getRecord(restriction);
	     			controller.allocWizEvtsList_ds0.deleteRecord(gpRecord);
	     		}
	        	View.closeProgressBar();
	     		var tabs = View.panels.get('allocWizEvtsTabs');
	     		var selectedTabName = tabs.getSelectedTabName();
	     		tabs.selectTab(selectedTabName);
	         }
		});	
    },
    
    allocWizEvtsList_events_onEdit: function(obj) {
    	var viewName = 'ab-alloc-wiz-evts-edit-pf.axvw';
    	var record = this.allocWizEvtsList_ds0.getRecord(obj.restriction);
    	var is_available = record.getValue('gp.is_available');
    	if (is_available == 0) viewName = 'ab-alloc-wiz-evts-edit-unavail-pf.axvw';
    	var ls_id = record.getValue('gp.ls_id');
    	if (ls_id != '') viewName = 'ab-alloc-wiz-evts-edit-ls-pf.axvw';
    	
    	var allocWizEvts = View.controllers.get('allocWizEvts');
		View.openDialog(viewName, obj.restriction, false, {
	    	width: 900,
	    	height: 570,
			closeButton : true,
			isNewGroup: false,
			callback: function() {
				var tabs = allocWizEvts.allocWizEvtsTabs;
				var selectedTabName = tabs.getSelectedTabName();
				tabs.selectTab(selectedTabName);
			}
		});
    },
    
    allocWizEvtsList_events_onAlertIcon: function(row, action) {
    	var gp_id = row.getRecord().getValue('gp.gp_id');
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('gp.gp_id', gp_id);
    	var gpRecord = this.allocWizEvtsList_ds0.getRecord(restriction);
    	var record = this.allocWizEvtsList_ds0.processOutboundRecord(gpRecord);
    	
    	checkOverAlloc(record);
    }
});

function onAddNewEvent() {
	var allocWizEvts = View.controllers.get('allocWizEvts');
    var restriction = View.panels.get('allocWizEvtsList_events').restriction;
    View.openDialog('ab-alloc-wiz-evts-edit-pf.axvw', restriction, true, {
    	width: 900,
    	height: 570,
		closeButton : true,
		callback: function() {
			var tabs = allocWizEvts.allocWizEvtsTabs;
			var selectedTabName = tabs.getSelectedTabName();
			tabs.selectTab(selectedTabName);
		}
	});
}

function onAddUnavail() {
	var allocWizEvts = View.controllers.get('allocWizEvts');
    var restriction = View.panels.get('allocWizEvtsList_events').restriction;
    View.openDialog('ab-alloc-wiz-evts-edit-unavail-pf.axvw', restriction, true, {
    	width: 800,
    	height: 500,
		closeButton : true,
		callback: function() {
			var tabs = allocWizEvts.allocWizEvtsTabs;
			var selectedTabName = tabs.getSelectedTabName();
			tabs.selectTab(selectedTabName);
		}
	});
}

function onAddLease() {
	var allocWizEvts = View.controllers.get('allocWizEvts');
    var restriction = View.panels.get('allocWizEvtsList_events').restriction;
    View.openDialog('ab-alloc-wiz-evts-edit-ls-pf.axvw', restriction, true, {
    	width: 800,
    	height: 500,
		closeButton : true,
		callback: function() {
			var tabs = allocWizEvts.allocWizEvtsTabs;
			var selectedTabName = tabs.getSelectedTabName();
			tabs.selectTab(selectedTabName);
		}
	});
}


