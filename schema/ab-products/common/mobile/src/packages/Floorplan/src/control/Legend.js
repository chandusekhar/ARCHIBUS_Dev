/**
 * A container used to display the Redline legend components
 * @since 22.1
 * @author Jeff Martin
 */
Ext.define('Floorplan.control.Legend', {
    extend: 'Ext.Container',
    requires: 'Floorplan.component.Legend',

    xtype: 'legend',

    config: {
        layout: 'vbox',
        height:'100%',
        style: 'border-right: 2px solid #E4EBF6;background:#f9f9f9',
        items: [
            {
                xtype: 'container',
                scrollable: 'vertical',
                width: '120px',
                height: '100%',
                defaults: {
                    ui: 'action',
                    margin: '4px'
                },
                items: [
                    {
                        xtype: 'legendcomponent'
                    },
                    {
                        xtype: 'button',
                        itemId: 'Copy',
                        text: LocaleManager.getLocalizedString('Copy', 'Floorplan.control.Legend')
                    },
                    {
                        xtype: 'button',
                        itemId: 'Paste',
                        text: LocaleManager.getLocalizedString('Paste', 'Floorplan.control.Legend')
                    },
                    {
                        xtype: 'button',
                        itemId: 'Reload',
                        text: LocaleManager.getLocalizedString('Reload', 'Floorplan.control.Legend')
                    },
                    {
                        xtype: 'button',
                        itemId: 'Save',
                        text: LocaleManager.getLocalizedString('Save Image', 'Floorplan.control.Legend')
                    }
                ]
            }

        ]
    },

    initialize: function() {
        var me = this,
            buttons = me.query('button');

        me.callParent(arguments);

        // Add button tap handlers
        Ext.each(buttons, function(button) {
            button.on('tap', 'on' + button.getItemId() + 'Tap', me );
        }, me);
    },

    onCopyTap:function(button) {
        this.fireEvent('legendcopytap', button, this);
    },

    onPasteTap:function(button) {
        this.fireEvent('legendpastetap', button, this);
    },

    onReloadTap: function(button) {
        this.fireEvent('legendreloadtap', button, this);
    },

    onSaveTap: function(button) {
        this.fireEvent('legendsavetap', button, this);
    }

});
