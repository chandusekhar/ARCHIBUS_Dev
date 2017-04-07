/**
 * Work Request Create and Update View.
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Maintenance.view.WorkRequestEdit', {
    extend: 'Maintenance.view.WorkRequestEditBase',

    requires: [
        'Common.control.Select',
        'Common.control.field.Prompt',
        'Common.control.prompt.ProblemType',
        'Common.control.prompt.Site',
        'Common.control.prompt.Building',
        'Common.control.prompt.Floor',
        'Common.control.prompt.Room',
        'Common.control.prompt.Equipment',
        'Common.control.field.Document',
        'Common.control.field.Calendar',
        'Maintenance.view.ViewSelector'
    ],

    xtype: 'workRequestPanel',

    config: {

        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',

        editTitle: Ext.os.is.Phone ? LocaleManager.getLocalizedString('Update', 'Maintenance.view.WorkRequestEdit') :
            LocaleManager.getLocalizedString('Update', 'Maintenance.view.WorkRequestEdit'),

        addTitle: LocaleManager.getLocalizedString('Create Work Request',
            'Maintenance.view.WorkRequestEdit'),

        /**
         * @cfg {String} requestType Indicates if this view is being used to create a My Work or a My
         *      Request Work Order. Values are MyWork and MyRequest
         */
        requestType: Constants.MyWork,

        isLinkNewForm: false,
        displayMode: '',
        isRelatedRequest: false,

        items: [
            {
                xtype: 'formheader',
                workRequestId: '',
                dateValue: '',
                displayLabels: !Ext.os.is.Phone,
                dateLabel: LocaleManager.getLocalizedString('Requested',
                    'Maintenance.view.WorkRequestEdit')
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                style: 'background-color: #EFF3F9;',
                items: [
                    {
                        xtype: 'workrequestviewselector',
                        centered: true,
                        allowToggle: false,
                        navigationView: 'mainview',
                        displayViews: true,

                        items: [
                            {
                                text: LocaleManager.getLocalizedString('Craftspersons', 'Maintenance.view.WorkRequestEdit'),
                                store: 'workRequestCraftspersonsStore',
                                itemId: 'sgbtnCraftPersons',
                                view: 'workRequestCraftspersonListPanel'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Parts', 'Maintenance.view.WorkRequestEdit'),
                                store: 'workRequestPartsStore',
                                itemId: 'sgbtnParts',
                                view: 'workRequestPartListPanel'
                            },

                            {
                                text: LocaleManager.getLocalizedString('Tools', 'Maintenance.view.WorkRequestEdit'),
                                itemId: 'sgbtnTools',
                                store: 'workRequestToolsStore',
                                view: 'scheduleFormTools'
                            },

                            {
                                text: LocaleManager.getLocalizedString('Costs', 'Maintenance.view.WorkRequestEdit'),
                                store: 'workRequestCostsStore',
                                itemId: 'sgbtnCosts',
                                view: 'workRequestCostPanel'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Documents', 'Maintenance.view.WorkRequestEdit'),
                                documentSelect: true,
                                itemId: 'sgbtnDocuments',
                                view: 'workRequestDocumentList',
                                store: 'workRequestsStore'
                            },
                            //KB#3050980 Add Tab of Work Request References
                            {
                                text: LocaleManager.getLocalizedString('References', 'Maintenance.view.manager.WorkRequestEdit'),
                                documentSelect: false,
                                showBadgeText: true,
                                view: 'workRequestReferencesList',
                                store: 'referenceStore'
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'fieldset',
                style: 'margin-top:0.2em',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'employeePrompt',
                        name: 'requestor',
                        valueField: 'em_id',
                        label: LocaleManager.getLocalizedString('Requested By', 'Maintenance.view.WorkRequestEdit')
                    },
                    {
                        xtype: 'sitePrompt',
                        hidden: true,
                        disableFilter: true,
                        childFields: []
                    },
                    {
                        xtype: 'hiddenfield',
                        name: 'date_requested'
                    },
                    {
                        xtype: 'buildingPrompt',
                        resetParentValueOnClear: true
                    },
                    {
                        xtype: 'floorPrompt',
                        store: 'floorPromptStore'
                    },
                    {
                        xtype: 'roomPrompt',
                        store: 'roomPromptStore'
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'location',
                        label: LocaleManager.getLocalizedString('Problem Location', 'Maintenance.view.WorkRequestEdit')
                    },

                    {
                        xtype: 'problemtypefield',
                        name: 'prob_type',
                        label: LocaleManager.getLocalizedString('Problem Type', 'Maintenance.view.WorkRequestEdit')
                    },
                    {
                        xtype: 'selectfield',
                        readOnly: true,
                        name: 'status',
                        label: LocaleManager.getLocalizedString('Status', 'Maintenance.view.WorkRequestEdit'),
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        // The standard status values are provided for the case
                        // where the TableDef object is not available.
                        options: [
                            {
                                displayValue: 'Requested',
                                objectValue: 'R'
                            },
                            {
                                displayValue: 'Reviewed but On Hold',
                                objectValue: 'Rev'
                            },
                            {
                                displayValue: 'Rejected',
                                objectValue: 'Rej'
                            },
                            {
                                displayValue: 'Approved',
                                objectValue: 'A'
                            },
                            {
                                displayValue: 'Assigned to Work Order',
                                objectValue: 'AA'
                            },
                            {
                                displayValue: 'Issued and In Process',
                                objectValue: 'I'
                            },
                            {
                                displayValue: 'On Hold for Parts',
                                objectValue: 'HP'
                            },
                            {
                                displayValue: 'On Hold for Access',
                                objectValue: 'HA'
                            },
                            {
                                displayValue: 'On Hold for Labor',
                                objectValue: 'HL'
                            },
                            {
                                displayValue: 'Stopped',
                                objectValue: 'S'
                            },
                            {
                                displayValue: 'Cancelled',
                                objectValue: 'Can'
                            },
                            {
                                displayValue: 'Completed',
                                objectValue: 'Com'
                            },
                            {
                                displayValue: 'Closed',
                                objectValue: 'Clo'
                            }
                        ]
                    },
                    {
                        xtype: Ext.os.is.Phone ? 'prompt' : 'selectlistfield',
                        label: LocaleManager.getLocalizedString('Cause Type', 'Maintenance.view.WorkRequestEdit'),
                        title: LocaleManager.getLocalizedString('Cause Type', 'Maintenance.view.WorkRequestEdit'),
                        name: 'cause_type',
                        valueField: 'cause_type',
                        displayField: 'description',
                        store: 'causesStore',
                        tabletPickerWordWrap: true,
                        value: '',
                        displayFields: [
                            {
                                name: 'cause_type',
                                title: LocaleManager.getLocalizedString('Code', 'Maintenance.view.WorkRequestEdit')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Cause Type', 'Maintenance.view.WorkRequestEdit')
                            }

                        ],
                        headerTemplate: {
                            phone: '<div></div>'
                        },
                        displayTemplate: {
                            phone: '<div style="font-weight:bold;padding:2px">{cause_type}</div>' +
                            '<div style="font-size=0.8em;padding:2px">{description}</div>'
                        }
                    },
                    {
                        xtype: Ext.os.is.Phone ? 'prompt' : 'selectlistfield',
                        label: LocaleManager.getLocalizedString('Repair Type', 'Maintenance.view.WorkRequestEdit'),
                        title: LocaleManager.getLocalizedString('Repair Type', 'Maintenance.view.WorkRequestEdit'),
                        name: 'repair_type',
                        valueField: 'repair_type',
                        displayField: 'description',
                        store: 'repairTypesStore',
                        tabletPickerWordWrap: true,
                        displayFields: [
                            {
                                name: 'repair_type',
                                title: LocaleManager.getLocalizedString('Code', 'Maintenance.view.WorkRequestEdit')
                            },
                            {
                                name: 'description',
                                title: LocaleManager.getLocalizedString('Repair Type', 'Maintenance.view.WorkRequestEdit')
                            }

                        ],
                        headerTemplate: {
                            phone: '<div></div>'
                        },
                        displayTemplate: {
                            phone: '<div style="font-weight:bold;padding:2px">{repair_type}</div>' +
                            '<div style="font-size=0.8em;padding:2px">{description}</div>'
                        }
                    },
                    {
                        xtype: 'commontextfield',
                        hidden: 'true',
                        name: 'pmp_id',
                        label: LocaleManager.getLocalizedString('PM Procedure', 'Maintenance.view.WorkRequestEdit')
                    },
                    {
                        xtype: 'equipmentPrompt',
                        parentFields: ['site_id', 'bl_id', 'fl_id', 'rm_id']
                    },
                    {
                        xtype: 'calendarfield',
                        hidden: 'true',
                        name: 'date_assigned',
                        label: LocaleManager.getLocalizedString('Assigned Date', 'Maintenance.view.WorkRequestEdit'),
                        readOnly: true
                    },
                    {
                        xtype: 'calendarfield',
                        hidden: 'true',
                        name: 'date_est_completion',
                        label: LocaleManager.getLocalizedString('Scheduled Date', 'Maintenance.view.WorkRequestEdit'),
                        readOnly: true
                    },
                    {
                        xtype: 'textpromptfield',
                        label: LocaleManager.getLocalizedString('Description', 'Maintenance.view.WorkRequestEdit'),
                        name: 'description',
                        title: LocaleManager.getLocalizedString('Problem Description',
                            'Maintenance.view.WorkRequestEdit'),
                        labelAlign: Ext.os.is.Phone ? 'top' : 'left',
                        valueField: 'pd_description',
                        store: 'problemDescriptionsStore',
                        listTpl: '<div>{pd_id}</div><div style="color:gray">{pd_description}</div>',
                        displayEditPanel: true
                    },
                    {
                        xtype: 'textpromptfield',
                        name: 'cf_notes',
                        label: LocaleManager.getLocalizedString('Craftsperson Notes', 'Maintenance.view.WorkRequestEdit'),
                        title: LocaleManager.getLocalizedString('Craftsperson Notes',
                            'Maintenance.view.WorkRequestEdit'),
                        labelAlign: Ext.os.is.Phone ? 'top' : 'left',
                        valueField: 'pr_description',
                        store: 'problemResolutionsStore',
                        listTpl: '<div>{pr_id}</div><div style="color:gray">{pr_description}</div>',
                        displayEditPanel: true
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'related_reuqests',
                        readOnly: true,
                        label: LocaleManager.getLocalizedString('Related Requests', 'Maintenance.view.manager.RequestDetails')
                    },
                    {
                        xtype: 'commontextfield',
                        hidden: 'true',
                        name: 'parent_wr_id'
                    }
                ]
            },
            {
                xytpe: 'container',
                layout: {
                    type: 'hbox',
                    pack: 'center',
                    align: 'center'
                },
                defaults: {
                    xtype: 'documentfield',
                    hidden: true
                },
                items: [
                    {
                        name: 'doc1_contents',
                        label: LocaleManager.getLocalizedString('Photo 1', 'Maintenance.view.WorkRequestEdit')
                    },
                    {
                        name: 'doc2_contents',
                        label: LocaleManager.getLocalizedString('Photo 2', 'Maintenance.view.WorkRequestEdit')
                    },
                    {
                        name: 'doc3_contents',
                        label: LocaleManager.getLocalizedString('Photo 3', 'Maintenance.view.WorkRequestEdit')
                    },
                    {
                        name: 'doc4_contents',
                        label: LocaleManager.getLocalizedString('Photo 4', 'Maintenance.view.WorkRequestEdit')
                    }
                ]
            }

        ]
    },

    /**
     * show create related work reuqests
     */
    showCreateRelatedRequestTitle: function () {
        this.down('title').setTitle(LocaleManager.getLocalizedString('Create Related Work Request', 'Maintenance.view.WorkRequestEdit'));
    },

    initialize: function () {
        // Hide the segmented button if we are creating a work
        // request
        var me = this,
            isCreateView = me.getIsCreateView(),
            statusEnumList,
            dateRequestedField,
            problemTypeField;

        me.callParent();

        // Set the Date Requested value in the form header
        dateRequestedField = me.query('hiddenfield[name=date_requested]')[0];
        dateRequestedField.on('change', me.onDateRequestedChanged, me);

        problemTypeField = me.down('problemtypefield');
        problemTypeField.on('change', me.onProblemTypeChanged, me);

        statusEnumList = TableDef.getEnumeratedList('wr_sync', 'status');
        if (statusEnumList && statusEnumList.length > 0) {
            me.query('selectfield[name=status]')[0].setOptions(statusEnumList);
        }

        me.setFormView();
        me.setReadOnlyFields(isCreateView);
        me.setFieldLabelAndLength('wr_sync');
        if (isCreateView) {
            me.down('[name=related_reuqests]').setHidden(true);
        }

        if (me.getIsRelatedRequest()) {
            this.down('title').setTitle(LocaleManager.getLocalizedString('Work Request Details', 'Maintenance.view.WorkRequestEdit'));
        }
    },

    onDateRequestedChanged: function (field, newValue) {
        var me = this,
            formheader = me.down('formheader');
        formheader.setDateValue(newValue);
    },


    onProblemTypeChanged: function (field, newValue) {
        if (newValue === 'PREVENTIVE MAINT') {
            this.setPmFormView();
        }
    },


    setFormView: function () {
        var me = this,
            isCreateView = me.getIsCreateView(),
            problemType = me.getValues().prob_type;

        if (isCreateView) {
            me.setCreateView();
        }

        if (problemType === 'PREVENTIVE MAINT' && !isCreateView) {
            me.setPmFormView();
        }
    },

    setPmFormView: function () {
        var me = this,
            isCreateView = me.getIsCreateView(),
            pmpField = me.query('[name=pmp_id]')[0],
            eqField = me.query('[name=eq_id]')[0],
            roomPromptField = me.down('roomPrompt'),
            floorPromptField = me.down('floorPrompt'),
            dateAssignedField = me.query('[name=date_assigned]')[0],
            dateEstCompletionField = me.query('[name=date_est_completion]')[0];

        if(!isCreateView){
        	pmpField.setHidden(false);
            pmpField.setReadOnly(true);
            eqField.setReadOnly(true);
            roomPromptField.setReadOnly(true);
            floorPromptField.setReadOnly(true);
            dateAssignedField.setHidden(false);
            dateEstCompletionField.setHidden(false);
        }
        
    },

    setCreateView: function () {
        var me = this,
            userProfile,
            record = me.getRecord(),
            statusFields = me.query('[name=status]'),
            craftsPersonFields = me.query('[name=cf_notes]'),
            segmentedButton = me.query('toolbar > segmentedbutton'),
            causeTypeField = me.down('field[name=cause_type]'),
            repairTypeField = me.down('field[name=repair_type]');

        // Get the user profile values for the current user
        userProfile = Common.util.UserProfile.getUserProfile();

        // Get the cached employee id from the ConfigFileManager
        userProfile.requestor = ConfigFileManager.employeeId;

        me.setValues(userProfile);

        // set the record data
        record.setData(userProfile);

        if (statusFields) {
            statusFields[0].setHidden(true);
        }
        if (craftsPersonFields) {
            craftsPersonFields[0].setHidden(true);
        }

        // Hide the repair_type and cause_type fields.
        causeTypeField.setHidden(true);
        repairTypeField.setHidden(true);

        // Hide the segmented button if this is a create view
        if (segmentedButton) {
            segmentedButton[0].setHidden(true);
        }
    },

    setReadOnlyFields: function (isCreateView) {

        var me = this,
        //description = me.query('field[name=description]')[0],
            building = me.query('field[name=bl_id]')[0],
            problemType = me.down('problemtypefield'),
            isReadOnly = !isCreateView;

        //description.setReadOnly(isReadOnly);
        building.setReadOnly(isReadOnly);
        problemType.setReadOnly(isReadOnly);
    },

    applyViewIds: function (config) {
        var me = this,
            formHeader = me.down('formheader');
        formHeader.setWorkRequestId(config.workRequestId);
        return config;
    },

    applyRequestType: function (config) {
        var me = this,
            record = me.getRecord();
        if (record) {
            record.set('request_type', config === Constants.MyWork ? 0 : 1);
        }
        return config;
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
    },

    applyRecord: function (record) {
        var me = this,
            fields,
            viewIds = {},
            viewSelector = me.down('viewselector');

        if (record) {
            viewIds.workRequestId = record.get('wr_id');
            viewIds.mobileId = record.getId();
            me.setViewIds(viewIds);

            if (viewSelector) {
                viewSelector.setRecord(record);
            }

            //kb#3046249: for 'requested' work request, hide the repair_type field.
            //KB#3048724: The repair type and cause code should be hiden in requested and approved status
            if (record.get('status') === 'R' || record.get('status') === 'AA') {
                me.down('field[name=repair_type]').setHidden(true);
                me.down('field[name=cause_type]').setHidden(true);
                me.down('field[name=cf_notes]').setHidden(true);
            }

            if ((me.getDisplayMode() === Constants.MyRequests) && (record.get('status') === 'I' || record.get('status') === 'Com' || record.get('status') === 'HP' || record.get('status') === 'HL' || record.get('status') === 'HA')) {
                me.down('[name=location]').setReadOnly(true);
                me.down('[name=description]').setReadOnly(true);
                me.down('field[name=repair_type]').setReadOnly(true);
                me.down('field[name=cause_type]').setReadOnly(true);
                me.down('field[name=cf_notes]').setReadOnly(true);
            }

            //related work request and the current user cannot access this request directly, set all field read-only
            if (record.get('request_type') === 2 || record.get('prob_type') === 'PREVENTIVE MAINT') {
                fields = me.query('field');
                Ext.each(fields, function (field) {
                    field.setReadOnly(true);
                });
            }

            //hide resource tabs for linked requests and this reqeusts cannot access by current user
            if(record.get('request_type') === 2 || me.getDisplayMode() === Constants.MyRequests){
                viewSelector.getComponent('sgbtnCraftPersons').hide();
                viewSelector.getComponent('sgbtnParts').hide();
                viewSelector.getComponent('sgbtnCosts').hide();
                viewSelector.getComponent('sgbtnTools').hide();
            }
        }

        return record;
    }
});