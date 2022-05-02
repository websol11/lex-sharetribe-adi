import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import { sendVerificationEmail } from '../../ducks/user.duck';
import { isScrollingDisabled } from '../../ducks/UI.duck';

import {
  LayoutSingleColumn,
  LayoutSideNavigation,
  LayoutWrapperMain,
  LayoutWrapperAccountSettingsSideNav,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  Page,
  UserNav,
  NamedLink
} from '../../components';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';

import ContactUsForm from './ContactUsForm/ContactUsForm';

import {
  saveContactUs,
  saveContactUsClear,
  resetPassword,
} from './ContactUsPage.duck';
import css from './ContactUsPage.module.css';

export const ContactUsPageComponent = props => {
  const {
    saveEmailError,
    savePhoneNumberError,
    currentUser,
    contactDetailsChanged,
    onChange,
    scrollingDisabled,
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
    onResendVerificationEmail,
    onSubmitContactUs,
    onResetPassword,
    resetPasswordInProgress,
    resetPasswordError,
    intl,
  } = props;

  const user = ensureCurrentUser(currentUser);
  const currentEmail = user.attributes.email || '';
  const protectedData = user.attributes.profile.protectedData || {};
  const currentName = user.attributes.profile.firstName || '';
  const loginLink = (
    <NamedLink name="LoginPage" className={css.LoginPage}>
      {"Log in"}
    </NamedLink>
  );
  const contactInfoForm = user.id ? (
    <ContactUsForm
      className={css.form}
      initialValues={{ email: currentEmail, name: currentName }}
      saveEmailError={saveEmailError}
      currentUser={currentUser}
      onResendVerificationEmail={onResendVerificationEmail}
      onResetPassword={onResetPassword}
      onSubmit={values => onSubmitContactUs({ ...values, currentEmail, currentName })}
      onChange={onChange}
      sendVerificationEmailInProgress={sendVerificationEmailInProgress}
      sendVerificationEmailError={sendVerificationEmailError}
      resetPasswordInProgress={resetPasswordInProgress}
      resetPasswordError={resetPasswordError}
    />
  ) : (
    <h2>
    <FormattedMessage
      id="ContactUsPage.normalLabel"
      values={{ loginLink }}
    />
    </h2>
  );

  const title = intl.formatMessage({ id: 'ContactUsPage.title' });

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer
            currentPage="ContactUsPage"
            desktopClassName={css.desktopTopbar}
            mobileClassName={css.mobileTopbar}
          />
        </LayoutWrapperTopbar>
        <LayoutWrapperMain className={css.staticPageWrapper}>
            <h1 className={css.title}>
              <FormattedMessage id="ContactUsPage.heading" />
            </h1>
            {contactInfoForm}
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
  );
};

ContactUsPageComponent.defaultProps = {
  saveEmailError: null,
  savePhoneNumberError: null,
  currentUser: null,
  sendVerificationEmailError: null,
  resetPasswordInProgress: false,
  resetPasswordError: null,
};

const { bool, func } = PropTypes;

ContactUsPageComponent.propTypes = {
  saveEmailError: propTypes.error,
  savePhoneNumberError: propTypes.error,
  currentUser: propTypes.currentUser,
  onChange: func.isRequired,
  onSubmitContactUs: func.isRequired,
  scrollingDisabled: bool.isRequired,
  sendVerificationEmailInProgress: bool.isRequired,
  sendVerificationEmailError: propTypes.error,
  onResendVerificationEmail: func.isRequired,
  resetPasswordInProgress: bool,
  resetPasswordError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  // Topbar needs user info.
  const { currentUser, sendVerificationEmailInProgress, sendVerificationEmailError } = state.user;

  return {

    currentUser,
    scrollingDisabled: isScrollingDisabled(state),
    sendVerificationEmailInProgress,
    sendVerificationEmailError,

  };
};

const mapDispatchToProps = dispatch => ({
  onChange: () => dispatch(saveContactUsClear()),
  onResendVerificationEmail: () => dispatch(sendVerificationEmail()),
  onSubmitContactUs: values => dispatch(saveContactUs(values)),
  onResetPassword: values => dispatch(resetPassword(values)),
});

const ContactUsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(ContactUsPageComponent);

export default ContactUsPage;
