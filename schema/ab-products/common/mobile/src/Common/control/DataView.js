/**
 * Extends the {@link Ext.DataView} class to apply shared configuration settings.
 *
 * @since 21.4
 */
Ext.define('Common.control.DataView', {
    extend: 'Ext.DataView',

    xtype: 'commondataview',

    config: {
        loadingText: LocaleManager.getLocalizedString('Loading...','Common.control.DataView')
    }
});
