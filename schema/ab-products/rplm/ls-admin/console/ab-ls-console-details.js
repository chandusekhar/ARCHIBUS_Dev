var abRepmAddeditLeaseDetailsController = View.createController('abRepmAddeditLeaseDetailsController', {
	
	lsId: null,
	displayMode: null,
	
	afterViewLoad: function(){
		this.abRepmLeaseDetails_tabs.addEventListener('beforeTabChange', onBeforeTabChange);
		for (var i = 0; i < this.abRepmLeaseDetails_tabs.tabs.length; i++){
			if (this.abRepmLeaseDetails_tabs.tabs[i].useFrame) {
				this.abRepmLeaseDetails_tabs.tabs[i].loadView();
			}
		}
	},
	
	loadDetailsForLease: function(lsId, displayMode){
		this.lsId = lsId;
		this.displayMode = displayMode;
		this.abRepmLeaseDetails_info.refresh(new Ab.view.Restriction({'ls.ls_id': this.lsId}));
		this.abRepmLeaseDetails_tabs.selectTab('abRepmLeaseDetails_tabContact', null, false, false, true);
		this.refreshTabs();
		this.showTabs();
	},
	
	
	refreshTabs: function(){
		for (var i = 0; i < this.abRepmLeaseDetails_tabs.tabs.length; i++){
			var tab = this.abRepmLeaseDetails_tabs.tabs[i];
			var objController = this.getTabController(tab);
			if (objController){
				objController.refreshView(this.lsId);
			}
		}
	},
	
	showTabs: function(){
		this.abRepmLeaseDetails_tabs.showTab('abRepmLeaseDetails_tabClauses', this.displayMode == 'standard');
		this.abRepmLeaseDetails_tabs.showTab('abRepmLeaseDetails_tabOptions', this.displayMode == 'standard');
		this.abRepmLeaseDetails_tabs.showTab('abRepmLeaseDetails_tabAmendments', this.displayMode == 'standard');
		this.abRepmLeaseDetails_tabs.showTab('abRepmLeaseDetails_tabComLogs', this.displayMode == 'standard');
		this.abRepmLeaseDetails_tabs.showTab('abRepmLeaseDetails_tabSuites', this.displayMode == 'standard');
		this.abRepmLeaseDetails_tabs.showTab('abRepmLeaseDetails_tabDocuments', this.displayMode == 'standard');
		
	},
	
	getTabController: function(tab){
		var controllerName = tab.name + "Controller";
		var controller = null;
		if (tab.useFrame) {
			controller = tab.getContentFrame().View.controllers.get(controllerName);
		}else{
			controller = View.controllers.get(controllerName);
		}
		return controller;
	},
	
	abRepmLeaseDetails_info_onEdit: function(){
		var controller = this;
		var blId = this.abRepmLeaseDetails_info.getFieldValue('ls.bl_id'); 
		var prId = this.abRepmLeaseDetails_info.getFieldValue('ls.pr_id');
		var itemType = 'property';
		var itemId = prId;
		var item = this.lsId;
		if (valueExistsNotEmpty(blId)) {
			itemType = 'building';
			itemId = blId;
		}
		
		
		View.openDialog('ab-rplm-editlease.axvw',null, true, {
			width:1280,
			height:700, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('editLease');
					dialogController.editLease.showField('ls.bl_id', true);
					dialogController.editLease.showField('ls.pr_id', true);
					dialogController.editLease.showField('dummy_field', true);
					dialogController.itemId = itemId;
					dialogController.itemType = itemType;
					dialogController.itemType = item;
					dialogController.editLease.refresh(new Ab.view.Restriction({'ls.ls_id': item}), false);
				},
				callback: function(res){
					View.closeDialog();
					controller.loadDetailsForLease(controller.lsId, controller.displayMode);
				}
		});
	}
});

function onBeforeTabChange(tabPanel, currentTabName, newTabName){
	if (newTabName == 'abRepmLeaseDetails_tabDocuments') {
		var controller = View.controllers.get('abRepmAddeditLeaseDetailsController');
		var tab = controller.abRepmLeaseDetails_tabs.findTab(newTabName);
		var tabController = controller.getTabController(tab);
		if (tabController) {
			tabController.refreshView(controller.lsId);
		}
	}
}

/**
 * Format form field to show currency symbol when are read only.
 * @param form
 */
function formatCurrency(form){
	var dataSource = form.getDataSource();
	var fieldValues = form.record.values;
	var record = form.record;
	dataSource.fieldDefs.each(function(fieldDef){
		var fieldName = fieldDef.fullName;
		if(valueExistsNotEmpty(fieldDef.currencyField) 
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly){
			
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			if(localizedValue){
				var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
				form.setFieldValue(fieldName, formattedValue, neutralValue, false);
			}
		}else if(valueExistsNotEmpty(fieldDef.currency)
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly ){
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			if(localizedValue){
				var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
				form.setFieldValue(fieldName, formattedValue, neutralValue, false);
			}
		}
	});
}
