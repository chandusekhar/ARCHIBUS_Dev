// CHANGE LOG:
// 2016/03/17  -  MSHUSSAI - Created new JS file to implement CCC Dispatch Manager Screen

var ucWrhwrExec =  View.createController("ucWrDispatch",{
	afterViewLoad: function() {
		this.inherit();
		
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
	},
	
	afterInitialDataFetch: function(){
		this.inherit();
	},
	
	wrDispatchPanel_onSelDispatcher: function() {
		var selectedRecords = this.wrDispatchPanel.getSelectedRecords();
		if (selectedRecords.length == 0) {
			View.showMessage("No records selected.");
			return;
		}

		this.dispatcherFormPanel.show(true, false);
		this.dispatcherFormPanel.showInWindow({
			x: 850,
			y:400,		
			width: 325,
			height: 130,
			newRecord: true
        });
	},
	
	dispatcherFormPanel_onSubmit: function() {
	
		var wrDispatchPanel = View.panels.get("wrDispatchPanel");
		var dataSource = View.dataSources.get("dispatcher_add_ds11");		
		var selectedRecords = wrDispatchPanel.getSelectedRecords();
		
		var CCCUser = this.dispatcherFormPanel.getFieldValue('wr.dispatcher');
		
		if(CCCUser == ""){
			View.showMessage("Please Select a User to Dispatch");
		}
		else{
			View.openProgressBar("Dispatching Request(s) to "+CCCUser+". Please wait...");
			
			try {
				
				for (var i = 0; i < selectedRecords.length; i++) {
					
					var wr_id = selectedRecords[i].getValue("wr.wr_id");
					
					var updateRecord = new Ab.data.Record();
					
					updateRecord.isNew = false;
					updateRecord.setValue('wr.wr_id',wr_id);
					updateRecord.setValue('wr.dispatcher',CCCUser);
					
					updateRecord.oldValues = {};
					updateRecord.oldValues["wr.wr_id"]  = wr_id;

					dataSource.saveRecord(updateRecord);
				}
			}
			catch (e) {
				Workflow.handleError(e);
			}
			
			this.wrDispatchPanel.refresh();		
			View.closeProgressBar();

			this.dispatcherFormPanel.closeWindow();
			
			View.showMessage(i + " Work Request(s) have been dispatched to: " + CCCUser);
		}
	},
	
	wrDispatchPanel_onFieldWorkComplete: function() {
		
		this.wrDispatchPanel.refresh();
	
	}

});

function apply_console_restriction() {
    
}