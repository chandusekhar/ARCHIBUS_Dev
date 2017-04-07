Ext.define('Maintenance.view.WorkRequestPartEdit', {

    extend: 'Maintenance.view.WorkRequestEditBase',
    requires: 'Common.control.field.Prompt',

    xtype: 'workRequestPartEditPanel',

    config: {

        model: 'Maintenance.model.WorkRequestPart',
        storeId: 'workRequestPartsStore',

        editTitle: LocaleManager.getLocalizedString('Edit Part', 'Maintenance.view.WorkRequestPartEdit'),
        addTitle: LocaleManager.getLocalizedString('Add Part', 'Maintenance.view.WorkRequestPartEdit'),

        items: [
            {
                xtype: 'formheader',
                workRequestId: '',
                dateValue: '',
                dateLabel: LocaleManager.getLocalizedString('Assigned', 'Maintenance.view.WorkRequestPartEdit'),
                displayLabels: !Ext.os.is.Phone
            },
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'hiddenfield',
                        name: 'date_assigned'
                    },
                    {
                        xtype: 'prompt',
                        name: 'part_id',
                        label: LocaleManager.getLocalizedString('Part', 'Maintenance.view.WorkRequestPartEdit'),
                        title: LocaleManager.getLocalizedString('Parts', 'Maintenance.view.WorkRequestPartEdit'),
                        store: 'partStorageLocStore',
                        required: true,
                        parentFields: ['pt_store_loc_id'],
                        displayFields: [
                            {
                                name: 'part_id',
                                title: LocaleManager.getLocalizedString('Part Code', 'Maintenance.view.manager.EstimateFormParts')
                            },
                            {
                                name: 'pt_store_loc_id',
                                title: LocaleManager.getLocalizedString('Storage Location Code', 'Maintenance.view.manager.EstimateFormParts')
                            },
                            //KB#3053142 Add Quantity on avaliable to Part code pop-up
                            {
                                name: 'qty_on_hand',
                                title: LocaleManager.getLocalizedString('Quantity Available', 'Maintenance.view.manager.EstimateFormParts')
                            }
                        ],
                        optionButton: {
                            iconCls: 'locate'
                        }
                    },
                    {
                        xtype: 'prompt',
                        name: 'pt_store_loc_id',
                        itemId: 'pt_store_loc_id',
                        title: LocaleManager.getLocalizedString('Storage Location Code', 'Maintenance.view.manager.EstimateFormParts'),
                        label: LocaleManager.getLocalizedString('Storage Location Code', 'Maintenance.view.manager.EstimateFormParts'),
                        required: true,
                        store: 'storageLocStore',
                        displayFields: [
                            {
                                name: 'pt_store_loc_id',
                                title: LocaleManager.getLocalizedString('Storage Location Code', 'Maintenance.view.manager.EstimateFormParts')
                            },
                            {
                                name: 'pt_store_loc_name',
                                title: LocaleManager.getLocalizedString('Storage Location Name', 'Maintenance.view.manager.EstimateFormParts')
                            },
                            {
                                name: 'bl_id',
                                title: LocaleManager.getLocalizedString('Building Code', 'Maintenance.view.manager.EstimateFormParts')
                            }
                        ],
                        optionButton: {
                            iconCls: 'locate'
                        },
                        flex: 1
                    },
                    {
                        xtype: 'spinnerfield',
                        label: LocaleManager.getLocalizedString('Quantity', 'Maintenance.view.WorkRequestPartEdit'),
                        stepValue: 1,
                        minValue: 0,
                        name: 'qty_actual'
                    },
                    {
                        xtype: 'commontextareafield',
                        label: LocaleManager.getLocalizedString('Comments', 'Maintenance.view.WorkRequestPartEdit'),
                        name: 'comments'
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this,
            dateAssignedField;

        me.callParent();

        me.setFieldsReadOnly();

        dateAssignedField = me.query('hiddenfield[name=date_assigned]')[0];
        dateAssignedField.on('change', me.onDateAssignedChanged, me);
        me.setFieldLabelAndLength('wrpt_sync');
    },

    setFieldsReadOnly: function () {
        var me = this,
            partIdField = me.down('field[name=part_id]'),
            partStorageLocationField = me.down('field[name=pt_store_loc_id]');

        partIdField.setReadOnly(!me.getIsCreateView());
        partStorageLocationField.setReadOnly(!me.getIsCreateView());
    },

    applyViewIds: function (config) {
        var me = this,
            formHeader = me.down('formheader');

        formHeader.setWorkRequestId(config.workRequestId);
        return config;
    },

    onDateAssignedChanged: function (field, newValue) {
        var me = this,
            formheader = me.down('formheader');
        formheader.setDateValue(newValue);
    },

    applyRecord: function (record) {
        var me = this,
            viewIds = me.getViewIds();
        if (!record) {
            record = Ext.create('Maintenance.model.WorkRequestPart');
        }
        record.set('wr_id', viewIds.workRequestId);
        record.set('mob_wr_id', viewIds.mobileId);

        //KB#3053500 Save button does not fully initiate the environment for adding a part in estimation status
        if(me.getIsCreateView()){
            record.set('date_assigned',new Date());
            record.set('time_assigned', new Date());
        }
        return record;
    }

});
