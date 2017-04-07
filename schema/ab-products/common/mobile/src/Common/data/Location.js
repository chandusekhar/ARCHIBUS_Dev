/**
 * A mixin that retrieves location information from and {@link Ext.data.Model}.
 *
 * This class provides convenient methods that can be used to retrieve the location data. Location fields are
 * site_id, bl_id, fl_id and rm_id.
 *
 * @since 21.4
 * @author Jeff Martin
 */
Ext.define('Common.data.Location', {

    /**
     * Returns an object containing all of the location fields contained in the {@Ext.data.Model} class
     * @returns {Object}
     */
    getLocationFields: function () {
        var me = this,
            fields = me.getFields(),
            locationFields = ['site_id', 'bl_id', 'fl_id', 'rm_id'],
            location = {};

        Ext.each(locationFields, function (field) {
            if (fields.containsKey(field)) {
                location[field] = me.isNullString(me.get(field));
            }
        }, me);

        return location;
    },

    /**
     * Returns the formatted room id field or null if the Room Id is not valid. The room id is formatted combination
     * of bl_id;fl_id;rm_id
     * @returns {String/Object}
     */
    getRoomId: function () {
        var me = this;

        if (me.hasValidRoomCode()) {
            return Ext.String.format('{0};{1};{2}', me.get('bl_id'), me.get('fl_id'), me.get('rm_id'));
        } else {
            return null;
        }
    },

    /**
     * Returns true if the model contains bl_id, fl_id and rm_id fields and all fields are populated.
     * @returns {boolean}
     */
    hasValidRoomCode: function () {
        var me = this,
            isValid = false,
            fields = me.getFields(),
            blId,
            flId,
            rmId;

        if (fields.containsKey('bl_id') && fields.containsKey('fl_id') && fields.containsKey('rm_id')) {
            blId = me.get('bl_id');
            flId = me.get('fl_id');
            rmId = me.get('rm_id');
            isValid = !(Ext.isEmpty(blId) || Ext.isEmpty(flId) || Ext.isEmpty(rmId));
        }

        return isValid;
    },

    /**
     * @private
     */
    isNullString: function (valueStr) {
        return Ext.isEmpty(valueStr) ? '' : valueStr;
    }
});