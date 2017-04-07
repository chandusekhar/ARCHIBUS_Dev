Ext.define('SpaceOccupancy.view.RoomSurvey', {
    extend: 'Common.view.navigation.EditBase',

    requires: [
        'Common.control.Select',
        'Common.control.Camera',
        'Common.view.navigation.ViewSelector'
    ],

    xtype: 'spaceOccupRoomSurveyPanel',

    config: {
        layout: Ext.os.is.Phone ? 'vbox' : 'hbox',

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

        toolBarButtons: [
            {
                xtype: 'camera',
                align: 'left',
                iconCls: 'camera',
                displayOn: 'all',
                appName: 'SpaceOccupancy'
            },
            {
                xtype: 'toolbarbutton',
                text: LocaleManager.getLocalizedString('Complete', 'SpaceOccupancy.view.RoomSurvey'),
                action: 'completeRoomSurvey',
                displayOn: 'all',
                ui: 'action',
                align: 'right'
            },
            {
                xtype: 'toolbarbutton',
                align: 'right',
                iconCls: 'info',
                action: 'displayRoomInfo'
            }
        ],

        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Survey Room', 'SpaceOccupancy.view.RoomSurvey'),
                docked: 'top'
            },
            {
                xtype: 'titlebar',
                title: '',
                itemId: 'roomSurveyTitleBar',
                docked: 'top'
            },
            {
                xtype: 'roomForm',
                width: Ext.os.is.Phone ? '100%' : '60%',
                flex: Ext.os.is.WindowsPhone ? null : 10,
                ignoreFieldChangeEvents: true
            },
            {
                xtype: 'container',
                layout: 'vbox',
                width: Ext.os.is.Phone ? '100%' : '40%',
                flex: Ext.os.is.WindowsPhone ? null : 7,
                items: [
                    {
                        xtype: 'employeeList',
                        flex: Ext.os.is.WindowsPhone ? null : 3,
                        height: Ext.os.is.Phone ? '10%' : '40%'
                    },
                    {
                        xtype: 'departmentList',
                        flex: Ext.os.is.WindowsPhone ? null : 3,
                        height: Ext.os.is.Phone ? '10%' : '30%'
                    },
                    {
                        xtype: 'categoryList',
                        flex: Ext.os.is.WindowsPhone ? null : 3,
                        height: Ext.os.is.Phone ? '10%' : '30%'
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
                        allowToggle: false,
                        navigationView: 'mainview',
                        displayViews: true,
                        items: [
                            {
                                text: LocaleManager.getLocalizedString('Documents', 'SpaceOccupancy.view.RoomSurvey'),
                                documentSelect: true,
                                view: 'occupancyDocumentList',
                                store: 'occupancyRoomSurveyStore'
                            }
                        ]
                    },
                    {
                        xtype: 'segmentedbutton',
                        allowToggle: false,
                        items: [
                            {
                                itemId: 'workspaceTransBtn',
                                text: LocaleManager.getLocalizedString('Workspace Transactions', 'SpaceOccupancy.view.RoomSurvey'),
                                action: 'showWorkspaceTrans'
                            }
                        ]
                    }
                ]
            }
        ]

    },

    initialize: function () {
        var departmentList = this.down('departmentList'),
            categoryList = this.down('categoryList'),
            workspaceTransactionsBtn = this.down('button[action=showWorkspaceTrans]');

        this.callParent(arguments);

        if (Ext.os.is.WindowsPhone) {
            Ext.Viewport.on('orientationchange', 'onOrientationChange', this, {buffer: 50});
            this.setHeight(Ext.Viewport.getWindowHeight());
        }

        if (!SurveyState.getWorkspaceTransactionsEnabled()) {
            departmentList.setHidden(true);
            categoryList.setHidden(true);
            workspaceTransactionsBtn.setHidden(true);
        }
    },

    applyRecord: function (record) {
        var docSelector = this.down('viewselector'),
            transSelector = this.down('button'),
            roomForm = this.down('roomForm'),
            roomSurveyTitleBar = this.down('titlebar[itemId=roomSurveyTitleBar]');

        if (record !== null) {

            roomForm.setRecord(record);

            if (docSelector) {
                docSelector.setRecord(record);
            }

            if (transSelector) {
                transSelector.setRecord(record);
            }

            if (roomSurveyTitleBar) {
                roomSurveyTitleBar.setTitle(record.get('bl_id') + ' - ' + record.get('fl_id') + ' - ' + record.get('rm_id'));
            }
        }
        return record;
    },

    onOrientationChange: function (viewport, newOrientation, width, height) {
        var roomForm = this.down('roomForm');

        this.setHeight(height);
        if (roomForm) {
            roomForm.setHeight(height / 2);
        }

    }
});