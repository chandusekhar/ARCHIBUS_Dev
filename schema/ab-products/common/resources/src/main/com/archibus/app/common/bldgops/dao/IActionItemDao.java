package com.archibus.app.common.bldgops.dao;

import java.util.List;

import com.archibus.app.common.bldgops.domain.ActionItem;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.data.DataRecord;

/**
 * DAO for Action Item.
 *
 * @author Zhang Yi
 *
 */
public interface IActionItemDao extends IDao<ActionItem> {
    
    /**
     * Gets Action Item using primary key values supplied in the Action Item.
     *
     * @param item with primary key values.
     * @return ActionItem matching the supplied primary key values, or null, if not found.
     */
    ActionItem getByPrimaryKey(ActionItem item);

    /**
     * Gets Action Item List using scenario id.
     *
     * @param scenarioId scenario's id.
     * @return List<ActionItem> matching the supplied primary key values, or null, if not found.
     */
    List<ActionItem> findByScenario(String scenarioId);
    
    /**
     * Converts the data record to a bean instance.
     *
     * @param record The data record.
     * @return The bean instance.
     */
    ActionItem convertRecordToObject(DataRecord record);
}
