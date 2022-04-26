import React, { Component } from 'react';

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
} from '../../components';
import StaticPage from '../../containers/StaticPage/StaticPage';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';

import css from './DepartmentPage.module.css';
import { findOptionsForSelectFilter } from '../../util/search';
import { ListingCard, NamedLink } from '../../components';
import { lazyLoadWithDimensions } from '../../util/contextHelpers';


// Thumbnail image for the search "card"
class ThumbnailImage extends Component {
  render() {
    const { alt, ...rest } = this.props;
    return <img alt={alt} {...rest} />;
  }
}
// Load the image only if it's close to viewport (user has scrolled the page enough).
const LazyImage = lazyLoadWithDimensions(ThumbnailImage);

const DepartmentPageComponent = props => {
  const { scrollingDisabled, intl } = props;
  const siteTitle = config.siteTitle;

  const customConfig = config.custom;
  const categoryOptions = findOptionsForSelectFilter('category', customConfig.filters);
  console.log("EED",categoryOptions)

  return (
    <StaticPage
      title="Block Lunch Department"
      schema={{
        '@context': 'http://schema.org',
        '@type': 'DepartmentPage',
        description: 'Department Block Lunch',
        name: 'Department page',
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>

        <LayoutWrapperMain className={css.staticPageWrapper}>

          <div className={css.sectionDetails}>
            <h2 className={css.detailsTitle}>
              <FormattedMessage id="DepartmentPage.detailsTitle" />
            </h2>
            <div className={css.filteredSearches}>
              {categoryOptions.map(detail => (
                <NamedLink name="SearchPage" to={{ search: "?pub_category="+detail.label }} className={css.searchLink}>
                  <div className={css.imageWrapper}>
                    <div className={css.aspectWrapper}>
                      <LazyImage src={"https://ui-avatars.com/api/?name="+detail.label+"&size=648"} alt={detail.label} className={css.searchImage} />
                    </div>
                  </div>
                  <div className={css.linkText}>
                    <FormattedMessage
                      id="SectionFilteredSearches.filteredSearch"
                      values={{ filter: detail.label }}
                    />
                  </div>
                </NamedLink>                
              ))}
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

const { bool } = PropTypes;

DepartmentPageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  return {
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const DepartmentPage = compose(
  connect(mapStateToProps),
  injectIntl
)(DepartmentPageComponent);

export default DepartmentPage;
