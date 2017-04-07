/**
 *  Segmented buttons that display views and automatically update the button badge text
 *
 *  Example Use
 *
 *     xtype: 'viewselector',
 *     navigationView: 'mainview',
 *     displayViews: true,
 *     items: [
 *        {
 *            text: 'Labor',
 *            store: 'workRequestCraftspersonsStore',
 *            view: {
 *                edit: 'workRequestCraftspersonEditPanel',
 *                list: 'workRequestCraftspersonListPanel'
 *            }
 *        },
 *        {
 *            text: 'Parts',
 *            store: 'workRequestPartsStore',
 *            view: {
 *                edit: 'workRequestPartEditPanel',
 *                list: 'workRequestPartListPanel'
 *            }
 *        }
 *     ]
 *
 *
 * @author Jeff Martin
 * @since 21.2
 */
Ext.define('Common.view.navigation.ViewSelector', {
    extend: 'Ext.SegmentedButton',
    requires: 'Common.control.button.ViewSelection',

    xtype: 'viewselector',

    config: {
        /**
         * @cfg {Object} defaultType
         */
        defaultType: 'selectbutton',

        /**
         *  @cfg {Common.view.navigation.NavigationView} The current {#Common.view.navigation.NavigationView}.
         *  The views will be pushed to this NavigationView.
         */
        navigationView: null,

        /**
         *  @cfg {Boolean} displayViews True to display the view when the {#Common.control.button.ViewSelection} is
         *  tapped. False to not display the view.
         *  When set to false the select event should be handled in a controller. The view should be displayed by
         *  the controller.
         */
        displayViews: false
    },

    /**
     *  @property {Boolean} Set to false when the view is displaying. Used to prevent multiple button taps from
     *  displaying multiple copies of the view.
     *  @private
     */
    enableChildViewSelection: true,

    /**
     * @event selected
     * Fires when the {#Common.control.button.ViewSelection} is tapped.
     * @param {Common.view.navigation.ViewSelector} this The ViewSelector instance
     */


    initialize: function() {
        var me = this;

        me.callParent();
        me.on({
            delegate: '> selectbutton',
            scope   : me,
            tap: 'onSelectButtonTapped'
        });
    },

    onSelectButtonTapped: function(button) {
        var me = this,
            displayViews = this.getDisplayViews();

        // Handle this event in a controller if you want to use the controller to
        // handle the display of your views.
        me.fireEvent('selected', me);

        if(displayViews) {
            me.doDisplayView(button);
        }

    },

    /**
     * Displays the view assigned to the Common.control.button.ViewSelection view property.
     * Uses default logic to determine how the view is displayed. Override this method to provide
     * application specific logic.
     * @param {Common.control.button.ViewSelection} button
     */
    doDisplayView:function(button) {
        var me = this,
                panelRecord = null,
                store = button.getStore(),
                storeCount = 0,
                viewXtype,
                isCreateView,
                panel,
                isDocumentSelect = button.getDocumentSelect();


        // The selection timer prevents the view selection button from registering
        // multiple taps. This ensures only one instance of the view is displayed.
        me.startChildViewSelectionTimer();
        if (!me.enableChildViewSelection) {
            return;
        }
        me.enableChildViewSelection = false;

        if(store) {
            storeCount = store.getCount();
        }

        if(storeCount === 0) {
            viewXtype = me.getButtonViewToDisplay(button, 'edit');
            isCreateView = true;
        } else {
            viewXtype = me.getButtonViewToDisplay(button, 'list');
            isCreateView = false;
        }

        var navView = this.getNavigationView();

        // We need to get the record containing the document data to pass it to
        // the document view.
        if(isDocumentSelect) {
            panel = me.up('formpanel');
            if(panel) {
                panelRecord = panel.getRecord();
            }
        }

        if(isDocumentSelect) {
            navView.push({
                xtype: viewXtype,
                isCreateView: isCreateView,
                record: panelRecord
            });
        } else {
            navView.push({
                xtype: viewXtype,
                isCreateView: isCreateView
            });
        }
    },

    applyNavigationView: function(config) {
        var navView = null;
        if(config) {
            navView = Ext.ComponentQuery.query(config)[0];
        }
        return navView;
    },

    applyRecord: function(record) {
        if(record) {
            this.updateDocumentFieldsBadgeText(record);
        }
        return record;
    },

    /**
     * @private
     * @param {Ext.data.Model} record The record containing the document data.
     */
    updateDocumentFieldsBadgeText:function(record) {
        var buttons = this.getItems().items;

        Ext.each(buttons, function(button) {
            if(button.getDocumentSelect()) {
                button.updateDocumentFieldBadgeText(record);
            }
        }, this);
    },

    /**
     * Starts the view selection timer. View selections are disabled until the
     * timer expires. This prevents the view from being displayed multiple times.
     */
    startChildViewSelectionTimer: function () {
        var me = this;
        setTimeout(function () {
            me.enableChildViewSelection = true;
        },1000);
    },

    /**
     * Returns the view to be displayed. A {@link Common.control.button.ViewSelection button} can define a
     * single view or a list view and edit view.
     * @param {Common.control.button.ViewSelection} button
     * @param {String/Object} viewType
     * @returns {String} The xtype of the view to be displayed
     */
    getButtonViewToDisplay: function(button, viewType) {
        var view = button.getView();

        // If the view is a string there is only one view defined for the button
        if(Ext.isString(view)) {
            return view;
        }

        if(Ext.isObject(view)) {
            if(view[viewType]) {
                return view[viewType];
            } else {
                return null;
            }
        }

        return null;
    }
});
