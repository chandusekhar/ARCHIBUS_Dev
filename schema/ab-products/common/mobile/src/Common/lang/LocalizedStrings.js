/**
 * Contains common localized strings. Strings referenced in this class can be used any place in the
 * app where the LocaleManger#getLocalizedString function is used. Using strings in this class can
 * reduce the number of localized strings required in the app.
 *
 * Using the Common.lang.LocalizedString class in a configuration block:
 *
 *     {
 *         xtype: 'button'
 *         text: LocalizedStrings.z_Done  // Set the button text to Done
 *     }
 *
 * @since 23.1
 * @author Jeff Martin
 */
Ext.define('Common.lang.LocalizedStrings', {
    alternateClassName: ['LocalizedStrings'],
    singleton: true,

    z_Done: LocaleManager.getLocalizedString('Done', 'Common.lang.LocalizedStrings'),
    z_Cancel: LocaleManager.getLocalizedString('Cancel', 'Common.lang.LocalizedStrings'),
    z_Clear: LocaleManager.getLocalizedString('Clear', 'Common.lang.LocalizedStrings'),
    z_Error: LocaleManager.getLocalizedString('Error', 'Common.lang.LocalizedStrings'),
    z_Copy: LocaleManager.getLocalizedString('Copy', 'Common.lang.LocalizedStrings'),
    z_Paste: LocaleManager.getLocalizedString('Paste', 'Common.lang.LocalizedStrings'),
    z_Reload: LocaleManager.getLocalizedString('Reload', 'Common.lang.LocalizedStrings'),
    z_Save_Image: LocaleManager.getLocalizedString('Save Image', 'Common.lang.LocalizedStrings'),
    z_Yes: LocaleManager.getLocalizedString('Yes', 'Common.lang.LocalizedStrings'),
    z_No: LocaleManager.getLocalizedString('No', 'Common.lang.LocalizedStrings'),
    z_Room_Name: LocaleManager.getLocalizedString('Room Name', 'Common.lang.LocalizedStrings'),
    z_Room_Names: LocaleManager.getLocalizedString('Room Names', 'Common.lang.LocalizedStrings'),
    z_Survey: LocaleManager.getLocalizedString('Survey', 'Common.lang.LocalizedStrings')


});