package com.archibus.app.common.space.dao;

import com.archibus.app.common.space.domain.RoomCategory;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.data.DataRecord;

/**
 * Dao for RoomCategory.
 * 
 * @author Zhang Yi
 * 
 */
public interface IRoomCategoryDao extends IDao<RoomCategory> {
    
    /**
     * Gets RoomCategory by primary key value.
     * 
     * @param categoryId primary key value of room category.
     * @return RoomCategory matching the supplied primary key value, or null, if not found.
     */
    RoomCategory getByPrimaryKey(String categoryId);
    
    /**
     * Converts the data record to a bean instance.
     * 
     * @param record The data record.
     * @return The bean instance.
     */
    RoomCategory convertRecordToObject(DataRecord record);
}
