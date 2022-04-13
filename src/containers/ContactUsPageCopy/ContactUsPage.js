import React from 'react';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import css from './ContactUsPage.module.css';
import {
    LayoutSingleColumn,
    LayoutWrapperTopbar,
    LayoutWrapperMain,
    LayoutWrapperFooter,
    Footer,
    ExternalLink,
  } from '../../components';
import ContactUsDetailsForm from './ContactUsDetailsForm/ContactUsDetailsForm';

const user = ensureCurrentUser(currentUser);
const currentEmail = user.attributes.email || '';
const protectedData = user.attributes.profile.protectedData || {};
const currentPhoneNumber = protectedData.phoneNumber || '';
const contactInfoForm = user.id ? (
<ContactDetailsForm
  className={css.form}
  initialValues={{ email: currentEmail, phoneNumber: currentPhoneNumber }}
  saveEmailError={saveEmailError}
  savePhoneNumberError={savePhoneNumberError}
  currentUser={currentUser}
  onResendVerificationEmail={onResendVerificationEmail}
  onResetPassword={onResetPassword}
  onSubmit={values => onSubmitContactDetails({ ...values, currentEmail, currentPhoneNumber })}
  onChange={onChange}
  inProgress={saveContactDetailsInProgress}
  ready={contactDetailsChanged}
  sendVerificationEmailInProgress={sendVerificationEmailInProgress}
  sendVerificationEmailError={sendVerificationEmailError}
  resetPasswordInProgress={resetPasswordInProgress}
  resetPasswordError={resetPasswordError}
/>
) : null;

const title = intl.formatMessage({ id: 'ContactDetailsPage.title' });
const ContactUsPage = () => {
    return (
        <Page title={title} scrollingDisabled={scrollingDisabled}>
          <LayoutSideNavigation>
            <LayoutWrapperTopbar>
              <TopbarContainer
                currentPage="ContactUsPage"
                desktopClassName={css.desktopTopbar}
                mobileClassName={css.mobileTopbar}
              />
              <UserNav selectedPageName="ContactUsPage" />
            </LayoutWrapperTopbar>
            <LayoutWrapperAccountSettingsSideNav currentTab="ContactUsPage" />
            <LayoutWrapperMain>
              <div className={css.content}>
                <h1 className={css.title}>
                  <FormattedMessage id="ContactUsPage.heading" />
                </h1>
                {contactInfoForm}
              </div>
            </LayoutWrapperMain>
            <LayoutWrapperFooter>
              <Footer />
            </LayoutWrapperFooter>
          </LayoutSideNavigation>
        </Page>
    );
};


export default ContactUsPage

