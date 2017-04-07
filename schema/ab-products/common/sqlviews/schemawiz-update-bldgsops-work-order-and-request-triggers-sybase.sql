IF EXISTS (select 1 FROM systrigger WHERE trigger_name = 'WOAUTONUMBER') DROP TRIGGER WOAUTONUMBER;

CREATE TRIGGER WOAUTONUMBER BEFORE INSERT ON WO REFERENCING NEW AS new_record FOR EACH ROW  BEGIN DECLARE max_closed_id INT;DECLARE max_open_id INT; SELECT MAX(WO_id) INTO max_closed_id FROM hWO;SELECT MAX(WO_id) INTO max_open_id FROM WO;IF ISNULL(new_record.WO_id, 0)<= max_closed_id OR  ISNULL(new_record.WO_id, 0)<= max_open_id THEN IF max_closed_id > max_open_id THEN SET new_record.WO_id=max_closed_id + 1; ELSEIF max_open_id > max_closed_id THEN SET new_record.WO_id=max_open_id + 1; END IF; END IF; END;

IF EXISTS (select 1 FROM systrigger WHERE trigger_name = 'WRAUTONUMBER') DROP TRIGGER WRAUTONUMBER;

CREATE TRIGGER WRAUTONUMBER BEFORE INSERT ON WR REFERENCING NEW AS new_record FOR EACH ROW  BEGIN DECLARE max_closed_id INT;DECLARE max_open_id INT; SELECT MAX(WR_id) INTO max_closed_id FROM hWR;SELECT MAX(WR_id) INTO max_open_id FROM WR;IF ISNULL(new_record.WR_id, 0)<= max_closed_id OR  ISNULL(new_record.WR_id, 0)<= max_open_id THEN IF max_closed_id > max_open_id THEN SET new_record.WR_id=max_closed_id + 1; ELSEIF max_open_id > max_closed_id THEN SET new_record.WR_id=max_open_id + 1; END IF; END IF; END;
