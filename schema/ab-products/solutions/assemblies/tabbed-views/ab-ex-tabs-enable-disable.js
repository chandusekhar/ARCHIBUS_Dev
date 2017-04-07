
var dataController = View.createController('data', {

    /**
     * The afterInitialDataFetch() function, if defined, is called after the view is loaded 
     * and the initial data fetch is complete for all panels.
     */
    afterInitialDataFetch: function() {
        // add beforeTabChange event listener
        this.exTabsEnableDisable_tabs.addEventListener('beforeTabChange', this.exTabsEnableDisable_tabs_beforeTabChange.createDelegate(this));
        this.exTabsEnableDisable_tabs.addEventListener('afterTabChange', this.exTabsEnableDisable_tabs_afterTabChange.createDelegate(this));
        
        // disable tab initially
    	this.exTabsEnableDisable_tabs.disableTab('exTabsEnableDisable_page2');	
    },
    
    /**
     * Custom tabs event listener function that will be called by the tabs
     * when the user clicks on any tab page, but before the tab page is actually selected.
     * If the function returns false, the tab page will not be selected.
     */
    exTabsEnableDisable_tabs_beforeTabChange: function(tabPanel, selectedTabName, newTabName) {
		View.log(String.format('beforeTabChange: tab panel [{0}], selected tab [{1}], new tab [{2}]', tabPanel.id, selectedTabName, newTabName),
		    'info', 'tab-example');
		
        // by default it's OK to select another tab page
        var result = true;
        
        // if the user has changed any form field values, ask to confirm
        if (afm_form_values_changed) {
            var message = getMessage('confirm');
            result = confirm(message);
            
            if (result) {
                afm_form_values_changed = false;
            }
        }
        
        return result;
    },

    /**
     * Custom tabs event listener function that will be called by the tabs
     * after an tab page is selected.
     */
    exTabsEnableDisable_tabs_afterTabChange: function(tabPanel, newTabName) {
        View.log(String.format('afterTabChange: tab panel [{0}], selected tab [{1}]', tabPanel.id, newTabName), 
		    'info', 'tab-example');
    },

    exTabsEnableDisable_project_onEnable: function() {
        this.exTabsEnableDisable_tabs.enableTab('exTabsEnableDisable_page2');
    },

    exTabsEnableDisable_project_onDisable: function() {
        this.exTabsEnableDisable_tabs.disableTab('exTabsEnableDisable_page2');
    },

    exTabsEnableDisable_project_onShow: function() {
        this.exTabsEnableDisable_tabs.showTab('exTabsEnableDisable_page2');
    },

    exTabsEnableDisable_project_onHide: function() {
        this.exTabsEnableDisable_tabs.hideTab('exTabsEnableDisable_page2');
    }
});