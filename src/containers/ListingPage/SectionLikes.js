import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';

import css from './ListingPage.module.css';

const IconHeart = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 28 "
      fill="#817d7d"
    >
      <path d="M11 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z" />
    </svg>
  );
};

const SectionLikes = props => {
  const { publicData,
  	onUpdateLikes,
	listingId,
	currentUser,
	updateLikesInProgress, 
  } = props;

  const likes = publicData?.likes ? publicData.likes : 0;
  const currentLikes = currentUser?.attributes?.profile?.privateData?.likedListings;
  console.log("cl", currentLikes, listingId);
  return (
    <span className={css.heartIcon}
    	onClick={() => {
			//if (!updateLikesInProgress && currentUser) {
				onUpdateLikes(listingId);
			//}
	}}>
      <IconHeart /> {/*{likes}*/}
    </span>
  );
};

export default SectionLikes;