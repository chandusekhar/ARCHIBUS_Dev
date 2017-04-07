Ext.define('Maintenance.view.ViewSelector', {
    extend: 'Common.view.navigation.ViewSelector',

    xtype: 'workrequestviewselector',

    /**
     * @override
     * Override the onDisplayView to provide Maintenance app specific behavior when displaying the
     * views.
     * @param button
     */
    doDisplayView: function (button) {
        var me = this,
            navView = me.getNavigationView(),
            viewDefinition = {},
            setViewDefinitionProperties = function () {
                var myRecord,
                    panelRecord = null,
                    store = button.getStore(),
                    storeCount = 0,
                    isDocumentSelect = button.getDocumentSelect(),
                    panel;

                // Get the record of the form panel the view selector is
                // contained in
                panel = me.up('formpanel');
                if (panel) {
                    panelRecord = panel.getRecord();
                }

                if (store) {
                    storeCount = store.getCount();
                }

                // If there are no records in the store then display the create form, otherwise display
                // the update form.
                if (storeCount === 0) {
                    viewDefinition.xtype = me.getButtonViewToDisplay(button, 'edit');
                    viewDefinition.isCreateView = true;
                } else {
                    viewDefinition.xtype = me.getButtonViewToDisplay(button, 'list');
                    viewDefinition.isCreateView = false;
                }

                // set the viewIds
                if (Ext.isDefined(me.getRecord)) {
                    myRecord = me.getRecord();
                    viewDefinition.viewIds = {
                        workRequestId: myRecord.get('wr_id'),
                        mobileId: myRecord.get('mob_wr_id')
                    };
                }

                // Add the record if this is a Document view.
                if (isDocumentSelect) {
                    viewDefinition.record = panelRecord;
                } else if (Ext.isDefined(button.getRecord)) {
                    viewDefinition.record = button.getRecord();
                }

                if (Ext.isDefined(button.config.scrollable)) {
                    viewDefinition.scrollable = button.config.scrollable;
                }
            };

        // The selection timer prevents the view selection button from registering
        // multiple taps. This ensures only one instance of the view is displayed.
        me.startChildViewSelectionTimer();
        if (!me.enableChildViewSelection) {
            return;
        }
        me.enableChildViewSelection = false;

        setViewDefinitionProperties();

        navView.push(viewDefinition);
    }
});
