package com.archibus.app.rplm.space;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.common.bldgops.dao.IActionItemDao;
import com.archibus.app.common.bldgops.domain.ActionItem;
import com.archibus.context.ContextStore;
import com.archibus.ext.report.ReportUtility;
import com.archibus.ext.report.ppt.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.StringUtil;

/**
 * Job that generates Power Point presentation. Used in Space Portfolio Planning Console.
 *
 * @author ASC-BJ:Zhang Yi
 *
 */
public class SpacePortfolioConsoleGeneratePresentationJob extends JobBase {

    /**
     * Operation Message.
     */
    // @non-translatable
    private static final String OPERATION = "Generate PPT of Space Portfolio Scenario %s : %s.";

    /**
     * Table name 'activity_log'.
     *
     */
    private static final String ACTION_TABLE = "activity_log";

    /**
     * Field name 'activity_log_id'.
     *
     */
    private static final String ACTION_ID = "activity_log_id";

    /**
     * Field name 'doc4'.
     *
     */
    private static final String MARK_UP_IMAGE_FIELD_ID = "doc4";

    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /**
     * Action Item DAO.
     */
    private IActionItemDao actionItemDao;

    /**
     * list of slides.
     *
     */
    private List<Map<String, String>> slides;

    /**
     * Configuration for presentation of portfolio scenario.
     *
     */
    private Map<String, String> config;

    /**
     * Portfolio Scenario id.
     */
    private String scenarioId;

    /**
     * Presentation Builder.
     */
    private PresentationBuilder presentationBuilder;

    /**
     * Set parameters passed from client side 'Space Portfolio Planning Console'.
     *
     * @param portfolioScenarioSlides list of Portfolio Scenario slides
     * @param presnetationConfig configuration for Portfolio Scenario presentation
     * @param portfolioScenarioId Portfolio Scenario id
     */
    public void setParameters(final List<Map<String, String>> portfolioScenarioSlides,
            final Map<String, String> presnetationConfig, final String portfolioScenarioId) {
        this.slides = portfolioScenarioSlides;
        this.config = presnetationConfig;
        this.scenarioId = portfolioScenarioId;
    }

    /**
     * Getter for the actionItemDao property.
     *
     * @see actionItemDao
     * @return the actionItemDao property.
     */
    public IActionItemDao getActionItemDao() {
        return this.actionItemDao;
    }

    /**
     * Setter for the actionItemDao property.
     *
     * @see actionItemDao
     * @param actionItemDao the actionItemDao to set
     */

    public void setActionItemDao(final IActionItemDao actionItemDao) {
        this.actionItemDao = actionItemDao;
    }

    /**
     * Getter for the presentationBuilder property.
     *
     * @see presentationBuilder
     * @return the presentationBuilder property.
     */
    public PresentationBuilder getPresentationBuilder() {
        return this.presentationBuilder;
    }

    /**
     * Setter for the presentationBuilder property.
     *
     * @see presentationBuilder
     * @param presentationBuilder the presentationBuilder to set
     */

    public void setPresentationBuilder(final PresentationBuilder presentationBuilder) {
        this.presentationBuilder = presentationBuilder;
    }

    @Override
    public void run() {

        if (this.logger.isInfoEnabled()) {
            final String message = String.format(OPERATION, this.scenarioId, "Started");
            this.logger.info(message);
        }

        final List<SlideInfo> slideInfos = PresentationUtilities.parse(this.slides);

        // add more slides from action items mark-up
        {
            final List<ActionItem> markupItems = this.actionItemDao.findByScenario(this.scenarioId);

            for (final ActionItem item : markupItems) {

                createSlide(slideInfos, item);
            }
        }

        final PresentationInfo presentationInfo = PresentationUtilities.parse(this.config);
        this.presentationBuilder.build(presentationInfo, slideInfos, this.status);

        if (this.logger.isInfoEnabled()) {
            final String message = String.format(OPERATION, this.scenarioId, "Ok");
            this.logger.info(message);
        }

    }

    /**
     * Create a slide from action item's document.
     *
     * @param slideInfos slides to add the created slide to
     * @param item the action item to create a slide from its document
     */
    private void createSlide(final List<SlideInfo> slideInfos, final ActionItem item) {

        if (this.status.isStopRequested()) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        }

        // add image of action item into presentation slides
        final String docFieldValue = item.getDoc4().toLowerCase();
        if (docFieldValue.endsWith(".png") || docFieldValue.endsWith(".jpg")
                || docFieldValue.endsWith(".gif")) {

            final SlideInfo slide = new SlideInfo();

            // slide's title
            slide.setTitle(item.getActionTitle());

            // slide's notes
            slide.setNotes(StringUtil.notNull(item.getDescription()) + '\n'
                    + StringUtil.notNull(item.getComments()));

            // slide's content: image
            final Map<String, String> keys = new HashMap<String, String>();
            keys.put(ACTION_ID, StringUtil.notNull(item.getId()));

            // use ReportUtility.getImage() to get image from database
            slide.getImages().add(ReportUtility.getImage(ACTION_TABLE, MARK_UP_IMAGE_FIELD_ID, keys,
                ContextStore.get()));

            slideInfos.add(slide);
        }

        this.status.incrementCurrentNumber();
    }

}