import React, { Component } from 'react';
import { array, arrayOf, bool, func, shape, string, oneOf, object, PropTypes, number} from 'prop-types';
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
  PrimaryButton,
  FieldSelect
} from '../../components';
import StaticPage from '../../containers/StaticPage/StaticPage';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';

import css from './CartPage.module.css';
import { findOptionsForSelectFilter } from '../../util/search';
import { ListingCard, NamedLink } from '../../components';
import { lazyLoadWithDimensions } from '../../util/contextHelpers';
import { propTypes } from '../../util/types';

import { updateCart } from './CartPage.duck';

import { types as sdkTypes } from '../../util/sdkLoader';
import { withRouter } from 'react-router-dom';
import { numberAtLeast, required } from '../../util/validators';
import { Form as FinalForm, FormSpy } from 'react-final-form';


// Thumbnail image for the search "card"
class ThumbnailImage extends Component {
  render() {
    const { alt, ...rest } = this.props;
    return <img alt={alt} {...rest} />;
  }
}
// Load the image only if it's close to viewport (user has scrolled the page enough).
const LazyImage = lazyLoadWithDimensions(ThumbnailImage);


export const CartPageComponent = props => {

  const {
    currentUser,
    intl,
    cartProducts,
    onUpdateCart,
    updateCartInProgress,
  } = props;
  console.log("CPC:-",cartProducts);

  const quantityRequiredMsg = intl.formatMessage({ id: 'ProductOrderForm.quantityRequired' });
  return (
    <StaticPage
      title="Block Lunch Cart"
      schema={{
        '@context': 'http://schema.org',
        '@type': 'CartPage',
        description: 'Cart Page Block Lunch',
        name: 'Cart',
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>

        <LayoutWrapperMain className={css.staticPageWrapper}>

          <div className={css.sectionDetails}>
            <h2 className={css.details}>
              <FormattedMessage id="CartPage.detailsTitle" />
            </h2>
            {
              cartProducts.length?(
              <div className={css.filteredSearches}>
                {cartProducts.map((detail, i) => (
                  <div key={i} className={css.wishRow}>
                    <div className={css.wishCol}>
                      <NamedLink name="SearchPage" to={{ search: "/l/"+detail.attributes.title+"/"+detail.id.uuid }} className={css.searchLink}>
                        <div className={css.imageWrapper}>
                          <div className={css.aspectWrapper}>
                            <img src={detail.images[0].attributes.variants.default.url} alt={detail.attributes.label} className={css.wishImage} />
                          </div>
                        </div>
                        
                      </NamedLink>
                    </div>
                    <div className={css.wishCol}>
                      <div className={css.linkText}>
                          <FormattedMessage
                            id="CartPage.itemTitle"
                            values={{ filter: detail.attributes.title }}
                            className={css.productTitle}
                          />
                      </div>
                      <div className={css.shippingPrice}>
                          <FormattedMessage
                            id="CartPage.itemBasePrice"
                            values={{ filter: "$" + (detail.attributes.price.amount/100)}}
                          />/item
                          +
                          {
                            detail.attributes.publicData.shippingPriceInSubunitsAdditionalItems?(
                              <FormattedMessage
                                id="CartPage.itemShippingAdditionalPrice"
                                values={{ filter: "$" + ((detail.attributes.publicData.shippingPriceInSubunitsOneItem/100) + ((detail.quantity-1) * detail.attributes.publicData.shippingPriceInSubunitsAdditionalItems/100)) + " shipping"}}
                              />
                            ):(
                               <FormattedMessage
                                id="CartPage.itemShippingPrice"
                                values={{ filter: "$" + (detail.attributes.publicData.shippingPriceInSubunitsOneItem/100) + " shipping"}}
                              />
                            )
                          }
                      </div>
                      <div className={css.totalPrice}>
                        {detail.attributes.publicData.shippingPriceInSubunitsAdditionalItems?(
                          <FormattedMessage
                            id="CartPage.itemTotalPrice"
                            values={{ filter: "$" + ((detail.attributes.price.amount/100 * detail.quantity) + ((detail.attributes.publicData.shippingPriceInSubunitsOneItem/100) + ((detail.quantity-1)*(detail.attributes.publicData.shippingPriceInSubunitsAdditionalItems/100))))}}
                          />
                        ):(
                            <FormattedMessage
                                id="CartPage.itemTotalPrice"
                                values={{ filter: "$" + (detail.attributes.price.amount/100 * detail.quantity)}}
                            />
                         )
                        }
                      </div>
                      <div className={css.cartBottom} >
                        <select 
                            className={css.quantityField}
                            defaultValue={detail.quantity}
                            onChange={(e) => {
                                if (currentUser)
                                  onUpdateCart(detail.id.uuid, e.target.value, "update");
                            }}
                        >
                           <option disabled value="">
                            {intl.formatMessage({ id: 'ProductOrderForm.selectQuantityOption' })}
                          </option>
                          {[...Array(detail.currentStock.attributes.quantity).keys()].map(i => i + 1).map(quantity => (
                            <option key={quantity} value={quantity}>
                              {intl.formatMessage({ id: 'ProductOrderForm.quantityOption' }, { quantity })}
                            </option>
                          ))}
                        </select>
                        <div className={css.extraButton}>
                              <span 
                                onClick={() => {
                                if (currentUser) {
                                  onUpdateCart(detail.id.uuid, "", "remove");
                                }
                               }}>
                               Delete
                              </span>
                              |
                              <span
                                onClick={() => {
                                if (currentUser) {
                                  onUpdateCart(detail.id.uuid, "", "wishlist");
                                }
                               }}>
                               Save for later
                              </span>
                        </div>
                      </div>
                    </div>
                    <div className={css.wishCol}>
                      <span className={css.buttonRemove}
                        onClick={() => {
                            console.log("Checkout");
                        /*if (currentUser) {
                          onUpdateCart(detail.id.uuid);
                        }*/
                       }}>
                       Checkout
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              ):
              (<span>You do not have any products in the cart.</span>)
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

CartPageComponent.defaultProps = {
  unitType: config.lineItemUnitType,
  currentUser: null,
  cartProducts:[],
  currentStock: null,
};


CartPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  updateCartInProgress:  bool,
  cartProducts: array,
  currentStock: number,
};


const mapStateToProps = state => {
  const { isAuthenticated } = state.Auth;
  const {
    cartProducts,
  } = state.CartPage;
  const { currentUser } = state.user;

  return {
    isAuthenticated,
    currentUser,
    cartProducts,
  };
};

const mapDispatchToProps = dispatch => ({
  onUpdateCart: (listingId, quantity, action) => dispatch(updateCart({"id":listingId, "quantity":quantity,"action":action})),
});

const CartPage = compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(CartPageComponent);

export default CartPage;