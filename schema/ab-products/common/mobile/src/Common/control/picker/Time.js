/**
 * A picker component that displays a Time Picker on the screen. The Time Picker has slots for hours and minutes
 * This component extends from {@link Ext.picker.Picker} and {@link Ext.Sheet} so it is a popup.
 *
 *     var timePicker = Ext.create('Common.controls.TimePicker');
 *     Ext.Viewport.add(timePicker);
 *     timePicker.show();
 */

Ext.define('Common.control.picker.Time', {
    extend: 'Ext.picker.Picker',

    xtype: 'timepicker',

    config: {
        /**
         * @cfg {Number} increment The number of minutes between each minute value in the list. Defaults
         *      to: 5
         */
        increment: 5,

        /**
         * @cfg {Number} minHours start value of hours
         */
        minHours: 0,

        /**
         * @cfg {Number} maxHours end value of hours.
         */
        maxHours: 23,

        /**
         * @cfg {String} hoursTitle title to show above hour slot Note: for titles to show set the {useTitle}
         *      config to true.
         */
        hoursTitle: LocaleManager.getLocalizedString('Hours', 'Common.control.picker.Time'),

        /**
         * @cfg {String} minutesTitle title to show above hour slot Note: for this to show set the {useTitle} config
         *      to true.
         */
        minutesTitle: LocaleManager.getLocalizedString('Minutes', 'Common.control.picker.Time'),

        /**
         * @cfg {boolean} slots show/hide title headers. Note: defaults to false (framework default
         *      'Ext.picker.Picker')
         */
        slots: [],

        // necessary for displaying the picker in modal add forms
        zIndex: 30
    },

    /**
     *
     * @param value
     * @param animated
     */
    setValue: function (value, animated) {
        var increment = this.getInitialConfig().increment,
            modulo;

        if (Ext.isDate(value)) {
            value = {
                hours: value.getHours(),
                minutes: value.getMinutes()
            };

            // Round minutes
            modulo = value.minutes % increment;
            if (modulo > 0) {
                value.minutes = Math.round(value.minutes / increment) * increment;
            }
        }

        this.callParent([ value, animated ]);
    },

    /**
     * @override
     * @returns {Date} A date object containing the selected hours and minutes. Year, month, day default
     *          to the current date..
     */
    getValue: function () {
        var value = this.callParent(arguments),
            date = new Date();

        value = new Date(date.getFullYear(), date.getMonth(), date.getDate(), value.hours, value.minutes);
        return value;
    },

    applySlots: function () {
        var me = this,
            hours = me.createHoursSlot(),
            minutes = me.createMinutesSlot();

        return [ hours, minutes ];
    },

    createHoursSlot: function () {
        var initialConfig = this.getInitialConfig(),
            title = initialConfig.hoursTitle,
            minHours = initialConfig.minHours,
            maxHours = initialConfig.maxHours,
            hours = [], slot, i, text;

        for (i = minHours; i <= maxHours; i++) {
            text = (i < 10) ? ('0' + i) : i; // Add leading zero
            hours.push({
                text: text,
                value: i
            });
        }

        slot = {
            name: 'hours',
            align: 'center',
            title: title,
            data: hours,
            flex: 1
        };

        return slot;
    },

    createMinutesSlot: function () {
        var initialConfig = this.getInitialConfig(),
            title = initialConfig.minutesTitle,
            increment = initialConfig.increment,
            minutes = [], slot, i, text;

        for (i = 0; i < 60; i += increment) {
            text = (i < 10) ? ('0' + i) : i; // Add leading zero
            minutes.push({
                text: text,
                value: i
            });
        }

        slot = {
            name: 'minutes',
            align: 'center',
            title: title,
            data: minutes,
            flex: 1
        };
        return slot;
    },

    onDoneButtonTap: function(button, e) {
        var oldValue = this._value,
            newValue = this.getValue(true);

        e.preventDefault();
        e.stopPropagation();

        if (newValue !== oldValue) {
            this.fireEvent('change', this, newValue);
        }

        this.hide();
    }
});