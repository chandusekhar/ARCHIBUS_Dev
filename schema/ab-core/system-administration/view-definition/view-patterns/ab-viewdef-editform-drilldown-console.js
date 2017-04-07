
function setFilterAndRender(){
    var restriction = new Ab.view.Restriction();
    var console = Ab.view.View.getControl('', 'consolePanel');
    
    /*  Template Pattern Begin  */
    var bl_id = console.getFieldValue('rm.bl_id');
    if (bl_id != '') {
        restriction.addClause('rm.bl_id', bl_id + '%', 'LIKE');
    }
    /*  Template Pattern End  */
    
    // apply restriction to the report
    var report = Ab.view.View.getControl('', 'treePanel');
    report.refresh(restriction);
    
    // show the report
    report.show(true);
    
}
