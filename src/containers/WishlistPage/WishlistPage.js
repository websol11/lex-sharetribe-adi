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
    getListing,
    getOwnListing
  } = props;
  const siteTitle = config.siteTitle;
  console.log("EED", currentUser,getListing('625f73f1-2ba6-44e4-9831-9aed015e66e9'),getOwnListing('625f73f1-2ba6-44e4-9831-9aed015e66e9'))
  const { UUID } = sdkTypes;

  const customConfig = config.custom;
  const categoryOptions = findOptionsForSelectFilter('category', customConfig.filters);
  const allLikedProductIds = currentUser?.attributes?.profile?.privateData?.likedListings;
  let likedProducts = [];

  if (allLikedProductIds != undefined){
    allLikedProductIds.map((each_id, i)=>{
      let listing = getListing(each_id);
      let currentListing = ensureOwnListing(getListing(each_id));
      //console.log("RE", new UUID(each_id), currentListing)
      console.log("LIST:->\n",each_id, listing, "\n\n");
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
  enquiryModalOpenForListingId: null,
  showListingError: null,
  reviews: [],
  fetchReviewsError: null,
  timeSlots: null,
  fetchTimeSlotsError: null,
  sendEnquiryError: null,
  customConfig: config.custom,
  lineItems: null,
  fetchLineItemsError: null,
};

/*const { bool, func } = PropTypes;*/

WishlistPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  getListing: func.isRequired,
  getOwnListing: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  scrollingDisabled: bool.isRequired,
  enquiryModalOpenForListingId: string,
  showListingError: propTypes.error,
  callSetInitialValues: func.isRequired,
  reviews: arrayOf(propTypes.review),
  fetchReviewsError: propTypes.error,
  timeSlots: arrayOf(propTypes.timeSlot),
  fetchTimeSlotsError: propTypes.error,
  sendEnquiryInProgress: bool.isRequired,
  sendEnquiryError: propTypes.error,
  onSendEnquiry: func.isRequired,
  onInitializeCardPaymentData: func,
  customConfig: object,
  onFetchTransactionLineItems: func,
  lineItems: array,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,
  updateLikesInProgress:  bool,
};

/*const mapStateToProps = state => {
  const { isAuthenticated } = state.Auth;
  const {
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    enquiryModalOpenForListingId,
  } = state.ListingPage;
  const { currentUser } = state.user;
  // Topbar needs user info.
  const getListing = id => {
    const ref = { id, type: 'listing' };

    const listings = getMarketplaceEntities(state, [ref]);
    console.log("RE2", listings)
    return listings.length === 1 ? listings[0] : null;
  };
  const getOwnListing = id => {
    const listings = getMarketplaceEntities(state, [{ id, type: 'ownListing' }]);
    console.log("RE OWN 2", listings)

    return listings.length === 1 ? listings[0] : null;
  };
  return {
    currentUser,
    getListing,
    getOwnListing,
    scrollingDisabled: isScrollingDisabled(state),
  };
};*/

const mapStateToProps = state => {
  const { isAuthenticated } = state.Auth;
  const {
    showListingError,
    reviews,
    fetchReviewsError,
    timeSlots,
    fetchTimeSlotsError,
    sendEnquiryInProgress,
    sendEnquiryError,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    enquiryModalOpenForListingId,
  } = state.ListingPage;
  const { currentUser } = state.user;

  const getListing = id => {
    const ref = { id, type: 'listing' };
    const listings = getMarketplaceEntities(state, [ref]);
    return listings.length === 1 ? listings[0] : null;
  };

  const getOwnListing = id => {
    const ref = { id, type: 'ownListing' };
    const listings = getMarketplaceEntities(state, [ref]);
    return listings.length === 1 ? listings[0] : null;
  };

  return {
    isAuthenticated,
    currentUser,
    getListing,
    getOwnListing,
    scrollingDisabled: isScrollingDisabled(state),
    enquiryModalOpenForListingId,
    showListingError,
    reviews,
    fetchReviewsError,
    timeSlots,
    fetchTimeSlotsError,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    sendEnquiryInProgress,
    sendEnquiryError,
  };
};

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  callSetInitialValues: (setInitialValues, values, saveToSessionStorage) =>
    dispatch(setInitialValues(values, saveToSessionStorage)),
  onSendEnquiry: (listingId, message) => dispatch(sendEnquiry(listingId, message)),
});

const WishlistPage = compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(WishlistPageComponent);

export default WishlistPage;