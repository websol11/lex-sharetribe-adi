import React, { Component } from 'react';
import { bool, func, object, string } from 'prop-types';
import { Form as FinalForm, Field } from 'react-final-form';
import classNames from 'classnames';

import config from '../../../config';
import { intlShape, injectIntl } from '../../../util/reactIntl';
import { isMainSearchTypeKeywords } from '../../../util/search';

import { Form, LocationAutocompleteInput } from '../../../components';

import IconSearchDesktop from './IconSearchDesktop';
import css from './TopbarSearchForm.module.css';

const identity = v => v;

const KeywordSearchField = props => {
  const { keywordSearchWrapperClasses, iconClass, intl, isMobile, inputRef } = props;
  return (
    <div className={keywordSearchWrapperClasses}>
      <button className={css.searchSubmit}>
        <div className={iconClass}>
          <IconSearchDesktop />
        </div>
      </button>
      <Field
        name="keywords"
        render={({ input, meta }) => {
          return (
            <input
              className={isMobile ? css.mobileInput : css.desktopInput}
              {...input}
              id="keyword-search"
              ref={inputRef}
              type="text"
              placeholder={intl.formatMessage({
                id: 'TopbarSearchForm.placeholder',
              })}
              autoComplete="on"
              onChange={this.onChange}
            />
          );
        }}
      />
    </div>
  );
};

const LocationSearchField = props => {
  const { desktopInputRootClass, intl, isMobile, inputRef, onLocationChange } = props;
  return (
    <Field
      name="location"
      format={identity}
      render={({ input, meta }) => {
        const { onChange, ...restInput } = input;

        // Merge the standard onChange function with custom behaviur. A better solution would
        // be to use the FormSpy component from Final Form and pass this.onChange to the
        // onChange prop but that breaks due to insufficient subscription handling.
        // See: https://github.com/final-form/react-final-form/issues/159
        const searchOnChange = value => {
          onChange(value);
          onLocationChange(value);
        };

        return (
          <LocationAutocompleteInput
            className={isMobile ? css.mobileInputRoot : desktopInputRootClass}
            iconClassName={isMobile ? css.mobileIcon : css.desktopIcon}
            inputClassName={isMobile ? css.mobileInput : css.desktopInput}
            predictionsClassName={isMobile ? css.mobilePredictions : css.desktopPredictions}
            predictionsAttributionClassName={isMobile ? css.mobilePredictionsAttribution : null}
            placeholder={intl.formatMessage({ id: 'TopbarSearchForm.placeholder' })}
            closeOnBlur={!isMobile}
            inputRef={inputRef}
            input={{ ...restInput, onChange: searchOnChange }}
            meta={meta}
          />
        );
      }}
    />
  );
};

const ListingSearchField = props => {
  const { desktopInputRootClass, intl, isMobile, inputRef, onInputChange } = props;
  return (
    <Field
      name="keywords"
      format={identity}
      render={({ input, meta }) => {
        const { onChange, ...restInput } = input;

      
        const searchOnChange = value => {
          onChange(value);
          onInputChange(value);
          restInput.value = value.search;
          console.log("INI", restInput, value);
        };

        return (
          <LocationAutocompleteInput
            className={isMobile ? css.mobileInputRoot : desktopInputRootClass}
            iconClassName={isMobile ? css.mobileIcon : css.desktopIcon}
            inputClassName={isMobile ? css.mobileInput : css.desktopInput}
            predictionsClassName={isMobile ? css.mobilePredictions : css.desktopPredictions}
            predictionsAttributionClassName={isMobile ? css.mobilePredictionsAttribution : null}
            placeholder={intl.formatMessage({ id: 'TopbarSearchForm.placeholder' })}
            closeOnBlur={!isMobile}
            inputRef={inputRef}
            input={{ ...restInput, onChange: searchOnChange }}
            meta={meta}
          />
        );
      }}
    />
  );
};

class TopbarSearchFormComponent extends Component {
  constructor(props) {
    super(props);
    // onChange is used for location search
    this.onChange = this.onChange.bind(this);
    // onSubmit is used for keywords search
    this.onSubmit = this.onSubmit.bind(this);
    this.onListingKeywordChange = this.onListingKeywordChange.bind(this);

    // Callback ref
    this.searchInput =       null;
    this.setSearchInputRef = element => {
      this.setSearchInput = element;
    };
  }

  onChange(location) {
    const { appConfig, onSubmit } = this.props;
    console.log("ON CHAN", location)
    //if (!isMainSearchTypeKeywords(appConfig) && location.selectedPlace) {
    if (location.selectedPlace) {
      // Note that we use `onSubmit` instead of the conventional
      // `handleSubmit` prop for submitting. We want to autosubmit
      // when a place is selected, and don't require any extra
      // validations for the form.
      //onSubmit({ location });
      onSubmit({ keywords: location.selectedPlace });
      
      // blur search input to hide software keyboard
      this.searchInput?.blur();
    }
  }

  onListingKeywordChange(keyword) {
    const { appConfig, onSubmit } = this.props;
      onSubmit({ keyword });
      // blur search input to hide software keyboard
      this.searchInput?.blur();
  }

  onSubmit(values) {
    this.props.onSubmit({ keywords: values.keywords });
    const { appConfig, onSubmit } = this.props;

    if (isMainSearchTypeKeywords(appConfig)) {
      onSubmit({ keywords: values.keywords });
      // blur search input to hide software keyboard
      this.searchInput?.blur();
    }
  }

  render() {
    const { onSubmit, appConfig, ...restOfProps } = this.props;
    let isKeywordsSearch = isMainSearchTypeKeywords(appConfig);
    console.log("iks",isKeywordsSearch);
    isKeywordsSearch = false;
    const submit = isKeywordsSearch ? this.onSubmit : onSubmit;
    return (
      <FinalForm
        {...restOfProps}
        onSubmit={submit}
        render={formRenderProps => {
          const {
            rootClassName,
            className,
            desktopInputRoot,
            intl,
            isMobile,
            handleSubmit,
          } = formRenderProps;
          const classes = classNames(rootClassName, className);
          const desktopInputRootClass = desktopInputRoot || css.desktopInputRoot;

          // Location search: allow form submit only when the place has changed
          const preventFormSubmit = e => e.preventDefault();
          const submitFormFn = isKeywordsSearch ? handleSubmit : handleSubmit;

          const keywordSearchWrapperClasses = classNames(
            css.keywordSearchWrapper,
            isMobile ? css.mobileInputRoot : desktopInputRootClass
          );

          return (
            <Form className={classes} onSubmit={submitFormFn} enforcePagePreloadFor="SearchPage">
              {isKeywordsSearch ? (
                <KeywordSearchField
                  keywordSearchWrapperClasses={keywordSearchWrapperClasses}
                  iconClass={classNames(isMobile ? css.mobileIcon : css.desktopIcon || css.icon)}
                  intl={intl}
                  isMobile={isMobile}
                  inputRef={this.setSearchInputRef}
                />
              ) : (
                <ListingSearchField
                  desktopInputRootClass={desktopInputRootClass}
                  intl={intl}
                  isMobile={isMobile}
                  inputRef={this.setSearchInputRef}
                  onInputChange={this.onChange}
                />
              )}
            </Form>
          );
        }}
      />
    );
  }
}

TopbarSearchFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  desktopInputRoot: null,
  isMobile: false,
  appConfig: config,
};

TopbarSearchFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  desktopInputRoot: string,
  onSubmit: func.isRequired,
  isMobile: bool,
  appConfig: object,

  // from injectIntl
  intl: intlShape.isRequired,
};

const TopbarSearchForm = injectIntl(TopbarSearchFormComponent);

export default TopbarSearchForm;
