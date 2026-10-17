/**
 * Ayudas para la columna «Carné» de las tablas de usuarios.
 *
 * El backend solo envía `studentId` a quien puede verlo (admin, encargados y el propio
 * becado), así que la columna se muestra únicamente cuando alguna fila lo trae.
 * Para los demás roles la tabla queda como estaba.
 */

/** true si al menos un usuario de la lista trae carné. */
export const hasStudentIds = (users) => Array.isArray(users)
  && users.some((user) => typeof user?.studentId === 'string' && user.studentId !== '');

/** Inserta «Carné» después de «Nombre» (índice 3) cuando la columna se muestra. */
export const withStudentIdHeader = (header, show) => (
  show ? [...header.slice(0, 3), 'Carné', ...header.slice(3)] : header
);
