/**
 * A full screen calendar view
 */
Ext.define('MaterialInventory.view.CalendarView', {
    extend: 'Ext.Container',

    requires: 'Common.control.Calendar',

    xtype: 'inventoryDateCalendar',

    config: {
        items: [
            {
                xtype: 'calendar',
                height: '100%'
            },
            {
                xtype: 'titlebar',
                docked: 'top',
                title: LocaleManager.getLocalizedString('Inventory Start Date', 'MaterialInventory.view.CalendarView'),
                items: [
                    {
                        xtype: 'button',
                        text: LocaleManager.getLocalizedString('Cancel',
                            'MaterialInventory.view.CalendarView'),
                        action: 'cancelCalendar',
                        align: 'left'
                    }
                ]
            }
        ]
    }

});