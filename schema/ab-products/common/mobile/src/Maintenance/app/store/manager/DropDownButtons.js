Ext.define('Maintenance.store.manager.DropDownButtons', {
    extend: 'Ext.data.Store',

    requires: [
        'Maintenance.store.WorkRequests',
        'Maintenance.model.WorkRequestCraftsperson',
        'Maintenance.store.WorkRequestCraftspersons',
        'Common.util.UserProfile'
    ],

    localizedText: {
        MyWork: LocaleManager.getLocalizedString('My Work', 'Maintenance.store.manager.DropDownButtons'),
        MyRequests: LocaleManager.getLocalizedString('My Requests', 'Maintenance.store.manager.DropDownButtons'),
        Requested: LocaleManager.getLocalizedString('Requested', 'Maintenance.store.manager.DropDownButtons'),
        Approved: LocaleManager.getLocalizedString('Approved', 'Maintenance.store.manager.DropDownButtons'),
        Issued: LocaleManager.getLocalizedString('Issued', 'Maintenance.store.manager.DropDownButtons'),
        Completed: LocaleManager.getLocalizedString('Completed', 'Maintenance.store.manager.DropDownButtons')
    },

    config: {
        fields: [
            {name: 'value', type: 'string'},
            {name: 'text', type: 'string'},
            {name: 'badge_value', type: 'string'},
            {name: 'sort', type: 'int'}
        ],

        storeId: 'dropDownButtonsStore',

        autoLoad: false,
        enableAutoLoad: false,
        remoteFilter: true,
        disablePaging: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: function () {
                var store = Ext.getStore('dropDownButtonsStore'),// Function is called by the proxy class, we need a reference to this store.
                    viewStr = ['SELECT \'MyWork\' AS value , \'{0}\' AS text, count(*) AS badge_value, 1 AS sort FROM WorkRequest',
                        ' WHERE request_type=\'0\' AND ( status_initial=\'I\' OR status_initial=\'HP\' OR status_initial=\'HA\' OR status_initial=\'HL\')',
                        '       AND (wr_id IS NULL OR (wr_id IS NOT NULL AND is_req_craftsperson = 1) ' +
                        '               OR EXISTS (SELECT 1 FROM WorkRequestCraftsperson wrcf WHERE wrcf.status=\'Active\'AND wrcf.wr_id = WorkRequest.wr_id AND wrcf.cf_id = \'{6}\')' +
                        '           )',
                        ' UNION',
                        ' SELECT \'MyRequests\',\'{1}\', count(*),2 FROM WorkRequest',
                        ' WHERE status!= \'Rej\' AND (request_type=\'1\' or requestor=\'{7}\') ',
                        ' UNION',
                        ' SELECT \'Requested\', \'{2}\', count(*),3 FROM WorkRequest',
                        ' WHERE wr_id IS NOT NULL AND status_initial = \'R\' AND request_type=\'0\' AND step_type IN (\'review\',\'approval\') ',
                        ' UNION',
                        ' SELECT \'Approved\',\'{3}\', count(*),4 FROM WorkRequest',
                        ' WHERE wr_id IS NOT NULL AND status_initial = \'AA\' AND request_type=\'0\' and (is_wt_self_assign = 1 OR NOT(requestor is not null and requestor= \'{7}\' and is_req_supervisor!=1) OR step_type !=\'basic\')',
                        ' UNION',
                        ' SELECT \'Issued\',\'{4}\', count(*),5 FROM WorkRequest',
                        ' WHERE wr_id IS NOT NULL and (NOT(requestor is not null and requestor= \'{7}\' and is_req_supervisor!=1) OR step_type !=\'basic\') AND ( status_initial=\'I\' OR status_initial=\'HP\' OR status_initial=\'HA\' OR status_initial=\'HL\') AND request_type=\'0\' ',
                        '       AND ( (wr_id IS NOT NULL AND is_req_supervisor = 1) OR EXISTS (SELECT 1 FROM WorkRequestCraftsperson wrcf WHERE wrcf.wr_id = WorkRequest.wr_id' +
                        '               AND wrcf.cf_id = \'{6}\' ) OR step_type !=\'basic\' )',
                        ' UNION',
                        ' SELECT \'Completed\',\'{5}\', count(*),6 FROM WorkRequest',
                        ' WHERE wr_id IS NOT NULL AND status_initial = \'Com\' AND request_type=\'0\' and (NOT(requestor is not null and requestor= \'{7}\' and is_req_supervisor!=1) OR step_type !=\'basic\')',
                        ' ORDER BY Sort'].join(''),

                    view = Ext.String.format(viewStr,
                        store.localizedText.MyWork,
                        store.localizedText.MyRequests,
                        store.localizedText.Requested,
                        store.localizedText.Approved,
                        store.localizedText.Issued,
                        store.localizedText.Completed,
                        Common.util.UserProfile.getUserProfile().cf_id,
                        Common.util.UserProfile.getUserProfile().em_id);

                return view;
            },

            viewName: 'MaintenanceWorkRequestButtons',

            baseTables: ['WorkRequest', 'WorkRequestCraftsperson'],

            usesTransactionTable: true
        }
    }
});