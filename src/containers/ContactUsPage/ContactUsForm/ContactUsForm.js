import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';

import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import { ensureCurrentUser } from '../../../util/data';
import {
  isChangeEmailTakenError,
  isChangeEmailWrongPassword,
  isTooManyEmailVerificationRequestsError,
} from '../../../util/errors';

import { FieldPhoneNumberInput, Form, PrimaryButton, FieldTextInput } from '../../../components';

import css from './ContactUsForm.module.css';

const SHOW_EMAIL_SENT_TIMEOUT = 2000;

class ContactUsFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { showVerificationEmailSentMessage: false, showResetPasswordMessage: false };
    this.emailSentTimeoutId = null;
    this.handleResendVerificationEmail = this.handleResendVerificationEmail.bind(this);
    this.handleResetPassword = this.handleResetPassword.bind(this);
    this.submittedValues = {};
  }

  componentWillUnmount() {
    window.clearTimeout(this.emailSentTimeoutId);
  }

  handleResendVerificationEmail() {
    this.setState({ showVerificationEmailSentMessage: true });

    this.props.onResendVerificationEmail().then(() => {
      // show "verification email sent" text for a bit longer.
      this.emailSentTimeoutId = window.setTimeout(() => {
        this.setState({ showVerificationEmailSentMessage: false });
      }, SHOW_EMAIL_SENT_TIMEOUT);
    });
  }

  handleResetPassword() {
    this.setState({ showResetPasswordMessage: true });
    const email = this.props.currentUser.attributes.email;
    this.props.onResetPassword(email);
  }

  render() {
    return (
      <FinalForm
        {...this.props}
        render={fieldRenderProps => {
          const {
            rootClassName,
            className,
            saveEmailError,
            savePhoneNumberError,
            currentUser,
            formId,
            handleSubmit,
            inProgress,
            intl,
            invalid,
            sendVerificationEmailError,
            sendVerificationEmailInProgress,
            resetPasswordInProgress,
            values,
          } = fieldRenderProps;
          const { email, phoneNumber } = values;

          const user = ensureCurrentUser(currentUser);
          console.log("USER", user);
          if (!user.id) {
            return null;
          }

          const { email: currentEmail, emailVerified, pendingEmail, profile, name:currentName } = user.attributes;

          // email

          // has the email changed
          const emailChanged = currentEmail !== email;

          const nameLabel = intl.formatMessage({
            id: 'ContactUsForm.nameLabel',
          });
          const namePlaceholder = user.attributes.profile.firstName || '';
          const messageLabel = intl.formatMessage({
            id: 'ContactUsForm.messageLabel',
          });
          const messagePlaceholder = 'Your message';
          const messageRequiredMessage = intl.formatMessage({
            id: 'ContactUsForm.messageRequired',
          });
          const messageRequired = validators.required(messageRequiredMessage);

          const emailLabel = intl.formatMessage({
            id: 'ContactUsForm.emailLabel',
          });
          const emailPlaceholder = currentEmail || '';

          const emailRequiredMessage = intl.formatMessage({
            id: 'ContactUsForm.emailRequired',
          });
          const emailRequired = validators.required(emailRequiredMessage);
          const emailInvalidMessage = intl.formatMessage({
            id: 'ContactUsForm.emailInvalid',
          });
          const emailValid = validators.emailFormatValid(emailInvalidMessage);

          const tooManyVerificationRequests = isTooManyEmailVerificationRequestsError(
            sendVerificationEmailError
          );

          const emailTouched = this.submittedValues.email !== values.email;
          const emailTakenErrorText = isChangeEmailTakenError(saveEmailError)
            ? intl.formatMessage({ id: 'ContactUsForm.emailTakenError' })
            : null;

          let resendEmailMessage = null;
          if (tooManyVerificationRequests) {
            resendEmailMessage = (
              <span className={css.tooMany}>
                <FormattedMessage id="ContactUsForm.tooManyVerificationRequests" />
              </span>
            );
          } else if (
            sendVerificationEmailInProgress ||
            this.state.showVerificationEmailSentMessage
          ) {
            resendEmailMessage = (
              <span className={css.emailSent}>
                <FormattedMessage id="ContactUsForm.emailSent" />
              </span>
            );
          } else {
            resendEmailMessage = (
              <span
                className={css.helperLink}
                onClick={this.handleResendVerificationEmail}
                role="button"
              >
                <FormattedMessage id="ContactUsForm.resendEmailVerificationText" />
              </span>
            );
          }

          // Email status info: unverified, verified and pending email (aka changed unverified email)
          let emailVerifiedInfo = null;

          if (emailVerified && !pendingEmail && !emailChanged) {
            // Current email is verified and there's no pending unverified email
            emailVerifiedInfo = (
              <span className={css.emailVerified}>
                <FormattedMessage id="ContactUsForm.emailVerified" />
              </span>
            );
          } else if (!emailVerified && !pendingEmail) {
            // Current email is unverified. This is the email given in sign up form

            emailVerifiedInfo = (
              <span className={css.emailUnverified}>
                <FormattedMessage
                  id="ContactUsForm.emailUnverified"
                  values={{ resendEmailMessage }}
                />
              </span>
            );
          } else if (pendingEmail) {
            // Current email has been tried to change, but the new address is not yet verified

            const pendingEmailStyled = <span className={css.emailStyle}>{pendingEmail}</span>;
            const pendingEmailCheckInbox = (
              <span className={css.checkInbox}>
                <FormattedMessage
                  id="ContactUsForm.pendingEmailCheckInbox"
                  values={{ pendingEmail: pendingEmailStyled }}
                />
              </span>
            );

            emailVerifiedInfo = (
              <span className={css.pendingEmailUnverified}>
                <FormattedMessage
                  id="ContactUsForm.pendingEmailUnverified"
                  values={{ pendingEmailCheckInbox, resendEmailMessage }}
                />
              </span>
            );
          }

          // generic error
          const isGenericEmailError = saveEmailError && !(emailTakenErrorText || passwordErrorText);

          let genericError = null;

          if (isGenericEmailError) {
            genericError = (
              <span className={css.error}>
                <FormattedMessage id="ContactUsForm.genericFailure" />
              </span>
            );
          } else if (isGenericEmailError) {
            genericError = (
              <span className={css.error}>
                <FormattedMessage id="ContactUsForm.genericEmailFailure" />
              </span>
            );
          } else if (savePhoneNumberError) {
            genericError = (
              <span className={css.error}>
                <FormattedMessage id="ContactUsForm.genericPhoneNumberFailure" />
              </span>
            );
          }

          const sendPasswordLink = (
            <span className={css.helperLink} onClick={this.handleResetPassword} role="button">
              <FormattedMessage id="ContactUsForm.resetPasswordLinkText" />
            </span>
          );

          const resendPasswordLink = (
            <span className={css.helperLink} onClick={this.handleResetPassword} role="button">
              <FormattedMessage id="ContactUsForm.resendPasswordLinkText" />
            </span>
          );

          const resetPasswordLink =
            this.state.showResetPasswordMessage || resetPasswordInProgress ? (
              <>
                <FormattedMessage
                  id="ContactUsForm.resetPasswordLinkSent"
                  values={{
                    email: <span className={css.emailStyle}>{currentUser.attributes.email}</span>,
                  }}
                />{' '}
                {resendPasswordLink}
              </>
            ) : (
              sendPasswordLink
            );

          const classes = classNames(rootClassName || css.root, className);
          const submittedOnce = Object.keys(this.submittedValues).length > 0;
          const pristineSinceLastSubmit = submittedOnce && isEqual(values, this.submittedValues);
          const submitDisabled =
            invalid ||
            pristineSinceLastSubmit ||
            inProgress;

          return (
            <Form
              className={classes}
              onSubmit={e => {
                this.submittedValues = values;
                handleSubmit(e);
              }}
            >
              <div className={css.contactDetailsSection}>
                <FieldTextInput
                  type="name"
                  name="name"
                  id={formId ? `${formId}.name` : 'name'}
                  label={nameLabel}
                  placeholder={namePlaceholder}
                />
                <FieldTextInput
                  type="email"
                  name="email"
                  id={formId ? `${formId}.email` : 'email'}
                  label={emailLabel}
                  placeholder={emailPlaceholder}
                  validate={validators.composeValidators(emailRequired, emailValid)}
                  customErrorText={emailTouched ? null : emailTakenErrorText}
                />
                <FieldTextInput
                  type="message"
                  name="message"
                  id={formId ? `${formId}.message` : 'message'}
                  label={messageLabel}
                  placeholder={messagePlaceholder}
                  validate={validators.composeValidators(messageRequired)}
                />
              </div>

              <div className={css.bottomWrapper}>
                {genericError}
                <PrimaryButton
                  type="submit"
                  inProgress={inProgress}
                  disabled={submitDisabled}
                >
                  <FormattedMessage id="ContactUsForm.saveChanges" />
                </PrimaryButton>
              </div>
            </Form>
          );
        }}
      />
    );
  }
}

ContactUsFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  formId: null,
  saveEmailError: null,
  savePhoneNumberError: null,
  inProgress: false,
  sendVerificationEmailError: null,
  sendVerificationEmailInProgress: false,
  email: null,
  phoneNumber: null,
  resetPasswordInProgress: false,
  resetPasswordError: null,
};

const { bool, func, string } = PropTypes;

ContactUsFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  formId: string,
  saveEmailError: propTypes.error,
  savePhoneNumberError: propTypes.error,
  inProgress: bool,
  intl: intlShape.isRequired,
  onResendVerificationEmail: func.isRequired,
  sendVerificationEmailError: propTypes.error,
  sendVerificationEmailInProgress: bool,
  resetPasswordInProgress: bool,
  resetPasswordError: propTypes.error,
};

const ContactUsForm = compose(injectIntl)(ContactUsFormComponent);

ContactUsForm.displayName = 'ContactUsForm';

export default ContactUsForm;
