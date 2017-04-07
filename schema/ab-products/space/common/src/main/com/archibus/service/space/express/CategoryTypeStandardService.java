package com.archibus.service.space.express;

import java.util.List;

import com.archibus.datasource.data.DataRecord;

/**
 * Space Express - Service class for Importing Standard Room Categories and Types.
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Space Express.
 * 
 * @author Zhang Yi
 * 
 * 
 */
public final class CategoryTypeStandardService {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    
    private CategoryTypeStandardService() {
    }
    
    /**
     * 
     * Import Room's categories and types from standard xls file.
     * 
     * @param std standard of Room Categories and Types
     * 
     * @return true if both of tables rmcat and rmtype are empty.
     * 
     */
    public static Boolean importRoomCategoriesAndTypesFromXLS(final String std) {
        
        final CategoryTypeStandardProcessor categoryTypeStandardProcessor =
                new CategoryTypeStandardProcessor(std);
        
        // detect if there are existed room categories or types if yes then return client an error
        // sign, else continue the importing process.
        boolean isEmpty = true;
        if (categoryTypeStandardProcessor.isRmcatAndRmtypeEmpty()) {
            
            categoryTypeStandardProcessor.prepareRecords();
            
            // kb#3040010: don't delete the old data anymore, since the importing process only
            // happens when the rmcat and rmtype is empty.
            // categoryTypeStandardProcessor.clearOldData();
            
            categoryTypeStandardProcessor.importRecords();
            
        } else {
            isEmpty = false;
        }
        return isEmpty;
    }
    
    /**
     * 
     * @return List contains Room Category records and Room Type records from given standard data
     *         file.
     * 
     * @param std standard of Room Categories and Types
     */
    public static List<DataRecord> loadRoomCategoriesAndTypes(final String std) {
        
        final CategoryTypeStandardProcessor categoryTypeStandardProcessor =
                new CategoryTypeStandardProcessor(std);
        
        categoryTypeStandardProcessor.prepareRecords();
        
        final List<DataRecord> results = categoryTypeStandardProcessor.getCaterogies();
        results.addAll(categoryTypeStandardProcessor.getTypes());
        
        return results;
        
    }
}