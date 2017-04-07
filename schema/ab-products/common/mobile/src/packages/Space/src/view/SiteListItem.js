/**
 * The item component for the {@link Space.view.SiteList}
 * @since 21.2
 */
Ext.define('Space.view.SiteListItem', {
    extend: 'Ext.dataview.component.DataItem',

    xtype: 'siteListItem',

    config: {

        cls: 'component-list-item',

        image: {
            cls: 'ab-siteimage'
        },

        siteInfo: {
            flex: 5,
            cls: 'x-detail'
        },

        detailButton: {
            cls: 'ab-space-detail-button'
        },

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    applySiteInfo: function (config) {
        return Ext.factory(config, Ext.Component, this.getSiteInfo());
    },

    updateSiteInfo: function (newSiteInfo, oldSiteInfo) {
        if (newSiteInfo) {
            this.add(newSiteInfo);
        }
        if (oldSiteInfo) {
            this.remove(oldSiteInfo);
        }
    },

    applyDetailButton: function (config) {
        var buttonContainer = Ext.factory(config, Ext.Container, this.getDetailButton());

        buttonContainer.innerElement.dom.setAttribute('detailbutton', true);
        buttonContainer.innerElement.addCls('ab-detail-icon');
        return buttonContainer;
    },

    updateDetailButton: function (newButton, oldButton) {
        if (newButton) {
            this.add(newButton);
        }
        if (oldButton) {
            this.remove(oldButton);
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
            siteInfo = me.getSiteInfo(),
            imageData,
            image = me.getImage(),
            detailButton = me.getDetailButton();

        if (newRecord) {
            imageData = newRecord.get('site_photo_contents');

            if (imageData) {
                image.removeCls('ab-siteimage');
                image.setSrc('data:image/jpg;base64,' + imageData);
            } else {
                image.addCls('ab-siteimage');
            }
            siteInfo.setHtml(me.buildSiteInfo(newRecord));
            detailButton.setHidden(newRecord.get('site_id') === null);

        }
        me.callParent(arguments);
    },

    buildSiteInfo: function (record) {
        var siteInfo = record.getData(),
            site_id = siteInfo.site_id,
            html;

        html = '<div>';
        if (site_id !== null) {
            html += site_id;
        }
        if (siteInfo.name !== null) {
            if (site_id !== null) {
                html += ', ';
            }
            html += siteInfo.name;
        }
        html += '</div><h3>';
        if (siteInfo.city_id !== null) {
            html += siteInfo.city_id;
        }
        if (siteInfo.state_id !== null) {
            html += ' ' + siteInfo.state_id;
        }
        if (siteInfo.ctry_id !== null) {
            html += ', ' + siteInfo.ctry_id;
        }
        html += '</h3>';

        return html;
    }

});