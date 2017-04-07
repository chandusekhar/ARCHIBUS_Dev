//JavaScript for ab-em-add-or-update.axvw

/*
what was the point of this?

function afterViewLoad() {
	var consolePrefix = 'abEmAddOrUpdate_consolePanel_';
}
*/


function setFilterAndRender() {
    var restriction = new Ab.view.Restriction();
	var console = View.panels.get('abEmAddOrUpdate_consolePanel');
	var em_id = console.getFieldValue('em.em_id');
    
    if (em_id != '') {
        restriction.addClause('em.em_id', em_id + '%', 'LIKE');
	}
                            
    var report = View.panels.get('abEmAddOrUpdate_treePanel');
    report.refresh(restriction);
	report.show(true);
}                            
  

