import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { richText } from '../../util/richText';

import css from './ListingPage.module.css';

const MIN_LENGTH_FOR_LONG_WORDS_IN_DESCRIPTION = 20;

const SectionReturnPolicy = props => {
  const { publicData, customConfig } = props;
  const { listing, filters } = customConfig || {};

  if (!publicData || !customConfig) {
    return null;
  }
  
  return publicData.return_policy ? (
    <div className={css.sectionDetails}>
      <h2 className={css.returnTitle}>
        <FormattedMessage id="ListingPage.returnTitle" />
      </h2>
      <p className={css.description}>
        {richText(publicData.return_policy, {
          longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS_IN_DESCRIPTION,
          longWordClass: css.longWord,
        })}
      </p>       
    </div>
  ) : null;
};

export default SectionReturnPolicy;
