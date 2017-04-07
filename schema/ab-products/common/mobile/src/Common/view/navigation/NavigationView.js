/**
 * Provides a navigation framework that can be used for applying the familiar pattern of adding and updating items
 * contained in a list.
  * This class works with the {@link Common.view.navigation.NavigationBar}, {@link Common.view.navigation.EditBase} ,
 * {@link Common.view.navigation.ListBase} and {@link Common.controller.NavigationController} to provide a basic
 * navigation structure.
 * The {@link Common.controller.NavigationController} uses information contained in the displayed view configuration to
 * determine the action that should be taken on the currently displayed view. T
  * This class extends {@link Ext.navigation.View}. Use of the class is very similar to the {@link Ext.navigation.View}
 * with the exception that all views used with this class should extend either the
 * {@link Common.view.navigation.EditBase} or the {@link Common.view.navigation.ListBase} class.
 * Adding and removing views to the navigation view is accomplished using the push() and pop() functions. Pushing a view
 * displays the view and adds the view to the navigation view stack. Tapping the Back button automatically pops the view
 * from the navigation view stack and navigates back to the previous view.
 *
 * Views are automatically destroyed when popping them from the navigation view.
 *
 * @override Ext.navigation.View
 *
 * @author Jeff Martin
 * @since 21.1
 */

Ext.define('Common.view.navigation.NavigationView', {
    extend: 'Ext.navigation.View',

    requires: 'Common.view.navigation.NavigationBar',

    /**
     * Overrides the base implementation to allow us to use our custom Common.view.navigation.NavigationBar class.
     *
     * @override
     * @private
     * @param config
     * @return {*}
     */

    applyNavigationBar: function(config) {
        if (!config) {
            config = {
                hidden: true,
                docked: 'top'
            };
        }

        if (config.title) {
            delete config.title;
            //<debug>
            Ext.Logger.warn("Ext.navigation.View: The 'navigationBar' configuration does not accept a 'title' property. You " +
                "set the title of the navigationBar by giving this navigation view's children a 'title' property.");
            //</debug>
        }

        config.view = this;
        config.useTitleForBackButtonText = this.getUseTitleForBackButtonText();

        if (config.splitNavigation) {
            this.$titleContainer = this.add({
                docked: 'top',
                xtype: 'titlebar',
                ui: 'light',
                title: this.$currentTitle || ''
            });

            var containerConfig = (config.splitNavigation === true) ? {} : config.splitNavigation;

            this.$backButtonContainer = this.add(Ext.apply({
                xtype: 'toolbar',
                docked: 'bottom'
            }, containerConfig));

            this.$backButton = this.$backButtonContainer.add({
                xtype: 'button',
                text: 'Back',
                hidden: true,
                ui: 'back'
            });

            this.$backButton.on({
                scope: this,
                tap: this.onBackButtonTap
            });

            config = {
                hidden: true,
                docked: 'top'
            };
        }

        return Ext.factory(config, Common.view.navigation.NavigationBar, this.getNavigationBar());
    },


    /**
     * @override
     * We need to support the Home button;
     * For that, we need to keep in sync the NavigationView view stack with the NavigationBar 'viewStack' property
     *
     * @private
     * Calculates whether it needs to remove any items from the stack when you are popping more than 1
     * item. If it does, it removes those views from the stack and returns `true`.
     * @return {Boolean} `true` if it has removed views.
     */

    /* jshint maxstatements: 30 */
    beforePop: function (count) {
        var me = this,
            innerItems = me.getInnerItems(),
            toRemove,
            last,
            ln, i;

        if (Ext.isString(count) || Ext.isObject(count)) {
            last = innerItems.length - 1;

            for (i = last; i >= 0; i--) {
                if ((Ext.isString(count) && Ext.ComponentQuery.is(innerItems[i], count)) || (Ext.isObject(count) && count === innerItems[i])) {
                    count = last - i;
                    break;
                }
            }

            if (!Ext.isNumber(count)) {
                return false;
            }
        }

        ln = innerItems.length;

        //default to 1 pop
        if (!Ext.isNumber(count) || count < 1) {
            count = 1;
        }

        //check if we are trying to remove more items than we have
        count = Math.min(count, ln - 1);

        if (count) {
            //we need to reset the backButtonStack in the navigation bar
            me.getNavigationBar().beforePop(count);

            //get the items we need to remove from the view and remove theme
            toRemove = innerItems.splice(-count, count - 1);
            for (i = 0; i < toRemove.length; i++) {

                // Start override
                me.getNavigationBar().getViewStack().pop();
                // End override

                this.remove(toRemove[i]);
            }

            return true;
        }

        return false;
    },


    /**
     * @override
     * Override to check the validation of the model in the case when it is bound to an autoSync store
     *
     * Pushes a new view into this navigation view using the default animation that this view has.
     * @param {Object} view The view to push.
     * @return {Ext.Component} The new item you just pushed.
     */
    push: function (view) {
        // Start override
        if (this.hasValidModel()) {
            //End override

            return this.add(view);

            // Start override
        }
        // End override
    },

    /**
     * @override
     * Override to check the validation of the model in the case when it is binded to an autoSync store
     *
     * Removes the current active view from the stack and sets the previous view using the default animation
     * of this view. You can also pass a {@link Ext.ComponentQuery} selector to target what inner item to pop to.
     * @param {Number} count The number of views you want to pop.
     * @return {Ext.Component} The new active item.
     */
    pop: function (count) {
        // Start override
        if (this.hasValidModel()) {
            // End override

            if (this.beforePop(count)) {
                return this.doPop();
            }

            // Start override
        }
        // End override
    },

    /**
     * Checks if the view is a navigation edit view, its store is autoSynced, its model is not new record, it is modified and valid
     * If the conditions are not verified, displays errors and returns false; otherwise, returns true
     */
    hasValidModel: function () {
        var me = this,
            currentView = me.getNavigationBar().getCurrentView(),
            questionnairePanel = currentView.down('questionnaire');

        if (currentView.isNavigationEdit || questionnairePanel) {
            var store = currentView.isNavigationEdit ? Ext.getStore(currentView.getStoreId()) : currentView.getStore(),
                autoSync = store.getAutoSync(),
                isCarousel = !Ext.isEmpty(currentView.getXTypes()) && currentView.getXTypes().indexOf('swipecarousel') >= 0,
                formView = isCarousel ? currentView.getDisplayedView() : currentView,
                currentRecord = formView.getRecord();

            if (autoSync
                && !Ext.isEmpty(currentRecord)
                && !currentRecord.getIsErased()
                && !currentRecord.phantom) {

                if (currentRecord.isRecordModifiedAndNotValid()) {
                    formView.displayErrors(currentRecord);
                    return false;
                } else if (questionnairePanel
                    && currentRecord.get('mob_is_changed') === 1
                    && !questionnairePanel.validateRequiredFields()) {

                    // Check if the current view has a questionnaire embedded. If it does check if it is valid
                    // Stop the Back navigation if the questionnaire is not valid. Give the Questionnaire controller
                    // a chance to override the validation.
                    // For the arrow/swipe navigation the validation is handled in the Carousel view
                    return false;
                }
            }
        }

        return true;
    },

    initialize: function() {
        var navBar;
        this.callParent(arguments);

        // Add additional toolbar buttons to the main view.
        navBar = this.getNavigationBar();
        navBar.addToolBarButtons(this);

    }
});