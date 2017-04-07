/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
/* global TestModel */

StartTest(function (t) {


    t.requireOk('Common.data.Model', function () {

        Ext.define('TestModel', {
            extend: 'Common.data.Model',

            config: {
                fields: [
                    {name: 'id', type: 'int'},
                    {name: 'intField', type: 'integerclass'}
                ]
            }
        });
        var intValue;
        var testModel = new TestModel();

        // Verify the intField field type
        var intFieldType = testModel.getFields().map.intField.getType().type;

        t.ok(intFieldType === 'IntegerClass', 'Field is type IntegerClass');

        // Input an integer value
        testModel.set('intField', 98);

        // Verify the the intField contains the correct value
        intValue = testModel.get('intField');
        t.is(intValue, 98, 'Integer value matches');

        // Verify the field is formatted as an integer if a float is input
        testModel.set('intField', 121.987);
        intValue = testModel.get('intField');
        t.is(intValue, 121, 'Integer conversion is correct');

        // Verify the field value can parse a valid input string
        testModel.set('intField', '65');
        intValue = testModel.get('intField');
        t.is(intValue, 65, 'Integer parse conversion is correct');


        // Verify handling of invalid inputs
        // allowNull defaults to true. The result should be a null value

        t.throwsOk(function () {
            testModel.set('intField', 'text');
        }, /type/, 'Invalid Type exception received');
        t.done();

    });
});
