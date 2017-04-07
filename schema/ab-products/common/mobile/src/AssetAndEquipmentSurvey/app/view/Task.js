Ext.define('AssetAndEquipmentSurvey.view.Task', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'taskEditPanel',

    config: {
        title: LocaleManager.getLocalizedString('Edit Task',
            'AssetAndEquipmentSurvey.view.Task'),

        model: 'AssetAndEquipmentSurvey.model.Task',
        storeId: 'surveyTasksStore',


        // Disable overscroll to prevent errors when handling the swipe event.
        scrollable: {
            directionLock: true,
            direction: 'vertical',
            momentumEasing: {
                momentum: {
                    acceleration: 30,
                    friction: 0.5
                },
                bounce: {
                    acceleration: 0.0001,
                    springTension: 0.9999
                },
                minVelocity: 3
            },
            outOfBoundRestrictFactor: 0
        },

        /**
         * @cfg fieldOrder {Array} The order of the fields used when the form fields
         * are generated dynamically
         */
        fieldOrder: ['site_id', 'bl_id', 'fl_id', 'rm_id', 'eq_id', 'num_serial', 'survey_id',
            'dv_id', 'dp_id', 'eq_std', 'marked_for_deletion', 'status', 'em_id', 'survey_comments', 'date_last_surveyed'],

        layout: 'vbox',

        toolBarButtons: [
            {
                xtype: 'camera',
                align: 'left',
                iconCls: 'camera',
                displayOn: 'all',
                appName: 'AssetAndEquipmentSurvey'
            },
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Complete', 'AssetAndEquipmentSurvey.view.Task'),
                action: 'completeSurveyTask',
                ui: 'action',
                displayOn: 'all',
                align: 'right'
            },
            {
                xtype: 'toolbarbutton',
                iconCls: 'redline',
                align: 'right',
                action: 'openRedline',
                displayOn: 'all'
            }
        ],

        surveyId: null,

        /**
         * @cfg surveyField {Object} The default survey field configuration. The survey code
         * field is added to the form if it is not included in the Fields to Survey list
         */
        surveyField: {
            xtype: 'commontextfield',
            labelWidth: '40%',
            name: 'survey_id',
            readOnly: true
        },

        /**
         * @cfg dateLastSurveyedField {Object} The default Date Last Surveyed field configuration. The Date Last Surveyed
         * field is added to the form if it is not included in the Fields to Survey list
         */
        dateLastSurveyedField: {
            xtype: 'commondatepickerfield',
            labelWidth: '40%',
            name: 'date_last_surveyed',
            readOnly: true
        },

        /**
         * @cfg equipmentField {Object} The default equipment code field configuration. The equipment code
         * field is added to the form if it is not included in the Fields to Survey list
         */
        equipmentField: {
            xtype: 'barcodefield',
            labelWidth: '40%',
            name: 'eq_id',
            required: true,
            barcodeFormat: [{fields: ['eq_id']}],
            listeners: {
                keyup: function (field) {
                    field.setValue(field.getValue().toUpperCase());
                }
            }
        },

        /**
         * @cfg numSerialField {Object} The default num_serial field configuration which needs to be a barcode field instead of a common text field.
         */
        numSerialField: {
            xtype: 'barcodefield',
            name: 'num_serial',
            barcodeFormat: [{fields: ['num_serial']}]
        },

        items: [
            {
                xtype: 'fieldset',
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelWidth: '40%'
                },
                items: [
                    {
                        xtype: 'sitePrompt'
                    },
                    {
                        xtype: 'buildingPrompt'
                    },
                    {
                        xtype: 'floorPrompt'
                    },
                    {
                        xtype: 'roomPrompt'
                    },
                    {
                        xtype: 'divisionPrompt'
                    },
                    {
                        xtype: 'departmentPrompt'
                    },
                    {
                        xtype: 'barcodefield',
                        name: 'num_serial',
                        barcodeFormat: [{fields: ['num_serial']}]
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'eq_std'
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'status',
                        valueField: 'objectValue',
                        displayField: 'displayValue'
                    },
                    {
                        xtype: 'employeePrompt',
                        store: 'assetEmployees'
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'survey_comments'
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'marked_for_deletion',
                        valueField: 'objectValue',
                        displayField: 'displayValue'
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
                        name: 'survey_photo_eq_contents',
                        label: LocaleManager.getLocalizedString('Photo', 'AssetAndEquipmentSurvey.view.Task'),
                        labelWidth: '40%'
                    },
                    {
                        name: 'survey_redline_eq_contents',
                        label: LocaleManager.getLocalizedString('Redline Image', 'AssetAndEquipmentSurvey.view.Task'),
                        labelWidth: '40%'
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
                        navigationView: 'main',
                        displayViews: true,
                        padding: 4,
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('Documents', 'AssetAndEquipmentSurvey.view.Task'),
                                documentSelect: true,
                                view: 'taskDocumentList',
                                store: 'surveyTasksStore'
                            }
                        ]
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this,
            record = me.getRecord(),
            surveyIdField,
            statusField;

        // Set title
        if (me.getIsCreateView()) {
            me.setTitle(LocaleManager.getLocalizedString('Add Task', 'AssetAndEquipmentSurvey.view.Task'));
        }

        me.callParent(arguments);

        // Generate form fields dynamically
        me.generateFields();
        me.setCustomFieldsLabels();
        me.setReadOnlyFields();
        me.setFieldLabelAndLength('eq_audit');

        // Set value for field survey_id
        if (me.getIsCreateView()) {
            surveyIdField = me.down('commontextfield[name=survey_id]');
            surveyIdField.setValue(me.getSurveyId());
            record.set('survey_id', me.getSurveyId());

            statusField = me.down('field[name=status]');
            // Set the inital value for the status field to null to force the user to
            // select a status. Validation for the status field is added in the applyRecord
            // function.
            // The status field may not be included in the survey fields. Test before setting
            // the initial value
            if (statusField) {
                statusField.setValue(null);
            }
        }
    },

    applyRecord: function (record) {
        var viewSelector = this.down('viewselector');

        if (record && viewSelector) {
            viewSelector.setRecord(record);
        }

        return record;
    },

    generateFields: function () {
        var me = this,
            fieldSet,
            formItems,
            orderedFormItems,
            validators = [],
            statusField,
            addNumSerial = false;

        // Generate form fields dynamically
        fieldSet = me.down('fieldset');
        formItems = Common.util.Ui.generateFormFields('eq_audit', me.getAssetSurveyId());

        // Only set the dynamic fields if formItems is populated.
        if (formItems && formItems.length > 0) {

            formItems = Ext.Array.filter(formItems, function (item) {
                //changing the em_id field should not update bl, fl or rm fields
                if (item.name === 'em_id') {
                    item.parentFields = [];
                }

                if(item.name === 'num_serial'){
                    addNumSerial = true;
                }

                return (item.name !== 'eq_id' && item.name !== 'survey_id' && item.name !== 'date_last_surveyed' && item.name !== 'num_serial');
            }, me);
            formItems.push(me.getEquipmentField());
            if(addNumSerial === true){
                formItems.push(me.getNumSerialField());
            }
            formItems.push(me.getSurveyField());
            formItems.push(me.getDateLastSurveyedField());

            orderedFormItems = me.setFormItemOrder(formItems);
            fieldSet.setItems(orderedFormItems);

            if (me.getRecord()) {
                validators = me.getRecord().getValidations();
            }

            // If the status field exists in the form then we need to add a presence validation to the model
            if (me.formItemsContainsField(formItems, 'status')) {
                statusField = me.down('field[name=status]');
                statusField.setRequired(true);
                if (validators.length > 0 && !validators.containsKey('status-presence')) {
                    validators.add({type: 'presence', field: 'status'});
                }
            } else {
                // if status field is not displayed don't validate it
                if (validators.length > 0 && validators.containsKey('status-presence')) {
                    validators.remove(validators.get('status-presence'));
                }
            }
        }
    },

    formItemsContainsField: function (formItems, fieldName) {
        var me = this,
            fieldExists = false;

        Ext.each(formItems, function (item) {
            if (item.name === fieldName) {
                fieldExists = true;
                return false;
            }
        }, me);

        return fieldExists;

    },

    /**
     * Set custom field labels for generated fields.
     */
    setCustomFieldsLabels: function () {
        var surveyCommentField = this.down('commontextareafield[name=survey_comments]'),
            surveyCommentFieldLabel = LocaleManager.getLocalizedString('Survey Comments', 'AssetAndEquipmentSurvey.view.Task');

        if (surveyCommentField) {
            surveyCommentField.setUseFieldDefLabel(false);
            // custom shorter label
            surveyCommentField.setLabel(surveyCommentFieldLabel);
        }
    },

    /**
     * Gets the survey_id from the carousel container if the view survey_id value is null
     * We have to do this because the Task view is controlled by the TaskCarousel
     */
    getAssetSurveyId: function () {
        var me = this,
            surveyId = me.getSurveyId(),
            carousel = Ext.ComponentQuery.query('taskcarousel');

        if (surveyId === null && carousel && carousel.length > 0) {
            surveyId = carousel[0].getSurveyId();
        }

        return surveyId;
    },

    setFormItemOrder: function (formItems) {
        var me = this,
            fieldOrder = this.getFieldOrder(),
            orderedFormItems = [];

        Ext.each(fieldOrder, function (field) {
            Ext.Array.filter(formItems, function (item) {
                if (item.name === field) {
                    orderedFormItems.push(item);
                }
            }, me);
        }, me);

        return orderedFormItems;
    },

    setReadOnlyFields: function () {
        var me = this,
            isCreateView = me.getIsCreateView(),
            eqPrompt = me.query('textfield[name=eq_id]'),
            surveyIdField = me.query('textfield[name=survey_id]'),
            dateLastSurveyed = me.query('datepickerfield[name=date_last_surveyed]'),
            viewSelector = me.query('#documentViewSelector');

        if (eqPrompt) {
            eqPrompt[0].setReadOnly(!isCreateView);
        }

        if (viewSelector) {
            viewSelector[0].setHidden(isCreateView);
        }

        // Always set the survey id field to read only
        // if it is included in the fields to display
        if (surveyIdField && surveyIdField.length > 0) {
            surveyIdField[0].setReadOnly(true);
        }


        // Always set the date last surveyed field to read only
        // if it is included in the fields to display
        if (dateLastSurveyed && dateLastSurveyed.length > 0) {
            dateLastSurveyed[0].setReadOnly(true);
        }
    },

    setAllFieldsReadOnly: function () {
        var fields = this.query('field');

        Ext.each(fields, function (field) {
            field.setReadOnly(true);
        });
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