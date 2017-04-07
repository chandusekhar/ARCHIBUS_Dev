UPDATE project SET status = 'Created'  WHERE status = 'N/A';
UPDATE project SET status = 'Issued'  WHERE status = 'In Process';
UPDATE project SET status = 'Issued/On Hold'  WHERE status = 'In Process/On Hold';