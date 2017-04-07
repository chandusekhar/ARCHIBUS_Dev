/**
 * A full screen calendar view
 */
Ext.define('Solutions.view.CalendarView', {
    extend: 'Ext.Container',

    requires: [
        'Common.control.Calendar',
        'Ext.Toast'
    ],

    config: {
        items: [
            {
                xtype: 'calendar',
                height: '100%'
            }
        ]
    },

    initialize: function() {
        var me = this,
            calendar = me.down('calendar');

        calendar.on('selectionchange', 'onDateSelected', me);
    },

    onDateSelected: function(calendar, newDate) {
        // Ext.Msg.alert interferes with the calendar view update on Windows Phone
        if(Ext.os.is.WindowsPhone) {
            setTimeout(function() {
                alert('Selected Date ' +  Ext.DateExtras.format(newDate, 'M d, Y'));
            }, 1000);
        } else {
            Ext.Msg.alert('Selected Date', Ext.DateExtras.format(newDate, 'M d, Y'));
        }
    }

});