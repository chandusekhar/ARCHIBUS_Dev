/**
 * Provides the toolbar view used in the {@link Common.navigation.NavigationView} class.
 * The NavigationBar class provides a Back button and either an Add or Save button depending on the displayed views
 * configuration. The NavigationBar class displays the Add button if the displayed view extends the
 * {@link Common.navigation.ListBase} class. The Save button is shown if the displayed view extends from the
 * {@link Common.navigation.EditBase} class.
 *
 *
 * @override Ext.navigation.Bar
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.view.navigation.NavigationBar', {
    extend: 'Ext.navigation.Bar',

    xtype: 'navigationbar',

    config: {

        addButton: {
            align: 'right',
            iconCls: 'add',
            hidden: true,
            style: '-webkit-box-ordinal-group:3'
        },

        saveButton: {
            align: 'right',
            iconCls: Ext.os.is.Phone ? 'disk' : '',
            cls: Ext.os.is.Phone ? 'ab-icon-action' : '',
            ui: Ext.os.is.Phone ? '' : 'action',
            text: Ext.os.is.Phone ? '' : LocaleManager.getLocalizedString('Save', 'Common.view.navigation.NavigationBar'),
            hidden: true,
            itemId: 'navBarSaveButton',
            style: '-webkit-box-ordinal-group:2'
        },

        /**
         * @cfg viewStack Stores the views loaded in the NavigationView. Views are added and removed from the viewStack
         *      as they are added and removed to the navigation view.
         */
        viewStack: [],

        /**
         * @cfg {Boolean} showSaveButton Indicates if the Show or Add button should be displayed. The Save button is
         *      displayed when true. The Add button is displayed when false. Both buttons are hidden when the value is
         *      null
         */
        showSaveButton: false,

        /**
         * @cfg {Boolean} Hides both the Add and Save buttons when true.
         */
        hideSaveButtons: false,

        /**
         * @cfg {Boolean} When true and useTitleForBackButtonText is false the work 'Back' is displayed along
         * with the Back button arrow
         */
        displayBackButtonText: false,

        cls: 'ab-titlebar',

        /**
         * @cfg {Boolean} Dispays the ARCHIBUS logo in the center of the title bar when true
         */
        displayLogo: true
    },

    /**
     * Sets the display of the Add or Save button when the showSaveButton property is changed.
     *
     * @param {Boolean/null}  newShowSaveButton The Save button is displayed when True. The Add button is displayed when False. Both
     *            buttons are hidden when the value is null.
     */
    updateShowSaveButton: function (newShowSaveButton) {
        var hideSaveButtons = this.getHideSaveButtons();

        if (newShowSaveButton === null || hideSaveButtons === true) {
            // TODO: fix this Hack...
            var currentView = this.getCurrentView();
            if (currentView.xtype === 'roomSurveyPanel') {
                this.getSaveButton().show();
                this.getAddButton().hide();
            } else {
                this.getSaveButton().hide();
                this.getAddButton().hide();
            }
            return;
        }

        if (newShowSaveButton) {
            this.getSaveButton().show();
            this.getAddButton().hide();
        } else {
            this.getSaveButton().hide();
            this.getAddButton().show();
        }
    },

    /**
     * Hides both the Add and Save buttons if the hideSaveButtons config
     * is set to true.
     * @param newHideButton
     */
    updateHideSaveButtons: function (newHideButton) {
        if (newHideButton) {
            this.getSaveButton().hide();
            this.getAddButton().hide();
        }
    },

    applySaveButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getSaveButton());
    },

    updateSaveButton: function (newSaveButton, oldSaveButton) {
        if (oldSaveButton) {
            this.remove(oldSaveButton);
        }

        if (newSaveButton) {
            this.add(newSaveButton);

            newSaveButton.on({
                scope: this,
                tap: this.onSaveButtonTap
            });
        }
    },

    applyAddButton: function (config) {
        return Ext.factory(config, Ext.Button, this.getAddButton());
    },

    updateAddButton: function (newAddButton, oldAddButton) {
        if (oldAddButton) {
            this.remove(oldAddButton);
        }

        if (newAddButton) {
            this.add(newAddButton);
            newAddButton.on({
                scope: this,
                tap: this.onAddButtonTap
            });
        }
    },

    applyTitle: function (title) {

        // Check if there is a TitlePanel
        var titlePanel = Ext.ComponentQuery.query('titlepanel');
        if (titlePanel[0]) {
            titlePanel[0].setTitle(title);
        }
        return '';
    },

    applyDisplayLogo: function(config) {
        var me = this,
            titleComponent = me.down('title');
        if(config) {
            titleComponent.addCls('ab-titlebar-logo');
        } else {
            titleComponent.removeCls('ab-titlebar-logo');
        }
        return config;
    },

    onSaveButtonTap: function () {
        var me = this,
            currentView = me.getCurrentView();

        me.fireEvent('save', currentView, this);
    },

    onAddButtonTap: function () {
        var me = this,
            currentView = me.getCurrentView();

        me.fireEvent('add', currentView, this);
    },

    /**
     * Added viewStack handling
     * @private
     * @override
     */
    onViewAdd: function (view, item) {
        var me = this,
            backButtonStack = me.backButtonStack, hasPrevious, title;

        me.endAnimation();

        //Start override

        // Push the new view on the stack and set
        // the Add or Save button.
        me.getViewStack().push(item);

        // Display the Add or Save button
        me.setShowSaveButton(this.getDisplayShowButton(item));

        me.removeToolBarButtons();
        me.addToolBarButtons(item);

        // End override

        title = (item.getTitle) ? item.getTitle() : item.config.title;

        backButtonStack.push(title || '&nbsp;');
        hasPrevious = backButtonStack.length > 1;

        me.doChangeView(view, hasPrevious, false);
    },

    /**
     * Added viewStack handling
     * @private
     * @override
     */
    onViewRemove: function (view) {
        var me = this,
            backButtonStack = me.backButtonStack,
            hasPrevious,
            viewStack,
            viewToShow;

        me.endAnimation();
        backButtonStack.pop();
        hasPrevious = backButtonStack.length > 1;

        //Start override

        // Remove the view from the view stack and
        // set the Add or Save button.
        viewStack = me.getViewStack();
        viewStack.pop();

        me.removeToolBarButtons();

        viewToShow = viewStack.length > 0 ? viewStack[viewStack.length - 1] : view;

        me.setShowSaveButton(me.getDisplayShowButton(viewToShow));
        me.addToolBarButtons(viewToShow);

        // End override

        me.doChangeView(view, hasPrevious, true);
    },

    /**
     * Returns the text needed for the current back button at anytime.
     * Override to allow the Back text to be localized
     * @private
     * @override
     */

    getBackButtonText: function () {
        var text = this.backButtonStack[this.backButtonStack.length - 2],
            useTitleForBackButtonText = this.getUseTitleForBackButtonText();

        if (!useTitleForBackButtonText) {
            if (text) {
                if(this.getDisplayBackButtonText()) {
                    text = LocaleManager.getLocalizedString('Back', 'Common.view.navigation.NavigationBar');
                } else {
                    text = '';
                }
            }
        }
        return text;
    },


    /**
     * Returns false if the view is a Navigation List view, true if it is an Edit view.
     *
     * @param {Object} view
     * @return {Boolean}
     */
    getDisplayShowButton: function (view) {
        if (view.isNavigationList || view.isNavigationEdit) {
            return !view.isNavigationList;
        } else {
            return null;
        }
    },

    /**
     * Returns the current displayed view
     *
     * @return {Ext.Container}
     */
    getCurrentView: function () {
        var viewStack = this.getViewStack();
        if (viewStack.length > 0) {
            return viewStack[viewStack.length - 1];
        } else {
            // return main view...
            return this.getView();
        }
    },

    /**
     * Adds buttons to the toolbar that are defined in the views toolBarButtons
     * configuration
     * @param {Common.view.NavigationView} view
     */
    addToolBarButtons: function (view) {
        var toolBarButtons,
            viewType;

        // Check if the view has any toolbar buttons defined
        if (typeof view.getToolBarButtons !== 'function') {
            return;
        }

        toolBarButtons = view.getToolBarButtons();

        if (!toolBarButtons) {
            return;
        }

        // Check if this is a create or update view
        if (typeof view.getIsCreateView === 'function') {
            viewType = view.getIsCreateView() ? 'create' : 'update';
        } else {
            viewType = 'all';
        }

        // Add the buttons
        Ext.each(toolBarButtons, function (button) {
            var toolBarButton = Ext.factory(button, 'Common.control.button.Toolbar'),
                displayOn = toolBarButton.getDisplayOn();

            if (displayOn === 'all' || viewType === displayOn) {
                this.add(toolBarButton);
            }
        }, this);
    },

    removeToolBarButtons: function () {
        var me = this,
            buttons = me.query('toolbarbutton');
        Ext.each(buttons, function (button) {
            me.remove(button, true);
        }, me);
    }

});