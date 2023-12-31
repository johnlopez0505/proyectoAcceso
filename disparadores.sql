
DELIMITER //

DROP TRIGGER before_insert_asignatura_alumno;//
DROP TRIGGER before_update_asignatura_alumno;//
DROP TRIGGER before_insert_asignatura_profesor;//
DROP TRIGGER before_update_asignatura_profesor;//

CREATE TRIGGER before_insert_asignatura_alumno
BEFORE INSERT ON asignatura_alumno
FOR EACH ROW
BEGIN
    IF (
        SELECT COUNT(*)
        FROM asignatura_alumno
        WHERE asignatura = NEW.asignatura
    ) >= 32 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede asignar más de 32 alumnos a la asignatura.';
    END IF;
END; 
//

CREATE TRIGGER before_update_asignatura_alumno
BEFORE UPDATE ON asignatura_alumno
FOR EACH ROW
BEGIN
    IF (
        SELECT COUNT(*)
        FROM asignatura_alumno
        WHERE asignatura = NEW.asignatura
    ) >= 32 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede asignar más de 32 alumnos a la asignatura.';
    END IF;
END; 
//


CREATE TRIGGER before_insert_asignatura_profesor
BEFORE INSERT ON asignatura_profesor
FOR EACH ROW
BEGIN
    IF (
        SELECT COUNT(*)
        FROM asignatura_profesor
        WHERE asignatura = NEW.asignatura
    ) >= 2 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se pueden asignar más de dos profesores a la asignatura.';
    END IF;
END;
//


CREATE TRIGGER before_update_asignatura_profesor
BEFORE UPDATE ON asignatura_profesor
FOR EACH ROW
BEGIN
    IF (
        SELECT COUNT(*)
        FROM asignatura_profesor
        WHERE asignatura = NEW.asignatura
    ) >= 2 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se pueden asignar más de dos profesores a la asignatura.';
    END IF;
END;
//


DELIMITER ;