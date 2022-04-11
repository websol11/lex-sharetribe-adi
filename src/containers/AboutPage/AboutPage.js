import React from 'react';

import config from '../../config';
import { twitterPageURL } from '../../util/urlHelpers';
import {
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
  ExternalLink,
} from '../../components';
import StaticPage from '../../containers/StaticPage/StaticPage';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';

import css from './AboutPage.module.css';
import image from './block_about.jpg';

const AboutPage = () => {
  const { siteTwitterHandle, siteFacebookPage } = config;
  const siteTwitterPage = twitterPageURL(siteTwitterHandle);

  // prettier-ignore
  return (
    <StaticPage
      title="About Us"
      schema={{
        '@context': 'http://schema.org',
        '@type': 'AboutPage',
        description: 'About Sneakertime',
        name: 'About page',
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>

        <LayoutWrapperMain className={css.staticPageWrapper}>
          <h1 className={css.pageTitle}>There’s no such thing as too many nice things.</h1>
          <img className={css.coverImage} src={image} alt="My first ice cream." />

          <div className={css.contentWrapper}>
            <div className={css.contentSide}>
              <p>"We built Block Lunch because people needed a dedicated place to buy and sell items with crypto."</p>
            </div>

            <div className={css.contentMain}>
              <h2>
                Whether you’re a casual buyer or an experienced seller, you’ll find everything you need in the Block Lunch marketplace. Search, filter, and sort to find the items you’re looking for, and then purchase with 100+ cryptos.
              </h2>

              <h3 className={css.subtitle}>Browsing the marketplace?</h3>

              <p>
                Have peace of mind knowing that every purchase made supports real people in the crypto economy. Buyers pay in crypto, and sellers are rewarded in crypto for every purchase.
              </p>

              <h3 id="contact" className={css.subtitle}>
                Do you have items to sell?
              </h3>
              <p>
                Block Lunch provides a streamlined solution to selling items and earning crypto. If you have a pair of sneakers or a warehouse of items waiting to be sold, selling your items for crypto has never been easier.
              </p>
              
            </div>
          </div>
        </LayoutWrapperMain>

        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </StaticPage>
  );
};

export default AboutPage;
