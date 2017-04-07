var rplmParcelsController = View.createController('rplmParcels', {
    openerController: null,
    openerPanel: null,
    wizard: null,

    afterInitialDataFetch: function () {
        if (View.getOpenerView().controllers.get('portfAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('portfAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('wizardTabs');
        }
        if (View.getOpenerView().controllers.get('leaseAdminWizard') != undefined) {
            this.openerController = View.getOpenerView().controllers.get('leaseAdminWizard');
            this.openerPanel = View.getOpenerView().panels.get('leaseAdminTabs');
        }
        this.initVariables(this.openerPanel, this.openerController);
        this.restoreSettings();
    },
    initVariables: function (openerPanel, openerController) {
        this.openerController = openerController;
        this.openerPanel = openerPanel;
        this.wizard = this.openerPanel.wizard;
    },
    restoreSettings: function () {
        var restriction = new Ab.view.Restriction();
        restriction.addClause('parcel.pr_id', this.wizard.getItemId(), "=");
        this.abRplmParcels_list.refresh(restriction);
        this.abRplmParcels_form.refresh(restriction, true);
    },
    parcelsActionPanel_onBack: function(){
        this.openerController.navigate('backward');
    },
    parcelsActionPanel_onContinue: function(){
        this.openerController.navigate('forward');
    },
    parcelsActionPanel_onFinish: function(){
        this.openerController.afterInitialDataFetch();
        this.openerPanel.tabs[0].loadView();
        this.openerController.navigateToTab(0);
    }
});