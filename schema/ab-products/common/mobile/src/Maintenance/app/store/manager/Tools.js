/**
 * Store class to maintain Tool models.
 *
 * @author Ana Paduraru
 * @since 21.3
 */
Ext.define('Maintenance.store.manager.Tools', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Maintenance.model.manager.Tool'],

    serverTableName: 'tl',

    serverFieldNames: ['tool_id', 'tool_type', 'bl_id'],
    inventoryKeyNames: ['tool_id'],

    config: {
        model: 'Maintenance.model.manager.Tool',
        storeId: 'toolsStore',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Tools', 'Maintenance.store.manager.Tools'),
        sorters: [
            {
                property: 'tool_id',
                direction: 'ASC'
            }
        ],
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});