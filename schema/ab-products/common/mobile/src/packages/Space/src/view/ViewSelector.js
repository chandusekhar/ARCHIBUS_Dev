/**
 * @since 21.2
 */
Ext.define('Space.view.ViewSelector', {
    extend: 'Common.view.navigation.ViewSelector',

    xtype: 'roomviewselector',

    /**
     * @override
     * Override the onDisplayView to provide Space apps specific behavior when displaying the views.
     * @param button
     */
    doDisplayView: function () {
        var me = this,
            panelRecord = null,
            panel, mobileId;

        // The selection timer prevents the view selection button from registering
        // multiple taps. This ensures only one instance of the view is displayed.
        me.startChildViewSelectionTimer();
        if (!me.enableChildViewSelection) {
            return;
        }
        me.enableChildViewSelection = false;

        // Get the record of the form panel the view selector is
        // contained in
        panel = this.up('formpanel');
        if (panel) {
            panelRecord = panel.getRecord();
        }

        mobileId = panelRecord.getId();

        panel.fireEvent('displaydocument', mobileId);

    }
});
