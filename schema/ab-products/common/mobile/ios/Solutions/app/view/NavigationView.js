Ext.define('Solutions.view.NavigationView', {
    extend: 'Common.view.navigation.NavigationView',

    xtype: 'navigationView',

    config: {

        navigationBar: {
            // showSaveButton indicates if the Save or Add (+) button should be displayed.
            // The Save button is displayed when true. The Add button is displayed when false.
            // Both buttons are hidden when the value is null.
            showSaveButton: null
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: 'Apps',
                ui: 'iron',
                cls: 'x-button-back',

                // Added controller 'Common.controller.AppHomeController' in app.js file
                // in order to use the common functionality for navigating back to the Applications screen.
                action: 'backToAppLauncher',

                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                text: 'Other Button',
                ui: 'iron',
                action: 'otherButtonAction',
                displayOn: 'all'
            }
        ]
    }
});