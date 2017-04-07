IF EXISTS (SELECT 1 FROM sysindexes WHERE name = 'HELPDESK_STEP_LOG_PKEY_VALUE') DROP INDEX helpdesk_step_log.HELPDESK_STEP_LOG_PKEY_VALUE;
CREATE INDEX helpdesk_step_log_pkey_value ON helpdesk_step_log (pkey_value);
