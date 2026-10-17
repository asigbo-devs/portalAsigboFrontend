import React from 'react';
import ImportHoursPanel from '@components/ImportHoursPanel';
import styles from './ImportHoursPage.module.css';

/** Importa horas de varias actividades desde un CSV (carnet, actividad, eje, fecha, horas). */
function ImportHoursPage() {
  return (
    <div className={styles.importHoursPage}>
      <h1 className={styles.pageTitle}>Importar horas de actividades</h1>
      <p className={styles.subtitle}>
        Sube un CSV con las horas de uno o varios becados en una o varias actividades.
        Antes de guardar verás una vista previa con los cambios y los errores, si los hay.
      </p>
      <ImportHoursPanel mode="multi" />
    </div>
  );
}

export default ImportHoursPage;
