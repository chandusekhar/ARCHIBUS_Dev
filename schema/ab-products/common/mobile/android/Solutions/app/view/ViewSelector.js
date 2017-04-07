Ext.define('Solutions.view.ViewSelector',{
    extend: 'Common.view.navigation.NavigationView',

    xtype: 'documentsSelector',

    requires: 'Common.view.navigation.ViewSelector',

    config: {
        navigationBar: {
            hideSaveButtons: true
        },

        toolBarButtons: [
            {
                xtype: 'camera',
                align: 'left',
                iconCls: 'camera',
                displayOn: 'all'
                /**
                 * The event onAttach is handled in Solutions.controller.Documents.
                 */
            }
        ],

        items: [
            {
                // View 'Solutions.view.ViewSelectorPanel' contains the viewselector control
                xtype: 'viewSelectorPanel'
            }
        ]
    }
});