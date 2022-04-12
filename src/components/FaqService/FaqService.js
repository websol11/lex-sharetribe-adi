import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './FaqService.module.css';

const FaqService = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);

  // prettier-ignore
  return (
    <div className={classes}>
      H1853
    </div>
  );
};

FaqService.defaultProps = {
  rootClassName: null,
  className: null,
};

const { string } = PropTypes;

FaqService.propTypes = {
  rootClassName: string,
  className: string,
};

export default FaqService;
