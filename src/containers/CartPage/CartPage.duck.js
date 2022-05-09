import pick from 'lodash/pick';

import config from '../../config';
import { types as sdkTypes, util as sdkUtil, createImageVariantConfig } from '../../util/sdkLoader';
import { getStartOf, addTime } from '../../util/dates';
import { storableError } from '../../util/errors';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { transactionLineItems } from '../../util/api';
import * as log from '../../util/log';
import { denormalisedResponseEntities } from '../../util/data';
import { TRANSITION_ENQUIRE } from '../../util/transaction';
import {
  LISTING_PAGE_DRAFT_VARIANT,
  LISTING_PAGE_PENDING_APPROVAL_VARIANT,
} from '../../util/urlHelpers';
import { fetchCurrentUser, fetchCurrentUserHasOrdersSuccess, currentUserShowSuccess } from '../../ducks/user.duck';

const { UUID } = sdkTypes;

// ================ Action types ================ //
// FOR LIKES/WISHLIST
export const FETCH_CURRENT_USER_CART_PRODUCTS_REQUEST = 'app/CartPage/FETCH_CURRENT_USER_CART_PRODUCTS_REQUEST';
export const FETCH_CURRENT_USER_CART_PRODUCTS_SUCCESS = 'app/CartPage/FETCH_CURRENT_USER_CART_PRODUCTS_SUCCESS';
export const FETCH_CURRENT_USER_CART_PRODUCTS_ERROR   = 'app/CartPage/FETCH_CURRENT_USER_CART_PRODUCTS_ERROR';

// FOR ADDTOCART
export const UPDATE_ADD_TO_CART_REQUEST ='app/CartPage/UPDATE_ADDTOCART_REQUEST';
export const UPDATE_ADD_TO_CART_SUCCESS ='app/CartPage/UPDATE_ADDTOCART_SUCCESS';
export const UPDATE_ADD_TO_CART_ERROR = 'app/CartPage/UPDATE_ADDTOCART_ERROR';

// ================ Reducer ================ //

const initialState = {
  id: null,
  showListingError: null,
  reviews: [],
  updateLikesError: null,
  updateCartInProgress: false,
  fetchCurrentUserCartProductsError: null,
  fetchCurrentUserCartProductsProgress: false,
  cartProducts: [],
};

const cartPageReducer = (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {

    case FETCH_CURRENT_USER_CART_PRODUCTS_REQUEST:
      return { ...state, currentUserCartProductsError: null, fetchCurrentUserCartProductsProgress:true };
    case FETCH_CURRENT_USER_CART_PRODUCTS_SUCCESS:
      return { ...state, cartProducts: payload, currentUserCartProducts: payload, fetchCurrentUserCartProductsProgress:false };
    case FETCH_CURRENT_USER_CART_PRODUCTS_ERROR:
      return { ...state, cartProducts: [], currentUserCartProductsError: payload, fetchCurrentUserCartProductsProgress: false };

    case UPDATE_ADD_TO_CART_REQUEST:
      return { ...state, updateCartInProgress: true, updateLikesError: null };
    case UPDATE_ADD_TO_CART_SUCCESS:
      return { ...state, updateCartInProgress: false };
    case UPDATE_ADD_TO_CART_ERROR:
      return { ...state, updateCartInProgress: false, updateLikesError: payload };

    default:
      return state;
  }
};

export default cartPageReducer;

// ================ Action creators ================ //

const fetchCurrentUserCartProductsRequest = params => ({
  type: FETCH_CURRENT_USER_CART_PRODUCTS_REQUEST ,
  payload: {params}
});
export const fetchCurrentUserCartProductsSuccess = cartProducts => ({
  type: FETCH_CURRENT_USER_CART_PRODUCTS_SUCCESS,
  payload: cartProducts,
});
const fetchCurrentUserCartProductsError = error => ({
  type: FETCH_CURRENT_USER_CART_PRODUCTS_ERROR,
  error: true,
  payload: error,
});

export const updateAddToCartRequest = params => ({
  type: UPDATE_ADD_TO_CART_REQUEST,
  payload: { params },
});
export const updateAddToCartSuccess = result => ({
  type: UPDATE_ADD_TO_CART_SUCCESS,
  payload: result.data,
});
export const updateAddToCartError = error => ({
  type: UPDATE_ADD_TO_CART_ERROR,
  payload: error,
  error: true,
});

export const sendEnquiryRequest = () => ({ type: SEND_ENQUIRY_REQUEST });
export const sendEnquirySuccess = () => ({ type: SEND_ENQUIRY_SUCCESS });
export const sendEnquiryError = e => ({ type: SEND_ENQUIRY_ERROR, error: true, payload: e });

// ================ Thunks ================ //

export const loadData = () => (dispatch, getState, sdk)  => {
  dispatch(fetchCurrentUserCartProductsRequest());
  return dispatch(fetchCurrentUser()).then(() => {
    const currentUser = getState().user.currentUser;
    const cartProducts =
      currentUser?.attributes?.profile?.protectedData?.cartLikedProducts;
    const cartIds = [];
    if (cartProducts.length){
      cartProducts.map((product, i) => {
        cartIds.push(product["id"]);
      });
    }
    console.log("CARD IDS", cartIds);

    const apiQueryParams = {
      page: 1,
      per_page: 100,
      ids:cartIds,
      include: [ 'images',  'currentStock' , 'attributes.protectedData'],
    };
    return sdk.listings
      .query(apiQueryParams)
      .then(response => {
        const latestCartProducts = denormalisedResponseEntities(response);
        console.log("UN RES", latestCartProducts);
        let updatedCartProducts = [];
        dispatch(addMarketplaceEntities(response));
        
        latestCartProducts.map((product, i)=>{
          let temp = product;
          cartProducts.map((added_product, j)=>{
            console.log(added_product.id, temp)
            if (added_product.id == product.id.uuid){
              temp["quantity"] = parseInt(added_product.quantity)
            }
          });
          updatedCartProducts.push(temp);
        });

        console.log("AFTER RES", updatedCartProducts);
        dispatch(fetchCurrentUserCartProductsSuccess(updatedCartProducts));

        return response;     
      })
      .catch(e => {
        dispatch(fetchCurrentUserCartProductsError(storableError(e)));          
      });
  });
};

export const updateCart = (paramsObj) => (dispatch, getState, sdk) => {
  dispatch(updateAddToCartRequest());

  console.log("BEFORE CART UPD", paramsObj);
  return dispatch(fetchCurrentUser()).then(() => {
    const currentUser = getState().user.currentUser;
    const cartProducts =
      currentUser?.attributes?.profile?.protectedData?.cartLikedProducts;

    const queryParams = {
      expand: true,
      include: ['profileImage'],
      'fields.image': [
        'variants.square-small',
        'variants.square-small2x',
      ],
    };

    // if listingId already exists in cartProducts, it should be removed from cartProducts
    // if user has current likes, merge listingId into current likes
    let cartLikedProducts = [];

    if (cartProducts.length){
      if (cartProducts.length == 1){
        dispatch(updateAddToCartError(storableError("You cannot add products more than 10")));
        return true;
      }

      if (paramsObj["action"] == "add"){
        if (paramsObj["quantity"])
          cartLikedProducts.push({"id":paramsObj["id"], "quantity":paramsObj["quantity"]})
      }

      cartProducts.map((each, i)=>{
        if (paramsObj["action"] == "remove"){
          if (each["id"] != paramsObj["id"])
            cartLikedProducts.push(each)
        }
        else if (paramsObj["action"] == "update"){
          if (each["id"] == paramsObj["id"])
            cartLikedProducts.push({"id":paramsObj["id"], "quantity":paramsObj["quantity"]})
          else
            cartLikedProducts.push(each);
        }else{
          cartLikedProducts.push(each);
        }
      });

    }else{
      if (paramsObj["quantity"])
        cartLikedProducts.push({"id":paramsObj["id"], "quantity":paramsObj["quantity"]});
    }

    console.log("AFTER CART UPD", cartLikedProducts);
    return sdk.currentUser
      .updateProfile({ protectedData: { cartLikedProducts } }, queryParams)
      .then(response => {
        dispatch(updateAddToCartSuccess(response));

        const entities = denormalisedResponseEntities(response);
        if (entities.length !== 1) {
          throw new Error(
            'Expected a resource in the sdk.currentUser.updateProfile response'
          );
        }
        const currentUser = entities[0];

        // Update current user in state.user.currentUser through user.duck.js
        dispatch(currentUserShowSuccess(currentUser));
      })
      .catch(e => {
        dispatch(updateAddToCartError(storableError(e)));
      });
  });
};