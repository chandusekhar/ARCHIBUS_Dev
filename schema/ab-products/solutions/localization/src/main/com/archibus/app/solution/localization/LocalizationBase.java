package com.archibus.app.solution.localization;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.jobmanager.JobBase;
import com.archibus.model.config.LocaleConfig;
import com.archibus.service.remoting.SecurityService;

/**
 * Extension of JobBase with common functions for Localization Activity
 * 
 */
public class LocalizationBase extends JobBase {
    
    public String dbExtension = "";
    
    public String fullLocaleName = "";
    
    // tables related variables
    public Map<String, org.dom4j.tree.DefaultElement> translatableFieldsByName;
    
    public final String[] schemaTable = { "afm_tbls", "afm_flds", "afm_layr", "afm_holiday_dates",
            "messages" };
    
    public final String[] pNavTable = { "afm_products", "afm_activities", "afm_processes",
            "afm_ptasks" };
    
    public final String[] excludeTable = { "afm_activity_cats", "afm_psubtasks" };
    
    // public final String[] excludeTable = { "afm_mods", "afm_class", "afm_acts", "afm_hotlist",
    // "afm_activity_cats", "afm_psubtasks" };
    
    public static final int TYPE_DEFAULT = 0;
    
    public static final int TYPE_ENUM = 1;
    
    public static final int TYPE_ML_HEADING = 2;
    
    public static final int TYPE_SL_HEADING = 3;
    
    public static final String UPDATE_STATUS_NO_CHANGE = "NO CHANGE";
    
    public static final String UPDATE_STATUS_INSERTED = "INSERTED";
    
    public static final String UPDATE_STATUS_UPDATED = "UPDATED";
    
    // files related variables
    public static final String FILE_TYPE_WRITE_VIEW = "VIEW_FILE";
    
    public static final String FILE_TYPE_WRITE_JS = "JS_FILE";
    
    public static final String FILE_TYPE_WRITE_JAVA = "JAVA_FILE";
    
    public static final String FILE_TYPE_WRITE_RESX = "RESX_FILE";
    
    public static final String FILE_TYPE_WRITE_MNU = "MNU_FILE";
    
    public static final String FILE_TYPE_WRITE_MOBILE = "MOBILE_FILE";
    
    public static final String FILE_TYPE_WRITE_MOBILE_CONTROL = "MOBILE_CONTROL_FILE";
    
    public static final String ELEMENT_LOCALIZED_STRINGS = "afmLocalizedStrings";
    
    public static final String ELEMENT_LOCALE = "locale";
    
    public static final String ATTRIBUTE_LOCALE_NAME = "name";
    
    public static final int APPEND_LANG_FILE = 0;
    
    public static final int DELETE_LANG_FILE = 1;
    
    public static final int EXTENSION_LANG_FILE = 2;
    
    public static final String EXT_LANG = ".lang";
    
    public static final String EXT_JS = ".js";
    
    public static final String DEFAULT_SCHEMA_LANG = "schema";
    
    public static final String DEFAULT_CONTROL_JS = "ui-controls-lang";
    
    public static final String DEFAULT_CONTROL_MOBILE = "lang";
    
    public static final String DEFAULT_CONTROL_MOBILE_CONTROL = "control";
    
    public static final String DEFAULT_CORE_LANG = "core";
    
    public static final String DEFAULT_LANG_DIR = "/schema/ab-system/lang/";
    
    public static final String DEFAULT_JS_DIR = "/schema/ab-core/controls/lang/";
    
    public static final String DEFAULT_MOBILE_DIR =
            "/schema/ab-products/common/mobile/src/Common/resources/language/";
    
    public static final String AB_CORE = "/ab-core/";
    
    public static final String AB_SYSTEM = "/ab-system/";
    
    public static final String PROJECTS_USERS_PATH = "/projects/users/";
    
    public static final String LOCALIZE_FOLDER = "/localize/";
    
    public String language = "";
    
    public static final String WEBAPP_ABSOLUTE_PATH = ContextStore.get().getWebAppPath();
    
    public static final String SCHEMA_ABSOLUTE_PATH = WEBAPP_ABSOLUTE_PATH + "/schema";
    
    public static final String AB_CORE_ABSOLUTE_PATH = SCHEMA_ABSOLUTE_PATH + "/ab-core";
    
    public String RESX_MNU_ABSOLUTE_PATH = WEBAPP_ABSOLUTE_PATH + "/projects/users/"
            + ContextStore.get().getUserAccount().getUser().getName().toLowerCase() + "/localize";
    
    public String MOBILE_ABSOLUTE_PATH = SCHEMA_ABSOLUTE_PATH + "/ab-products/common/mobile/src";
    
    public String PAGENAV_ABSOLUTE_PATH = SCHEMA_ABSOLUTE_PATH
            + "/ab-products/common/views/page-navigation/descriptors";
    
    public static List<LocaleConfig> locales = new ArrayList<LocaleConfig>();
    
    /**
     * get the field type for the translatable table/field
     * 
     * @param tableName String
     * @param fieldName String
     * @return fieldType int
     */
    public int getFieldType(final String tableName, final String fieldName) {
        if (tableName.compareToIgnoreCase("afm_flds") == 0
                && fieldName.compareToIgnoreCase("ml_heading") == 0) {
            return LocalizationBase.TYPE_ML_HEADING;
        } else if (tableName.compareToIgnoreCase("afm_flds") == 0
                && fieldName.compareToIgnoreCase("sl_heading") == 0) {
            return LocalizationBase.TYPE_SL_HEADING;
        } else if (tableName.compareToIgnoreCase("afm_flds") == 0
                && fieldName.compareToIgnoreCase("enum_list") == 0) {
            return LocalizationBase.TYPE_ENUM;
        } else {
            return LocalizationBase.TYPE_DEFAULT;
        }
    }
    
    /**
     * get the DB extension for the passed in language
     * 
     * @param language String
     */
    // public void getLocaleName() {
    // HashMap<String, String> localesToDbExtensions = ContextStore.get().getConfigManager()
    // .getLocales();
    // for each locales
    // Iterator<Map.Entry<String, String>> it = localesToDbExtensions.entrySet().iterator();
    // while (it.hasNext()) {
    // Map.Entry<String, String> pairs = it.next();
    // get values
    // String localeNameWhole = pairs.getKey();
    // String dbExtension = pairs.getValue();
    // if (dbExtension.compareToIgnoreCase(this.dbExtension) == 0) {
    // this.fullLocaleName = localeNameWhole;
    // if ("fr_CA".equals(this.fullLocaleName)) {
    // this.fullLocaleName = "fr_FR";
    // }
    // break;
    // }
    // }
    // }
    /**
     * Check to see whether it is the schema table
     * 
     * @param tableName String
     * @return boolean
     */
    public boolean checkSchemaTable(final String tableName) {
        
        for (final String element : this.schemaTable) {
            if (tableName.compareToIgnoreCase(element) == 0) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check to see whether it is the pnav table
     * 
     * @param tableName String
     * @return boolean
     */
    public boolean checkPNavTable(final String tableName) {
        
        for (final String element : this.pNavTable) {
            if (tableName.compareToIgnoreCase(element) == 0) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check to see whether it is the excluded table
     * 
     * @param tableName String
     * @return boolean
     */
    public boolean checkExcludeTable(final String tableName) {
        
        for (final String element : this.excludeTable) {
            if (tableName.compareToIgnoreCase(element) == 0) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Returns the number of records inserted or updated
     * 
     * @param tableName String Name of the localization table
     * @param pkFieldName String Name of primary key
     * @return affectedNum Int Count of inserted or updated records in provided table
     */
    public int getCountInserted(final String tableName, final String pkFieldName) {
        return DataStatistics.getInt(tableName, pkFieldName, "COUNT", Restrictions.and(
            Restrictions.eq(tableName, "transfer_status", UPDATE_STATUS_INSERTED),
            Restrictions.eq(tableName, "language", this.language)));
    }
    
    /**
     * Returns the number of records inserted or updated
     * 
     * @param tableName String Name of the localization table
     * @param pkFieldName String Name of primary key
     * @return affectedNum Int Count of inserted or updated records in provided table
     */
    public int getCountInsertedUpdated(final String tableName, final String pkFieldName) {
        return DataStatistics.getInt(tableName, pkFieldName, "COUNT", Restrictions.or(
            new Restriction.Clause(tableName, "language", this.language, Restrictions.OP_EQUALS),
            new Restriction.Clause(tableName, "transfer_status", UPDATE_STATUS_INSERTED,
                Restrictions.OP_EQUALS, Restrictions.REL_OP_AND_BRACKET), new Restriction.Clause(
                tableName, "transfer_status", UPDATE_STATUS_UPDATED, Restrictions.OP_EQUALS)));
    }
    
    /**
     * Change the status to "No Change" for given table and language
     * 
     * @param table String Name of the localization table
     * @param language String language
     */
    public void setStatusToNoChange(final String table) {
        final String sql =
                "UPDATE " + table + " SET transfer_status = '" + UPDATE_STATUS_NO_CHANGE
                        + "' WHERE language='" + this.language + "'";
        final DataSource ds = DataSourceFactory.createDataSource().addTable(table).addQuery(sql);
        ds.executeUpdate();
    }
    
    /**
     * Get locale languages.
     * 
     */
    public static void setLocales() {
        final SecurityService securityService =
                (SecurityService) ContextStore.get().getBean("securityService");
        LocalizationBase.locales = securityService.getLocales("en_US");
    }
    
    /**
     * Return Map<String, org.dom4j.tree.DefaultElement of translatable fields from schema
     * preferences.
     */
    @SuppressWarnings("unchecked")
    protected Map<String, org.dom4j.tree.DefaultElement> getTranslatableFieldsByName() {
        return ContextStore.get().getProject().getTranslatableFieldsByName();
    }
}