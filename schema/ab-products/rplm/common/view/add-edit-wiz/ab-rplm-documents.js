var rplmDocumentsController = View.createController('rplmDocuments', {
    openerPanel: null,
    openerController: null,
    type: null,
    action: null,
    actionType: null,
    itemId: null,
    itemType: null,
    itemIsOwned: null,
    leaseId: null,
    leaseType: null,
    wizard: null,
    contentDisabled: null,
    docId: null,
    afterInitialDataFetch: function(){
        if (View.getOpenerView().controllers.get('portfAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('portfAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('wizardTabs');
        }
        if (View.getOpenerView().controllers.get('leaseAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('leaseAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('leaseAdminTabs');
        }
        if (View.controllers.get('tabsLeaseAdminMngByLocation') != undefined) {
            this.docActionPanel.show(false, true);
            this.openerController = View.controllers.get('tabsLeaseAdminMngByLocation');
            this.openerPanel = View.panels.get('tabsLeaseAdminMngByLocation');
        }
        this.initVariables(this.openerPanel, this.openerController);
        this.restoreSettings();
        
        
        
    },
    documentsGrid_onNew: function(){
        if (this.leaseId != null) {
            addEditDoc(null, this.leaseId, 'LEASE', getMessage('add_new'));
        }
        else {
            addEditDoc(null, this.itemId, this.itemType, getMessage('add_new'));
        }
    },
    documentsGrid_onEdit: function(row){
        if (this.leaseId != null) {
            addEditDoc(row, this.leaseId, 'LEASE', getMessage('edit'));
        }
        else {
            addEditDoc(row, this.itemId, this.itemType, getMessage('edit'));
        }
    },
    documentsGrid_onDelete: function(row){
        var dataSource = this.dsDocuments;
        var record = row.getRecord();
        var reportPanel = this.documentsGrid;
        View.confirm(getMessage('message_document_confirmdelete'), function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    reportPanel.refresh(reportPanel.restriction);
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        })
    },
    docActionPanel_onCancel: function(){
        var tabsController = this.openerController;
        View.confirm(getMessage('message_cancelconfirm'), function(button){
            if (button == 'yes') {
                tabsController.afterInitialDataFetch();
                tabsController.navigateToTab(0);
            }
        })
    },
    docActionPanel_onBack: function(){
        this.openerController.navigate('backward');
    },
    docActionPanel_onContinue: function(){
        this.openerController.navigate('forward');
    },
    docActionPanel_onFinish: function(){
        this.openerController.afterInitialDataFetch();
		this.openerPanel.tabs[0].loadView();
        this.openerController.navigateToTab(0);
    },
    initVariables: function(openerPanel, openerController){
        this.openerController = openerController;
        this.openerPanel = openerPanel;
        this.wizard = this.openerPanel.wizard;
        this.type = this.wizard.getType();
        this.action = this.wizard.getAction();
        this.actionType = this.wizard.getActionType();
        this.itemId = this.wizard.getItemId();
        this.itemType = this.wizard.getItemType();
        this.itemIsOwned = this.wizard.getItemIsOwned();
        this.leaseId = this.wizard.getLeaseId();
        this.leaseType = this.wizard.getLeaseType();
        this.contentDisabled = this.openerPanel.tabsStatus[this.openerPanel.selectedTabName];
    },
    restoreSettings: function(){
        if (View.controllers.get('tabsLeaseAdminMngByLocation') != undefined) {
            this.docActionPanel.show(false, true);
        }
        var restriction = '';
        if (this.actionType == 'BUILDING') {
            restriction = 'docs_assigned.bl_id = \'' + this.itemId + '\'';
        }
        if (this.actionType == 'LAND' || this.actionType == 'STRUCTURE') {
            restriction = 'docs_assigned.pr_id = \'' + this.itemId + '\'';
        }
        if (this.actionType == 'LEASE' || this.leaseId != null) {
            restriction = 'docs_assigned.ls_id = \'' + this.leaseId + '\'';
        }
        this.documentsGrid.refresh(restriction);
    },
    documentsGrid_onView: function(row){
		View.showDocument({'doc_id':row.getFieldValue('docs_assigned.doc_id')}, 'docs_assigned', 'doc', row.getFieldValue('docs_assigned.doc'));
     }
})
function addEditDoc(row, itemId, itemType, title){
    View.openDialog('ab-rplm-add-edit-document.axvw', null, true, {
        width: 800,
        height: 400,
        closeButton: true,
        afterInitialDataFetch: function(dialogView){
            var dialogController = dialogView.controllers.get('addEditDoc');
            dialogController.itemId = itemId;
            dialogController.itemType = itemType;
            dialogController.addEditDoc.setTitle(title)
            if (row != null) {
                dialogController.docId = row.getFieldValue('docs_assigned.doc_id');
                dialogController.addEditDoc.refresh({
                    'docs_assigned.doc_id': row.getFieldValue('docs_assigned.doc_id')
                }, false);
            }
            else {
                dialogController.docId = null;
                dialogController.addEditDoc.newRecord = true;
            }
            dialogController.refreshPanels = new Array('documentsGrid');
        }
    });
}
