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

export const SHOW_LISTING_REQUEST = 'app/ListingPage/SHOW_LISTING_REQUEST';
export const SHOW_LISTING_ERROR = 'app/ListingPage/SHOW_LISTING_ERROR';

// FOR LIKES/WISHLIST
export const FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_REQUEST = 'app/WishlistPage/FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_REQUEST';
export const FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_SUCCESS = 'app/WishlistPage/FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_SUCCESS';
export const FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_ERROR   = 'app/WishlistPage/FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_ERROR';

export const UPDATE_LIKES_REQUEST ='app/ListingPage/UPDATE_LIKES_REQUEST';
export const UPDATE_LIKES_SUCCESS ='app/ListingPage/UPDATE_LIKES_SUCCESS';
export const UPDATE_LIKES_ERROR = 'app/ListingPage/UPDATE_LIKES_ERROR';

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
  updateLikesInProgress: false,
  fetchCurrentUserWishlistedProductsError: null,
  fetchCurrentUserWishlistedProductsProgress: false,
  wishlistProducts: [],
};

const wishlistPageReducer = (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {

    case SHOW_LISTING_REQUEST:
      return { ...state, id: payload.id, showListingError: null };
    case SHOW_LISTING_ERROR:
      return { ...state, showListingError: payload };

    case FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_REQUEST:
      return { ...state, currentUserWishlistedProductsError: null, fetchCurrentUserWishlistedProductsProgress:true };
    case FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_SUCCESS:
      return { ...state, wishlistProducts: payload, currentUserWishlistedProducts: payload, fetchCurrentUserWishlistedProductsProgress:false };
    case FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_ERROR:
      return { ...state, wishlistProducts: [], currentUserWishlistedProductsError: payload, fetchCurrentUserWishlistedProductsProgress: false };


    case UPDATE_LIKES_REQUEST:
      return { ...state, updateLikesInProgress: true, updateLikesError: null };
    case UPDATE_LIKES_SUCCESS:
      return { ...state, updateLikesInProgress: false };
    case UPDATE_LIKES_ERROR:
      return { ...state, updateLikesInProgress: false, updateLikesError: payload };

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

export default wishlistPageReducer;

// ================ Action creators ================ //


export const showListingRequest = id => ({
  type: SHOW_LISTING_REQUEST,
  payload: { id },
});
export const showListingError = e => ({
  type: SHOW_LISTING_ERROR,
  error: true,
  payload: e,
});

const fetchCurrentUserWishlistedProductsRequest = params => ({
  type: FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_REQUEST ,
  payload: {params}
});
export const fetchCurrentUserWishlistedProductsSuccess = wishlistProducts => ({
  type: FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_SUCCESS,
  payload: wishlistProducts,
});
const fetchCurrentUserWishlistedProductsError = error => ({
  type: FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_ERROR,
  error: true,
  payload: error,
});

export const updateLikesRequest = params => ({
  type: UPDATE_LIKES_REQUEST,
  payload: { params },
});
export const updateLikesSuccess = result => ({
  type: UPDATE_LIKES_SUCCESS,
  payload: result.data,
});
export const updateLikesError = error => ({
  type: UPDATE_LIKES_ERROR,
  payload: error,
  error: true,
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
  dispatch(fetchCurrentUserWishlistedProductsRequest());
  return dispatch(fetchCurrentUser()).then(() => {
    const currentUser = getState().user.currentUser;
    const currentLikes =
      currentUser?.attributes?.profile?.privateData?.likedListings;
    const currentCartProducts =
      currentUser?.attributes?.profile?.protectedData?.cartLikedProducts;
    const cartIds = [];
    if (currentCartProducts.length){
      currentCartProducts.map((product, i) => {
        cartIds.push(product["id"]);
      });
    }
      const apiQueryParams = {
        page: 1,
        per_page: 100,
        ids:currentLikes,
        include: [ 'images' ],
      };
      return sdk.listings
        .query(apiQueryParams)
        .then(response => {
          let wishlistProducts = denormalisedResponseEntities(response);
          if (wishlistProducts){
            wishlistProducts = wishlistProducts.filter((element, index)=>{
              element["cart"] = false;
              if (cartIds.includes(element.id.uuid))
                element["cart"] = true;
              return element;
            });            
          }
          dispatch(addMarketplaceEntities(response));
          dispatch(fetchCurrentUserWishlistedProductsSuccess(wishlistProducts));

          return response;     
        })
        .catch(e => {
          dispatch(fetchCurrentUserWishlistedProductsError(storableError(e)));          
        });
  });
};

export const updateLikes = listingId => (dispatch, getState, sdk) => {
  dispatch(updateLikesRequest());

  return dispatch(fetchCurrentUser()).then(() => {
    const currentUser = getState().user.currentUser;
    const currentLikes =
      currentUser?.attributes?.profile?.privateData?.likedListings;

    const queryParams = {
      expand: true,
      include: ['profileImage'],
      'fields.image': [
        'variants.square-small',
        'variants.square-small2x',
      ],
    };

    // if listingId already exists in currentLikes, it should be removed from currentLikes
    // if user has current likes, merge listingId into current likes
    const ifDislike = !!currentLikes?.includes(listingId);
    const likedListings = ifDislike
      ? currentLikes.filter(id => id !== listingId)
      : currentLikes
      ? [...currentLikes, listingId]
      : [listingId];
    return sdk.currentUser
      .updateProfile({ privateData: { likedListings } }, queryParams)
      .then(response => {
        dispatch(updateLikesSuccess(response));

        const entities = denormalisedResponseEntities(response);
        if (entities.length !== 1) {
          throw new Error(
            'Expected a resource in the sdk.currentUser.updateProfile response'
          );
        }
        const currentUser = entities[0];
        // Update current user in state.user.currentUser through user.duck.js
        dispatch(currentUserShowSuccess(currentUser));

        // get latest wishlisted items
        const apiQueryParams = {
          page: 1,
          per_page: 100,
          ids:currentUser?.attributes?.profile?.privateData?.likedListings,
          include: [ 'images' ],
        };
        dispatch(fetchCurrentUserWishlistedProductsRequest());

        return sdk.listings
          .query(apiQueryParams)
          .then(response => {
            const wishlistProducts = denormalisedResponseEntities(response);
            dispatch(addMarketplaceEntities(response));
            dispatch(fetchCurrentUserWishlistedProductsSuccess(wishlistProducts));
            return response;     
          })
          .catch(e => {
            dispatch(fetchCurrentUserWishlistedProductsError(storableError(e))); 
        });
      })
      .catch(e => {
        dispatch(updateLikesError(storableError(e)));
      });
  });
};


export const updateCart = (paramsObj) => (dispatch, getState, sdk) => {
  dispatch(updateAddToCartRequest());

  console.log("BEFORE CART PAGE UPD", paramsObj);
  return dispatch(fetchCurrentUser()).then(() => {
    const currentUser = getState().user.currentUser;
    const cartProducts =
      currentUser?.attributes?.profile?.protectedData?.cartLikedProducts;
    const currentLikes =
      currentUser?.attributes?.profile?.privateData?.likedListings;

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
      if (paramsObj["action"] == "add"){
        if (cartProducts.length == 10){
          throw new Error(
            'You cannot add more than 10 products in cart.'
          );
        }
        if (paramsObj["quantity"])
          cartLikedProducts.push({"id":paramsObj["id"], "quantity":paramsObj["quantity"]})
      }

      cartProducts.map((each, i)=>{
        if ((paramsObj["action"] == "remove") || (paramsObj["action"] == "wishlist")) {
          if (each["id"] != paramsObj["id"])
            cartLikedProducts.push(each)
        }
        else{
          cartLikedProducts.push(each);
        }
      });

    }else{
      if (paramsObj["quantity"])
        cartLikedProducts.push({"id":paramsObj["id"], "quantity":paramsObj["quantity"]});
    }

    let updateParams = { protectedData: { cartLikedProducts } };
    console.log("AFTER CART UPD", updateParams);
    return sdk.currentUser
      .updateProfile(updateParams, queryParams)
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

        // re-update DOM with latest wishlist items
        const currentLikes = currentUser?.attributes?.profile?.privateData?.likedListings;
        const currentCartProducts =
          currentUser?.attributes?.profile?.protectedData?.cartLikedProducts;
        const cartIds = [];
        if (currentCartProducts.length){
          currentCartProducts.map((product, i) => {
            cartIds.push(product["id"]);
          });
        }
        const apiQueryParams = {
          page: 1,
          per_page: 100,
          ids:currentLikes,
          include: [ 'images',  'currentStock' , 'attributes.protectedData'],
        };
        return sdk.listings
        .query(apiQueryParams)
        .then(response => {
          let wishlistProducts = denormalisedResponseEntities(response);
          if (wishlistProducts){
            wishlistProducts = wishlistProducts.filter((element, index)=>{
              element["cart"] = false;
              if (cartIds.includes(element.id.uuid))
                element["cart"] = true;
              return element;
            });            
          }
          dispatch(addMarketplaceEntities(response));
          dispatch(fetchCurrentUserWishlistedProductsSuccess(wishlistProducts));
          return response;     
        })
        .catch(e => {
          dispatch(fetchCurrentUserWishlistedProductsError(storableError(e)));          
        });
      })
      .catch(e => {
        dispatch(updateAddToCartError(storableError(e)));
      });
  });
};