Ext.define('Solutions.view.PromptCommon', {
    extend: 'Ext.Container',
    
    requires: ['Common.control.prompt.Employee'],

    config: {
        items: [
            {
                xtype: 'fieldset',
                title: 'Use a predefined prompt field',
                instructions: 'Uses the prompt field \'Common.control.prompt.Employee\'',
                items: [
                    {
                        //in app.js file add 'Common.store.Employees' in the stores array
                        xtype : 'employeePrompt'
                    }
                ]
            }
        ]
    }
});