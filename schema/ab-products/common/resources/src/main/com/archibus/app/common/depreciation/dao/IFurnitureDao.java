package com.archibus.app.common.depreciation.dao;

import java.util.List;

import com.archibus.core.dao.IDao;

/**
 * Dao for furniture object. Mapped to <code>ta</code> table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 * @param <Furniture> type of the persistent object
 */
public interface IFurnitureDao<Furniture> extends IDao<Furniture> {
    /**
     * Returns list with all depreciable furniture.
     *
     * @return List<Furniture>
     */
    List<Furniture> getDepreciableFurnitureList();

    /**
     * Returns number of depreciable furniture.
     *
     * @return int
     */
    int getCountOfDepreciableFurniture();

}
