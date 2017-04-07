
function selectWorkRequestForReview(context) {
    // 'this' refers to the row that the user clicked on
    // 'this.grid' refers to the parent Grid panel
    var restriction = this.grid.getPrimaryKeysForRow(this);
    
    // copy wr.wr_id value into wrpt.wr_id value for the Work Request Parts report on the 3rd page
    var wr_id = restriction['wr.wr_id'];
    restriction['wrpt.wr_id'] = wr_id;
    
    // apply restriction to the tabbed view and select the second page
    var tabPanel = View.getView('parent').panels.get('exWizardSelectManyPages_tabs');
    tabPanel.findTab('exWizardSelectManyPages_page2').restriction = restriction;
    tabPanel.findTab('exWizardSelectManyPages_page3').restriction = restriction;
    tabPanel.selectTab('exWizardSelectManyPages_page2');
}