Ext.define('AppLauncher.view.AppItem', {
    extend: 'Ext.dataview.component.DataItem',

    requires: 'Ext.Img',

    xtype: 'appItem',

    config: {

        cls: 'ab-app-item',

        image: true,

        appInfo: {
            flex: 5,
            cls: 'x-detail'
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    constructor: function() {
        this.callParent(arguments);
    },

    applyAppInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getAppInfo());
    },

    updateAppInfo: function (newAppInfo, oldAppInfo) {
        if (newAppInfo) {
            this.add(newAppInfo);
        }
        if (oldAppInfo) {
            this.remove(oldAppInfo);
        }
    },

    applyImage: function (config) {
        return Ext.factory(config, Ext.Img, this.getImage());
    },

    updateImage: function (newImage, oldImage) {
        if (newImage) {
            this.add(newImage);
        }

        if (oldImage) {
            this.remove(oldImage);
        }
    },

    updateRecord: function (newRecord) {
        var me = this,
            appInfo = me.getAppInfo(),
            imageData,
            image = me.getImage(),
            appName;

        if (newRecord) {
            appName = newRecord.get('url');
            imageData = AppLauncher.ui.IconData.getIconData(appName);

            if(imageData) {
                image.removeCls('ab-siteimage');
                image.setSrc('data:image/png;base64,' + imageData);
            }
            appInfo.setHtml('<h3>' + newRecord.get('title') + '</h3>');
        }
        me.callParent(arguments);
    },

    initialize: function() {
        var me = this,
            image,
            appInfo;


        me.callParent(arguments);

        image = me.getImage();
        appInfo = me.getAppInfo();
        if(Ext.os.is.Phone) {
            image.addCls('ab-phone-icon');
            me.addCls('ab-app-list-phone');
            appInfo.addCls('ab-app-list-detail-phone');
        }
    }
});