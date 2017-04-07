Ext.define('AppLauncher.controller.tablet.Preferences', {
    extend: 'AppLauncher.controller.Preferences',

    onDisplayPreferences: function () {
        var me = this,
            firstRecord,
            firstView,
            settingPanel;

        // Load the Preferences store data
        me.callParent(arguments);

        firstRecord = Ext.getStore('Preferences').getAt(0);

        if (!me.preferencesPanel) {
            me.preferencesPanel = Ext.create('AppLauncher.view.tablet.Preferences');
            Ext.Viewport.add(me.preferencesPanel);

            firstView = me.createView(firstRecord.get('view'));
            settingPanel = me.getSettingPanel();
            settingPanel.add(firstView);
            me.setCurrentView(firstView);
        }

        me.preferencesPanel.show();
    },

    onPreferenceListTap: (function () {
        var isTapped = false;
        return function (list, index, target, record) {
            var me = this,
                viewName,
                currentView,
                view,
                settingPanel;

            if (!isTapped) {
                isTapped = true;
                viewName = record.get('view');
                currentView = me.getCurrentView();
                settingPanel = me.getSettingPanel();

                // Don't display the view if it is already displayed
                if (currentView.$className !== 'AppLauncher.view.' + viewName) {
                    settingPanel.remove(currentView, true);
                    view = me.createView(viewName);
                    me.setCurrentView(view);
                    settingPanel.add(view);
                }
            }
            setTimeout(function () {
                isTapped = false;
            }, 500);
        };

    })()
});