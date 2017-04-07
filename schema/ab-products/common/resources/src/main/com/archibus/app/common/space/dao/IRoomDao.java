package com.archibus.app.common.space.dao;

import com.archibus.app.common.space.domain.Room;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.data.DataRecord;

/**
 * Dao for Room.
 * 
 * @author Valery Tydykov
 * 
 */
public interface IRoomDao extends IDao<Room> {
    
    /**
     * Gets Room using primary key values supplied in the room.
     * 
     * @param room with primary key values.
     * @return Room matching the supplied primary key values, or null, if not found.
     */
    Room getByPrimaryKey(Room room);
    
    /**
     * Converts the data record to a bean instance.
     * 
     * @param record The data record.
     * @return The bean instance.
     */
    Room convertRecordToObject(DataRecord record);
}
