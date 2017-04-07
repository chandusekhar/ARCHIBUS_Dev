package com.archibus.app.common.depreciation.domain;

/**
 * Equipment depreciation domain object. Mapped to eq_dep database table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class EquipmentDepreciation extends Depreciation {

    /**
     * Equipment code.
     */
    private String equipmentId;

    /**
     * Default EquipmentDepreciation constructor.
     */
    public EquipmentDepreciation() {
        super();

    }

    /**
     *
     * EquipmentDepreciation constructor specifying equipment id and depreciation report id.
     *
     * @param eqId equipment id
     * @param reportId depreciation report id
     */
    public EquipmentDepreciation(final String eqId, final String reportId) {
        super();
        this.equipmentId = eqId;
        setReportId(reportId);
    }

    /**
     * Getter for the equipmentId property.
     *
     * @see equipmentId
     * @return the equipmentId property.
     */
    public String getEquipmentId() {
        return this.equipmentId;
    }

    /**
     * Setter for the equipmentId property.
     *
     * @see equipmentId
     * @param equipmentId the equipmentId to set
     */

    public void setEquipmentId(final String equipmentId) {
        this.equipmentId = equipmentId;
    }

}
