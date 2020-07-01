import React from 'react';

import './Modal.css';

const Modal = props => (
    <div className="modal">
        <header>{props.title}</header>
        <section className="modal__content">
            {props.children}
        </section>
        <section className="modal__actions">
            {props.canCancel && <button onClick={props.onCancel}>Cancel</button>}
            {props.canConfirm && <button onClick={props.onConfirm}>{props.confirmText}</button>}
        </section>
    </div>
);

export default Modal;