/**
 * Model class used in the {@link SpaceOccupancy.store.DepartmentListStore} class
 *
 * @author Ana Paduraru
 * @since 21.3
 */
Ext.define('SpaceOccupancy.model.DepartmentList', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {name: 'pct_id', type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'fl_id', type: 'string'},
            {name: 'rm_id', type: 'string'},
            {name: 'dv_id', type: 'string'},
            {name: 'dp_id', type: 'string'},
            {name: 'survey_id', type: 'string'},
            {name: 'primary_rm', type: 'string'}
        ]
    }
});