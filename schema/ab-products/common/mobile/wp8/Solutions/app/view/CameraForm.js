Ext.define('Solutions.view.CameraForm', {
    extend: 'Common.form.FormPanel',

    xtype: 'cameraform',

    config: {
        items: [
            {
              html: "Use the camera button to take a photo and attach it. Then it will be displayed in the document field."
            },
            {
                xtype : 'toolbar',
                docked: 'top',
                title: 'My Toolbar',
                items: [
                    {
                        xtype: 'camera',
                        align: 'left',
                        iconCls: 'camera',
                        ui: 'iron',
                        displayOn: 'all'
                        /**
                         * The event onAttach is handled in Solutions.controller.Documents.
                         */
                    }
                ]
            },
            {
                xtype: 'documentfield',
                name: 'doc1_contents',
                label: 'Photo'
            }
        ]
    }
});