
CREATE DATABASE IF NOT EXISTS `gestion`;
USE `gestion`;

DROP TABLE IF EXISTS `asignatura_profesor`;
DROP TABLE IF EXISTS `asignatura_alumno`;
DROP TABLE IF EXISTS `asignatura`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `profesor`;
DROP TABLE IF EXISTS `alumno`;



CREATE TABLE  `alumno`(
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(20) NOT NULL,
    `apellido` VARCHAR(20) NOT NULL,
    `email` VARCHAR(30) NOT NULL,
    `telefono` VARCHAR(15)
);


CREATE TABLE `profesor`(
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(20) NOT NULL,
    `apellido` VARCHAR(20) NOT NULL,
    `email` VARCHAR(30) NOT null
);


CREATE TABLE IF NOT EXISTS users (
`id` INT AUTO_INCREMENT PRIMARY KEY,
`username` VARCHAR(255) NOT NULL,
`password` VARCHAR(255) NOT NULL,
`rol` ENUM('administrativo', 'profesor', 'alumno') NOT NULL,
`profesor` INT,
`alumno` INT,
FOREIGN KEY (profesor) REFERENCES profesor (id),
FOREIGN KEY (alumno) REFERENCES alumno (id)
);

    

INSERT INTO `users`(`username`,`password`)
    VALUES ('john','1234');


CREATE TABLE `asignatura`(
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(60) NOT NULL,
    `curso` VARCHAR(20) NOT NULL,
    `ciclo` VARCHAR (50) NOT NULL
);


CREATE TABLE `asignatura_alumno`(
    `asignatura` INT,
    `alumno` INT,
    PRIMARY KEY(asignatura,alumno),
    Foreign Key (asignatura) REFERENCES asignatura(id),
    Foreign Key (alumno) REFERENCES alumno(id)
);


CREATE TABLE `asignatura_profesor`(
    `asignatura` INT,
    `profesor` INT,
    PRIMARY KEY(asignatura,profesor),
    Foreign Key (asignatura) REFERENCES asignatura(id),
    Foreign Key (profesor) REFERENCES profesor(id)
);