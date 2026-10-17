/** Motivos de error del CSV de horas (`errors[].kind` del backend), en español. */
const labels = {
  carnet_invalido: 'Carné inválido (debe tener de 4 a 10 dígitos)',
  actividad_invalida: 'Nombre de actividad vacío o de más de 100 caracteres',
  eje_invalido: 'El eje está vacío',
  fecha_invalida: 'Fecha inválida (use AAAA-MM-DD HH:mm, hora de Guatemala)',
  horas_invalidas: 'Horas inválidas (un número entero de 1 a 200)',
  fila_repetida: 'Fila repetida: el mismo becado y actividad ya aparecen antes',
  horas_distintas: 'El mismo becado aparece con horas distintas en esta actividad',
  carnet_desconocido: 'No existe un becado con ese carné',
  eje_desconocido: 'No existe un eje con ese nombre',
  eje_bloqueado: 'El eje está bloqueado',
  actividad_bloqueada: 'La actividad está bloqueada',
  actividad_ambigua: 'Hay más de una actividad con ese nombre, eje y día',
  sin_permiso: 'No tiene permiso para cargar horas en esta actividad',
  cupo_lleno: 'La actividad no tiene cupos disponibles',
  conflicto_horas: 'El becado ya tiene esta actividad completada con otras horas',
  horas_menores_que_la_actividad: 'Las horas son menores que las horas base de la actividad',
};

export default function hoursImportErrorLabel(kind) {
  return labels[kind] ?? kind;
}
