package com.archibus.eventhandler.waste;

/**
 * Constants for Waste Management Activity.
 * 
 * 
 * @author ASC-BJ
 */
public final class WasteConstants {
    
    /**
     * Indicates true .
     * 
     */
    public static final String TRUE = "true";
    
    /**
     * Indicates CHECK_GEN_ID .
     * 
     */
    public static final String CHECK_GEN_ID = "checkGenId";
    
    /**
     * Indicates JSON_EXPRESSION .
     * 
     */
    public static final String JSON_EXPRESSION = "jsonExpression";
    
    /**
     * Indicates false .
     * 
     */
    public static final String FALSE = "false";
    
    /**
     * Indicates field name .
     * 
     */
    public static final String WASTE_OUT_MANIFEST_NUMBER = "waste_out.manifest_number";
    
    /**
     * Indicates String .
     * 
     */
    public static final String AND_GENERATOR_ID_IS_NOT_NULL = "'  and generator_id is not null";
    
    /**
     * Indicates '.docx' .
     * 
     */
    public static final String DOCX_SUFFIX_NAME = ".docx";
    
    /**
     * Indicates table name of 'waste_generators' .
     * 
     */
    public static final String WASTE_GENERATORS = "waste_generators";
    
    /**
     * Indicates field 'waste_generators.generator_id' .
     * 
     */
    public static final String WASTE_GENERATORS_GENERATOR_ID = "waste_generators.generator_id";
    
    /**
     * Indicates field 'waste_profiles.is_hazardous' .
     * 
     */
    public static final String WASTE_PROFILES_IS_HAZARDOUS = "waste_profiles.is_hazardous";
    
    /**
     * Indicates former part of sql equal clause 'waste_id=' .
     * 
     */
    public static final String WASTE_ID_EQUAL = "waste_id=";
    
    /**
     * Indicates field name 'generator_id' .
     * 
     */
    public static final String GENERATOR_ID = "generator_id";
    
    /**
     * Indicates field name 'status' .
     * 
     */
    public static final String STATUS = "status";
    
    /**
     * Indicates field name 'manifest_number' .
     * 
     */
    public static final String MANIFEST_NUMBER = "manifest_number";
    
    /**
     * Indicates field name 'waste_id' .
     * 
     */
    public static final String WASTE_ID = "waste_id";
    
    /**
     * Indicates table name 'waste_out' .
     * 
     */
    public static final String WASTE_OUT = "waste_out";
    
    /**
     * Indicates '.' that seperate the table name and field name.
     * 
     */
    public static final String DOT_SEPERATOR = "\\.";
    
    /**
     * Indicates '.
     * 
     */
    public static final int MAX_STATUS_NUMBER = 100;
    
    /**
     * Indicates '.
     * 
     */
    public static final String STRING_1 = "'";
    
    /**
     * Indicates former part of an SQL equal clause for field 'manifest_number'.
     * 
     */
    public static final String MANIFEST_NUMBER_EQUAL = "manifest_number='";
    
    /**
     * Indicates the field name of 'waste_out.generator_id'.
     * 
     */
    public static final String WASTE_OUT_GENERATOR_ID = "waste_out.generator_id";
    
    /**
     * Indicates SPACE .
     * 
     */
    public static final String SPACE = " ";
    
    /**
     * Indicates field 'waste_profiles.waste_type' .
     * 
     */
    public static final String WASTE_PROFILES_WASTE_TYPE = "waste_profiles.waste_type";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_OUT_DOT_UNITS = "waste_out.units";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_OUT_DOT_DATE_START = "waste_out.date_start";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_OUT_SITE_ID = "waste_out.site_id";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_OUT_DOT_QUANTITY = "waste_out.quantity";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_OUT_DOT_CONTAINER_TYPE = "waste_out.container_type";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_OUT_DOT_CONTAINER_CODE = "waste_out.container_id";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_OUT_DOT_UNITS_TYPE = "waste_out.units_type";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_OUT_DOT_STATUS = "waste_out.status";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String DS_WASTE_OUT = "wasteOutForJavaDs";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String VW_AB_WASTE_TRACK_SHIPMENTS_AXVW = "ab-waste-track-shipments.axvw";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_AREAS_DOT_AREA_TYPE = "waste_areas.area_type";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_BILL_UNIT_DOT_CONVERSION_FACTOR = "bill_unit.conversion_factor";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_BILL_UNIT_DOT_BILL_UNIT_ID = "bill_unit.bill_unit_id";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_DISPOSITIONS_DISPOSITION_TYPE =
            "waste_dispositions.disposition_type";
    
    /**
     * Indicates the table name.
     * 
     */
    public static final String T_WASTE_DISPOSITIONS = "waste_dispositions";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_BILL_UNIT_DOT_BILL_TYPE_ID = "bill_unit.bill_type_id";
    
    /**
     * Indicates the status value.
     * 
     */
    public static final String STATUS_S = "S";
    
    /**
     * Indicates the status value.
     * 
     */
    public static final String STATUS_A = "A";
    
    /**
     * Indicates the status value.
     * 
     */
    public static final String STATUS_D = "D";
    
    /**
     * Indicates the status value.
     * 
     */
    public static final String STATUS_G = "G";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_OUT_DOT_DATE_END = "waste_out.date_end";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_OUT_DOT_WASTE_ID = "waste_out.waste_id";
    
    /**
     * Indicates the date format.
     * 
     */
    public static final String DATE_FORMAT = "yyyy-MM-dd";
    
    /**
     * Indicates the T_WASTE_OUT.
     * 
     */
    public static final String T_BILL_UNIT = "bill_unit";
    
    /**
     * Indicates the bill_unit_id.
     * 
     */
    public static final String F_BILL_UNIT_ID = "bill_unit_id";
    
    /**
     * Indicates the bill_type_id.
     * 
     */
    public static final String F_BILL_TYPE_ID = "bill_type_id";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_CONTAINER_TYPE = "container_type";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_CONTAINER_CODE = "container_id";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_DISPOSITION = "waste_disposition";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_OUT_WASTE_DISPOSITION = "waste_out.waste_disposition";
    
    /**
     * Indicates the field name.
     * 
     */
    public static final String F_WASTE_OUT_WASTE_PROFILE = "waste_out.waste_profile";
    
    /**
     * Necessary constructor of this Utility class.
     * 
     */
    private WasteConstants() {
        
    }
    
}
