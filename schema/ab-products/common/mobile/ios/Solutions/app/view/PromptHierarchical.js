Ext.define('Solutions.view.PromptHierarchical', {
    extend: 'Ext.Container',
    
    requires: ['Common.control.prompt.Building',
        'Common.control.prompt.Floor',
        'Common.control.prompt.Room'],

    config: {
        items: [
            {
                xtype: 'fieldset',
                title: 'Configure prompt fields for hierarchical relationships',
                instructions: 'Uses the \'parentFields\' and \'childFields\' configuration options to restrict child fields list of values after selecting the value for the parent field. ' +
                    '<br \\>When a prompt value is selected the prompt will set the values in the parent prompts.',
                items: [
                    {
                        //in app.js file add 'Common.store.Buildings' in the stores array
                        xtype: 'buildingPrompt',
                        name: 'bl_id',
                        childFields: ['fl_id', 'rm_id']
                    },
                    {
                        //in app.js file add 'Common.store.Floors' in the stores array
                        xtype: 'floorPrompt',
                        name: 'fl_id',
                        parentFields: ['bl_id'],
                        childFields: ['rm_id']
                    },
                    {
                        //in app.js file add 'Common.store.Rooms' in the stores array
                        xtype: 'roomPrompt',
                        name: 'rm_id',
                        parentFields: ['bl_id', 'fl_id']
                    }
                ]
            }
        ]
    }
});