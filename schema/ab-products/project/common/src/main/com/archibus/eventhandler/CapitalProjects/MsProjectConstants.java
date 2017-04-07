package com.archibus.eventhandler.CapitalProjects;

import com.archibus.utility.EnumTemplate;

public class MsProjectConstants {
    
    /**
     * This is a static class that should not be instantiated.
     */
    private MsProjectConstants() throws InstantiationException {
    }

    /**
     * Description of the Field
     */
    public final static String PROJECT_TBL = "project";
    
    public static enum PROJECT_FLDS {
        PROJECT_ID, DOC_ACTS_XFER;
        
        /**
         * STRINGSTOENUMS.
         */
        private static final Object[][] STRINGSTOENUMS = { { "project_id", PROJECT_ID },
            { "doc_acts_xfer", DOC_ACTS_XFER } };
        
        @Override
        public String toString() {
            return EnumTemplate.toString(STRINGSTOENUMS, this);
        }
    }

    /**
     * Description of the Field
     */
    public final static String WORK_PKGS_TBL = "work_pkgs";

    public static enum WORK_PKGS_FLDS {
        DAYS_PER_WEEK, WORK_PKG_ID, DOC_ACTS_XFER;
        
        /**
         * STRINGSTOENUMS.
         */
        private static final Object[][] STRINGSTOENUMS = { { "days_per_week", DAYS_PER_WEEK },
            { "work_pkg_id", WORK_PKG_ID }, { "doc_acts_xfer", DOC_ACTS_XFER } };
        
        @Override
        public String toString() {
            return EnumTemplate.toString(STRINGSTOENUMS, this);
        }
    }

    /**
     * Table and Field names used in Activity_log database operations.
     */
    public final static String ACTIVITY_LOG_TBL = "activity_log";
    
    public static enum ACTIVITY_LOG_FLDS {
        PROJECT_ID, ACTIVITY_LOG_ID, ACTION_TITLE, DATE_SCHEDULED, DURATION, WBS_ID, PREDECESSORS, ASSIGNED_TO, COMMENTS, PCT_COMPLETE, WORK_PKG_ID, ACTIVITY_TYPE, STATUS;
        
        /**
         * STRINGSTOENUMS.
         */
        private static final Object[][] STRINGSTOENUMS = { { "project_id", PROJECT_ID },
                { "activity_log_id", ACTIVITY_LOG_ID }, { "action_title", ACTION_TITLE },
                { "date_scheduled", DATE_SCHEDULED }, { "duration", DURATION },
                { "wbs_id", WBS_ID }, { "predecessors", PREDECESSORS },
                { "assigned_to", ASSIGNED_TO }, { "comments", COMMENTS },
                { "pct_complete", PCT_COMPLETE }, { "work_pkg_id", WORK_PKG_ID },
                { "activity_type", ACTIVITY_TYPE }, { "status", STATUS } };
        
        @Override
        public String toString() {
            return EnumTemplate.toString(STRINGSTOENUMS, this);
        }
        
        /**
         *
         * @param source - String.
         * @return TransStatus.
         */
        public static TransStatus fromString(final String source) {
            return (TransStatus) EnumTemplate.fromString(source, STRINGSTOENUMS, TransStatus.class);
        }
        
    }
    
    /**
     * Description of the Field
     */
    public final static String ACTIVITY_LOG_TRANS_TBL = "activity_log_trans";

    public static enum ACTIVITY_LOG_TRANS_FLDS {
        ACTIVITY_LOG_ID, ACTIVITY_LOG_TRANS_ID, DATE_SCHEDULED, DURATION, WBS_ID, PREDECESSORS, ASSIGNED_TO, COMMENTS, PCT_COMPLETE, PROJECT_WORK_PKG_ID, STATUS, UID_MS_PROJECT, ACTION_TITLE, PROJECT_ID, WORK_PKG_ID;
        
        /**
         * STRINGSTOENUMS.
         */
        private static final Object[][] STRINGSTOENUMS = { { "activity_log_id", ACTIVITY_LOG_ID },
                { "activity_log_trans_id", ACTIVITY_LOG_TRANS_ID },
                { "date_scheduled", DATE_SCHEDULED }, { "duration", DURATION },
                { "wbs_id", WBS_ID }, { "predecessors", PREDECESSORS },
                { "assigned_to", ASSIGNED_TO }, { "comments", COMMENTS },
                { "pct_complete", PCT_COMPLETE }, { "project_work_pkg_id", PROJECT_WORK_PKG_ID },
                { "status", STATUS }, { "uid_ms_proj", UID_MS_PROJECT },
                { "action_title", ACTION_TITLE }, { "project_id", PROJECT_ID },
                { "work_pkg_id", WORK_PKG_ID } };
        
        @Override
        public String toString() {
            return EnumTemplate.toString(STRINGSTOENUMS, this);
        }
        
        /**
         *
         * @param source - String.
         * @return TransStatus.
         */
        public static TransStatus fromString(final String source) {
            return (TransStatus) EnumTemplate.fromString(source, STRINGSTOENUMS, TransStatus.class);
        }
        
    }

    public static final long ONE_SEC = 10000000;// microsecond * 10
    
    public static final long ONE_MIN = 60 * ONE_SEC;
    
    // one hour in milli-seconds used by Ms Project Duration.
    public static final long ONE_HOUR = 60 * ONE_MIN;
    
    public static enum ContentKey {
        FIRST, SECOND;
        
        /**
         * STRINGSTOENUMS.
         */
        private static final Object[][] STRINGSTOENUMS =
            { { "First", FIRST }, { "Second", SECOND } };
        
        @Override
        public String toString() {
            return EnumTemplate.toString(STRINGSTOENUMS, this);
        }
    }
    
    public static enum TransStatus {
        
        NA, NEW, DELETED, CHANGED, UNCHANGED;
        
        /**
         * STRINGSTOENUMS.
         */
        private static final Object[][] STRINGSTOENUMS = { { "N/A", NA }, { "New", NEW },
            { "Deleted", DELETED }, { "Changed", CHANGED }, { "Unchange", UNCHANGED } };
        
        @Override
        public String toString() {
            return EnumTemplate.toString(STRINGSTOENUMS, this);
        }
        
        /**
         *
         * @param source - String.
         * @return TransStatus.
         */
        public static TransStatus fromString(final String source) {
            return (TransStatus) EnumTemplate.fromString(source, STRINGSTOENUMS, TransStatus.class);
        }
    }
    
    public static enum ActLogStatus {
        
        NA, REQUESTED, PLANNED, SCHEDULED, CANCELLED, IN_PROGRESS, STOPPED, COMPLETED;
        
        /**
         * STRINGSTOENUMS.
         */
        private static final Object[][] STRINGSTOENUMS = { { "N/A", NA },
                { "REQUESTED", REQUESTED }, { "PLANNED", PLANNED }, { "SCHEDULED", SCHEDULED },
                { "CANCELLED", CANCELLED }, { "IN PROGRESS", IN_PROGRESS }, { "STOPPED", STOPPED },
                { "COMPLETED", COMPLETED } };
        
        @Override
        public String toString() {
            return EnumTemplate.toString(STRINGSTOENUMS, this);
        }
        
        /**
         *
         * @param source - String.
         * @return TransStatus.
         */
        public static TransStatus fromString(final String source) {
            return (TransStatus) EnumTemplate.fromString(source, STRINGSTOENUMS, TransStatus.class);
        }
    }
    
    public static enum MsProjectVersion {
        
        V2007, V2010, V2013;
        
        /**
         * STRINGSTOENUMS.
         */
        private static final Object[][] STRINGSTOENUMS = { { "2007", V2007 }, { "2010", V2010 },
            { "2013", V2013 } };
        
        @Override
        public String toString() {
            return EnumTemplate.toString(STRINGSTOENUMS, this);
        }
        
        /**
         *
         * @param source - String.
         * @return TransStatus.
         */
        public static MsProjectVersion fromString(final String source) {
            return (MsProjectVersion) EnumTemplate.fromString(source, STRINGSTOENUMS,
                TransStatus.class);
        }
    }
}