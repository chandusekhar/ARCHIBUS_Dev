Ext.define('ConditionAssessment.view.ConditionAssessment', {
    extend: 'Common.view.navigation.EditBase',

    xtype: 'conditionAssessmentEditPanel',

    requires: [
        'Common.control.field.TextPrompt',
        'Common.control.prompt.Building',
        'Common.control.prompt.Floor',
        'Common.control.prompt.Room',
        'Common.control.field.Number',
        'Common.view.navigation.ViewSelector',
        'Common.control.field.Document',
        'Questionnaire.view.Questionnaire'
    ],

    config: {
        // Disable overscroll to prevent errors when handling the swipe event.
        scrollable: {
            directionLock: true,
            direction: 'vertical'
        },

        title: LocaleManager.getLocalizedString('Edit Assessment', 'ConditionAssessment.view.ConditionAssessment'),
        addTitle: LocaleManager.getLocalizedString('Add Assessment', 'ConditionAssessment.view.ConditionAssessment'),

        addViewClass: 'ConditionAssessment.view.ConditionAssessment',

        model: 'ConditionAssessment.model.ConditionAssessment',
        storeId: 'conditionAssessmentsStore',

        //layout: 'vbox',

        // fields to be copied from edit view to new view
        copyValuesFieldNames: ['site_id', 'bl_id', 'fl_id', 'rm_id', 'eq_id', 'project_id', 'assessed_by', 'activity_type'],

        initialRecord: null,

        toolBarButtons: [
            {
                xtype: 'camera',
                align: 'left',
                iconCls: 'camera',
                displayOn: 'all',
                appName: 'ConditionAssessment'
            },
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Complete', 'ConditionAssessment.view.ConditionAssessment'),
                ui: 'action',
                align: 'right',
                action: 'completeAssessment',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                iconCls: 'redline',
                align: 'right',
                action: 'openRedline',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'fieldset',
                title: '',
                defaults: {
                    labelWrap: true,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    labelWidth: '40%'
                },
                items: [

                    {
                        xtype: 'commontext',
                        name: 'date_assessed',
                        value: new Date(),
                        hidden: true
                    },
                    {
                        xtype: 'commontext',
                        name: 'project_id',
                        readOnly: true
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'activity_type',
                        valueField: 'objectValue',
                        displayField: 'displayValue'
                    },
                    {
                        xtype: 'sitePrompt',
                        store: 'assessmentSitesStore',
                        name: 'site_id',
                        readOnly: true
                    },
                    {
                        xtype: 'buildingPrompt',
                        store: 'assessmentBuildingsStore'
                    },
                    {
                        xtype: 'floorPrompt',
                        store: 'assessmentFloorsStore'
                    },
                    {
                        xtype: 'roomPrompt',
                        store: 'assessmentRoomsStore'
                    },
                    {
                        xtype: 'commontext',
                        name: 'location',
                        maxLength: 50
                    },
                    {
                        xtype: 'barcodefield',
                        name: 'eq_id',
                        readOnly: true,
                        barcodeFormat: [{fields: ['eq_id']}]
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'cond_priority',
                        valueField: 'objectValue',
                        displayField: 'displayValue'
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'sust_priority',
                        valueField: 'objectValue',
                        displayField: 'displayValue'
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'cond_value',
                        valueField: 'objectValue',
                        displayField: 'displayValue'
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'rec_action',
                        valueField: 'objectValue',
                        displayField: 'displayValue'
                    },
                    {
                        xtype: 'formattednumberfield',
						label: LocaleManager.getLocalizedString('Cost of FIM', 'ConditionAssessment.view.ConditionAssessment'),
                        name: 'cost_fim',
                        labelFormat: 'currency',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
                    {
                        xtype: 'formattednumberfield',
						label: LocaleManager.getLocalizedString('Annual Saving', 'ConditionAssessment.view.ConditionAssessment'),
                        name: 'cost_annual_save',
                        labelFormat: 'currency',
                        numericKeyboard: Ext.os.is.Phone ? false : true
                    },
					{
                        xtype: 'selectfield',
                        label: LocaleManager.getLocalizedString('Facility Improvement Measure(FIM)', 'ConditionAssessment.view.ConditionAssessment'),
                        name: 'uc_fim',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        options: [
                            { displayValue: LocaleManager.getLocalizedString('Not Entered', 'ConditionAssessment.view.ConditionAssessment'), objectValue: '0' },
                            { displayValue: LocaleManager.getLocalizedString('No', 'ConditionAssessment.view.ConditionAssessment'), objectValue: '1' },
                            { displayValue: LocaleManager.getLocalizedString('Yes', 'ConditionAssessment.view.ConditionAssessment'), objectValue: '2' }
                        ]
                    },
                    {
                        xtype: 'textpromptfield',
                        name: 'description',
                        title: LocaleManager.getLocalizedString('Problem Description', 'ConditionAssessment.view.ConditionAssessment'),
                        valueField: 'pd_description',
                        store: 'problemDescriptionsStore',
                        listTpl: '<div>{pd_id}</div><div style="color:gray">{pd_description}</div>',
                        required: true,
                        displayEditPanel: true
                    },
                    {
                        xtype: 'questionnaire',
                        hidden: true,
                        autoSave: true
                    }
                ]
            },

            {
                xtype: 'container',
                docked: 'bottom',
                cls: 'ab-carousel-footer',
                layout: {
                    type: 'hbox',
                    align: 'center',
                    pack: 'center'
                },

                items: [
                    {
                        xtype: 'viewselector',
                        itemId: 'documentViewSelector',
                        padding: 4,
                        allowToggle: false,
                        navigationView: 'mainview',
                        displayViews: true,
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('Documents', 'ConditionAssessment.view.ConditionAssessment'),
                                documentSelect: true,
                                view: 'conditionAssessmentDocumentsList',
                                store: 'conditionAssessmentsStore'
                            }
                        ]
                    }
                ]
            },

            {
                xytpe: 'container',
                layout: 'hbox',
                style: 'height:120px;padding-left:180px',
                defaults: {
                    xtype: 'documentfield',
                    hidden: true
                },
                items: [
                    {
                        name: 'doc_contents',
                        label: LocaleManager.getLocalizedString('Photo 1', 'ConditionAssessment.view.ConditionAssessment')
                    },
                    {
                        name: 'doc1_contents',
                        label: LocaleManager.getLocalizedString('Photo 2', 'ConditionAssessment.view.ConditionAssessment')
                    },
                    {
                        name: 'doc2_contents',
                        label: LocaleManager.getLocalizedString('Photo 3', 'ConditionAssessment.view.ConditionAssessment')
                    },
                    {
                        name: 'doc3_contents',
                        label: LocaleManager.getLocalizedString('Photo 4', 'ConditionAssessment.view.ConditionAssessment')
                    },
                    {
                        name: 'doc4_contents',
                        label: LocaleManager.getLocalizedString('Photo 5', 'ConditionAssessment.view.ConditionAssessment')
                    }
                ]
            }
        ]
    },

    initialize: function () {
        var me = this;

        me.callParent();

        // set labels from schema definition (TableDef)
        me.setFieldLabelAndLength('activity_log_sync');

        // set field values from enumlists
        me.setEnumerationLists();
    },

    /*
     * Set option values for enum list fields.
     */
    setEnumerationLists: function () {
        var me = this,
            fieldNames = ['cond_priority', 'sust_priority', 'cond_value', 'rec_action'];

        Ext.each(fieldNames, function (fieldName) {
            var fieldEnumList = TableDef.getEnumeratedList('activity_log_sync', fieldName);

            if (fieldEnumList && fieldEnumList.length > 0) {
                me.query('selectfield[name=' + fieldName + ']')[0].setOptions(fieldEnumList);
            }
        });
    },

    applyRecord: function (record) {
        var me = this,
            viewSelector = me.down('viewselector');

        if (record) {
            if (viewSelector) {
                viewSelector.setRecord(record);
            }

            // Insert the questionnaire form
            me.injectQuestionnaire(record);

            me.initFields(record);
        }

        return record;
    },

    //called on display Add/Edit panel
    initFields: function (record) {
        var me = this,
            isCreateView = me.getIsCreateView();

        me.addActivityTypeOptions(record);

        // set read only fields
        me.setReadOnlyFields(isCreateView, record);

        // hide/show Documents button
        me.setHiddenFields(record);

        // change Styles
        me.setFormStyles(record);

        me.showPriorityField(record);
    },

    /**
     * Set options for field activiy_type.
     * @param record
     */
    addActivityTypeOptions: function (record) {
        var me = this,
            activityTypeValue = record.get('activity_type'),
            activityTypeField = me.query('selectfield[name=activity_type]')[0],
            activityTypesStore = Ext.getStore('activityTypesStore'),
            mobIsChanged = record.get('mob_is_changed'),
            options = [];

        if (activityTypeValue === 'ASSESSMENT') {
            // for Condition Assessment and Sustainability projects
            options = [
                {
                    objectValue: "ASSESSMENT",
                    displayValue: LocaleManager.getLocalizedString('ASSESSMENT', 'ConditionAssessment.view.ConditionAssessment')
                }
            ];
            activityTypeField.setOptions(options);
        } else {
            // Commissioning project
            activityTypesStore.load(function (records) {
                Ext.each(records, function (record) {
                    var value = record.get('activity_type');
                    if (value.indexOf('CX') === 0) {
                        options.push({objectValue: value, displayValue: value});
                    }
                });
                activityTypeField.setOptions(options);
                activityTypeField.setValue(activityTypeValue);
                // set back the mob_is_changed altered by setValue()
                record.set('mob_is_changed', mobIsChanged);
            });
        }
    },

    /*
     If form is in edit mode, not in add mode, then set fields as read only.
     */
    setReadOnlyFields: function (isCreateView, record) {
        var me = this,
            isReadOnly = !isCreateView,
            building = me.query('field[name=bl_id]')[0],
            floor = me.query('field[name=fl_id]')[0],
            room = me.query('field[name=rm_id]')[0],
            eqId = me.query('field[name=eq_id]')[0],
            activityType = me.query('field[name=activity_type]')[0],
            activityTypeIsReadOnly;

        building.setReadOnly(isReadOnly);
        floor.setReadOnly(isReadOnly);
        room.setReadOnly(isReadOnly);
        eqId.setReadOnly(isReadOnly);

        activityTypeIsReadOnly = (record.get('activity_type') === 'ASSESSMENT');
        activityType.setReadOnly(activityTypeIsReadOnly);
    },

    /**
     * Hide Documents button when panel is in create mode since attached images are displayed in container,
     * directly in the current view.
     */
    setHiddenFields: function () {
        var me = this,
            viewSelector = me.query('#documentViewSelector');

        if (viewSelector) {
            viewSelector[0].setHidden(me.getIsCreateView());
        }
    },

    /**
     * Color activity_type field depending on project type.
     * @param record
     */
    setFormStyles: function (record) {
        var me = this,
            activityTypeFieldValueElement = me.query('field[name=activity_type]')[0].element.down('input');

        me.getProjectType(record.get('project_id'), function (project_type) {
            switch (project_type) {
                case 'ASSESSMENT - ENVIRONMENTAL':
                    activityTypeFieldValueElement.setStyle({webkitTextFillColor: 'green'});
                    break;

                case 'COMMISSIONING':
                    activityTypeFieldValueElement.setStyle({webkitTextFillColor: 'royalblue'});
                    break;

                default:
                    activityTypeFieldValueElement.setStyle({webkitTextFillColor: ''});
                    break;
            }
        }, me);
    },

    /**
     * Obtain project type for project id.
     * @param projectId project code
     * @param onCompleted callback function that uses project type sent as parameter
     * @param scope scope of callback function
     */
    getProjectType: function (projectId, onCompleted, scope) {
        var me = this,
            projects = Ext.getStore('assessmentProjectsStore'),
            project;

        if (projects) {
            project = projects.findRecord('project_id', projectId);
            if (project) {
                Ext.callback(onCompleted, scope || me, [project.get('project_type')]);
            } else {
                Ext.callback(onCompleted, scope || me, [null]);
            }
        } else {
            Ext.callback(onCompleted, scope || me, [null]);
        }
    },

    /*
     * Show field Condition Priority or field Sustainability Priority according to project type.
     */
    showPriorityField: function (record) {
        var me = this,
            condPriorityField = me.down('selectfield[name=cond_priority]'),
            sustPriorityField = me.down('selectfield[name=sust_priority]');

        me.getProjectType(record.get('project_id'), function (project_type) {
            if ('ASSESSMENT - ENVIRONMENTAL' === project_type) {
                // Environmental Sustainability projects
                condPriorityField.setHidden(true);
                sustPriorityField.setHidden(false);
            } else {
                condPriorityField.setHidden(false);
                sustPriorityField.setHidden(true);
            }
        }, me);
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

    /**
     * Adds the Questionnaire items to the bottom of the view
     * @param {Ext.data.Model} record
     */
    injectQuestionnaire: function (record) {
        var questionnaireId = record.get('questionnaire_id'),
            questionnairePanel = this.down('questionnaire');

        if (questionnaireId) {
            questionnairePanel.setRecord(record);
            questionnairePanel.setQuestionnaireId(questionnaireId);
            questionnairePanel.setFieldName('act_quest');
            questionnairePanel.setHidden(false);
        }
    }
});