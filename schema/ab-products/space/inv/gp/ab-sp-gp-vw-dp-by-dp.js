/**
 * @author Keven Xi
 */
function toDetail(obj){
    var gpDetailGrid = View.panels.get('groupDetailsGrid');
    if (obj.restriction.clauses.length > 0) {
        gpDetailGrid.addParameter('DuDvDp', "='" + obj.restriction.clauses[0].value + "'");
    }
    else {
        gpDetailGrid.addParameter('DuDvDp', "is not null");
    }
    gpDetailGrid.refresh();
    gpDetailGrid.show(true);
    gpDetailGrid.showInWindow({
        width: 600,
        height: 400
    });
}
