import React from 'react';
import { renderShallow } from '../../util/test-helpers';
import { fakeIntl } from '../../util/test-data';
import { ContactUsPageComponent } from './ContactUsPage';

const noop = () => null;

describe('ContactUsPage', () => {
  it('matches snapshot', () => {
    const tree = renderShallow(
      <ContactUsPageComponent
        params={{ displayName: 'my-shop' }}
        history={{ push: noop }}
        location={{ search: '' }}
        scrollingDisabled={false}
        authInProgress={false}
        currentUserHasListings={false}
        isAuthenticated={false}
        onChange={noop}
        onLogout={noop}
        onManageDisableScrolling={noop}
        sendVerificationEmailInProgress={false}
        onResendVerificationEmail={noop}
        onSubmitContactDetails={noop}
        saveContactDetailsInProgress={false}
        contactDetailsChanged={false}
        intl={fakeIntl}
      />
    );
    expect(tree).toMatchSnapshot();
  });
});
