Ext.define('WorkplacePortal.view.FilterReservations', {
    extend: 'Common.view.navigation.FilterForm',

    xtype: 'filterReservationPanel',

    config: {
        layout: 'vbox',

        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Set Filter', 'WorkplacePortal.view.FilterReservations')
            },
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelWidth: '40%'
                },
                items: [
                    {
                        xtype: 'calendarfield',
                        name: 'date_start_from',
                        label: LocaleManager.getLocalizedString('Date Start From', 'WorkplacePortal.view.FilterReservations')
                    },
                    {
                        xtype: 'calendarfield',
                        name: 'date_start_to',
                        label: LocaleManager.getLocalizedString('Date Start To', 'WorkplacePortal.view.FilterReservations')
                    },
                    {
                        xtype: 'timepickerfield',
                        name: 'time_start_from',
                        label: LocaleManager.getLocalizedString('From', 'WorkplacePortal.view.FilterReservations')
                        + ' '
                        + '<span style="color: gray">'
                        + LocaleManager.getLocalizedString('hh:mm', 'WorkplacePortal.view.FilterReservations')
                        + '</span>',
                        required: true,
                        style: 'border-bottom:1px solid #DDD',
                        picker: {
                            xtype: 'timepickerconfig',
                            itemId: 'timeStartConfig'
                        }
                    },
                    {
                        xtype: 'timepickerfield',
                        name: 'time_start_to',
                        label: LocaleManager.getLocalizedString('To', 'WorkplacePortal.view.FilterReservations')
                        + ' '
                        + '<span style="color: gray">'
                        + LocaleManager.getLocalizedString('hh:mm', 'WorkplacePortal.view.FilterReservations')
                        + '</span>',
                        required: true,
                        style: 'border-bottom:1px solid #DDD',
                        picker: {
                            xtype: 'timepickerconfig',
                            itemId: 'timeEndConfig'
                        }
                    },
                    {
                        xtype: 'buildingAddressPrompt'
                    },
                    {
                        xtype: 'floorPrompt',
                        store: 'spaceBookFloors',
                        childFields: ['rm_id', 'name']
                    },
                    {
                        xtype: 'roomPrompt',
                        childFields: ['name']
                    },
                    {
                        xtype: 'prompt',
                        label: LocaleManager.getLocalizedString('Room Arrangement Type', 'WorkplacePortal.view.FilterReservations'),
                        name: 'rm_arrange_type_id',
                        title: LocaleManager.getLocalizedString('Room Arrangement Types', 'WorkplacePortal.view.FilterReservations'),
                        store: 'roomArrangeTypesStore',
                        displayFields: [
                            {
                                name: 'rm_arrange_type_id',
                                title: LocaleManager.getLocalizedString('Room Arrangement Type', 'WorkplacePortal.view.FilterReservations')
                            },
                            {
                                name: 'arrange_name',
                                title: LocaleManager.getLocalizedString('Name', 'WorkplacePortal.view.FilterReservations')
                            }
                        ],
                        displayTemplate: {
                            phone: '<div>{rm_arrange_type_id}</div><div>{arrange_name}</div>'
                        },
                        headerTemplate: {
                            phone: '<div class="prompt-list-label">' + LocaleManager.getLocalizedString('Room Arrangement Type', 'WorkplacePortal.view.FilterReservations') + '</div>'
                        }
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'reservation_name',
                        label: LocaleManager.getLocalizedString('Subject', 'WorkplacePortal.view.FilterReservations')
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'status',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        label: LocaleManager.getLocalizedString('Status', 'WorkplacePortal.view.FilterReservations'),
                        value: 'ALL'
                    },
                    {
                        xtype: 'prompt',
                        name: 'user_requested_for',
                        valueField: 'em_id',
                        store: 'reservationEmployeeStore',
                        label: LocaleManager.getLocalizedString('Requested For', 'WorkplacePortal.view.FilterReservations'),
                        title: LocaleManager.getLocalizedString('Employees  ', 'WorkplacePortal.view.FilterReservations'),
                        displayFields: [
                            {
                                name: 'em_id',
                                title: LocaleManager.getLocalizedString('Requested For', 'WorkplacePortal.view.FilterReservations')
                            }
                        ]
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'attendees',
                        label: LocaleManager.getLocalizedString('Attendee', 'WorkplacePortal.view.FilterReservations')
                    }
                ]
            }
        ],

        dateStartFromTooBig: LocaleManager.getLocalizedString('Date Start From should not be greater than Date Start To.', 'WorkplacePortal.view.FilterReservations')
    },

    initialize: function () {
        this.setEnumerationLists();

        this.handleDateSelection();

        this.callParent();
    },

    /*
     * Set option values for enum list fields.
     */
    setEnumerationLists: function () {
        var me = this,
            fieldNames = ['status'];

        Ext.each(fieldNames, function (fieldName) {
            var options = [],
                fieldEnumList = TableDef.getEnumeratedList('reserve_rm', fieldName);

            if (fieldEnumList && fieldEnumList.length > 0) {
                options.push({displayValue: "All", objectValue: "ALL"});
                options = options.concat(fieldEnumList);
                me.query('selectfield[name=' + fieldName + ']')[0].setOptions(options);
            }
        });
    },

    handleDateSelection: function () {
        var dateStartFrom = this.query('calendarfield[name=date_start_from]')[0],
            dateStartTo = this.query('calendarfield[name=date_start_to]')[0];

        dateStartFrom.on('change', this.onDateStartFromChange, this);
        dateStartTo.on('change', this.onDateStartToChange, this);
    },

    onDateStartFromChange: function (field, newValue) {
        var dateNewValue,
            dateStartTo = this.query('calendarfield[name=date_start_to]')[0],
            dateStartToValue = dateStartTo.getValue();

        if (!Ext.isEmpty(newValue) && !Ext.isEmpty(dateStartToValue)) {
            dateNewValue = new Date(newValue);
            if (dateNewValue > dateStartToValue) {
                Ext.Msg.alert('', this.getDateStartFromTooBig());
            }
        }
    },

    onDateStartToChange: function (field, newValue) {
        var dateNewValue,
            dateStartFrom = this.query('calendarfield[name=date_start_from]')[0],
            dateUStartromValue = dateStartFrom.getValue();

        if (!Ext.isEmpty(newValue) && !Ext.isEmpty(dateUStartromValue)) {
            dateNewValue = new Date(newValue);
            if (dateNewValue < dateUStartromValue) {
                Ext.Msg.alert('', this.getDateStartFromTooBig());
            }
        }
    }
});
