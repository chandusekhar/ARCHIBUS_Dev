function showDetail(obj){
    var detailPanel = View.panels.get('eq_main_hwr_detail');
    detailPanel.refresh(obj.restriction);
    detailPanel.show(true);
    detailPanel.showInWindow({
        width: 800,
        height: 600
    });
}

