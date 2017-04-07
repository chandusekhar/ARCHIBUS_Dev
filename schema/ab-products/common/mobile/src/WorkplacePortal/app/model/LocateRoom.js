/**
 * Extend Room model in order to add validation
 *
 * @author Cristina Reghina
 * @since 21.2
 */
Ext.define('WorkplacePortal.model.LocateRoom', {
    extend: 'Common.model.Room',
    config: {
        validations: [
            {
                type: 'presence',
                field: 'bl_id'
            },
            {
                type: 'presence',
                field: 'fl_id'
            },
            {
                type: 'presence',
                field: 'rm_id'
            }
        ]
    }
});