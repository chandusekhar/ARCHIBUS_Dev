Ext.define('Solutions.view.phone.Main', {
    extend: 'Ext.dataview.NestedList',

    requires: ['Ext.TitleBar'],

    id: 'mainNestedList',

    config: {
        fullscreen: true,
        title: 'Solutions',
        useTitleAsBackText: false,
        layout: {
            animation: {
                duration: 250,
                easing: 'ease-in-out'
            }
        },

        onItemDisclosure: true,

        store: 'Demos',

        toolbar: {
            id: 'mainNavigationBar',
            xtype: 'titlebar',
            docked: 'top',
            title: 'Solutions',

            items: [
                {
                    xtype: 'toolbarbutton',
                    text: 'Apps',
                    cls: 'x-button-back',
                    action: 'backToAppLauncher',
                    displayOn: 'all'
                },
                {
                    xtype: 'button',
                    id: 'viewSourceButton',
                    hidden: true,
                    align: 'right',
                    ui: 'action',
                    action: 'viewSource',
                    text: 'Source'
                }]
        }
    }

});