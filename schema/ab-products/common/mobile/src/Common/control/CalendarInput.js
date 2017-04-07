Ext.define('Common.control.CalendarInput', {
    extend: 'Ext.field.Input',

    xtype: 'calendarinput',

    // Override the Ext.field.Input#getTemplate function. Add an arrow element to the input field.
    // @private
    getTemplate: function () {
        var items = [
            {
                reference: 'input',
                tag: this.tag
            },
            {
                reference: 'mask',
                classList: [this.config.maskCls]
            },
            {
                reference: 'clearIcon',
                cls: 'x-clear-icon'
            },
            {
                reference: 'calendarIcon',
                cls: 'ab-calendar-button'
            }
        ];

        return items;
    }


});
