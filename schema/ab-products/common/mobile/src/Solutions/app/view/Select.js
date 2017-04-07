Ext.define('Solutions.view.Select', {
    extend: 'Ext.Container',

    config: {
        items: [
            {
                label: 'Items',
                xtype: 'selectlistfield',
                name: 'exampleSortField',
                isSortField: true,
                options: [
                    {text: 'First Option',  value: 'first'},
                    {text: 'Second Option', value: 'second'},
                    {text: 'Third Option',  value: 'third'}
                ]
            }
        ]
    }
});