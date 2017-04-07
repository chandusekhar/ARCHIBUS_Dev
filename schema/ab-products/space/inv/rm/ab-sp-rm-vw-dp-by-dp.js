/**
 * @author Keven Xi
 */
function toDetail(obj){
    var RmDetailGrid = View.panels.get('RmDetailGrid');
    if (obj.restriction.clauses.length > 0) {
        RmDetailGrid.addParameter('DuDvDp', "='" + obj.restriction.clauses[0].value + "'");
    }
    else {
        RmDetailGrid.addParameter('DuDvDp', "is not null");
    }
    RmDetailGrid.refresh();
    RmDetailGrid.show(true);
    RmDetailGrid.showInWindow({
        width: 600,
        height: 400
    });
}
