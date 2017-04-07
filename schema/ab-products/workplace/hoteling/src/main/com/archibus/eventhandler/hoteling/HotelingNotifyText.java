package com.archibus.eventhandler.hoteling;

import java.util.*;

import com.archibus.config.Project;
import com.archibus.context.*;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.security.UserAccount;
import com.archibus.utility.StringUtil;

/**
 * Notification text class for Hoteling notification.
 * <p>
 *
 * @author Guo
 * @since 20.3
 */
public class HotelingNotifyText extends EventHandlerBase {

    /**
     * flag of send email.
     */
    private final HotelingNotifyService notifyService;

    /**
     * Constructor of the class.
     *
     * @param hotelingNotifyService HotelingNotifyService
     */
    public HotelingNotifyText(final HotelingNotifyService hotelingNotifyService) {
        super();
        this.notifyService = hotelingNotifyService;
    }

    /**
     * Prepare email text.
     *
     * @param emId the employee id to receive email
     * @param bookingsEmployeesList bookingsEmployeesList
     * @param bookingsVisitorsList bookingsVisitorsList
     * @param bookingsApprovesList bookingsApprovesList
     * @param bookingAction bookingAction
     * @param recurringRule recurringRule
     * @return email subject and body
     */
    public Map<String, String> getEmailText(final List<DataRecord> bookingsEmployeesList,
        final String emId, final List<DataRecord> bookingsVisitorsList,
        final List<DataRecord> bookingsApprovesList, final String bookingAction,
        final String recurringRule) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String text = getEmailBeginningText(bookingAction, context);
        final Map<String, String> parameters = new HashMap<String, String>();
        parameters.put(HotelingConstants.PARAMETER_TEXT, text);
        parameters.put(HotelingConstants.PARAMETER_PCT_ID_SUBJECT, "");
        parameters.put(HotelingConstants.PARAMETER_DATE_SUBJECT, "");
        parameters.put(HotelingConstants.PARAMETER_SUBJECT, "");

        final DataSource selectRecordDs = HotelingUtility.getRmpctJoinActivityLogDataSource();
        selectRecordDs
        .addRestriction(Restrictions.sql("rmpct.parent_pct_id =${parameters['pct_id']}"))
        .addParameter(HotelingConstants.PCT_ID, "", DataSource.DATA_TYPE_INTEGER)
        .addSort(HotelingConstants.RMPCT, HotelingConstants.DATE_START);

        // send mail to employee.
        getEmailContentFromBookingList(bookingAction, bookingsEmployeesList, emId, recurringRule,
            parameters, selectRecordDs, HotelingConstants.NOTIFY_LIST_TYPE_EMPLOYEE);
        getEmailContentFromBookingList(bookingAction, bookingsVisitorsList, emId, recurringRule,
            parameters, selectRecordDs, HotelingConstants.NOTIFY_LIST_TYPE_VISITOR);
        getEmailContentFromBookingList(bookingAction, bookingsApprovesList, emId, recurringRule,
            parameters, selectRecordDs, HotelingConstants.NOTIFY_LIST_TYPE_APPROVER);

        String subject = parameters.get(HotelingConstants.PARAMETER_SUBJECT);
        text = parameters.get(HotelingConstants.PARAMETER_TEXT);
        if (HotelingConstants.BOOKING_ACTION_CREATE.equals(bookingAction)) {
            subject =
                    this.getSubject(parameters.get(HotelingConstants.PARAMETER_PCT_ID_SUBJECT),
                        parameters.get(HotelingConstants.PARAMETER_DATE_SUBJECT), false, false,
                        "created", recurringRule);
        }
        text = text.replaceAll(HotelingConstants.EMAIL_TEXT_NEW_LINE, "<br>");

        String text0 = "";
        // if(bookingAction.equals("created")||bookingAction.equals(HotelingConstants.EMAIL_TEXT_APPROVE)){
        text0 =
                "<html><body style =\"color=blue;font-size:12px;font-family:Arial;\">" + text
                + this.getUrlAddress(context, bookingsApprovesList, bookingAction)
                + "</body></html>";

        final TreeMap<String, String> mail = new TreeMap<String, String>();
        mail.put(subject, text0);
        return mail;
    }

    /**
     * get email content from booking list.
     *
     * @param emId the employee to receive email
     * @param bookingAction bookingAction
     * @param bookingList bookingList
     * @param recurringRule recurringRule
     * @param parameters parameters
     * @param selectRecordDs selectRecordDs
     * @param listType listType
     */
    private void getEmailContentFromBookingList(final String bookingAction,
            final List<DataRecord> bookingList, final String emId, final String recurringRule,
            final Map<String, String> parameters, final DataSource selectRecordDs,
            final String listType) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        Locale emailLocal = null;
        UserAccount.Immutable userAccount = null;
        final Context userContext = ContextStore.get();
        if (userContext != null) {
            final Project.Immutable project = userContext.getProject();
            if (project != null) {
                userAccount = project.findUserAccount(emId);
            }
        }

        emailLocal = userAccount == null ? Locale.getDefault() : userAccount.getLocale();

        if (bookingList != null) {
            if (HotelingConstants.BOOKING_ACTION_CREATE.equals(bookingAction)) {

                getEmailContentForCreate(bookingAction, bookingList, emailLocal, recurringRule,
                    parameters, selectRecordDs, listType, context);

            } else if (!HotelingConstants.NOTIFY_LIST_TYPE_APPROVER.equals(listType)) {
                getEmailContentForApprove(bookingAction, bookingList, emailLocal, parameters,
                    listType);
            }
        }

    }

    /**
     * get email content for approve action.
     *
     * @param locale the locale of the email
     * @param bookingAction bookingAction
     * @param bookingList bookingList
     * @param parameters parameters
     * @param listType listType
     */
    private void getEmailContentForApprove(final String bookingAction,
            final List<DataRecord> bookingList, final Locale locale,
            final Map<String, String> parameters, final String listType) {
        String text = parameters.get(HotelingConstants.PARAMETER_TEXT);
        String pctIdSubject = parameters.get(HotelingConstants.PARAMETER_PCT_ID_SUBJECT);
        String dateSubject = parameters.get(HotelingConstants.PARAMETER_DATE_SUBJECT);
        String subject = parameters.get(HotelingConstants.PARAMETER_SUBJECT);

        final java.util.Set<Integer> set = getPctSet(bookingList);
        final Iterator<Integer> iterator = set.iterator();
        boolean isRecurring = false;
        boolean isRegular = false;

        while (iterator.hasNext()) {

            final int parentPctId1 = iterator.next();
            int index = 0;
            for (int bookIndex = 0; bookIndex < bookingList.size(); bookIndex++) {

                final DataRecord booking = bookingList.get(bookIndex);

                final int parentPctId2 =
                        booking.getInt(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.PARENT_PCT_ID);
                String recurringRule1 = "";
                recurringRule1 = booking.getString("activity_log.recurring_rule");
                // when parentPctId2==parentPctId1 ,the record is recurring ,else is regular
                if (parentPctId2 == parentPctId1) {
                    if (StringUtil.notNullOrEmpty(recurringRule1)) {
                        pctIdSubject = getPctIdSubjectByIndex(index, pctIdSubject, booking);
                        dateSubject = getDateSubjectByIndex(index, dateSubject, booking);
                        // get recurring text
                        text =
                                this.getRecurringText(index, booking, text, listType,
                                    bookingAction, locale);
                        index++;
                        isRecurring = true;
                    } else {
                        pctIdSubject =
                                pctIdSubject
                                + HotelingConstants.EMAIL_TEXT_COMMA
                                + booking.getInt(HotelingConstants.RMPCT
                                    + HotelingConstants.DOT + HotelingConstants.PCT_ID);
                        dateSubject =
                                dateSubject
                                + HotelingConstants.EMAIL_TEXT_COMMA
                                + booking.getDate(HotelingConstants.RMPCT
                                    + HotelingConstants.DOT
                                    + HotelingConstants.DATE_START);
                        text = this.getRegularText(booking, text, listType, bookingAction, locale);
                        isRegular = true;
                    }
                }
            }

        }
        subject = this.getSubject(pctIdSubject, dateSubject, isRegular, isRecurring, "", "");

        parameters.put(HotelingConstants.PARAMETER_TEXT, text);
        parameters.put(HotelingConstants.PARAMETER_PCT_ID_SUBJECT, pctIdSubject);
        parameters.put(HotelingConstants.PARAMETER_DATE_SUBJECT, dateSubject);
        parameters.put(HotelingConstants.PARAMETER_SUBJECT, subject);
    }

    /**
     * get date subject by index.
     *
     * @param index index
     * @param dateSubject dateSubject
     * @param booking booking
     * @return pct_id subject
     */
    private String getDateSubjectByIndex(final int index, final String dateSubject,
            final DataRecord booking) {
        String subject = dateSubject;
        if (index == 0) {
            subject =
                    subject
                    + HotelingConstants.EMAIL_TEXT_COMMA
                    + booking.getDate(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.DATE_START);
        }

        return subject;
    }

    /**
     * get pct_id subject by index.
     *
     * @param index index
     * @param pctIdSubject pctIdSubject
     * @param booking booking
     * @return pct_id subject
     */
    private String getPctIdSubjectByIndex(final int index, final String pctIdSubject,
            final DataRecord booking) {
        String subject = pctIdSubject;
        if (index == 0) {
            subject =
                    subject
                    + HotelingConstants.EMAIL_TEXT_COMMA
                    + booking.getInt(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.PCT_ID);
        }

        return subject;
    }

    /**
     * get email content for create action.
     *
     * @param locale the locale of the email
     * @param bookingAction bookingAction
     * @param bookingList bookingList
     * @param recurringRule recurringRule
     * @param parameters parameters
     * @param selectRecordDs selectRecordDs
     * @param listType listType
     * @param context context
     */
    private void getEmailContentForCreate(final String bookingAction,
            final List<DataRecord> bookingList, final Locale locale, final String recurringRule,
            final Map<String, String> parameters, final DataSource selectRecordDs,
            final String listType, final EventHandlerContext context) {
        String text = parameters.get(HotelingConstants.PARAMETER_TEXT);
        String pctIdSubject = parameters.get(HotelingConstants.PARAMETER_PCT_ID_SUBJECT);
        String dateSubject = parameters.get(HotelingConstants.PARAMETER_DATE_SUBJECT);
        parameters.get(HotelingConstants.PARAMETER_SUBJECT);

        if (HotelingConstants.NOTIFY_LIST_TYPE_APPROVER.equals(listType)) {
            text =
                    EventHandlerBase.localizeString(context, locale,
                        HotelingConstants.EMAIL_TEXT_NEED_APPROVE,
                        HotelingConstants.class.getName(), "")
                        + " \r\n"
                        + HotelingConstants.EMAIL_TEXT_BLANK
                        + HotelingConstants.EMAIL_TEXT_NEW_LINE;
        }

        for (int bookingListindex = 0; bookingListindex < bookingList.size(); bookingListindex++) {
            final int parentPctId =
                    bookingList.get(bookingListindex).getInt(
                        HotelingConstants.RMPCT + HotelingConstants.DOT + HotelingConstants.PCT_ID);
            selectRecordDs.setParameter(HotelingConstants.PCT_ID, parentPctId);
            final List<DataRecord> bookings = selectRecordDs.getAllRecords();

            for (int bookIndex = 0; bookIndex < bookings.size(); bookIndex++) {
                final DataRecord booking = bookings.get(bookIndex);
                // for a recurring
                if (StringUtil.notNullOrEmpty(recurringRule)) {
                    pctIdSubject = getPctIdSubjectByIndex(bookIndex, pctIdSubject, booking);
                    dateSubject = getDateSubjectByIndex(bookIndex, dateSubject, booking);
                    // get recurring text
                    text =
                            this.getRecurringText(bookIndex, booking, text, listType,
                                bookingAction, locale);
                } else {
                    pctIdSubject =
                            pctIdSubject
                            + HotelingConstants.EMAIL_TEXT_COMMA
                            + booking.getInt(HotelingConstants.RMPCT
                                + HotelingConstants.DOT + HotelingConstants.PCT_ID);
                    dateSubject =
                            dateSubject
                            + HotelingConstants.EMAIL_TEXT_COMMA
                            + booking.getDate(HotelingConstants.RMPCT
                                + HotelingConstants.DOT + HotelingConstants.DATE_START);
                    // get Regular Text
                    text = this.getRegularText(booking, text, listType, bookingAction, locale);
                }
            }
        }

        parameters.put(HotelingConstants.PARAMETER_TEXT, text);
        parameters.put(HotelingConstants.PARAMETER_PCT_ID_SUBJECT, pctIdSubject);
        parameters.put(HotelingConstants.PARAMETER_DATE_SUBJECT, dateSubject);
    }

    /**
     * get email beginning text.
     *
     * @param bookingAction bookingAction
     * @param context context
     * @return email beginning text.
     */
    private String getEmailBeginningText(final String bookingAction,
            final EventHandlerContext context) {
        final String bookingActionForText = getBookingActionText(bookingAction, context);

        // @translatable
        final String text1 =
                EventHandlerBase.localizeString(context, HotelingConstants.EMAIL_TEXT_BEGINNING1,
                    HotelingConstants.class.getName());
        // @translatable
        final String text2 =
                EventHandlerBase.localizeString(context, HotelingConstants.EMAIL_TEXT_BEGINNING2,
                    HotelingConstants.class.getName());

        final String text3 =
                ":\r\n" + HotelingConstants.EMAIL_TEXT_BLANK
                + HotelingConstants.EMAIL_TEXT_NEW_LINE;
        return text1 + HotelingConstants.EMAIL_TEXT_BLANK + bookingActionForText + "." + text2
                + HotelingConstants.EMAIL_TEXT_BLANK + text3;
    }

    /**
     * get booking action text.
     *
     * @param bookingAction bookingAction
     * @param context context
     * @return booking action text
     */
    private String getBookingActionText(final String bookingAction,
            final EventHandlerContext context) {
        // @translatable
        final String bookingCreated =
                EventHandlerBase.localizeString(context, HotelingConstants.BOOKING_ACTION_CREATE,
                    HotelingConstants.class.getName());
        // @translatable
        final String bookingApproved =
                EventHandlerBase.localizeString(context, HotelingConstants.BOOKING_ACTION_APPROVED,
                    HotelingConstants.class.getName());
        // @translatable
        final String bookingCanceled =
                EventHandlerBase.localizeString(context, HotelingConstants.BOOKING_ACTION_CANCELED,
                    HotelingConstants.class.getName());
        // @translatable
        final String bookingRejected =
                EventHandlerBase.localizeString(context, HotelingConstants.BOOKING_ACTION_REJECTED,
                    HotelingConstants.class.getName());

        String bookingActionForText = "";
        if (bookingAction.equals(HotelingConstants.BOOKING_ACTION_CREATE)) {
            bookingActionForText = bookingCreated;
        } else if (bookingAction.equals(HotelingConstants.BOOKING_ACTION_APPROVED)) {
            bookingActionForText = bookingApproved;
        } else if (bookingAction.equals(HotelingConstants.BOOKING_ACTION_CANCELED)) {
            bookingActionForText = bookingCanceled;
        } else {
            bookingActionForText = bookingRejected;
        }
        return bookingActionForText;
    }

    /**
     * get Recurring Text.
     *
     * @param locale the locale of the email
     * @param index index
     * @param booking booking
     * @param text TEXT
     * @param type TYPE
     * @param bookingAction bookingAction
     * @return recurring text
     */

    private String getRecurringText(final int index, final DataRecord booking, final String text,
            final String type, final String bookingAction, final Locale locale) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        String newText = text;
        if (index == 0) {
            final String rmpctTableName = HotelingConstants.RMPCT + HotelingConstants.DOT;
            final String emId = booking.getString(rmpctTableName + HotelingConstants.EM_ID);

            int visitorId = -1;
            if (booking.getInt(rmpctTableName + HotelingConstants.VISITOR_ID) > 0) {
                visitorId = booking.getInt(rmpctTableName + HotelingConstants.VISITOR_ID);
            }

            final int parentPctId =
                    booking.getInt(rmpctTableName + HotelingConstants.PARENT_PCT_ID);
            newText = addParentBookingText(newText, context, locale, parentPctId);
            newText = addEmployeeOrVisitorText(newText, type, context, locale, emId, visitorId);

            // get location information
            final String blId = booking.getString(rmpctTableName + HotelingConstants.BL_ID);
            final String flId = booking.getString(rmpctTableName + HotelingConstants.FL_ID);
            final String rmId = booking.getString(rmpctTableName + HotelingConstants.RM_ID);
            newText = addLocationText(newText, context, locale, blId, flId, rmId);

        }
        newText = addBookingText(booking, newText, type, bookingAction, true, context, locale);
        return newText;
    }

    /**
     * get regular text.
     *
     * @param emailLocale the locale of the email
     * @param booking booking
     * @param text text
     * @param type type
     * @param bookingAction bookingAction
     * @return regular text
     */
    private String getRegularText(final DataRecord booking, final String text, final String type,
            final String bookingAction, final Locale emailLocale) {
        final String rmpctTableName = HotelingConstants.RMPCT + HotelingConstants.DOT;
        final String blId = booking.getString(rmpctTableName + HotelingConstants.BL_ID);
        final String flId = booking.getString(rmpctTableName + HotelingConstants.FL_ID);
        final String rmId = booking.getString(rmpctTableName + HotelingConstants.RM_ID);
        final String emId = booking.getString(rmpctTableName + HotelingConstants.EM_ID);
        int visitorId = -1;
        if (booking.getInt(rmpctTableName + HotelingConstants.VISITOR_ID) > 0) {
            visitorId = booking.getInt(rmpctTableName + HotelingConstants.VISITOR_ID);
        }
        booking.getDate(rmpctTableName + HotelingConstants.DATE_START);
        booking.getDate(rmpctTableName + HotelingConstants.DATE_END);
        final long pctId = booking.getInt(rmpctTableName + HotelingConstants.PCT_ID);
        final int dayPartNum = booking.getInt(rmpctTableName + HotelingConstants.DAY_PART);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        EventHandlerBase.getEnumFieldDisplayedValue(context, HotelingConstants.RMPCT,
            HotelingConstants.DAY_PART, String.valueOf(dayPartNum));
        final int statusNum = booking.getInt(rmpctTableName + HotelingConstants.STATUS);
        EventHandlerBase.getEnumFieldDisplayedValue(context, HotelingConstants.RMPCT,
            HotelingConstants.STATUS, String.valueOf(statusNum));
        if (HotelingConstants.BOOKING_ACTION_APPROVED.equals(bookingAction)) {
            EventHandlerBase.localizeString(context, HotelingConstants.EMAIL_TEXT_APPROVE,
                HotelingConstants.class.getName());
        }
        String newText = text;
        // @translatable
        newText =
                newText
                + EventHandlerBase
                .localizeString(context, HotelingConstants.EMAIL_TEXT_BOOKING,
                    HotelingConstants.class.getName())
                    + HotelingConstants.EMAIL_TEXT_COLON + pctId
                    + HotelingConstants.EMAIL_TEXT_NEW_LINE;
        newText = addEmployeeOrVisitorText(newText, type, context, emailLocale, emId, visitorId);
        newText = addLocationText(newText, context, emailLocale, blId, flId, rmId);
        newText =
                addBookingText(booking, newText, type, bookingAction, false, context, emailLocale);

        return newText;
    }

    /**
     * add booking text.
     *
     * @param locale the locale of the email
     * @param booking booking
     * @param text text
     * @param type type
     * @param bookingAction bookingAction
     * @param isRecurring isRecurring
     * @param context context
     * @return text
     */
    private String addBookingText(final DataRecord booking, final String text, final String type,
            final String bookingAction, final boolean isRecurring,
            final EventHandlerContext context, final Locale locale) {
        final String rmpctTableName = HotelingConstants.RMPCT + HotelingConstants.DOT;
        final long pctId = booking.getInt(rmpctTableName + HotelingConstants.PCT_ID);
        final Date dateStart = booking.getDate(rmpctTableName + HotelingConstants.DATE_START);
        final Date dateEnd = booking.getDate(rmpctTableName + HotelingConstants.DATE_END);
        final int dayPartNum = booking.getInt(rmpctTableName + HotelingConstants.DAY_PART);
        final String dayPart =
                EventHandlerBase.getEnumFieldDisplayedValue(context, HotelingConstants.RMPCT,
                    HotelingConstants.DAY_PART, String.valueOf(dayPartNum));
        final int statusNum = booking.getInt(rmpctTableName + HotelingConstants.STATUS);
        String status =
                EventHandlerBase.getEnumFieldDisplayedValue(context, HotelingConstants.RMPCT,
                    HotelingConstants.STATUS, String.valueOf(statusNum));
        if (HotelingConstants.BOOKING_ACTION_APPROVED.equals(bookingAction)) {
            // @translatable
            status =
                    EventHandlerBase
                    .localizeString(context, locale, HotelingConstants.EMAIL_TEXT_APPROVE,
                        HotelingConstants.class.getName(), "");
        }

        String newText = text;

        if (isRecurring) {
            // @translatable
            newText =
                    newText
                    + EventHandlerBase.localizeString(context, locale,
                        HotelingConstants.EMAIL_TEXT_BOOKING,
                        HotelingConstants.class.getName(), "")
                        + HotelingConstants.EMAIL_TEXT_COLON + pctId
                        + HotelingConstants.EMAIL_TEXT_NEW_LINE;
        }
        // @translatable
        newText =
                newText
                + EventHandlerBase.localizeString(context, locale,
                    HotelingConstants.EMAIL_TEXT_START_DATE,
                    HotelingConstants.class.getName(), "")
                    + HotelingConstants.EMAIL_TEXT_COLON
                    + dateStart
                    + HotelingConstants.EMAIL_TEXT_NEW_LINE
                    + EventHandlerBase.localizeString(context, locale,
                        HotelingConstants.EMAIL_TEXT_END_DATE,
                        HotelingConstants.class.getName(), "")
                        + HotelingConstants.EMAIL_TEXT_COLON
                        + dateEnd
                        + HotelingConstants.EMAIL_TEXT_NEW_LINE
                        + EventHandlerBase.localizeString(context, locale,
                            HotelingConstants.EMAIL_TEXT_DAY_PART,
                            HotelingConstants.class.getName(), "")
                            + HotelingConstants.EMAIL_TEXT_COLON + dayPart
                            + HotelingConstants.EMAIL_TEXT_NEW_LINE;
        if (HotelingConstants.BOOKING_ACTION_APPROVED.equals(bookingAction)
                || HotelingConstants.BOOKING_ACTION_CREATE.equals(bookingAction)) {
            // @translatable
            newText =
                    newText
                    + EventHandlerBase.localizeString(context, locale,
                        HotelingConstants.STATUS, HotelingConstants.class.getName(), "")
                        + HotelingConstants.EMAIL_TEXT_COLON + status
                        + HotelingConstants.EMAIL_TEXT_NEW_LINE
                        + HotelingConstants.EMAIL_TEXT_BLANK
                        + HotelingConstants.EMAIL_TEXT_NEW_LINE;
        } else {
            newText =
                    newText + HotelingConstants.EMAIL_TEXT_NEW_LINE
                    + HotelingConstants.EMAIL_TEXT_BLANK
                    + HotelingConstants.EMAIL_TEXT_NEW_LINE;
        }
        if (HotelingConstants.NOTIFY_LIST_TYPE_APPROVER.equals(type) && statusNum == 0) {
            this.notifyService.setSendEmail(true);
        }
        return newText;
    }

    /**
     * add location text.
     *
     * @param locale the locale of the email
     * @param text text
     * @param context context
     * @param blId blId
     * @param flId flId
     * @param rmId rmId
     * @return text
     */
    private String addLocationText(final String text, final EventHandlerContext context,
            final Locale locale, final String blId, final String flId, final String rmId) {
        // @translatable
        final String newText =
                text
                + EventHandlerBase.localizeString(context, locale,
                    HotelingConstants.EMAIL_TEXT_LOCATION,
                    HotelingConstants.class.getName(), "")
                    + HotelingConstants.EMAIL_TEXT_COLON + blId
                    + HotelingConstants.EMAIL_TEXT_CONCAT + flId
                    + HotelingConstants.EMAIL_TEXT_CONCAT + rmId
                    + HotelingConstants.EMAIL_TEXT_NEW_LINE
                    + HotelingConstants.EMAIL_TEXT_BLANK
                    + HotelingConstants.EMAIL_TEXT_NEW_LINE;
        return newText;
    }

    /**
     * add employee or visitor text.
     *
     * @param locale the locale of the email content
     * @param text text
     * @param type type
     * @param context type
     * @param emId emId
     * @param visitorId visitorId
     * @return text
     */
    private String addEmployeeOrVisitorText(final String text, final String type,
            final EventHandlerContext context, final Locale locale, final String emId,
            final int visitorId) {
        String newText = "";
        if (HotelingConstants.NOTIFY_LIST_TYPE_EMPLOYEE.equals(type)
                || (!HotelingConstants.NOTIFY_LIST_TYPE_EMPLOYEE.equals(type) && visitorId < 0)) {
            // @translatable
            newText =
                    text
                    + EventHandlerBase.localizeString(context, locale,
                        HotelingConstants.EMAIL_TEXT_EMPLOYEE,
                        HotelingConstants.class.getName(), "")
                        + HotelingConstants.EMAIL_TEXT_COLON + emId
                        + HotelingConstants.EMAIL_TEXT_NEW_LINE;
        } else if (HotelingConstants.NOTIFY_LIST_TYPE_VISITOR.equals(type)
                || (!HotelingConstants.NOTIFY_LIST_TYPE_VISITOR.equals(type) && visitorId > 0)) {
            // @translatable
            final String visitorName = HotelingUtility.getVisitoNameById(visitorId);
            newText =
                    text
                    + EventHandlerBase.localizeString(context, locale,
                        HotelingConstants.EMAIL_TEXT_VISITOR,
                        HotelingConstants.class.getName(), "")
                        + HotelingConstants.EMAIL_TEXT_COLON + visitorName
                        + HotelingConstants.EMAIL_TEXT_NEW_LINE;
        }

        return newText;
    }

    /**
     * add parent booking text.
     *
     * @param locale the locale of the email content
     * @param text text
     * @param context context
     * @param parentPctId parentPctId
     * @return text
     */
    private String addParentBookingText(final String text, final EventHandlerContext context,
            final Locale locale, final int parentPctId) {
        // @translatable
        final String newText =
                text
                + HotelingConstants.EMAIL_TEXT_NEW_LINE
                + EventHandlerBase.localizeString(context, locale,
                    HotelingConstants.EMAIL_TEXT_PARENT_BOOKING,
                    HotelingConstants.class.getName(), "")
                    + HotelingConstants.EMAIL_TEXT_COLON + parentPctId
                    + HotelingConstants.EMAIL_TEXT_NEW_LINE;
        return newText;
    }

    /**
     * get subject.
     *
     * @param pctIdSubject pctIdSubject
     * @param dateSubject dateSubject
     * @param isRegular isRegular
     * @param isRecurring isRecurring
     * @param bookingAction bookingAction
     * @param recurringRule recurringRule
     * @return subject
     */
    private String getSubject(final String pctIdSubject, final String dateSubject,
            final boolean isRegular, final boolean isRecurring, final String bookingAction,
            final String recurringRule) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String pctIdSubject1 = pctIdSubject.substring(1);
        final String dateSubject1 = dateSubject.substring(1);

        // @translatable
        final String subjectRec1 =
                EventHandlerBase.localizeString(context,
                    HotelingConstants.EMAIL_TEXT_RECURRING_BOOKING,
                    HotelingConstants.class.getName());
        //
        // @translatable
        final String subjectRec2 =
                EventHandlerBase.localizeString(context, HotelingConstants.EMAIL_TEXT_STARTING_ON,
                    HotelingConstants.class.getName());
        final String subjectRec =
                subjectRec1 + HotelingConstants.EMAIL_TEXT_LEFT_BRACKET + pctIdSubject1
                + HotelingConstants.EMAIL_TEXT_RIGHT_BRACKET + subjectRec2
                + HotelingConstants.EMAIL_TEXT_LEFT_BRACKET + dateSubject1
                + HotelingConstants.EMAIL_TEXT_RIGHT_BRACKET;
        // @translatable
        final String subjectReg1 =
                EventHandlerBase
                .localizeString(context, HotelingConstants.EMAIL_TEXT_REGULAR_BOOKING,
                    HotelingConstants.class.getName());
        // @translatable
        final String subjectReg2 =
                EventHandlerBase.localizeString(context, HotelingConstants.EMAIL_TEXT_STARTING_ON,
                    HotelingConstants.class.getName());
        final String subjectReg =
                subjectReg1 + HotelingConstants.EMAIL_TEXT_LEFT_BRACKET + pctIdSubject1
                + HotelingConstants.EMAIL_TEXT_RIGHT_BRACKET + subjectReg2
                + HotelingConstants.EMAIL_TEXT_LEFT_BRACKET + dateSubject1
                + HotelingConstants.EMAIL_TEXT_RIGHT_BRACKET;
        // @translatable
        final String subjectALL1 =
                EventHandlerBase.localizeString(context,
                    HotelingConstants.EMAIL_TEXT_RECURRING_REGULAR_BOOKING,
                    HotelingConstants.class.getName());
        // @translatable
        final String subjectALL2 =
                EventHandlerBase.localizeString(context, HotelingConstants.EMAIL_TEXT_STARTING_ON,
                    HotelingConstants.class.getName());
        final String subjectALL =
                subjectALL1 + HotelingConstants.EMAIL_TEXT_LEFT_BRACKET + pctIdSubject1
                + HotelingConstants.EMAIL_TEXT_RIGHT_BRACKET + subjectALL2
                + HotelingConstants.EMAIL_TEXT_LEFT_BRACKET + dateSubject1
                + HotelingConstants.EMAIL_TEXT_RIGHT_BRACKET;

        String subject = "";
        // call from created
        if (HotelingConstants.BOOKING_ACTION_CREATE.equals(bookingAction)) {
            if (recurringRule.length() > 0) {
                subject = subjectRec;
            } else {
                subject = subjectReg;
            }
        } else {
            // call from other,cancel ,reject
            if (isRegular && isRecurring) {
                subject = subjectALL;
            } else if (isRegular && !isRecurring) {
                subject = subjectReg;
            } else {
                subject = subjectRec;
            }
        }
        return subject;
    }

    /**
     * get pct set.
     *
     * @param bookingsList bookingsList
     * @return pct set
     */
    private java.util.Set<Integer> getPctSet(final List<DataRecord> bookingsList) {
        final java.util.Set<Integer> set = new java.util.HashSet<Integer>();
        for (int m = 0; m < bookingsList.size(); m++) {
            final DataRecord os1 = bookingsList.get(m);
            os1.getValue(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.PARENT_PCT_ID);
            final int parentPctId =
                    os1.getInt(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.PARENT_PCT_ID);
            if (!set.contains(parentPctId)) {
                set.add(parentPctId);
            }
        }
        return set;
    }

    /**
     * get url address.
     *
     * @param context context
     * @param bookingsApprovesList bookingsApprovesList
     * @param bookingAction bookingAction
     * @return url address
     */
    private String getUrlAddress(final EventHandlerContext context,
            final List<DataRecord> bookingsApprovesList, final String bookingAction) {
        String url = "";
        if (bookingsApprovesList != null
                && HotelingConstants.BOOKING_ACTION_CREATE.equals(bookingAction)) {
            url =
                    "<a  href=\""
                            + EventHandlerBase.getWebCentralPath(context)
                            + "/schema/ab-products/workplace/hoteling/views/ab-ht-booking-approve.axvw\">"
                            + getWebCentralPath(context)
                            + "/schema/ab-products/workplace/hoteling/views/ab-ht-booking-approve.axvw</a>";

        } else {
            url =
                    "<a href=\""
                            + getWebCentralPath(context)
                            + "/schema/ab-products/workplace/hoteling/views/ab-ht-booking-review.axvw\">"
                            + getWebCentralPath(context)
                            + "/schema/ab-products/workplace/hoteling/views/ab-ht-booking-review.axvw"
                            + "</a>";
        }
        return url;
    }
}
