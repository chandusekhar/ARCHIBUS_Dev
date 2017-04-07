package com.archibus.app.common.space.domain;

import java.util.Date;

/**
 * Domain object for RoomTransaction. Some fields of RoomTransaction are the same as in Room.
 * <p>
 * Mapped to rmpct table.
 * 
 * @author Valery Tydykov
 * @author Zhang Yi
 * 
 *         <p>
 *         Suppress PMD warning "ExcessivePublicCount" in this class.
 *         <p>
 *         Justification: this class represent a database record.
 *         <p>
 *         Suppress PMD warning "ExcessivePublicCount" in this class.
 *         <p>
 *         Suppress PMD warning "TooManyFields" in this class, all fields is required for room
 *         transaction.
 *         <p>
 *         Justification: this class represent a database record.
 * 
 */
@SuppressWarnings({ "PMD.ExcessivePublicCount", "PMD.TooManyFields" })
public class RoomTransaction {
    /**
     * Constant: percentage of space: 100.0.
     */
    public static final double PERCENTAGE_SPACE_100 = 100.0;
    
    /**
     * Constant: part of ARCHIBUS schema enumeration for primaryRoom property: value 0.
     * <p>
     * End user can change definition of enumeration, so we can not use Java enum here.
     */
    public static final int PRIMARY_ROOM_0 = 0;
    
    /**
     * Constant: part of ARCHIBUS schema enumeration for primaryRoom property: value 1.
     * <p>
     * End user can change definition of enumeration, so we can not use Java enum here.
     */
    public static final int PRIMARY_ROOM_1 = 1;
    
    /**
     * Constant: part of ARCHIBUS schema enumeration for status property: value 0.
     * <p>
     * End user can change definition of enumeration, so we can not use Java enum here.
     */
    public static final int ROOM_STATUS_0 = 0;
    
    /**
     * Constant: part of ARCHIBUS schema enumeration for status property: value 1.
     * <p>
     * End user can change definition of enumeration, so we can not use Java enum here.
     */
    public static final int ROOM_STATUS_1 = 1;
    
    /**
     * Constant: part of ARCHIBUS schema enumeration for status property: value 2.
     * <p>
     * End user can change definition of enumeration, so we can not use Java enum here.
     */
    public static final int ROOM_STATUS_2 = 2;
    
    // public constants
    
    // for fixing kb3034179: since status 'obselete' is not useful, remove status=3. - by ZY
    /**
     * Constant: part of ARCHIBUS schema enumeration for status property: value 3.
     * <p>
     * End user can change definition of enumeration, so we can not use Java enum here.
     */
    // public static final int ROOM_STATUS_3 = 3;
    
    /**
     * Date when room was created.
     */
    private Date dateCreated;
    
    /**
     * Date when room was deleted.
     */
    private Date dateDeleted;
    
    /**
     * Date when room with the specified values finished to exist.
     */
    private Date dateEnd;
    
    /**
     * Date when room with the specified values started to exist.
     */
    private Date dateStart;
    
    /**
     * The name of the user who deleted the room.
     */
    private String deletionUserName;
    
    /**
     * Room transaction ID.
     */
    private int id;
    
    /**
     * Percentage of room space.
     */
    private double percentageOfSpace;
    
    /**
     * Primary employee enum value.
     */
    private int primaryEmployee;
    
    /**
     * Primary room enum value.
     */
    private int primaryRoom;
    
    /**
     * Room status enum value.
     */
    private int status;
    
    /**
     * The name of the user who changed the room values.
     */
    private String userName;
    
    /**
     * parent Room transaction ID.
     */
    private int parentId;
    
    /**
     * Building ID.
     */
    private String fromBuildingId;
    
    /**
     * Floor ID.
     */
    private String fromFloorId;
    
    /**
     * Room ID.
     */
    private String fromRoomId;
    
    /**
     * Building ID.
     */
    private String buildingId;
    
    /**
     * Floor ID.
     */
    private String floorId;
    
    /**
     * Room ID.
     */
    private String roomId;
    
    /**
     * Room Transaction's Room category.
     */
    private String category;
    
    /**
     * Room Transaction's prorate.
     */
    private String prorate;
    
    /**
     * Room type.
     */
    private String type;
    
    /**
     * Room Transaction's Department ID.
     */
    private String departmentId;
    
    /**
     * Room Transaction's Division ID.
     */
    private String divisionId;
    
    /**
     * Employee ID.
     */
    private String employeeId;
    
    /**
     * activity_log_id.
     */
    private Integer activityLogId;
    
    /**
     * move order ID.
     */
    private Integer moId;
    
    /**
     * Part of Day.
     */
    private Integer dayPart;
    
    /**
     * Getter for the dayPart property.
     * 
     * @see dayPart
     * @return the dayPart property.
     */
    public Integer getDayPart() {
        return this.dayPart;
    }
    
    /**
     * Getter for the moId property.
     * 
     * @see moId
     * @return the moId property.
     */
    public Integer getMoId() {
        return this.moId;
    }
    
    /**
     * Setter for the moId property. note: because set object moId to null object was deprecated by
     * checkstyle. leave default value null when it's less than 0.
     * 
     * @see moId
     * @param moId the moId to set
     */
    
    public void setMoId(final Integer moId) {
        if (moId != null && moId.intValue() > 0) {
            this.moId = moId;
        }
    }
    
    /**
     * Getter for the activityLogId property.
     * 
     * @see activityLogId
     * @return the activityLogId property.
     */
    public Integer getActivityLogId() {
        return this.activityLogId;
    }
    
    /**
     * Setter for the activityLogId property.
     * 
     * @see activityLogId note: because set object activityLogId to null object was deprecated by
     *      checkstyle. leave default value null when it's less than 0.
     * @param activityLogId the activityLogId to set
     */
    
    public void setActivityLogId(final Integer activityLogId) {
        if (activityLogId != null && activityLogId.intValue() > 0) {
            this.activityLogId = activityLogId;
        }
    }
    
    /**
     * @return the Room Transaction's buildingId
     */
    public String getBuildingId() {
        return this.buildingId;
    }
    
    /**
     * @return the Room Transaction's category
     */
    public String getCategory() {
        return this.category;
    }
    
    /**
     * @return the dateCreated
     */
    public Date getDateCreated() {
        return this.dateCreated;
    }
    
    /**
     * @return the dateDeleted
     */
    public Date getDateDeleted() {
        return this.dateDeleted;
    }
    
    /**
     * @return the dateEnd
     */
    public Date getDateEnd() {
        return this.dateEnd;
    }
    
    /**
     * @return the dateStart
     */
    public Date getDateStart() {
        return this.dateStart;
    }
    
    /**
     * @return the deletionUserName
     */
    public String getDeletionUserName() {
        return this.deletionUserName;
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
     * @return the employeeId
     */
    public String getEmployeeId() {
        return this.employeeId;
    }
    
    /**
     * @return the floorId
     */
    public String getFloorId() {
        return this.floorId;
    }
    
    /**
     * @return the buildingId
     */
    public String getFromBuildingId() {
        return this.fromBuildingId;
    }
    
    /**
     * @return the floorId
     */
    public String getFromFloorId() {
        return this.fromFloorId;
    }
    
    /**
     * @return the roomId
     */
    public String getFromRoomId() {
        return this.fromRoomId;
    }
    
    /**
     * @return the id
     */
    public int getId() {
        return this.id;
    }
    
    /**
     * @return the parentId
     */
    public int getParentId() {
        return this.parentId;
    }
    
    /**
     * @return the percentageOfSpace
     */
    public double getPercentageOfSpace() {
        return this.percentageOfSpace;
    }
    
    /**
     * @return the primaryEmployee
     */
    public int getPrimaryEmployee() {
        return this.primaryEmployee;
    }
    
    /**
     * @return the primaryRoom
     */
    public int getPrimaryRoom() {
        return this.primaryRoom;
    }
    
    /**
     * @return the prorate
     */
    public String getProrate() {
        return this.prorate;
    }
    
    /**
     * @return the roomId
     */
    public String getRoomId() {
        return this.roomId;
    }
    
    /**
     * @return the status
     */
    public int getStatus() {
        return this.status;
    }
    
    /**
     * @return the type
     */
    public String getType() {
        return this.type;
    }
    
    /**
     * @return the userName
     */
    public String getUserName() {
        return this.userName;
    }
    
    /**
     * @param buildingId the Room Transaction's buildingId to set
     */
    public void setBuildingId(final String buildingId) {
        this.buildingId = buildingId;
    }
    
    /**
     * @param category the Room Transaction's category to set
     */
    public void setCategory(final String category) {
        this.category = category;
    }
    
    /**
     * @param dateCreated the dateCreated to set
     */
    public void setDateCreated(final Date dateCreated) {
        this.dateCreated = dateCreated;
    }
    
    /**
     * @param dateDeleted the dateDeleted to set
     */
    public void setDateDeleted(final Date dateDeleted) {
        this.dateDeleted = dateDeleted;
    }
    
    /**
     * @param dateEnd the dateEnd to set
     */
    public void setDateEnd(final Date dateEnd) {
        this.dateEnd = dateEnd;
    }
    
    /**
     * @param dateStart the dateStart to set
     */
    public void setDateStart(final Date dateStart) {
        this.dateStart = dateStart;
    }
    
    /**
     * @param deletionUserName the deletionUserName to set
     */
    public void setDeletionUserName(final String deletionUserName) {
        this.deletionUserName = deletionUserName;
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
     * @param employeeId the employeeId to set
     */
    public void setEmployeeId(final String employeeId) {
        this.employeeId = employeeId;
    }
    
    /**
     * @param floorId the floorId to set
     */
    public void setFloorId(final String floorId) {
        this.floorId = floorId;
    }
    
    /**
     * @param fromBuildingId the buildingId to set
     */
    public void setFromBuildingId(final String fromBuildingId) {
        this.fromBuildingId = fromBuildingId;
    }
    
    /**
     * @param fromFloorId the floorId to set
     */
    public void setFromFloorId(final String fromFloorId) {
        this.fromFloorId = fromFloorId;
    }
    
    /**
     * @param fromFoomId the room id to set
     */
    public void setFromRoomId(final String fromFoomId) {
        this.fromRoomId = fromFoomId;
    }
    
    /**
     * @param id the id to set
     */
    public void setId(final int id) {
        this.id = id;
    }
    
    /**
     * @param parentId the parentId to set
     */
    public void setParentId(final int parentId) {
        this.parentId = parentId;
    }
    
    /**
     * @param percentageOfSpace the percentageOfSpace to set
     */
    public void setPercentageOfSpace(final double percentageOfSpace) {
        this.percentageOfSpace = percentageOfSpace;
    }
    
    /**
     * @param primaryEmployee the primaryEmployee to set
     */
    public void setPrimaryEmployee(final int primaryEmployee) {
        this.primaryEmployee = primaryEmployee;
    }
    
    /**
     * @param primaryRoom the primaryRoom to set
     */
    public void setPrimaryRoom(final int primaryRoom) {
        this.primaryRoom = primaryRoom;
    }
    
    /**
     * @param prorate the prorate to set
     * @see com.archibus.app.common.space.domain.Room#setProrate(java.lang.String)
     */
    public void setProrate(final String prorate) {
        this.prorate = prorate;
    }
    
    /**
     * @param roomId the room id to set
     * @see com.archibus.app.common.space.domain.Room#setId(java.lang.String)
     */
    public void setRoomId(final String roomId) {
        this.roomId = roomId;
    }
    
    /**
     * @param status the status to set
     */
    public void setStatus(final int status) {
        this.status = status;
    }
    
    /**
     * @param type the type to set
     * @see com.archibus.app.common.space.domain.Room#setType(java.lang.String)
     */
    public void setType(final String type) {
        this.type = type;
    }
    
    /**
     * @param userName the userName to set
     */
    public void setUserName(final String userName) {
        this.userName = userName;
    }
    
    /**
     * @param dayPart the dayPart to set
     */
    public void setDayPart(final Integer dayPart) {
        this.dayPart = dayPart;
    }
    
}
