Ext.define('AppLauncher.controller.phone.Preferences', {
    extend: 'AppLauncher.controller.Preferences',

    config: {
        control: {
            preferencesView: {
                push: 'onPushView',
                pop: 'onPopView'
            }
        }
    },

    onDisplayPreferences: function () {
        var me = this;

        me.callParent(arguments);

        if (!me.preferencesPanel) {
            me.preferencesPanel = Ext.create('AppLauncher.view.phone.Preferences');
            Ext.Viewport.add(me.preferencesPanel);
        }
        me.preferencesPanel.show();
    },

    onPreferenceListTap: (function () {
        var isTapped = false;
        return function (list, index, target, record) {
            var viewName,
                view;
            if (!isTapped) {
                isTapped = true;
                viewName = record.get('view');
                view = this.createView(viewName);
                this.getPreferencesView().push(view);
                setTimeout(function () {
                    isTapped = false;
                }, 500);
            }
        };
    })(),

    onPushView: function () {
        this.getSettingsDoneButton().setHidden(true);
    },

    onPopView: function () {
        this.getSettingsDoneButton().setHidden(false);
    }
});