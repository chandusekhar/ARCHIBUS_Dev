/**
 * A search component that includes the option of enabling the barcode scanning feature.
 *
 * @since 22.1
 * @author Jeff Martin
 */
Ext.define('Common.control.Search', {
    extend: 'Ext.Container',

    xtype: 'search',

    requires: [
        'Common.control.button.Icon',
        'Common.device.Barcode',
        'Ext.util.DelayedTask'
    ],

    config: {

        style: 'margin-right:6px',

        layout: {
            type: 'hbox',
            pack: 'start',
            align: 'center'
        },


        items: [
            {
                xtype: 'searchfield'
            },
            {
                xtype: 'iconbutton',
                itemId: 'barcodeIcon',
                iconCls: 'barcode',
                cls: 'x-button-icon-secondary',
                width: '2.5em'
            },
            {
                xtype: 'iconbutton',
                itemId: 'historyIcon',
                iconCls: 'search_history',
                cls: 'x-button-icon-secondary'
            }
        ],

        readOnly: false,

        /**
         * @cfg {String} The value of the searchfield component.
         */
        value: null,

        /**
         * @cfg {Boolean} enableBarcodeScanning Displays the Barcode icon and allows barcode scanning when true.
         */
        enableBarcodeScanning: false,

        /**
         * @cfg {Array} barcodeFormat Defines how the sccaned value should be parsed. Used for supporting multi-key barcode values.
         * @since 23.1
         */
        barcodeFormat: [],

        /**
         * @cfg {Boolean} enableSearchHistory Displays the history icon and allows saving the latest searches and use them.
         * @since 23.1
         */
        enableSearchHistory: true,

        /**
         * @cfg {String} name Component name used to uniquely identify local storage key used for search history persistancy.
         * If this is not set then enableSearchHistory becames false and search history is no longer available.
         * @since 23.1
         */
        name: ''
    },

    task: null,

    initialize: function () {
        var me = this,
            barcodeIconButton = me.down('iconbutton[itemId=barcodeIcon]'),
            historyIconButton = me.down('iconbutton[itemId=historyIcon]'),
            searchField = me.down('searchfield');

        barcodeIconButton.on('iconbuttontap', me.onBarCodeButtonTap, me);
        historyIconButton.on('iconbuttontap', me.onHistoryButtonTap, me);

        searchField.on({
            keyup: 'onKeyUp',
            clearicontap: 'onClearIconTap',
            scope: me
        });

        me.task = Ext.create('Ext.util.DelayedTask');

        if (Ext.isEmpty(me.getName())) {
            me.setEnableSearchHistory(false);
        }

        if (Ext.os.is.Android4) {
            AndroidEvent.on('hidekeyboard', me.onHideKeyboard, me);
        }

        if(Ext.os.is.Phone && me.getEnableBarcodeScanning() && me.getEnableSearchHistory()){
            me.setStyle("margin-right:2.5em");
        }
    },

    applyEnableBarcodeScanning: function (config) {
        var me = this,
            iconButton = me.down('iconbutton[itemId=barcodeIcon]'),
            historyIconButton = me.down('iconbutton[itemId=historyIcon]');

        iconButton.setHidden(!config);

        // when bacode icon is shown display the history icon after it
        if (config && !Ext.os.is.Phone) {
            historyIconButton.addCls('x-history');
        }

        return config;
    },

    applyEnableSearchHistory: function (config) {
        var me = this,
            historyIconButton = me.down('iconbutton[itemId=historyIcon]');

        historyIconButton.setHidden(!config);

        if (config) {
            me.loadLatestSearchesFromStorage();
        }

        return config;
    },

    applyReadOnly: function (config) {
        var me = this,
            barcodeIconButton = me.down('iconbutton[itemId=barcodeIcon]'),
            historyIconButton = me.down('iconbutton[itemId=historyIcon]'),
            searchField = me.down('searchfield');

        searchField.setReadOnly(config);
        barcodeIconButton.setHidden(config);
        historyIconButton.setHidden(config);

        return config;
    },

    updateReadOnly: function (newValue) {
        this.applyReadOnly(newValue);
    },

    applyValue: function (config) {
        var me = this,
            searchField = me.down('searchfield');

        searchField.setValue(config);

        return config;
    },

    getValue: function () {
        var me = this,
            searchField = me.down('searchfield');

        return searchField.getValue();
    },

    onBarCodeButtonTap: function (button, e) {
        this.doBarcodeIconTap(this, e);
    },

    onHistoryButtonTap: function () {
        this.doHistoryIconTap(this);
    },

    onKeyUp: function (searchField) {
        var me = this,
            value = searchField.getValue();

        // Delay the firing of the searchkeyup event until the user has stopped
        // typing for 500ms
        me.task.delay(500, function () {
            me.fireEvent('searchkeyup', value, me);
            me.addValueToHistory(value);
        });
    },

    onClearIconTap: function () {
        this.fireEvent('searchclearicontap', this);
    },

    // @private
    doBarcodeIconTap: function (me, e) {
        me.setReadOnly(true);
        e.preventDefault();
        e.stopPropagation();
        me.doScan()
            .then(function (scanResult) {
                    me.setReadOnly(false);
                    // Update field
                    me.setValue(scanResult.code);
                    me.addValueToHistory(scanResult.code);
                    me.fireEvent('scancomplete', scanResult);
                },
                function (error) {
                    me.setReadOnly(false);
                    Ext.Msg.alert(me.errorTitle, error);
                });
    },

    doScan: function () {
        return Common.device.Barcode.scanAndDecode(this.getBarcodeFormat());
    },

    doHistoryIconTap: function (me) {
        var historyIconButton = me.down('iconbutton[itemId=historyIcon]'),
            listPanel,
            noHistoryRecordsMsg = LocaleManager.getLocalizedString('There are no previous searches saved.', 'Common.control.Search');

        // when historical values are available display the picker list, else display an information message
        if (!Ext.isEmpty(this.latestSearches)) {
            listPanel = me.getListPicker();

            if (!listPanel.getParent()) {
                Ext.Viewport.add(listPanel);
            }

            listPanel.showBy(historyIconButton, (Ext.os.is.BlackBerry && Ext.os.version.getMajor() === 10) ? 't-b' : null);
        } else {
            Ext.Msg.alert('', noHistoryRecordsMsg);
        }
    },

    // @private
    getListPicker: function () {
        var me = this;

        me.listPanel = Ext.create('Ext.Panel', Ext.apply({
            left: 0,
            top: 0,
            modal: true,
            cls: Ext.baseCSSPrefix + 'select-overlay',
            layout: 'fit',
            hideOnMaskTap: true,
            width: Ext.os.is.Phone ? '14em' : '18em',
            height: '15em',
            zIndex: 15, //higher that zIndex in Prompt control
            items: {
                xtype: 'list',
                itemTpl: '{title}',
                data: me.latestSearches,
                listeners: {
                    select: this.onListSelect,
                    itemtap: this.onListTap,
                    scope: this
                }
            }
        }));

        return me.listPanel;
    },

    // @private
    onListSelect: function (item, record) {
        var me = this;

        if (record) {
            me.setValue(record.get('title'));
            me.fireEvent('searchkeyup', record.get('title'), me);
        }
    },

    onListTap: function () {
        this.listPanel.hide({
            type: 'fade',
            out: true,
            scope: this
        });
    },

    //@private
    addValueToHistory: function (value) {
        var localStorageKey = this.getLocalStorageName();

        if (Ext.isEmpty(value)) {
            return;
        }

        if (!Ext.isEmpty(this.latestSearches) && Ext.Array.contains(Ext.Array.pluck(this.latestSearches, 'title'), value)) {
            return;
        }

        if (this.latestSearches.length < 5) {
            this.latestSearches.push({title: value});
        } else {
            Ext.Array.erase(this.latestSearches, 0, 1);
            this.latestSearches.push({title: value});
        }

        localStorage.setItem(localStorageKey, Ext.JSON.encode(this.latestSearches));
    },

    getLocalStorageName: function () {
        var appName = Common.Application.appName,
            xtype = this.xtype,
            fieldName = this.getName();

        if (Ext.isEmpty(fieldName)) {
            return '';
        } else {
            return Ext.String.format('Ab.{0}.{1}.{2}', appName, xtype, fieldName);
        }

    },

    loadLatestSearchesFromStorage: function () {
        var localStorageKey = this.getLocalStorageName(),
            storageValue;

        this.latestSearches = [];

        if (Ext.isEmpty(localStorageKey)) {
            return;
        } else {
            storageValue = localStorage.getItem(localStorageKey);
        }

        if (!Ext.isEmpty(storageValue)) {
            this.latestSearches = Ext.JSON.decode(storageValue);
        }
    },

    // Remove the focus from the search field to prevent Nexus 7 devices from duplicating
    // the field contents
    onHideKeyboard: function () {
        if (Ext.isFunction(this.blur)) {
            this.blur();
        }
    }
});