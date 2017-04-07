/**
 * Convenience class that defines a standard Room Category prompt field
 * @author Ana Paduraru
 * @since 21.3
 */
Ext.define('Common.control.prompt.RoomCategory', {

    extend: 'Common.control.field.Prompt',

    xtype: 'roomCategoryPrompt',

    config: {
        name: 'rm_cat',
        label: LocaleManager.getLocalizedString('Room Category', 'Common.control.prompt.RoomCategory'),
        title: LocaleManager.getLocalizedString('Room Categories', 'Common.control.prompt.RoomCategory'),
        store: 'roomCategoriesStore',
        displayFields: [
            {
                name: 'rm_cat',
                title: LocaleManager.getLocalizedString('Room Category','Common.control.prompt.RoomCategory')
            },
            {
                name: 'description',
                title: LocaleManager.getLocalizedString('Description','Common.control.prompt.RoomCategory')
            }
        ],
        childFields: ['rm_type'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Category:', 'Common.control.prompt.RoomCategory') +
                '</span><span class="prompt-code-value">{rm_cat}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Description:', 'Common.control.prompt.RoomCategory') +
                '</span><span>{description}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});