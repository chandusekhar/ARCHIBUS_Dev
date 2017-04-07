/**
 * Convenience class that defines a Room prompt field with friendly values displayed instead of code values.
 * @author Ana Albu
 * @since 21.3
 */

Ext.define('Common.control.prompt.RoomFriendlyValues', {
    extend: 'Common.control.field.Prompt',

    xtype: 'roomFriendlyValuesPrompt',

    config: {
        name: 'rm_id',
        label: LocaleManager.getLocalizedString('Room', 'Common.control.prompt.RoomFriendlyValues'),
        title: LocaleManager.getLocalizedString('Rooms', 'Common.control.prompt.RoomFriendlyValues'),
        store: 'roomPromptStore',
        displayFields: [
            {
                name: 'name',
                title: LocaleManager.getLocalizedString('Room', 'Common.control.prompt.RoomFriendlyValues')
            },
            {
                name: 'rm_id',
                title: LocaleManager.getLocalizedString('Room Code', 'Common.control.prompt.RoomFriendlyValues')
            },
            {
                name: 'fl_name',
                title: LocaleManager.getLocalizedString('Floor', 'Common.control.prompt.RoomFriendlyValues')
            },
            {
                name: 'fl_id',
                title: LocaleManager.getLocalizedString('Floor Code', 'Common.control.prompt.RoomFriendlyValues')
            },
            {
                name: 'bl_name',
                title: LocaleManager.getLocalizedString('Building', 'Common.control.prompt.RoomFriendlyValues')
            },
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Building Code', 'Common.control.prompt.RoomFriendlyValues')
            }
        ],
        parentFields: ['bl_id', 'fl_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Room:', 'Common.control.prompt.RoomFriendlyValues') +
                '</span><span class="prompt-code-value">{name}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Room Code:', 'Common.control.prompt.RoomFriendlyValues') +
                '</span><span>{rm_id}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Floor:', 'Common.control.prompt.RoomFriendlyValues') +
                '</span><span class="prompt-code-value">{fl_name}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Floor Code:', 'Common.control.prompt.RoomFriendlyValues') +
                '</span><span>{fl_id}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Building:', 'Common.control.prompt.RoomFriendlyValues') +
                '</span><span class="prompt-code-value">{bl_name}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Building Code:', 'Common.control.prompt.RoomFriendlyValues') +
                '</span><span>{bl_id}</span></div>',

            tablet: '<div class="prompt-list-hbox"><div style="width:33%"><h1>{name}</h1>' +
                '<div>{rm_id}</div></div>' +
                '<div style="width:33%"><h1>{fl_name}</h1>' +
                '<div>{fl_id}</div></div>' +
                '<div style="width:34%"><h1>{bl_name}</h1>' +
                '<div>{bl_id}</div></div></div>'
        },

        headerTemplate: {
            phone: '<div></div>',

            tablet: '<div class="prompt-list-label"><h3 style="width:33%">' +
                LocaleManager.getLocalizedString('Room', 'Common.control.prompt.RoomFriendlyValues') +
                '</h3><h3 style="width:33%">' +
                LocaleManager.getLocalizedString('Floor', 'Common.control.prompt.RoomFriendlyValues') +
                '</h3><h3 style="width:34%">' +
                LocaleManager.getLocalizedString('Building', 'Common.control.prompt.RoomFriendlyValues') +
                '</h3></div>'
        }
    }
});