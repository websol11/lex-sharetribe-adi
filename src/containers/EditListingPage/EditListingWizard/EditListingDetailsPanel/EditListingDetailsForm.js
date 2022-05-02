import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

// Import configs and util modules
import config from '../../../../config';
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import { maxLength, required, composeValidators } from '../../../../util/validators';
import { findConfigForSelectFilter } from '../../../../util/search';

// Import shared components
import { Form, Button, FieldTextInput } from '../../../../components';
// Import modules from this directory
import CustomFieldEnum from '../CustomFieldEnum';
import css from './EditListingDetailsForm.module.css';

const TITLE_MAX_LENGTH = 60;

const EditListingDetailsFormComponent = props => (
  <FinalForm
    {...props}
    render={formRenderProps => {
      const {
        autoFocus,
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        filterConfig,
      } = formRenderProps;

      const titleMessage = intl.formatMessage({ id: 'EditListingDetailsForm.title' });
      const titlePlaceholderMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.titlePlaceholder',
      });
      const titleRequiredMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.titleRequired',
      });
      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingDetailsForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );

      const descriptionMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.description',
      });
      const descriptionPlaceholderMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.descriptionPlaceholder',
      });
      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);
      const descriptionRequiredMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.descriptionRequired',
      });

      const asinMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.asin',
      });
      const asinPlaceholderMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.asinPlaceholder',
      });
      const isbnMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.isbn',
      });
      const isbnPlaceholderMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.isbnPlaceholder',
      });
      const mpnMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.mpn',
      });
      const mpnPlaceholderMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.mpnPlaceholder',
      });
      const upcMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.upc',
      });
      const upcPlaceholderMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.upcPlaceholder',
      });
      const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
      const errorMessageUpdateListing = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDetailsForm.updateFailed" />
        </p>
      ) : null;

      // This error happens only on first tab (of EditListingWizard)
      const errorMessageCreateListingDraft = createListingDraftError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDetailsForm.createListingDraftError" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDetailsForm.showListingFailed" />
        </p>
      ) : null;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      const categoryConfig = findConfigForSelectFilter('category', filterConfig);
      const categorySchemaType = categoryConfig.schemaType;
      const categories = categoryConfig.options ? categoryConfig.options : [];
      const categoryLabel = intl.formatMessage({
        id: 'EditListingDetailsForm.categoryLabel',
      });
      const categoryPlaceholder = intl.formatMessage({
        id: 'EditListingDetailsForm.categoryPlaceholder',
      });

      const categoryRequired = required(
        intl.formatMessage({
          id: 'EditListingDetailsForm.categoryRequired',
        })
      );

      const conditionConfig = findConfigForSelectFilter('condition', filterConfig);
      const conditionSchemaType = conditionConfig ? conditionConfig.schemaType : null;
      const conditions = conditionConfig && conditionConfig.options ? conditionConfig.options : [];
      const conditionLabel = intl.formatMessage({
        id: 'EditListingDetailsForm.conditionLabel',
      });
      const conditionPlaceholder = intl.formatMessage({
        id: 'EditListingDetailsForm.conditionPlaceholder',
      });

      const conditionRequired = required(
        intl.formatMessage({
          id: 'EditListingDetailsForm.conditionRequired',
        })
      );

      const brandConfig = findConfigForSelectFilter('brand', filterConfig);
      const brandSchemaType = brandConfig ? brandConfig.schemaType : null;
      const brands = brandConfig && brandConfig.options ? brandConfig.options : [];
      const brandLabel = intl.formatMessage({
        id: 'EditListingDetailsForm.brandLabel',
      });
      const brandPlaceholder = intl.formatMessage({
        id: 'EditListingDetailsForm.brandPlaceholder',
      });

      const brandRequired = required(
        intl.formatMessage({
          id: 'EditListingDetailsForm.brandRequired',
        })
      );

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessageCreateListingDraft}
          {errorMessageUpdateListing}
          {errorMessageShowListing}
          <FieldTextInput
            id="title"
            name="title"
            className={css.title}
            type="text"
            label={titleMessage}
            placeholder={titlePlaceholderMessage}
            maxLength={TITLE_MAX_LENGTH}
            validate={composeValidators(required(titleRequiredMessage), maxLength60Message)}
            autoFocus={autoFocus}
          />
          <FieldTextInput
            id="description"
            name="description"
            className={css.description}
            type="textarea"
            label={descriptionMessage}
            placeholder={descriptionPlaceholderMessage}
            validate={composeValidators(required(descriptionRequiredMessage))}
          />
          <CustomFieldEnum
            id="condition"
            name="condition"
            options={conditions}
            label={conditionLabel}
            placeholder={conditionPlaceholder}
            validate={conditionRequired}
            schemaType={conditionSchemaType}
          />

          <CustomFieldEnum
            id="category"
            name="category"
            options={categories}
            label={categoryLabel}
            placeholder={categoryPlaceholder}
            validate={categoryRequired}
            schemaType={categorySchemaType}
          />


          <CustomFieldEnum
            id="brand"
            name="brand"
            options={brands}
            label={brandLabel}
            placeholder={brandPlaceholder}
            schemaType={brandSchemaType}
          />
          <FieldTextInput
            id="asin"
            name="asin"
            className={css.asin}
            type="textarea"
            label={asinMessage}
            placeholder={asinPlaceholderMessage}
          />
          <FieldTextInput
            id="isbn"
            name="isbn"
            className={css.isbn}
            type="textarea"
            label={isbnMessage}
            placeholder={isbnPlaceholderMessage}
          />
          <FieldTextInput
            id="mpn"
            name="mpn"
            className={css.mpn}
            type="textarea"
            label={mpnMessage}
            placeholder={mpnPlaceholderMessage}
          />
          <FieldTextInput
            id="upc"
            name="upc"
            className={css.upc}
            type="textarea"
            label={upcMessage}
            placeholder={upcPlaceholderMessage}
          />
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

EditListingDetailsFormComponent.defaultProps = {
  className: null,
  fetchErrors: null,
  filterConfig: config.custom.filters,
};

EditListingDetailsFormComponent.propTypes = {
  className: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    createListingDraftError: propTypes.error,
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  filterConfig: propTypes.filterConfig,
};

export default compose(injectIntl)(EditListingDetailsFormComponent);
