package com.archibus.app.common.space.domain;

/**
 * Domain object for Room.
 * <p>
 * Mapped to rm table.
 *
 * @author Valery Tydykov
 *
 */
public class Room {
    /**
     * Building ID.
     */
    private String buildingId;

    /**
     * Room category.
     */
    private String category;

    /**
     * Department ID.
     */
    private String departmentId;

    /**
     * Division ID.
     */
    private String divisionId;

    /**
     * Floor ID.
     */
    private String floorId;

    /**
     * Room ID.
     */
    private String id;

    /**
     * Room prorate.
     */
    private String prorate;

    /**
     * Room type.
     */
    private String type;

    /**
     * Room name.
     */
    private String name;

    /**
     * Employee Capacity.
     */
    private int employeeCapacity;

    /**
     * Room standard.
     */
    private String standard;

    /**
     * Team Id.
     */
    private Integer teamId;

    /**
     * @return the buildingId
     */
    public String getBuildingId() {
        return this.buildingId;
    }

    /**
     * @return the category
     */
    public String getCategory() {
        return this.category;
    }

    /**
     * @return the departmentId
     */
    public String getDepartmentId() {
        return this.departmentId;
    }

    /**
     * @return the divisionId
     */
    public String getDivisionId() {
        return this.divisionId;
    }

    /**
     * Getter for the employeeCapacity property.
     *
     * @see employeeCapacity
     * @return the employeeCapacity property.
     */
    public int getEmployeeCapacity() {
        return this.employeeCapacity;
    }

    /**
     * @return the floorId
     */
    public String getFloorId() {
        return this.floorId;
    }

    /**
     * @return the id
     */
    public String getId() {
        return this.id;
    }

    /**
     * @return the prorate
     */
    public String getProrate() {
        return this.prorate;
    }

    /**
     * @return the type
     */
    public String getType() {
        return this.type;
    }

    /**
     * @return the standard
     */
    public String getStandard() {
        return this.standard;
    }

    /**
     * @param buildingId the buildingId to set
     */
    public void setBuildingId(final String buildingId) {
        this.buildingId = buildingId;
    }

    /**
     * @param category the category to set
     */
    public void setCategory(final String category) {
        this.category = category;
    }

    /**
     * @param departmentId the departmentId to set
     */
    public void setDepartmentId(final String departmentId) {
        this.departmentId = departmentId;
    }

    /**
     * @param divisionId the divisionId to set
     */
    public void setDivisionId(final String divisionId) {
        this.divisionId = divisionId;
    }

    /**
     * Setter for the employeeCapacity property.
     *
     * @see employeeCapacity
     * @param employeeCapacity the employeeCapacity to set
     */

    public void setEmployeeCapacity(final int employeeCapacity) {
        this.employeeCapacity = employeeCapacity;
    }

    /**
     * @param floorId the floorId to set
     */
    public void setFloorId(final String floorId) {
        this.floorId = floorId;
    }

    /**
     * @param id the id to set
     */
    public void setId(final String id) {
        this.id = id;
    }

    /**
     * @param prorate the prorate to set
     */
    public void setProrate(final String prorate) {
        this.prorate = prorate;
    }

    /**
     * @param type the type to set
     */
    public void setType(final String type) {
        this.type = type;
    }

    /**
     * @param standard the standard to set
     */
    public void setStandard(final String standard) {
        this.standard = standard;
    }

    /**
     * Gets the name.
     *
     * @return the name
     */
    public String getName() {
        return this.name;
    }

    /**
     * Sets the name.
     *
     * @param name the new name
     */
    public void setName(final String name) {
        this.name = name;
    }

    /**
     * Getter for the teamId property.
     *
     * @see teamId
     * @return the teamId property.
     */
    public Integer getTeamId() {
        return this.teamId;
    }

    /**
     * Setter for the teamId property.
     *
     * @see teamId
     * @param teamId the teamId to set
     */

    public void setTeamId(final Integer teamId) {
        this.teamId = teamId;
    }
}
