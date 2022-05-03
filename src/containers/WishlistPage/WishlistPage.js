import React, { Component } from 'react';
import { array, arrayOf, bool, func, shape, string, oneOf, object, PropTypes } from 'prop-types';
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

import css from './WishlistPage.module.css';
import { findOptionsForSelectFilter } from '../../util/search';
import { ListingCard, NamedLink } from '../../components';
import { lazyLoadWithDimensions } from '../../util/contextHelpers';
import { propTypes } from '../../util/types';
import { getMarketplaceEntities, getListingsById } from '../../ducks/marketplaceData.duck';
import { fetchCurrentUserWishlistedProducts } from '../../ducks/user.duck';
import { loadData } from './WishlistPage.duck';

import { types as sdkTypes } from '../../util/sdkLoader';
import { ensureOwnListing } from '../../util/data';
import { withRouter } from 'react-router-dom';

// Thumbnail image for the search "card"
class ThumbnailImage extends Component {
  render() {
    const { alt, ...rest } = this.props;
    return <img alt={alt} {...rest} />;
  }
}
// Load the image only if it's close to viewport (user has scrolled the page enough).
const LazyImage = lazyLoadWithDimensions(ThumbnailImage);


export const WishlistPageComponent = props => {

  const {
    currentUser,
    onChange,
    scrollingDisabled,
    listings,
    intl,
    lineItems,
    currentListing,
    wishlistedProducts
  } = props;
  const siteTitle = config.siteTitle;
  //console.log("EED", currentUser,getListing('625f73f1-2ba6-44e4-9831-9aed015e66e9'),getOwnListing('625f73f1-2ba6-44e4-9831-9aed015e66e9'))
  const { UUID } = sdkTypes;
  console.log("WPINFO",props);
  const customConfig = config.custom;
  const categoryOptions = findOptionsForSelectFilter('category', customConfig.filters);
  const allLikedProductIds = currentUser?.attributes?.profile?.privateData?.likedListings;
  let likedProducts = [];

  if (allLikedProductIds != undefined){
    //console.log("DATA", data);
    allLikedProductIds.map((each_id, i)=>{
      //let listing = getListing(each_id);
      //let currentListing = ensureOwnListing(getListing(each_id));
      console.log("RE", new UUID(each_id), currentListing)
      //console.log("LIST:->\n",each_id, listing, "\n\n");
    });
  }
  //console.log("EED 2:->", allLikedProductIds)

  return (
    <StaticPage
      title="Block Lunch WishlistPage"
      schema={{
        '@context': 'http://schema.org',
        '@type': 'WishlistPage',
        description: 'WishlistPage Block Lunch',
        name: 'WishlistPage page',
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>

        <LayoutWrapperMain className={css.staticPageWrapper}>

          <div className={css.sectionDetails}>
            <h2 className={css.detailsTitle}>
              <FormattedMessage id="WishlistPage.detailsTitle" />
            </h2>
            <div className={css.filteredSearches}>
              {categoryOptions.map((detail, i) => (
                <NamedLink key={i} name="SearchPage" to={{ search: "?pub_category="+detail.label }} className={css.searchLink}>
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

WishlistPageComponent.defaultProps = {
  unitType: config.lineItemUnitType,
  currentUser: null,
  customConfig: config.custom,
  lineItems: null,
  fetchLineItemsError: null,
};


WishlistPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  onManageDisableScrolling: func.isRequired,
  scrollingDisabled: bool.isRequired,
  updateLikesInProgress:  bool,
  fetchCurrentUserWishlistedProductsProgress: bool
};


const mapStateToProps = state => {
  const { isAuthenticated } = state.Auth;
  const {
    showListingError,
    fetchCurrentUserWishlistedProductsRequest,
    fetchCurrentUserWishlistedProductsSuccess,
    fetchCurrentUserWishlistedProductsError
  } = state.ListingPage;
  const { currentUser } = state.user;
  const productIds = currentUser?.attributes?.profile?.privateData?.likedListings;
  console.log("PIDS",productIds);
  const wishlistedProducts = loadData(productIds);
  console.log("WPIDS",wishlistedProducts);



  return {
    isAuthenticated,
    currentUser,
    wishlistedProducts,
    
  };
};

const WishlistPage = compose(
  withRouter,
  connect(
    mapStateToProps
  ),
  injectIntl
)(WishlistPageComponent);

export default WishlistPage;