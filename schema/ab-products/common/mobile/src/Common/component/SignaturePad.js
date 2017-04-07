/**
 * A component used to capture user signatures as images. The component is used by the
 * {@link Common.control.Signature} control.
 *
 * This component uses the signature_pad library https://github.com/szimek/signature_pad
 * The signature_pad.js library is loaded dynamically using the Common.scripts.loader.SignatureCapture
 * class
 *
 * @author Jeff Martin
 * @since 23.1
 */
Ext.define('Common.component.SignaturePad', {
    extend: 'Ext.Component',

    requires: 'Common.scripts.loader.SignatureCapture',

    xtype: 'signaturepad',

    /**
     * @property {String} tmpImageData Stores a temporary copy of the signature data. Used to restore the
     * signature data when the device orientation is changed.
     */
    tmpImageData: null,

    config: {
        /**
         * @cfg {SignaturePad} A reference to the signature pad library object
         */
        signaturePad: null,

        /**
         * @cfg {String} dataURL The signature data encoded as a dataURL
         */
        dataURL: null,

        /**
         * @cfg {String/Number} height The height of the signature pad component. This value does not
         * need to be changed in most cases
         */
        height: '100%',

        /**
         * @cfg {String/Number} width The height of the signature pad component. This value does not
         * need to be changed in most cases
         */
        width: '100%',

        /**
         * @cfg {Boolean} readOnly Sets the component to read only mode when true.
         */
        readOnly: false
    },

    template: [
        {
            tag: 'div',
            reference: 'container',
            cls: 'ab-signature',
            children: [
                {
                    tag: 'canvas',
                    reference: 'canvas',
                    cls: 'ab-signature-canvas'

                }
            ]
        }
    ],

    initialize: function () {
        // Wire up the signature library
        var me = this,
            readOnly = me.getReadOnly();

        var signaturePad = new SignaturePad(me.canvas.dom, {
            onBegin: me.beginCapture.bind(me),
            onEnd: me.endCapture.bind(me)
        });

        me.setSignaturePad(signaturePad);

        // Update readOnly configuration after the signaturePad is created.
        me.applyReadOnly(readOnly);

    },

    applyReadOnly: function (config) {
        var me = this,
            signaturePad = me.getSignaturePad();

        if (signaturePad) {
            if (config) {
                signaturePad.off();
            } else {
                signaturePad.on();
            }
        }

        return config;
    },

    clear: function () {
        var me = this,
            signaturePad = me.getSignaturePad();

        me.tmpImageData = null;
        if (signaturePad) {
            signaturePad.clear();
        }
    },

    capture: function () {
        var me = this,
            signaturePad = me.getSignaturePad(),
            dataURL;

        if (signaturePad) {
            if (!signaturePad.isEmpty()) {
                me.tmpImageData = null;
                dataURL = signaturePad.toDataURL();
                me._dataURL = dataURL;
            }
        }
    },

    loadImage: function (dataURL) {
        var me = this,
            signaturePad = me.getSignaturePad(),
            tmpImage,
            ctx;

         if(signaturePad) {
            me.clear();
            tmpImage = new Image();

            tmpImage.onload = function () {
                ctx = me.canvas.dom.getContext('2d');
                me.drawImageScaled(tmpImage, ctx);
                signaturePad._isEmpty = false;
            };

            tmpImage.src = dataURL;
        }
    },

    isEmpty: function () {
        var me = this,
            signaturePad = me.getSignaturePad();

        if (signaturePad) {
            return signaturePad.isEmpty();
        } else {
            return true;
        }

    },

    syncSize: function (height, width) {
        var me = this,
            signaturePad = me.getSignaturePad(),
            isEmpty = signaturePad.isEmpty(),
            oldWidth = me.canvas.dom.width;

        if (isEmpty) {
            me.canvas.dom.height = height;
            me.canvas.dom.width = width;
        } else {
            // Scale the canvas image before saving
            if (width < oldWidth) {
                me.scaleImage(height, width);
            } else {
                // Redraw without scaling
                me.drawImage(height, width);
            }
        }
    },

    /**
     * Sets the size of the canvas element and draws the image in the
     * canvas element without scaling the image
     * @private
     * @param {Number} height The height of the canvas element
     * @param {Number} width The width of the canvas element
     */
    drawImage: function (height, width) {
        var me = this,
            imageData = me.canvas.dom.toDataURL(),
            canvas = me.canvas.dom,
            ctx;

        var tmpImage = new Image();

        tmpImage.onload = function () {
            ctx = me.canvas.dom.getContext('2d');
            me.canvas.dom.height = height;
            me.canvas.dom.width = width;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tmpImage, 0, 0);
        };

        if (Ext.isEmpty(me.tmpImageData)) {
            tmpImage.src = imageData;
        } else {
            tmpImage.src = me.tmpImageData;
        }

    },

    /**
     * Sets the size of the canvas element and scales the current image to fit
     * in the new canvas element
     * @private
     * @param {Number} height The height of the canvas element
     * @param {Number} width The width of the canvas element
     */
    scaleImage: function (height, width) {
        var me = this,
            imageData = me.canvas.dom.toDataURL(),
            ctx;

        var tmpImage = new Image();

        // Save the image data so that it can be restored
        me.tmpImageData = imageData;

        tmpImage.onload = function () {
            ctx = me.canvas.dom.getContext('2d');
            me.canvas.dom.height = height;
            me.canvas.dom.width = width;
            me.drawImageScaled(tmpImage, ctx);
        };

        tmpImage.src = imageData;
    },

    /**
     * Scales the image and loads the image into the canvas
     * @param {Image} img The image to load
     * @param {CanvasContext} ctx The context of the canvas element to load
     */

    drawImageScaled: function (img, ctx) {
        var canvas = ctx.canvas;
        var hRatio = canvas.width / img.width;
        var vRatio = canvas.height / img.height;
        var ratio = Math.min(hRatio, vRatio);
        var centerShift_x = ( canvas.width - img.width * ratio ) / 2;
        var centerShift_y = ( canvas.height - img.height * ratio ) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    },


    beginCapture: function () {
        var me = this;

        me.fireEvent('begincapture', me);
    },

    endCapture: function () {
        var me = this;
        me.tmpImageData = null;
        me.fireEvent('endcapture');
    }

});