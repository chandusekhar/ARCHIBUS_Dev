package com.archibus.app.common.organization.domain;

import com.archibus.app.common.space.domain.Room;

/**
 * Domain object for employee.
 * <p>
 * Mapped to em table.
 *
 * @author Valery Tydykov
 *
 */
public class Employee {
    /**
     * Department ID.
     */
    private String departmentId;

    /**
     * Division ID.
     */
    private String divisionId;

    /**
     * ID of the employee.
     */
    private String email;

    /**
     * First name.
     */
    private String firstName;

    /**
     * ID of the employee.
     */
    private String id;

    /**
     * Last name.
     */
    private String lastName;

    /**
     * Employee number.
     */
    private String number;

    /**
     * Phone number.
     */
    private String phone;

    /**
     * The employee is associated with the following room values.
     */
    private final Room room = new Room();

    /**
     * Employee standard.
     */
    private String standard;

    /**
     * @return the buildingId
     * @see com.archibus.app.common.space.domain.Room#getBuildingId()
     */
    public String getBuildingId() {
        return this.room.getBuildingId();
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
     * @return the email
     */
    public String getEmail() {
        return this.email;
    }

    /**
     * @return the firstName
     */
    public String getFirstName() {
        return this.firstName;
    }

    /**
     * @return the floorId
     * @see com.archibus.app.common.space.domain.Room#getFloorId()
     */
    public String getFloorId() {
        return this.room.getFloorId();
    }

    /**
     * @return the id
     */
    public String getId() {
        return this.id;
    }

    /**
     * @return the lastName
     */
    public String getLastName() {
        return this.lastName;
    }

    /**
     * @return the number
     */
    public String getNumber() {
        return this.number;
    }

    /**
     * @return the phone
     */
    public String getPhone() {
        return this.phone;
    }

    /**
     * @return the roomId
     * @see com.archibus.app.common.space.domain.Room#getId()
     */
    public String getRoomId() {
        return this.room.getId();
    }

    /**
     * @return the standard
     */
    public String getStandard() {
        return this.standard;
    }

    /**
     * @param buildingId the buildingId to set.
     * @see com.archibus.app.common.space.domain.Room#setBuildingId(java.lang.String)
     */
    public void setBuildingId(final String buildingId) {
        this.room.setBuildingId(buildingId);
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
     * @param email the email to set
     */
    public void setEmail(final String email) {
        this.email = email;
    }

    /**
     * @param firstName the firstName to set
     */
    public void setFirstName(final String firstName) {
        this.firstName = firstName;
    }

    /**
     * @param floorId the floorId to set.
     * @see com.archibus.app.common.space.domain.Room#setFloorId(java.lang.String)
     */
    public void setFloorId(final String floorId) {
        this.room.setFloorId(floorId);
    }

    /**
     * @param id the id to set
     */
    public void setId(final String id) {
        this.id = id;
    }

    /**
     * @param lastName the lastName to set
     */
    public void setLastName(final String lastName) {
        this.lastName = lastName;
    }

    /**
     * @param number the number to set
     */
    public void setNumber(final String number) {
        this.number = number;
    }

    /**
     * @param phone the phone to set
     */
    public void setPhone(final String phone) {
        this.phone = phone;
    }

    /**
     * @param roomId the roomId to set.
     * @see com.archibus.app.common.space.domain.Room#setId(java.lang.String)
     */
    public void setRoomId(final String roomId) {
        this.room.setId(roomId);
    }

    /**
     * @param standard the standard to set
     */
    public void setStandard(final String standard) {
        this.standard = standard;
    }
}
