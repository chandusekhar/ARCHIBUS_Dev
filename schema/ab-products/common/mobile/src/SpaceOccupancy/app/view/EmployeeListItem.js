Ext.define('SpaceOccupancy.view.EmployeeListItem', {
    extend: 'SpaceOccupancy.view.ListItem',

    xtype: 'employeeListItem',

    config: {
        deleteButton: {
            action: 'deleteEm'
        }
    },

    // used by parent class
    buildInfo: function (record) {
        var employeeInfo = record.getData(),
            emId = employeeInfo.em_id,
            primaryEm = employeeInfo.primary_em,
            html;

        html = '<div class="prompt-list-hbox">';

        if (SurveyState.getWorkspaceTransactionsEnabled()) {
            //shows the primary records in dark text and non-primary records in grey text.
            if (primaryEm === '1') {
                html = html + '<h1 class="list-item">' +
                    LocaleManager.getLocalizedString('(P)', 'SpaceOccupancy.view.EmployeeListItem');
            } else {
                html = html + '<h1 class="list-item gray-list-item">';
            }
        } else {
            //if workspace transactions are not enabled, the “(P)” designation will not be displayed.
            html = html + '<h1 class="list-item">';
        }

        html += ' ' + emId + '</h1></div>';
        return html;
    }
});