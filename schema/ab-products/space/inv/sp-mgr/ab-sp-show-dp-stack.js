/**
 * @author Guo
 */
function onStackedBarChartClick(obj){
    var blAndFl = obj.selectedChartData['fl.bl_fl'];
    var dvAndDp = obj.selectedChartData['gp.dv_dp'];
    var detailPanel = View.panels.get('abSpShowDpStack_rmUnionGpGrid');
    detailPanel.addParameter('blAndFl', blAndFl);
    if (dvAndDp == 'N/A') {
        detailPanel.addParameter('dvAndDp', " IS NULL");
    }
    else {
        detailPanel.addParameter('dvAndDp', "= '" + dvAndDp + "'");
    }
    detailPanel.refresh();
    detailPanel.show(true);
    detailPanel.showInWindow({
        width: 600,
        height: 400
    });
}
