import React, { Component } from 'react';
import { bool, func, instanceOf, object, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { withRouter } from 'react-router-dom';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';
import routeConfiguration from '../../routing/routeConfiguration';

import { pathByRouteName, findRouteByRouteName } from '../../util/routes';
import { propTypes, LINE_ITEM_NIGHT, LINE_ITEM_DAY } from '../../util/types';
import {
  ensureListing,
  ensureUser,
  ensureTransaction,
  ensureBooking,
} from '../../util/data';
import { dateFromLocalToAPI } from '../../util/dates';
import { timeOfDayFromLocalToTimeZone, minutesBetween } from '../../util/dates';

import { createSlug } from '../../util/urlHelpers';
import {
  isTransactionInitiateAmountTooLowError,
  isTransactionInitiateListingNotFoundError,
  isTransactionInitiateBookingTimeNotAvailableError,
  isTransactionChargeDisabledError,
  isTransactionZeroPaymentError,
  isTransitionQuantityInfoMissingError,
  isTransactionInitiateListingInsufficientStockError,
} from '../../util/errors';
import { formatMoney } from '../../util/currency';
import {
  TRANSITION_ENQUIRE,
  txIsPaymentPending,
  txIsPaymentExpired,
  txHasPassedPaymentPending,
} from '../../util/transaction';
import {
  AvatarMedium,
  AspectRatioWrapper,
  Button,
  BookingBreakdown,
  Logo,
  NamedLink,
  NamedRedirect,
  Page,
  ResponsiveImage,
  Form,
  PrimaryButton,
  FieldTextInput,
  OrderBreakdown,
} from '../../components';

import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  initiateOrder,
  setInitialValues,
  speculateTransaction,
  sendMessage,
} from './CheckoutPage.duck';

import config from '../../config';

import { storeData, storedData, clearData } from './CheckoutPageSessionHelpers';
import css from './CheckoutPage.module.css';

const STORAGE_KEY = 'CheckoutPage';

const checkIsPaymentExpired = existingTransaction => {
  return txIsPaymentExpired(existingTransaction)
    ? true
    : txIsPaymentPending(existingTransaction)
    ? minutesBetween(existingTransaction.attributes.lastTransitionedAt, new Date()) >= 15
    : false;
};

const getFormattedTotalPrice = (transaction, intl) => {
  const totalPrice = transaction.attributes.payinTotal;
  return formatMoney(intl, totalPrice);
};

// Convert the picked date to moment that will represent the same time of day in UTC time zone.
const bookingDatesMaybe = bookingDates => {
  const apiTimeZone = 'Etc/UTC';
  return bookingDates
    ? {
        bookingDates: {
          bookingStart: timeOfDayFromLocalToTimeZone(bookingDates.bookingStart, apiTimeZone),
          bookingEnd: timeOfDayFromLocalToTimeZone(bookingDates.bookingEnd, apiTimeZone),
        },
      }
    : {};
};

export class CheckoutPageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pageData: {},
      dataLoaded: false,
      submitting: false,
    };

    this.loadInitialData = this.loadInitialData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    if (window) {
      this.loadInitialData();
    }
  }

  /**
   * Load initial data for the page
   *
   * Since the data for the checkout is not passed in the URL (there
   * might be lots of options in the future), we must pass in the data
   * some other way. Currently the ListingPage sets the initial data
   * for the CheckoutPage's Redux store.
   *
   * For some cases (e.g. a refresh in the CheckoutPage), the Redux
   * store is empty. To handle that case, we store the received data
   * to window.sessionStorage and read it from there if no props from
   * the store exist.
   *
   * This function also sets of fetching the speculative transaction
   * based on this initial data.
   */
  loadInitialData() {
    const {
      orderData,
      listing,
      transaction,
      fetchSpeculatedTransaction,
      history,
    } = this.props;

    console.log("LID", this.props, orderData, listing);
    // Browser's back navigation should not rewrite data in session store.
    // Action is 'POP' on both history.back() and page refresh cases.
    // Action is 'PUSH' when user has directed through a link
    // Action is 'REPLACE' when user has directed through login/signup process
    const hasNavigatedThroughLink =
      history.action === 'PUSH' || history.action === 'REPLACE';

    const hasDataInProps =
      !!(listing) && hasNavigatedThroughLink;
    console.info("HDIP", hasDataInProps);
    if (hasDataInProps) {
      // Store data only if data is passed through props and user has navigated through a link.
      
      console.log("LID HERE",listing,this.props.listing, STORAGE_KEY);
      storeData(
        orderData,
        listing,
        STORAGE_KEY,
      );
    }

    // NOTE: stored data can be empty if user has already successfully completed transaction.
    
    const pageData = hasDataInProps
      ? { orderData, listing }
      : storedData(STORAGE_KEY);
    const tx = pageData ? pageData.transaction : null;
    console.log("PD", pageData, tx)

    // If transaction has passed payment-pending state, speculated tx is not needed.
    const shouldFetchSpeculatedTransaction =
      pageData &&
      pageData.listing &&
      pageData.listing.id &&
      pageData.orderData;
    
    if (shouldFetchSpeculatedTransaction) {
      const listingId = pageData.listing.id;
      const transactionId = tx ? tx.id : null;
      
      // Fetch speculated transaction for showing price in order breakdown
      // NOTE: if unit type is line-item/units, quantity needs to be added.
      // The way to pass it to checkout page is through pageData.orderData
      const quantity = pageData.orderData?.quantity;
      const quantityMaybe = quantity ? { quantity } : {};
      const deliveryMethod = pageData.orderData?.deliveryMethod;
      fetchSpeculatedTransaction(
        {
          listingId,
          deliveryMethod,
          ...quantityMaybe,
          ...bookingDatesMaybe(pageData.orderData.bookingDates),
        },
        transactionId
      );
    }

    const hasData   =
      pageData &&
      pageData.listing &&
      pageData.listing.id &&
      orderData &&
      orderData.quantity;

    console.info("HAS PAGE DATA",  hasData);
    if (hasData) {
      const listingId = pageData.listing.id;
      const quantity = orderData.quantity
      // Convert picked date to date that will be converted on the API as
      // a noon of correct year-month-date combo in UTC
      /*const { bookingStart, bookingEnd } = pageData.bookingDates;
      const bookingStartForAPI = dateFromLocalToAPI(bookingStart);
      const bookingEndForAPI = dateFromLocalToAPI(bookingEnd);*/

      // Fetch speculated transaction for showing price in booking breakdown
      // NOTE: if unit type is line-item/units, quantity needs to be added.
      // The way to pass it to checkout page is through pageData.bookingData
      fetchSpeculatedTransaction({
        listingId,
        quantity,
        bookingData:orderData
/*        bookingStart: bookingStartForAPI,
        bookingEnd: bookingEndForAPI,*/
      });
    }

    this.setState({ pageData: pageData || {}, dataLoaded: true });
  }

  handleSubmit(values) {
    console.log('Handle submit', values);

    if (this.state.submitting) {
      return;
    }

    this.setState({ submitting: true });

    const initialMessage = values.initialMessage;
    const {
      history,
      speculatedTransaction,
      dispatch,
      onInitiateOrder,
      onSendMessage,
      orderData,
      currentUser
    } = this.props;

    // Create order aka transaction
    // NOTE: if unit type is line-item/units, quantity needs to be added.
    // The way to pass it to checkout page is through pageData.bookingData
    const requestParams = {
      listingId: this.state.pageData.listing.id,
      orderData: orderData
    };

    console.log("PDA",this.state.pageData)
    const transactionIdMaybe = null;

    onInitiateOrder(requestParams, transactionIdMaybe).then(params => {
      console.log('Params', params);
      onSendMessage({ ...params, message: initialMessage })
        .then(values => {
          console.log('values', values);
          const { orderId, messageSuccess } = values;
          this.setState({ submitting: false });
          const routes = routeConfiguration();
          const OrderPage = findRouteByRouteName('OrderDetailsPage', routes);

          // Transaction is already created, but if the initial message
          // sending failed, we tell it to the OrderDetailsPage.
          dispatch(
            OrderPage.setInitialValues({
              initialMessageFailedToTransaction: messageSuccess
                ? null
                : orderId,
            })
          );
          const orderDetailsPath = pathByRouteName('OrderDetailsPage', routes, {
            id: orderId.uuid,
          });
          clearData(STORAGE_KEY);
          history.push(orderDetailsPath);
        })
        .catch(() => {
          this.setState({ submitting: false });
        });
    });
  }

  render() {
    const {
      scrollingDisabled,
      speculateTransactionInProgress,
      speculateTransactionError,
      speculatedTransaction: speculatedTransactionMaybe,
      initiateOrderError,
      intl,
      params,
      currentUser,
    } = this.props;

    // Since the listing data is already given from the ListingPage
    // and stored to handle refreshes, it might not have the possible
    // deleted or closed information in it. If the transaction
    // initiate or the speculative initiate fail due to the listing
    // being deleted or closec, we should dig the information from the
    // errors and not the listing data.
    const listingNotFound =
      isTransactionInitiateListingNotFoundError(speculateTransactionError) ||
      isTransactionInitiateListingNotFoundError(initiateOrderError);

    const isLoading = !this.state.dataLoaded || speculateTransactionInProgress;

    const { listing,transaction, orderData } = this.state.pageData;
    const existingTransaction = ensureTransaction(transaction);
    const speculatedTransaction = ensureTransaction(speculatedTransactionMaybe, {}, null);
    const currentListing = ensureListing(listing);
    const currentAuthor = ensureUser(currentListing.author);

    const isOwnListing =
      currentUser &&
      currentUser.id &&
      currentAuthor &&
      currentAuthor.id &&
      currentAuthor.id.uuid === currentUser.id.uuid;

    const hasListingAndAuthor = !!(currentListing.id && currentAuthor.id);
    const hasRequiredData = !!(currentListing.id && currentAuthor.id);//hasListingAndAuthor;
    const canShowPage = hasRequiredData && !isOwnListing;
    const shouldRedirect = !isLoading && !canShowPage;
    console.log("IN CHECKOUT PAGR", !isOwnListing, shouldRedirect,hasListingAndAuthor)

    // Redirect back to ListingPage if data is missing.
    // Redirection must happen before any data format error is thrown (e.g. wrong currency)
    if (shouldRedirect) {
      // eslint-disable-next-line no-console
      console.error(
        'Missing or invalid data for checkout, redirecting back to listing page.',
        {
          transaction: speculatedTransaction,
          listing,
        }
      );
      return <NamedRedirect name="ListingPage" params={params} />;
    }

      // Show breakdown only when (speculated?) transaction is loaded
    // (i.e. have an id and lineItems)
    console.log("BRX", existingTransaction, speculatedTransaction)
    const tx = existingTransaction.booking ? existingTransaction : speculatedTransaction;
    const txBookingMaybe = tx.booking?.id
      ? { booking: ensureBooking(tx.booking), dateType: DATE_TYPE_DATE }
      : {};
    console.log("RX", tx)
    const breakdown =
      tx.id && tx.attributes.lineItems?.length > 0 ? (
        <OrderBreakdown
          className={css.orderBreakdown}
          userRole="customer"
          unitType={config.lineItemUnitType}
          transaction={tx}
          {...txBookingMaybe}
        />
      ) : null;

    const isPaymentExpired = checkIsPaymentExpired(existingTransaction);
    const listingTitle = currentListing.attributes.title;
    const title = intl.formatMessage(
      { id: 'CheckoutPage.title' },
      { listingTitle }
    );
    
    const firstImage =
      currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;

    const { aspectWidth = 1, aspectHeight = 1, variantPrefix = 'listing-card' } = config.listing;
    const variants = firstImage
      ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
      : [];

    const listingLink = (
      <NamedLink
        name="ListingPage"
        params={{ id: currentListing.id.uuid, slug: createSlug(listingTitle) }}
      >
        <FormattedMessage id="CheckoutPage.errorlistingLinkText" />
      </NamedLink>
    );


    const topbar = (
      <div className={css.topbar}>
        <NamedLink className={css.home} name="LandingPage">
          <Logo
            className={css.logoMobile}
            title={intl.formatMessage({
              id: 'CheckoutPage.goToLandingPage',
            })}
            format="mobile"
          />
          <Logo
            className={css.logoDesktop}
            alt={intl.formatMessage({
              id: 'CheckoutPage.goToLandingPage',
            })}
            format="desktop"
          />
        </NamedLink>
      </div>
    );

    const unitType = config.lineItemUnitType;
    const isNightly = unitType === LINE_ITEM_NIGHT;
    const isDaily = unitType === LINE_ITEM_DAY;

    const unitTranslationKey = isNightly
      ? 'CheckoutPage.perNight'
      : isDaily
      ? 'CheckoutPage.perDay'
      : 'CheckoutPage.perUnit';

    const price = currentListing.attributes.price;
    const formattedPrice = formatMoney(intl, price);
    const detailsSubTitle = `${formattedPrice} ${intl.formatMessage({ id: unitTranslationKey })}`;

    /*const showInitialMessageInput = true;*/
    const showInitialMessageInput = !(
      existingTransaction && existingTransaction.attributes.lastTransition === TRANSITION_ENQUIRE
    );

    const pageProps = { title, scrollingDisabled };

    if (isLoading) {
      return (
        <Page {...pageProps}>
          {topbar}
          <div className={css.loading}>
            <FormattedMessage id="CheckoutPage.loadingData" />
          </div>
        </Page>
      );
    }
    const authorDisplayName = currentAuthor.attributes.profile.displayName;
    const messagePlaceholder = intl.formatMessage(
      { id: 'StripePaymentForm.messagePlaceholder' },
      { name: authorDisplayName }
    );

    const messageOptionalText = intl.formatMessage({
      id: 'StripePaymentForm.messageOptionalText',
    });

    const initialMessageLabel = intl.formatMessage(
      { id: 'StripePaymentForm.messageLabel' },
      { messageOptionalText: messageOptionalText }
    );

    const bookingForm = (
      <FinalForm
        onSubmit={values => this.handleSubmit(values)}
        render={fieldRenderProps => {
          const { handleSubmit } = fieldRenderProps;
          return (
            <Form onSubmit={handleSubmit}>
              {showInitialMessageInput ? (
                <div>
                  <h3 className={css.messageHeading}>
                    <FormattedMessage id="StripePaymentForm.messageHeading" />
                  </h3>

                  <FieldTextInput
                    type="textarea"
                    id={`bookingForm-message`}
                    name="initialMessage"
                    label={initialMessageLabel}
                    placeholder={messagePlaceholder}
                    className={css.message}
                  />
                </div>
              ) : null}
              <div className={css.submitContainer}>
                <PrimaryButton
                  className={css.submitButton}
                  type="submit"
                  inProgress={this.state.submitting}
                  disabled={false}
                >
                  Confirm booking
                </PrimaryButton>
              </div>
            </Form>
          );
        }}
      />
    );

    return (
      <Page {...pageProps}>
        {topbar}
        <div className={css.contentContainer}>
          <div className={css.aspectWrapper}>
            <ResponsiveImage
              rootClassName={css.rootForImage}
              alt={listingTitle}
              image={firstImage}
              variants={['listing-card','landscape-crop', 'landscape-crop2x']}
            />
          </div>
          <div className={classNames(css.avatarWrapper, css.avatarMobile)}>
            <AvatarMedium user={currentAuthor} disableProfileLink />
          </div>
          <div className={css.bookListingContainer}>
            <div className={css.heading}>
              <h1 className={css.title}>{title}</h1>
              <div className={css.author}>
                <FormattedMessage
                  id="CheckoutPage.hostedBy"
                  values={{ name: authorDisplayName }}
                />
              </div>
            </div>

            <div className={css.priceBreakdownContainer}>
              {breakdown}
            </div>

            <section className={css.paymentContainer}>
              {bookingForm}
            </section>
          </div>

          <div className={css.detailsContainerDesktop}>
            <AspectRatioWrapper
              width={aspectWidth}
              height={aspectHeight}
              className={css.detailsAspectWrapper}
            >
              <ResponsiveImage
                rootClassName={css.rootForImage}
                alt={listingTitle}
                image={firstImage}
                variants={variants}
              />
            </AspectRatioWrapper>
            <div className={css.avatarWrapper}>
              <AvatarMedium user={currentAuthor} disableProfileLink />
            </div>
            <div className={css.detailsHeadings}>
              <h2 className={css.detailsTitle}>{listingTitle}</h2>
              <p className={css.detailsSubtitle}>{detailsSubTitle}</p>
            </div>
            
            <h2 className={css.orderBreakdownTitle}>
              <FormattedMessage id="CheckoutPage.orderBreakdown" />
            </h2>
            {breakdown}
          </div>
        </div>
      </Page>
    );
  }
}

CheckoutPageComponent.defaultProps = {
  initiateOrderError: null,
  listing: null,
  bookingData: {},
  bookingDates: null,
  speculateTransactionError: null,
  speculatedTransaction: null,
  currentUser: null,
  orderData: {}
};

CheckoutPageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  listing: propTypes.listing,
  bookingData: object,
  bookingDates: shape({
    bookingStart: instanceOf(Date).isRequired,
    bookingEnd: instanceOf(Date).isRequired,
  }),
  fetchSpeculatedTransaction: func.isRequired,
  speculateTransactionInProgress: bool.isRequired,
  speculateTransactionError: propTypes.error,
  speculatedTransaction: propTypes.transaction,
  initiateOrderError: propTypes.error,
  currentUser: propTypes.currentUser,
  params: shape({
    id: string,
    slug: string,
  }).isRequired,
  sendOrderRequest: func,
  onCreateStripePaymentToken: func,
  orderData: object,

  // from connect
  dispatch: func.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
};

const mapStateToProps = state => {
  const {
    listing,
    bookingData,
    bookingDates,
    speculateTransactionInProgress,
    speculateTransactionError,
    speculatedTransaction,
    initiateOrderError,
    transaction,
    orderData,
  } = state.CheckoutPage;
  const { currentUser } = state.user;

  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    bookingData,
    bookingDates,
    speculateTransactionInProgress,
    speculateTransactionError,
    speculatedTransaction,
    listing,
    initiateOrderError,
    transaction,
    orderData,
  };
};

const mapDispatchToProps = dispatch => ({
  dispatch,
  onInitiateOrder: (params, transactionId) =>
    dispatch(initiateOrder(params, transactionId)),
  onSendMessage: params => dispatch(sendMessage(params)),
  //fetchSpeculatedTransaction: params => dispatch(speculateTransaction(params)),
  fetchSpeculatedTransaction: (params) =>
    dispatch(speculateTransaction(params)),
});

const CheckoutPage = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(CheckoutPageComponent);

CheckoutPage.setInitialValues = initialValues =>
  setInitialValues(initialValues);

CheckoutPage.displayName = 'CheckoutPage';

export default CheckoutPage;