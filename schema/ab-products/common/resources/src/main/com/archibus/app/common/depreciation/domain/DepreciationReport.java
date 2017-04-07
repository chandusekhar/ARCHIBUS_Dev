package com.archibus.app.common.depreciation.domain;

import java.util.Date;

/**
 * Depreciation report domain object.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class DepreciationReport {

    /**
     * Report id.
     */
    private String reportId;

    /**
     * Report last date.
     */
    private Date lastDate;

    /**
     * Active property (yes, no).
     */
    private String active;

    /**
     * Getter for the reportId property.
     *
     * @see reportId
     * @return the reportId property.
     */
    public String getReportId() {
        return this.reportId;
    }

    /**
     * Setter for the reportId property.
     *
     * @see reportId
     * @param reportId the reportId to set
     */

    public void setReportId(final String reportId) {
        this.reportId = reportId;
    }

    /**
     * Getter for the lastDate property.
     *
     * @see lastDate
     * @return the lastDate property.
     */
    public Date getLastDate() {
        return this.lastDate;
    }

    /**
     * Setter for the lastDate property.
     *
     * @see lastDate
     * @param lastDate the lastDate to set
     */

    public void setLastDate(final Date lastDate) {
        this.lastDate = lastDate;
    }

    /**
     * Getter for the active property.
     *
     * @see active
     * @return the active property.
     */
    public String getActive() {
        return this.active;
    }

    /**
     * Setter for the active property.
     *
     * @see active
     * @param active the active to set
     */

    public void setActive(final String active) {
        this.active = active;
    }

}
