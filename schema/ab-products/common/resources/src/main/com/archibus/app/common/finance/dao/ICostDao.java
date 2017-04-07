package com.archibus.app.common.finance.dao;

import java.util.*;

import com.archibus.core.dao.IDao;
import com.archibus.datasource.restriction.Restrictions.Restriction;

/**
 * Provides common methods to load Cost objects that match specified criteria.
 *
 * @author Valery Tydykov
 * @author Ioan Draghici
 *
 * @param <Cost> Type of persistent object.
 */
public interface ICostDao<Cost> extends IDao<Cost> {

    /**
     * Generates WHERE clause from specified cost IDs.
     *
     * @param costIds List of primary key values in the corresponding cost table.
     * @return WHERE clause.
     */
    String createSqlRestrictionForCosts(final List<Integer> costIds);

    /**
     * Finds costs for specified asset.
     *
     * @param assetKey Key of the table the costs are assigned to. Restrict the cost_tran_recur
     *            records. One of: "", "ls_id", "pr_id", "bl_id", "ac_id", "dv_id, dp_id". Note that
     *            the last choice is a compound key value. The "" value means no restriction.
     * @param startDate - start date to be used in a restriction.
     * @param endDate - end date to be used in a restriction.
     * @param clientRestriction Optional client-supplied restriction, in JSON string format.
     * @return list of costs.
     */
    List<Cost> findByAssetKeyAndDateRange(final String assetKey, final Date startDate,
            final Date endDate, final String clientRestriction);

    /**
     * Finds costs for specified cost IDs.
     *
     * @param costIds List of primary key values in the cost table.
     * @return list of costs.
     */
    List<Cost> findByCostIds(final List<Integer> costIds);

    /**
     * Find cost by specified restriction.
     *
     * @param restriction restriction
     * @return list of costs
     */
    List<Cost> findByRestriction(final Restriction restriction);

    /**
     * Get cost record by cost id.
     *
     * @param costId cost id
     * @return cost object
     */
    Cost getRecord(final int costId);
}
