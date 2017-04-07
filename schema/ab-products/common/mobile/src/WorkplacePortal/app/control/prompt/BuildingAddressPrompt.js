Ext.define('WorkplacePortal.control.prompt.BuildingAddressPrompt', {
    extend: 'Common.control.field.Prompt',

    xtype: 'buildingAddressPrompt',

    config: {
        name: 'bl_id',
        label: LocaleManager.getLocalizedString('Building Code',
            'WorkplacePortal.control.prompt.BuildingAddressPrompt'),
        title: LocaleManager.getLocalizedString('Buildings',
            'WorkplacePortal.control.prompt.BuildingAddressPrompt'),
        store: 'spaceBookBuildings',
        displayFields: [
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Code', 'WorkplacePortal.control.prompt.BuildingAddressPrompt')
            },
            {
                name: 'name',
                title: LocaleManager.getLocalizedString('Name', 'WorkplacePortal.control.prompt.BuildingAddressPrompt')
            },
            {
                name: 'address1',
                title: LocaleManager.getLocalizedString('Address 1', 'WorkplacePortal.control.prompt.BuildingAddressPrompt')
            },
            {
                name: 'address2',
                title: LocaleManager.getLocalizedString('Address 2', 'WorkplacePortal.control.prompt.BuildingAddressPrompt')
            }
        ],
        parentFields: ['site_id'],
        childFields: ['fl_id', 'rm_id', 'name'],

        displayTemplate: {
            tablet: '<div class="prompt-list-hbox">'
                + '<div style="width:20%">{bl_id}</div>'
                + '<div style="width:30%">{name}</div>'
                + '<div style="width:30%">{address1}</div>'
                + '<div style="width:20%">{address2}</div>'
                + '</div>',
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Building Code:', 'WorkplacePortal.control.prompt.BuildingAddressPrompt') +
                '</span><span class="prompt-code-value">{bl_id}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Name:', 'WorkplacePortal.control.prompt.BuildingAddressPrompt') +
                '</span><span class="prompt-code-value">{name}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Address 1:', 'WorkplacePortal.control.prompt.BuildingAddressPrompt') +
                '</span><span>{address1}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Address 2:', 'WorkplacePortal.control.prompt.BuildingAddressPrompt') +
                '</span><span>{address2}</span></div>'
        },

        headerTemplate: {
            tablet: '<div class="prompt-list-label">'
                + '<div style="margin-left:10px;width:20%">' + LocaleManager.getLocalizedString('Code', 'WorkplacePortal.control.prompt.BuildingAddressPrompt') + '</div>'
                + '<div style="width:30%">' + LocaleManager.getLocalizedString('Name', 'WorkplacePortal.control.prompt.BuildingAddressPrompt') + '</div>'
                + '<div style="width:30%">' + LocaleManager.getLocalizedString('Address 1', 'WorkplacePortal.control.prompt.BuildingAddressPrompt') + '</div>'
                + '<div style="width:20%">' + LocaleManager.getLocalizedString('Address 2', 'WorkplacePortal.control.prompt.BuildingAddressPrompt') + '</div>'
                + '</div>',
            phone: '<div></div>'
        }
    }
});
