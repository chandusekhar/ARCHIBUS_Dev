/**
 * Displays the list of Apps that the registered user is authorized to access.
 *
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('AppLauncher.view.AppList', {
    extend: 'Ext.DataView',
    requires: ['AppLauncher.view.AppItem'],

    xtype: 'appList',

    config: {

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        cls: 'ab-app-list',

        scrollToTopOnRefresh: false,

        useComponents: true,

        defaultType: 'appItem',

        store: 'apps'
    },

    initialize: function() {
        var me = this,
            emptyTextMessage = LocaleManager.getLocalizedString('{0}No Applications are Available. Tap the {1} icon in the title bar above to register this device.{2}',
                    'AppLauncher.view.AppList');

        me.callParent(arguments);

        me.setEmptyText(Ext.String.format(emptyTextMessage, '<div class="empty-text">','<span class="ab-settings-icon"></span>', '</div>'));
    },

    /**
     * @override
     */
    updateData: function (data) {
        var store = this.getStore();

        if (data === '') {
            return;
        }

        if (!store) {
            this.setStore(Ext.create('Ext.data.Store', {
                data: data,
                autoDestroy: true
            }));
        } else {
            store.add(data);
        }
    }
});