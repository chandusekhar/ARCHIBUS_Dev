Ext.define('WorkplacePortal.view.ServiceDeskRequestForm', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'serviceDeskRequestFormPanel',

    config: {
        title: '',

        model: 'WorkplacePortal.model.ServiceDeskRequest',
        storeId: 'serviceDeskRequestsStore',

        editViewClass: 'WorkplacePortal.view.ServiceDeskRequestForm',

        activityType: '',

        scrollable: {
            direction: 'vertical',
            directionLock: true
        },

        toolBarButtons: [
            {
                xtype: 'camera',
                align: 'left',
                iconCls: 'camera',
                displayOn: 'all',
                appName: 'WorkplacePortal'
            },
            {
                xtype: 'toolbarbutton',
                itemId: 'cancelRequestButton',
                text: LocaleManager.getLocalizedString('Cancel', 'WorkplacePortal.view.ServiceDeskRequestForm'),
                align: 'right',
                ui: 'action',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'fieldset',
                title: LocaleManager.getLocalizedString('Location Information', 'WorkplacePortal.view.ServiceDeskRequestForm'),
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'commontextfield',
                        // different label in the database
                        label: LocaleManager.getLocalizedString('Service Request ID', 'WorkplacePortal.view.ServiceDeskRequestForm'),
                        useFieldDefLabel: false,
                        name: 'activity_log_id',
                        readOnly: true
                    },
                    {
                        xtype: 'sitePrompt',
                        childFields: ['bl_id', 'fl_id', 'rm_id'],
                        required: true
                    },
                    {
                        xtype: 'buildingPrompt',
                        store: 'spaceBookBuildings',
                        childFields: ['fl_id', 'rm_id']
                    },
                    {
                        xtype: 'floorPrompt',
                        store: 'workplaceFloorPromptStore',
                        childFields: ['rm_id']
                    },
                    {
                        xtype: 'roomPrompt',
                        store: 'spaceRoomPrompt'
                    }
                ]
            },
            {
                xtype: 'fieldset',
                itemId: 'requestorInfFieldSet',
                title: LocaleManager.getLocalizedString('Requestor Information', 'WorkplacePortal.view.ServiceDeskRequestForm'),
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'commontextfield',
                        //different label in the database
                        label: LocaleManager.getLocalizedString('Requestor', 'WorkplacePortal.view.ServiceDeskRequestForm'),
                        useFieldDefLabel: false,
                        name: 'requestor',
                        readOnly: true
                    },
                    {
                        xtype: 'commontextfield',
                        //different label in the database
                        label: LocaleManager.getLocalizedString('Phone', 'WorkplacePortal.view.ServiceDeskRequestForm'),
                        useFieldDefLabel: false,
                        name: 'phone_requestor',
                        required: true
                    }
                ]
            },
            {
                xtype: 'fieldset',
                title: LocaleManager.getLocalizedString('Request Information', 'WorkplacePortal.view.ServiceDeskRequestForm'),
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelWidth: '40%'
                },
                items: [
                    {
                        xtype: 'selectlistfield',
                        //different label in the database
                        label: LocaleManager.getLocalizedString('Request Type', 'WorkplacePortal.view.ServiceDeskRequestForm'),
                        useFieldDefLabel: false,
                        name: 'activity_type',
                        readOnly: true,
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        // The standard status values are provided for the case
                        // where the TableDef object is not available.
                        options: [
                            {
                                objectValue: 'SERVICE DESK - MAINTENANCE',
                                displayValue: LocaleManager.getLocalizedString('Maintenance', 'WorkplacePortal.view.ServiceDeskRequestForm')
                            },
                            {
                                objectValue: 'SERVICE DESK - INDIVIDUAL MOVE',
                                displayValue: LocaleManager.getLocalizedString('Move', 'WorkplacePortal.view.ServiceDeskRequestForm')
                            },
                            {
                                objectValue: 'SERVICE DESK - DEPARTMENT SPACE',
                                displayValue: LocaleManager.getLocalizedString('Space', 'WorkplacePortal.view.ServiceDeskRequestForm')
                            },
                            {
                                objectValue: 'SERVICE DESK - FURNITURE',
                                displayValue: LocaleManager.getLocalizedString('Furniture', 'WorkplacePortal.view.ServiceDeskRequestForm')
                            },
                            {
                                objectValue: 'SERVICE DESK - COPY SERVICE',
                                displayValue: LocaleManager.getLocalizedString('Copy', 'WorkplacePortal.view.ServiceDeskRequestForm')
                            }
                        ]
                    },
                    {
                        xtype: 'problemtypefield',
                        name: 'prob_type',
                        required: true
                    },
                    {
                        xtype: 'commondatepickerfield',
                        name: 'date_requested',
                        readOnly: true
                    },
                    {
                        xtype: 'selectlistfield',
                        readOnly: true,
                        name: 'status',
                        valueField: 'objectValue',
                        displayField: 'displayValue'
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'description',
                        required: true,
                        displayEditPanel: true
                    }
                ]
            },
            {
                xytpe: 'container',
                layout: {
                    type: 'hbox',
                    align: 'center',
                    pack: 'center'
                },
                defaults: {
                    xtype: 'documentfield',
                    hidden: true
                },
                items: [
                    {
                        name: 'doc1_contents',
                        label: LocaleManager.getLocalizedString('Photo 1', 'WorkplacePortal.view.ServiceDeskRequestForm')
                    },
                    {
                        name: 'doc2_contents',
                        label: LocaleManager.getLocalizedString('Photo 2', 'WorkplacePortal.view.ServiceDeskRequestForm')
                    },
                    {
                        name: 'doc3_contents',
                        label: LocaleManager.getLocalizedString('Photo 3', 'WorkplacePortal.view.ServiceDeskRequestForm')
                    },
                    {
                        name: 'doc4_contents',
                        label: LocaleManager.getLocalizedString('Photo 4', 'WorkplacePortal.view.ServiceDeskRequestForm')
                    }
                ]
            },
            {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'center',
                    pack: 'center'
                },
                docked: 'bottom',
                cls: 'ab-carousel-footer',

                items: [
                    {
                        xtype: 'viewselector',
                        itemId: 'documentViewSelector',
                        allowToggle: false,
                        navigationView: 'mainview',
                        displayViews: true,
                        align: 'center',
                        padding: 4,
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('Documents', 'WorkplacePortal.view.ServiceDeskRequestForm'),
                                documentSelect: true,
                                view: 'serviceDeskDocumentList',
                                store: 'serviceDeskRequestsStore'
                            }
                        ]
                    }
                ]
            }
        ]
    },

    initialize: function () {
        this.callParent();

        // set labels from schema definition (TableDef)
        this.setFieldLabelAndLength('activity_log_sync');

        // set hidden fields
        this.setHiddenFields();

        // init fields
        this.initFields();

        // set field values from enumlists
        this.setEnumerationLists();
    },

    setEnumerationLists: function () {
        var me = this,
            fieldNames = ['status'];

        Ext.each(fieldNames, function (fieldName) {
            var fieldEnumList = TableDef.getEnumeratedList('activity_log_sync', fieldName);

            if (fieldEnumList && fieldEnumList.length > 0) {
                me.query('selectfield[name=' + fieldName + ']')[0].setOptions(fieldEnumList);
            }
        });
    },

    setHiddenFields: function () {
        var isCreateView = this.getIsCreateView(),
            requestorInfFieldSet = this.query('#requestorInfFieldSet')[0],
            viewSelector = this.query('#documentViewSelector');

        requestorInfFieldSet.setHidden(!isCreateView);

        if (viewSelector) {
            viewSelector[0].setHidden(isCreateView);
        }
    },

    initFields: function (record) {
        var isCreateView = this.getIsCreateView(),
            activityTypeValue = this.getActivityType();

        if (isCreateView) {
            if (record) {
                record.set('activity_type', activityTypeValue);
            }
        }

        this.setRequiredFields(record);
    },

    setReadOnlyFields: function (record) {
        var isCreateView = this.getIsCreateView(),
            status = record.get('status');

        this.query('field[name=site_id]')[0].setReadOnly(!isCreateView && status !== 'CREATED');
        this.query('field[name=bl_id]')[0].setReadOnly(!isCreateView && status !== 'CREATED');
        this.query('field[name=fl_id]')[0].setReadOnly(!isCreateView && status !== 'CREATED');
        this.query('field[name=rm_id]')[0].setReadOnly(!isCreateView && status !== 'CREATED');
        this.down('problemtypefield').setReadOnly(!isCreateView && status !== 'CREATED');
        this.query('field[name=description]')[0].setReadOnly(!isCreateView && status !== 'CREATED');
    },

    setRequiredFields: function (record) {
        var activityType,
            probTypeField = this.down('problemtypefield'),
            probTypeValidation = false,
            blIdField = this.down('buildingPrompt'),
            blIdValidation = false;

        if (record) {
            activityType = record.get('activity_type');

            Ext.each(record.getValidations().items, function (validation) {
                if (validation.type === 'presence' && validation.field === 'prob_type') {
                    probTypeValidation = true;
                }
                if (validation.type === 'presence' && validation.field === 'bl_id') {
                    blIdValidation = true;
                }
            });

            if (activityType === 'SERVICE DESK - MAINTENANCE') {
                probTypeField.setHidden(false);
                if (!probTypeValidation) {
                    record.getValidations().add(record.probTypeValidation);
                }
                blIdField.setRequired(true);
                if (!blIdValidation) {
                    record.getValidations().add(record.blIdValidation);
                }
            } else {
                probTypeField.setHidden(true);
                if (probTypeValidation) {
                    record.getValidations().remove(record.probTypeValidation);
                }
                blIdField.setRequired(false);
                if (blIdValidation) {
                    record.getValidations().remove(record.blIdValidation);
                }
            }
        }
    },

    initFieldsFromUserProfile: function (record) {
        var userProfile = UserProfile.getUserProfile();

        if (this.getIsCreateView()) {
            record.set('requestor', userProfile.em_id);
            record.set('phone_requestor', userProfile.phone);
            record.set('site_id', userProfile.site_id);
            record.set('bl_id', userProfile.bl_id);
            record.set('fl_id', userProfile.fl_id);
            record.set('rm_id', userProfile.rm_id);
        }
    },

    applyRecord: function (record) {
        var status,
            viewSelector = this.down('viewselector');

        if (record) {
            this.initFields(record);
            status = record.get('status');
            this.setReadOnlyFields(record);
            if ((status === 'REQUESTED' || status === 'APPROVED')) {
            	this.query('field[name=description]')[0].setReadOnly(false);
            }
            this.initFieldsFromUserProfile(record);
        }

        if (record && viewSelector) {
            viewSelector.setRecord(record);
        }

        return record;
    },

    /**
     * Displays the photo images when the form is in create mode
     */
    applyPhotoData: function () {
        var me = this,
            record = me.getRecord(),
            documentFields = me.query('documentfield');

        if (record && record !== null) {
            Ext.each(documentFields, function (docField) {
                docField.setRecord(record);
                if (docField.getImageData().length > 0) {
                    docField.setHidden(false);
                }
            }, me);
        }
    }
});