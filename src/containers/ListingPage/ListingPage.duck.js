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

export const FETCH_REVIEWS_REQUEST = 'app/ListingPage/FETCH_REVIEWS_REQUEST';
export const FETCH_REVIEWS_SUCCESS = 'app/ListingPage/FETCH_REVIEWS_SUCCESS';
export const FETCH_REVIEWS_ERROR = 'app/ListingPage/FETCH_REVIEWS_ERROR';

export const FETCH_TIME_SLOTS_REQUEST = 'app/ListingPage/FETCH_TIME_SLOTS_REQUEST';
export const FETCH_TIME_SLOTS_SUCCESS = 'app/ListingPage/FETCH_TIME_SLOTS_SUCCESS';
export const FETCH_TIME_SLOTS_ERROR = 'app/ListingPage/FETCH_TIME_SLOTS_ERROR';

export const FETCH_LINE_ITEMS_REQUEST = 'app/ListingPage/FETCH_LINE_ITEMS_REQUEST';
export const FETCH_LINE_ITEMS_SUCCESS = 'app/ListingPage/FETCH_LINE_ITEMS_SUCCESS';
export const FETCH_LINE_ITEMS_ERROR = 'app/ListingPage/FETCH_LINE_ITEMS_ERROR';

export const SEND_ENQUIRY_REQUEST = 'app/ListingPage/SEND_ENQUIRY_REQUEST';
export const SEND_ENQUIRY_SUCCESS = 'app/ListingPage/SEND_ENQUIRY_SUCCESS';
export const SEND_ENQUIRY_ERROR = 'app/ListingPage/SEND_ENQUIRY_ERROR';

// FOR LIKES/WISHLIST
export const UPDATE_LIKES_REQUEST ='app/ListingPage/UPDATE_LIKES_REQUEST';
export const UPDATE_LIKES_SUCCESS ='app/ListingPage/UPDATE_LIKES_SUCCESS';
export const UPDATE_LIKES_ERROR = 'app/ListingPage/UPDATE_LIKES_ERROR';

// FOR ADDTOCART
export const UPDATE_ADD_TO_CART_REQUEST ='app/ListingPage/UPDATE_ADDTOCART_REQUEST';
export const UPDATE_ADD_TO_CART_SUCCESS ='app/ListingPage/UPDATE_ADDTOCART_SUCCESS';
export const UPDATE_ADD_TO_CART_ERROR = 'app/ListingPage/UPDATE_ADDTOCART_ERROR';

// ================ Reducer ================ //

const initialState = {
  id: null,
  showListingError: null,
  reviews: [],
  fetchReviewsError: null,
  timeSlots: null,
  fetchTimeSlotsError: null,
  lineItems: null,
  fetchLineItemsInProgress: false,
  fetchLineItemsError: null,
  sendEnquiryInProgress: false,
  sendEnquiryError: null,
  enquiryModalOpenForListingId: null,
  updateLikesError: null,
  updateLikesInProgress: false,
  updateCartInProgress: false,
  updateLikesError: null,
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

    case FETCH_REVIEWS_REQUEST:
      return { ...state, fetchReviewsError: null };
    case FETCH_REVIEWS_SUCCESS:
      return { ...state, reviews: payload };
    case FETCH_REVIEWS_ERROR:
      return { ...state, fetchReviewsError: payload };

    case FETCH_TIME_SLOTS_REQUEST:
      return { ...state, fetchTimeSlotsError: null };
    case FETCH_TIME_SLOTS_SUCCESS:
      return { ...state, timeSlots: payload };
    case FETCH_TIME_SLOTS_ERROR:
      return { ...state, fetchTimeSlotsError: payload };

    case FETCH_LINE_ITEMS_REQUEST:
      return { ...state, fetchLineItemsInProgress: true, fetchLineItemsError: null };
    case FETCH_LINE_ITEMS_SUCCESS:
      return { ...state, fetchLineItemsInProgress: false, lineItems: payload };
    case FETCH_LINE_ITEMS_ERROR:
      return { ...state, fetchLineItemsInProgress: false, fetchLineItemsError: payload };

    case SEND_ENQUIRY_REQUEST:
      return { ...state, sendEnquiryInProgress: true, sendEnquiryError: null };
    case SEND_ENQUIRY_SUCCESS:
      return { ...state, sendEnquiryInProgress: false };
    case SEND_ENQUIRY_ERROR:
      return { ...state, sendEnquiryInProgress: false, sendEnquiryError: payload };

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

export const fetchReviewsRequest = () => ({ type: FETCH_REVIEWS_REQUEST });
export const fetchReviewsSuccess = reviews => ({ type: FETCH_REVIEWS_SUCCESS, payload: reviews });
export const fetchReviewsError = error => ({
  type: FETCH_REVIEWS_ERROR,
  error: true,
  payload: error,
});

export const fetchTimeSlotsRequest = () => ({ type: FETCH_TIME_SLOTS_REQUEST });
export const fetchTimeSlotsSuccess = timeSlots => ({
  type: FETCH_TIME_SLOTS_SUCCESS,
  payload: timeSlots,
});
export const fetchTimeSlotsError = error => ({
  type: FETCH_TIME_SLOTS_ERROR,
  error: true,
  payload: error,
});

export const fetchLineItemsRequest = () => ({ type: FETCH_LINE_ITEMS_REQUEST });
export const fetchLineItemsSuccess = lineItems => ({
  type: FETCH_LINE_ITEMS_SUCCESS,
  payload: lineItems,
});
export const fetchLineItemsError = error => ({
  type: FETCH_LINE_ITEMS_ERROR,
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

export const showListing = (listingId, isOwn = false) => (dispatch, getState, sdk) => {
  const { aspectWidth = 1, aspectHeight = 1, variantPrefix = 'listing-card' } = config.listing;
  const aspectRatio = aspectHeight / aspectWidth;
  console.log("I AM IN SHOW LISTING");
  dispatch(showListingRequest(listingId));
  dispatch(fetchCurrentUser());
  const params = {
    id: listingId,
    include: ['author', 'author.profileImage', 'images', 'currentStock'],
    'fields.image': [
      // Scaled variants for large images
      'variants.scaled-small',
      'variants.scaled-medium',
      'variants.scaled-large',
      'variants.scaled-xlarge',

      // Cropped variants for listing thumbnail images
      `variants.${variantPrefix}`,
      `variants.${variantPrefix}-2x`,
      `variants.${variantPrefix}-4x`,
      `variants.${variantPrefix}-6x`,

      // Social media
      'variants.facebook',
      'variants.twitter',

      // Avatars
      'variants.square-small',
      'variants.square-small2x',
    ],
    ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
    ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
    ...createImageVariantConfig(`${variantPrefix}-4x`, 1600, aspectRatio),
    ...createImageVariantConfig(`${variantPrefix}-6x`, 2400, aspectRatio),
  };

  const show = isOwn ? sdk.ownListings.show(params) : sdk.listings.show(params);

  return show
    .then(data => {
      dispatch(addMarketplaceEntities(data));
      console.log("IN DATA", data)
      return data;
    })
    .catch(e => {
      dispatch(showListingError(storableError(e)));
    });
};

export const fetchReviews = listingId => (dispatch, getState, sdk) => {
  dispatch(fetchReviewsRequest());
  return sdk.reviews
    .query({
      listing_id: listingId,
      state: 'public',
      include: ['author', 'author.profileImage'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    })
    .then(response => {
      const reviews = denormalisedResponseEntities(response);
      dispatch(fetchReviewsSuccess(reviews));
    })
    .catch(e => {
      dispatch(fetchReviewsError(storableError(e)));
    });
};

const timeSlotsRequest = params => (dispatch, getState, sdk) => {
  return sdk.timeslots.query(params).then(response => {
    return denormalisedResponseEntities(response);
  });
};

export const fetchTimeSlots = listingId => (dispatch, getState, sdk) => {
  dispatch(fetchTimeSlotsRequest);

  // Time slots can be fetched for 90 days at a time,
  // for at most 180 days from now. If max number of bookable
  // day exceeds 90, a second request is made.

  const maxTimeSlots = 90;
  // booking range: today + bookable days -1
  const bookingRange = config.dayCountAvailableForBooking - 1;
  const timeSlotsRange = Math.min(bookingRange, maxTimeSlots);

  const now = new Date();
  const start = getStartOf(now, 'day', 'Etc/UTC');
  const end = addTime(start, timeSlotsRange, 'days', 'Etc/UTC');
  const params = { listingId, start, end };

  return dispatch(timeSlotsRequest(params))
    .then(timeSlots => {
      const secondRequest = bookingRange > maxTimeSlots;

      if (secondRequest) {
        const secondRange = Math.min(maxTimeSlots, bookingRange - maxTimeSlots);
        const secondParams = {
          listingId,
          start: end,
          end: addTime(end, secondRange, 'days', 'Etc/UTC'),
        };

        return dispatch(timeSlotsRequest(secondParams)).then(secondBatch => {
          const combined = timeSlots.concat(secondBatch);
          dispatch(fetchTimeSlotsSuccess(combined));
        });
      } else {
        dispatch(fetchTimeSlotsSuccess(timeSlots));
      }
    })
    .catch(e => {
      dispatch(fetchTimeSlotsError(storableError(e)));
    });
};

export const sendEnquiry = (listingId, message) => (dispatch, getState, sdk) => {
  dispatch(sendEnquiryRequest());
  const bodyParams = {
    transition: TRANSITION_ENQUIRE,
    processAlias: config.transactionProcessAlias,
    params: { listingId },
  };
  return sdk.transactions
    .initiate(bodyParams)
    .then(response => {
      const transactionId = response.data.data.id;

      // Send the message to the created transaction
      return sdk.messages.send({ transactionId, content: message }).then(() => {
        dispatch(sendEnquirySuccess());
        dispatch(fetchCurrentUserHasOrdersSuccess(true));
        return transactionId;
      });
    })
    .catch(e => {
      dispatch(sendEnquiryError(storableError(e)));
      throw e;
    });
};

export const fetchTransactionLineItems = ({ orderData, listingId, isOwnListing }) => dispatch => {
  dispatch(fetchLineItemsRequest());
  transactionLineItems({ orderData, listingId, isOwnListing })
    .then(response => {
      const lineItems = response.data;
      dispatch(fetchLineItemsSuccess(lineItems));
    })
    .catch(e => {
      dispatch(fetchLineItemsError(storableError(e)));
      log.error(e, 'fetching-line-items-failed', {
        listingId: listingId.uuid,
        orderData,
      });
    });
};

export const loadData = (params, search) => dispatch => {
  const listingId = new UUID(params.id);
  console.log("I AM IN loadData");
  
  // Clear old line-items
  dispatch(setInitialValues({ lineItems: null }));

  const ownListingVariants = [LISTING_PAGE_DRAFT_VARIANT, LISTING_PAGE_PENDING_APPROVAL_VARIANT];
  if (ownListingVariants.includes(params.variant)) {
    return dispatch(showListing(listingId, true));
  }

  if (config.listingManagementType === 'availability') {
    return Promise.all([
      dispatch(showListing(listingId)),
      dispatch(fetchTimeSlots(listingId)),
      dispatch(fetchReviews(listingId)),
    ]);
  } else {
    return Promise.all([dispatch(showListing(listingId)), dispatch(fetchReviews(listingId))]);
  }
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

export const updateCart = listingId => (dispatch, getState, sdk) => {
  dispatch(updateAddToCartRequest());

  return dispatch(fetchCurrentUser()).then(() => {
    const currentUser = getState().user.currentUser;
    console.log("IN UPD", currentUser);
    const cartProducts =
      currentUser?.attributes?.profile?.protectedData?.cartLikedProducts;

    console.log("IN UPD", cartProducts);

    const queryParams = {
      expand: true,
      include: ['profileImage'],
      'fields.image': [
        'variants.square-small',
        'variants.square-small2x',
      ],
    };

    console.log(listingId, queryParams);
    // if listingId already exists in cartProducts, it should be removed from cartProducts
    // if user has current likes, merge listingId into current likes
    const ifDislike = !!cartProducts?.includes(listingId);
    const cartLikedProducts = ifDislike
      ? cartProducts.filter(id => id !== listingId)
      : cartProducts
      ? [...cartProducts, listingId]
      : [listingId];

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