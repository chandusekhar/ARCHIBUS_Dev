package com.archibus.app.common.depreciation.dao;

import com.archibus.core.dao.IDao;

/**
 * DAO for depreciation report. Mapped to dep_reports database table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 * @param <DepreciationReport> type of the persistent object
 */
public interface IDepreciationReportDao<DepreciationReport> extends IDao<DepreciationReport> {

    /**
     * Returns the active depreciation report.
     *
     * @return DepreciationReport
     */
    DepreciationReport getActiveReport();

    /**
     * Returns the active depreciation report for report id.
     *
     * @param reportId depreciation report id
     * @return DepreciationReport
     */
    DepreciationReport getReportById(final String reportId);
}
