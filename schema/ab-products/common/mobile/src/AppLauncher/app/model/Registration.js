/**
 * Model instance for the Registration form values.
 * This model is used only for validating the Registration form values.
 */
Ext.define('AppLauncher.model.Registration', {

    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'username',  type: 'string'
            },
            {
                name: 'password', type: 'string'
            }
        ],

        validations: [
            {
                type: 'presence', field: 'username'
            },
            {
                type: 'presence', field: 'password'
            }
        ]
    }
});
