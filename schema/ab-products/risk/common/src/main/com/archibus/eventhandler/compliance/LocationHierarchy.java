package com.archibus.eventhandler.compliance;

import java.util.*;

import org.json.JSONObject;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.utility.StringUtil;

/**
 * Compliance Location Hierarchy Processor class.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 */
public class LocationHierarchy {
    
    /**
     * Constant: location field name.
     */
    public static final String LAT = "lat";
    
    /**
     * Constant: location field name.
     */
    public static final String LON = "lon";
    
    /**
     * Constant: location field name.
     */
    public static final String GEO_REGION_ID = "geo_region_id";
    
    /**
     * Constant: location field name.
     */
    public static final String CTRY_ID = "ctry_id";
    
    /**
     * Constant: location field name.
     */
    public static final String REGN_ID = "regn_id";
    
    /**
     * Constant: location field name.
     */
    
    public static final String STATE_ID = "state_id";
    
    /**
     * Constant: location field name.
     */
    
    public static final String CITY_ID = "city_id";
    
    /**
     * Constant: location field name.
     */
    public static final String COUNTY_ID = "county_id";
    
    /**
     * Constant: location field name.
     */
    public static final String SITE_ID = "site_id";
    
    /**
     * Constant: location field name.
     */
    public static final String PR_ID = "pr_id";
    
    /**
     * Constant: location field name.
     */
    public static final String BL_ID = "bl_id";
    
    /**
     * Constant: location fields of table bl.
     */
    public static final String[] BL_HIERARCHY = new String[] { PR_ID, SITE_ID, CITY_ID, STATE_ID,
            REGN_ID, CTRY_ID, LON, LAT };
    
    /**
     * Constant: location fields of table property.
     */
    public static final String[] PR_HIERARCHY = new String[] { SITE_ID, STATE_ID, REGN_ID, CTRY_ID,
            CITY_ID, COUNTY_ID };
    
    /**
     * Constant: location fields of table site.
     */
    public static final String[] SITE_HIERARCHY = new String[] { CTRY_ID, CITY_ID, STATE_ID,
            REGN_ID };
    
    /**
     * Constant: location fields of table county.
     */
    public static final String[] COUNTY_HIERARCHY = new String[] { STATE_ID, REGN_ID, CTRY_ID };
    
    /**
     * Constant: location fields of table city.
     */
    public static final String[] CITY_HIERARCHY = new String[] { STATE_ID, REGN_ID, CTRY_ID };
    
    /**
     * Constant: location fields of table state.
     */
    public static final String[] STATE_HIERARCHY = new String[] { REGN_ID, CTRY_ID };
    
    /**
     * Constant: location fields of table regn.
     */
    public static final String[] REGN_HIERARCHY = new String[] { CTRY_ID };
    
    /**
     * Constant: location fields of table ctry.
     */
    public static final String[] CTRY_HIERARCHY = new String[] { GEO_REGION_ID };
    
    /**
     * Constant: location fields name array.
     */
    public static final String[] LOC_FIELDS = new String[] { BL_ID, PR_ID, SITE_ID, CITY_ID,
            COUNTY_ID, STATE_ID, REGN_ID, CTRY_ID };
    
    /**
     * Constant: location fields name array.
     */
    public static final String[][] HIERARCHY_FIELDS = new String[][] { BL_HIERARCHY, PR_HIERARCHY,
            SITE_HIERARCHY, COUNTY_HIERARCHY, CITY_HIERARCHY, STATE_HIERARCHY, REGN_HIERARCHY,
            CTRY_HIERARCHY };
    
    /**
     * Constant: location field name.
     */
    private static final String COMPLIANCE_LOCATIONS_LAT = "compliance_locations.lat";
    
    /**
     * Constant: location field name.
     */
    private static final String COMPLIANCE_LOCATIONS_LON = "compliance_locations.lon";
    
    /**
     * Constant: HashMap contains cached DataRecord for location field key composed of key id and
     * key value.
     */
    private final Map<String, DataRecord> records = new HashMap<String, DataRecord>();
    
    /**
     * Constant: HashMap contains cached DataRecord for location field key composed of key id and
     * key value.
     */
    private final Map<String, DataSource> sources = new HashMap<String, DataSource>();
    
    /**
     * Constant: HashMap contians pks of multiple-pk location fields.
     */
    private final Map<String, String[]> pksMap = new HashMap<String, String[]>();
    
    /**
     * Constructor.
     * 
     */
    public LocationHierarchy() {
        
        this.initialDataSource();
        
    }
    
    /**
     * create Compliance Location for regulations or programs or compliance requirement.
     * 
     */
    private void initialDataSource() {
        
        for (int i = 0; i < LOC_FIELDS.length; i++) {
            if (PR_ID.equalsIgnoreCase(LOC_FIELDS[i])) {
                this.sources.put(PR_ID,
                    DataSourceFactory.createDataSourceForFields("property", PR_HIERARCHY));
                
            } else {
                this.sources.put(LOC_FIELDS[i], DataSourceFactory.createDataSourceForFields(
                    LOC_FIELDS[i].split("_")[0], HIERARCHY_FIELDS[i]));
                
            }
        }
        
        this.pksMap.put(CITY_ID, new String[] { CITY_ID, STATE_ID });
        this.pksMap.put(COUNTY_ID, new String[] { COUNTY_ID, STATE_ID });
        this.pksMap.put(REGN_ID, new String[] { REGN_ID, CTRY_ID });
        
    }
    
    /**
     * @return proper location hierarchy record by given field name and value.
     * 
     * @param fieldName location field name
     * @param value location field value
     * @param location JSON Object format of a compliance_locations record
     */
    public DataRecord getHierarchyRecord(final String fieldName, final String value,
            final JSONObject location) {
        
        DataRecord record = null;
        final String keyRestriction = this.getPkRestriction(fieldName, value, location);
        if (this.records.containsKey(keyRestriction)) {
            record = this.records.get(keyRestriction);
        } else {
            record = this.sources.get(fieldName).getRecord(keyRestriction);
            if (record != null) {
                this.records.put(keyRestriction, record);
            }
        }
        return record;
        
    }
    
    /**
     * @return proper location hierarchy record by given field name and value.
     * 
     * @param fieldName location field name
     * @param value location field value
     * @param location JSON Object format of a compliance_locations record
     */
    public String getPkRestriction(final String fieldName, final String value,
            final JSONObject location) {
        
        final StringBuilder res = new StringBuilder();
        
        if (this.pksMap.containsKey(fieldName)) {
            res.append(" 1=1 ");
            for (final String pk : this.pksMap.get(fieldName)) {
                res.append(" and ").append(pk).append("=  '")
                    .append(location.getString(Constant.COMPLIANCE_LOCATIONS + Constant.DOT + pk))
                    .append("'       ");
            }
        } else {
            res.append(fieldName).append("= '").append(value).append("' ");
        }
        return res.toString();
        
    }
    
    /**
     * fill in parent geographic hierarchy fields for given single location field key.
     * 
     * @param location JSON Object format of a compliance_locations record
     * @param locationType location field name
     * 
     * @return a sign indicate if fill the hierarchy information successfully
     */
    public boolean fillHierarchyForSingleLocationKey(final JSONObject location,
            final String locationType) {
        boolean filled = false;
        if (location != null && StringUtil.notNullOrEmpty(location.optString(locationType))
                && !Constant.NULL.equalsIgnoreCase(locationType)) {
            
            // initial get field id and its value
            final String value = location.optString(locationType);
            final String fieldName = locationType.substring(21);
            
            // retrieve hierarchy record such as bl, site, etc
            final DataRecord record = this.getHierarchyRecord(fieldName, value, location);
            if (record != null) {
                setLocationValuesFromHierarchyRecord(location, value, fieldName, record);
                filled = true;
            }
        }
        
        return filled;
        
    }
    
    /**
     * set values of location fields by hierarchy record.
     * 
     * @param location JSON Object format of a compliance_locations record
     * @param value location value
     * @param fieldName location field name
     * @param record location hierarchy record
     * 
     */
    private void setLocationValuesFromHierarchyRecord(final JSONObject location,
            final String value, final String fieldName, final DataRecord record) {
        // loop through compliance_locations fields to set proper values from hierarchy record
        String hiefieldName = "";
        String locationFieldName;
        for (final DataValue dValue : record.getFields()) {
            
            hiefieldName = dValue.getName();
            locationFieldName = "compliance_locations." + hiefieldName.split("\\.")[1];
            
            // Overwrite the values input by user,so that if user has made a mistake, it is
            // fixed. If any value is null in the table you are getting values from, but
            // the user has provided a value, then leave the user’s value.
            if (record.getValue(hiefieldName) != null
                    && StringUtil.notNullOrEmpty(String.valueOf(record.getValue(hiefieldName)))) {
                location.put(locationFieldName, record.getValue(hiefieldName));
                
            }
            
        }
        
        if (BL_ID.equalsIgnoreCase(fieldName)) {
            // For bl_id, also fill county_id from its associated pr_id
            this.fillCounty(location,
                location.optString(Constant.COMPLIANCE_LOCATIONS + Constant.DOT + PR_ID));
        } else {
            // calculate and fill latitude and longitude
            this.calculateLatLon(location, fieldName, value);
            
        }
    }
    
    /**
     * Automatically fill in correct values for all parent geographic hierarchy fields. For example:
     * If bl_id is filled in, get property, site, county, city, state, region, country, geo-region
     * from bl_id record and copy to compliance_locations record. Else If property_id is filled in,
     * get site, county, city, state, region, country, geo-region from property_id record and copy
     * to compliance_locations record. Else If site_id is filled in, get city, state, region,
     * country, geo-region from site_id record and copy to compliance_locations record..
     * 
     * @param location JSON Object format of a compliance_locations record passed from client
     * 
     */
    public void fillHierarchyForMultiLocationKey(final JSONObject location) {
        
        for (final String element : LOC_FIELDS) {
            if (this.fillHierarchyForSingleLocationKey(location, Constant.COMPLIANCE_LOCATIONS
                    + Constant.DOT + element)) {
                break;
            }
        }
        
        this.fillGeoRegn(location,
            location.optString(Constant.COMPLIANCE_LOCATIONS + Constant.DOT + CTRY_ID));
    }
    
    /**
     * @return boolean indicates if given location field is need to fill parent hierarchy
     *         informaiton.
     * 
     * @param fieldId String location field id
     * 
     */
    public boolean needFillHierarchy(final String fieldId) {
        boolean need = false;
        for (final String element : LOC_FIELDS) {
            if (element.equalsIgnoreCase(fieldId) || fieldId.endsWith(element)) {
                need = true;
                break;
            }
        }
        return need;
    }
    
    /**
     * Fill in county_id value to location object by retrieve county_id from property record of
     * given pr_id.
     * 
     * @param location JSON Object format of a compliance_locations record passed from client
     * @param prId pr_id value
     * 
     * @return existed location JSONObject
     */
    public JSONObject fillCounty(final JSONObject location, final String prId) {
        
        if (StringUtil.notNullOrEmpty(String.valueOf(prId))) {
          final DataRecord prRecord = this.sources.get(PR_ID).getRecord(" pr_id='" + prId + "'    ");
        
          if (prRecord.getValue(Constant.PROPERTY_COUNTY_ID) != null
                && StringUtil.notNullOrEmpty(prRecord.getString(Constant.PROPERTY_COUNTY_ID))) {
            
            location.put("compliance_locations.county_id",
                prRecord.getValue(Constant.PROPERTY_COUNTY_ID));
            
          }
        }
        
        return location;
    }
    
    /**
     * Fill in geo region id value to location object by retrieve geO_regn_id from country record of
     * given ctry_id.
     * 
     * @param location JSON Object format of a compliance_locations record passed from client
     * @param ctryId country_id value
     * 
     * @return existed location JSONObject
     */
    public JSONObject fillGeoRegn(final JSONObject location, final String ctryId) {
        
        final DataRecord country =
                this.sources.get(CTRY_ID).getRecord(" ctry_id='" + ctryId + "'     ");
        
        if (country != null && country.getValue(Constant.CTRY_GEO_REGION_ID) != null
                && StringUtil.notNullOrEmpty(country.getString(Constant.CTRY_GEO_REGION_ID))) {
            
            location.put("compliance_locations.geo_region_id",
                country.getValue(Constant.CTRY_GEO_REGION_ID));
            
        }
        
        return location;
    }
    
    /**
     * Calculate and fill latitude and lontitude values for given location id.
     * 
     * @param location JSONObject location object
     * @param locationKey String location field id
     * @param locationValue String location field value
     * 
     * 
     *            Justification: Case#1 : Statement with subquery EXISTS... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void calculateLatLon(final JSONObject location, final String locationKey,
            final String locationValue) {
        
        double lat;
        double lon;
        
        final StringBuilder sqlBuilder = new StringBuilder();
        if (COUNTY_ID.equalsIgnoreCase(locationKey)) {
            
            // sqlBuilder.append("SELECT AVG(bl.lon) ${sql.as} lon, AVG(bl.lat) ${sql.as} lat ");
            sqlBuilder
                .append(" exists ( select 1 from property where bl.pr_id=property.pr_id and property.COUNTY_ID");
            sqlBuilder.append("  ='");
            sqlBuilder.append(locationValue);
            sqlBuilder.append("') ");
            
        } else {
            final String keyRestriction =
                    this.getPkRestriction(locationKey, locationValue, location);
            sqlBuilder.append(keyRestriction);
        }
        
        lat =
                DataStatistics.getDouble(Constant.BL, Constant.LAT, Constant.AVG,
                    sqlBuilder.toString());
        lon =
                DataStatistics.getDouble(Constant.BL, Constant.LON, Constant.AVG,
                    sqlBuilder.toString());
        
        location.put(COMPLIANCE_LOCATIONS_LAT, lat);
        location.put(COMPLIANCE_LOCATIONS_LON, lon);
    }
}
