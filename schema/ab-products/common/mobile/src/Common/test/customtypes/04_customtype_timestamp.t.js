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
                    {name: 'timeStampField', type: 'timestampclass'}
                ]
            }
        });

        var testModel = new TestModel();
        var dt, convertedDate;
        var fieldValue;

        // Verify model field type
        var timeFieldType = testModel.getFields().map.timeStampField.getType().type;
        t.ok(timeFieldType === 'TimestampClass', 'Field is type TimestampClass');

        dt = new Date(2012, 3, 28, 14, 16, 33, 0);  // 2012-04-28 14:16:33
        convertedDate = new Date(2012, 3, 28, 14, 16, 33, 0);  // Dates stored in the model do not have a time component

        // Verify the timestampclass field with a date input
        testModel.set('timeStampField', dt);
        fieldValue = testModel.get('timeStampField');
        console.log(fieldValue);
        t.isDateEqual(fieldValue, convertedDate, 'Timestamp field matches expected result');


        convertedDate = new Date(2012, 3, 28, 14, 16, 33, 22);
        // Verify string input
        testModel.set('timeStampField', '2012-04-28 14:16:33:22');
        fieldValue = testModel.get('timeStampField');
        console.log(fieldValue + ' ' + fieldValue.getMilliseconds());
        t.isDateEqual(fieldValue, convertedDate, 'Timestamp field matches string input');

        testModel.set('timeStampField', '2012/04/28 14:16:33:22');
        fieldValue = testModel.get('timeStampField');
        console.log(fieldValue + ' ' + fieldValue.getMilliseconds());
        t.isDateEqual(fieldValue, convertedDate, 'Timestamp field matches string input');

        // Test invalid string input
        t.throwsOk(function () {
            testModel.set('timeStampField', 'test date');
        }, /type/, 'Invalid type exception thrown');

        t.done();

    });
});
