Ext.define('SpaceOccupancy.view.CategoryListItem', {
    extend: 'SpaceOccupancy.view.ListItem',

    xtype: 'categoryListItem',

    config: {
        deleteButton: {
            action: 'deleteCat'
        }
    },

    // used by parent class
    buildInfo: function (record) {
        var categoryInfo = record.getData(),
            pctId = categoryInfo.pct_id,
            catId = categoryInfo.rm_cat ? categoryInfo.rm_cat : '',
            typeId = categoryInfo.rm_type ? categoryInfo.rm_type : '',
            primaryRm = categoryInfo.primary_rm,
            html;

        html = '<div class="prompt-list-hbox">';
        if (primaryRm === '1') {
            html += '<h1 class="list-item gray-list-item">' + pctId + ' ' +
                LocaleManager.getLocalizedString('(P)', 'SpaceOccupancy.view.CategoryListItem');
        } else {
            html += '<h1 class="list-item">' + pctId + ' ';
        }
        html += catId + ' | ' + typeId + '</h1></div>';

        return html;
    }
});