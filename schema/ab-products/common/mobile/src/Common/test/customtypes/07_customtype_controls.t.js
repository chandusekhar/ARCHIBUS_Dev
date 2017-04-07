/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.diag('Testing form');

    t.requireOk('Common.control.field.Number', 'Common.data.Model', 'Common.control.picker.Time',
        'Common.control.field.TimePicker', 'Common.test.views.customtype_view', function () {

            // Create the model for the view

            Ext.define('TestModel', {
                extend: 'Common.data.Model',

                config: {
                    fields: [
                        {name: 'id', type: 'int'},
                        {name: 'intfld', type: 'integerclass'},
                        {name: 'datefld', type: 'dateclass'},
                        {name: 'timefld', type: 'timeclass'},
                        {name: 'timestampfld', type: 'timestampclass'},
                        {name: 'stringfld', type: 'string'},
                        {name: 'baseintfld', type: 'int'},
                        {name: 'floatfld', type: 'float'},
                        {name: 'booleanfld', type: 'bool'},
                        {name: 'basedatefld', type: 'date'}
                    ]
                }
            });

            var testModel = Ext.create('TestModel');

            var currentDate = new Date();
            var modelData = {
                intfld: 98,
                datefld: '2012-12-25',
                timefld: '15:45',
                timestampfld: '2012-11-30 17:55:33',
                stringfld: 'Test String',
                baseintfld: 101,
                floatfld: 87.543,
                booleanfld: true,
                basedatefld: currentDate
            };

            testModel.setData(modelData);

            var intfld = Ext.create('Common.control.field.Number', {
                name: 'intfld',
                label: 'IntegerClass',
                decimals: 0
            });

            var datefld = Ext.create('Ext.field.DatePicker', {
                name: 'datefld',
                label: 'DateClass'
            });

            var timefld = Ext.create('Common.control.field.TimePicker', {
                name: 'timefld',
                label: 'TimeClass'
                //value: new Date()
            });

            var view = Ext.create('Common.test.views.customtype_view');

            view.add(intfld);
            view.add(datefld);
            view.add(timefld);

            view.setRecord(testModel);

            t.is(intfld.getValue(), 98, 'Integer value is correct');
            t.isDateEqual(datefld.getValue(), new Date(2012, 11, 25, 0, 0, 0), 'Date value is correct');
            t.isDateEqual(timefld.getValue(), new Date(1970, 0, 1, 15, 45, 0), 'Time value is correct');

            // Retrieve the record from the view

            var viewRecord = view.getRecord();

            t.is(viewRecord.get('intfld'), 98, 'Record integer value is correct');
            t.is(viewRecord.get('datefld'), new Date(2012, 11, 25, 0, 0, 0), 'Date value is correct');
            t.is(viewRecord.get('timefld'), new Date(1970, 0, 1, 15, 45, 0), 'Time value is correct');


            Ext.Viewport.add(view);

            t.chain(
                {waitFor: 1000},
                {action: 'click', target: intfld.element.down('.x-clear-icon')},
                {action: 'click', target: intfld},
                {action: 'type', target: intfld, text: '101'},
                {action: 'click', target: datefld},
                {waitFor: 1000},

                function (next) {
                    t.is(intfld.getValue(), '101', 'Number Field value is correct');
                    next();
                }
            );

        });
});


