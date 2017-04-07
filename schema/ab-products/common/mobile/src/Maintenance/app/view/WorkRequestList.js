Ext.define('Maintenance.view.WorkRequestList', {
    extend: 'Common.view.navigation.ListBase',
    xtype: 'workrequestListPanel',

    requires: [
        'Common.control.button.Picker',
        'Ext.field.Checkbox',
        'Common.control.Search'
    ],

    /**
     * Used by the WorkRequestNavigation controller to indicate
     * that the child forms should have a work request filter
     * applied.
     */
    isWorkRequestList: true,

    config: {

        editViewClass: Ext.os.is.Phone ? 'Maintenance.view.phone.WorkRequestEdit'
            : 'Maintenance.view.tablet.WorkRequestEdit',

        title: LocaleManager.getLocalizedString('Loading...', 'Maintenance.view.WorkRequestList'),

        /**
         * MyWork/MyRequests/Requested/Approved/Issued/Completed
         */
        displayMode: Constants.MyWork,

        items: [
            {
                xtype: 'toolbar',
                itemId: 'myWorkToolbar',
                cls: 'ab-toolbar',
                items: [
                    {
                        xtype: 'checkboxfield',
                        name: 'workRequestCheckboxAll',
                        width: '2em',
                        hidden: true,
                        cls: 'ab-titlebar-checkbox'
                    },
                    {
                        xtype: 'search',
                        name: 'workRequestSearch',
                        style: 'margin-right: 6px',
                        enableBarcodeScanning: true,
                        barcodeFormat: [{fields: ['wr_id', 'mob_wr_id', 'prob_type', 'eq_id', 'name', 'address1', 'address2', 'dv_id', 'dp_id']},
                            {useDelimiter: true, fields: ['bl_id', 'fl_id', 'rm_id']}],
                        width: Ext.os.is.Phone ? '45%' : '14em',
                        placeHolder: Ext.os.is.Phone ? LocaleManager.getLocalizedString('Search', 'Maintenance.view.WorkRequestList') :
                            LocaleManager.getLocalizedString('Search Work Requests', 'Maintenance.view.WorkRequestList')

                    },
                    {
                        xtype: 'spacer'
                    },
                    {
                        xtype: 'selectlistfield',
                        name: 'sortWorkRequests',
                        isSortField: true,
                        width: Ext.os.is.Phone ? '38%' : ' 14em',
                        valueField: 'objectValue',
                        displayField: 'displayValue',
                        options: [
                            {
                                "displayValue": LocaleManager.getLocalizedString('Status', 'Maintenance.view.WorkRequestList'),
                                "objectValue": "status"
                            },
                            {
                                "displayValue": LocaleManager.getLocalizedString('Escalation', 'Maintenance.view.WorkRequestList'),
                                "objectValue": "escalation"
                            },
                            {
                                "displayValue": LocaleManager.getLocalizedString('Location', 'Maintenance.view.WorkRequestList'),
                                "objectValue": "location"
                            },
                            {
                                "displayValue": LocaleManager.getLocalizedString('Problem Type', 'Maintenance.view.WorkRequestList'),
                                "objectValue": "problemType"
                            }
                        ]
                    },
                    {
                        xtype: 'button',
                        iconCls: 'filter',
                        name: 'workRequestFilterButton',
                        width: '2em',
                        hidden: true
                    }
                ]
            },
            {
                xtype: 'workrequestManagerList',
                flex: 1
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'buttonpicker',
                        text: LocaleManager.getLocalizedString('My Work', 'Maintenance.view.WorkRequestList'),
                        updatePickerText: true,
                        store: 'dropDownButtonsStore',
                        centered: true,
                        panelSize: {
                            tablet: {width: '18em', height: '18em'},
                            phone: {width: '14em', height: '18em'}
                        }
                    }
                ]

            }
        ]
    }
})
;