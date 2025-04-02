import React from 'react';
import styled from 'styled-components';

const TermsandServices = ({ onClose }: { onClose: () => void }) => {
  return (
    <StyledWrapper>
      <div className="modal">
        <article className="modal-container">
          <header className="modal-container-header">
            <span className="modal-container-title">
              <svg aria-hidden="true" height={24} width={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M14 9V4H5v16h6.056c.328.417.724.785 1.18 1.085l1.39.915H3.993A.993.993 0 0 1 3 21.008V2.992C3 2.455 3.449 2 4.002 2h10.995L21 8v1h-7zm-2 2h9v5.949c0 .99-.501 1.916-1.336 2.465L16.5 21.498l-3.164-2.084A2.953 2.953 0 0 1 12 16.95V11zm2 5.949c0 .316.162.614.436.795l2.064 1.36 2.064-1.36a.954.954 0 0 0 .436-.795V13h-5v3.949z" fill="currentColor" />
              </svg>
              Terms and Services
            </span>
            <button className="icon-button" onClick={onClose}>
              <svg height={24} width={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="currentColor" />
              </svg>
            </button>
          </header>
          <section className="modal-container-body rtf">
            <span>Quarum ambarum rerum cum medicinam pollicetur, luxuriae licentiam pollicetur.</span>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Unum nescio, quo modo possit, si luxuriosus sit, finitas cupiditates habere...</p>
            <span>Ut proverbia non nulla veriora sint quam vestra dogmata.</span>
            <p>Quasi vero, inquit, perpetua oratio rhetorum solum, non etiam philosophorum sit...</p>
            <span>An hoc usque quaque, aliter in vita?</span>
            <ol>
              <li>Etenim nec iustitia nec amicitia esse omnino poterunt, nisi ipsae per se expetuntur.</li>
              <li>Pisone in eo gymnasio, quod Ptolomaeum vocatur, unaque nobiscum Q.</li>
              <li>Certe nihil nisi quod possit ipsum propter se iure laudari.</li>
              <li>Itaque e contrario moderati aequabilesque habitus, affectiones ususque corporis apti esse ad naturam videntur.</li>
            </ol>
          </section>
          <footer className="modal-container-footer">
            <button className="button is-ghost" onClick={onClose}>Decline</button>
            <button className="button is-primary" onClick={onClose}>Accept</button>
          </footer>
        </article>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button,
  .input,
  .select,
  .textarea {
    font: inherit;
  }

  a {
    color: inherit;
  }

  .modal-container {
    max-height: 400px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    background-color: #fff;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 15px 30px 0 rgba(0, 0, 0, 0.25);
  }

  @media (max-width: 600px) {
    .modal-container {
      width: 90%;
    }
  }

  .modal-container-header {
    padding: 16px 32px;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-container-title {
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 1;
    font-weight: 700;
    font-size: 1.125rem;
  }

  .modal-container-title svg {
    width: 32px;
    height: 32px;
    color: #750550;
  }

  .modal-container-body {
    padding: 24px 32px 51px;
    overflow-y: auto;
  }

  .modal-container-footer {
    padding: 20px 32px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-top: 1px solid #ddd;
    gap: 12px;
  }

  .button {
    padding: 12px 20px;
    border-radius: 8px;
    background-color: transparent;
    border: 0;
    font-weight: 600;
    cursor: pointer;
    transition: 0.15s ease;
  }

  .button.is-ghost:hover,
  .button.is-ghost:focus {
    background-color: #dfdad7;
  }

  .button.is-primary {
    background-color: #750550;
    color: #fff;
  }

  .button.is-primary:hover,
  .button.is-primary:focus {
    background-color: #4a0433;
  }

  .icon-button {
    padding: 0;
    border: 0;
    background-color: transparent;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    cursor: pointer;
    border-radius: 8px;
    transition: 0.15s ease;
  }

  .icon-button:hover,
  .icon-button:focus {
    background-color: #dfdad7;
  }
`;

export default TermsandServices;