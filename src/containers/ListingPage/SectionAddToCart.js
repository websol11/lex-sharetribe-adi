import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';

import css from './ListingPage.module.css';

const AddToCartIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" marginright="10px" viewBox="0 0 24 24"><path d="M10 19.5c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5zm3.5-1.5c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5c0-.828-.672-1.5-1.5-1.5zm1.336-5l1.977-7h-16.813l2.938 7h11.898zm4.969-10l-3.432 12h-12.597l.839 2h13.239l3.474-12h1.929l.743-2h-4.195z"/></svg>
  );
};

const SectionAddToCart = props => {
  const { publicData,
  onUpdateCart,
	listingId,
	currentUser,
  quantity,
	updateCartInProgress, 
  } = props;

  let action="add";
  console.log("HERE IN SATC", currentUser,quantity, listingId);

  const cartProducts = currentUser?.attributes?.profile?.protectedData?.cartLikedProducts;
  if (cartProducts != undefined){
    if (cartProducts.length){
      cartProducts.map((each, i)=>{
        if ((each["id"] == listingId)){
          if (each["quantity"] == quantity)
            action = "remove";
          else
            action = "update";
        }
      });
    }    
  }
  console.log("COS", cartProducts, action);

  return (
    <span className="cartIcon"
    	onClick={() => {
			if (listingId && currentUser && quantity) {
				onUpdateCart({"id":listingId, "quantity":quantity, "action":action});
			}
	   }}>
      <AddToCartIcon/>
      <span style={{marginLeft: '10px'}} >{action == "add"?"Add to cart":(action == "remove")?"Remove from cart":"Update cart"}</span>
      
    </span>     
  );
};

export default SectionAddToCart;