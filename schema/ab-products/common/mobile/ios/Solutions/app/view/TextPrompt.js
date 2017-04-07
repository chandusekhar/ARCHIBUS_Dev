Ext.define('Solutions.view.TextPrompt', {
    extend: 'Ext.Container',

    requires: [ 'Common.control.field.TextArea',
        'Common.control.button.Picker'],

    config: {
        items: [
            {
                xtype: 'fieldset',
                instructions: 'Uses the controls \'Common.control.field.TextArea\' and \'Common.control.button.Picker\'',
                items: [
                    {
                        xtype: 'toolbar',
                        items: [
                            // Add ButtonPicker to the toolbar
                            {	xtype: 'buttonpicker',

                                //Button's label
                                text: 'Picker',

                                //The store containing option values
                                store: 'pickerExampleStore',

                                // The underlying data value to bind to this select control
                                valueField: 'value',

                                //The value displayed in the select control
                                displayField: 'name'
                            }
                        ]
                    },
                    {
                        xtype: 'commontextareafield',

                        //Field's label that is displayed in the form
                        label: 'Description',

                        //Field's HTML name attribute
                        name: 'description',

                        //The title that is displayed on the popup view
                        title: 'Description',

                        //displayEditPanel true to display the popup text edit panel
                        displayEditPanel: true
                    }
                ]
            }
        ]
    }
});

// Set up a model to use in the store
Ext.define('PickerExample', {
    extend: 'Ext.data.Model',
    config: {
        fields: [
            {name: 'value', type: 'string'},
            {name: 'name', type: 'string'}
        ]
    }
});

//Demo store used for buttonpicker control
Ext.create("Ext.data.Store", {
    storeId: "pickerExampleStore",
    model: "PickerExample",
    data : [
        {value: "1", name: "First Value"},
        {value: "2", name: "Second Value"},
        {value: "3", name: "Third Value"},
        {value: "4", name: "Fourth Value"}
    ]
});