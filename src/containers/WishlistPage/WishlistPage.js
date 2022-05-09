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
  PrimaryButton
} from '../../components';
import StaticPage from '../../containers/StaticPage/StaticPage';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';

import css from './WishlistPage.module.css';
import { findOptionsForSelectFilter } from '../../util/search';
import { ListingCard, NamedLink } from '../../components';
import { lazyLoadWithDimensions } from '../../util/contextHelpers';
import { propTypes } from '../../util/types';

import { fetchCurrentUserWishlistedProducts } from '../../ducks/user.duck';
import { updateLikes } from './WishlistPage.duck';

import { types as sdkTypes } from '../../util/sdkLoader';
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
    intl,
    wishlistProducts,
    fetchCurrentUserWishlistedProductsError,
    onUpdateLikes,
    updateLikesInProgress,
  } = props;
  return (
    <StaticPage
      title="Block Lunch Wishlist"
      schema={{
        '@context': 'http://schema.org',
        '@type': 'WishlistPage',
        description: 'Wishlist Block Lunch',
        name: 'Wishlist',
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>

        <LayoutWrapperMain className={css.staticPageWrapper}>

          <div className={css.sectionDetails}>
            <h2 className={css.details}>
              <FormattedMessage id="WishlistPage.detailsTitle" />
            </h2>
            {
              wishlistProducts?(
              <div className={css.filteredSearches}>
                {wishlistProducts.map((detail, i) => (
                  <div key={i} className={css.wishRow}>
                    <div className={css.wishCol}>
                      <NamedLink name="SearchPage" to={{ search: "/l/"+detail.attributes.title+"/"+detail.id.uuid }} className={css.searchLink}>
                        <div className={css.imageWrapper}>
                          <img src={detail.images[0].attributes.variants.default.url} alt={detail.attributes.label}/>                          
                        </div>
                        
                      </NamedLink>
                    </div>
                    <div className={css.wishCol}>
                      <div className={css.linkText}>
                          <FormattedMessage
                            id="SectionFilteredSearches.filteredSearch"
                            values={{ filter: detail.attributes.title }}
                          />
                      </div>
                      <FormattedMessage
                        id="SectionFilteredSearches.filteredSearch"
                        values={{ filter: "$" + (detail.attributes.price.amount/100) }}
                      />
                    </div>
                    <div className={css.wishCol}>
                      <span className={css.buttonRemove}
                        onClick={() => {
                        if (currentUser) {
                          onUpdateLikes(detail.id.uuid);
                        }
                       }}>
                       Remove
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              ):
              null
            }
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
  wishlistProducts:[],
  fetchCurrentUserWishlistedProductsError: null
};


WishlistPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  updateLikesInProgress:  bool,
  fetchCurrentUserWishlistedProductsProgress: bool,
  wishlistProducts: array,
  fetchCurrentUserWishlistedProductsError: propTypes.error, 
};


const mapStateToProps = state => {
  const { isAuthenticated } = state.Auth;
  const {
    showListingError,
    fetchCurrentUserWishlistedProductsRequest,
    fetchCurrentUserWishlistedProductsSuccess,
    wishlistProducts,
    fetchCurrentUserWishlistedProductsError
  } = state.WishlistPage;
  const { currentUser } = state.user;



  return {
    isAuthenticated,
    currentUser,
    wishlistProducts,
    fetchCurrentUserWishlistedProductsError
  };
};



const mapDispatchToProps = dispatch => ({
  onUpdateLikes: (listingId) => dispatch(updateLikes(listingId)),
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