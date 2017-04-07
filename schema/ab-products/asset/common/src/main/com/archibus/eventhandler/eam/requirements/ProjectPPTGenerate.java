package com.archibus.eventhandler.eam.requirements;

import java.io.InputStream;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.report.ReportUtility;
import com.archibus.ext.report.ppt.*;
import com.archibus.jobmanager.JobStatus;
import com.archibus.utility.StringUtil;
import com.ibm.icu.text.SimpleDateFormat;

/**
 *
 * Version 22.1 Enterprise Asset Management - Project Power Point export generate. Provide methods
 * to generate PPT file
 * <p>
 * Invoked by web central.
 *
 * @author Radu Bunea
 * @since 22.1
 *
 */
public class ProjectPPTGenerate {

    /**
     * Constant: NO_DATA_PER_SLIDE split data modulo.
     */
    private static final int NO_DATA_PER_SLIDE = 4;

    /**
     * Constant: DATE_EST_START field record.
     */
    private static final String DATE_EST_START = "date_est_start";

    /**
     * Constant: DATE_EST_END field record.
     */
    private static final String DATE_EST_END = "date_est_end";

    /**
     * Constant: ACTION_TITLE field record.
     */
    private static final String ACTION_TITLE = "action_title";

    /**
     * Constant: PNG extension.
     */
    private static final String PNG_EXT = ".png";

    /**
     * Constant: JPG extension.
     */
    private static final String JPG_EXT = ".jpg";

    /**
     * Constant: GIF extension.
     */
    private static final String GIF_EXT = ".gif";

    /**
     * Constant: "OPEN_BRACKETS".
     */
    private static final String OPEN_BRACKETS = " (";

    /**
     * Constant: "CLOSE_BRACKETS".
     */
    private static final String CLOSE_BRACKETS = ")";

    /**
     * Constant: "MSG_LOGGER".
     */
    // @non-translatable
    private static final String MSG_LOGGER = "Generate PPT: %s";
    /**
     * Translatable constants used for export project to PPT
     */

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_PROGRAM_NAME = "Program Name";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_PROJECT_ID = "Project Id";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_MANAGER = "Manager";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_PRJ_REQ_START_DATA = "Project Requested Start Date";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_PRJ_REQ_END_DATA = "Project Requested End Date";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_PRJ_EST_DESIGN_COST = "Estimated Design Cost";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_PRJ_AFFECTED_AREA = "Affected Area";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_PRJ_DESCRIPTION = "Description";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_PRJ_SCOPE = "Scope";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_PRJ_SUMMARY_FOR = "Project Summary for";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_PRJ_SCORECARD_FOR = "Project Scorecard for";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_PRJ_BENEFIT = "Benefit";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_PRJ_WK_PKG_FOR = "Project Work Packages for";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_WK_PACKAGE_ID = "Work Package Id";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_WK_EST_START_DATE = "Estimated Start Date";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_WK_EST_END_DATE = "Estimated End Date";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_WK_ACTION_FOR = "Work Package";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_ACTION_FOR = "Project Actions for";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_ACTION_ACTION_TITLE = "Action Title";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_ACTION_ACTIVITY_TYPE = "Activity Type";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_ACTION_COST_ESTIMATED_DESIGN = "Cost - Estimated Design";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_ACTION_DATE_REQUIRED = "Date Required";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_ACTION_BUILDING = "Building";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_ACTION_FLOOR = "Floor";

    /**
     * Constant.
     */
    // @translatable
    private static final String PPT_ACTION_LOCATION = "Project Location for";

    /**
     * Date formatter.
     */
    protected final SimpleDateFormat dateFormatter =
            new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());

    /**
     * Logger for this class.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /**
     *
     * Generate Power Point Presentation based on selected <code>project</code>.
     *
     * @param projectId projectId
     * @param status JobStatus
     */
    public void generatePPT(final String projectId, final JobStatus status) {
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(MSG_LOGGER, "Started");
            this.logger.info(message);
        }

        final List<SlideInfo> slideInfos = generatePPTSlides(projectId);
        final PresentationInfo presentationInfo = new PresentationInfo();
        final PresentationBuilder builder = new PresentationBuilder();
        builder.build(presentationInfo, slideInfos, status);

        if (this.logger.isInfoEnabled()) {
            final String message = String.format(MSG_LOGGER, "OK");
            this.logger.info(message);
        }
    }

    /**
     *
     * Generate Power Point Presentation slides based on selected <code>project</code>.
     *
     * @param projectId projectId
     * @return list of Slide Info
     */
    private List<SlideInfo> generatePPTSlides(final String projectId) {
        final List<SlideInfo> slideInfos = new ArrayList<SlideInfo>();
        final ProjectRequirementHelper projectHelper = new ProjectRequirementHelper();
        final DataRecord projectRecord = projectHelper.getProjectData(projectId);
        // Project Report
        {
            slideInfos.add(generateProjectInfo(projectId, projectRecord));
        }
        // Project Summary

        {
            final SlideInfo summary = generateProjectSummary(projectId, projectRecord);
            if (summary != null) {
                slideInfos.add(summary);
            }
        }
        // Project ScoreCard
        {
            final SlideInfo scoreCord = generateProjectScoreCard(projectId, projectRecord);
            if (scoreCord != null) {
                slideInfos.add(scoreCord);
            }
        }
        final List<DataRecord> workPackages = projectHelper.getWorkPackageData(projectId);
        // Project Work Packages
        {
            if (!workPackages.isEmpty()) {
                final SlideInfo workPackagesSlides =
                        generateWorkPakages(projectId, workPackages, slideInfos);
                slideInfos.add(workPackagesSlides);
            }
        }
        // Project Work Packages Actions
        {
            generateWorkPakagesAction(projectId, workPackages, slideInfos);
        }
        return slideInfos;
    }

    /**
     *
     * Generate project info slide.
     *
     * @param projectId projectId
     * @param projectRecord projectRecord
     * @return slideInfo
     */
    private SlideInfo generateProjectInfo(final String projectId, final DataRecord projectRecord) {
        // add a text slide
        final SlideInfo textSlide = new SlideInfo();
        textSlide.setTitle("Project Report for: " + projectId);

        textSlide.getTexts().add(localizePPTLabel(PPT_PROGRAM_NAME) + StringUtil.notNull(
            projectRecord.getValue(Constants.TABLE_PROJECT + Constants.DOT + "program_id")));
        textSlide.getTexts().add(localizePPTLabel(PPT_PROJECT_ID) + StringUtil.notNull(
            projectRecord.getValue(Constants.TABLE_PROJECT + Constants.DOT + "project_id")));
        textSlide.getTexts().add(localizePPTLabel(PPT_MANAGER) + StringUtil
            .notNull(projectRecord.getValue(Constants.TABLE_PROJECT + Constants.DOT + "proj_mgr")));
        if (projectRecord
            .getDate(Constants.TABLE_PROJECT + Constants.DOT + Constants.DATE_START) != null) {
            textSlide.getTexts().add(
                localizePPTLabel(PPT_PRJ_REQ_START_DATA) + this.dateFormatter.format(projectRecord
                    .getDate(Constants.TABLE_PROJECT + Constants.DOT + Constants.DATE_START)));
        }

        if (projectRecord
            .getDate(Constants.TABLE_PROJECT + Constants.DOT + Constants.DATE_END) != null) {
            textSlide.getTexts().add(
                localizePPTLabel(PPT_PRJ_REQ_END_DATA) + this.dateFormatter.format(projectRecord
                    .getDate(Constants.TABLE_PROJECT + Constants.DOT + Constants.DATE_END)));
        }

        textSlide.getTexts().add(StringUtil.toString(localizePPTLabel(PPT_PRJ_EST_DESIGN_COST)
                + projectRecord.getInt(Constants.TABLE_PROJECT + Constants.DOT + "hours_est")));
        textSlide.getTexts()
            .add(StringUtil
                .toString(localizePPTLabel(PPT_PRJ_AFFECTED_AREA) + StringUtil.notNull(projectRecord
                    .getDouble(Constants.TABLE_PROJECT + Constants.DOT + "area_affected"))));

        textSlide.setNotes(PPT_PRJ_DESCRIPTION + Constants.DOT
                + StringUtil.notNull(projectRecord
                    .getValue(Constants.TABLE_PROJECT + Constants.DOT + Constants.DESCRIPTION))
                + '\n' + PPT_PRJ_SCOPE + Constants.DOT + StringUtil.notNull(
                    projectRecord.getValue(Constants.TABLE_PROJECT + Constants.DOT + "scope")));
        return textSlide;
    }

    /**
     *
     * Generate project summary.
     *
     * @param projectId projectId
     * @param projectRecord projectRecord
     * @return SlideInfo
     */
    private SlideInfo generateProjectSummary(final String projectId,
            final DataRecord projectRecord) {
        SlideInfo textSlide = null;
        final String summary =
                StringUtil.notNull(projectRecord.getValue(Constants.TABLE_PROJECT + ".summary"));
        if (StringUtil.notNullOrEmpty(summary)) {
            textSlide = new SlideInfo();
            textSlide.setTitle(localizePPTLabel(PPT_PRJ_SUMMARY_FOR) + projectId);
            textSlide.getTexts().add(summary);
            textSlide.setNotes(localizePPTLabel(PPT_PRJ_BENEFIT) + StringUtil
                .notNull(projectRecord.getValue(Constants.TABLE_PROJECT + ".benefit")));
        }
        return textSlide;
    }

    /**
     *
     * Generate project score card.
     *
     * @param projectId projectId
     * @param projectRecord projectRecord
     * @return SlideInfo
     */
    private SlideInfo generateProjectScoreCard(final String projectId,
            final DataRecord projectRecord) {
        SlideInfo textSlide = null;
        final String docScorecard = StringUtil
            .notNull(projectRecord.getValue(Constants.TABLE_PROJECT + ".doc_scorecard"));
        if (docScorecard.endsWith(PNG_EXT) || docScorecard.endsWith(JPG_EXT)
                || docScorecard.endsWith(GIF_EXT)) {
            textSlide = new SlideInfo();
            textSlide.setTitle(localizePPTLabel(PPT_PRJ_SCORECARD_FOR) + projectId);

            // slide's content: image
            final Map<String, String> keys = new HashMap<String, String>();
            keys.put(Constants.PROJECT_ID, projectId);
            final InputStream inputStream = ReportUtility.getImage(Constants.TABLE_PROJECT,
                "doc_scorecard", keys, ContextStore.get());
            if (inputStream != null) {
                textSlide.getImages().add(inputStream);
            }
        }
        return textSlide;
    }

    /**
     *
     * Generate work packages.
     *
     * @param projectId projectId
     * @param workPackages list workPackages
     * @param slideInfos list slideInfo
     * @return SlideInfo
     */
    private SlideInfo generateWorkPakages(final String projectId,
            final List<DataRecord> workPackages, final List<SlideInfo> slideInfos) {
        SlideInfo textSlide = new SlideInfo();
        textSlide.setTitle(localizePPTLabel(PPT_PRJ_WK_PKG_FOR) + projectId);
        for (int i = 0; i < workPackages.size(); i++) {
            if (i > 0 && i % NO_DATA_PER_SLIDE == 0) {
                // create new slide
                slideInfos.add(textSlide);

                textSlide = new SlideInfo();
                textSlide.setTitle(localizePPTLabel(PPT_PRJ_WK_PKG_FOR) + projectId);
            }
            final DataRecord workPackage = workPackages.get(i);
            final String workPkgId =
                    localizePPTLabel(PPT_WK_PACKAGE_ID) + StringUtil.notNull(workPackage.getValue(
                        Constants.TABLE_WORK_PKGS + Constants.DOT + Constants.WORK_PKG_ID));
            String estStartDate = "";
            String estEndDate = "";
            if (workPackage
                .getDate(Constants.TABLE_WORK_PKGS + Constants.DOT + DATE_EST_START) != null) {
                estStartDate = localizePPTLabel(PPT_WK_EST_START_DATE)
                        + this.dateFormatter.format(workPackage
                            .getDate(Constants.TABLE_WORK_PKGS + Constants.DOT + DATE_EST_START));
            }
            if (workPackage
                .getDate(Constants.TABLE_WORK_PKGS + Constants.DOT + DATE_EST_END) != null) {
                estEndDate = localizePPTLabel(PPT_WK_EST_END_DATE) + this.dateFormatter.format(
                    workPackage.getDate(Constants.TABLE_WORK_PKGS + Constants.DOT + DATE_EST_END));
            }

            final String text = workPkgId + '\n' + estStartDate + '\n' + estEndDate + '\n';
            textSlide.getTexts().add(text);
        }
        return textSlide;
    }

    /**
     *
     * Generate work packages action.
     *
     * @param projectId projectId
     * @param workPackages list workPackages
     * @param slideInfos list slideInfos
     */
    private void generateWorkPakagesAction(final String projectId,
            final List<DataRecord> workPackages, final List<SlideInfo> slideInfos) {

        final ProjectRequirementHelper projectHelper = new ProjectRequirementHelper();
        for (final DataRecord workPackage : workPackages) {
            // SlideInfo textSlide = new SlideInfo();
            final String workPkgId = StringUtil.notNull(workPackage
                .getValue(Constants.TABLE_WORK_PKGS + Constants.DOT + Constants.WORK_PKG_ID));

            final List<DataRecord> actions = projectHelper.getActions(projectId, workPkgId);
            final SlideInfo textSlide = generateAction(projectId, actions, workPkgId, slideInfos);
            if (textSlide.getTexts().size() > 0) {
                slideInfos.add(textSlide);
            }
        }
    }

    /**
     *
     * Generate action.
     *
     * @param projectId projectId
     * @param actions list actions
     * @param workPkgId workPkgId
     * @param slideInfos list slideInfos
     * @return SlideInfo
     */
    private SlideInfo generateAction(final String projectId, final List<DataRecord> actions,
            final String workPkgId, final List<SlideInfo> slideInfos) {
        SlideInfo textSlide = new SlideInfo();
        for (int i = 0; i < actions.size(); i++) {
            final DataRecord action = actions.get(i);
            final String activityLogId = StringUtil.notNull(action.getValue(
                Constants.TABLE_ACTIVITY_LOG + Constants.DOT + Constants.ACTIVITY_LOG_ID));
            textSlide.setTitle(localizePPTLabel(PPT_ACTION_FOR) + projectId + '\n'
                    + localizePPTLabel(PPT_WK_ACTION_FOR) + workPkgId);
            final SlideInfo markUpItemSlide = getMarkupItemSlide(projectId, action);
            if (i > 0 && i % NO_DATA_PER_SLIDE == 0 && markUpItemSlide == null) {
                // create new slide
                slideInfos.add(textSlide);

                textSlide = new SlideInfo();
                textSlide.setTitle(localizePPTLabel(PPT_ACTION_FOR) + projectId + '\n'
                        + localizePPTLabel(PPT_WK_ACTION_FOR) + workPkgId);
            }

            String dateRequired = "";
            StringUtil.notNull(action.getValue(
                Constants.TABLE_ACTIVITY_LOG + Constants.DOT + Constants.ACTIVITY_LOG_ID));

            final String actionTitle = localizePPTLabel(PPT_ACTION_ACTION_TITLE)
                    + StringUtil.notNull(action
                        .getValue(Constants.TABLE_ACTIVITY_LOG + Constants.DOT + ACTION_TITLE))
                    + OPEN_BRACKETS + activityLogId + CLOSE_BRACKETS;
            final String activityType =
                    localizePPTLabel(PPT_ACTION_ACTIVITY_TYPE) + StringUtil.notNull(action
                        .getValue(Constants.TABLE_ACTIVITY_LOG + Constants.DOT + "activity_type"));
            final String costEstDesign = localizePPTLabel(PPT_ACTION_COST_ESTIMATED_DESIGN)
                    + StringUtil.toString(action.getDouble(
                        Constants.TABLE_ACTIVITY_LOG + Constants.DOT + "cost_est_design_cap"));

            if (action.getValue(
                Constants.TABLE_ACTIVITY_LOG + Constants.DOT + Constants.DATE_REQUIRED) != null) {
                dateRequired = localizePPTLabel(PPT_ACTION_DATE_REQUIRED) + this.dateFormatter
                    .format(action.getDate(
                        Constants.TABLE_ACTIVITY_LOG + Constants.DOT + Constants.DATE_REQUIRED));
            }
            String text = actionTitle + '\n' + activityType + '\n' + costEstDesign + '\n';
            if (StringUtil.notNullOrEmpty(dateRequired)) {
                text += dateRequired + '\n';
            }

            // add redlines to slide if any
            if (markUpItemSlide == null) {
                textSlide.getTexts().add(text);
            } else {
                if (textSlide.getTexts().size() > 0) {
                    slideInfos.add(textSlide);
                }
                // create new slide
                textSlide = new SlideInfo();
                textSlide.setTitle(localizePPTLabel(PPT_ACTION_FOR) + projectId + '\n'
                        + localizePPTLabel(PPT_WK_ACTION_FOR) + workPkgId);
                textSlide.getTexts().add(text);
                slideInfos.add(textSlide);

                // create new slide
                slideInfos.add(markUpItemSlide);

                textSlide = new SlideInfo();
            }
        }
        return textSlide;
    }

    /**
     *
     * Get mark-up item if exists.
     *
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this class.
     * <p>
     * Justification: Case #1: Restriction with SELECT pattern .
     *
     * @param projectId projectId
     * @param action action
     * @return SlideInfo object with image
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private SlideInfo getMarkupItemSlide(final String projectId, final DataRecord action) {
        SlideInfo slide = null;
        final String blId = StringUtil.notNull(action.getValue("activity_log.bl_id"));
        final String flId = StringUtil.notNull(action.getValue("activity_log.fl_id"));
        final String activityLogId = StringUtil.notNull(action
            .getValue(Constants.TABLE_ACTIVITY_LOG + Constants.DOT + Constants.ACTIVITY_LOG_ID));

        final String markUpRestriction =
                "           EXISTS ( SELECT 1 FROM afm_redlines WHERE afm_redlines.activity_log_id = activity_log.activity_log_id "
                        + "         AND afm_redlines.origin IN ('HTML5-based Floor Plan', 'HTML5-based Map or Drawing Image' ) )"
                        + " AND activity_log.project_id =" + SqlUtils.formatValueForSql(projectId)
                        + " AND activity_log.activity_log_id ="
                        + SqlUtils.formatValueForSql(activityLogId)
                        + " AND activity_log.doc4 IS NOT NULL ";

        final DataSource dataSource = DataSourceFactory.createDataSource()
            .addTable(Constants.TABLE_ACTIVITY_LOG, DataSource.ROLE_MAIN)
            .addField(Constants.TABLE_ACTIVITY_LOG, Constants.ACTIVITY_LOG_ID)
            .addField(Constants.TABLE_ACTIVITY_LOG, Constants.MARK_UP_IMAGE_FIELD_ID)
            .addField(Constants.TABLE_ACTIVITY_LOG, ACTION_TITLE)
            .addField(Constants.TABLE_ACTIVITY_LOG, "description")
            .addField(Constants.TABLE_ACTIVITY_LOG, "comments")
            .addRestriction(Restrictions.sql(markUpRestriction));

        final DataRecord markupItem = dataSource.getRecord();
        if (markupItem != null) {
            String title = localizePPTLabel(PPT_ACTION_LOCATION) + projectId;
            if (StringUtil.notNullOrEmpty(flId)) {
                title += '\n' + localizePPTLabel(PPT_ACTION_BUILDING) + blId + "   "
                        + localizePPTLabel(PPT_ACTION_FLOOR) + flId;
            }

            final String docFieldValue = markupItem.getString("activity_log.doc4").toLowerCase();
            // add image record into presentation slides
            if (docFieldValue.endsWith(PNG_EXT) || docFieldValue.endsWith(JPG_EXT)
                    || docFieldValue.endsWith(GIF_EXT)) {

                // slide's content: image
                slide = addInputStreamToSlide(title, markupItem, activityLogId);

            }
        }
        return slide;
    }

    /**
     *
     * Add input stream to slide, like add image to slide.
     *
     * @param title title to append
     * @param markupItem markupItem record
     * @param activityLogId activityLogId
     * @return new slideInfo
     */
    private SlideInfo addInputStreamToSlide(final String title, final DataRecord markupItem,
            final String activityLogId) {
        SlideInfo slide = null;
        try {

            // slide's content: image
            final Map<String, String> keys = new HashMap<String, String>();
            keys.put(Constants.ACTIVITY_LOG_ID, activityLogId);
            // use ReportUtility.getImage() to get image from database
            final InputStream inputStream = ReportUtility.getImage(Constants.TABLE_ACTIVITY_LOG,
                Constants.MARK_UP_IMAGE_FIELD_ID, keys, ContextStore.get());

            if (inputStream != null) {
                slide = new SlideInfo();
                slide.getImages().add(inputStream);
                final String newTitle = title + '\n' + localizePPTLabel(PPT_ACTION_ACTION_TITLE)
                        + markupItem.getString("activity_log.action_title") + OPEN_BRACKETS
                        + activityLogId + CLOSE_BRACKETS;

                // slide's title
                slide.setTitle(newTitle);

                // slide's notes
                slide.setNotes(StringUtil.notNull(markupItem.getString("activity_log.description"))
                        + '\n' + StringUtil.notNull(markupItem.getString("activity_log.comments")));
            }
        } catch (final IllegalArgumentException argumentException) {
            if (this.logger.isInfoEnabled()) {
                this.logger.info("Add image to slide", argumentException);
            }
        }
        return slide;
    }

    /**
     *
     * Localizes label text for PPT labels.
     *
     * @param label label
     * @return localized text
     */
    private String localizePPTLabel(final String label) {
        return EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(), label,
            this.getClass().getName()) + ": ";
    }
}
