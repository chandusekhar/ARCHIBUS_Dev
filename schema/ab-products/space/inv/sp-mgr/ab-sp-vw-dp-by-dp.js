/**
 * @author keven.xi
 */
function onCrossTableClick(obj){
    var detailGrid = View.panels.get('abSpVwDpByDp_mixRmGpGrid');
    if (obj.restriction.clauses.length > 0) {
        var buDvDp = obj.restriction.clauses[0].value;
        if (buDvDp == 'N/A') {
            detailGrid.addParameter('buDvDp', "bu_dv_dp IS NULL");
        }
        else {
            detailGrid.addParameter('buDvDp', "bu_dv_dp ='" + buDvDp + "'");
        }
    }
    else {
        detailGrid.addParameter('buDvDp', "1=1");
    }
    detailGrid.refresh();
    detailGrid.show(true);
    detailGrid.showInWindow({
        width: 600,
        height: 400
    });
}
