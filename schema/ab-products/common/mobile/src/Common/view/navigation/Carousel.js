/**
 * A container that provides Previous and Next navigation. The Previous and Next actions can be invoked
 * by swiping horizontally.
 *
 * The Carousel class can be incorporated into the ARCHIBUS Navigation Controller
 * {@link Common.controller.NavigationController} like any other {@link Common.view.navigation.EditBase} class
 *
 * Example: The TaskCarousel class declaration from the Asset and Equipment Survey app.
 *
 *     Ext.define('AssetAndEquipmentSurvey.view.TaskCarousel', {
 *         extend: 'Common.view.navigation.Carousel',
 *
 *         xtype: 'taskcarousel',
 *
 *         config: {
 *             // The edit view
 *             view: 'AssetAndEquipmentSurvey.view.Task',
 *
 *             // The store containing the list of items to edit
 *             store: 'surveyTasksStore'
 *         }
 *     });
 *
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Common.view.navigation.Carousel', {
    extend: 'Ext.carousel.Carousel',

    xtype: 'swipecarousel',

    requires: 'Common.view.navigation.CarouselIndicator',

    isSwipeCarousel: true,

    /**
     * @property {Boolean} preventViewChange A flag used to prevent the view from changing before the slide
     * animiation is completed.
     * @private
     */
    preventViewChange: false,

    /**
     * @property {Boolean} ignoreButtonTap A flag used to handle multi tap on left/right navigation buttons and
     * prevent starting the procesing of a new view while displaying the current one it is not done yet.
     * @private
     */
    ignoreButtonTap: false,

    config: {

        /**
         * @cfg {String} title The contained view title. The title is displayed on the Navigation Bar. The
         * title configuration is set using the title from the view property. It is generally not required
         * to manually set this property.
         */
        title: '',

        /**
         * @cfg {Array} toolBarButtons A copy of the view toolBarButtons configuration. This configuration is set
         * if the configured view contains a toolBarButtons configuration. It is generally not required to set
         * this property.
         */
        toolBarButtons: [],

        /**
         * @cfg {Ext.data.Store} store The store containing the list of items to be paged.
         * The {@link Common.view.navigation.Carousel} class will manage displaying the items in the store.
         */
        store: null,

        /**
         * @cfg {Common.view.navigation.EditBase} view The view displayed in the container. This is usually
         * a view that extends the {@link Common.view.navigation.EditBase} class.
         */
        view: null,

        /**
         * @cfg {Number} viewIndex The index of the displayed view. The viewIndex corresponds to the
         * index of the view record in the store.
         */
        viewIndex: 0,

        // display Common.view.navigation.CarouselIndicator indicator
        indicator: true
    },

    /**
     * @event viewchanged Fired when the view is changed.
     * @param {String} previousOrNext Indicates the button or swipe direction. Values are either previous or next.
     * @param {Common.view.navigation.Carousel} this The carousel instance.
     */

    /**
     * Overwirte applyRecord to set view index, initialize carousel views and hook activeitemchange event.
     * @param record
     * @returns record
     */
    applyRecord: function (record) {
        var me = this,
            view = me.getView(),
            store = me.getStore(),
            index;

        if (record && view) {
            view.setRecord(record);
            // Get the store index of the record
            if (store) {
                index = store.findExact('id', record.getId());
                me.setViewIndex(index);

                // create the initial views (previous, current and next views)
                me.initViews();

                me.on('activeitemchange', me.onActiveItemChange);
            }
        }

        return record;
    },

    applyView: function (view) {
        if (Ext.isString(view)) {
            view = Ext.create(view);
        }

        // Check if the Carousel view has a toolBarButtons config
        this.cloneToolBarButtons(view);
        this.cloneViewTitle(view);

        return view;
    },

    cloneToolBarButtons: function (view) {
        if (Ext.isFunction(view.getToolBarButtons)) {
            this.setToolBarButtons(view.getToolBarButtons());
        }
    },

    cloneViewTitle: function (view) {
        if (Ext.isFunction(view.getTitle)) {
            this.setTitle(view.getTitle());
        }
    },

    updateView: function (newView, oldView) {
        var viewContainer = this.down('#viewcontainer');

        if (newView && viewContainer) {
            viewContainer.add(newView);
        }
        if (oldView && viewContainer) {
            viewContainer.remove(oldView);
        }
    },

    applyStore: function (store) {
        if (store) {
            store = Ext.data.StoreManager.lookup(store);
        }

        return store;
    },

    initialize: function () {
        var me = this,
            previousButton,
            nextButton;

        me.callParent(arguments);

        // Bind the required listeners
        me.on(me.element, {
            drag: me.onDrag,
            dragThreshold: 5,
            dragstart: me.onDragStart,
            dragend: me.onDragEnd,
            direction: me.direction,
            scope: me
        });

        me.element.addCls(me.baseCls + '-' + me.direction);

        previousButton = this.down('#previousButton');
        nextButton = this.down('#nextButton');

        previousButton.on('tap', this.onPreviousButtonTapped, this);
        nextButton.on('tap', this.onNextButtonTapped, this);
    },

    /**
     * Creates all the view instances needed
     * @method
     * @private
     * @return {void}
     */
    initViews: function () {
        var me = this,
            items = [],
            currentView,
            previousView,
            nextView,
            activeItem = 1;

        // first out of view
        previousView = me.getPreviousView();
        if (Ext.isEmpty(previousView)) {
            // when the first record is displayed the previous view does not exist and 0 is the index of the current view that needs to be active
            activeItem = 0;
        } else {
            items.push(previousView);
        }

        // active view
        currentView = me.getCurrentView();
        items.push(currentView);

        // second out of view (i.e. third)
        nextView = me.getNextView();
        if (!Ext.isEmpty(nextView)) {
            items.push(nextView);
        }

        me.setItems(items);
        me.view = items[activeItem];

        me.setActiveItem(activeItem);

        me.doUpdateCurrentRecordDisplay();
    },

    applyIndicator: function (indicator, currentIndicator) {
        return Ext.factory(indicator, Common.view.navigation.CarouselIndicator, currentIndicator);
    },

    /**
     * Create current, previous or next view for the indicated index.
     * @param index index corresponds to the index of the view record in the store.
     * @returns {*}
     */
    getViewForIndex: function (index) {
        var viewClass = this.getView().$className,
            view,
            panel,
            store = this.getStore(),
            record,
            currentIndex = this.getViewIndex(),
            indicatorId;

        if (index >= 0 && index < store.getTotalCount()) {
            panel = Ext.create(viewClass);
            record = store.getAt(index);
            panel.setRecord(record);

            if (currentIndex === index) {
                indicatorId = 'currentRecord';
            } else if (currentIndex < index) {
                indicatorId = 'nextRecord';
            } else {
                indicatorId = 'previousRecord';
            }

            view = Ext.create('Ext.Container', {
                layout: 'vbox',
                items: [
                    {
                        xtype: 'container',
                        itemId: 'viewcontainer',
                        layout: {
                            type: 'card',
                            animation: {
                                duration: 300,
                                easing: 'ease-out',
                                type: 'slide',
                                direction: 'left'
                            }
                        },
                        flex: 1
                    }
                ]
            });

            view.down('#viewcontainer').add(panel);
        }

        return view;
    },

    getCurrentView: function () {
        var index = this.getViewIndex();

        return this.getViewForIndex(index);
    },

    getPreviousView: function () {
        var index = this.getViewIndex() - 1;

        return this.getViewForIndex(index);
    },

    getPrePreviousView: function () {
        var index = this.getViewIndex() - 2;

        return this.getViewForIndex(index);
    },

    getNextView: function () {
        var index = this.getViewIndex() + 1;

        return this.getViewForIndex(index);
    },

    getNextNextView: function () {
        var index = this.getViewIndex() + 2;

        return this.getViewForIndex(index);
    },

    onDragStart: function () {
        // Validate the current record before displaying a new view.
        // Do not swipe to the next/previous view if the current record is not valid.
        if (this.hasValidModel()) {
            this.callParent(arguments);
        }
    },

    /**
     * Handle tap on the previous navigation button.
     */
    onPreviousButtonTapped: function () {
        if (this.ignoreButtonTap) {
            return;
        }

        if (this.getViewIndex() === 0) {
            this.doUpdateButtonState();
            return;
        }

        // Validate the current record before displaying a new view.
        // Do not swipe to the next/previous view if the current record is not valid.
        if (this.hasValidModel()) {
            this.ignoreButtonTap = true;
            this.previous();
        }
    },

    /**
     * Handle tap on the next navigation button.
     */
    onNextButtonTapped: function () {
        var store = this.getStore();

        if (this.ignoreButtonTap) {
            return;
        }

        if (this.getViewIndex() === store.getTotalCount() - 1) {
            this.doUpdateButtonState();
            return;
        }

        // Validate the current record before displaying a new view.
        // Do not swipe to the next/previous view if the current record is not valid.
        if (this.hasValidModel()) {
            this.ignoreButtonTap = true;
            this.next();
        }
    },

    /**
     * Handle the event of changing the active item by horizontal swipe or by tap on left/right navigation buttons.
     * Determine the direction and display the next or the previous view accordingly.
     * @param container
     * @param newCard
     * @param oldCard
     */
    onActiveItemChange: function (container, newCard, oldCard) {
        var me = this,
            items,
            newIndex,
            oldIndex,
            direction;

        if (Ext.isEmpty(oldCard)) {
            return;
        }

        items = me.getInnerItems();
        newIndex = items.indexOf(newCard);
        oldIndex = items.indexOf(oldCard);
        direction = (newIndex > oldIndex) ? 'forward' : 'backward';

        if (direction === 'forward') {
            me.displayNextView();
        }
        else {
            me.displayPreviousView();
        }

        me.view = newCard;
    },

    displayPreviousView: function () {
        var me = this,
            previousIndex = me.getViewIndex() - 1,
            previousRecord = me.getStore().getAt(previousIndex);

        if (me.preventViewChange) {
            setTimeout(function () {
                if (me.preventViewChange) {
                    return;
                }
            }, 1000);
        }

        me.setItemsForPreviousView();

        if (previousRecord) {
            me.doChangeView(previousRecord, previousIndex, 'right');
        }
    },

    /**
     * Set the view instances coresponding to the previous view that becomes the current view.
     */
    setItemsForPreviousView: function () {
        var me = this,
            items,
            oldView,
            newView;

        items = me.getInnerItems();
        oldView = items[items.length - 1];

        // when the last record is displayed the next view does not exist and there is no need to remove a view from the items list
        if (items.length > 2) {
            me.remove(oldView);
        }

        newView = this.getPrePreviousView();
        if (newView) {
            me.insert(0, newView);
        }

    },

    displayNextView: function () {
        var me = this,
            nextIndex = me.getViewIndex() + 1,
            store = me.getStore(),
            nextRecord = store.getAt(nextIndex);

        if (me.preventViewChange) {
            setTimeout(function () {
                if (me.preventViewChange) {
                    return;
                }
            }, 1000);
        }

        me.setItemsForNextView();

        if (nextRecord) {
            me.doChangeView(nextRecord, nextIndex, 'left');
        } else {
            // Record is null. We are either at the end of the store data or at the end of the current page
            // Check if the store has a next page
            if (me.storeHasNextPage(store)) {
                store.nextPage({
                    addRecords: true, callback: function () {
                        nextRecord = store.getAt(nextIndex);
                        me.doChangeView(nextRecord, nextIndex, 'left');
                    }, scope: me
                });
            }
        }
    },

    /**
     * Set the view instances coresponding to the next view that becomes the current view.
     */
    setItemsForNextView: function () {
        var me = this,
            items,
            oldView,
            newView;

        items = me.getInnerItems();
        oldView = items[0];

        // when the first record is displayed the previous view does not exist and there is no need to remove a view from the items list
        if (items.length > 2) {
            me.remove(oldView);
        }

        newView = me.getNextNextView();
        if (newView) {
            me.add(newView);
        }
    },

    doChangeView: function (record, nextIndex, direction) {
        var me = this,
            viewClass = me.getView().$className,
            nextView = Ext.create(viewClass);

        // Prevent views from being changed too quickly. Allow the animation to display.
        me.preventViewChange = true;
        //me.disablePreviousAndNextButtons(true);
        me.fireEvent('viewischanging', nextView, record, me);
        setTimeout(function () {
            me.doUpdateButtonState();
            me.doNotifyChange(direction);
            me.preventViewChange = false;
        }, 700);

        // Update the Carousel record without triggering the apply and update methods
        me._record = record;

        me.setViewIndex(nextIndex);

        me.doUpdateCurrentRecordDisplay();

    },

    /**
     * Checks if the view's store is autoSynced, its model is not new record, it is modified and valid
     * If the conditions are not verified, displays errors and returns false; otherwise, returns true
     */
    hasValidModel: function () {
        var me = this,
            store = me.getStore(),
            autoSync = store.getAutoSync(),
            formView = me.getDisplayedView(),
            questionnairePanel = formView.down('questionnaire'),
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

                return false;
            }
        }

        return true;
    },

    doUpdateCurrentRecordDisplay: function () {
        var me = this,
            store = me.getStore(),
            index = me.getViewIndex(),
            currentRecordContainer = me.down('#currentRecord'),
            text = LocaleManager.getLocalizedString('{0} of {1}', 'Common.view.navigation.Carousel');

        if (currentRecordContainer) {
            //increment index to display user-friendly values: 1 to x instead of 0 to x
            currentRecordContainer.setHtml(Ext.String.format(text, index + 1, store.getTotalCount()));
        }
    },

    /**
     * Disable the previous navigation button when the first record is displayed and disable the next navigation button when the last record is displayed.
     */
    doUpdateButtonState: function () {
        var me = this,
            previousButton = me.down('#previousButton'),
            nextButton = me.down('#nextButton'),
            index = me.getViewIndex(),
            store = me.getStore();

        if (previousButton) {
            previousButton.setDisabled(index === 0);
        }

        if (nextButton) {
            nextButton.setDisabled(index === store.getTotalCount() - 1);
        }

        this.ignoreButtonTap = false;
    },

    doNotifyChange: function (direction) {
        var me = this,
            previousOrNext = direction === 'left' ? 'next' : 'previous';

        me.fireEvent('viewchanged', previousOrNext, me);
    },

    disablePreviousAndNextButtons: function (disable) {
        var previousButton = this.down('#previousButton'),
            nextButton = this.down('#nextButton');

        nextButton.setDisabled(disable);
        previousButton.setDisabled(disable);
    },

    storeHasNextPage: function (store) {
        var numberOfPages = Math.ceil(store.getTotalCount() / store.getPageSize());
        return store.currentPage < numberOfPages;
    },

    getDisplayedView: function () {
        var viewContainer = this.getViewContainer(),
            formView;

        if (viewContainer && viewContainer.getItems().length > 0) {
            formView = viewContainer.getItems().get(0);
        }

        return formView;
    },

    getViewContainer: function () {
        var items = this.getInnerItems(),
            activeIndex = this.getActiveIndex(),
            view = items[activeIndex],
            viewContainer;

        if (view) {
            viewContainer = view.down('#viewcontainer');
        }

        return viewContainer;
    }

});