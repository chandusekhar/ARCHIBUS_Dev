/**
 * Domain object for an application enabled for the user.
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 *
 * @since 21.1
 */
Ext.define('Common.model.App', {
    extend: 'Ext.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'title',
                type: 'string'
            },
            {
                name: 'url',
                type: 'string'
            },
            {
                name: 'iconData',
                type: 'string'
            },
            {
                name: 'isCached',
                type: 'boolean',
                defaultValue: false
            }
        ]
    }
});