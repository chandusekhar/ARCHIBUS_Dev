IF EXISTS(SELECT 1 FROM SYSOBJECTS WHERE name = 'system_status_t') DROP TRIGGER system_status_t;

CREATE TRIGGER system_status_t ON system_bl FOR UPDATE  AS  IF UPDATE(recovery_status)  BEGIN   DECLARE @new_recovery_status varchar(12), @new_sysid varchar(64)    DECLARE c_stat CURSOR LOCAL SCROLL FOR  SELECT system_bl.system_id, system_bl.recovery_status   FROM system_bl, inserted    WHERE system_bl.system_id = inserted.system_id  OPEN c_stat FETCH NEXT FROM c_stat INTO @new_sysid, @new_recovery_status        WHILE @@fetch_status = 0   BEGIN    IF @new_recovery_status = 'UNFIT-TEMP' or @new_recovery_status = 'UNFIT-PERM'   SET  @new_recovery_status='FIT-OFFLINE'     UPDATE system_bl SET system_bl.recovery_status = @new_recovery_status   WHERE system_bl.system_id in (SELECT system_id_depend FROM system_dep   WHERE system_dep.system_id_master = @new_sysid AND  system_dep.propagate_status = 1)    AND system_bl.recovery_status NOT IN ('UNFIT-TEMP','UNFIT-PERM',@new_recovery_status);      FETCH NEXT FROM c_stat INTO @new_sysid, @new_recovery_status   END   CLOSE c_stat   DEALLOCATE c_stat  END;
