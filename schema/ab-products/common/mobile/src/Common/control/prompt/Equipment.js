/**
 * Common configuration for the Equipment prompt.
 * @author Jeff Martin
 * @since 21.2
 */
Ext.define('Common.control.prompt.Equipment', {
    extend: 'Common.control.field.Prompt',

    xtype: 'equipmentPrompt',

    config: {
        name: 'eq_id',
        title: LocaleManager.getLocalizedString('Equipment',
            'Common.control.prompt.Equipment'),
        label: LocaleManager.getLocalizedString('Equipment Code',
            'Common.control.prompt.Equipment'),
        store: 'equipmentsStore',
        displayFields: [
            {
                name: 'eq_id',
                title: LocaleManager.getLocalizedString('Equipment Code',
                    'Common.control.prompt.Equipment')
            },
            {
                name: 'eq_std',
                title: LocaleManager.getLocalizedString('Equipment Standard',
                    'Common.control.prompt.Equipment')
            }
        ],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Equipment:', 'Common.control.prompt.Equipment') +
                '</span><span class="prompt-code-value">{eq_id}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Standard:', 'Common.control.prompt.Equipment') +
                '</span><span>{eq_std}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});
