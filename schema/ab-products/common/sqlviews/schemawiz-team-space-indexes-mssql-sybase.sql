IF EXISTS (SELECT 1 FROM sysindex where index_name = 'RM_TEAM_DATE_START_DATE_END') DROP INDEX rm_team.RM_TEAM_DATE_START_DATE_END;
CREATE clustered INDEX rm_team_date_start_date_end ON rm_team(date_start, date_end);
IF EXISTS (SELECT 1 FROM sysindex where index_name = 'TEAM_DATE_START_DATE_END') DROP INDEX team.TEAM_DATE_START_DATE_END;
CREATE clustered INDEX team_date_start_date_end ON team(date_start, date_end);
