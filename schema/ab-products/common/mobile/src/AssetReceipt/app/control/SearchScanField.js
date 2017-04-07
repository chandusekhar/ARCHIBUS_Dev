Ext.define('AssetReceipt.control.SearchScanField', {
    extend: 'Ext.Container',

    xtype: 'searchScanField',

    config: {
        layout: {
            type: 'hbox',
            pack: 'start',
            align: 'right'
        },

        items: [
            {
                xtype: 'search',
                placeHolder: ''
            },
            {
                xtype: 'iconbutton',
                action: 'search',
                iconCls: 'search',
                cls: 'ab-icon-action',
                align: 'left',
                style: Ext.os.is.Phone ? 'max-width: 40px; padding-left: 0px' : 'max-width: 40px; padding-left: 20px'
            }
        ]

    },

    initialize: function () {
        this.callParent(arguments);

        // when the search field is displayed in the toolbar it has padding-right,
        // and since it is not diplayed toolbar it needs padding-right to avoid overlapping the barcode icon
        this.down('textfield').setStyle('padding-right: .5em');

        // when input text has value (is clearable) it has padding-right and we need to overwrite that to keep field's size
        this.down('textfield').getComponent().setStyle('padding-right: 0em');

        // display the barcode icon as am action button (orange)
        this.down('iconbutton[itemId=barcodeIcon]').addCls('ab-icon-action');
    },

    getValue: function () {
        return this.down('search').getValue();
    },

    setDisabled: function (isDisabled) {
        this.down('search').setReadOnly(isDisabled);
        this.down('iconbutton[action=search]').setDisabled(isDisabled);
    }
});
