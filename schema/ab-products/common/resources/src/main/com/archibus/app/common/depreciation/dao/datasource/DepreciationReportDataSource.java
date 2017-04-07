package com.archibus.app.common.depreciation.dao.datasource;

import static com.archibus.app.common.depreciation.Constants.*;

import com.archibus.app.common.depreciation.dao.IDepreciationReportDao;
import com.archibus.app.common.depreciation.domain.DepreciationReport;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;

/**
 * Depreciation report data source object. Mapped to <code>dep_reports</code> table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class DepreciationReportDataSource extends ObjectDataSourceImpl<DepreciationReport>
        implements IDepreciationReportDao<DepreciationReport> {

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES =
            { { REPORT_ID, "reportId" }, { "last_date", "lastDate" }, { ACTIVE, ACTIVE } };

    /**
     * Constructs DepreciationReportDataSource, mapped to <code>dep_reports</code> table, using
     * <code>depreciationReport</code> bean.
     */
    public DepreciationReportDataSource() {
        super("depreciationReport", "dep_reports");
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }

    /** {@inheritDoc} */

    @Override
    public DepreciationReport getActiveReport() {
        return getReportByRestriction(
            Restrictions.and(new Clause[] { Restrictions.eq(this.tableName, ACTIVE, YES) }));
    }

    /** {@inheritDoc} */

    @Override
    public DepreciationReport getReportById(final String reportId) {
        return getReportByRestriction(Restrictions
            .and(new Clause[] { Restrictions.eq(this.tableName, REPORT_ID, reportId) }));
    }

    /**
     * Get depreciation report by restriction.
     *
     * @param restriction restriction
     * @return DepreciationReport
     */
    public DepreciationReport getReportByRestriction(final Restriction restriction) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(restriction);
        final DataRecord record = dataSource.getRecord();
        return new DataSourceObjectConverter<DepreciationReport>().convertRecordToObject(record,
            this.beanName, this.fieldToPropertyMapping, null);
    }

}
