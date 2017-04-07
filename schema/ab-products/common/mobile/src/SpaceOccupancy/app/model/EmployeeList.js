/**
 * Model class used in the {@link SpaceOccupancy.store.EmployeeListStore} class
 *
 * @author Ana Paduraru
 * @since 21.3
 */
Ext.define('SpaceOccupancy.model.EmployeeList', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {name: 'em_id', type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'fl_id', type: 'string'},
            {name: 'rm_id', type: 'string'},
            {name: 'survey_id', type: 'string'},
            {name: 'primary_em', type: 'string'},
            {name: 'pct_id', type: 'string'}
        ]
    }
});