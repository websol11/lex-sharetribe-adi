import React, { useEffect } from 'react';
import { bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

// Import configs and util modules
import config from '../../../../config';
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import {
  autocompleteSearchRequired,
  autocompletePlaceSelected,
  composeValidators,
  required,
  numberAtLeast,
} from '../../../../util/validators';

// Import shared components
import {
  Form,
  LocationAutocompleteInputField,
  Button,
  FieldCurrencyInput,
  FieldTextInput,
  FieldCheckbox,
} from '../../../../components';

// Import modules from this directory
import css from './EditListingDeliveryForm.module.css';

const identity = v => v;

export const EditListingDeliveryFormComponent = props => (
  <FinalForm
    {...props}
    render={formRenderProps => {
      const {
        form,
        autoFocus,
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        pristine,
        invalid,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        values,
      } = formRenderProps;

      // This is a bug fix for Final Form.
      // Without this, React will return a warning:
      //   "Cannot update a component (`ForwardRef(Field)`)
      //   while rendering a different component (`ForwardRef(Field)`)"
      // This seems to happen because validation calls listeneres and
      // that causes state to change inside final-form.
      // https://github.com/final-form/react-final-form/issues/751
      //
      // TODO: it might not be worth the trouble to show these fields as disabled,
      // if this fix causes trouble in future dependency updates.
      const { pauseValidation, resumeValidation } = form;
      pauseValidation(false);
      useEffect(() => resumeValidation(), [values]);

      const shippingEnabled = values.deliveryOptions?.includes('shipping');
      const pickupEnabled = values.deliveryOptions?.includes('pickup');

      const titleRequiredMessage = intl.formatMessage({ id: 'EditListingDeliveryForm.address' });
      const handlingTimeRequiredMessage = intl.formatMessage({ id: 'EditListingDeliveryForm.handlingTime' });
      const returnPolicyMessage = intl.formatMessage({ id: 'EditListingDeliveryForm.handlingTime' });
      
      const addressPlaceholderMessage = intl.formatMessage({
        id: 'EditListingDeliveryForm.locationPlaceholder',
      });

      const handlingTimePlaceholderMessage = intl.formatMessage({
        id: 'EditListingDeliveryForm.handlingTimePlaceholder',
      });
      const addressRequiredMessage = intl.formatMessage({
        id: 'EditListingDeliveryForm.addressRequired',
      });
      const addressNotRecognizedMessage = intl.formatMessage({
        id: 'EditListingDeliveryForm.addressNotRecognized',
      });
      const optionalText = intl.formatMessage({
        id: 'EditListingDeliveryForm.optionalText',
      });
      const buildingMessage = intl.formatMessage(
        { id: 'EditListingDeliveryForm.building' },
        { optionalText: optionalText }
      );
      const buildingPlaceholderMessage = intl.formatMessage({
        id: 'EditListingDeliveryForm.buildingPlaceholder',
      });
      const { updateListingError, showListingsError } = fetchErrors || {};
      const errorMessage = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDeliveryForm.updateFailed" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDeliveryForm.showListingFailed" />
        </p>
      ) : null;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled =
        invalid || disabled || submitInProgress;

      const shippingLabel = intl.formatMessage({ id: 'EditListingDeliveryForm.shippingLabel' });
      const pickupLabel = intl.formatMessage({ id: 'EditListingDeliveryForm.pickupLabel' });

      const pickupClasses = classNames(css.deliveryOption, !pickupEnabled ? null  : null);
      const shippingClasses = classNames(
        css.deliveryOption,
        !shippingEnabled ? null : null
      );

      const locationValidator = numberAtLeast(
        intl.formatMessage({ id: 'EditListingDeliveryForm.locationIsRequired' }),
        0
      );

      const handlingTimeValidator = numberAtLeast(
        intl.formatMessage({ id: 'EditListingDeliveryForm.handlingTimeIsRequired' }),
        0
      );

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <div className={pickupClasses}>
            {errorMessage}
            <FieldTextInput
              id="pickup"
              name="deliveryOptions"
              value="pickup"
              type="hidden"
            />
            <FieldTextInput
              id="shipping"
              name="deliveryOptions"
              value="shipping"
              type="hidden"
            />
            <FieldTextInput
              className={css.input}
              autoFocus={autoFocus}
              name="zipcode"
              id="zipcode"
              label={titleRequiredMessage}
              placeholder={addressPlaceholderMessage}
              type="number"
              validate={locationValidator}
            />
            <FieldTextInput
              className={css.input}
              name="handlingTime"
              id="handlingTime"
              label={handlingTimeRequiredMessage}
              placeholder={handlingTimePlaceholderMessage}
              type="number"
              validate={handlingTimeValidator}
            />
          </div>
          <div className={shippingClasses}>
            <FieldCurrencyInput
              id="shippingPriceInSubunitsOneItem"
              name="shippingPriceInSubunitsOneItem"
              className={css.input}
              label={intl.formatMessage({
                id: 'EditListingDeliveryForm.shippingOneItemLabel',
              })}
              placeholder={intl.formatMessage({
                id: 'EditListingDeliveryForm.shippingOneItemPlaceholder',
              })}
              currencyConfig={config.currencyConfig}
              validate={
                  required(
                    intl.formatMessage({
                      id: 'EditListingDeliveryForm.shippingOneItemRequired',
                    })
                  )
              }
              hideErrorMessage={!shippingEnabled}
              key={'oneItemValidation'}
            />

            <FieldTextInput
              id="return_policy"
              name="return_policy"
              className={css.input}
              type="textarea"
              label={intl.formatMessage({
                id: 'EditListingDeliveryForm.returnPolicyMessage',
              })}
              placeholder={intl.formatMessage({
                id: 'EditListingDeliveryForm.returnPolicyPlaceholderMessage',
              })}
            />
          </div>


          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

EditListingDeliveryFormComponent.defaultProps = {
  selectedPlace: null,
  fetchErrors: null,
};

EditListingDeliveryFormComponent.propTypes = {
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  selectedPlace: propTypes.place,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
};

export default compose(injectIntl)(EditListingDeliveryFormComponent);
