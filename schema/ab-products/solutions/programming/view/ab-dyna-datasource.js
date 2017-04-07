
var controller = View.createController('exDynaDatasource', {
    
	/**
	 * Add afterLoad event listener to the include panel.
	 */
    afterViewLoad: function() {
        this.exDynaImportPanel.addEventListener(
             'afterLoad', this.afterDataSourcesLoaded.createDelegate(this));
    },
    
    /**
     * Load the view with data sources when the user clicks on the Load Data Sources button.
     */
    exDynaTestPanel_onLoadDataSources: function() {
    	this.exDynaImportPanel.loadView('ab-datasource-labels.axvw');
    },

    /**
     * The view panel calls the afterLoad event listener after the content view has been loaded.
     */
    afterDataSourcesLoaded: function() {
    	// The content view has a separate View object nested in the child frame. 
        var contentFrame = this.exDynaImportPanel.getContentFrame();
        var contentView = contentFrame.View;
        
        // That View object has a collection of loaded data sources.
        var labelsDataSource = contentView.dataSources.get('labelNamesDs');
        
        // Test one of the loaded data sources.
        var record = labelsDataSource.getRecord();
        View.showMessage('message', toJSON(record));
    }
});
