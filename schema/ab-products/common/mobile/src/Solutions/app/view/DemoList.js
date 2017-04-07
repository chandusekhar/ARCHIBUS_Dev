Ext.define('Solutions.view.DemoList', {
    extend: 'Ext.NestedList',
    xtype: 'demonestedlist',

    config: {
        toolbar: {
            ui: 'dark',
            items: [
                {
                    xtype : 'toolbarbutton',
                    text : 'Apps',
                    cls : 'x-button-back',
                    action : 'backToAppLauncher',
                    displayOn : 'all'
                }
            ]
        }
    }
});