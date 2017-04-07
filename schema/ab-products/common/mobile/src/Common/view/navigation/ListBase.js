/**
 * The ListBase class should be used as the base class for all List Views that are used with the
 * Common.view.navigation.NavigationView class. The ListBase class contains the editView configuration that allows the
 * navigation framework to determine which view to load when a record is added to the list or when a record is updated.
 *
 * @author Jeff Martin
 */

Ext.define('Common.view.navigation.ListBase', {
    extend: 'Ext.Container',

    requires: 'Common.control.TitlePanel',

    isNavigationList: true,

    itemtapCanFire: true,

    config: {
        /**
         * @cfg {String} editViewClass The name of the View class that is used by this List view to update records.
         * @accessor
         */
        editViewClass: null,

        /**
         * @cfg {String} addViewClass The name of the View class that is used by this List view to add records.
         * @accessor
         */
        addViewClass: null,

        layout: 'vbox',
        enableDisclosure: false
    },

    initialize: function () {
        // Get all of the lists and add the disclosure event
        var me = this,
            lists = me.query('list'),
            title,
            titlePanel;

        me.callParent();

        Ext.each(lists, function (list) {
            var enableDisclosure = this.getEnableDisclosure();
            list.setOnItemDisclosure(enableDisclosure);

            if (enableDisclosure) {
                list.on({
                    scope: me,
                    disclose: me.onDisclose
                });
            } else {
                list.on({
                    scope: me,
                    itemsingletap: me.onItemSingleTap
                });
            }
        }, me);

        // Add Title Panel
        // Add the title panel
        title = '';

        if (Ext.isFunction(this.getTitle)) {
            title = this.getTitle();
        }

        titlePanel = Ext.factory({docked: 'top', title: title}, Common.control.TitlePanel);
        this.add(titlePanel);

    },

    onDisclose: function (scope, record, target, index, e, eOpts) {
        this.fireEvent('itemDisclosed', this, record, target, index, e, eOpts);
    },

    onItemSingleTap: function (scope, index, target, record, e, eOpts) {
        var me = this;
        // Change the parameter order to match the itemDisclosed event
        if (me.itemtapCanFire) {
            me.itemtapCanFire = false;
            me.fireEvent('itemSingleTapped', this, record, target, index, e, eOpts);
        }
        setTimeout(function () {
            me.itemtapCanFire = true;
        }, 200);
    }

});