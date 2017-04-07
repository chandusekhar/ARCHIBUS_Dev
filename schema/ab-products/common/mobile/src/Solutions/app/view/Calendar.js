Ext.define('Solutions.view.Calendar', {
    extend: 'Ext.Container',

    requires: 'Common.control.field.Calendar',

    config: {
        items: [
            {
                xtype: 'calendarfield',
                label: 'Calendar'
            }
        ]
    }

});