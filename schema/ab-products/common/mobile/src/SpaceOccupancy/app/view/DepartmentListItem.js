Ext.define('SpaceOccupancy.view.DepartmentListItem', {
    extend: 'SpaceOccupancy.view.ListItem',

    xtype: 'departmentListItem',

    config: {
        deleteButton: {
            action: 'deleteDv'
        }
    },

    // used by parent class
    buildInfo: function (record) {
        var departmentInfo = record.getData(),
            pctId = departmentInfo.pct_id,
            dvId = departmentInfo.dv_id ? departmentInfo.dv_id : '',
            dpId = departmentInfo.dp_id ? departmentInfo.dp_id : '',
            primaryRm = departmentInfo.primary_rm,
            html;

        html = '<div class="prompt-list-hbox">';
        if (primaryRm === '1') {
            html += '<h1 class="list-item gray-list-item">' + pctId + ' ' +
                LocaleManager.getLocalizedString('(P)', 'SpaceOccupancy.view.DepartmentListItem');
        } else {
            html += '<h1 class="list-item">' + pctId + ' ';
        }
        html += dvId + ' | ' + dpId + '</h1></div>';

        return html;
    }
});