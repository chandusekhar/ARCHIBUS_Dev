/**
 * A Select list control that does not default to selecting the first item in the list.
 * The Sencha Touch (@link Ext.field.Select} control defaults to selecting the first item in the list even if the item
 * has not been previously selected. The Common.control.Select field corrects this issue.
 *
 * The Common.control.Select field can directly replace the {@link Ext.field.Select}
 *
 *      Ext.create('Ext.form.Panel', {
 *           fullscreen: true,
 *           items: [
 *               {
 *                   xtype: 'fieldset',
 *                   title: 'Select',
 *                   items: [
 *                       {
 *                           xtype: 'selectlistfield',
 *                           label: 'Choose one',
 *                           options: [
 *                               {text: 'First Option',  value: 'first'},
 *                               {text: 'Second Option', value: 'second'},
 *                               {text: 'Third Option',  value: 'third'}
 *                           ]
 *                       }
 *                   ]
 *               }
 *           ]
 *       });
 *
 * Overrides {@link Ext.field.Select}
 * @since 21.1
 * @author Jeff Martin
 */
Ext.define('Common.control.Select', {
    extend: 'Ext.field.Select',
    xtype: 'selectlistfield',


    config: {
        /**
         * @cfg {Boolean} tabletPickerWordWrap causes the description text in the tablet popup to wrap when true.
         */
        tabletPickerWordWrap: false,

        /**
         * @cfg {Object} defaultPhonePickerConfig supplies the configuration object for the phone picker panel
         */
        defaultPhonePickerConfig: {
            doneButton: LocalizedStrings.z_Done,
            cancelButton: LocalizedStrings.z_Cancel
        },

        /**
         * @cfg {Booleam} useFieldDefLabel true to use multiline heading from TableDef as field label,
         * or false to use defined label.
         */
        useFieldDefLabel: true,

        /**
         * @cfg {Boolean} isSortField set to true to display a down arrow on the sort field.
         */
        isSortField: false,

        //private
        // TO DO avoid using this field
        isSorter: false, //used because this.getIsSortField() is undefined

        /**
         * @cfg {Boolean} enableSortHistory Enables saving the latest value selected in the sort field.
         * @since 23.1
         */
        enableSortHistory: true

    },

    applyIsSortField: function (config) {
        var me = this,
            clearIcon;

        if (config) {
            // Add the sort icon
            clearIcon = Ext.get(me.getComponent().clearIcon);
            clearIcon.addCls('ab-sort-down-icon');
            clearIcon.removeCls('x-clear-icon');

            me.addCls('ab-sort-icon');
            me.getComponent().input.addCls('ab-sort-field-input');

            me.setIsSorter(config);
        }
    },

    initialize: function () {
        var me = this,
            store = this.getStore(),
            index,
            record;

        me.callParent();
        me.element.addCls('x-prompt-clearicon');

        if (Ext.isEmpty(me.getName())) {
            me.setEnableSortHistory(false);
        }

        if (me.latestSort) {
            index = store.find(me.getValueField(), me.latestSort, null, null, null, true);

            record = store.getAt(index);
            me.setValue(record);
        }
    },

    applyEnableSortHistory: function (config) {
        var me = this;

        if (config && me.getIsSorter()) {
            me.loadLatestSortFromStorage();
        }

        return config;
    },

    /* Overridden framework function. Ignore JSHint warnings. */
    /* jshint maxcomplexity: 11 */
    /**
     * @override
     * Does not select the first item in the select list store if that item is not found in the store.
     * Shows the picker for the select field, whether that is a {@link Ext.picker.Picker} or a simple
     * {@link Ext.List list}.
     */
    showPicker: function () {
        // Overridden framework function ignore JSHint too many statements error
        /* jshint maxstatements: 40 */

        var store = this.getStore(),
            picker,
            name,
            value,
            listPanel,
            list,
            emptyValue,
            index,
            record;

        //check if the store is empty, if it is, return
        if (!store || store.getCount() === 0) {
            return;
        }

        if (this.getReadOnly()) {
            return;
        }

        this.isFocused = true;

        if (this.getUsePicker()) {
            picker = this.getPhonePicker();
            name = this.getName();
            value = {};

            value[name] = this.getValue();
            picker.setValue(value);
            if (!picker.getParent()) {
                Ext.Viewport.add(picker);
            }
            picker.show();
        } else {
            listPanel = this.getTabletPicker();
            list = listPanel.down('list');
            emptyValue = false;

            store = list.getStore();
            index = store.find(this.getValueField(), this.getValue(), null, null, null, true);
            if (index === -1) {
                emptyValue = true;
            }
            record = store.getAt((index === -1) ? 0 : index);

            if (!listPanel.getParent()) {
                Ext.Viewport.add(listPanel);
            }

            // Start override
            // Deselect the record in the list if the value is not found in the store.
            listPanel.showBy(this.getComponent(), (Ext.os.is.BlackBerry && Ext.os.version.getMajor() === 10) ? 't-b' : null);
            if (emptyValue) {
                list.deselect(record, true);
            } else {
                list.select(record, null, true);
            }
        }
    },

    // @private
    getTabletPicker: function () {
        var config = this.getDefaultTabletPickerConfig(),
            wordWrap = this.getTabletPickerWordWrap(),
            pickerCls = wordWrap ? 'picker-overflow' : 'x-list-label';

        if (!this.listPanel) {
            this.listPanel = Ext.create('Ext.Panel', Ext.apply({
                left: 0,
                top: 0,
                modal: true,
                cls: Ext.baseCSSPrefix + 'select-overlay',
                layout: 'fit',
                hideOnMaskTap: true,
                width: Ext.os.is.Phone ? '14em' : '18em',
                height: (Ext.os.is.BlackBerry && Ext.os.version.getMajor() === 10) ? '12em' : (Ext.os.is.Phone ? '12.5em' : '22em'),
                items: {
                    xtype: 'list',
                    store: this.getStore(),
                    itemTpl: '<span class="' + pickerCls + '">{' + this.getDisplayField() + ':htmlEncode}</span>',
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

    // @private
    onListSelect: function (item, record) {
        var me = this;
        if (record) {
            me.setValue(record);
        }

        if (this.getIsSorter()) {
            me.addValueToHistory(record);
        }
    },

    //@private
    addValueToHistory: function (record) {
        var localStorageKey = this.getLocalStorageName(),
            data = record.getData(),
            value;

        if (Ext.isEmpty(data)) {
            return;
        }

        value = data[this.getValueField()];
        if (!Ext.isEmpty(this.latestSort) && (this.latestSort === value)) {
            return;
        }

        this.latestSort = value;

        localStorage.setItem(localStorageKey, Ext.JSON.encode(this.latestSort));
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

    loadLatestSortFromStorage: function () {
        var localStorageKey = this.getLocalStorageName(),
            storageValue;

        this.latestSort = null;

        if (Ext.isEmpty(localStorageKey)) {
            return;
        } else {
            storageValue = localStorage.getItem(localStorageKey);
        }

        if (!Ext.isEmpty(storageValue)) {
            this.latestSort = Ext.JSON.decode(storageValue);
        }
    }
});