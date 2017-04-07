Ext.define('Solutions.view.Validation', {
    extend: 'Common.view.navigation.EditBase',

    config: {
        width: '100%',
        height: '100%',
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
                        name: 'gender',
                        label: 'Gender'
                    },
                    {
                        xtype: 'container',
                        html: ' - Name is a required file. The length must be greatet than 2 characters. Values can not be one of {\'Admin\', \'Operator\'}.' +
                            '<br /> - Age is a required numeric field. Values can be between 0 and 150.' +
                            '<br /> - Gender is a required text field. The value must be \'Male\' or \'Female\'.',
                        styleHtmlContent: true
                    },
                    {
                        xtype: 'button',
                        text: 'Validate',
                        style: 'margin:6px',
                        ui:'action',
                        handler: function(){
                            var fieldsetObject = this.getParent(),
                                panelObject = fieldsetObject.getParent(),
                                record = panelObject.getRecord();

                            if(record) {
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
            record = Ext.create('UserDemo');
        }
        this.setRecord(record);
    }
});

// Set up a model to use in the panel
Ext.define('UserDemo', {
    extend: 'Common.data.Model',

    // minvalue and maxvalue validations are defined in 'Common.data.Validations'
    requires: 'Common.data.Validations',

    config: {
        fields: [
            { name : 'name', type : 'string' },
            { name : 'age', type : 'int' },
            { name : 'gender', type : 'strig' }
        ],

        // Set up validations
        validations : [
            {type: 'presence', field: 'age'},
            {type: 'minvalue', field: 'age', minValue: 0, message: 'must be greater than or equal to 0'},
            {type: 'maxvalue', field: 'age', maxValue: 150, message: 'must be less than or equal to 150'},
            {type: 'length', field: 'name', min: 2},
            {type: 'exclusion', field: 'name', list: ['Admin', 'Operator']},
            {type: 'inclusion', field: 'gender', list: ['Male', 'Female']}
        ]
    }
});