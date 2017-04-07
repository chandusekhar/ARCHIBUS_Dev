Ext.define('Solutions.view.PromptConfigure', {
    extend: 'Ext.Container',

    config: {
        items: [
            {
                xtype: 'fieldset',
                title: 'Configure a prompt field',
                instructions: 'Defined the prompt field using the control \'Common.control.field.Prompt\'',
                items: [
                    {
                        xtype: 'prompt',

                        //Field's label that is displayed in the form
                        label: 'Employee',

                        //Field's HTML name attribute
                        name: 'em_id',

                        valueField: 'em_id',

                        // Field's for the value displayed in the input field after selection
                        selectedFields: ['name_first', 'name_last'],

                        //The store id of the store containing the data for the prompt
                        //For this example, 'Common.store.Employees' value was added in the stores array in app.js file.
                        store: 'employeesStore',

                        //The title that is displayed in the prompt view title bar
                        title: 'Employees',

                        //The display fields are displayed in the popup prompt
                        displayFields: [
                            {
                                //The field name of the field in the Ext.data.Model instance
                                name: 'em_id',

                                //The title property is displayed in the list header
                                title: 'Employee Code'
                            },
                            {
                                name: 'name_first',
                                title: 'Name First'
                            },
                            {
                                name: 'name_last',
                                title: 'Name Last'
                            }
                        ]
                    }
                ]
            }
        ]
    }
});