Ext.define('Common.view.navigation.FilterForm', {
    extend: 'Common.form.FormPanel',

    config: {
        /**
         * @cfg {Boolean} enableFilterHistory Allows saving the latest filter values and use them.
         * @since 23.1
         */
        enableFilterHistory: true,

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Clear', 'Common.view.navigation.FilterForm'),
                name: 'clearButton',
                align: 'right'
            },
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Filter', 'Common.view.navigation.FilterForm'),
                name: 'filterButton',
                ui: 'action',
                align: 'right'
            }
        ]
    },

    initialize: function () {
        var me = this,
            buttons = me.getToolBarButtons();

        Ext.each(buttons, function (button) {
            if (button.name === 'clearButton') {
                button.listeners = {tap: me.clearFilter, scope: me};
            } else if (button.name === 'filterButton') {
                button.listeners = {tap: me.applyFilter, scope: me};
            }
        });

        me.callParent(arguments);

        me.loadLatestFiltersFromStorage();
        me.setValues(me.latestFilters);
    },

    loadLatestFiltersFromStorage: function () {
        var localStorageKey = this.getLocalStorageName(),
            storageValue;

        this.latestFilters = [];

        if (Ext.isEmpty(localStorageKey)) {
            return;
        } else {
            storageValue = localStorage.getItem(localStorageKey);
        }

        if (!Ext.isEmpty(storageValue)) {
            this.latestFilters = Ext.JSON.decode(storageValue);
        }
    },

    getLocalStorageName: function () {
        var appName = Common.Application.appName,
            xtype = this.xtype;

        if (Ext.isEmpty(xtype)) {
            return '';
        } else {
            return Ext.String.format('Ab.{0}.{1}', appName, xtype);
        }
    },

    //@private
    addFiltersToHistory: function () {
        var me = this,
            localStorageKey = this.getLocalStorageName(),
            values = me.getValues();

        me.latestFilters = values;

        localStorage.setItem(localStorageKey, Ext.JSON.encode(me.latestFilters));
    },

    clearFilter: function () {
        var me = this;

        me.reset();
        me.addFiltersToHistory();

        me.fireEvent('clearFilter', me);
    },

    applyFilter: function () {
        var me = this;

        me.addFiltersToHistory();
        me.fireEvent('applyFilter', me);
    }
});
