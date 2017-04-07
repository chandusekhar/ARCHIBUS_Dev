package com.archibus.eventhandler.compliance;

import junit.framework.Assert;

import org.json.JSONObject;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.StringUtil;

/**
 * Test class ComplianceEventHelper. file.
 * 
 * @since 20.1
 * 
 */
public class LocationHierarchyTest extends DataSourceTestBase {
    
    /**
     * Define String message1.
     */
    // @translatable
    private static String message1 = "Success";
    
    /**
     * Define String message2.
     */
    // @translatable
    private static String message2 = "Fail";
    
    /**
     * Constant: location field name.
     */
    private static final String LAB1 = "LAB1";
    
    /**
     * Constant: location field name.
     */
    private static final String ALBANY_N = "ALBANY-N";
    
    /**
     * Constant: location field name.
     */
    private static final String ALBANY = "ALBANY";
    
    /**
     * Constant: location field name.
     */
    private static final String COMPLIANCE_LOCATIONS_SITE_ID = "compliance_locations.site_id";
    
    /**
     * Constant: location field name.
     */
    private static final String COMPLIANCE_LOCATIONS_CITY_ID = "compliance_locations.city_id";
    
    /**
     * Test getHierarchyRecord method of class LocationHierarchy.
     */
    public void testGetHierarchyRecord() {
        final LocationHierarchy lh = new LocationHierarchy();
        final JSONObject locations = getlocationsObj();
        final DataRecord dataRecord =
                lh.getHierarchyRecord(LocationHierarchy.SITE_ID, ALBANY_N, locations);
        Assert.assertNotNull(dataRecord);
    }
    
    /**
     * Test getPkRestriction method of class LocationHierarchy.
     */
    public void testGetPkRestriction() {
        final LocationHierarchy lh = new LocationHierarchy();
        final JSONObject locations = getlocationsObj();
        lh.getPkRestriction(LocationHierarchy.SITE_ID, ALBANY_N, locations);
    }
    
    /**
     * Test fillHierarchyForSingleLocationKey method of class LocationHierarchy.
     */
    public void testFillHierarchyForSingleLocationKey() {
        final LocationHierarchy lh = new LocationHierarchy();
        final JSONObject locations = getlocationsObj();
        lh.fillHierarchyForSingleLocationKey(locations, COMPLIANCE_LOCATIONS_SITE_ID);
        
    }
    
    /**
     * Test needFillHierarchy method of class LocationHierarchy.
     */
    public void testNeedFillHierarchy() {
        final LocationHierarchy lh = new LocationHierarchy();
        final boolean b = lh.needFillHierarchy(LocationHierarchy.SITE_ID);
        if (b) {
            System.out.println(message1);
        } else {
            System.out.println(message2);
        }
        
    }
    
    /**
     * Test fillCounty method of class LocationHierarchy.
     */
    public void testFillCounty() {
        final LocationHierarchy lh = new LocationHierarchy();
        final JSONObject location = getlocationsObj();
        final JSONObject obj =
                lh.fillCounty(
                    location,
                    location.optString(Constant.COMPLIANCE_LOCATIONS + Constant.DOT
                            + LocationHierarchy.PR_ID));
        if (obj.has(Constant.COMPLIANCE_LOCATIONS + Constant.DOT + LocationHierarchy.COUNTY_ID)) {
            
            final String countyId =
                    obj.getString(Constant.COMPLIANCE_LOCATIONS + Constant.DOT
                            + LocationHierarchy.COUNTY_ID);
            
            if (StringUtil.notNullOrEmpty(countyId)) {
                System.out.println(message1);
            } else {
                System.out.println(message2);
            }
        }
        
    }
    
    /**
     * Test fillGeoRegn method of class LocationHierarchy.
     */
    public void testFillGeoRegn() {
        final LocationHierarchy lh = new LocationHierarchy();
        final JSONObject location = getlocationsObj();
        
        final JSONObject obj =
                lh.fillGeoRegn(
                    location,
                    location.optString(Constant.COMPLIANCE_LOCATIONS + Constant.DOT
                            + LocationHierarchy.CTRY_ID));
        
        if (obj.has(Constant.COMPLIANCE_LOCATIONS + Constant.DOT + LocationHierarchy.CTRY_ID)) {
            final String regionId =
                    obj.getString(Constant.COMPLIANCE_LOCATIONS + Constant.DOT
                            + LocationHierarchy.GEO_REGION_ID);
            
            if (StringUtil.notNullOrEmpty(regionId)) {
                System.out.println(message1);
            } else {
                System.out.println(message2);
            }
        }
        
    }
    
    /**
     * Test calculateLatLon method of class LocationHierarchy.
     */
    public void testCalculateLatLon() {
        final JSONObject location = getlocationsObj();
        final LocationHierarchy lh = new LocationHierarchy();
        lh.calculateLatLon(location, LocationHierarchy.SITE_ID, ALBANY_N);
    }
    
    /**
     * Get locations Obj.
     * 
     * @return JSONObject.
     */
    private JSONObject getlocationsObj() {
        final JSONObject locations = new JSONObject();
        locations.put(COMPLIANCE_LOCATIONS_SITE_ID, ALBANY_N);
        locations.put(Constant.COMPLIANCE_LOCATIONS_PR_ID, LAB1);
        locations.put(COMPLIANCE_LOCATIONS_CITY_ID, ALBANY);
        
        return locations;
    }
    
}
