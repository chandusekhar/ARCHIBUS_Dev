package com.archibus.eventhandler.hoteling;

import java.text.SimpleDateFormat;
import java.util.*;

import org.json.JSONObject;

import com.archibus.config.Project;
import com.archibus.context.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.security.UserAccount;
import com.archibus.utility.*;

/**
 * Service class for Hoteling notification.
 * <p>
 *
 * @author Guo
 * @since 20.3
 */
public class HotelingNotifyService extends EventHandlerBase {
    
    /**
     * schedule notify subject.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_SUBJECT = "Your pending Hotel bookings";
    
    /**
     * schedule notify body text.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_BODY_TEXT =
            "The following Hotel booking is pending approval, but the approval window has expired.  Please review it.";
    
    /**
     * the file path of booking review.
     */
    private static final String BOOKING_REVIEW_FILE_PATH =
            "/schema/ab-products/workplace/hoteling/views/ab-ht-booking-review.axvw";
    
    /**
     * schedule notify text booking id.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_BOOKING_ID = "Booking ID";
    
    /**
     * schedule notify text employee.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_EMPLOYEE = "Employee";
    
    /**
     * schedule notify text location.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_LOCATION = "Location";
    
    /**
     * schedule notify text start date.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_START_DATE = "Start Date";
    
    /**
     * schedule notify text end date.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_END_DATE = "End Date";
    
    /**
     * schedule notify text day part.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_DAY_PART = "Day Part";
    
    /**
     * schedule notify text status.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_STATUS = HotelingConstants.STATUS;
    
    /**
     * schedule notify text - row text.
     */
    private static final String SCHEDULE_NOTIFY_ROW_TEXT =
            "<tr><td>{0}</td><td>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td><td>{5}</td><td>{6}</td></tr>";
    
    /**
     * schedule notify body td element start.
     */
    private static final String SCHEDULE_NOTIFY_BODY_TD_START = "<td width=\"150\">";
    
    /**
     * schedule notify body td element end.
     */
    private static final String SCHEDULE_NOTIFY_BODY_TD_END = "</td>";
    
    /**
     * flag of send email.
     */
    private boolean sendEmail;
    
    /**
     * Simple date formatter to format date.
     */
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH);
    
    /**
     * Getter for the isSendEmail property.
     *
     * @see isSendEmail
     * @return the isSendEmail property.
     */
    public boolean isSendEmail() {
        return this.sendEmail;
    }
    
    /**
     * Setter for the isSendEmail property.
     *
     * @param isSend isSend
     */
    
    public void setSendEmail(final boolean isSend) {
        this.sendEmail = isSend;
    }
    
    /**
     * add parameters to context response for notify.
     *
     */
    public void addParametertoContextForNotify() {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter(HotelingConstants.EMPLOYEE_LIST, new ArrayList<String>());
        context.addInputParameter(HotelingConstants.VISITOR_LIST, new ArrayList<String>());
        context.addInputParameter(HotelingConstants.APPROVER_LIST, new ArrayList<String>());
        context.addInputParameter(HotelingConstants.EMPLOYEE_MAP,
            new TreeMap<String, List<DataRecord>>());
        context.addInputParameter(HotelingConstants.VISITOR_MAP,
            new TreeMap<String, List<DataRecord>>());
        context.addInputParameter(HotelingConstants.APPROVER_MAP,
            new TreeMap<String, List<DataRecord>>());
    }
    
    /**
     * This method will prepare needed information for following email notification according to
     * activity's parameter 'SendEmailToOccupiers'.
     *
     * @param booking booking
     * @param bookingsList bookingsList
     */
    public void prepareEmailNotificationList(final JSONObject booking,
            final List<DataRecord> bookingsList) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final String emId =
                booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.EM_ID);
        final String dvId =
                booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.DV_ID);
        final String dpId =
                booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.DP_ID);
        String visitorId = null;
        if (booking.has(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.VISITOR_ID)) {
            visitorId =
                    booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.VISITOR_ID);
        }
        
        final List<String> employeesList =
                (List<String>) context.getParameter(HotelingConstants.EMPLOYEE_LIST);
        final List<String> visitorsList =
                (List<String>) context.getParameter(HotelingConstants.VISITOR_LIST);
        final List<String> approvesList =
                (List<String>) context.getParameter(HotelingConstants.APPROVER_LIST);
        
        final TreeMap<String, List<DataRecord>> notifyEmployeesMap =
                (TreeMap<String, List<DataRecord>>) context
                    .getParameter(HotelingConstants.EMPLOYEE_MAP);
        final TreeMap<String, List<DataRecord>> notifyVisitorsMap =
                (TreeMap<String, List<DataRecord>>) context
                    .getParameter(HotelingConstants.VISITOR_MAP);
        final TreeMap<String, List<DataRecord>> approvesMap =
                (TreeMap<String, List<DataRecord>>) context
                    .getParameter(HotelingConstants.APPROVER_MAP);
        
        if (HotelingConstants.YES.equalsIgnoreCase(EventHandlerBase.getActivityParameterString(
            context, HotelingConstants.AB_SPACE_HOTELLING,
            HotelingConstants.SEND_EMAIL_TO_OCCUPIERS))) {
            if (StringUtil.notNullOrEmpty(visitorId)) {
                addNotifyList(visitorId, visitorsList, bookingsList, notifyVisitorsMap);
            } else {
                if (StringUtil.notNullOrEmpty(emId)) {
                    addNotifyList(emId, employeesList, bookingsList, notifyEmployeesMap);
                }
            }
        }
        if (HotelingConstants.YES.equalsIgnoreCase(EventHandlerBase.getActivityParameterString(
            context, HotelingConstants.AB_SPACE_HOTELLING,
            HotelingConstants.SEND_EMAIL_TO_APPROVERS))) {
            final String approver = HotelingUtility.getDepartManagerByDpId(dvId, dpId);
            if (StringUtil.notNullOrEmpty(approver)) {
                addNotifyList(approver, approvesList, bookingsList, approvesMap);
            }
        }
        
    }
    
    /**
     * add notify list.
     *
     * @param name name
     * @param notifyList notifyList
     * @param bookingsList bookingsList
     * @param notifyMap notifyMap
     */
    private static void addNotifyList(final String name, final List<String> notifyList,
            final List<DataRecord> bookingsList, final Map<String, List<DataRecord>> notifyMap) {
        if (notifyList.contains(name)) {
            final List<DataRecord> bookingsList1 = notifyMap.get(name);
            bookingsList1.addAll(bookingsList);
            notifyMap.put(name, bookingsList1);
        } else {
            notifyMap.put(name, bookingsList);
            notifyList.add(name);
        }
    }
    
    /**
     * send notification.
     *
     * @param bookingAction bookingAction can be set "create",cancel,approve,reject
     * @param recurringRule recurringRule
     */
    public void sendNotification(final String bookingAction, final String recurringRule) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (HotelingConstants.YES.equalsIgnoreCase(EventHandlerBase.getActivityParameterString(
            context, HotelingConstants.AB_SPACE_HOTELLING,
            HotelingConstants.SEND_EMAIL_TO_OCCUPIERS))) {
            String emId = "";
            final TreeMap<String, List<DataRecord>> notifyEmployeesMap =
                    (TreeMap<String, List<DataRecord>>) context
                        .getParameter(HotelingConstants.EMPLOYEE_MAP);
            if (notifyEmployeesMap != null) {
                final Iterator<Map.Entry<String, List<DataRecord>>> itEm =
                        notifyEmployeesMap.entrySet().iterator();
                while (itEm.hasNext()) {
                    final Map.Entry<String, List<DataRecord>> enterEm = itEm.next();
                    emId = enterEm.getKey();
                    final List<DataRecord> bookingsList = enterEm.getValue();
                    final TreeMap<String, String> mailText =
                            (TreeMap<String, String>) new HotelingNotifyText(this).getEmailText(
                                bookingsList, emId, null, null, bookingAction, recurringRule);
                    final Iterator<Map.Entry<String, String>> mailTextIt =
                            mailText.entrySet().iterator();
                    final Map.Entry<String, String> mailTextEnter = mailTextIt.next();
                    final String subject = mailTextEnter.getKey();
                    final String text = mailTextEnter.getValue();
                    
                    sendEmailToEmployee(context, emId, subject, text);
                    
                }
            }
            
            final TreeMap<String, List<DataRecord>> notifyVisitorsMap =
                    (TreeMap<String, List<DataRecord>>) context
                        .getParameter(HotelingConstants.VISITOR_MAP);
            if (notifyVisitorsMap != null) {
                final Iterator<Map.Entry<String, List<DataRecord>>> itVistor =
                        notifyVisitorsMap.entrySet().iterator();
                while (itVistor.hasNext()) {
                    final Map.Entry<String, List<DataRecord>> enterVisitor = itVistor.next();
                    final List<DataRecord> bookingsList = enterVisitor.getValue();
                    // call getEmailText for visitor
                    final TreeMap<String, String> mailText =
                            (TreeMap<String, String>) new HotelingNotifyText(this).getEmailText(
                                null, null, bookingsList, null, bookingAction, recurringRule);
                    final Iterator<Map.Entry<String, String>> mailTextIt =
                            mailText.entrySet().iterator();
                    final Map.Entry<String, String> mailTextEnter = mailTextIt.next();
                    final String subject = mailTextEnter.getKey();
                    final String text = mailTextEnter.getValue();
                    
                    sendEmailToVisitor(context, enterVisitor.getKey(), subject, text);
                    
                }
                
            }
        }
        
        if (HotelingConstants.YES.equalsIgnoreCase(EventHandlerBase.getActivityParameterString(
            context, HotelingConstants.AB_SPACE_HOTELLING,
            HotelingConstants.SEND_EMAIL_TO_APPROVERS))) {
            String approveId = "";
            final TreeMap<String, List<DataRecord>> approvesMap =
                    (TreeMap<String, List<DataRecord>>) context
                        .getParameter(HotelingConstants.APPROVER_MAP);
            if (approvesMap != null) {
                final Iterator<Map.Entry<String, List<DataRecord>>> itApprove =
                        approvesMap.entrySet().iterator();
                while (itApprove.hasNext()) {
                    final Map.Entry<String, List<DataRecord>> enterApprove = itApprove.next();
                    approveId = enterApprove.getKey();
                    final List<DataRecord> bookingsList = enterApprove.getValue();
                    final TreeMap<String, String> mailText =
                            (TreeMap<String, String>) new HotelingNotifyText(this).getEmailText(
                                null, approveId, null, bookingsList, bookingAction, recurringRule);
                    final Iterator<Map.Entry<String, String>> mailTextIt =
                            mailText.entrySet().iterator();
                    final Map.Entry<String, String> mailTextEnter = mailTextIt.next();
                    final String subject = mailTextEnter.getKey();
                    final String text = mailTextEnter.getValue();
                    
                    sendEmailToApprover(bookingAction, context, approveId, subject, text);
                }
            }
        }
    }
    
    /**
     * send email to approver.
     *
     * @param bookingAction bookingAction
     * @param context context
     * @param approveId approveId
     * @param subject subject
     * @param text text
     */
    private void sendEmailToApprover(final String bookingAction, final EventHandlerContext context,
            final String approveId, final String subject, final String text) {
        if (approveId.length() > 0) {
            final String email =
                    EventHandlerBase.getEmailAddress(context, HotelingConstants.T_EM,
                        HotelingConstants.EM_ID, approveId);
            if (StringUtil.notNullOrEmpty(email) && this.sendEmail
                    && bookingAction.equals(HotelingConstants.BOOKING_ACTION_CREATE)) {
                this.sendEmail = false;
                this.sendSubNotifyEmail(email, subject, text);
            }
            
        }
    }
    
    /**
     * send email to visitor.
     *
     * @param context context
     * @param visitorId visitorId
     * @param subject subject
     * @param text text
     */
    private void sendEmailToVisitor(final EventHandlerContext context, final String visitorId,
            final String subject, final String text) {
        if (visitorId.length() > 0) {
            final String email =
                    EventHandlerBase.getEmailAddress(context, HotelingConstants.VISITORS,
                        HotelingConstants.VISITOR_ID, visitorId);
            if (StringUtil.notNullOrEmpty(email)) {
                this.sendSubNotifyEmail(email, subject, text);
            }
        }
        
    }
    
    /**
     * send email to employee.
     *
     * @param context context
     * @param emId emId
     * @param subject subject
     * @param text text
     */
    private void sendEmailToEmployee(final EventHandlerContext context, final String emId,
            final String subject, final String text) {
        if (emId.length() > 0) {
            final String email =
                    EventHandlerBase.getEmailAddress(context, HotelingConstants.T_EM,
                        HotelingConstants.EM_ID, emId);
            if (StringUtil.notNullOrEmpty(email)) {
                this.sendSubNotifyEmail(email, subject, text);
            }
        }
        
    }
    
    /**
     * send sub notify email.
     *
     * @param email email
     * @param subject subject
     * @param text text
     */
    public void sendSubNotifyEmail(final String email, final String subject, final String text) {
        final MailMessage message = new MailMessage();
        message.setActivityId(HotelingConstants.AB_SPACE_HOTELLING);
        message.setContentType("text/html; charset=UTF-8");
        message.setTo(email);
        message.setSubject(subject);
        message.setText(text);
        
        final MailSender sender = new MailSender();
        sender.send(message);
    }
    
    /**
     * notify user when approval expired.
     *
     * @param context the event context
     * @param bookingList bookingList
     * @param user user
     */
    public void notityUserApprovalExpired(final EventHandlerContext context,
            final List<Map<String, Object>> bookingList, final String user) {
        
        Locale languageLocale = null;
        final UserAccount.Immutable userAccount =
                ContextStore.get().getProject().findUserAccount(user);
        languageLocale = userAccount == null ? Locale.getDefault() : userAccount.getLocale();
        
        String body = "";
        for (final Map<String, Object> element : bookingList) {
            body = body + this.processRecord(context, languageLocale, element, false);
        }

        final String contentHeader =
                EventHandlerBase.localizeString(context, languageLocale,
                    HotelingNotifyService.SCHEDULE_NOTIFY_BODY_TEXT,
                    HotelingNotifyService.class.getName(), "");

        body = this.addHtmlHeader(context, languageLocale, body, contentHeader);
        
        final String email = this.getUserEmailAddress(context, user);
        if (StringUtil.notNullOrEmpty(email)) {
            final String localizedSubject =
                    EventHandlerBase.localizeString(context, languageLocale,
                        HotelingNotifyService.SCHEDULE_NOTIFY_SUBJECT,
                        HotelingNotifyService.class.getName(), "");
            sendSubNotifyEmail(email, localizedSubject, body);
        }
    }
    
    /**
     * notifyUserToConfirmBookings.
     *
     * @param context the event handler context.
     * @param records all the records needed confirming
     */
    public void notifyUserToConfirmBookings(final EventHandlerContext context,
            final List<Map<String, Object>> records) {
        for (final Map<String, Object> record : records) {
            String user = "";
            if (record.get(HotelingConstants.EM_ID) != null) {
                user = (String) record.get(HotelingConstants.EM_ID);
            }
            
            Locale emailLocal = null;
            UserAccount.Immutable userAccount = null;
            final Context userContext = ContextStore.get();
            if (userContext != null) {
                final Project.Immutable project = userContext.getProject();
                if (project != null) {
                    userAccount = project.findUserAccount(user);
                }
            }
            
            emailLocal = userAccount == null ? Locale.getDefault() : userAccount.getLocale();

            final String body = this.processConfirmBookingContent(context, emailLocal, record);
            final String email =
                    getEmailAddress(context, HotelingConstants.T_EM, HotelingConstants.EM_ID, user);
            
            if (StringUtil.notNullOrEmpty(email)) {
                
                // @translatable
                final String title =
                        EventHandlerBase.localizeString(context, emailLocal,
                            HotelingConstants.SCHEDULE_NOTIFY_BOOKING_TITLE,
                            HotelingConstants.class.getName(), "");
                
                sendSubNotifyEmail(email, title, body);
            }
        }
    }
    
    /**
     * transfer the booking record to email content.
     *
     * @param locale the receiver's locale.
     * @param context the event handler context
     * @param bookingRecord the record to parse
     * @return the email content
     */
    private String processConfirmBookingContent(final EventHandlerContext context,
            final Locale locale, final Map<String, Object> bookingRecord) {
        final String detail = this.appendBookingNotifyEmailBody(context, locale, bookingRecord);
        final String emailBody = this.appendBookingNotifyEmailLink(detail, context);
        
        final String bookingNotifyBody =
                EventHandlerBase.localizeString(context, locale,
                    HotelingConstants.BOOKING_NOTIFY_BODY_TEXT, HotelingConstants.class.getName(),
                    "");
        
        return prepareMessage(context, bookingNotifyBody + "{0}", new String[] { emailBody });
    }

    /**
     *
     * format the booking record using a html email style.
     *
     * @param locale the receiver's locale.
     * @param currentContext the event handler context.
     * @param bookingRecord the booking record
     * @return the detail of the booking record
     */
    private String appendBookingNotifyEmailBody(final EventHandlerContext currentContext,
            final Locale locale, final Map<String, Object> bookingRecord) {
        final StringBuilder detailBuilder = new StringBuilder();

        final String bookingId =
                EventHandlerBase.localizeString(currentContext, locale,
                    HotelingConstants.EMAIL_BOOKING_ID_TEXT, HotelingConstants.class.getName(), "");
        
        detailBuilder.append(bookingId);
        detailBuilder.append(HotelingConstants.EMAIL_TEXT_COLON);
        detailBuilder.append(bookingRecord.get(HotelingConstants.PCT_ID));
        detailBuilder.append(HotelingConstants.HTML_NEW_LINE);

        final String bookingUser =
                EventHandlerBase.localizeString(currentContext, locale,
                    HotelingConstants.EMAIL_BOOKING_USER_TEXT, HotelingConstants.class.getName(),
                    "");

        detailBuilder.append(bookingUser);
        detailBuilder.append(HotelingConstants.EMAIL_TEXT_COLON);
        detailBuilder.append(bookingRecord.get(HotelingConstants.EM_ID));
        detailBuilder.append(HotelingConstants.HTML_NEW_LINE);

        final String bookingLocation =
                EventHandlerBase.localizeString(currentContext, locale,
                    HotelingConstants.EMAIL_BOOKING_LOCATION_TEXT,
                    HotelingConstants.class.getName(), "");
        
        detailBuilder.append(bookingLocation);
        detailBuilder.append(HotelingConstants.EMAIL_TEXT_COLON);
        detailBuilder.append(bookingRecord.get(HotelingConstants.BL_ID));
        detailBuilder.append(HotelingConstants.EMAIL_TEXT_CONCAT);
        detailBuilder.append(bookingRecord.get(HotelingConstants.FL_ID));
        detailBuilder.append(HotelingConstants.EMAIL_TEXT_CONCAT);
        detailBuilder.append(bookingRecord.get(HotelingConstants.RM_ID));
        detailBuilder.append(HotelingConstants.HTML_NEW_LINE);

        final Date startDate =
                getDateValue(currentContext, bookingRecord.get(HotelingConstants.DATE_START));
        final Date endDate =
                getDateValue(currentContext, bookingRecord.get(HotelingConstants.DATE_END));

        final String dayPart =
                getEnumFieldDisplayedValue(currentContext, HotelingConstants.RMPCT,
                    HotelingConstants.DAY_PART,
                    getIntegerValue(currentContext, bookingRecord.get(HotelingConstants.DAY_PART))
                    .toString());
        final String status =
                getEnumFieldDisplayedValue(currentContext, HotelingConstants.RMPCT,
                    HotelingConstants.STATUS,
                    getIntegerValue(currentContext, bookingRecord.get(HotelingConstants.STATUS))
                    .toString());

        final String localeStartDate =
                EventHandlerBase.localizeString(currentContext, locale,
                    HotelingConstants.EMAIL_TEXT_START_DATE, HotelingConstants.class.getName(), "");
        detailBuilder.append(localeStartDate);
        detailBuilder.append(HotelingConstants.EMAIL_TEXT_COLON);
        detailBuilder.append(this.dateFormat.format(startDate));
        detailBuilder.append(HotelingConstants.HTML_NEW_LINE);

        final String localeEndDate =
                EventHandlerBase.localizeString(currentContext, locale,
                    HotelingConstants.EMAIL_TEXT_END_DATE, HotelingConstants.class.getName(), "");
        detailBuilder.append(localeEndDate);
        detailBuilder.append(HotelingConstants.EMAIL_TEXT_COLON);
        detailBuilder.append(this.dateFormat.format(endDate));
        detailBuilder.append(HotelingConstants.HTML_NEW_LINE);

        final String localeDayPart =
                EventHandlerBase.localizeString(currentContext, locale,
                    HotelingConstants.EMAIL_TEXT_DAY_PART, HotelingConstants.class.getName(), "");
        detailBuilder.append(localeDayPart);
        detailBuilder.append(HotelingConstants.EMAIL_TEXT_COLON);
        detailBuilder.append(dayPart);
        detailBuilder.append(HotelingConstants.HTML_NEW_LINE);

        final String bookingStatus =
                EventHandlerBase.localizeString(currentContext, locale,
                    HotelingConstants.EMAIL_BOOKING_STATUS_TEXT, HotelingConstants.class.getName(),
                    "");

        detailBuilder.append(bookingStatus);
        detailBuilder.append(HotelingConstants.EMAIL_TEXT_COLON);
        detailBuilder.append(status);
        detailBuilder.append(HotelingConstants.HTML_NEW_LINE);

        return detailBuilder.toString();
    }

    /**
     *
     * add link for the booking record to confirm.
     *
     * @param detail the detail info of the record string.
     * @param context the execution context.
     * @return the formatted detail info.
     */
    private String appendBookingNotifyEmailLink(final String detail,
            final EventHandlerContext context) {
        final StringBuilder bodyBuilder = new StringBuilder();
        bodyBuilder
            .append("<html><body style = \"font-family:Arial;color=blue;font-size:12px;\"><a href=\"");
        bodyBuilder.append(getWebCentralPath(context));
        bodyBuilder.append(BOOKING_REVIEW_FILE_PATH);
        bodyBuilder.append("\">");
        bodyBuilder.append(getWebCentralPath(context));
        bodyBuilder.append(BOOKING_REVIEW_FILE_PATH);
        bodyBuilder.append("</a>");
        bodyBuilder.append("<p>");
        bodyBuilder.append(detail);
        bodyBuilder.append("</p></body></html>");
        return bodyBuilder.toString();
    }
    
    /**
     *
     * process a single record.
     *
     * @param locale the locale of the email receiver
     * @param context the event context.
     * @param record the single record to process.
     * @param needAddHeader if need to add a html header.
     * @return the formatted message.
     */
    private String processRecord(final EventHandlerContext context, final Locale locale,
            final Map<String, Object> record, final boolean needAddHeader) {
        final String pctId =
                getIntegerValue(context, record.get(HotelingConstants.PCT_ID)).toString();
        String user = "";
        if (record.get(HotelingConstants.EM_ID) != null) {
            user = (String) record.get(HotelingConstants.EM_ID);
        }
        
        final String location =
                (String) record.get(HotelingConstants.BL_ID) + HotelingConstants.EMAIL_TEXT_CONCAT
                        + (String) record.get(HotelingConstants.FL_ID)
                        + HotelingConstants.EMAIL_TEXT_CONCAT
                        + (String) record.get(HotelingConstants.RM_ID);
        final Date startDate = getDateValue(context, record.get(HotelingConstants.DATE_START));
        final Date endDate = getDateValue(context, record.get(HotelingConstants.DATE_END));
        final String dayPart =
                getEnumFieldDisplayedValue(context, HotelingConstants.RMPCT,
                    HotelingConstants.DAY_PART,
                    getIntegerValue(context, record.get(HotelingConstants.DAY_PART)).toString());
        final String status =
                getEnumFieldDisplayedValue(context, HotelingConstants.RMPCT,
                    HotelingConstants.STATUS,
                    getIntegerValue(context, record.get(HotelingConstants.STATUS)).toString());
        final Object[] args =
                new Object[] { pctId, user, location, this.dateFormat.format(startDate),
                        this.dateFormat.format(endDate), dayPart, status };
        String body = prepareMessage(context, SCHEDULE_NOTIFY_ROW_TEXT, args);
        if (needAddHeader) {
            body =
                    this.addHtmlHeader(context, locale, body,
                        HotelingConstants.BOOKING_NOTIFY_BODY_TEXT);
        }
        return body;
    }
    
    /**
     *
     * addd html header to a string.
     *
     * @param locale the locale of the email
     * @param context the event context
     * @param original the original string.
     * @param bodyText the body text of the email.
     * @return the string added to a html header.
     */
    private String addHtmlHeader(final EventHandlerContext context, final Locale locale,
            final String original, final String bodyText) {
        return "<html><body style = \"font-family:Arial;color=blue;font-size:12px;\">"
                + "<p style = \"font-family:Arial;color=blue;font-size:12px;\">"
                + bodyText
                + "</p>"
                + "<table style=\"font-family:Arial;color=blue;font-size:12px;\" border=\"1px\">"
                + "<tr>"
                + SCHEDULE_NOTIFY_BODY_TD_START
                + EventHandlerBase.localizeString(context, locale, SCHEDULE_NOTIFY_TEXT_BOOKING_ID,
                    this.getClass().getName(), "")
                + SCHEDULE_NOTIFY_BODY_TD_END
                + SCHEDULE_NOTIFY_BODY_TD_START
                + EventHandlerBase.localizeString(context, locale, SCHEDULE_NOTIFY_TEXT_EMPLOYEE,
                    this.getClass().getName(), "")
                + SCHEDULE_NOTIFY_BODY_TD_END
                + SCHEDULE_NOTIFY_BODY_TD_START
                + EventHandlerBase.localizeString(context, locale, SCHEDULE_NOTIFY_TEXT_LOCATION,
                    this.getClass().getName(), "")
                + SCHEDULE_NOTIFY_BODY_TD_END
                + SCHEDULE_NOTIFY_BODY_TD_START
                + EventHandlerBase.localizeString(context, locale, SCHEDULE_NOTIFY_TEXT_START_DATE,
                    this.getClass().getName(), "")
                + SCHEDULE_NOTIFY_BODY_TD_END
                + SCHEDULE_NOTIFY_BODY_TD_START
                + EventHandlerBase.localizeString(context, locale, SCHEDULE_NOTIFY_TEXT_END_DATE,
                    this.getClass().getName(), "")
                + SCHEDULE_NOTIFY_BODY_TD_END
                + SCHEDULE_NOTIFY_BODY_TD_START
                + EventHandlerBase.localizeString(context, locale, SCHEDULE_NOTIFY_TEXT_DAY_PART,
                    this.getClass().getName(), "")
                + SCHEDULE_NOTIFY_BODY_TD_END
                + SCHEDULE_NOTIFY_BODY_TD_START
                + EventHandlerBase.localizeString(context, locale, SCHEDULE_NOTIFY_TEXT_STATUS,
                    this.getClass().getName(), "")
                + SCHEDULE_NOTIFY_BODY_TD_END
                + "</tr>"
                + original
                + "</table>"
                + "<br><br>"
                + "<a href=\""
                + getWebCentralPath(context)
                + "/schema/ab-products/workplace/hoteling/views/ab-ht-booking-review.axvw\">"
                + getWebCentralPath(context)
                + "/schema/ab-products/workplace/hoteling/views/ab-ht-booking-review.axvw</a>"
                + "</body></html>";
    }
    
    /**
     * getUserEmailAddress.
     *
     * @param context the event handler context.
     * @param username the username of the employee.
     * @return the email address of the user.
     */
    private String getUserEmailAddress(final EventHandlerContext context, final String username) {
        return getEmailAddress(context, "afm_users", "user_name", username);
    }
}
