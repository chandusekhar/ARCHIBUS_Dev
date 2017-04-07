package com.archibus.eventhandler.compliance;

import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.StringUtil;

/**
 * Compliance Common Handler.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 */
public class ComplianceLocationProcessor {
    
    /**
     * Compliance Location for regulations or programs or compliance requirement.
     * 
     */
    private final DataSource dsComplianceLocations;
    
    /**
     * create Compliance Location for regulations or programs or compliance requirement.
     * 
     */
    private final DataSource dsRegloc;
    
    /**
     * Compliance Location for regulations or programs or compliance requirement.
     * 
     */
    private final DataSource dsReglocJoinComplianceLocations;
    
    /**
     * Compliance Location for regulations or programs or compliance requirement.
     * 
     */
    private final LocationHierarchy locationHierarchy;
    
    /**
     * Tables reference to location_id.
     * 
     */
    private final String[] locationReferenceTables = new String[] { Constant.REGLOC,
            Constant.REGVIOLATION, Constant.ACTIVITY_LOG, Constant.DOCS_ASSIGNED, "ls_comm" };
    
    /**
     * Constructor.
     * 
     */
    public ComplianceLocationProcessor() {
        
        this.locationHierarchy = new LocationHierarchy();
        
        this.dsRegloc =
                DataSourceFactory
                    .createDataSourceForFields(Constant.REGLOC, EventHandlerBase.getAllFieldNames(
                        ContextStore.get().getEventHandlerContext(), Constant.REGLOC));
        
        this.dsComplianceLocations =
                DataSourceFactory.createDataSourceForFields(Constant.COMPLIANCE_LOCATIONS,
                    EventHandlerBase.getAllFieldNames(ContextStore.get().getEventHandlerContext(),
                        Constant.COMPLIANCE_LOCATIONS));
        
        this.dsReglocJoinComplianceLocations =
                ComplianceUtility.getDataSourceRegLocJoinComplianceLoc();
    }
    
    /**
     * create Compliance Location for regulations or programs or compliance requirement.
     * 
     * @param reglocRecord DataRecord of reglocs
     * @param record given regulation or program or requirement record
     * @param type one of 'regulation'/'reg_program'/'reg_requirement'
     * 
     */
    private static void setRegLocationFields(final DataRecord reglocRecord,
            final JSONObject record, final String type) {
        
        if (Constant.REGULATION.equalsIgnoreCase(type)) {
            
            reglocRecord
                .setValue(Constant.REGLOC_REGULATION, record.getString(Constant.REGULATION));
            
        } else if (Constant.REG_PROGRAM.equalsIgnoreCase(type)) {
            
            reglocRecord.setValue("regloc.regulation", record.getString(Constant.REGULATION));
            reglocRecord.setValue(Constant.REGLOC_REG_PROGRAM,
                record.getString(Constant.REG_PROGRAM));
            
        } else if (Constant.REG_REQUIREMENT.equalsIgnoreCase(type)) {
            
            reglocRecord
                .setValue(Constant.REGLOC_REGULATION, record.getString(Constant.REGULATION));
            
            reglocRecord.setValue(Constant.REGLOC_REG_PROGRAM,
                record.getString(Constant.REG_PROGRAM));
            
            reglocRecord.setValue("regloc.reg_requirement",
                record.getString(Constant.REG_REQUIREMENT));
            
        }
        
    }
    
    /**
     * checks whether a new Compliance Location (regloc table) record (before saving) is not a
     * duplicate of an existing record, if there is an existed record then return it to client.
     * 
     * @param record one of Compliance Regulation/Compliance Program/Compliance Requirement, use
     *            only field name( no table name ) as keys in JSON object.
     * @param location JSON Object format of a compliance_locations record passed from client
     * @param type one of 'regulation'/'reg_program'/'reg_requirement'
     * @param locationId -1 if new record, or PK of existing record
     */
    public void checkOrReturnDuplicateLocations(final JSONObject record, final JSONObject location,
            final String type, final Integer locationId) {
        
        this.getLocationHierarchy().fillHierarchyForMultiLocationKey(location);
        
        final List<DataRecord> existedRecords =
                this.findExistedLocations(record, location, type, locationId);
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        if (existedRecords.isEmpty()) {
            context.addResponseParameter(Constant.VALUE, Constant.NULL);
            
        } else {
            context.addResponseParameter(Constant.VALUE,
                existedRecords.get(0).getInt(Constant.REGLOC + Constant.DOT + Constant.LOCATION_ID)
                        + Constant.DOT);
        }
        
        final DataRecord locationRecord = DataRecord.createRecordFromJSON(location);
        context.setResponse(locationRecord);
        
    }
    
    /**
     * find existed Compliance Location(regloc table) record (before saving).
     * 
     * @param record DataRecord one of Compliance Regulation/Compliance Program/Compliance
     *            Requirement
     * @param locationRecord JSON Object format of a compliance_locations record passed from client
     * @param type one of 'regulation'/'reg_program'/'reg_requirement'
     * @param locationId -1 if new record, or PK of existing record
     * 
     * @return existed regloc records
     */
    public List<DataRecord> findExistedLocations(final JSONObject record,
            final JSONObject locationRecord, final String type, final int locationId) {
        
        final ParsedRestrictionDef restriction = this.getRestrictionByLocation(locationRecord);
        
        if (Constant.REGULATION.equalsIgnoreCase(type)) {
            
            restriction.addClause(Constant.REGLOC, Constant.REGULATION,
                record.getString(Constant.REGULATION), Operation.EQUALS);
            restriction.addClause(Constant.REGLOC, Constant.REG_PROGRAM, null, Operation.IS_NULL);
            restriction.addClause(Constant.REGLOC, Constant.REG_REQUIREMENT, null,
                Operation.IS_NULL);
            
        } else if (Constant.REG_PROGRAM.equalsIgnoreCase(type)) {
            
            restriction.addClause(Constant.REGLOC, Constant.REGULATION,
                record.getString(Constant.REGULATION), Operation.EQUALS);
            restriction.addClause(Constant.REGLOC, Constant.REG_PROGRAM,
                record.getString(Constant.REG_PROGRAM), Operation.EQUALS);
            restriction.addClause(Constant.REGLOC, Constant.REG_REQUIREMENT, null,
                Operation.IS_NULL);
            
        } else if (Constant.REG_REQUIREMENT.equalsIgnoreCase(type)) {
            
            restriction.addClause(Constant.REGLOC, Constant.REGULATION,
                record.getString(Constant.REGULATION), Operation.EQUALS);
            restriction.addClause(Constant.REGLOC, Constant.REG_PROGRAM,
                record.getString(Constant.REG_PROGRAM), Operation.EQUALS);
            
            restriction.addClause(Constant.REGLOC, Constant.REG_REQUIREMENT,
                record.getString(Constant.REG_REQUIREMENT), Operation.EQUALS);
        }
        
        if (locationId != -1) {
            restriction.addClause(Constant.REGLOC, Constant.LOCATION_ID, locationId,
                Operation.NOT_EQUALS);
        }
        
        return this.dsReglocJoinComplianceLocations.getRecords(restriction);
    }
    
    /**
     * takes a list of locations and a list of regulations, programs, and/or requirements and
     * creates records in table regloc.
     * 
     * @param regulations List of Regulation for Compliance Program
     * @param programs List of Compliance Program Code
     * @param requirments List of Compliance Requirements
     * @param locations JSONObject contains lists of Country Code, Region Code, State Code, City
     *            Code, County Code, Site Code, Property Code, Building Code, Floor Code, Room Code,
     *            Equipment Code, Equipment Standard, Employee Code.
     */
    public void createComplianceLocations(final JSONArray regulations, final JSONArray programs,
            final JSONArray requirments, final JSONObject locations) {
        
        final List<DataRecord> records = new ArrayList<DataRecord>();
        
        for (int i = 0; i < regulations.length(); i++) {
            final JSONObject regulation = regulations.getJSONObject(i);
            ComplianceUtility.clearUselessFields(regulation);
            
            final DataRecord regulationRecord = DataRecord.createRecordFromJSON(regulation);
            final String regId = regulationRecord.getString("regulation.regulation");
            
            regulation.put(Constant.REGULATION, regId);
            
            this.createComplianceLocationForLocationsList(regulation, "regulation", locations,
                records);
        }
        
        for (int i = 0; i < programs.length(); i++) {
            final JSONObject program = programs.getJSONObject(i);
            ComplianceUtility.clearUselessFields(program);
            
            final DataRecord programRecord = DataRecord.createRecordFromJSON(program);
            final String progId = programRecord.getString(Constant.REGPROGRAM_REG_PROGRAM);
            final String regId = programRecord.getString(Constant.REGPROGRAM_REGULATION);
            
            program.put(Constant.REGULATION, regId);
            program.put(Constant.REG_PROGRAM, progId);
            this.createComplianceLocationForLocationsList(program, Constant.REG_PROGRAM, locations,
                records);
        }
        
        for (int i = 0; i < requirments.length(); i++) {
            final JSONObject requirement = requirments.getJSONObject(i);
            ComplianceUtility.clearUselessFields(requirement);
            
            final DataRecord requirementRecord = DataRecord.createRecordFromJSON(requirement);
            final String progId = requirementRecord.getString(Constant.REGREQUIREMENT_REG_PROGRAM);
            final String regId = requirementRecord.getString(Constant.REGREQUIREMENT_REGULATION);
            final String reqId =
                    requirementRecord.getString(Constant.REGREQUIREMENT_REG_REQUIREMENT);
            
            requirement.put(Constant.REGULATION, regId);
            requirement.put(Constant.REG_PROGRAM, progId);
            requirement.put(Constant.REG_REQUIREMENT, reqId);
            this.createComplianceLocationForLocationsList(requirement, Constant.REG_REQUIREMENT,
                locations, records);
            
        }
        
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(records);
        ContextStore.get().getEventHandlerContext().setResponse(dataSet);
    }
    
    /**
     * create Compliance Location for regulations or programs or compliance requirement.
     * 
     * @param record given regulation or program or requirement record
     * @param type one of 'regulation'/'reg_program'/'reg_requirement'
     * @param locationLists JSONObject contains lists of Country Code, Region Code, State Code, City
     *            Code, County Code, Site Code, Property Code, Building Code, Floor Code, Room Code,
     *            Equipment Code, Equipment Standard, Employee Code.
     * @param records List of created regloc records
     */
    public void createComplianceLocationForLocationsList(final JSONObject record,
            final String type, final JSONObject locationLists, final List<DataRecord> records) {
        
        for (final Iterator<String> it = locationLists.keys(); it.hasNext();) {
            
            final String locationKey = it.next();
            final JSONArray locations = locationLists.getJSONArray(locationKey);
            
            createReglocRecordsForLocationList(records, record, type, locations, locationKey);
        }
        
    }
    
    /**
     * @return found existed location id or newly created one.
     * 
     * @param location JSON Object format of a compliance_locations record passed from client
     * @param locationId location id.
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement Compliance Requirement ID
     * 
     */
    public int createOrUpdateLocation(final JSONObject location, final int locationId,
            final String regulation, final String program, final String requirement) {
        
        int lid = -1;
        
        this.getLocationHierarchy().fillHierarchyForMultiLocationKey(location);
        final ParsedRestrictionDef restriction = this.getRestrictionByLocation(location);
        
        lid = this.getMatchedReglocId(restriction, regulation, program, requirement);
        
        // If no match so far, try to find matching location where location is not in regloc
        if (lid == -1) {
            
            lid =
                    ComplianceSqlHelper.getMaxMatchedCompliancelocId(this
                        .getRestrictionSQLByLocation(location));
        }
        
        // If not found a location to share above, create new or update existing
        if (lid <= 0) {
            if (locationId <= 0 || this.getRecCountForLocation(locationId) > 1) {
                // If no shared location found, create and return a new one if creating new record
                // (violation, document, etc.) or if existing location is shared.
                final DataRecord locationRecord = DataRecord.createRecordFromJSON(location);
                // set to new record
                locationRecord.setNew(true);
                // clear original pk
                locationRecord.setValue(Constant.COMPLIANCE_LOCATIONS + Constant.DOT
                        + Constant.LOCATION_ID, null);
                
                final DataRecord savedRecord =
                        this.dsComplianceLocations.saveRecord(locationRecord);
                lid =
                        savedRecord.getInt(Constant.COMPLIANCE_LOCATIONS + Constant.DOT
                                + Constant.LOCATION_ID);
                
            } else {
                // just update the existing CL record.
                final DataRecord locationRecord = DataRecord.createRecordFromJSON(location);
                
                // set to existed record and set its original id
                locationRecord.setNew(false);
                locationRecord.setValue(Constant.COMPLIANCE_LOCATIONS + Constant.DOT
                        + Constant.LOCATION_ID, locationId);
                
                cleanUnExixtedFields(locationRecord);
                // update record and return id
                this.dsComplianceLocations.updateRecord(locationRecord);
                lid = locationId;
            }
        }
        
        return lid;
    }
    
    /**
     * create Compliance Location for regulations or programs or compliance requirement.
     * 
     * @param records List of created regloc records
     * @param record given regulation or program or requirement record
     * @param type one of 'regulation'/'reg_program'/'reg_requirement'
     * @param locations list of values for any type of Country Code, Region Code, State Code, City
     *            Code, County Code, Site Code, Property Code, Building Code, Floor Code, Room Code,
     *            Equipment Code, Equipment Standard, Employee Code.
     * @param locationType table name indicates current location type, one of ctry, regn,
     *            state,city, county, site, pr, bl, fl, rm, eq, eqstd, em.
     * 
     */
    public void createReglocRecordsForLocationList(final List<DataRecord> records,
            final JSONObject record, final String type, final JSONArray locations,
            final String locationType) {
        
        JSONObject location;
        // For location room or floor, take them as building to fill hierarchy location values to
        // original location
        final String convertedLocationType =
                (locationType.endsWith("rm_id") || locationType.endsWith("fl_id")) ? "compliance_locations.bl_id"
                        : locationType;
        // for each location object passed from client
        for (int i = 0; i < locations.length(); i++) {
            
            location = locations.getJSONObject(i);
            
            if (this.locationHierarchy.needFillHierarchy(convertedLocationType)) {
                
                this.locationHierarchy.fillHierarchyForSingleLocationKey(location,
                    convertedLocationType);
                
                this.locationHierarchy.fillGeoRegn(location,
                    location.optString(Constant.COMPLIANCE_LOCATIONS + Constant.DOT + "ctry_id"));
            }
            
            // firstly create a compliance_locations record
            DataRecord locationRecord = this.dsComplianceLocations.createNewRecord();
            
            // Check Duplicate Compliance Locations
            if (!this.findExistedLocations(record, location, type, -1).isEmpty()) {
                continue;
            }
            
            // then fill its value from location object
            String locFieldName;
            final DataRecord loc = DataRecord.createRecordFromJSON(location);
            for (final DataValue value : loc.getFields()) {
                
                locFieldName = value.getName();
                
                locationRecord.setValue(locFieldName, loc.getValue(locFieldName));
                
            }
            
            locationRecord = this.dsComplianceLocations.saveRecord(locationRecord);
            
            // thirdly create regloc record, fill its field value from client and fill PK
            // location_id of just created compliance_locations record.
            final DataRecord reglocRecord = this.dsRegloc.createNewRecord();
            
            setRegLocationFields(reglocRecord, record, type);
            reglocRecord.setValue(
                Constant.REGLOC + Constant.DOT + Constant.LOCATION_ID,
                locationRecord.getInt(Constant.COMPLIANCE_LOCATIONS + Constant.DOT
                        + Constant.LOCATION_ID));
            
            records.add(this.dsRegloc.saveRecord(reglocRecord));
        }
    }
    
    /**
     * If getRecCountForLocation(location_id)==0, then delete compliance_locations.location_id, else
     * don't delete.
     * 
     * @param locationId location id.
     * @param limit count limit used to check if delete given location.
     * 
     */
    public void deleteLocation(final int locationId, final int limit) {
        if (locationId > 0 && this.getRecCountForLocation(locationId) <= limit) {
            
            final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
            restriction.addClause(Constant.COMPLIANCE_LOCATIONS, Constant.LOCATION_ID, locationId,
                Operation.EQUALS);
            
            final DataRecord record =
                    this.dsComplianceLocations.getRecord(" location_id= " + locationId);
            this.dsComplianceLocations.deleteRecord(record);
            
        }
    }
    
    /**
     * For given location id list, delete compliance_locations and regloc records.
     *
     * @param locationIds location id list.
     *
     */
    // Justification: Case #1 : Statement with DELETE ... Exists sub-sql pattern.
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void deleteLocations(final List<Integer> locationIds) {

        final String locationIdStr = "("
                + locationIds.toString().substring(1, locationIds.toString().length() - 1) + ")";

        SqlUtils.executeUpdate(Constant.REGLOC,
            " DELETE FROM regloc WHERE regloc.location_id in " + locationIdStr);

        SqlUtils.executeUpdate(Constant.COMPLIANCE_LOCATIONS,
            " DELETE FROM compliance_locations WHERE compliance_locations.location_id in "
                    + locationIdStr
                    + " and not exists (select 1 from regloc where regloc.location_id=compliance_locations.location_id) "
                    + " and not exists (select 1 from regviolation where regviolation.location_id=compliance_locations.location_id) "
                    + " and not exists (select 1 from activity_log where activity_log.location_id=compliance_locations.location_id) "
                    + " and not exists (select 1 from docs_assigned where docs_assigned.location_id=compliance_locations.location_id) "
                    + " and not exists (select 1 from ls_comm where ls_comm.location_id=compliance_locations.location_id) ");

    }

    /**
     * For given event restriction, delete locations associated to found events.
     * 
     * @param eventRestriction restriction on event.
     * 
     *            Justification: Case #1 : Statement with SELECT ... Exists sub-sql pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void deleteLocationsByEvents(final String eventRestriction) {
        
        final List<DataRecord> locations =
                this.dsComplianceLocations
                    .getRecords(" exists ( select 1 from activity_log where activity_log.location_id=compliance_locations.location_id and "
                            + eventRestriction + ") ");
        
        for (final DataRecord location : locations) {
            
            this.deleteLocation(location.getInt("compliance_locations.location_id"), 1);
        }
    }
    
    /**
     * @return locationHierarchy
     */
    public LocationHierarchy getLocationHierarchy() {
        return this.locationHierarchy;
    }
    
    /**
     * Clean value of un-existed fields from location record.
     * 
     * @param locationRecord location record to clean up un-existed field values
     * 
     */
    private void cleanUnExixtedFields(final DataRecord locationRecord) {
        // clear un-existed fields
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        for (final String fieldName : EventHandlerBase.getAllFieldNames(context,
            Constant.COMPLIANCE_LOCATIONS)) {
            if (!locationRecord.valueExists(Constant.COMPLIANCE_LOCATIONS + Constant.DOT
                    + fieldName)) {
                locationRecord.setValue(Constant.COMPLIANCE_LOCATIONS + Constant.DOT + fieldName,
                    null);
            }
        }
    }
    
    /**
     * @return found existed location id in regloc table.
     * 
     * @param restriction restriction object contains clauses from location field values
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement Compliance Requirement ID
     * 
     */
    private int getMatchedReglocId(final ParsedRestrictionDef restriction, final String regulation,
            final String program, final String requirement) {
        
        int loctionId = -1;
        List<DataRecord> records;
        
        // first try to find matching regloc+location record
        // first for same reg+prog+requirement, if RL is a requirement
        if (StringUtil.notNullOrEmpty(requirement)) {
            
            restriction.addClause(Constant.REGLOC, Constant.REGULATION, regulation,
                Operation.EQUALS);
            restriction.addClause(Constant.REGLOC, Constant.REG_PROGRAM, program, Operation.EQUALS);
            restriction.addClause(Constant.REGLOC, Constant.REG_REQUIREMENT, requirement,
                Operation.EQUALS);
            
            records = this.dsReglocJoinComplianceLocations.getRecords(restriction);
            if (!records.isEmpty()) {
                loctionId =
                        records.get(0)
                            .getInt(Constant.REGLOC + Constant.DOT + Constant.LOCATION_ID);
            }
        }
        
        // try to find matching regloc+location record for same regulation+program,
        // if RL is a program or RL is a requirement but didn't find location above
        if (loctionId == -1 && StringUtil.notNullOrEmpty(program)) {
            
            restriction.addClause(Constant.REGLOC, Constant.REGULATION, regulation,
                Operation.EQUALS);
            restriction.addClause(Constant.REGLOC, Constant.REG_PROGRAM, program, Operation.EQUALS);
            
            records = this.dsReglocJoinComplianceLocations.getRecords(restriction);
            if (!records.isEmpty()) {
                loctionId =
                        records.get(0)
                            .getInt(Constant.REGLOC + Constant.DOT + Constant.LOCATION_ID);
            }
            
        }
        
        // if RL is a regulation, try to find matching regloc+location record for same regulation
        if (StringUtil.isNullOrEmpty(program) && StringUtil.notNullOrEmpty(regulation)) {
            
            restriction.addClause(Constant.REGLOC, Constant.REGULATION, regulation,
                Operation.EQUALS);
            
            records = this.dsReglocJoinComplianceLocations.getRecords(restriction);
            if (!records.isEmpty()) {
                loctionId =
                        records.get(0)
                            .getInt(Constant.REGLOC + Constant.DOT + Constant.LOCATION_ID);
            }
        }
        
        return loctionId;
    }
    
    /**
     * @return number of records referencing to given location_id in regloc, regviolation,
     *         docs_assigned, activity_log, and ls_comm.
     * 
     * @param locationId location id.
     * 
     */
    private int getRecCountForLocation(final int locationId) {
        
        int count = 0;
        for (final String table : this.locationReferenceTables) {
            count +=
                    DataStatistics.getInt(table, Constant.LOCATION_ID, "COUNT", " location_id="
                            + locationId);
        }
        
        return count;
    }
    
    /**
     * @return restriction object based on location field values.
     * 
     * @param location JSONObject a compliance_locations object.
     * 
     */
    private ParsedRestrictionDef getRestrictionByLocation(final JSONObject location) {
        
        final DataRecord locationRecord = DataRecord.createRecordFromJSON(location);
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        for (final String fieldName : locationRecord.getFieldsByName().keySet()) {
            
            if (fieldName.endsWith(Constant.LAT) || fieldName.endsWith(Constant.LON)
                    || fieldName.endsWith(Constant.LOCATION_ID)) {
                continue;
            }
            
            final String value = location.optString(fieldName);
            
            restriction
                .addClause(
                    Constant.COMPLIANCE_LOCATIONS,
                    fieldName.substring(Constant.COMPLIANCE_LOCATIONS.length() + 1),
                    value,
                    StringUtil.isNullOrEmpty(value) || Constant.NULL.equalsIgnoreCase(value) ? Operation.IS_NULL
                            : Operation.EQUALS);
            
        }
        return restriction;
    }
    
    /**
     * @return restriction SQL String based on location field values.
     * 
     * @param location JSONObject a compliance_locations object.
     * 
     */
    private String getRestrictionSQLByLocation(final JSONObject location) {
        
        final DataRecord locationRecord = DataRecord.createRecordFromJSON(location);
        final StringBuilder restriction = new StringBuilder();
        
        restriction.append(" 1=1 ");
        for (final String fieldName : locationRecord.getFieldsByName().keySet()) {
            
            if (fieldName.endsWith("lat") || fieldName.endsWith("lon")
                    || fieldName.endsWith(Constant.LOCATION_ID)) {
                continue;
            }
            
            final String value = location.optString(fieldName);
            
            restriction.append(" AND ");
            restriction.append(fieldName);
            if (StringUtil.isNullOrEmpty(value) || Constant.NULL.equalsIgnoreCase(value)) {
                
                restriction.append(" IS NULL ");
                
            } else {
                
                restriction.append("='");
                restriction.append(value);
                restriction.append("' ");
            }
            
        }
        return restriction.toString();
    }
    
}
