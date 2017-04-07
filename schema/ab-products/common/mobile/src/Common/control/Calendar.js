Ext.define('Common.control.Calendar', {
    extend: 'Ext.carousel.Carousel',

    requires: 'Common.control.CalendarView',

    xtype: 'calendar',

    /**
     * @cfg {Boolean} enableSwipeNavigate True to allow the calendar's period to be change by swiping across it.
     */
    enableSwipeNavigate: true,

    /**
     * @cfg {Object} viewConfig A set of configuration options that will be applied to the TouchCalendarView component
     */
    viewConfig: {},

    config: {
        calendarConfig: {},
        indicator: false
    },

    defaultViewConfig: {
        viewMode: 'MONTH',
        weekStart: 1,
        bubbleEvents: ['selectionchange']
    },

    initialize: function () {
        var me = this;

        me.viewConfig = Ext.applyIf(me.getCalendarConfig() || {}, me.defaultViewConfig);

        me.viewConfig.currentDate = me.viewConfig.currentDate || me.viewConfig.value || new Date();

        me.viewMode = me.viewConfig.viewMode.toUpperCase();

        me.initViews();

        Ext.apply(me, {
            cls: 'touch-calendar',
            activeItem: (me.enableSwipeNavigate ? 1 : 0),
            direction: 'horizontal'
        });

        me.setActiveItem(1); // for some reason, activeItem: 1 is not being applied unless explicitly set.

        me.on('selectionchange', me.onSelectionChange);
        me.on('activeitemchange', me.onActiveItemChange);

        if (me.enableSwipeNavigate) {
            // Bind the required listeners
            me.on(me.element, {
                drag: me.onDrag,
                dragThreshold: 5,
                dragend: me.onDragEnd,
                direction: me.direction,
                scope: me
            });

            me.element.addCls(me.baseCls + '-' + me.direction);
        }
    },

    /**
     * Builds the necessary configuration object for the creation of the TouchCalendarView.
     * @param {Date} viewValue The date Value that the new TouchCalendarView will have
     * @method
     * @private
     * @return {Object} The new config object for the view
     */
    getViewConfig: function (viewValue) {
        var plugins = [];

        Ext.apply(this.viewConfig, {
            plugins: plugins,
            currentDate: viewValue,
            onTableHeaderTap: Ext.bind(this.onTableHeaderTap, this)
        });

        return this.viewConfig;
    },

    getViewDate: function (date, i) {
        return Ext.Date.add(date, Ext.Date.MONTH, i);
    },

    /**
     * Creates all the TouchCalendarView instances needed for the Calendar
     * @method
     * @private
     * @return {void}
     */
    initViews: function () {
        var items = [],
            origCurrentDate = Ext.Date.clone(this.viewConfig.currentDate),
            viewValue;

        // first out of view
        viewValue = this.getViewDate(origCurrentDate, -1);

        items.push(
            new Common.control.CalendarView(Ext.applyIf({
                currentDate: viewValue
            }, this.getViewConfig(viewValue)))
        );

        // active view
        items.push(
            new Common.control.CalendarView(this.getViewConfig(origCurrentDate))
        );

        // second out of view (i.e. third)
        viewValue = this.getViewDate(origCurrentDate, 1);
        items.push(
            new Common.control.CalendarView(Ext.applyIf({
                currentDate: viewValue
            }, this.getViewConfig(viewValue)))
        );

        this.setItems(items);
        this.view = items[(this.enableSwipeNavigate ? 1 : 0)];
    },

    /**
     * Override for the TouchCalendarView's onTableHeaderTap method which is executed when the view's header (specificly the arrows) is tapped.
     * When using the TouchCalendar wrapper we must intercept it and use the carousel's prev/next methods to do the switching.
     */
    onTableHeaderTap: function (e, el) {
        el = Ext.fly(el);

        if (el.hasCls(this.view.getPrevPeriodCls()) || el.hasCls(this.view.getNextPeriodCls())) {
            this[(el.hasCls(this.view.getPrevPeriodCls()) ? 'previous' : 'next')]();
        }
    },

    /**
     * Changes the mode of the calendar to the specified string's value. Possible values are 'month', 'week' and 'day'.
     * @method
     * @returns {void}
     */
    setMode: function (mode) {
        this.viewMode = mode.toUpperCase();
        this.viewConfig.viewMode = this.viewMode;

        this.getItems().each(function (view, index) {

            view.currentDate = this.getViewDate(Ext.Date.clone(this.view.currentDate), index - 1);

            view.setViewMode(mode, true);
            view.refresh();
        }, this);
    },

    /**
     * Returns the Date that is selected.
     * @method
     * @returns {Date} The selected date
     */
    getValue: function () {
        var selectedDates = this.view.getSelectionModel().selected;

        return (selectedDates.getCount() > 0) ? selectedDates.first().get('date') : null;
    },

    /**
     * Set selected date.
     * @method
     * @param {Date} v Date to select.
     * @return {void}
     */
    setValue: function (v) {
        this.view.setValue(v);
    },

    /**
     * Override of the onCardSwitch method which adds a new card to the end/beginning of the carousel depending on the direction configured with the next period's
     * dates.
     * @method
     * @private
     */
    onActiveItemChange: function (container, newCard, oldCard) {
        var me = this,
            items,
            newIndex,
            newCalendar,
            oldCalendar,
            oldIndex,
            direction;

        if (me.enableSwipeNavigate) {
            items = me.getItems();
            newIndex = items.indexOf(newCard);
            oldIndex = items.indexOf(oldCard);
            direction = (newIndex > oldIndex) ? 'forward' : 'backward';


            me.counter = (me.counter || 0) + 1;

            if (direction === 'forward') {
                oldCalendar = items.get(0);
                //oldCalendar.un('onSelectionChange');
                me.remove(oldCalendar);
                newCalendar = new Common.control.CalendarView(me.getViewConfig(Ext.Date.add(newCard.currentDate, Ext.Date[me.viewMode], 1)));
                //newCalendar.on('selectionchange', 'onSelectionChange', me);
                me.add(newCalendar);
            }
            else {
                oldCalendar = items.get(items.getCount() - 1);
                //oldCalendar.un('onSelectionChange');
                me.remove(oldCalendar);
                newCalendar = new Common.control.CalendarView(me.getViewConfig(Ext.Date.add(newCard.currentDate, Ext.Date[me.viewMode], -1)));
                //newCalendar.on('selectionchange', 'onSelectionChange', me);
                me.insert(0, newCalendar);
            }

            me.view = newCard;
        }
    }
});
