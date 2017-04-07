package com.archibus.app.solution.common.security.providers.dao;

import java.text.MessageFormat;
import java.util.*;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.authentication.dao.SaltSource;
import org.springframework.security.core.userdetails.*;
import org.springframework.util.Assert;

import com.archibus.config.*;
import com.archibus.context.*;
import com.archibus.context.Context;
import com.archibus.context.utility.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.security.*;
import com.archibus.security.providers.dao.PasswordManager;
import com.archibus.utility.*;

/**
 * Password management methods. Used in PasswordManagerHandler and SecurityServiceImpl.
 *
 * @author Valery Tydykov
 *
 */
public class PasswordManagerImpl implements PasswordManager, InitializingBean {
    private static final String ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION = "AbSystemAdministration";

    private static final String REFERENCED_BY_PASSWORD_MANAGER_IMPL = "PASSWORDMANAGERIMPL";

    private static final String SEND_FORGOTTEN_PASSWORD_BODY = "SEND_FORGOTTEN_PASSWORD_BODY";

    private static final String SEND_FORGOTTEN_PASSWORD_SUBJECT = "SEND_FORGOTTEN_PASSWORD_SUBJECT";

    private static final String SEND_NEW_PASSWORD_BODY = "SEND_NEW_PASSWORD_BODY";

    private static final String SEND_NEW_PASSWORD_SUBJECT = "SEND_NEW_PASSWORD_SUBJECT";

    private static final String SEND_REQUEST_NEW_PASSWORD_BODY = "SEND_REQUEST_NEW_PASSWORD_BODY";

    private static final String SEND_REQUEST_NEW_PASSWORD_SUBJECT =
            "SEND_REQUEST_NEW_PASSWORD_SUBJECT";

    private static final String SEND_TEMPORARY_PASSWORD_BODY = "SEND_TEMPORARY_PASSWORD_BODY";

    private static final String SEND_TEMPORARY_PASSWORD_SUBJECT = "SEND_TEMPORARY_PASSWORD_SUBJECT";

    private static final String TEXT_PLAIN_CHARSET_UTF_8 = "text/plain; charset=UTF-8";

    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    // optional
    private ConfigManager.Immutable configManager;

    // TODO EmailSender is prototype-scoped
    // optional
    private MailSender mailSender;

    // optional
    private MessagesDao messagesDao;

    private org.springframework.security.authentication.encoding.PasswordEncoder passwordEncoder;

    // optional
    private PasswordGenerator passwordGenerator;

    /**
     * Property: passwordPatternValidator. Validates generated temporary password in .
     */
    private PasswordPatternValidator passwordPatternValidator;

    // optional
    private PasswordPolicy passwordPolicy;

    // optional
    private SaltSource saltSource;

    // optional
    private Session session;

    // optional
    private int temporaryPasswordExpirationPeriod = 5;

    private UserDetailsService userDetailsService;

    /**
     * Formats text message.
     *
     * @param message Text message to be formatted.
     * @param args Array of objects to be injected into formatted message.
     * @return Formatted message.
     */
    public static String formatMessage(final String message, final Object[] args,
            final Locale locale) {
        // TODO move to helper class
        final MessageFormat formatter = new MessageFormat(message);
        formatter.setLocale(locale);

        return formatter.format(args);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.userDetailsService, "userDetailsService must be set");
    }

    @Override
    public void encryptPassword(final String userId) throws ExceptionBase {
        // TODO add authorization: only user in role SYSTEM ADMIN can invoke this method.

        if (this.logger.isInfoEnabled()) {
            this.logger.info("encryptPassword for username=[" + userId + "]");
        }

        Assert.notNull(this.getPasswordEncoder(), "PasswordEncoder must be set");

        final UserDetailsImpl userDetails =
                (UserDetailsImpl) this.getUserDetailsService().loadUserByUsername(userId);
        final UserAccount.ThreadSafe userAccount =
                (UserAccount.ThreadSafe) userDetails.getUserAccount();

        // get clear text password
        final String password = userAccount.getPassword();

        // encode password
        // get salt
        Object salt = null;
        if (this.saltSource != null) {
            salt = this.saltSource.getSalt(userDetails);
        }

        final String newPasswordEncoded = this.getPasswordEncoder().encodePassword(password, salt);

        // Update password in user account. Do not update userAccount.datePasswordChanged.
        userAccount.setPassword(newPasswordEncoded);
        userAccount.setPasswordChanged(true);

        // save
        UserAccountLoaderImpl.saveUserAccount(userAccount);
    }

    /**
     * Getter for the configManager property.
     *
     * @see configManager
     * @return the configManager property.
     */
    public ConfigManager.Immutable getConfigManager() {
        return this.configManager;
    }

    /**
     * Getter for the mailSender property.
     *
     * @see mailSender
     * @return the mailSender property.
     */
    public MailSender getMailSender() {
        return this.mailSender;
    }

    /**
     * Getter for the messagesDao property.
     *
     * @see messagesDao
     * @return the messagesDao property.
     */
    public MessagesDao getMessagesDao() {
        return this.messagesDao;
    }

    /**
     * Getter for the passwordEncoder property.
     *
     * @see passwordEncoder
     * @return the passwordEncoder property.
     */
    public org.springframework.security.authentication.encoding.PasswordEncoder getPasswordEncoder() {
        return this.passwordEncoder;
    }

    /**
     * Getter for the passwordGenerator property.
     *
     * @see passwordGenerator
     * @return the passwordGenerator property.
     */
    public PasswordGenerator getPasswordGenerator() {
        return this.passwordGenerator;
    }

    /**
     * Getter for the passwordPatternValidator property.
     *
     * @see passwordPatternValidator
     * @return the passwordPatternValidator property.
     */
    public PasswordPatternValidator getPasswordPatternValidator() {
        return this.passwordPatternValidator;
    }

    /**
     * Getter for the passwordPolicy property.
     *
     * @see passwordPolicy
     * @return the passwordPolicy property.
     */
    public PasswordPolicy getPasswordPolicy() {
        return this.passwordPolicy;
    }

    /**
     * Getter for the saltSource property.
     *
     * @see saltSource
     * @return the saltSource property.
     */
    public SaltSource getSaltSource() {
        return this.saltSource;
    }

    /**
     * Getter for the session property.
     *
     * @see session
     * @return the session property.
     */
    public Session getSession() {
        return this.session;
    }

    /**
     * Getter for the temporaryPasswordExpirationPeriod property.
     *
     * @see temporaryPasswordExpirationPeriod
     * @return the temporaryPasswordExpirationPeriod property.
     */
    public int getTemporaryPasswordExpirationPeriod() {
        return this.temporaryPasswordExpirationPeriod;
    }

    /**
     * Getter for the userDetailsService property.
     *
     * @see userDetailsService
     * @return the userDetailsService property.
     */
    public UserDetailsService getUserDetailsService() {
        return this.userDetailsService;
    }

    /**
     * Localizes text message.
     *
     * @param message Text message.
     * @return Localized text message.
     */
    public String localizeString(final ConfigManager.Immutable configManager, final String message,
            final Locale locale) {
        // TODO move to helper class
        final boolean translatablePrefix =
                StringUtil.toBoolean(configManager.getAttribute(Utility.XPATH_TRANSLATABLE_PREFIX));

        final String localizedMessage = configManager.loadLocalizedString(this.getClass().getName(),
            "", message, locale, translatablePrefix);

        if (this.logger.isDebugEnabled()) {
            this.logger.debug("localizedMessage=[" + localizedMessage + "]");
        }

        return localizedMessage;
    }

    /**
     * Localizes and formats text message.
     *
     * @param message Text message to localize and format.
     * @param args Array of objects to be injected into formatted message.
     * @return Localized and formatted text message.
     */
    public String prepareMessage(final ConfigManager.Immutable configManager, final String message,
            final Object[] args, final Locale locale) {
        // TODO move to helper class
        final String localizedMessage = localizeString(configManager, message, locale);
        final String formattedMessage = formatMessage(localizedMessage, args, locale);

        return formattedMessage;
    }

    @Override
    public void requestNewPassword(final String userId, final String projectId)
            throws ExceptionBase {
        if (this.logger.isInfoEnabled()) {
            this.logger.info("requestNewPassword for username=[" + userId + "]");
        }

        // notify the administrator (administratorEMail value in afm-config.xml) that the user abc
        // with email abc@yourcompany.com is requesting a new password

        // userId must be supplied
        if (StringUtil.notNull(userId).equals("")) {
            // @non-translatable
            throw new ExceptionBase("User ID is empty");
        }

        // projectId must be supplied
        if (StringUtil.notNull(projectId).equals("")) {
            // @non-translatable
            throw new ExceptionBase("Project ID is empty");
        }

        // User is not logged in
        // Set core user session from the specified project as current context
        final Context context = ContextStore.get();
        {
            final ConfigManager.Immutable configManager = context.getConfigManager();
            final Project.Immutable project =
                    SecurityControllerTemplate.findProject(configManager, projectId);

            // project must exist
            if (project == null) {
                // @non-translatable
                throw new ExceptionBase("ProjectId does not match any projects");
            }

            // use core user session as context
            final UserSession.Immutable userSession = project.loadCoreUserSession();
            // TODO verify: 1. core user session is used inside of transaction; 2. not used outside
            // of
            // transaction.
            // TODO Re-setting userSession in context is not the right thing to do. Instead, we
            // should use something like RunAs functionality, or the original user session should
            // have enough privileges.
            // Do NOT call setUserSession in other places!

            // save current user session
            final UserSession.Immutable savedUserSession = context.getUserSession();
            try {
                context.setUserSession(userSession);

                final TransactionTemplate transactionTemplate =
                        new TransactionTemplate(this.logger);
                transactionTemplate.setRole(DatabaseRole.SCHEMA);
                transactionTemplate.setReadOnly(false);

                transactionTemplate.doWithContext(new CallbackWithWrappedException() {
                    @Override
                    public Object doWithContext(final Context context) throws ExceptionBase {
                        // session must be supplied
                        if (StringUtil.notNull(PasswordManagerImpl.this.session).equals("")) {
                            // @non-translatable
                            throw new ExceptionBase("session is not specified");
                        }

                        Assert.notNull(PasswordManagerImpl.this.messagesDao,
                            "messagesDao must be set");

                        // set sessionID in context
                        context.getSession().setId(PasswordManagerImpl.this.session.getId());

                        final String body = PasswordManagerImpl.this.messagesDao.localizeMessage(
                            ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION,
                            REFERENCED_BY_PASSWORD_MANAGER_IMPL, SEND_REQUEST_NEW_PASSWORD_BODY);

                        final String subject = PasswordManagerImpl.this.messagesDao.localizeMessage(
                            ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION,
                            REFERENCED_BY_PASSWORD_MANAGER_IMPL, SEND_REQUEST_NEW_PASSWORD_SUBJECT);

                        prepareAndSendNewPasswordRequest(userId, body, subject);

                        return null;
                    }
                });
            } catch (final ExceptionBase e) {
                // log e here, since it is not passed as nested here
                this.logger.error("Throwing exception for non-authenticated user, cause: "
                        + e.toStringForLogging());

                throw prepareException();
            } catch (final UsernameNotFoundException e) {
                throw prepareException();
            } finally {
                // restore saved UserSession
                context.setUserSession(savedUserSession);
            }
        }
    }

    @Override
    public void resetPassword(final String userId, final String keyPhrase) throws ExceptionBase {
        // TODO add authorization: only user in role SYSTEM ADMIN can invoke this method.

        // generates unique password value for the user.

        if (this.logger.isInfoEnabled()) {
            this.logger.info("resetPassword for username=[" + userId + "]");
        }

        Assert.notNull(this.passwordEncoder, "PasswordEncoder must be set");
        Assert.notNull(this.passwordPolicy, "passwordPolicy must be set");
        Assert.notNull(this.passwordGenerator, "passwordGenerator must be set");

        // load UserAccount
        final UserAccount.ThreadSafe userAccount = loadUserAccount(userId);

        final String newPassword = this.getPasswordGenerator().generatePassword(userId, keyPhrase);
        // validate new password pattern
        this.getPasswordPatternValidator().validate(newPassword);

        // update password in user account
        userAccount.changePassword(newPassword);

        {
            // set date password changed field to: current date + temporaryPasswordExpirationPeriod
            // -passwordExpirationPeriod , to make the temporary password expire in
            // temporaryPasswordExpirationPeriod days.
            java.util.Date datePasswordChanged =
                    DateTime.addDays(new java.util.Date(), this.temporaryPasswordExpirationPeriod);
            datePasswordChanged = DateTime.addDays(datePasswordChanged,
                -this.getPasswordPolicy().getPasswordExpirationPeriod());

            userAccount.setDatePasswordChanged(datePasswordChanged);
        }

        // save
        UserAccountLoaderImpl.saveUserAccount(userAccount);
    }

    @Override
    public void sendNewPassword(final String userId, final String password) throws ExceptionBase {
        // TODO add authorization: only user in role SYSTEM ADMIN can invoke this method.

        // takes user�s clear-text password and emails it to him
        if (this.logger.isInfoEnabled()) {
            this.logger.info("sendNewPassword for username=[" + userId + "]");
        }

        Assert.notNull(this.messagesDao, "messagesDao must be set");

        final String body = this.messagesDao.localizeMessage(ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION,
            REFERENCED_BY_PASSWORD_MANAGER_IMPL, SEND_NEW_PASSWORD_BODY);

        final String subject =
                this.messagesDao.localizeMessage(ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION,
                    REFERENCED_BY_PASSWORD_MANAGER_IMPL, SEND_NEW_PASSWORD_SUBJECT);

        prepareAndSendPassword(userId, body, subject, password);
    }

    @Override
    public void sendTemporaryPassword(final String userId) throws ExceptionBase {
        // TODO add authorization: only user in role SYSTEM ADMIN can invoke this method.

        // takes user�s clear-text password and emails it to him, asking to change it as
        // soon as possible

        if (this.logger.isInfoEnabled()) {
            this.logger.info("sendTemporaryPassword for username=[" + userId + "]");
        }

        Assert.notNull(this.messagesDao, "messagesDao must be set");

        final String body = this.messagesDao.localizeMessage(ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION,
            REFERENCED_BY_PASSWORD_MANAGER_IMPL, SEND_TEMPORARY_PASSWORD_BODY);

        final String subject =
                this.messagesDao.localizeMessage(ACTIVITY_ID_AB_SYSTEM_ADMINISTRATION,
                    REFERENCED_BY_PASSWORD_MANAGER_IMPL, SEND_TEMPORARY_PASSWORD_SUBJECT);

        prepareAndSendPassword(userId, body, subject, null);
    }

    /**
     * Setter for the configManager property.
     *
     * @see configManager
     * @param configManager the configManager to set
     */

    public void setConfigManager(final ConfigManager.Immutable configManager) {
        this.configManager = configManager;
    }

    /**
     * Setter for the mailSender property.
     *
     * @see mailSender
     * @param mailSender the mailSender to set
     */

    public void setMailSender(final MailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Setter for the messagesDao property.
     *
     * @see messagesDao
     * @param messagesDao the messagesDao to set
     */

    public void setMessagesDao(final MessagesDao messagesDao) {
        this.messagesDao = messagesDao;
    }

    /**
     * Setter for the passwordEncoder property.
     *
     * @see passwordEncoder
     * @param passwordEncoder the passwordEncoder to set
     */

    public void setPasswordEncoder(
            final org.springframework.security.authentication.encoding.PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Setter for the passwordGenerator property.
     *
     * @see passwordGenerator
     * @param passwordGenerator the passwordGenerator to set
     */

    public void setPasswordGenerator(final PasswordGenerator passwordGenerator) {
        this.passwordGenerator = passwordGenerator;
    }

    /**
     * Setter for the passwordPatternValidator property.
     *
     * @see passwordPatternValidator
     * @param passwordPatternValidator the passwordPatternValidator to set
     */

    public void setPasswordPatternValidator(
            final PasswordPatternValidator passwordPatternValidator) {
        this.passwordPatternValidator = passwordPatternValidator;
    }

    /**
     * Setter for the passwordPolicy property.
     *
     * @see passwordPolicy
     * @param passwordPolicy the passwordPolicy to set
     */

    public void setPasswordPolicy(final PasswordPolicy passwordPolicy) {
        this.passwordPolicy = passwordPolicy;
    }

    /**
     * Setter for the saltSource property.
     *
     * @see saltSource
     * @param saltSource the saltSource to set
     */

    public void setSaltSource(final SaltSource saltSource) {
        this.saltSource = saltSource;
    }

    /**
     * Setter for the session property.
     *
     * @see session
     * @param session the session to set
     */

    public void setSession(final Session session) {
        this.session = session;
    }

    /**
     * Setter for the temporaryPasswordExpirationPeriod property.
     *
     * @see temporaryPasswordExpirationPeriod
     * @param temporaryPasswordExpirationPeriod the temporaryPasswordExpirationPeriod to set
     */

    public void setTemporaryPasswordExpirationPeriod(final int temporaryPasswordExpirationPeriod) {
        this.temporaryPasswordExpirationPeriod = temporaryPasswordExpirationPeriod;
    }

    /**
     * Setter for the userDetailsService property.
     *
     * @see userDetailsService
     * @param userDetailsService the userDetailsService to set
     */

    public void setUserDetailsService(final UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    /**
     * Sends an email message.
     *
     * @param text Message text to send.
     * @param from "from" email address.
     * @param host Mail server host address.
     * @param subject Message subject.
     * @param to "to" email address.
     * @param userId User ID of the SMTP mail server.
     * @param password Password of the SMTP mail server.
     * @param cc List of "cc" email addresses.
     * @param bcc List of "bcc" email addresses.
     * @param attachmentFileNames List of attachment file names.
     */
    protected void sendEmail(final String text, final String from, final String host,
            final String port, final String subject, final String to, final List<String> cc,
            final List<String> bcc, final String userId, final String password,
            final List<String> attachmentFileNames) {
        // TODO move to helper class
        // @non-translatable
        final String operation =
                "Sending email from=[{0}], to=[{1}], cc=[{2}], bcc=[{3}], subject=[{4}], host=[{5}]";

        if (StringUtil.notNull(host).length() == 0 || StringUtil.notNull(from).length() == 0
                || StringUtil.notNull(to).length() == 0) {
            // one or more arguments are not specified
            // @non-translatable
            final String errorMessage = "Required argument is not specified: {0}";

            final ExceptionBase exception = new ExceptionBase();
            exception.setOperation(operation);
            exception.setPattern(errorMessage);
            final Object[] args = { from, to, cc, bcc, subject, host };
            exception.setArgs(args);

            throw exception;
        }

        if (this.logger.isDebugEnabled()) {
            this.logger.debug(operation);
        }

        try {
            final MailMessage message = new MailMessage();
            message.setActivityId("AbSystemAdministration");
            message.setFrom(from);
            message.setTo(to);
            message.setHost(host);
            message.setPort(port);
            message.setSubject(subject);
            message.setText(text);
            message.setContentType(TEXT_PLAIN_CHARSET_UTF_8);
            message.setCc(cc);
            message.setBcc(bcc);
            message.setUser(userId);
            message.setPassword(password);

            // if attachments specified, add them
            if (attachmentFileNames != null) {
                for (final Object element : attachmentFileNames) {
                    final String fileName = (String) element;
                    message.addFileAttachment(fileName);
                }
            }

            this.mailSender.send(message);

        } catch (final Throwable t) {
            final ExceptionBase exception = new ExceptionBase(operation, t);
            final Object[] args = { from, to, cc, bcc, subject, host };
            exception.setArgs(args);

            throw exception;
        }
    }

    private UserAccount.ThreadSafe loadUserAccount(final String userId) {
        // load UserAccount
        final UserDetailsImpl userDetails =
                (UserDetailsImpl) this.getUserDetailsService().loadUserByUsername(userId);
        final UserAccount.ThreadSafe userAccount =
                (UserAccount.ThreadSafe) userDetails.getUserAccount();
        return userAccount;
    }

    private void prepareAndSendNewPasswordRequest(final String userId, final String message,
            final String subject) {
        // get locale, password and email from the account
        Locale locale;
        String email;
        {
            // load UserAccount for the userId

            UserAccount.Immutable userAccount;
            try {
                userAccount = loadUserAccount(userId);
            } catch (final ExceptionBase e) {
                // TODO verify exception
                // TODO copy message text from the AXVW file
                // @translatable
                throw new ExceptionBase("The supplied user ID does not match our records.", true);
            }

            // get email from the account

            email = userAccount.getAttribute("/*/preferences/@email");
            locale = userAccount.getLocale();
        }

        sendNewPasswordRequest(message, subject, locale, userId, email);
    }

    private void prepareAndSendPassword(final String userId, final String message,
            final String subject, String password) {
        // get locale, password and email from the account
        Locale locale;
        String email;
        {
            // load UserAccount for the userId

            UserAccount.Immutable userAccount;
            try {
                userAccount = loadUserAccount(userId);
            } catch (final ExceptionBase e) {
                // TODO verify exception
                // TODO copy message text from the AXVW file
                // @translatable
                throw new ExceptionBase("The supplied user ID does not match our records.", true);
            }

            // get password and email from the account
            // if password parameter was not supplied, get it from the user account
            if (StringUtil.notNull(password).length() == 0) {
                password = userAccount.getPassword();
            }

            email = userAccount.getAttribute("/*/preferences/@email");
            locale = userAccount.getLocale();
        }

        sendPassword(message, subject, password, locale, email);
    }

    private void prepareEmailHostParameters(final String body, final String subjectLocalized,
            final String to, final String from) {
        final String host = this.configManager.getAttribute(EventHandlerBase.PREFERENCES_MAIL_HOST);
        // mailSMTPHost must be supplied
        if (StringUtil.notNull(host).equals("")) {
            // @non-translatable
            throw new ExceptionBase("Mail SMTP Host is empty");
        }

        final String port =
                this.configManager.getAttribute(EventHandlerBase.PREFERENCES_MAIL_HOST_PORT);

        final String userId =
                this.configManager.getAttribute(EventHandlerBase.PREFERENCES_MAIL_HOST_USER_ID);

        final String password =
                this.configManager.getAttribute(EventHandlerBase.PREFERENCES_MAIL_HOST_PASSWORD);

        try {
            sendEmail(body, from, host, port, subjectLocalized, to, new ArrayList<String>(),
                new ArrayList<String>(), userId, password, null);
            // TODO after success, show success text on the form
        } catch (final Exception e) {
            // TODO: do not show any details (message body, password, from,
            // to, host) to end user
            // @non-translatable
            throw new ExceptionBase(null, "XXX", e);
        }
    }

    private ExceptionBase prepareException() {
        // Don't show the original error message with security details to non-authenticated
        // user.
        // Replace e with new ExceptionBase, with error message suitable for
        // non-authenticated end-user.
        // @translatable
        final String message =
                "If the user exists, an email was sent with directions for password recovery.";

        final ExceptionBase exception = new ExceptionBase();
        exception.setPattern(message);
        exception.setNested(null);
        exception.setClassName(this.getClass().getName());
        exception.setTranslatable(true);
        exception.setForUser(true);
        // don't log this exception twice
        exception.setLogged(true);

        return exception;
    }

    private void sendNewPasswordRequest(final String message, final String subject,
            final Locale locale, final String username, final String userEmail) {
        // prepare mail body: localize and insert userId and email
        final String body = prepareMessage(this.configManager, message,
            new Object[] { username, userEmail }, locale);

        final String subjectLocalized = prepareMessage(this.configManager, subject, null, locale);

        // To: administrator's email address
        final String administratorEMail = this.configManager.getAttribute(
            "/*/preferences/mail/addresses/address[@name='administratorEMail']/@value");
        // administratorEMail must be supplied
        if (StringUtil.notNull(administratorEMail).equals("")) {
            // @non-translatable
            throw new ExceptionBase("Administrator e-mail is empty");
        }

        final String to = administratorEMail;
        final String from = administratorEMail;

        prepareEmailHostParameters(body, subjectLocalized, to, from);
    }

    private void sendPassword(final String message, final String subject, final String password,
            final Locale locale, final String email) {
        // prepare mail body: localize and insert password
        final String body =
                prepareMessage(this.configManager, message, new Object[] { password }, locale);

        final String subjectLocalized = prepareMessage(this.configManager, subject, null, locale);

        // From: administrator's email address
        final String administratorEMail = this.configManager.getAttribute(
            "/*/preferences/mail/addresses/address[@name='administratorEMail']/@value");
        // administratorEMail must be supplied
        if (StringUtil.notNull(administratorEMail).equals("")) {
            // @non-translatable
            throw new ExceptionBase("Administrator e-mail is empty");
        }

        String to = email;
        // if no email was specified in user account, send to
        // administratorEMail
        if (StringUtil.notNull(email).equals("")) {
            to = administratorEMail;
        }

        final String from = administratorEMail;

        prepareEmailHostParameters(body, subjectLocalized, to, from);
    }
}
