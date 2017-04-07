Ext.define('Solutions.view.PromptFriendlyValues', {
    extend: 'Ext.Container',

    requires: ['Common.control.prompt.BuildingFriendlyValues',
        'Common.control.prompt.FloorFriendlyValues',
        'Common.control.prompt.RoomFriendlyValues'],

    config: {
        items: [
            {
                xtype: 'fieldset',
                title: 'Display building, floor and room names instead of their codes that might not be meanigful for the user.',
                instructions: 'When the friendly value is not available (e.g. room name might be not defined), the code value is displayed.',
                items: [
                    {
                        //in app.js file add 'Common.store.Buildings' in the stores array
                        xtype: 'buildingFriendlyValuesPrompt',
                        name: 'bl_id',
                        //display the user-friendly value: building's name
                        selectedFields: ['name']
                    },
                    {
                        //in app.js file add 'Common.store.Floors' and 'Common.store.FloorPrompt' in the stores array
                        xtype: 'floorFriendlyValuesPrompt',
                        name: 'fl_id',
                        //display the user-friendly value: floor's name
                        selectedFields: ['name']
                    },
                    {
                        //in app.js file add 'Common.store.Rooms' and 'Common.store.RoomPrompt' in the stores array
                        xtype: 'roomFriendlyValuesPrompt',
                        name: 'rm_id',
                        //display the user-friendly value: room's name
                        selectedFields: ['name']
                    }
                ]
            }
        ]
    }
});