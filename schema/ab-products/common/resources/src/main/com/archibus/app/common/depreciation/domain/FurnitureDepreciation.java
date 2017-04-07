package com.archibus.app.common.depreciation.domain;

/**
 * Furniture depreciation domain object. Mapped to ta_dep database table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FurnitureDepreciation extends Depreciation {
    /**
     * Furniture code.
     */
    private String furnitureId;

    /**
     *
     * Default FurnitureDepreciation constructor.
     */
    public FurnitureDepreciation() {
        super();
    }

    /**
     * Default FurnitureDepreciation constructor specifying furniture id and depreciation report id.
     *
     * @param taId furniture id
     * @param reportId depreciation report id
     */
    public FurnitureDepreciation(final String taId, final String reportId) {
        super();
        this.furnitureId = taId;
        setReportId(reportId);
    }

    /**
     * Getter for the furnitureId property.
     *
     * @see furnitureId
     * @return the furnitureId property.
     */
    public String getFurnitureId() {
        return this.furnitureId;
    }

    /**
     * Setter for the furnitureId property.
     *
     * @see furnitureId
     * @param furnitureId the furnitureId to set
     */

    public void setFurnitureId(final String furnitureId) {
        this.furnitureId = furnitureId;
    }

}
