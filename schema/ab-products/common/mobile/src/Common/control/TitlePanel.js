/**
 * Used by the navigation framework to add an additional title panel to the {@link Common.view.navigation.EditBase} and
 * {@link Common.view.navigation.ListBase} views.
 *
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Common.control.TitlePanel', {
    extend: 'Ext.TitleBar',

    xtype: 'titlepanel',

    config: {
        baseCls: 'x-titlepanel'
    },

    /**
     * @override
     * @param items
     */
    applyInitialItems: function(items) {
        var me = this,
            titleAlign = me.getTitleAlign(),
            defaults = me.getDefaults() || {};

        me.initialItems = items;

        me.leftBox = me.add({
            xtype: 'container',
            style: 'position: relative',
            layout: {
                type: 'hbox',
                align: 'center'
            },
            listeners: {
                resize: 'refreshTitlePosition',
                scope: me
            }
        });

        me.spacer = me.add({
            xtype: 'component',
            style: 'position: relative',
            flex: 1,
            listeners: {
                resize: 'refreshTitlePosition',
                scope: me
            }
        });

        me.rightBox = me.add({
            xtype: 'container',
            style: 'position: relative',
            layout: {
                type: 'hbox',
                align: 'center'
            },
            listeners: {
                resize: 'refreshTitlePosition',
                scope: me
            }
        });


        switch(titleAlign) {
            case 'left':
                me.titleComponent = me.leftBox.add({
                    xtype: 'title',
                    cls: Ext.baseCSSPrefix + 'title-align-left',
                    hidden: defaults.hidden
                });
                me.refreshTitlePosition = Ext.emptyFn;
                break;
            case 'right':
                me.titleComponent = me.rightBox.add({
                    xtype: 'title',
                    cls: Ext.baseCSSPrefix + 'title-align-right',
                    hidden: defaults.hidden
                });
                me.refreshTitlePosition = Ext.emptyFn;
                break;
            default:
                me.titleComponent = me.add({
                    xtype: 'title',
                    hidden: defaults.hidden,
                    centered: true
                    //style: 'font-size:0.6em'
                });
                break;
        }

        me.doAdd = me.doBoxAdd;
        me.remove = me.doBoxRemove;
        me.doInsert = me.doBoxInsert;
    }
});