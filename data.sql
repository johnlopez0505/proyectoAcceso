INSERT INTO alumno (nombre, apellido, email, telefono) VALUES
('Juan', 'Pérez', 'juan.perez@example.com', '123456789'),
('María', 'Gómez', 'maria.gomez@example.com', '987654321'),
('Luis', 'Martínez', 'luis.martinez@example.com', '555111222'),
('Ana', 'Fernández', 'ana.fernandez@example.com', '111222333'),
('Carlos', 'García', 'carlos.garcia@example.com', '444555666'),
('Laura', 'Rodríguez', 'laura.rodriguez@example.com', '777888999'),
('Diego', 'López', 'diego.lopez@example.com', '666555444'),
('Sara', 'Hernández', 'sara.hernandez@example.com', '333222111'),
('Pedro', 'Díaz', 'pedro.diaz@example.com', '999888777'),
('Carmen', 'Sánchez', 'carmen.sanchez@example.com', '888777666'),
('Javier', 'Romero', 'javier.romero@example.com', '222333444'),
('Elena', 'Alvarez', 'elena.alvarez@example.com', '444555666'),
('Antonio', 'Jiménez', 'antonio.jimenez@example.com', '111222333'),
('Rocío', 'Molina', 'rocio.molina@example.com', '777888999'),
('Miguel', 'Serrano', 'miguel.serrano@example.com', '123456789'),
('Isabel', 'Torres', 'isabel.torres@example.com', '555111222'),
('José', 'Flores', 'jose.flores@example.com', '987654321'),
('Paula', 'Ramírez', 'paula.ramirez@example.com', '444555666'),
('Alberto', 'Garrido', 'alberto.garrido@example.com', '999888777'),
('Silvia', 'Ortega', 'silvia.ortega@example.com', '666555444'),
('Raúl', 'Cruz', 'raul.cruz@example.com', '333222111'),
('Marta', 'Gutiérrez', 'marta.gutierrez@example.com', '123456789'),
('Adrián', 'Reyes', 'adrian.reyes@example.com', '555111222'),
('Eva', 'Luna', 'eva.luna@example.com', '444555666'),
('Iván', 'Ruiz', 'ivan.ruiz@example.com', '123456789'),
('Beatriz', 'Navarro', 'beatriz.navarro@example.com', '987654321'),
('Ángel', 'Delgado', 'angel.delgado@example.com', '555111222'),
('Cristina', 'Morales', 'cristina.morales@example.com', '666555444'),
('Fernando', 'Guerrero', 'fernando.guerrero@example.com', '444555666'),
('Lucía', 'Cabrera', 'lucia.cabrera@example.com', '777888999'),
('Manuel', 'Rey', 'manuel.rey@example.com', '111222333');

INSERT INTO alumno (nombre, apellido, email, telefono) VALUES
('Gabriel', 'Vargas', 'gabriel.vargas@example.com', '555555555'),
('Patricia', 'Soto', 'patricia.soto@example.com', '111111111'),
('Jorge', 'Moreno', 'jorge.moreno@example.com', '999999999'),
('Natalia', 'Cruz', 'natalia.cruz@example.com', '777777777'),
('Ricardo', 'López', 'ricardo.lopez@example.com', '333333333'),
('Marina', 'Herrera', 'marina.herrera@example.com', '888888888'),
('Alejandro', 'Ramírez', 'alejandro.ramirez@example.com', '222222222'),
('Carolina', 'Ortega', 'carolina.ortega@example.com', '666666666'),
('Héctor', 'Díaz', 'hector.diaz@example.com', '444444444'),
('Sofía', 'Fuentes', 'sofia.fuentes@example.com', '555555555'),
('Raul', 'Salazar', 'raul.salazar@example.com', '888888888'),
('Gisela', 'Guzmán', 'gisela.guzman@example.com', '333333333'),
('Martín', 'Rojas', 'martin.rojas@example.com', '666666666'),
('Alicia', 'Mendoza', 'alicia.mendoza@example.com', '222222222'),
('Federico', 'Castillo', 'federico.castillo@example.com', '444444444'),
('Valeria', 'Nava', 'valeria.nava@example.com', '111111111'),
('Pablo', 'Delgado', 'pablo.delgado@example.com', '999999999'),
('Lorena', 'Reyes', 'lorena.reyes@example.com', '777777777'),
('Roberto', 'Pérez', 'roberto.perez@example.com', '888888888'),
('Elena', 'Gallardo', 'elena.gallardo@example.com', '555555555');


INSERT INTO profesor (nombre, apellido, email) VALUES
('Alejandro', 'Gómez', 'alejandro.gomez@example.com'),
('Beatriz', 'López', 'beatriz.lopez@example.com'),
('Carlos', 'Martínez', 'carlos.martinez@example.com'),
('Diana', 'Fernández', 'diana.fernandez@example.com'),
('Eduardo', 'García', 'eduardo.garcia@example.com'),
('Fabiola', 'Hernández', 'fabiola.hernandez@example.com'),
('Gabriel', 'Jiménez', 'gabriel.jimenez@example.com'),
('Hilda', 'Ramírez', 'hilda.ramirez@example.com'),
('Iván', 'Sánchez', 'ivan.sanchez@example.com'),
('Jessica', 'Torres', 'jessica.torres@example.com');


INSERT INTO asignatura (nombre, curso, ciclo) VALUES
('Procesos', '2023/2024', '2º DAM'),
('Multimedia', '2023/2024', '2º DAM'),
('Acceso a Datos', '2023/2024', '2º DAM'),
('Empresa', '2023/2024', '2º DAM'),
('Libre Configuración', '2023/2024', '2º DAM'),
('SGE', '2023/2024', '2º DAM'),
('Interface', '2023/2024', '2º DAM'),
('Programación', '2º Dam', '2º DAM');


INSERT INTO `users`(`username`,`password`)
    VALUES ('john','1234');

INSERT INTO `users`(`username`,`password`,`rol`,`alumno`)
    VALUES ('juan','1234','alumno',1);

INSERT INTO `users`(`username`,`password`,`rol`,`alumno`)
    VALUES ('pedro','1234','alumno',9);

INSERT INTO `users`(`username`,`password`,`rol`,`alumno`)
    VALUES ('pablo','1234','alumno',48);

INSERT INTO `users`(`username`,`password`,`rol`,`profesor`)
    VALUES ('alejandro','1234','profesor',1);

INSERT INTO `users`(`username`,`password`,`rol`,`profesor`)
    VALUES ('diana','1234','profesor',4);

INSERT INTO `users`(`username`,`password`,`rol`,`profesor`)
    VALUES ('gabriel','1234','profesor',7);



INSERT INTO `asignatura_alumno`(`asignatura`,`alumno`)
    VALUES (1,1);

INSERT INTO `asignatura_alumno`(`asignatura`,`alumno`)
    VALUES (2,20);

INSERT INTO `asignatura_alumno`(`asignatura`,`alumno`)
    VALUES (1,18);

INSERT INTO `asignatura_alumno`(`asignatura`,`alumno`)
    VALUES (8,48);



INSERT INTO `asignatura_profesor`(`asignatura`,`profesor`)
    VALUES (1,4);

INSERT INTO `asignatura_profesor`(`asignatura`,`profesor`)
    VALUES (2,4);

INSERT INTO `asignatura_profesor`(`asignatura`,`profesor`)
    VALUES (3,1);

INSERT INTO `asignatura_profesor`(`asignatura`,`profesor`)
    VALUES (1,2);
