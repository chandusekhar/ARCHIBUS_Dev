Ext.define('SpaceBook.view.RoomSurvey', {
    extend: 'Common.view.navigation.EditBase',

    requires: ['Common.control.Select',
        'Common.control.prompt.Division',
        'Common.control.prompt.Department',
        'Common.control.prompt.RoomCategory',
        'Common.control.prompt.RoomType',
        'Common.control.prompt.RoomStandard',
        'Common.control.Camera',
        'Ext.field.DatePicker'],

    xtype: 'spaceRoomSurveyPanel',

    config: {
        model: 'Space.model.RoomSurvey',
        storeId: 'roomSurveyStore',

        toolBarButtons: [
            {
                xtype: 'camera',
                align: 'left',
                iconCls: 'camera',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Complete', 'SpaceBook.view.RoomSurvey'),
                action: 'completeSurveyTask',
                displayOn: 'all',
                align: 'right',
                ui: 'action'
            }
        ],

        items: [
            {
                xtype: 'fieldset',
                title: LocaleManager.getLocalizedString('Survey Room', 'SpaceBook.view.RoomSurvey'),
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : '',
                    xtype: 'textfield',
                    readOnly: true,
                    labelWidth: '40%'
                },
                items: [
                    {
                        name: 'survey_id'
                    },
                    {
                        name: 'bl_id'
                    },
                    {
                        name: 'fl_id'
                    },
                    {
                        name: 'rm_id'
                    },
                    {
                        xtype: 'datepickerfield',
                        name: 'date_last_surveyed',
                        readOnly: true
                    }
                ]
            },
            {
                xtype: 'fieldset',
                title: LocaleManager.getLocalizedString('Room Information', 'SpaceBook.view.RoomSurvey'),
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'roomCategoryPrompt'
                    },
                    {
                        xtype: 'roomTypePrompt'
                    },
                    {
                        xtype: 'roomStandardPrompt'
                    },
                    {
                        xtype: 'selectlistfield',
                        store: 'roomUsesStore',
                        valueField: 'rm_use',
                        displayField: 'description',
                        name: 'rm_use'
                    },
                    {
                        xtype: 'commontextfield',
                        name: 'name'
                    }
                ]
            },
            {
                xtype: 'fieldset',
                title: LocaleManager.getLocalizedString('Organizational Information', 'SpaceBook.view.RoomSurvey'),
                defaults: {
                    labelWrap: Ext.os.is.Phone ? true : false,
                    labelCls: Ext.os.is.Phone ? 'x-form-label-phone' : ''
                },
                items: [
                    {
                        xtype: 'divisionPrompt'
                    },
                    {
                        xtype: 'departmentPrompt'
                    },
                    {
                        xtype: 'commontextareafield',
                        name: 'survey_comments_rm',
                        displayEditPanel: true,
                        useNativeTextArea: true
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

                items: [
                    {
                        xtype: 'viewselector',
                        itemId: 'documentViewSelector',
                        allowToggle: false,
                        navigationView: 'mainview',
                        displayViews: true,
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('Documents', 'SpaceBook.view.RoomSurvey'),
                                documentSelect: true,
                                view: 'spaceBookDocumentList',
                                store: 'roomSurveyStore'
                            }
                        ]
                    }
                ]
            }
        ]
    },

    initialize: function () {
        this.callParent(arguments);
        this.setFieldLabelAndLength('surveyrm_sync');
    },

    applyRecord: function (record) {
        var viewSelector = this.down('viewselector');

        if (record && viewSelector) {
            viewSelector.setRecord(record);
        }

        return record;
    }

});