Ext.define('Solutions.view.ViewSelectorPanel',{
    extend: 'Common.view.navigation.EditBase',

    xtype: 'viewSelectorPanel',

    config: {
        items: [
            {
                html: "Use the camera button to take a photo and attach it. This will display 1 as badge." +
                    "You can replace the photo by taking another one. Use the Documents button to display the photo."
            },
            {
                // Use of 'Common.view.navigation.ViewSelector'
                xtype: 'viewselector',
                itemId: 'documentViewSelector',

                // The views will be pushed to this NavigationView
                navigationView: 'documentsSelector',

                // True to display the view when the 'Common.control.button.ViewSelection' is tapped.
                // False to not display the view. When set to false the select event should be handled in a controller.
                displayViews: true,

                items: [
                    {
                        // Use of 'Common.control.button.ViewSelection'
                        text: 'Documents',

                        // The store that contains the records for the view to be displayed.
                        // The number of items in the store is used to update the button badge text.
                        store: 'selectorExampleStore',

                        // The xtype of view to be displayed when the button is tapped.
                        // An object can be used to specify different views for list and edit forms.
                        view: 'demoPhotoPanel',

                        // True if this button selects a document view.
                        // Documents are typically stored in the parent view record.
                        documentSelect: true
                    }
                ]
            }
        ]
    }
});