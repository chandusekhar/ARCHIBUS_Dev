/* global Siesta */

var Harness = Siesta.Harness.Browser.SenchaTouch;

Harness.configure({
    title: 'Mobile App Tests',

    preload: [
        '../touch/resources/css/sencha-touch.css',
        '../touch/sencha-touch-all.js',
        '/archibus/dwr/engine.js',
        '/archibus/dwr/interface/MobileSyncService.js',
        '/archibus/dwr/interface/SecurityService.js',
        '/archibus/dwr/interface/MobileSecurityService.js',
        '/archibus/dwr/interface/SmartClientConfigService.js',
        '/archibus/dwr/interface/AdminService.js',
        '/archibus/dwr/interface/workflow.js',
        '/archibus/dwr/interface/DrawingSvgService.js',
        '../Common/lang/LocaleManager.js',
        '../Common/test/util/Database.js',
        '../Common/scripts/loader/Loader.js',
        '../Common/cordova.js',
        '../Common/lib/promise-6.1.0.min.js'
    ],

    loaderPath: {
        'Common': '../Common',
        'Maintenance': '../Maintenance/app',
        'AssetAndEquipmentSurvey': '../AssetAndEquipmentSurvey/app',
        'Questionnaire': '../packages/Questionnaire/src',
        'Floorplan': '../packages/Floorplan/src'
    },

    disableCaching: true,

    autoCheckGlobals: false
});

Harness.start('test/010_sanity.t.js', {
        group: 'Configuration File Manager',
        items: [
            'test/configuration/01_configuration.t.js',
            'test/configuration/02_configuration.t.js',
            'test/configuration/03_configuration.t.js',
            'test/configuration/04_filemanager.t.js']
    },
    {
        group: 'Service',
        items: [
            'test/service/03_service_ismemberofgroup.t.js',
            'test/service/04_workflow_tojson.t.js',
            'test/service/07_service_drawing.t.js',
            'test/service/14_download_floorplans.t.js',
            'test/service/11_service_userinfo.t.js',
            'test/service/12_version.t.js',
            'test/service/13_sqlitepassphrase.t.js',
            'test/service/14_download_floorplans.t.js',
            'test/service/15_service_drawing_floorcodes.t.js',
            'test/service/16_service_unregister.t.js',
            'test/service/17_service_modifiedrecords.t.js',
            'test/service/18_service_last_table_download.t.js'
        ]
    },
    {
        group: 'Proxy',
        items: [
            'test/proxy/01_sqlite.t.js',
            'test/proxy/03_filter.t.js',
            'test/proxy/04_filter.t.js',
            'test/proxy/05_filter.t.js',
            'test/proxy/06_sqlfilter.t.js',
            'test/proxy/07_filter.t.js',
            'test/proxy/08_compound_filter.t.js'
        ]
    },
    {
        group: 'sync',
        items: [
            'test/sync/01_workrequest.t.js',
            'test/sync/02_workrequest_date.t.js',
            'test/sync/03_date_time.t.js',
            'test/sync/04_retrieverecords.t.js',
            'test/sync/05_date_checkin.t.js',
            'test/sync/06_sync_restriction.t.js',
            'test/sync/07_validating_sync.t.js',
            'test/sync/08_paged_sync.t.js'
        ]
    },
    {
        group: 'TableDef',
        items: [
            'test/tabledef/04_tabledef_primarykey.t.js'
        ]
    },
    {
        group: 'Localization',
        items: [
            'test/localization/01_localization.t.js',
            'test/localization/02_localization_componentlocalizer.t.js',
            'test/localization/03_localization_tabledef.t.js',
            'test/localization/04_localization_javalocale.t.js']
    },
    {
        group: 'Custom Type Tests',
        items: [
            'test/customtypes/01_customtype_int.t.js',
            'test/customtypes/02_customtype_date.t.js',
            'test/customtypes/03_customtype_time.t.js',
            'test/customtypes/04_customtype_timestamp.t.js',
            'test/customtypes/05_customtype_sync.t.js',
            'test/customtypes/06_customtype_model.t.js',
            'test/customtypes/07_customtype_controls.t.js'
        ]
    },
    {
        group: 'Security Tests',
        items: [
            'test/security/01_security.t.js',
            'test/security/02_security_recordregistration.t.js'
        ]
    },
    {
        group: 'Data Stores Tests',
        items: [
            'test/stores/01_schemaupdaterstore_tabledef.t.js',
            'test/stores/02_schemaupdaterstore_tabledef.t.js',
            'test/stores/03_schemaupdaterstore_modelfields.t.js',
            'test/stores/04_syncstore_document.t.js',
            'test/stores/05_syncstore_doc_transfer.t.js',
            'test/stores/06_syncstore_doc_transfer.t.js',
            'test/stores/07_sqliteview.t.js'
        ]
    },
    {
        group: 'Navigation',
        items: ['test/navigation/01_navigationbar.t.js']
    },
    {
        group: 'Views',
        items: ['test/views/02_generate_form_fields.t.js']
    },
    {
        group: 'Questionnaire',
        items: [
            'test/questionnaire/01_questionnaire.t.js',
            'test/questionnaire/02_questionnaire.t.js',
            'test/questionnaire/03_questionnaire.t.js'
        ]
    },
    {
        group: 'Controls',
        items: [
            'test/controls/01_prompt.t.js',
            'test/controls/02_prompt_hierarchy.t.js'
        ]
    }
);
