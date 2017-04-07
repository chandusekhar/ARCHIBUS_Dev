package com.archibus.app.sysadmin.updatewizard.project.util;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.utility.*;

/**
 * 
 * Utility class.
 * 
 * @author Catalin Purice
 * @since 20.1
 * 
 */
public final class LangUtilities {
    
    /**
     * Translatable Data Dictionary fields.
     */
    private static Set<String> translatableFields =
            Collections.unmodifiableSet(new HashSet<String>(Arrays.asList("ml_heading",
                "sl_heading", "enum_list")));
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private LangUtilities() {
    }
    
    /**
     * 
     * @return true for "en" language and false otherwise
     */
    public static boolean isLangEn() {
        boolean isLangEn = true;
        
        final String locale = ContextStore.get().getUserSessionDto().getLocale();
        
        final String dbExtension = Utility.getDbExtension(locale);
        
        if (StringUtil.notNullOrEmpty(dbExtension)) {
            isLangEn = false;
        }
        return isLangEn;
    }
    
    /**
     * 
     * Get field suffix for enum_list and ml_heading fields.
     * 
     * @return suffix
     */
    public static String getFieldSuffix() {
        final String locale = ContextStore.get().getUserSessionDto().getLocale();
        return "_" + Utility.getDbExtension(locale);
    }
    
    /**
     * 
     * Gets field name to update. For enum_list and ml_heading the language suffix will be added.
     * 
     * @param fieldName change type
     * @return updated field name
     */
    public static String translatableFieldName(final String fieldName) {
        
        String transFieldName = fieldName.toLowerCase(Locale.getDefault());
        
        if (translatableFields.contains(fieldName)) {
            transFieldName += getFieldSuffix();
        }
        
        return transFieldName;
    }
    
    /**
     * Returns true if the field will is translatable.
     * 
     * @param fieldName change type
     * @return boolean
     */
    public static boolean isTranslatable(final String fieldName) {
        return translatableFields.contains(fieldName);
    }
}
