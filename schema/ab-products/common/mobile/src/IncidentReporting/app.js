Ext.Loader.setPath({
    'Common': '../Common',
    'IncidentReporting': 'app',
    'Floorplan': '../packages/Floorplan/src'
});

Ext.require(['Common.scripts.ApplicationLoader', 'Common.Application', 'Ext.data.Validations',
    'Common.lang.ComponentLocalizer', 'Common.lang.LocalizedStrings'], function () {
    Ext.application({
        name: 'IncidentReporting',

        /**
         * @property {Boolean} autoBackgroundDataSync Enables the framework auto background data sync.
         */
        autoBackgroundDataSync: true,

        /**
         * Called during the application start up. Executes in place of the SynchronizationManager.doAutoSync
         * function.
         * @param {Function} onCompleted Executes when the sync operation is completed.
         * @param {Object} scope The scope to execute the onCompleted callback function.
         */
        backgroundSyncFn: function (onCompleted, scope) {
            var me = this,
                syncController = me.getController('IncidentSync');

            syncController.downloadBackgroundData(onCompleted, scope);
        },

        requires: [
            'Common.util.UserProfile',
            'Common.util.TableDef',
            'Common.control.Camera',
            'Common.control.FormHeader',
            'Common.control.button.Toolbar',
            'Common.control.button.Picker',
            'Common.control.config.TimePicker',
            'Common.control.field.TimePicker',
            'Common.control.field.TextArea',
            'Common.control.field.Calendar',
            'Common.control.Select',
            'Common.control.prompt.Site',
            'Common.control.prompt.Property',
            'Common.control.prompt.Building',
            'Common.control.prompt.Floor',
            'Common.control.prompt.Room',
            'Common.control.prompt.Employee',
            'Common.control.prompt.Contact',
            'Common.plugin.DataViewListPaging',
            'Common.view.DocumentItem',
            'Common.view.DocumentList',
            'Common.util.Ui',
            'Floorplan.view.Redline',
            'IncidentReporting.util.Ui',
            'IncidentReporting.control.prompt.IncidentType',
            'IncidentReporting.control.prompt.Employee',
            'IncidentReporting.control.prompt.IncidentInjuryArea',
            'IncidentReporting.control.prompt.IncidentInjuryCategory',
            'Ext.util.Format',
            'Ext.form.FieldSet',
            'Ext.field.Text',
            'Ext.field.Select',
            'Ext.field.Toggle',
            'Ext.field.Hidden',
            'Ext.field.Search',
            'Ext.Img'
        ],

        views: [
            'Main',
            'IncidentList',
            'General',
            'Location',
            'Medical',
            'Witness',
            'WitnessList',
            'Documents'],

        controllers: [
            'Common.controller.AppHomeController',
            'Common.controller.Registration',
            'IncidentNavigation',
            'IncidentSync',
            'IncidentDocuments',
            'Redline'
        ],

        stores: [
            //validating tables for selectfields
            'Common.store.Apps',
            'Common.store.IncidentTypes',
            'Common.store.IncidentInjuryCategories',
            'Common.store.IncidentInjuryAreas',
            'Common.store.Employees',
            'IncidentReporting.store.AffectedEmployees',
            'Common.store.Sites',
            'Common.store.Properties',
            'Common.store.Buildings',
            'Common.store.Floors',
            'Common.store.FloorPrompt',
            'Common.store.Rooms',
            'Common.store.RoomPrompt',
            'Common.store.Contacts',
            //save forms
            'IncidentReporting.store.Incidents',
            'IncidentReporting.store.IncidentWitnesses',
            'IncidentReporting.store.Documents',
            'IncidentReporting.store.DetailButtons',
            'IncidentReporting.store.DropDownActions',
            'Floorplan.store.PublishDates'
        ],

        profiles: ['Tablet', 'Phone'],

        launch: function () {
            // Initialize the main view
            Ext.Viewport.add(Ext.create('IncidentReporting.view.Main'));
        }
    });

});
