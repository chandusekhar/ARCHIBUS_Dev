/**
 * The EditBase class should be used as the base class for all Edit views that are used with the
 * Common.view.navigation.NavigationView class. The EditBase class provides configuration options model, storeId, and
 * isCreateView that allow the navigation framework to determine the action to take.
 *
 * @author Jeff Martin
 * @since 21.1
 */

Ext.define('Common.view.navigation.EditBase', {
    extend: 'Common.form.FormPanel',

    requires: 'Common.control.TitlePanel',

    isNavigationEdit: true,

    config: {
        /**
         * @cfg {String} model The name of the Model class that is associated with this view. The Model
         *      class is used when a new record is created for this view.
         * @accessor
         */
        model: null,

        /**
         * @cfg {String} storeId The id of the Store associated with this view. Used when the contents
         *      of this view is added to a List View
         * @accessor
         */
        storeId: null,

        /**
         * @cfg {Boolean} isCreateView When isCreateView is true a new record is created to store the
         *      view data.
         *      When isCreateView is false, the view is updating an existing record. In this case the
         *      record is supplied by the list view that initiated this view.
         *
         * @accessor
         */
        isCreateView: false
    },

    initialize: function () {
        var me = this,
            title,
            titlePanel;

        //<debug>
        if (Ext.isEmpty(this.getModel)) {
            throw new Error(
                LocaleManager.getLocalizedString(
                    'The name of the Model class associated with this view must be supplied in the model property',
                    'Common.view.navigation.EditBase'));
        }

        if (Ext.isEmpty(this.getStoreId)) {
            throw new Error(LocaleManager.getLocalizedString(
                'The store id of the Store class associated with this view must be supplied in the storeId property',
                'Common.view.navigation.EditBase'));
        }
        //</debug>
        me.callParent(arguments);

        // Add the title panel
        if (Ext.isFunction(me.getTitle)) {
            title = me.getTitle();
            titlePanel = Ext.factory({docked: 'top', title: title}, Common.control.TitlePanel);
            me.add(titlePanel);
        }

    },

    updateIsCreateView: function (newIsCreateView) {
        var modelName,
            record;
        // If the form is displaying a new record get the model name and set the record property.
        if (newIsCreateView) {
            modelName = this.getModel();
            record = Ext.create(modelName);
            this.setRecord(record);
        }
    }

});