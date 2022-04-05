import React from 'react';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import css from './CartPage.module.css';
import {
    LayoutSingleColumn,
    LayoutWrapperTopbar,
    LayoutWrapperMain,
    LayoutWrapperFooter,
    Footer,
    ExternalLink,
  } from '../../components';

const CartPage = () => {
    return (
        <div>
            <LayoutSingleColumn>
                <LayoutWrapperTopbar>
                    <TopbarContainer />
                </LayoutWrapperTopbar>
                <LayoutWrapperMain className={css.staticPageWrapper}>
                    Sorry, Could not find any item in cart
                </LayoutWrapperMain>
                <LayoutWrapperFooter>
                    <Footer />
                </LayoutWrapperFooter>
            </LayoutSingleColumn>
        </div>
    );
};


export default CartPage

