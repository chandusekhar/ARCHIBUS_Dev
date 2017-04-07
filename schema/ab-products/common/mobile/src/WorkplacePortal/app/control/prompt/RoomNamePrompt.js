Ext.define('WorkplacePortal.control.prompt.RoomNamePrompt', {
    extend: 'Common.control.field.Prompt',

    xtype: 'roomNamePrompt',

    config: {
        name: 'name',
        label: LocaleManager.getLocalizedString('Room Name', 'WorkplacePortal.control.prompt.RoomNamePrompt'),
        title: LocaleManager.getLocalizedString('Room Names', 'WorkplacePortal.control.prompt.RoomNamePrompt'),
        store: 'workplaceRoomPromptStore',
        displayFields: [
            {
                name: 'name',
                title: LocaleManager.getLocalizedString('Room Name','WorkplacePortal.control.prompt.RoomNamePrompt')
            },
            {
                name: 'rm_id',
                title: LocaleManager.getLocalizedString('Room Code','WorkplacePortal.control.prompt.RoomNamePrompt')
            },
            {
                name: 'fl_id',
                title: LocaleManager.getLocalizedString('Floor Code','WorkplacePortal.control.prompt.RoomNamePrompt')
            },
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Building Code','WorkplacePortal.control.prompt.RoomNamePrompt')
            }
        ],
        parentFields: ['site_id', 'bl_id', 'fl_id', 'rm_id'],
        childFields: ['eq_id'],

        displayTemplate: {
            tablet: '<div class="prompt-list-hbox">'
                + '<div style="width:40%">{name}</div>'
                + '<div style="width:20%">{rm_id}</div>'
                + '<div style="width:20%">{fl_id}</div>'
                + '<div style="width:20%">{bl_id}</div>'
                + '</div>',
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Room Name:', 'WorkplacePortal.control.prompt.RoomNamePrompt') +
                '</span><span class="prompt-code-value">{name}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Room Code:', 'WorkplacePortal.control.prompt.RoomNamePrompt') +
                '</span><span class="prompt-code-value">{rm_id}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Building/Floor:', 'WorkplacePortal.control.prompt.RoomNamePrompt') +
                '</span><span>{bl_id}/{fl_id}</span></div>'
        },

        headerTemplate: {
            tablet: '<div class="prompt-list-label">'
                + '<div style="margin-left:10px;width:40%">' + LocaleManager.getLocalizedString('Room Name', 'WorkplacePortal.control.prompt.RoomNamePrompt') + '</div>'
                + '<div style="width:20%">' + LocaleManager.getLocalizedString('Room Code', 'WorkplacePortal.control.prompt.RoomNamePrompt') + '</div>'
                + '<div style="width:20%">' + LocaleManager.getLocalizedString('Floor Code', 'WorkplacePortal.control.prompt.RoomNamePrompt') + '</div>'
                + '<div style="width:20%">' + LocaleManager.getLocalizedString('Building Code', 'WorkplacePortal.control.prompt.RoomNamePrompt') + '</div>'
                + '</div>',
            phone: '<div></div>'
        }
    }
});
