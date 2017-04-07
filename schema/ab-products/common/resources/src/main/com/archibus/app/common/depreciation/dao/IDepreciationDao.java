package com.archibus.app.common.depreciation.dao;

import com.archibus.app.common.depreciation.domain.DepreciationReport;
import com.archibus.core.dao.IDao;

/**
 * DAO for depreciation object.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 * @param <Depreciation> type of the persistent object.
 */
public interface IDepreciationDao<Depreciation> extends IDao<Depreciation> {

    /**
     * Delete current data for depreciation report.
     *
     * @param depreciationReport depreciation report
     */
    void deleteDataForReport(final DepreciationReport depreciationReport);
}
