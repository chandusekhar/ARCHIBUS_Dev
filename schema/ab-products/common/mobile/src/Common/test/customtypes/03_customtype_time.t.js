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
                    {name: 'timeField', type: 'timeclass'}
                ]
            }
        });

        var testModel = new TestModel();
        var dt, convertedDate;
        var fieldValue;

        // Verify model field type
        var timeFieldType = testModel.getFields().map.timeField.getType().type;
        t.ok(timeFieldType === 'TimeClass', 'Field is type TimeClass');

        dt = new Date(2012, 3, 28, 14, 16, 33);  // 2012-04-28 14:16:33
        convertedDate = new Date(1970, 0, 1, 14, 16, 33, 0);  // Dates stored in the model do not have a time component

        // Verify the timeclass field with a date input
        testModel.set('timeField', dt);
        fieldValue = testModel.get('timeField');
        console.log(fieldValue);
        t.isDateEqual(fieldValue, convertedDate, 'Time field matches expected result');

        // Verify string input in HH:mm:ss format
        testModel.set('timeField', '14:16:33');
        fieldValue = testModel.get('timeField');
        console.log(fieldValue);
        t.isDateEqual(fieldValue, convertedDate, 'Time field matches expected result');

        // Verify string input in YYYY-MM-dd HH:mm:ss format
        testModel.set('timeField', '2012-03-28 14:16:33');
        fieldValue = testModel.get('timeField');
        console.log('field ' + fieldValue);
        t.isDateEqual(fieldValue, convertedDate, 'Time field matches expected result');


        // Verify string input in HH:mm format
        testModel.set('timeField', '14:22');
        fieldValue = testModel.get('timeField');
        console.log(fieldValue);
        convertedDate = new Date(1970, 0, 1, 14, 22, 0, 0);  // Dates stored in the model do not have a time component
        t.isDateEqual(fieldValue, convertedDate, 'Time field matches expected result 14:22');


        // Test invalid string input
        t.throwsOk(function () {
            testModel.set('timeField', 'invalid');
        }, /type/, 'Invalid type exception thrown');

        t.throwsOk(function () {
            testModel.set('timeField', 10023);
        }, /type/, 'Invalid type exception thrown');


        t.done();

    });
});

