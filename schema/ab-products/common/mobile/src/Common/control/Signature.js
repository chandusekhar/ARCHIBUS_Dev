/**
 * Signature Capture control
 *
 * Example application Solutions app Controls | Signature Capture
 *
 *
 * @since 23.1
 * @author Jeff Martin
 */
Ext.define('Common.control.Signature', {
    extend: 'Ext.Container',

    xtype: 'signature',

    requires: 'Common.component.SignaturePad',

    config: {

        /**
         * @cfg {String} height The height of the signature pad component
         */
        height: '200px',

        /**
         * @cfg {Boolean} readOnly Setting to true displays the control in read only mode. The
         * Clear and Done buttons are not visible when the control is in read only mode.
         */
        readOnly: false,

        cls: 'ab-signature-control',

        /**
         * @cfg {String} title The title displayed in the Signature control footer
         */
        title: LocaleManager.getLocalizedString('Signature', 'Common.control.Signature'),

        items: [
            {
                xtype: 'container',
                itemId: 'signatureContainer',
                items: [
                    {
                        xtype: 'signaturepad',
                        itemId: 'wrapper'
                    },
                    {
                        xtype: 'titlebar',
                        docked: 'bottom',
                        items: [
                            {
                                xtype: 'button',
                                text: LocaleManager.getLocalizedString('Clear', 'Common.control.Signature'),
                                itemId: 'clearButton',
                                align: 'left',
                                hidden: false
                            },
                            {
                                xtype: 'button',
                                text: LocaleManager.getLocalizedString('Done', 'Common.control.Signature'),
                                itemId: 'doneButton',
                                align: 'right',
                                hidden: false
                            }
                        ]
                    }

                ]
            }
        ]
    },

    initialize: function () {
        var me = this,
            doneButton = me.down('#doneButton'),
            clearButton = me.down('#clearButton'),
            signaturePad = me.down('signaturepad'),
            titleBar = me.down('titlebar');

        titleBar.setTitle(me.getTitle());

        doneButton.on('tap', 'onDone', me);
        clearButton.on('tap', 'onClear', me);

        signaturePad.on('begincapture', 'onBeginCapture', me);
        signaturePad.on('endcapture', 'onEndCapture', me);

        me.on('painted', 'syncSize', me);
        Ext.Viewport.on('orientationchange', me.syncSize, me, {buffer: 50});
    },

    //@private
    applyReadOnly: function (config) {
        var me = this,
            signaturePad = me.down('signaturepad');

        signaturePad.setReadOnly(config);
        me.updateActionButtons(config);

        return config;
    },

    //@private
    applyTitle: function (config) {
        var me = this,
            titleBar = me.down('titlebar');

        if (config) {
            titleBar.setTitle(config);
        }
        return config;
    },

    //@private
    applyHeight: function (config) {
        var me = this,
            signatureContainer = me.down('#signatureContainer');

        if (config) {
            signatureContainer.setHeight(config);
            me.syncSize();
        }

        return me.callParent(arguments);
    },

    //@private
    applyWidth: function (config) {
        var me = this,
            signatureContainer = me.down('#signatureContainer');

        if (config) {
            signatureContainer.setWidth(config);
            me.syncSize();
        }

        return me.callParent(arguments);
    },

    /**
     * Adjusts the size of the control and the signaturepad component canvas element
     * @private
     */
    syncSize: function () {
        var me = this,
            wrapper = me.down('#wrapper'),
            signaturePad = me.down('signaturepad'),
            height = me.element.dom.offsetHeight - 53,
            width = me.element.dom.offsetWidth,
            signatureParentElement = me.getParent();

        if (signatureParentElement) {
            width = signatureParentElement.element.dom.clientWidth;
        }

        if (width > 0) {
            wrapper.setHeight(height - 18);
            signaturePad.syncSize(height - 18, width - 18);
        }
    },

    /**
     * Returns the signature data in a base64 data URL format
     * @returns {String}
     */
    getDataURL: function () {
        var me = this,
            signaturePad = me.down('signaturepad');

        return signaturePad.getDataURL();
    },

    /**
     * Returns the signature data as a base64 encoded string.
     * @returns {String}
     */
    getData: function () {
        var me = this,
            data = me.getDataURL();

        return data.replace('data:image/png;base64,', '');
    },

    /**
     * Sets the dataURL of the signature pad component. Used to display a captured signature image
     * @param {String} data A base64 encoded image
     */
    setDataURL: function (data) {
        var me = this,
            signaturePad = me.down('signaturepad'),
            urlPrefix = 'data:image/png;base64,';

        signaturePad.loadImage(urlPrefix + data);
    },


    /**
     * Sets to visibiltiy of the Done and Clear buttons. The buttons are not displayed
     * when the control is in Read Only mode.
     * @private
     * @param {Boolean} hidden Hides the buttons when true, displays the buttons otherwise.
     */
    updateActionButtons: function (hidden) {
        var me = this,
            doneButton = me.down('#doneButton'),
            clearButton = me.down('#clearButton'),
            isHidden = Ext.isEmpty(hidden) ? false : hidden;

        doneButton.setHidden(isHidden);
        clearButton.setHidden(isHidden);
    },


    /**
     * Captures the signature when the Done button is tapped.
     * Fires the capturedone event
     * @private
     */
    onDone: function () {
        var me = this,
            signaturePad = me.down('signaturepad');

        if (!signaturePad.isEmpty()) {
            signaturePad.capture();
            me.fireEvent('capturedone', me);
        }
    },

    /**
     * Clears the contents of the signature pad component
     * Fires the captureclear event
     * @private
     */
    onClear: function () {
        var me = this,
            signaturePad = me.down('signaturepad');

        signaturePad.clear();
        me.fireEvent('captureclear', me);
    },

    /**
     * Relays the signature component begincapture event
     * @param {Common.component.SignaturePad} signatureComponent
     * @private
     */
    onBeginCapture: function (signatureComponent) {
        this.fireEvent('begincapture', signatureComponent, this);
    },

    /**
     * Relays the signature component endcapture event
     * @param {Common.component.SignaturePad} signatureComponent
     * @private
     */
    onEndCapture: function (signatureComponent) {
        this.fireEvent('endcapture', signatureComponent, this);
    }
});