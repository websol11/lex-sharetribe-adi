import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import config from '../../config';
import { injectIntl, intlShape } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/UI.duck';

import {
  Page,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
} from '../../components';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';

import facebookImage from '../../assets/sneakertimeFacebook-1200x630.jpg';
import twitterImage from '../../assets/sneakertimeTwitter-600x314.jpg';

import SectionHero from './SectionHero/SectionHero';
import SectionHowItWorks from './SectionHowItWorks/SectionHowItWorks';
import SectionFilteredSearches from './SectionFilteredSearches/SectionFilteredSearches';
import css from './LandingPage.module.css';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import { searchMapListings, setActiveListing, searchListings, loadData } from '../SearchPage/SearchPage.duck';

export const LandingPageComponent = props => {
  const { history, intl, location, scrollingDisabled, landingPageListings } = props;

  console.log("HERE OF", landingPageListings);
  // Schema for search engines (helps them to understand what this page is about)
  // http://schema.org
  // We are using JSON-LD format
  const siteTitle = config.siteTitle;
  const schemaTitle = intl.formatMessage({ id: 'LandingPage.schemaTitle' }, { siteTitle });
  const schemaDescription = intl.formatMessage({ id: 'LandingPage.schemaDescription' });
  const schemaImage = `${config.canonicalRootURL}${facebookImage}`;

  return (
    <Page
      className={css.root}
      scrollingDisabled={scrollingDisabled}
      landingPageListings={landingPageListings}
      contentType="website"
      description={schemaDescription}
      title={schemaTitle}
      facebookImages={[{ url: facebookImage, width: 1200, height: 630 }]}
      twitterImages={[
        { url: `${config.canonicalRootURL}${twitterImage}`, width: 600, height: 314 },
      ]}
      schema={{
        '@context': 'http://schema.org',
        '@type': 'WebPage',
        description: schemaDescription,
        name: schemaTitle,
        image: [schemaImage],
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>
        <LayoutWrapperMain>
          <div className={css.heroContainer}>
            <SectionHero
              rootClassName={css.heroRoot}
              className={css.hero}
              history={history}
              location={location}
            />
          </div>
          <ul className={css.sections}>
            <li className={css.section}>
              <div className={css.sectionContentFirstChild}>
                <SectionFilteredSearches
                  landingPageListings={landingPageListings}
                />
              </div>
            </li>
            <li className={css.section}>
              <div className={css.sectionContent}>
                <SectionHowItWorks />
              </div>
            </li>
          </ul>
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
  );
};

const { bool, object } = PropTypes;

LandingPageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,

  // from withRouter
  history: object.isRequired,
  location: object.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const {
    currentPageResultIds,
    pagination,
    searchInProgress,
    searchListingsError,
    searchParams,
  } = state.SearchPage;
  const pageListings = getListingsById(state, currentPageResultIds);
  console.log("LAND pageListings ", pageListings);
  return {
    scrollingDisabled: isScrollingDisabled(state),

    landingPageListings: pageListings,    
  };
};

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const LandingPage = compose(
  withRouter,
  connect(mapStateToProps),
  injectIntl
)(LandingPageComponent);

export default LandingPage;