Ext.define('Solutions.view.DrawingCapture', {
    extend: 'Ext.Panel',

    xtype: 'drawingdisplay',

    config: {
        zIndex:20,
        items: [
            {
                xtype: 'titlebar',
                title: 'Screen Capture',
                docked: 'top',
                items: [
                    {
                        xtype: 'button',
                        text: 'Cancel',
                        itemId: 'cancelBtn'
                    }
                ]
            },
            {
                xtype: 'image',
                height: '100%',
                width: '100%'
            }
        ]
    },

    setImageUrl: function(dataURI) {
        var imageContainer = this.down('image');

        imageContainer.setSrc(dataURI);
    },

    initialize: function() {
        var cancelBtn = this.down('#cancelBtn');

        cancelBtn.on('tap', this.onCancel, this);
    },

    onCancel: function() {
        this.hide();
    }

});