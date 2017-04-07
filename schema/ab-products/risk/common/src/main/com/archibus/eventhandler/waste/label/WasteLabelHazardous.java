package com.archibus.eventhandler.waste.label;

import java.util.List;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.waste.WasteUtility;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

/**
 * Waste Management Common Handler.
 * 
 * 
 * @author ASC-BJ
 */
public class WasteLabelHazardous extends WasteLabelImpl {
    
    /**
     * Indicates the index number of 'Name' field in docx fields array.
     * 
     */
    private static final int GENERAROR_NAME_INDEX = 0;
    
    /**
     * Indicates the index number of 'Address' field in docx fields array.
     * 
     */
    private static final int ADDRESS_INDEX = 1;
    
    /**
     * Indicates the index number of 'State' field in docx fields array.
     * 
     */
    private static final int STATE_INDEX = 2;
    
    /**
     * Indicates the index number of 'City' field in docx fields array.
     * 
     */
    private static final int CITY_INDEX = 3;
    
    /**
     * Indicates the index number of 'zip' field in docx fields array.
     * 
     */
    private static final int ZIPCODE_INDEX = 4;
    
    /**
     * Indicates the index number of 'idNo' field in docx fields array.
     * 
     */
    private static final int GENERATOR_ID_INDEX = 5;
    
    /**
     * Indicates the index number of 'wasteNo' field in docx fields array.
     * 
     */
    private static final int WASTE_ID_INDEX = 6;
    
    /**
     * Indicates the index number of 'trackingNo' field in docx fields array.
     * 
     */
    private static final int MANIFESGT_NUMBER_INDEX = 8;
    
    /**
     * Indicates the index number of 'ShipingName' field in docx fields array.
     * 
     */
    private static final int SHIP_NAME_INDEX = 9;
    
    /**
     * Indicates the index number of 'TranspClassification' field in docx fields array.
     * 
     */
    private static final int TRANSP_CLASSFICATION_INDEX = 10;
    
    /**
     * Indicates the index number of 'isSolidOrLiquid' field in docx fields array.
     * 
     */
    private static final int IS_SOLID_OR_LIQUID_INDEX = 11;
    
    /**
     * Indicates the index number of labels start count field in docx fields array.
     * 
     */
    private static final int LABELS_COUNT_START = 12;
    
    /**
     * Indicates the index number of labels end count field in docx fields array.
     * 
     */
    private static final int LABELS_COUNT_END = 25;
    
    /**
     * Indicates the index number of 'startDate' field in docx fields array.
     * 
     */
    private static final int START_DATE_INDEX = 7;
    
    /**
     * Indicates the field name of 'waste_profile_reg_codes'.
     * 
     */
    private static final String WASTE_PROFILE_REG_CODES = "waste_profile_reg_codes";
    
    /**
     * Indicates the field name of 'regulated_code'.
     * 
     */
    private static final String REGULATED_CODE = "regulated_code";
    
    /**
     * Indicates the Space char.
     * 
     */
    private static final String SPACE_SEPERATOR = " ";
    
    /**
     * Indicates the solid text.
     * 
     */
    // @translatable
    private static final String SOLID_TEXT = "HAZARDOUS WASTE, SOLID, N.O.S. and NA3077";
    
    /**
     * Indicates the liquid text.
     * 
     */
    // @translatable
    private static final String LIQUID_TEXT = "HAZARDOUS WASTE, LIQUID, N.O.S.and NA3082";
    
    /**
     * Indicates the field name of 'waste_profile'.
     * 
     */
    private static final String WASTE_PROFILE = "waste_profile";
    
    /**
     * Get fields value from dataRecord and set it to docx fields.
     * 
     * @param wasteId waste out id
     * @param wasteRecord waste out record
     * @param generatorRecord waste generator record
     * 
     */
    public WasteLabelHazardous(final int wasteId, final DataRecord wasteRecord,
            final DataRecord generatorRecord) {
        
        super();
        
        this.wasteId = wasteId;
        this.docxFields =
                new String[] { "Name", "Address", "State", "City", "Zip", "idNo", "wasteNo",
                        "startDate", "trackingNo", "ShipingName", "TranspClassification",
                        "isSolidOrLiquid", "HAZARDOUS_TITLE_1", "HAZARDOUS_TITLE_2",
                        "HAZARDOUS_TITLE_3", "HAZARDOUS_GENERATOR_TITLE",
                        "HAZARDOUS_GENERATOR_NAME", "HAZARDOUS_GENERATOR_ADDRESS",
                        "HAZARDOUS_GENERATOR_CITY", "HAZARDOUS_GENERATOR_STATE",
                        "HAZARDOUS_GENERATOR_ZIP", "HAZARDOUS_EPA_ID_NO", "HAZARDOUS_EPA_WASTE_NO",
                        "HAZARDOUS_START_DATE", "HAZARDOUS_MANIFEST_NO", "HAZARDOUS_CAUTION_TITLE" };
        this.docxFieldValues = new Object[this.docxFields.length];
        this.templateFileName = "HazardousWaste.docx";
        // If generatorRecord is not null
        if (StringUtil.notNullOrEmpty(generatorRecord)) {
            this.docxFieldValues[GENERAROR_NAME_INDEX] =
                    wasteRecord.getString("waste_generators.generator_name");
            this.docxFieldValues[GENERATOR_ID_INDEX] =
                    wasteRecord.getString("waste_generators.generator_id");
            fillAddressContent(this.docxFieldValues, wasteRecord, generatorRecord);
            // If generatorRecord is null
        } else {
            this.docxFieldValues[GENERAROR_NAME_INDEX] = SPACE_SEPERATOR;
            this.docxFieldValues[GENERATOR_ID_INDEX] = SPACE_SEPERATOR;
            this.docxFieldValues[ADDRESS_INDEX] = SPACE_SEPERATOR;
            this.docxFieldValues[ZIPCODE_INDEX] = SPACE_SEPERATOR;
            this.docxFieldValues[STATE_INDEX] = SPACE_SEPERATOR;
            this.docxFieldValues[CITY_INDEX] = SPACE_SEPERATOR;
        }
        
        // For word template "trackingNo"
        this.docxFieldValues[MANIFESGT_NUMBER_INDEX] =
                wasteRecord.getString("waste_out.manifest_number");
        
        this.docxFieldValues[SHIP_NAME_INDEX] =
                wasteRecord.getString("waste_profiles.transp_shipping_name");
        
        this.docxFieldValues[TRANSP_CLASSFICATION_INDEX] =
                wasteRecord.getString("waste_profiles.transp_classification");
        final String areasType = wasteRecord.getString("waste_areas.area_type");
        if ("T".equals(areasType)) {
            // For the accumulation start date ,if it's a Tank Area use Start Date
            this.docxFieldValues[START_DATE_INDEX] =
                    wasteRecord.findField("waste_out.date_start").getLocalizedValue();
            
        } else {
            // For the accumulation start date , end/generation date in other case
            this.docxFieldValues[START_DATE_INDEX] =
                    wasteRecord.findField("waste_out.date_end").getLocalizedValue();
        }
        final String wasteProfile = wasteRecord.getString("waste_profiles.waste_profile");
        // For word template "idNo",get the list of regulated codes assigned to the waste profile
        this.docxFieldValues[WASTE_ID_INDEX] = getProfileRegulatedCodes(wasteProfile);
        
        /*
         * According to US regulations for hazardous waste, the three lines at the bottom would have
         * been printed "HAZARDOUS WASTE, SOLID, N.O.S." and "NA3077" or "HAZARDOUS WASTE, LIQUID,
         * N.O.S." and "NA3082" according to whether the waste is solid or liquid on the lable. For
         * word template 'isSolidOrLiquid' field.
         */
        final String unitsType = wasteRecord.getString("waste_out.units_type");
        // if unitsType equals 'MASS' it means the waste is solid
        if ("MASS".equals(unitsType)) {
            this.docxFieldValues[IS_SOLID_OR_LIQUID_INDEX] = SOLID_TEXT;
        } else if ("VOLUME-LIQUID".equals(unitsType)) {
            // if unitsType equals 'VOLUME-LIQUID' it means the waste is liquid
            this.docxFieldValues[IS_SOLID_OR_LIQUID_INDEX] = LIQUID_TEXT;
        } else {
            // Other scene set it ""
            this.docxFieldValues[IS_SOLID_OR_LIQUID_INDEX] = SPACE_SEPERATOR;
        }
        // Get label message field values from messages table and set to docxFieldValues.
        getAndSetLabelMessage(this.docxFieldValues, this.docxFields);
        
    }
    
    /**
     * Get bl_id or pr_id from waste_generators table .
     * 
     * @param fieldValuesArray field value array
     * @param wasteRecord waste out record
     * @param generatorRecord waste generator record
     * 
     */
    private static void fillAddressContent(final Object[] fieldValuesArray,
            final DataRecord wasteRecord, final DataRecord generatorRecord) {
        final String generatorBlId = wasteRecord.getString("waste_generators.bl_id");
        final String generatorPrId = wasteRecord.getString("waste_generators.pr_id");
        final String siteStateId = generatorRecord.getString("site.state_id");
        final String siteCityId = generatorRecord.getString("site.city_id");
        final String blAddress1 = generatorRecord.getString("bl.address1");
        final String blAddress2 = generatorRecord.getString("bl.address2");
        final String blStateId = generatorRecord.getString("bl.state_id");
        final String blCityId = generatorRecord.getString("bl.city_id");
        final String blZip = generatorRecord.getString("bl.zip");
        
        // if 'waste_generators.bl_id' and 'bl.address1' add 'bl.address1' is not null or empty.
        if (StringUtil.notNullOrEmpty(generatorBlId)
                && (StringUtil.notNullOrEmpty(blAddress1) || StringUtil.notNullOrEmpty(blAddress2))) {
            
            setAddress("bl", fieldValuesArray, generatorRecord);
            
            // if 'waste_generators.pr_id' is not null
        } else if (StringUtil.notNullOrEmpty(generatorPrId)) {
            
            setAddress("property", fieldValuesArray, generatorRecord);
            
        } else if (StringUtil.notNullOrEmpty(generatorBlId)
                && !StringUtil.notNullOrEmpty(generatorPrId)) {
            
            fieldValuesArray[STATE_INDEX] = WasteUtility.replaceNullWithSpace(blStateId);
            fieldValuesArray[CITY_INDEX] = WasteUtility.replaceNullWithSpace(blCityId);
            fieldValuesArray[ZIPCODE_INDEX] = WasteUtility.replaceNullWithSpace(blZip);
            fieldValuesArray[ADDRESS_INDEX] = SPACE_SEPERATOR;
            
        } else if (!StringUtil.notNullOrEmpty(generatorBlId)
                && !StringUtil.notNullOrEmpty(generatorPrId)) {
            fieldValuesArray[ADDRESS_INDEX] = SPACE_SEPERATOR;
            fieldValuesArray[ZIPCODE_INDEX] = SPACE_SEPERATOR;
            // If there's no building and property associated to the generator,
            // then only city and state will be filled from the assigned generator site.
            fieldValuesArray[STATE_INDEX] = WasteUtility.replaceNullWithSpace(siteStateId);
            fieldValuesArray[CITY_INDEX] = WasteUtility.replaceNullWithSpace(siteCityId);
            
        }
        
    }
    
    /**
     * Set address,state_id,city_id,zip to docx field value.
     * 
     * @param tableName table hold fields of address information
     * @param fieldValuesArray values array for docx fields
     * @param generatorRecord waste generator record
     * 
     */
    private static void setAddress(final String tableName, final Object[] fieldValuesArray,
            final DataRecord generatorRecord) {
        
        final String stateId = generatorRecord.getString(tableName + ".state_id");
        final String cityId = generatorRecord.getString(tableName + ".city_id");
        final String zip = generatorRecord.getString(tableName + ".zip");
        final String address1 = generatorRecord.getString(tableName + ".address1");
        final String address2 = generatorRecord.getString(tableName + ".address2");
        
        final String realAddress1 = WasteUtility.replaceNullWithSpace(address1);
        final String realAddress2 = WasteUtility.replaceNullWithSpace(address2);
        
        fieldValuesArray[ADDRESS_INDEX] = realAddress1 + SPACE_SEPERATOR + realAddress2;
        fieldValuesArray[STATE_INDEX] = WasteUtility.replaceNullWithSpace(stateId);
        fieldValuesArray[CITY_INDEX] = WasteUtility.replaceNullWithSpace(cityId);
        fieldValuesArray[ZIPCODE_INDEX] = WasteUtility.replaceNullWithSpace(zip);
    }
    
    /**
     * Get label message field values from 'messages' table and set to docxFieldValues.
     * 
     * @param fieldValuesArray values for docx template field
     * @param docxFields docx template field
     */
    private static void getAndSetLabelMessage(final Object[] fieldValuesArray,
            final String[] docxFields) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        for (int i = LABELS_COUNT_START; i <= LABELS_COUNT_END; i++) {
            final String labelSText =
                    localizeMessage(context, "AbRiskWasteMgmt", "GENERATESELECTEDLABELS_WFR",
                        docxFields[i], null);
            fieldValuesArray[i] = labelSText;
        }
        
    }
    
    /**
     * Set docx Waste NO value ,that is the list of regulated codes assigned to the waste profile.
     * 
     * @param wasteProfile field value to waste_profile_reg_codes table
     * @return regulatedCode
     */
    private String getProfileRegulatedCodes(final String wasteProfile) {
        final DataSource profileRegulatedCodesDS =
                DataSourceFactory.createDataSourceForFields(WASTE_PROFILE_REG_CODES, new String[] {
                        WASTE_PROFILE, REGULATED_CODE });
        
        profileRegulatedCodesDS.addRestriction(Restrictions.eq(WASTE_PROFILE_REG_CODES,
            WASTE_PROFILE, wasteProfile));
        final List<DataRecord> profileRegulatedCodesRecords =
                profileRegulatedCodesDS.getAllRecords();
        
        String regulatedCode = "";
        if (!profileRegulatedCodesRecords.isEmpty()) {
            for (final DataRecord profileRegulatedCodesRecord : profileRegulatedCodesRecords) {
                regulatedCode =
                        regulatedCode
                                + SPACE_SEPERATOR
                                + profileRegulatedCodesRecord
                                    .getString("waste_profile_reg_codes.regulated_code");
            }
        }
        return regulatedCode;
    }
}
