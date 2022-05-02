import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import config from '../../config';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
  ExternalLink,
  FaqService,
  NamedLink
} from '../../components';
import StaticPage from '../../containers/StaticPage/StaticPage';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';

import css from './FaqPage.module.css';

const FaqPageComponent = props => {
  const { scrollingDisabled, intl } = props;
  const siteTitle = config.siteTitle;
  const signUpLink = (
    <NamedLink name="SignupPage" className={css.SignupPage}>
      {"Sign up"}
    </NamedLink>
  );
  return (
    <StaticPage
      title="Block Lunch FAQ"
      schema={{
        '@context': 'http://schema.org',
        '@type': 'FaqPage',
        description: 'Faq Block Lunch',
        name: 'Faq page',
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>

        <LayoutWrapperMain className={css.staticPageWrapper}>
          <h2>
            Frequently Asked Questions
          </h2>

          <h3 className={css.subtitle}>Q: What is Block Lunch?</h3>
          <span>A: Block Lunch is your go-to marketplace to buy items with <a target="_blank" href="https://nowpayments.io/supported-coins">100+ cryptos.</a></span>

          <h3 className={css.subtitle}>Q: Where is Block Lunch available?</h3>
          <span>A: Block Lunch is available in the United States. We expect to expand to new regions soon, so stay tuned for announcements.</span>
          
          <h3 className={css.subtitle}>Q: Who can purchase items?</h3>
          <span>A: Anyone in the United States over the age of 18 can purchase items.</span>
          
          <h3 className={css.subtitle}>Q: How do I sell items?</h3>
          <span>A: {signUpLink} as a seller today to list your items on Block Lunch.</span>

          <h3 className={css.subtitle}>Q: What cryptos are accepted?</h3>
          <span>A: <a href="https://nowpayments.io/supported-coins" target="_blank">100+ cryptos </a> are accepted using our <a href="https://nowpayments.io" target="_blank">NOWPayments</a> integration.</span>
          
          <h3 className={css.subtitle}>Q: What fees are taken for items?</h3>
          <span>A: A flat 10% fee is taken from all sales.</span>

          <h3 className={css.subtitle}>Q: How do seller payouts work?</h3>
          <span>A: Seller payouts to the provided wallet address happen monthly, on the 15th of each month.</span>
          
          <h3 className={css.subtitle}>Q: What is the StarDust token ($DUST)?</h3>
          <span>A: We’re thrilled to be an approved vendor of the <a href="https://blocklunch.com/stardust" target="_blank"> StarDust ecosystem </a> . All Block Lunch payouts are in StarDust ($DUST), based on our marketplace’s portion of the token’s monthly <a href="https://blocklunch.com/schedule" target="_blank"> minting schedule </a> .</span>

          <h3 className={css.subtitle}>Q: Where can I see more documentation?</h3>
          <span>A: Make sure to read the full documentation <a href="http://blocklunch.com/docs" target="_blank"> here </a> before selling items on Block Lunch.</span>
        </LayoutWrapperMain>

        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </StaticPage>
  );
};

const { bool } = PropTypes;

FaqPageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  return {
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const FaqPage = compose(
  connect(mapStateToProps),
  injectIntl
)(FaqPageComponent);

export default FaqPage;
