package com.archibus.eventhandler.waste.label;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.waste.WasteUtility;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

/**
 * Waste Management Common Handler.
 * 
 * 
 * @author ASC-BJ
 */
public class WasteLabelNonHazardous extends WasteLabelImpl {
    
    /**
     * Indicates the Space char.
     */
    private static final String SPACE_SEPERATOR = " ";
    
    /**
     * Indicates the index number of 'Name' field in docx fields array.
     */
    private static final int GENERAROR_NAME_INDEX = 0;
    
    /**
     * Indicates the index number of 'Address' field in docx fields array.
     */
    private static final int ADDRESS_INDEX = 1;
    
    /**
     * Indicates the index number of 'State' field in docx fields array.
     */
    private static final int ZIPCODE_INDEX = 2;
    
    /**
     * Indicates the index number of 'TranspClassification' field in docx fields array.
     */
    private static final int TRANS_SHIPP_NAME = 3;
    
    /**
     * Indicates the index number of 'WasteName' field in docx fields array.
     */
    private static final int TRANS_CLASFITION = 4;
    
    /**
     * Indicates the index number of 'WasteContent' field in docx fields array.
     */
    private static final int WASTE_CONTENT_INDEX = 5;
    
    /**
     * Indicates the index number of labels start count field in docx fields array.
     */
    private static final int LABELS_COUNT_START = 6;
    
    /**
     * Indicates the index number of labels end count field in docx fields array.
     */
    private static final int LABELS_COUNT_END = 15;
    
    /**
     * Get fields value from dataRecord and set it to docx fields.
     * 
     * @param wasteId waste id
     * @param wasteRecord waste out record
     * @param generatorRecord waste generator record
     * 
     */
    public WasteLabelNonHazardous(final int wasteId, final DataRecord wasteRecord,
            final DataRecord generatorRecord) {
        
        super();
        
        this.wasteId = wasteId;
        this.docxFields =
                new String[] { "Name", "Address", "Zip", "TranspClassification", "WasteName",
                        "Contents", "NON_HAZARDOUS_TITLE_1", "NON_HAZARDOUS_TITLE_2",
                        "NON_HAZARDOUS_SHIPPER", "NON_HAZARDOUS_ADDRESS", "NON_HAZARDOUS_LOCATION",
                        "NON_HAZARDOUS_SHIPPING_NAME", "NON_HAZARDOUS_SHIPPING_NO",
                        "NON_HAZARDOUS_CONTENTS", "NON_HAZARDOUS_TITLE_WASTE", "MUNICIPAL_TITLE_1" };
        this.docxFieldValues = new Object[this.docxFields.length];
        // Set word template field's string to father class
        this.templateFileName = "Non-HazardousWaste.docx";
        final String wasteName = wasteRecord.getString("waste_profiles.waste_name");
        final String realWasteName = wasteName == null ? SPACE_SEPERATOR : wasteName;
        
        // If generatorRecord is not null
        if (StringUtil.notNullOrEmpty(generatorRecord)) {
            final String wasteGengratorName =
                    wasteRecord.getString("waste_generators.generator_name");
            final String realWasteGengratorName =
                    wasteGengratorName == null ? SPACE_SEPERATOR : wasteGengratorName;
            this.docxFieldValues[GENERAROR_NAME_INDEX] = realWasteGengratorName;
            fillAddressContent(this.docxFieldValues, wasteRecord, generatorRecord);
            // If generatorRecord is null
        } else {
            this.docxFieldValues[ADDRESS_INDEX] = SPACE_SEPERATOR;
            this.docxFieldValues[ZIPCODE_INDEX] = SPACE_SEPERATOR;
        }
        
        final String containerId = wasteRecord.getString("waste_out.container_id");
        final String transpShippingName =
                wasteRecord.getString("waste_profiles.transp_shipping_name");
        final String transClassification =
                wasteRecord.getString("waste_profiles.transp_classification");
        final String realOutContainerId = containerId == null ? SPACE_SEPERATOR : containerId;
        final String wasteType = wasteRecord.getString("waste_profiles.waste_type");
        this.docxFieldValues[WASTE_CONTENT_INDEX] =
                wasteRecord.findField("waste_out.quantity").getLocalizedValue() + SPACE_SEPERATOR
                        + wasteRecord.getString("waste_out.units") + SPACE_SEPERATOR
                        + realWasteName + SPACE_SEPERATOR + realOutContainerId;
        
        this.docxFieldValues[TRANS_SHIPP_NAME] =
                transpShippingName == null ? SPACE_SEPERATOR : transpShippingName;
        this.docxFieldValues[TRANS_CLASFITION] =
                transClassification == null ? SPACE_SEPERATOR : transClassification;
        // Get label message field values from messages table and set to docxFieldValues.
        getAndSetLabelMessage(this.docxFieldValues, this.docxFields, wasteType);
        
    }
    
    /**
     * Set bl or property address values to word template.
     * 
     * @param fieldValuesArray field value array
     * @param wasteRecord waste out record
     * @param generatorRecord waste generator record
     * 
     */
    private static void fillAddressContent(final Object[] fieldValuesArray,
            final DataRecord wasteRecord, final DataRecord generatorRecord) {
        final String bl1 = generatorRecord.getString("bl.address1");
        final String bl2 = generatorRecord.getString("bl.address2");
        final String blStateId = generatorRecord.getString("bl.state_id");
        final String blCityId = generatorRecord.getString("bl.city_id");
        final String blZip = generatorRecord.getString("bl.zip");
        final String generatorBlId = wasteRecord.getString("waste_generators.bl_id");
        final String generatorPrId = wasteRecord.getString("waste_generators.pr_id");
        final String siteStateId = generatorRecord.getString("site.state_id");
        final String siteCityId = generatorRecord.getString("site.city_id");
        
        // if 'waste_generators.bl_id' and 'bl.address1' add 'bl.address1' is not null or empty.
        if (StringUtil.notNullOrEmpty(generatorBlId)
                && (StringUtil.notNullOrEmpty(bl1) || StringUtil.notNullOrEmpty(bl2))) {
            setAddress("bl", fieldValuesArray, generatorRecord);
            
            // if PR_ID is not null
        } else if (StringUtil.notNullOrEmpty(generatorPrId)) {
            
            setAddress("property", fieldValuesArray, generatorRecord);
        } else if (StringUtil.notNullOrEmpty(generatorBlId)
                && !StringUtil.notNullOrEmpty(generatorPrId)) {
            
            fieldValuesArray[ZIPCODE_INDEX] =
                    WasteUtility.replaceNullWithSpace(blCityId) + SPACE_SEPERATOR
                            + WasteUtility.replaceNullWithSpace(blStateId) + SPACE_SEPERATOR
                            + WasteUtility.replaceNullWithSpace(blZip);
            fieldValuesArray[ADDRESS_INDEX] = SPACE_SEPERATOR;
            
        } else if (!StringUtil.notNullOrEmpty(generatorBlId)
                && !StringUtil.notNullOrEmpty(generatorPrId)) {
            
            // If there's no building and property associated to the generator,
            // then only city and state will be filled from the assigned generator site.
            fieldValuesArray[ZIPCODE_INDEX] =
                    WasteUtility.replaceNullWithSpace(siteCityId) + SPACE_SEPERATOR
                            + WasteUtility.replaceNullWithSpace(siteStateId);
            fieldValuesArray[ADDRESS_INDEX] = SPACE_SEPERATOR;
            
        }
        
    }
    
    /**
     * Set address values to fieldValuesArray.
     * 
     * @param tableName table hold fields of address information
     * @param fieldValuesArray values array for docx fields
     * @param generatorRecord waste generator record
     * 
     */
    private static void setAddress(final String tableName, final Object[] fieldValuesArray,
            final DataRecord generatorRecord) {
        
        final String address1 = generatorRecord.getString(tableName + ".address1");
        final String address2 = generatorRecord.getString(tableName + ".address2");
        final String stateId = generatorRecord.getString(tableName + ".state_id");
        final String cityId = generatorRecord.getString(tableName + ".city_id");
        final String zip = generatorRecord.getString(tableName + ".zip");
        
        final String realAddress1 = WasteUtility.replaceNullWithSpace(address1);
        final String realAddress2 = WasteUtility.replaceNullWithSpace(address2);
        
        fieldValuesArray[ADDRESS_INDEX] = realAddress1 + SPACE_SEPERATOR + realAddress2;
        fieldValuesArray[ZIPCODE_INDEX] =
                WasteUtility.replaceNullWithSpace(cityId) + SPACE_SEPERATOR
                        + WasteUtility.replaceNullWithSpace(stateId) + SPACE_SEPERATOR
                        + WasteUtility.replaceNullWithSpace(zip);
    }
    
    /**
     * Get label message field values from 'messages' table and set to docxFieldValues.
     * 
     * @param fieldValuesArray values for docx template field
     * @param docxFields docx template field
     * @param wasteType waste_type field
     */
    private static void getAndSetLabelMessage(final Object[] fieldValuesArray,
            final String[] docxFields, final String wasteType) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        for (int i = LABELS_COUNT_START; i <= LABELS_COUNT_END; i++) {
            final String labelSText =
                    localizeMessage(context, "AbRiskWasteMgmt", "GENERATESELECTEDLABELS_WFR",
                        docxFields[i], null);
            fieldValuesArray[i] = labelSText;
            if (i == LABELS_COUNT_END) {
                fieldValuesArray[i - 1] = fieldValuesArray[LABELS_COUNT_START];
                // if waste_type is 'M' them will use 'MUNICIPAL_TITLE_1' as title.
                if ("M".equals(wasteType)) {
                    fieldValuesArray[LABELS_COUNT_START] = fieldValuesArray[LABELS_COUNT_END];
                }
            }
        }
    }
}
