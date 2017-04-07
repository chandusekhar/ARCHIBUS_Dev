/**
 * Example form controller class.
 * Handles lifecycle events (such as afterViewLoaded) and user actions (such as Save).
 */
var formController = View.createController('simpleForm', {

    /**
     * This function is called then the view is loaded.
     */
    afterViewLoad:function () {
        // force new record mode, so that the form does not load existing record
        this.prgFormSelectValue_wrCfForm.newRecord = true;
    },

    /**
     * Saves the form record.
     */
    prgFormSelectValue_wrCfForm_onSave:function () {
        this.prgFormSelectValue_wrCfForm.save();
    },

    /**
     * Select Values dialog command.
     * To access form values in SelectValues restrictions, binding expressions like ${record['wrcf.wr_id']} will be used.
     */
    prgFormSelectValue_wrCfForm_onSelectCraftsperson:function () {
        var sqlRestriction = "(date_contract_exp IS NULL OR date_contract_exp > ${sql.currentDate}) " +
            "AND EXISTS (SELECT 1 FROM em WHERE em.email = cf.email AND em.bl_id IN " +
            "(SELECT bl_id FROM bl WHERE site_id = (SELECT site_id FROM wr WHERE wr_id = '${record['wrcf.wr_id']}'))) ";

        View.selectValue({
            formId: 'prgFormSelectValue_wrCfForm',
            title: 'Select Floor',
            fieldNames: ["wrcf.cf_id"],
            selectTableName: 'cf',
            selectFieldNames: ["cf.cf_id"],
            visibleFields: [
                {fieldName: 'cf.cf_id', title: getMessage('titleBldgSite')},
                {fieldName: 'cf.name', title: getMessage('titleBldgName')},
                {fieldName: 'cf.tr_id', title: getMessage('titleFloorId')},
                {fieldName: 'cf.work_team_id', title: getMessage('titleFloorName')}
            ],
            restriction: sqlRestriction,
            sortFields: [
                {fieldName: 'cf.name', sortAscending: false},
                {fieldName: 'cf.tr_id', sortAscending: true}
            ]
        });
    }
});