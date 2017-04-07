package com.archibus.app.common.metrics.dao;

import java.util.List;

import com.archibus.app.common.metrics.domain.Scorecard;
import com.archibus.core.dao.IDao;

/**
 * DAO for scorecard assignments. Interface to be implemented by ScorecardDataSource.
 * <p>
 * 
 * 
 * @author Sergey Kuramshyn
 * @since 21.2
 * 
 */

public interface IScorecardDao extends IDao<Scorecard> {
    
    /**
     * Load all scorecard assignments for specified scorecard name.
     * 
     * @param scorecardName The scorecard name.
     * @return list of metrics
     */
    List<Scorecard> getScorecardAssignments(final String scorecardName);
}
