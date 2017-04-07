Ext.define('Solutions.view.tablet.Main', {
    extend: 'Ext.Container',
    xtype: 'main',

    config: {
        fullscreen: true,

        layout: {
            type: 'card',
            animation: {
                type: 'slide',
                direction: 'left',
                duration: 250
            }
        },

        items: [
            {
                xtype: 'demo'
            },
            {
                id: 'mainNestedList',
                xtype: 'demonestedlist',
                width: 250,
                docked: 'left',
                store: 'Demos',
                style: 'border-right:1px solid black'
            },
            {
                xtype: 'titlebar',
                title:'Solutions Template',
                docked: 'top',
                items: [
                    {
                        xtype: 'button',
                        text: 'Source',
                        action: 'viewSource',
                        align: 'right',
                        ui: 'action',
                        hidden: true
                    }
                ]
            }
        ]
    }
});