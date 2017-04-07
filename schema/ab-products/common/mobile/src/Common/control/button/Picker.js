/**
 * @since 21.2
 * @author Jeff Martin
 */
Ext.define('Common.control.button.Picker', {
    extend: 'Ext.Button',

    xtype: 'buttonpicker',

    config: {
        /**
         * @cfg {Ext.data.Store} store The store containg the data to be displayed in the picker list
         */
        store: null,

        /**
         * @cfg {Boolean} updatePickerText If true, the picker text is updated when the user selects an item from the list
         */
        updatePickerText: false,

        /**
         * @cfg {Boolean} listItemWordWrap causes the list item text in the popup to wrap when true.
         */
        listItemWordWrap: false,

        /**
         * @cfg {String/Number} valueField The underlying {@link Ext.data.Field#name data value name} (or numeric Array index) to bind to this
         * Select control.
         */
        valueField: 'value',

        /**
         * @cfg {String/Number} displayField The underlying {@link Ext.data.Field#name data value name} (or numeric Array index) to bind to this
         * Select control. This resolved value is the visibly rendered value of the available selection options.
         */
        displayField: 'text',

        /**
         * @cfg {Number} badgeField. The store field name for the badge value if one exists.
         */
        badgeField: 'badge_value',

        /**
         * @cfg {Ext.data.Model} value. The selected record.
         */
        value: null,

        /**
         * @cfg {Object} defaultTabletPickerConfig
         * The default configuration for the picker component when you are on a tablet.
         */
        defaultTabletPickerConfig: null,

        /**
         * Configurable size of the picker panel.
         */
        panelSize: {
            tablet: {width: '18em', height: '22em'},
            phone: {width: '14em', height: '12em'}
        },

        cls: 'ab-buttonpicker'

    },

    initialize: function () {
        this.callParent();

        this.element.on({
            scope: this,
            tap: 'onPickerTap'
        });
    },

    onPickerTap: function () {
        this.showPicker();
        this.fireEvent('onPickerTap', this.listPanel.down('list'));
    },

    applyStore: function (store) {

        if (store) {
            store = Ext.data.StoreManager.lookup(store);

            store.on({
                scope: this,
                addrecords: 'onStoreDataChanged',
                removerecords: 'onStoreDataChanged',
                updaterecord: 'onStoreDataChanged',
                refresh: 'onStoreDataChanged'
            });
        }

        return store;
    },

    applyValue: function (config) {
        if (config.isModel) {
            return config;
        } else {
            return this.getStore().findRecord('value', config);
        }
    },

    updatePanelSize: function () {
        this.refreshListHeight();
        this.refreshListWidth();
    },

    refreshListHeight: function () {
        if (this.listPanel) {
            this.listPanel.setHeight(this.determineListHeight());
        }
    },

    refreshListWidth: function () {
        if (this.listPanel) {
            this.listPanel.setWidth(this.determineListWidth());
        }
    },

    determineListHeight: function () {
        return (Ext.os.is.Phone || (Ext.os.is.BlackBerry && Ext.os.version.getMajor() === 10)) ?
            this.getPanelSize().phone.height :
            this.getPanelSize().tablet.height;
    },

    determineListWidth: function () {
        return Ext.os.is.Phone ? this.getPanelSize().phone.width : this.getPanelSize().tablet.width;
    },

    /**
     * On update value, update also the button text if the config demands it
     * @param record
     */
    updateValue: function (record) {
        if (this.getUpdatePickerText()) {
            this.setText(record.get(this.getDisplayField()));
        }
    },

    onStoreDataChanged: function () {
        var store = this.getStore(), storeId;
        if (store) {
            storeId = store.getStoreId();
            this.setStore(Ext.getStore(storeId));
        }
    },

    // @private
    getTabletPicker: function () {
        var config = this.getDefaultTabletPickerConfig(),
            wordWrap = this.getListItemWordWrap(),
            pickerCls = wordWrap ? 'picker-overflow' : 'x-list-label';

        // TODO: Fix issue where store does not have a badge_field in the model
        if (!this.listPanel) {
            this.listPanel = Ext.create('Ext.Panel', Ext.apply({
                left: 0,
                top: 0,
                modal: true,
                cls: Ext.baseCSSPrefix + 'select-overlay',
                layout: 'fit',
                hideOnMaskTap: true,
                width: this.determineListWidth(),
                height: this.determineListHeight(),
                items: {
                    xtype: 'list',
                    store: this.getStore(),
                    itemTpl: '<span class='+pickerCls+'>{' + this.getDisplayField() + ':htmlEncode}<tpl if="' + this.getBadgeField() + ' &gt; 0"><div class="x-picker-hasbadge"><span class="x-badge">{' + this.getBadgeField() + '}</span></div></tpl></span>',
                    listeners: {
                        select: this.onListSelect,
                        itemtap: this.onListTap,
                        scope: this
                    }
                }
            }, config));
        }

        return this.listPanel;
    },

    showPicker: function () {
        var store = this.getStore(),
            listPanel,
            list;

        listPanel = this.getTabletPicker();

        //check if the store is empty, if it is, return
        if (!store || store.getCount() === 0) {
            return;
        }

        // select the default item in the list, according to the picker value (record)
        if (!Ext.isEmpty(this.getValue())) {
            list = listPanel.down('list');
            list.select(this.getValue(), false, true);
        }


        if (!listPanel.getParent()) {
            Ext.Viewport.add(listPanel);
        }

        listPanel.showBy(this, (Ext.os.is.BlackBerry && Ext.os.version.getMajor() === 10) ? 't-b' : null);
    },

    // @private
    onListSelect: function (item, record) {
        var me = this;
        if (record) {
            me.setValue(record);
        }

        me.fireEvent('itemselected', me.getValue(), this.listPanel.down('list'), item);
    },

    onListTap: function (list, index, target, record) {
        var animation = {
            type: 'fade',
            out: true,
            scope: this
        };

        list.deselectAll(true);
        list.select(record, false, false);

        if(Ext.os.is.WindowsPhone) {
            animation = false;
        }

        this.listPanel.hide(animation);
    }

});