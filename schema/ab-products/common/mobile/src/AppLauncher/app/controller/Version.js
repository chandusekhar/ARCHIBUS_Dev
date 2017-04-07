Ext.define('AppLauncher.controller.Version', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            aboutView: 'aboutPanel',
            aboutViewBuildContainer: 'aboutPanel #buildVersionContainer'
        },

        control: {
            aboutView: {
                initialize: 'onAboutInit'
            }
        }

    },

    onAboutInit: function () {
        var me = this,
            appStore = Ext.getStore('apps'),
            buildInfo = me.getBuildInfo(),
            data = [],
            appLauncherTitle = LocaleManager.getLocalizedString('App Launcher', 'AppLauncher.controller.About'),
            tpl,
            buildContainer;

        var items = appStore.data.items.map(function (item) {
            return {
                title: item.data.title,
                url: item.data.url
            };
        });

        // The AppLauncher is not included in the list of registered apps. Add it manually.
        items.unshift({title: appLauncherTitle, url: 'AppLauncher'});
        Ext.each(items, function (item) {
            var dataItem = {},
                localizedDateTimeFormat = LocaleManager.getLocalizedDateFormat() + ' h:i';

            dataItem.title = item.title;

            if (buildInfo[item.url]) {
                dataItem.build = buildInfo[item.url].buildVersion;
                dataItem.buildDate = Ext.Date.format(Ext.Date.parse(buildInfo[item.url].buildDate, 'Y-m-d h:i'), localizedDateTimeFormat);
            } else {
                dataItem.build = 'Not Available';
                dataItem.buildDate = '';
            }
            data.push(dataItem);
        });

        tpl = me.constructBuildInfoTemplate();
        buildContainer = me.getAboutViewBuildContainer();

        buildContainer.setTpl(tpl);
        buildContainer.setData(data);

        me.setVersionInfo();

    },

    getBuildInfo: function () {
        var buildInfo = localStorage.getItem('Ab.BuildVersions');

        return Ext.isEmpty(buildInfo) ? {} : Ext.decode(buildInfo);
    },

    setVersionInfo: function () {
        var me = this,
            aboutView = me.getAboutView(),
            webCentralVersion = localStorage.getItem('Ab.WebCentralVersion'),
            mobileClientVersion = localStorage.getItem('Ab.MobileClientVersion');

        aboutView.down('#webCentralVersion').setValue(webCentralVersion);

        if (Common.env.Feature.isNative) {
            aboutView.down('#mobileClientVersion').setValue(mobileClientVersion);
        } else {
            aboutView.down('#mobileClientVersion').setHidden(true);
        }
    },

    constructBuildInfoTemplate: function() {
        var tpl = ['<div><h3>{0}</h3></div><table><tr><th>{1}</th>',
                   '<th>{2}</th><th>{3}</th></tr><tpl for="."><tr><td>{title}</td>',
                   '<td>{build}</td><td>{buildDate}</td></tr></tpl></table>'].join('');

        var registeredAppLabel = LocaleManager.getLocalizedString('Registered Applications', 'AppLauncher.controller.About'),
            appLabel = LocaleManager.getLocalizedString('Application', 'AppLauncher.controller.About'),
            buildVersionLabel = LocaleManager.getLocalizedString('Build Version', 'AppLauncher.controller.About'),
            buildDateLabel = LocaleManager.getLocalizedString('Build Date', 'AppLauncher.controller.About');

        return Ext.String.format(tpl, registeredAppLabel, appLabel, buildVersionLabel, buildDateLabel );

    }
});