/**
 * CheckoutPage starts payment process and therefore it will get data from ListingPage
 * (booking dates, listing data, and all the other data that affects to booking decision).
 * This data is saved to Session Store which only exists while the browsing session exists -
 * e.g. tab is open. (Session Store is not related to session cookies.)
 */
import reduce from 'lodash/reduce';
import Decimal from 'decimal.js';

import { isAfterDate, subtractTime } from '../../util/dates';
import { types as sdkTypes } from '../../util/sdkLoader';
import { TRANSITIONS } from '../../util/transaction';

const { UUID, Money } = sdkTypes;

// Validate that given 'obj' has all the keys of defined by validPropTypes parameter
// and values must pass related test-value-format function.
const validateProperties = (obj, validPropTypes) => {
  return reduce(
    Object.entries(validPropTypes),
    (acc, [prop, fn]) => {
      if (Object.prototype.hasOwnProperty.call(obj, prop) && fn(obj[prop])) {
        return acc;
      }
      return false;
    },
    true
  );
};

// Validate content of booking dates object received from SessionStore
export const isValidBookingDates = bookingDates => {
  const props = {
    bookingStart: d => d instanceof Date,
    bookingEnd: d => d instanceof Date,
  };
  return validateProperties(bookingDates, props);
};

// Validate content of listing object received from SessionStore.
// Currently only id & attributes.price are needed.
export const isValidListing = listing => {
  const props = {
    id: id => id instanceof UUID,
    attributes: v => {
      return typeof v === 'object' && v.price instanceof Money;
    },
  };
  return validateProperties(listing, props);
};

// Validate content of an transaction received from SessionStore.
// An id is required and the last transition needs to be one of the known transitions
export const isValidTransaction = transaction => {
  const props = {
    id: id => id instanceof UUID,
    type: type => type === 'transaction',
    attributes: v => {
      return typeof v === 'object' && TRANSITIONS.includes(v.lastTransition);
    },
  };
  return validateProperties(transaction, props);
};

// Stores given bookinData, listing and transaction to sessionStorage
export const storeData = (orderData, listing, transaction, storageKey) => {
  if (window && window.sessionStorage && listing && orderData) {
    const data = {
      orderData,
      listing,
      transaction,
      storedAt: new Date(),
    };

    const replacer = function(k, v) {
      if (this[k] instanceof Date) {
        return { date: v, _serializedType: 'SerializableDate' };
      }
      if (this[k] instanceof Decimal) {
        return { decimal: v, _serializedType: 'SerializableDecimal' };
      }
      return sdkTypes.replacer(k, v);
    };

    const storableData = JSON.stringify(data, replacer);
    window.sessionStorage.setItem(storageKey, storableData);
  }
};

// Get stored data
export const storedData = storageKey => {
  if (window && window.sessionStorage) {
    const checkoutPageData = window.sessionStorage.getItem(storageKey);

    const reviver = (k, v) => {
      if (v && typeof v === 'object' && v._serializedType === 'SerializableDate') {
        // Dates are expected to be stored as:
        // { date: new Date(), _serializedType: 'SerializableDate' }
        return new Date(v.date);
      } else if (v && typeof v === 'object' && v._serializedType === 'SerializableDecimal') {
        // Decimals are expected to be stored as:
        // { decimal: v, _serializedType: 'SerializableDecimal' }
        return new Decimal(v.decimal);
      }
      return sdkTypes.reviver(k, v);
    };

    // Note: orderData may contain bookingDates if booking process is used.
    const { orderData, listing, transaction, storedAt } = checkoutPageData
      ? JSON.parse(checkoutPageData, reviver)
      : {};

    const bookingDates = orderData?.bookingDates;
    const isPotentiallyIncludedBookingDatesValid = bookingDates
      ? isValidBookingDates(bookingDates)
      : true;

    // If sessionStore contains freshly saved data (max 1 day old), use it
    const isFreshlySaved = storedAt
      ? isAfterDate(storedAt, subtractTime(new Date(), 1, 'days'))
      : false;

    // resolve transaction as valid if it is missing
    const isTransactionValid = !!transaction ? isValidTransaction(transaction) : true;

    const isStoredDataValid =
      isFreshlySaved &&
      isPotentiallyIncludedBookingDatesValid &&
      isValidListing(listing) &&
      isTransactionValid;

    if (isStoredDataValid) {
      return { orderData, listing, transaction };
    }
  }
  return {};
};

export const clearData = storageKey => {
  if (window && window.sessionStorage) {
    window.sessionStorage.removeItem(storageKey);
  }
};
