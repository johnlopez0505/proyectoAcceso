CREATE TRIGGER before_insert_alumno_asignatura
BEFORE INSERT ON alumno_asignatura
FOR EACH ROW
BEGIN
    DECLARE alumno_count INT;
    SET alumno_count = (SELECT COUNT(*) FROM alumno_asignatura WHERE
        asignatura = NEW.asignatura);
    IF alumno_count >= 32 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede asignar más de 32 alumnos a la
            asignatura';
    END IF;
END; 
//

DELIMITER ;