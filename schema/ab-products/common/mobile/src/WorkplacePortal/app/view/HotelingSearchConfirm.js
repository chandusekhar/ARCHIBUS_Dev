Ext.define('WorkplacePortal.view.HotelingSearchConfirm', {
    extend: 'Common.form.FormPanel',

    requires: [],

    xtype: 'hotelingSearchConfirmPanel',

    config: {
        /*layout: 'vbox', */

        title: LocaleManager.getLocalizedString('Book Room', 'WorkplacePortal.view.HotelingSearchConfirm'),

        editViewClass: 'WorkplacePortal.view.FloorPlan',

        activityType: '',

        items: [
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'datepickerfield',
                        name: 'date_start',
                        label: LocaleManager.getLocalizedString('Start Date', 'WorkplacePortal.view.HotelingSearchConfirm'),
                        picker: {
                            //yearFrom : 2010,
                            yearTo: new Date().getFullYear(),
                            listeners: {
                                show: function () {
                                    var date = this.getValue();
                                    if (!date) {
                                        this.setValue(new Date());
                                    }
                                }
                            }
                        },
                        readOnly: true
                    },
                    {
                        xtype: 'datepickerfield',
                        name: 'date_end',
                        label: LocaleManager.getLocalizedString('End Date', 'WorkplacePortal.view.HotelingSearchConfirm'),
                        picker: {
                            //yearFrom : 2010,
                            yearTo: new Date().getFullYear(),
                            listeners: {
                                show: function () {
                                    var date = this.getValue();
                                    if (!date) {
                                        this.setValue(new Date());
                                    }
                                }
                            }
                        },
                        readOnly: true
                    },
                    {
                        xtype: 'selectfield',
                        name: 'day_part',
                        label: LocaleManager.getLocalizedString('Part of Day', 'WorkplacePortal.view.HotelingSearchConfirm'),
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        // The standard status values are provided for the case
                        // where the TableDef object is not available.
                        options: [
                            { objectValue: '0', displayValue: 'Full Day' },
                            { objectValue: '2', displayValue: 'Afternoon' },
                            { objectValue: '1', displayValue: 'Morning' }
                        ],
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'bl_id',
                        label: LocaleManager.getLocalizedString('Building Code', 'WorkplacePortal.view.HotelingSearchConfirm'),
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'fl_id',
                        label: LocaleManager.getLocalizedString('Floor Code', 'WorkplacePortal.view.HotelingSearchConfirm'),
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'rm_id',
                        label: LocaleManager.getLocalizedString('Room Code', 'WorkplacePortal.view.HotelingSearchConfirm'),
                        readOnly: true
                    }
                ]
            },

            {
                xtype: 'container',
                layout: 'hbox',
                padding: 6,
                items: [
                    {
                        xtype: 'spacer',
                        flex: 1
                    },
                    {
                        xtype: 'button',
                        itemId: 'confirmRoomHotelingButton',
                        text: LocaleManager.getLocalizedString('Book', 'WorkplacePortal.view.HotelingSearchConfirm'),
                        flex: 1,
                        ui: 'action'
                    },
                    {
                        xtype: 'spacer',
                        flex: 1
                    }
                ]
            }
        ]
    },

    initialize: function () {
        this.callParent();

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
    }
});