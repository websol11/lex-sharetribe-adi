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

export const SET_INITIAL_VALUES = 'app/ListingPage/SET_INITIAL_VALUES';

export const SHOW_LISTING_REQUEST = 'app/ListingPage/SHOW_LISTING_REQUEST';
export const SHOW_LISTING_ERROR = 'app/ListingPage/SHOW_LISTING_ERROR';

// FOR LIKES/WISHLIST
export const FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_REQUEST = 'app/WishlistPage/FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_REQUEST';
export const FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_SUCCESS = 'app/WishlistPage/FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_SUCCESS';
export const FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_ERROR   = 'app/WishlistPage/FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_ERROR';

export const UPDATE_LIKES_REQUEST ='app/ListingPage/UPDATE_LIKES_REQUEST';
export const UPDATE_LIKES_SUCCESS ='app/ListingPage/UPDATE_LIKES_SUCCESS';
export const UPDATE_LIKES_ERROR = 'app/ListingPage/UPDATE_LIKES_ERROR';

// ================ Reducer ================ //

const initialState = {
  id: null,
  showListingError: null,
  reviews: [],
  updateLikesError: null,
  updateLikesInProgress: false,
  fetchCurrentUserWishlistedProductsError: null,
  fetchCurrentUserWishlistedProductsProgress: false,
};

const listingPageReducer = (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case SET_INITIAL_VALUES:
      return { ...initialState, ...payload };

    case SHOW_LISTING_REQUEST:
      return { ...state, id: payload.id, showListingError: null };
    case SHOW_LISTING_ERROR:
      return { ...state, showListingError: payload };

    case FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_REQUEST:
      return { ...state, currentUserWishlistedProductsError: null, fetchCurrentUserWishlistedProductsProgress:true };
    case FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_SUCCESS:
      console.info("FETCH_CURRENT_USER_WISHLISTED_PRODUCTS:",payload); // eslint-disable-line
      return { ...state, currentUserWishlistedProducts: payload, fetchCurrentUserWishlistedProductsProgress:false };
    case FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_ERROR:
      console.error("FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_ERROR:-",payload); // eslint-disable-line
      return { ...state, currentUserWishlistedProductsError: payload, fetchCurrentUserWishlistedProductsProgress: false };


    case UPDATE_LIKES_REQUEST:
      return { ...state, updateLikesInProgress: true, updateLikesError: null };
    case UPDATE_LIKES_SUCCESS:
      return { ...state, updateLikesInProgress: false };
    case UPDATE_LIKES_ERROR:
      return { ...state, updateLikesInProgress: false, updateLikesError: payload };

    default:
      return state;
  }
};

export default listingPageReducer;

// ================ Action creators ================ //

export const setInitialValues = initialValues => ({
  type: SET_INITIAL_VALUES,
  payload: pick(initialValues, Object.keys(initialState)),
});

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
export const fetchCurrentUserWishlistedProductsSuccess = result => ({
  type: FETCH_CURRENT_USER_WISHLISTED_PRODUCTS_SUCCESS,
  payload: result.data,
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

export const sendEnquiryRequest = () => ({ type: SEND_ENQUIRY_REQUEST });
export const sendEnquirySuccess = () => ({ type: SEND_ENQUIRY_SUCCESS });
export const sendEnquiryError = e => ({ type: SEND_ENQUIRY_ERROR, error: true, payload: e });

// ================ Thunks ================ //

export const loadData = (params, search) => (dispatch, getState, sdk)  => {
  console.log("I AM IN loadData of wishlist");
  dispatch(fetchCurrentUserWishlistedProductsRequest());
  return dispatch(fetchCurrentUser()).then(() => {
    const currentUser = getState().user.currentUser;
    const currentLikes =
      currentUser?.attributes?.profile?.privateData?.likedListings;
      
      const apiQueryParams = {
        page: 1,
        per_page: 100,
        ids:currentLikes
      };
      console.log("APOI AOAS", apiQueryParams);
      return sdk.listings
        .query(apiQueryParams)
        .then(response => {
          console.log("I MA GHERE", response);
          dispatch(addMarketplaceEntities(response));
          dispatch(fetchCurrentUserWishlistedProductsSuccess(response));

          return response;     
        })
        .catch(e => {
          console.log("ERR", e)
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
      })
      .catch(e => {
        dispatch(updateLikesError(storableError(e)));
      });
  });
};