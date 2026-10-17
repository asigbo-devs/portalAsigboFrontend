import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { BiSolidCloudUpload } from 'react-icons/bi';
import Button from '@components/Button';
import Spinner from '@components/Spinner/Spinner';
import useFetch from '@hooks/useFetch';
import useToken from '@hooks/useToken';
import { serverHost } from '@/config';
import hoursImportErrorLabel from '@helpers/hoursImportErrors';
import styles from './ImportHoursPanel.module.css';

const TEMPLATE_NAMES = {
  activity: 'plantilla-horas-actividad.csv',
  multi: 'plantilla-horas-varias-actividades.csv',
};

const COLUMNS = {
  activity: 'carnet, horas',
  multi: 'carnet, actividad, eje, fecha, horas',
};

/**
 * Flujo para cargar horas desde un CSV: descargar plantilla → elegir archivo → vista previa
 * (sin guardar nada) → confirmar. Sirve para una actividad ya seleccionada (`mode="activity"`)
 * o para varias (`mode="multi"`).
 *
 * @param {'activity'|'multi'} mode Formato del CSV.
 * @param {string} idActivity Obligatorio en el modo `activity`.
 * @param {function} onDone Se llama cuando las horas se guardaron.
 */
function ImportHoursPanel({ mode, idActivity, onDone }) {
  const token = useToken();
  const [file, setFile] = useState(null);

  const {
    callFetch: fetchTemplate, result: templateBlob, loading: loadingTemplate, error: templateError,
  } = useFetch();
  const {
    callFetch: fetchPreview, result: preview, loading: loadingPreview, error: previewError,
  } = useFetch();
  const {
    callFetch: fetchApply, result: applied, loading: loadingApply, error: applyError,
  } = useFetch();

  const importUri = mode === 'activity'
    ? `${serverHost}/activity/${idActivity}/assignment/hours/import`
    : `${serverHost}/activity/assignment/hours/import`;

  const sendFile = (selected, dryRun) => {
    const body = new FormData();
    body.append('file', selected);
    const call = dryRun ? fetchPreview : fetchApply;
    call({
      uri: `${importUri}?dryRun=${dryRun}`,
      method: 'POST',
      body,
      headers: { authorization: token },
      removeContentType: true,
    });
  };

  const handleTemplate = () => {
    fetchTemplate({
      uri: `${serverHost}/activity/assignment/hours/template?mode=${mode}`,
      headers: { authorization: token },
      toBlob: true,
    });
  };

  useEffect(() => {
    // Al llegar la plantilla se guarda como archivo.
    if (!(templateBlob instanceof Blob)) return;
    const url = URL.createObjectURL(templateBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = TEMPLATE_NAMES[mode];
    link.click();
    URL.revokeObjectURL(url);
  }, [templateBlob]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    e.target.value = '';
    if (!selected) return;
    setFile(selected);
    sendFile(selected, true);
  };

  useEffect(() => {
    if (applied?.applied && onDone) onDone(applied);
  }, [applied]);

  const errors = preview?.errors ?? [];
  const toWrite = (preview?.assignmentsCreated ?? 0) + (preview?.assignmentsCompleted ?? 0);
  const writesSomething = toWrite > 0;
  const canConfirm = preview && !applied && errors.length === 0 && writesSomething;
  const busy = loadingPreview || loadingApply;

  return (
    <div className={styles.panel}>
      <p className={styles.instructions}>
        {'El archivo debe ser un CSV (UTF-8) separado por comas, con las columnas: '}
        <strong>{COLUMNS[mode]}</strong>
        .
        {mode === 'multi'
          ? ' La fecha va como AAAA-MM-DD HH:mm (hora de Guatemala). Si la actividad no existe, se crea.'
          : ' Las horas son el total que recibe cada becado en esta actividad.'}
      </p>

      <div className={styles.actions}>
        <Button text={loadingTemplate ? 'Descargando…' : 'Descargar plantilla'} emptyBlue onClick={handleTemplate} disabled={loadingTemplate} />
      </div>
      {templateError && <p className={styles.error} role="alert">{templateError.message}</p>}

      {!applied && (
        <label className={styles.dropzone} htmlFor={`hours-file-${mode}`}>
          <BiSolidCloudUpload className={styles.uploadIcon} />
          <span>{file ? `Archivo: ${file.name}` : 'Haz click para elegir el archivo CSV'}</span>
          <input
            id={`hours-file-${mode}`}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            disabled={busy}
          />
        </label>
      )}

      {busy && <div className={styles.spinner}><Spinner /></div>}
      {previewError && <p className={styles.error} role="alert">{previewError.message}</p>}
      {applyError && <p className={styles.error} role="alert">{applyError.message}</p>}

      {preview && !applied && (
        <section aria-live="polite">
          {preview.previousImportId && (
            <p className={styles.warning}>
              Este mismo archivo ya se cargó antes. Volver a cargarlo no suma horas de nuevo.
            </p>
          )}

          <h3 className={styles.sectionTitle}>Vista previa (aún no se ha guardado nada)</h3>
          <dl className={styles.summary}>
            <div>
              <dt>Actividades nuevas</dt>
              <dd>{preview.activitiesCreated}</dd>
            </div>
            <div>
              <dt>Actividades existentes</dt>
              <dd>{preview.activitiesReused}</dd>
            </div>
            <div>
              <dt>Asignaciones nuevas</dt>
              <dd>{preview.assignmentsCreated}</dd>
            </div>
            <div>
              <dt>Asignaciones completadas</dt>
              <dd>{preview.assignmentsCompleted}</dd>
            </div>
            <div>
              <dt>Omitidas (ya estaban)</dt>
              <dd>{preview.skipped}</dd>
            </div>
            <div>
              <dt>Horas a sumar</dt>
              <dd>{preview.hoursAdded}</dd>
            </div>
          </dl>

          {errors.length > 0 && (
            <>
              <h3 className={styles.sectionTitle}>
                {`Corrija ${errors.length} ${errors.length === 1 ? 'error' : 'errores'} y vuelva a subir el archivo`}
              </h3>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>Carné</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((err) => (
                      <tr key={`${err.row}-${err.kind}`}>
                        <td>{err.row}</td>
                        <td>{err.carnet}</td>
                        <td>{hoursImportErrorLabel(err.kind)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {errors.length === 0 && !writesSomething && (
            <p className={styles.warning}>
              No hay nada nuevo que guardar: todas las filas ya estaban cargadas.
            </p>
          )}

          {errors.length === 0 && preview.preview?.length > 0 && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Carné</th>
                    <th>Horas a sumar</th>
                    {preview.preview[0]?.before !== undefined && (
                      <th>Total de horas (antes → después)</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((item) => (
                    <tr key={item.carnet}>
                      <td>{item.carnet}</td>
                      <td>{item.added}</td>
                      {item.before !== undefined && <td>{`${item.before} → ${item.after}`}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.actions}>
            <Button
              text={loadingApply ? 'Guardando…' : 'Confirmar y guardar horas'}
              onClick={() => sendFile(file, false)}
              disabled={!canConfirm || busy}
            />
          </div>
        </section>
      )}

      {applied?.applied && (
        <section aria-live="polite">
          <h3 className={styles.sectionTitle}>Horas guardadas</h3>
          <p className={styles.success}>
            {`Se sumaron ${applied.hoursAdded} horas (${applied.assignmentsCreated} asignaciones nuevas y ${applied.assignmentsCompleted} completadas).`}
          </p>
        </section>
      )}
      {applied && !applied.applied && (
        <p className={styles.error} role="alert">
          No se guardó nada: el archivo cambió o tiene errores.
          Vuelva a subirlo para ver la vista previa.
        </p>
      )}
    </div>
  );
}

export default ImportHoursPanel;

ImportHoursPanel.propTypes = {
  mode: PropTypes.oneOf(['activity', 'multi']).isRequired,
  idActivity: PropTypes.string,
  onDone: PropTypes.func,
};

ImportHoursPanel.defaultProps = {
  idActivity: undefined,
  onDone: undefined,
};
