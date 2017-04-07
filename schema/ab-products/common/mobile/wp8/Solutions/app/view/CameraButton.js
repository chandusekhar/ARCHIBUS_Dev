Ext.define('Solutions.view.CameraButton', {
    extend: 'Ext.Container',

    requires: ['Common.control.Camera'],

    config: {
        items: [
            {
                xtype : 'toolbar',
                docked: 'top',
                title: 'My Toolbar',
                items: [
                    {
                        xtype: 'camera',
                        align: 'left',
                        iconCls: 'camera',
                        displayOn: 'all'
                    }
                ]
            }
        ]
    }
});