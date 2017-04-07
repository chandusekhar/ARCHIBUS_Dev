/**
 * Contains configuaration information for the report views that are uses in the Space package
 * @since 21.4
 */
Ext.define('Space.view.report.Configuration', {

    singleton: true,

    localizedStrings: {
        ctry_id: LocaleManager.getLocalizedString('Country', 'Space.view.report.Configuration'),
        state_id: LocaleManager.getLocalizedString('State', 'Space.view.report.Configuration'),
        city_id: LocaleManager.getLocalizedString('City', 'Space.view.report.Configuration'),
        address1: LocaleManager.getLocalizedString('Address 1', 'Space.view.report.Configuration'),
        address2: LocaleManager.getLocalizedString('Address 2', 'Space.view.report.Configuration'),
        site_id: LocaleManager.getLocalizedString('Site Code', 'Space.view.report.Configuration'),
        bl_id: LocaleManager.getLocalizedString('Building Code', 'Space.view.report.Configuration'),
        bl_name: LocaleManager.getLocalizedString('Building', 'Space.view.report.Configuration'),
        fl_id: LocaleManager.getLocalizedString('Floor', 'Space.view.report.Configuration'),
        fl_name: LocaleManager.getLocalizedString('Floor Name', 'Space.view.report.Configuration'),
        rm_id: LocaleManager.getLocalizedString('Room', 'Space.view.report.Configuration'),
        rm_name: LocaleManager.getLocalizedString('Room Name', 'Space.view.report.Configuration'),
        rm_std: LocaleManager.getLocalizedString('Room Standard', 'Space.view.report.Configuration'),
        area: LocaleManager.getLocalizedString('Room Area', 'Space.view.report.Configuration'),
        rm_cat: LocaleManager.getLocalizedString('Room Category', 'Space.view.report.Configuration'),
        rm_type: LocaleManager.getLocalizedString('Room Type', 'Space.view.report.Configuration'),
        dv_id: LocaleManager.getLocalizedString('Division', 'Space.view.report.Configuration'),
        dp_id: LocaleManager.getLocalizedString('Department', 'Space.view.report.Configuration'),
        em_id: LocaleManager.getLocalizedString('Employee ID', 'Space.view.report.Configuration'),
        name_last: LocaleManager.getLocalizedString('Last Name', 'Space.view.report.Configuration'),
        name_first: LocaleManager.getLocalizedString('First Name', 'Space.view.report.Configuration'),
        phone: LocaleManager.getLocalizedString('Phone', 'Space.view.report.Configuration'),
        email: LocaleManager.getLocalizedString('Email', 'Space.view.report.Configuration'),
        rm_phone: LocaleManager.getLocalizedString('Room Phone', 'Space.view.report.Configuration')
    },

    /**
     * Configuration for the Rooms Report view. The Rooms Report is based on the {@link Space.store.RoomsReport} store.
     * This store is generated using a SQLite client view. There is no associated server side TableDef to use to
     * supply the labels or field formatting. This requires that we define all of the field information here.
     */
    getRoomReportConfig: function () {
        var me = this,
            config = {
                title: LocaleManager.getLocalizedString('Room Information', 'Space.view.report.Configuration')
            },
            fieldsToDisplay = [
                {
                    name: 'survey_photo',
                    isDocument: true
                },
                {
                    name: 'ctry_id',
                    label: me.localizedStrings.ctry_id
                },
                {
                    name: 'state_id',
                    label: me.localizedStrings.state_id
                },
                {
                    name: 'city_id',
                    label: me.localizedStrings.city_id
                },
                {
                    name: 'address1',
                    label: me.localizedStrings.address1
                },
                {
                    name: 'address2',
                    label: me.localizedStrings.address2
                },
                {
                    name: 'site_id',
                    label: me.localizedStrings.site_id
                },
                {
                    name: 'bl_id',
                    label: me.localizedStrings.bl_id
                },
                {
                    name: 'bl_name',
                    label: me.localizedStrings.bl_name
                },
                {
                    name: 'fl_id',
                    label: me.localizedStrings.fl_id
                },
                {
                    name: 'fl_name',
                    label: me.localizedStrings.fl_name
                },
                {
                    name: 'rm_id',
                    label: me.localizedStrings.rm_id
                },
                {
                    name: 'rm_name',
                    label: me.localizedStrings.rm_name
                },
                {
                    name: 'rm_std',
                    label: me.localizedStrings.rm_std
                },
                {
                    name: 'area',
                    label: me.localizedStrings.area
                },
                {
                    name: 'rm_cat',
                    label: me.localizedStrings.rm_cat
                },
                {
                    name: 'rm_type',
                    label: me.localizedStrings.rm_type
                },
                {
                    name: 'dv_id',
                    label: me.localizedStrings.dv_id
                },
                {
                    name: 'dp_id',
                    label: me.localizedStrings.dp_id
                }
            ];

        config.fieldsToDisplay = fieldsToDisplay;

        return config;

    },

    /**
     * Configuration for the Rooms Report view. The Rooms Report is based on the {@link WorkplacePortal.store.RoomsInfoReport} store.
     * This store is generated using a SQLite client view. There is no associated server side TableDef to use to
     * supply the labels or field formatting. This requires that we define all of the field information here.
     */
    getRoomInfoReportConfig: function () {
        var me = this,
            config = {
                title: LocaleManager.getLocalizedString('Room Information', 'Space.view.report.Configuration')
            },
            fieldsToDisplay = [
                {
                    name: 'doc_graphic',
                    isDocument: true
                },
                {
                    name: 'doc_block',
                    isDocument: true
                },
                {
                    name: 'ctry_id',
                    label: me.localizedStrings.ctry_id
                },
                {
                    name: 'state_id',
                    label: me.localizedStrings.state_id
                },
                {
                    name: 'city_id',
                    label: me.localizedStrings.city_id
                },
                {
                    name: 'address1',
                    label: me.localizedStrings.address1
                },
                {
                    name: 'address2',
                    label: me.localizedStrings.address2
                },
                {
                    name: 'site_id',
                    label: me.localizedStrings.site_id
                },
                {
                    name: 'bl_id',
                    label: me.localizedStrings.bl_id
                },
                {
                    name: 'bl_name',
                    label: me.localizedStrings.bl_name
                },
                {
                    name: 'fl_id',
                    label: me.localizedStrings.fl_id
                },
                {
                    name: 'fl_name',
                    label: me.localizedStrings.fl_name
                },
                {
                    name: 'rm_id',
                    label: me.localizedStrings.rm_id
                },
                {
                    name: 'rm_name',
                    label: me.localizedStrings.rm_name
                },
                {
                    name: 'rm_std',
                    label: me.localizedStrings.rm_std
                },
                {
                    name: 'area',
                    label: me.localizedStrings.area
                },
                {
                    name: 'rm_cat',
                    label: me.localizedStrings.rm_cat
                },
                {
                    name: 'rm_type',
                    label: me.localizedStrings.rm_type
                },
                {
                    name: 'dv_id',
                    label: me.localizedStrings.dv_id
                },
                {
                    name: 'dp_id',
                    label: me.localizedStrings.dp_id
                },
                {
                    name: 'phone',
                    isPhone: true,
                    label: me.localizedStrings.rm_phone
                }
            ];

        config.fieldsToDisplay = fieldsToDisplay;

        return config;

    },

    getEmployeeReportConfiguration: function () {
        var me = this,
            config = {
                title: LocaleManager.getLocalizedString('Employee Information', 'Space.view.report.Configuration')
            },
            fieldsToDisplay = [
                {
                    name: 'em_photo',
                    isDocument: true
                },
                {
                    name: 'em_id',
                    label: me.localizedStrings.em_id
                },
                {
                    name: 'name_last',
                    label: me.localizedStrings.name_last
                },
                {
                    name: 'name_first',
                    label: me.localizedStrings.name_first
                },
                {
                    name: 'phone',
                    isPhone: true,
                    label: me.localizedStrings.phone
                },
                {
                    name: 'email',
                    isEmail: true,
                    label: me.localizedStrings.email
                },
                {
                    name: 'dv_id',
                    label: me.localizedStrings.dv_id
                },
                {
                    name: 'dp_id',
                    label: me.localizedStrings.dp_id
                },
                {
                    name: 'ctry_id',
                    label: me.localizedStrings.ctry_id
                },
                {
                    name: 'state_id',
                    label: me.localizedStrings.state_id
                },
                {
                    name: 'city_id',
                    label: me.localizedStrings.city_id
                },
                {
                    name: 'address1',
                    label: me.localizedStrings.address1
                },
                {
                    name: 'address2',
                    label: me.localizedStrings.address2
                },
                {
                    name: 'site_id',
                    label: me.localizedStrings.site_id
                },
                {
                    name: 'bl_id',
                    label: me.localizedStrings.bl_id
                },
                {
                    name: 'bl_name',
                    label: me.localizedStrings.bl_name
                },
                {
                    name: 'fl_id',
                    label: me.localizedStrings.fl_id
                },
                {
                    name: 'fl_name',
                    label: me.localizedStrings.fl_name
                },
                {
                    name: 'rm_id',
                    label: me.localizedStrings.rm_id
                },
                {
                    name: 'rm_name',
                    label: me.localizedStrings.rm_name
                }

            ];

        config.fieldsToDisplay = fieldsToDisplay;

        return config;
    },

    /**
     * The configuration for the Site detail report
     * @returns {Object} The configuration object for the Site report view
     */
    getSiteReportConfig: function () {
        var config = {};

        config.fieldsToDisplay = [
            'site_photo',
            'site_id',
            'name',
            'city_id',
            'state_id',
            'ctry_id',
            'area_gross_ext',
            'area_gross_int',
            'area_rentable',
            'area_usable'
        ];
        config.tableDef = TableDef.getTableDefWithFieldDefsAsObject('site');

        return config;
    },

    getBuildingReportConfig: function () {
        var config = {};

        config.fieldsToDisplay = [
            'bldg_photo',
            'bl_id',
            'name',
            'site_id',
            'city_id',
            'state_id',
            'ctry_id',
            'address1',
            'address2',
            'use1',
            'contact_name',
            'contact_phone',
            'date_bl',
            'area_gross_ext',
            'area_gross_int',
            'area_rentable',
            'area_usable'
        ];
        config.tableDef = TableDef.getTableDefWithFieldDefsAsObject('bl');

        return config;
    },

    getFloorReportConfig: function () {
        var config = {};

        config.fieldsToDisplay = [
            'bl_id',
            {name: 'blName', label: 'Building Name'},
            'fl_id', 'name',
            'area_gross_ext',
            'area_gross_int',
            'area_rentable',
            'area_usable'
        ];

        config.tableDef = TableDef.getTableDefWithFieldDefsAsObject('fl');

        return config;
    }
});