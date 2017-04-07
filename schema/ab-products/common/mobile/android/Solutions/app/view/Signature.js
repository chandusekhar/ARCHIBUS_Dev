Ext.define('Solutions.view.Signature', {
    extend: 'Ext.Container',

    requires: [
        'Common.control.Signature'
    ],

    mixins: ['Common.scripts.loader.Loader'],

    xtype: 'signatureview',

    config: {
        scrollable: {
            direction: 'vertical'
        },
        items: [
            {
                xtype: 'signature'
            },
            {
                xtype: 'container',
                padding: Ext.os.is.Phone ? '30px 0px 10px 0px' : '30px',
                layout: {
                    type: 'hbox',
                    pack: 'center',
                    align: 'center'
                },
                items: {
                    xtype: 'button',
                    text: 'Load Signature Image',
                    itemId: 'loadSignatureButton',
                    minWidth: '280px',
                    ui: 'action'
                }
            },
            {
                xtype: 'fieldset',
                title: 'Signature Image',
                items: [
                    {
                        xtype: 'container',
                        height: '200px',
                        itemId: 'imageContainer',
                        style: 'border:2px solid black;margin:4px'
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this,
            signaturePanel = me.down('signature'),
            loadSignatureButton = me.down('#loadSignatureButton');

        signaturePanel.on({
            capturedone: 'onDoneCapture',
            captureclear: 'onClearCapture',
            begincapture: 'onBeginCapture',
            endcapture: 'onEndCapture',
            scope: me
        });

        loadSignatureButton.on('tap', 'onLoadSignature', me);
    },

    updateImageContainer: function () {
        var me = this,
            dataURL = me.down('signature').getDataURL(),
            imageContainer = me.down('#imageContainer'),
            style = imageContainer.element.dom.style;

        // Display the image.
        if (dataURL && dataURL.length > 0) {
            //image.setSrc(dataURL);
            style.backgroundImage = 'url(' + dataURL + ')';
            style.backgroundSize = 'contain';
            style.backgroundPosition = 'center center';
            style.backgroundRepeat = 'no-repeat';
        }
    },

    onDoneCapture: function () {
        var me = this;

        me.updateImageContainer();
    },

    onClearCapture: function () {
        //alert('clear');
    },

    onLoadSignature: function () {
        var me = this,
            signatureComponent = me.down('signature');

        me.retrieveScript('signature_data.json', function (data) {
            var signatureObject = Ext.JSON.decode(data);
            signatureComponent.setDataURL(signatureObject.data);
        }, me);
    },

    onBeginCapture: function () {
        this.setScrollable(false);
    },

    onEndCapture: function () {
        this.setScrollable(true);
    }
});