var rplmTaxActionController = View.createController('rplmTaxAction', {
    actionTypesRestriction: "1=0",
    afterViewLoad: function () {
        this.actionTypesRestriction = "activity_log.activity_type IN ('" + View.activityParameters['AbRPLMCosts-PropertyTaxActionTypes'].replace(/;/g, "','") + "')";
    },
    afterInitialDataFetch: function () {
        this.abRplmTaxActionLogDetails.addParameter('actionTypeRestriction', this.actionTypesRestriction);
        this.abRplmTaxActionLogDetails.refresh();
    },
    /**
     * onFilter event handler.
     */
    abRplmTaxActionLogFilter_onFilter: function () {
        var console = this.abRplmTaxActionLogFilter,
            restriction = "1=1 ";
        console.fields.each(function (field) {
            var id = field.getId();
            var value = field.getUIValue();
            if (valueExistsNotEmpty(value)) {
                if (field.fieldDef.type === "java.sql.Date") {
                    if (id === 'date_required.from') {
                        restriction += " AND date_required >= ${sql.date('" + value + "')}";
                    } else {
                        restriction += " AND date_required <= ${sql.date('" + value + "')}";
                    }
                } else {
                    restriction += " AND " + id + "='" + value + "'";
                }
            }
        });
        this.abRplmTaxActionLogDetails.refresh(restriction);
    }
});

function selectActionType(panelName) {
    var controller = View.controllers.get('rplmTaxAction');
    Ab.view.View.selectValue(
        panelName, //formId
        getMessage('title_action_type'), //title
        ['activity_log.activity_type'], //targetFieldNames
        'activitytype', //selectTableName
        ['activitytype.activity_type'],//selectFieldNames
        ['activitytype.activity_type', 'activitytype.description'],//visibleFieldNames
        controller.actionTypesRestriction, //restriction
        '', //actionListener
        false, //applyFilter
        false, //showIndex
        '', //workflowRuleId
        800,  //width
        500, //height
        'grid' //selectValueType
    );
}