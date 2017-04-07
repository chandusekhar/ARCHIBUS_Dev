package com.archibus.app.common.depreciation.dao;

import java.util.List;

import com.archibus.core.dao.IDao;

/**
 * Dao for equipment object. Mapped to <code>eq</code> table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 * @param <Equipment> type of the persistent object
 */
public interface IEquipmentDao<Equipment> extends IDao<Equipment> {

    /**
     * Returns list with all depreciable equipment.
     *
     * @return List<Equipment>
     */
    List<Equipment> getDepreciableEquipmentList();

    /**
     * Returns number of depreciable equipment.
     *
     * @return int
     */
    int getCountOfDepreciableEquipment();

}
