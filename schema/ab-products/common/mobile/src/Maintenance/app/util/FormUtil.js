/**
 * Holds common functions for forms
 *
 * @author Cristina Moldovan
 * @since 21.3
 */
Ext.define('Maintenance.util.FormUtil', {
    alternateClassName: ['FormUtil'],

    singleton: true,

    userCanEditResourcesAfterIssued: function () {
        // only applied to Issued and Completed tabs
        if (WorkRequestFilter.listType !== Constants.Issued
            && WorkRequestFilter.listType !== Constants.Completed) {

            return true;
        }

        // only supervisors and craftspersons can edit resources
        return ApplicationParameters.getUserRoleName() === 'supervisor'
            || ApplicationParameters.getUserRoleName() === 'craftsperson';
    },

    clearPartsForm: function (fieldSet) {
        fieldSet.get('part_id').reset();
        fieldSet.get('part_id').setValue('');
        fieldSet.get('pt_store_loc_id').reset();
        fieldSet.get('pt_store_loc_id').setValue('');
        fieldSet.get('qty_estimated').reset();
        fieldSet.get('qty_actual').reset();
    },

    clearCostsForm: function (fieldSet) {
        var qtyUnitsContainer = fieldSet.get('qtyUnitsContainer').getItems();
        fieldSet.get('other_rs_type').reset();
        fieldSet.get('description').reset();
        qtyUnitsContainer.get('qty_used').reset();
        qtyUnitsContainer.get('units_used').reset();
        fieldSet.get('cost_estimated').reset();
        fieldSet.get('cost_total').reset();
    },

    clearToolsForm: function (fieldSet) {
        //var dateTimeFieldSet = fieldSet.get('dateTimeContainer').getItems(),
        var startDateTimeContainer = fieldSet.get('startDateTimeContainer').getItems(),
            endDateTimeFieldSet = fieldSet.get('endDateTimeContainer').getItems();
        fieldSet.get('tool_id').reset();
        fieldSet.get('tool_id').setValue('');
        //KB#3051025 MOBILE MAINT.-Date Format in the Assign Tool Form is Incorrect.
        //dateTimeFieldSet.get('date_assigned').reset();
        fieldSet.get('date_assigned').setValue(new Date());
        fieldSet.get('time_assigned').reset();
        fieldSet.get('hours_est').reset();
        fieldSet.get('date_start').setValue('');
        startDateTimeContainer.get('time_start').reset();
        fieldSet.get('date_end').setValue('');
        endDateTimeFieldSet.get('time_end').reset();
        fieldSet.get('hours_straight').reset();
    },

    clearCraftspersonsForm: function (fieldSet) {
        var startDateTimeContainer = fieldSet.get('startDateTimeContainer').getItems(),
            endDateTimeFieldSet = fieldSet.get('endDateTimeContainer').getItems();
        fieldSet.get('cf_id').reset();
        //KB#3051431 If field is prompt field, reset method can not make
        fieldSet.get('cf_id').setValue('');
        //KB#3051025 MOBILE MAINT.-Date Format in the Assign Tool Form is Incorrect.
        //fieldSet.get('date_assigned').reset();
        fieldSet.get('date_assigned').setValue(new Date());
        fieldSet.get('time_assigned').reset();
        fieldSet.get('hours_est').reset();
        fieldSet.get('work_type').reset();
        fieldSet.get('status').reset();
        fieldSet.get('date_start').setValue('');
        startDateTimeContainer.get('time_start').reset();
        fieldSet.get('date_end').setValue('');
        endDateTimeFieldSet.get('time_end').reset();
        fieldSet.get('hours_straight').reset();
        fieldSet.get('hours_over').reset();
        fieldSet.get('hours_double').reset();
        fieldSet.get('comments').reset();
    },

    clearTradesForm: function (fieldSet) {
        fieldSet.get('tr_id').reset();
        fieldSet.get('tr_id').setValue('');
        fieldSet.get('hours_est').reset();
    },

    /**
     * Registers Start/Stop buttons and End Date/Time listeners
     * @param form
     */
    registerDatesListeners: function (form) {
        // Register listeners on Start and Stop buttons
        form.query('button[itemId=startWorkButton]')[0].on('tap', FormUtil.onStartWorkButtonTapped, form);

        form.query('button[itemId=stopWorkButton]')[0].on('tap', FormUtil.onStopWorkButtonTapped, form);

        // Start date
        form.query('calendarfield[name=date_start]')[0].on('select', function () {
            FormUtil.calculateStraightHours(form);
        }, form);

        // Start time
        form.query('timepickerfield[name=time_start]')[0].on('select', function () {
            FormUtil.calculateStraightHours(form);
        }, form);

        // End date
        form.query('calendarfield[name=date_end]')[0].on('select', function () {
            FormUtil.calculateStraightHours(form);
        }, form);

        // End time
        form.query('timepickerfield[name=time_end]')[0].on('select', function () {
            FormUtil.calculateStraightHours(form);
        }, form);
    },

    /**
     *
     * Sets Date and Time Start to currrent date and time.
     * If Actual Hours equal zero, sets them to 1 minute,
     * in order to pass the hours validation (hours are mandatory)
     */
    onStartWorkButtonTapped: function () {
        var form = this,
            dateStartField = form.query('calendarfield[name=date_start]')[0],
            timeStartField = form.query('timepickerfield[name=time_start]')[0],
            dateStartValue = dateStartField.getValue(),
            timeStartValue = timeStartField.getValue(),
            storeId = form.getStoreId(),
            needsSync = false,
            currentAutoSyncValue,
            store;


        if (Ext.isEmpty(dateStartField.getValue())) {
            dateStartValue = new Date();
            needsSync = true;
        }

        if (Ext.isEmpty(timeStartField.getValue())) {
            timeStartValue = new Date();
            needsSync = true;
        }

        /**
         * There is a timing issue in the Sencha DAL that causes problems with sequential updates
         * on stores with auto sync set to true. The second update is not processed quickly enough by
         * the client database. The first update resets the records modified field history before the
         * second update is processed.
         * To overcome this issue we set both the start and end values in a single update
         */
        if (needsSync) {
            store = Ext.getStore(storeId);
            currentAutoSyncValue = store.getAutoSync();

            store.setAutoSync(false);
            if (!Ext.isEmpty(dateStartValue)) {
                dateStartField.setValue(dateStartValue);
            }
            if (!Ext.isEmpty(timeStartValue)) {
                timeStartField.setValue(timeStartValue);
            }
            store.sync(function () {
                store.setAutoSync(currentAutoSyncValue);
                FormUtil.calculateStraightHours(form);
            });
        } else {
            setTimeout(function () {
                FormUtil.calculateStraightHours(form);
            }, 1);
        }
    },

    /**
     * Sets Date and Time End to current date and time.
     * If not zero, calculates Actual Hours = End date&time - Start date&time
     */
    onStopWorkButtonTapped: function () {
        var form = this,
            dateEndField = form.query('calendarfield[name=date_end]')[0],
            timeEndField = form.query('timepickerfield[name=time_end]')[0],
            dateEndValue = dateEndField.getValue(),
            timeEndValue = timeEndField.getValue(),
            storeId = form.getStoreId(),
            needsSync = false,
            currentAutoSyncValue,
            store;


        if (Ext.isEmpty(dateEndField.getValue())) {
            dateEndValue = new Date();
            needsSync = true;
        }

        if (Ext.isEmpty(timeEndField.getValue())) {
            timeEndValue = new Date();
            needsSync = true;
        }

        /**
         * There is a timing issue in the Sencha DAL that causes problems with sequential updates
         * on stores with auto sync set to true. The second update is not processed quickly enough by
         * the client database. The first update resets the records modified field history before the
         * second update is processed.
         * To overcome this issue we set both the start and end values in a single update
         */
        if (needsSync) {
            store = Ext.getStore(storeId);
            currentAutoSyncValue = store.getAutoSync();

            store.setAutoSync(false);
            if (!Ext.isEmpty(dateEndValue)) {
                dateEndField.setValue(dateEndValue);
            }
            if (!Ext.isEmpty(timeEndValue)) {
                timeEndField.setValue(timeEndValue);
            }
            store.sync(function () {
                store.setAutoSync(currentAutoSyncValue);
                FormUtil.calculateStraightHours(form);
            });
        } else {
            setTimeout(function () {
                FormUtil.calculateStraightHours(form);
            }, 1);
        }
    },

    /**
     *
     * @param form
     */
    calculateStraightHours: function (form) {
        var dateStartFieldValue = form.query('calendarfield[name=date_start]')[0].getValue(),
            timeStartFieldValue = form.query('timepickerfield[name=time_start]')[0].getValue(),
            dateEndField = form.query('calendarfield[name=date_end]')[0],
            timeEndField = form.query('timepickerfield[name=time_end]')[0],
            dateStart,
            dateEnd,
            calculateHours = function (dateStart, dateEnd) {
                var hoursStraightField = form.query('formattednumberfield[name=hours_straight]')[0],
                    hoursStraightValue;

                // set the hours only if not filled in
                // KB 3045711 always recalculate the hours
                hoursStraightValue = ((Ext.Date.getElapsed(dateStart, dateEnd) / 1000) / 60 ) / 60;
                hoursStraightField.setValue(hoursStraightValue);
            };

        // if start date or time are empty, cannot calculate the hours
        if (Ext.isEmpty(dateStartFieldValue) || Ext.isEmpty(timeStartFieldValue)) {
            return;
        }

        // KB 3045832 if end date or time are empty, do not calculate the hours
        if (Ext.isEmpty(dateEndField.getValue()) || Ext.isEmpty(timeEndField.getValue())) {
            return;
        }

        // set date from date field & time field
        dateStart = Maintenance.model.Validation.combineDates(dateStartFieldValue, timeStartFieldValue);
        dateEnd = Maintenance.model.Validation.combineDates(dateEndField.getValue(), timeEndField.getValue());

        // if end date is greater than stat date, do not try to calculate the hours
        if (!dateStart || !dateEnd
            || !Ext.isDate(dateStart) || !Ext.isDate(dateEnd)
            || dateStart > dateEnd) {

            return;
        }

        calculateHours(dateStart, dateEnd);
    },

    setFieldsReadOnly: function (form, fieldArray, readOnly) {
        var fields, fieldName;

        if (!fieldArray) {
            return;
        }

        fields = form.query('field');
        Ext.each(fields, function (field) {
            fieldName = field.getName();
            if (fieldArray.indexOf(fieldName) >= 0) {
                field.setReadOnly(readOnly);
            }
        });
    },

    setCfPrimaryKeyReadOnly: function (form, readOnly) {
        var me = this,
            fields = ['cf_id', 'date_assigned', 'time_assigned'];

        me.setFieldsReadOnly(form, fields, readOnly);
    },

    setToolPrimaryKeyReadOnly: function (form, readOnly) {
        var me = this,
            fields = ['tool_id', 'date_assigned', 'time_assigned'];

        me.setFieldsReadOnly(form, fields, readOnly);
    },

    setPartPrimaryKeyReadOnly: function (form, readOnly) {
        var me = this,
            fields = ['part_id', 'date_assigned', 'time_assigned','pt_store_loc_id'];

        me.setFieldsReadOnly(form, fields, readOnly);
    },

    setTradePrimaryKeyReadOnly: function (form, readOnly) {
        var me = this,
            fields = ['tr_id'];

        me.setFieldsReadOnly(form, fields, readOnly);
    },

    setCostPrimaryKeyReadOnly: function (form, readOnly) {
        var me = this,
            fields = [/* IS NOT DISPLAYED 'date_used', */'other_rs_type'];

        me.setFieldsReadOnly(form, fields, readOnly);
    }
});