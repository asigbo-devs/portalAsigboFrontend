import React from 'react';
import PropTypes from 'prop-types';
import PopUp from '@components/PopUp';
import ImportHoursPanel from '@components/ImportHoursPanel';
import styles from './ImportHoursPopUp.module.css';

/** Ventana para importar las horas de UNA actividad ya seleccionada. */
function ImportHoursPopUp({
  isOpen, close, idActivity, onDone,
}) {
  return (
    isOpen && (
      <PopUp close={close} maxWidth={760}>
        <div className={styles.container}>
          <h2 className={styles.title}>Importar horas de la actividad</h2>
          <ImportHoursPanel mode="activity" idActivity={idActivity} onDone={onDone} />
        </div>
      </PopUp>
    )
  );
}

export default ImportHoursPopUp;

ImportHoursPopUp.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  idActivity: PropTypes.string.isRequired,
  onDone: PropTypes.func,
};

ImportHoursPopUp.defaultProps = {
  onDone: undefined,
};
