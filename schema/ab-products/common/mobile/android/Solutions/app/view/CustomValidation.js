Ext.define('Solutions.view.CustomValidation', {
    extend: 'Common.view.navigation.EditBase',

    config: {
        items: [
            {
                xtype: 'fieldset',
                items: [
                    {
                        xtype: 'commontextfield',
                        name: 'name',
                        label: 'Name'
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'age',
                        label: 'Age'
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'email',
                        label: 'Email'
                    },
                    {
                        xtype: 'container',
                        html: 'Fields Name and Age are required. Verifies that the user is over 16 years old and has filled in the Email field.',
                        styleHtmlContent: true
                    },
                    {
                        xtype: 'button',
                        text: 'Validate',
                        ui: 'action',
                        style: 'margin:6px',
                        handler: function () {
                            var fieldsetObject = this.getParent(),
                                panelObject = fieldsetObject.getParent(),
                                record = panelObject.getRecord();

                            if (record) {
                                // Validates the record using the function 'validate' which was overriden in 'Common.data.Model' to consider custom validations.
                                if (!record.isValid()) {
                                    // Show errors using function displayErrors from 'Common.form.FormPanel'.
                                    panelObject.displayErrors(record);
                                }
                            }

                        }
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var record;
        this.callParent(arguments);
        record = this.getRecord();
        if (!record) {
            record = Ext.create('UserEmailDemo');
        }
        this.setRecord(record);
    }
});

// Set up a model to use in the panel
Ext.define('UserEmailDemo', {
    extend: 'Common.data.Model',
    config: {
        disableValidation: false,

        fields: [
            { name: 'name', type: 'string' },
            { name: 'age', type: 'int' },
            { name: 'email', type: 'strig' }
        ],

        validations: [
            { type: 'presence', field: 'name' },
            { type: 'presence', field: 'age' }
        ],

        // Set up custom validations
        customValidations: [
            {
                fields: [ 'age', 'email'],
                type: 'ageEmailMatch',
                message: 'You must complete field {1}.',
                // When the customValidations formatted property is set to true, the message placeholders will be
                // replaced with the field labels of the fields defined in the fields property
                formatted: true
            }
        ]
    }
});

//The CustomModelValidations class registers the custom validation function used by UserEmailDemo model.
Ext.define('CustomModelValidations', {

    requires: [ 'Ext.data.Validations' ],

    singleton: true,

    constructor: function () {
        this.initialize();
    },

    initialize: function () {
        Ext.apply(Ext.data.Validations, {
            ageEmailMatch: function (config, fieldValues) {
                var age = fieldValues[0],
                    email = fieldValues[1];

                return !(!Ext.isEmpty(age) && age >= 16 && Ext.isEmpty(email));
            }
        });
    }
});
