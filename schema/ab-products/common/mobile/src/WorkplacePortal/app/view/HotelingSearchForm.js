Ext.define('WorkplacePortal.view.HotelingSearchForm', {
    extend: 'Common.form.FormPanel',

    requires: [],

    xtype: 'hotelingSearchFormPanel',

    config: {
        scrollable: 'vertical',

        title: LocaleManager.getLocalizedString('Search Rooms', 'WorkplacePortal.view.HotelingSearchForm'),

        // defined in the Navigation controller
        editViewClass: '',

        activityType: '',

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                itemId: 'searchHotelingRoomsButton',
                text: LocaleManager.getLocalizedString('Search', 'WorkplacePortal.view.HotelingSearchForm'),
                align: 'right',
                ui: 'action',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'calendarfield',
                        name: 'date_start',
                        label: LocaleManager.getLocalizedString('Start Date', 'WorkplacePortal.view.HotelingSearchForm'),
                        required: true,
                        clearIcon: false
                    },
                    {
                        xtype: 'localizedspinnerfield',
                        label: LocaleManager.getLocalizedString('Duration', 'WorkplacePortal.view.HotelingSearchForm'),
                        name: 'duration',
                        stepValue: 1,
                        minValue: 1,
                        maxValue: 99999,
                        decimals: 0
                    },
                    {
                        xtype: 'calendarfield',
                        name: 'date_end',
                        label: LocaleManager.getLocalizedString('End Date', 'WorkplacePortal.view.HotelingSearchForm'),
                        required: true,
                        changeDurationValue: true,
                        clearIcon: false
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'day_part',
                        label: LocaleManager.getLocalizedString('Part of Day', 'WorkplacePortal.view.HotelingSearchForm'),
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        // The standard status values are provided for the case
                        // where the TableDef object is not available.
                        options: [
                            {objectValue: '0', displayValue: 'Full Day'},
                            {objectValue: '2', displayValue: 'Afternoon'},
                            {objectValue: '1', displayValue: 'Morning'}
                        ]
                    },
                    {
                        xtype: 'buildingPrompt',
                        store: 'spaceBookBuildings'
                    },
                    {
                        xtype: 'floorPrompt',
                        store: 'spaceBookFloors'
                    },
                    {
                        xtype: 'roomPrompt'
                    },
                    {
                        xtype: 'roomStandardPrompt'
                    },
                    {
                        xtype: 'prompt',
                        label: LocaleManager.getLocalizedString('Room Category', 'WorkplacePortal.view.HotelingSearchForm'),
                        name: 'rm_cat',
                        title: LocaleManager.getLocalizedString('Room Categories', 'WorkplacePortal.view.HotelingSearchForm'),
                        store: 'roomCategoriesStore',
                        displayFields: [
                            {
                                name: 'rm_cat',
                                title: LocaleManager.getLocalizedString('Category', 'WorkplacePortal.view.HotelingSearchForm')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Description', 'WorkplacePortal.view.HotelingSearchForm')
                            }
                        ],
                        childFields: ['rm_type']
                    },
                    {
                        xtype: 'prompt',
                        label: LocaleManager.getLocalizedString('Room Type', 'WorkplacePortal.view.HotelingSearchForm'),
                        name: 'rm_type',
                        title: LocaleManager.getLocalizedString('Room Types', 'WorkplacePortal.view.HotelingSearchForm'),
                        store: 'roomTypesStore',
                        displayFields: [
                            {
                                name: 'rm_cat',
                                title: LocaleManager.getLocalizedString('Room Category', 'WorkplacePortal.view.HotelingSearchForm')
                            },
                            {
                                name: 'rm_type',
                                title: LocaleManager.getLocalizedString('Room Type', 'WorkplacePortal.view.HotelingSearchForm')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Description', 'WorkplacePortal.view.HotelingSearchForm')
                            }
                        ],
                        parentFields: ['rm_cat']
                    },
                    {
                        xtype: 'divisionPrompt'
                    },
                    {
                        xtype: 'departmentPrompt'
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var dateStartField,
            durationField,
            dateEndField;

        this.callParent();

        // Initialize duration and Date End
        dateStartField = this.query('calendarfield[name=date_start]')[0];
        dateStartField.on('change', this.onDateStartChanged, this);

        // Set the Date End value from duration
        durationField = this.query('localizedspinnerfield[name=duration]')[0];
        durationField.on('spin', this.onDurationChanged, this);
        durationField.on('change', this.onDurationChanged, this);

        // Set the duration based on new Date End value
        dateEndField = this.query('calendarfield[name=date_end]')[0];
        dateEndField.on('change', this.onDateEndChanged, this);

        // set field values from enumlists
        this.setEnumerationLists();

        // set panel title
        this.add(Ext.factory({docked: 'top', title: this.getTitle()}, Common.control.TitlePanel));
    },

    setEnumerationLists: function () {
        var me = this,
            fieldNames = ['day_part'];

        Ext.each(fieldNames, function (fieldName) {
            var fieldEnumList = TableDef.getEnumeratedList('rmpct', fieldName);

            if (fieldEnumList && fieldEnumList.length > 0) {
                me.query('selectfield[name=' + fieldName + ']')[0].setOptions(fieldEnumList);
            }
        });
    },

    onDateStartChanged: function (field, newValue) {
        var durationField = this.query('localizedspinnerfield[name=duration]')[0],
            dateEndField = this.query('calendarfield[name=date_end]')[0];

        durationField.setValue(1);
        dateEndField.setValue(newValue);
    },

    /**
     * Calculate and set Date End field value
     */
    onDurationChanged: function (field, newValue) {
        var dateEnd = new Date(),
            dateStart = this.query('calendarfield[name=date_start]')[0].getValue(),
            dateEndField = this.query('calendarfield[name=date_end]')[0],
            numberOfDays;

        if (parseInt(newValue, 10) > 0) {
            numberOfDays = dateStart.getDate() + parseInt(newValue, 10) - 1;
        } else {
            numberOfDays = dateStart.getDate();
        }

        dateEnd.setDate(numberOfDays);
        dateEndField.changeDurationValue = false;
        dateEndField.setValue(dateEnd);
    },

    onDateEndChanged: function (field, newValue) {
        var oneDay = 1000 * 60 * 60 * 24, // The number of milliseconds in one day
            durationField = this.query('localizedspinnerfield[name=duration]')[0],
            dateStartField = this.query('calendarfield[name=date_start]')[0],
            dateStart = dateStartField.getValue(),
            durationValue = 0;

        if (!Ext.isEmpty(newValue) && !Ext.isEmpty(dateStart)) {
            durationValue = Math.round((newValue.getTime() - dateStart.getTime()) / oneDay) + 1;
        }

        if (durationValue < 1) {
            durationValue = 1;
            dateStartField.setValue(newValue);
        }

        if (field.changeDurationValue) {
            durationField.setValue(durationValue);
        }
        field.changeDurationValue = true;
    }
});