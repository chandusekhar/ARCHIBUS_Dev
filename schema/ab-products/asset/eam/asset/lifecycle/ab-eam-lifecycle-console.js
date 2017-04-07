var abEamAssetConsoleController = View.createController('abEamAssetConsoleController', {

	queryParameterNames: ['bl_id', 'pr_id', 'project_id', 'eq_id'],
	queryParameters: null,
	isDemoMode: false,
	
	
	filterRestriction: null,
	
	afterViewLoad: function() {
        this.isDemoMode = isInDemoMode();
        this.queryParameters =  readQueryParameters(this.queryParameterNames);
		
	},
	
	afterInitialDataFetch: function(){
		this.abEamAssetLifecycleConsoleTabs.addEventListener('afterTabChange', afterTabChangeHandler);
		
		// select "Asset Lifecycle Management" tab when is opened from SFA console
		if (!isEmptyObject(this.queryParameters)) {
			this.abEamAssetLifecycleConsoleTabs.selectTab('abEamAssetLifecycleConsoleTabs_management');
		}
	},

	abEamAssetLifecycleConsoleTabs_afterTabChange: function(tabsPanel, selectedTabName){
//		if (selectedTabName == 'abEamAssetLifecycleConsoleTabs_registry') {
//			View.controllers.get('abEamAssetRegistryController').initializeFilterConfig();
//		} else if (selectedTabName == 'abEamAssetLifecycleConsoleTabs_management') {
//			View.controllers.get('abEamAssetManagementController').initializeFilterConfig();
//		} else if (selectedTabName == 'abEamAssetLifecycleConsoleTabs_optimization') {
//			View.controllers.get('abEamAssetOptimizationController').initializeFilterConfig();
//		} else if (selectedTabName == 'abEamAssetLifecycleConsoleTabs_eqSystems') {
//			//View.controllers.get('');
//		}
	}
});

function afterTabChangeHandler(tabsPanel, selectedTabName){
	var controller = View.controllers.get('abEamAssetConsoleController');
	controller.abEamAssetLifecycleConsoleTabs_afterTabChange(tabsPanel, selectedTabName);
}