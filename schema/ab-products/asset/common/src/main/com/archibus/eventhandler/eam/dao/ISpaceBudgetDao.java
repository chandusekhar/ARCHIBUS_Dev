package com.archibus.eventhandler.eam.dao;

import com.archibus.core.dao.IDao;

/**
 *
 * Provides methods to load space budget.
 * <p>
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 * @param <SpaceBudget> type of object
 */
public interface ISpaceBudgetDao<SpaceBudget> extends IDao<SpaceBudget> {
    /**
     * Get space budget by name.
     *
     * @param name space budget name
     * @return SpaceBudget object
     */
    SpaceBudget getSpaceBudget(final String name);
}
