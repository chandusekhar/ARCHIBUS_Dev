Ext.define('Common.control.field.Calendar', {
    extend:'Common.control.Text',

    requires: [
        'Common.control.CalendarInput',
        'Common.control.Calendar'
    ],

    xtype:'calendarfield',

    calendarPanel: null,

    config: {
        dateFormat: LocaleManager.getLocalizedDateFormat(),
        
        /**
         * @cfg {Object} component
         * @accessor
         * @hide
         */
        component: {
            xtype: 'calendarinput'
        }
     },

    initialize: function() {
        var me = this,
            component;

        me.callParent();

        me.element.addCls('ab-calendar-clearicon');
        component = me.getComponent();
        component.calendarIcon.on('tap', 'onCalendarTap', me);

        // Always set the text input DOM element to readOnly to prevent text entry in the Calendar field
        component.setReadOnly(true);
    },

    applyValue: function(value) {
        if (!Ext.isDate(value) && !Ext.isObject(value)) {
            return null;
        }

        if (Ext.isObject(value)) {
            return new Date(value.year, value.month - 1, value.day);
        }

        return value;
    },

    updateValue: function(newValue) {
        var me = this,
            valueValid = newValue !== undefined && newValue !== null && newValue !== "";

        if (me.calendarPanel) {
            me.calendarPanel.down('calendar').value = newValue;
        }

        // Ext.Date.format expects a Date
        if (newValue !== null) {
            me.getComponent().setValue(Ext.Date.format(newValue, me.getDateFormat() || Ext.util.Format.defaultDateFormat));
        } else {
            me.getComponent().setValue('');
        }

        me[valueValid && me.isDirty() ? 'showClearIcon' : 'hideClearIcon']();

        me.syncEmptyCls();
    },

    getValue: function() {
        this.syncEmptyCls();
        return this._value;
    },

    // @private
    // Override to manage the display of calendar icon
    updateReadOnly: function(newReadOnly) {
        var me = this,
            component = me.getComponent();

        if (newReadOnly) {
            this.hideClearIcon();
            component.calendarIcon.addCls('ab-calendar-button-hide');
            component.calendarIcon.removeCls('ab-calendar-button-show');
            component.addCls('ab-readonly');
        } else {
            this.showClearIcon();
            component.calendarIcon.removeCls('ab-calendar-button-hide');
            component.calendarIcon.addCls('ab-calendar-button-show');
            component.removeCls('ab-readonly');
        }
    },

    onCalendarTap: function() {
        var me = this,
            calendarPanel = me.getCalendarPanel(),
            currentValue = me.getValue();

        if (!calendarPanel.getParent()) {
            Ext.Viewport.add(calendarPanel);
        }

        if(currentValue) {
            calendarPanel.down('calendar').value = currentValue;
        }

        calendarPanel.show();
    },

    onChange: function(input, value, startValue) {
        // The CalendarInput value is the text representation of the Date. The
        // Calendar field value is a Date object
        input.fireEvent('change', this, this.getValue(), startValue);
    },


    getCalendarPanel: function() {
        var me = this;

        if(!me.calendarPanel) {
            me.calendarPanel = Ext.create('Ext.Container', {
                width: '100%',
                height: '100%',
                zIndex: 20,
                items: [
                    {
                        xtype: 'titlebar',
                        title: me.getLabel(),
                        items: {
                            xtype: 'button',
                            align: 'right',
                            iconCls: 'delete'
                        }
                    },
                    {
                       xtype: 'calendar',
                        calendarConfig: {
                            value: me.getValue() || new Date()
                        },
                        weekStart: 1,
                        height: '100%'
                    }
                ]
            });

            me.calendarPanel.on('selectionchange', 'onSelectionChange', me);
            me.calendarPanel.down('button').on('tap', 'onClosePanel', me);
        }

        return me.calendarPanel;
    },

    onSelectionChange: function(calendarView, newDate) {
        var me = this;

        me.setValue(newDate);
        me.onClosePanel();
    },

    onClosePanel: function() {
        var me = this;
        me.calendarPanel.hide();
        me.calendarPanel.destroy();
        me.calendarPanel = null;
    },

    // @private
    /**
     * Override to allow the clear icon to be displayed with the textfield component set to
     * read only
     * @override
     * @returns {calendarfield}
     */
    showClearIcon: function() {
        var me         = this,
            value      = me.getValue(),
        // allows value to be zero but not undefined or null (other falsey values)
            valueValid = value !== undefined && value !== null && value !== "";

        if (me.getClearIcon() && !me.getDisabled()  && valueValid) {
            me.element.addCls(Ext.baseCSSPrefix + 'field-clearable');
        }

        return me;
    }
});