import React from 'react';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import css from './OrdersPage.module.css';
import {
    LayoutSingleColumn,
    LayoutWrapperTopbar,
    LayoutWrapperMain,
    LayoutWrapperFooter,
    Footer,
    ExternalLink,
} from '../../components';

const OrdersPage = () => {
    return (
        <div>
            <LayoutSingleColumn>
                <LayoutWrapperTopbar>
                    <TopbarContainer />
                </LayoutWrapperTopbar>
                <LayoutWrapperMain className={css.staticPageWrapper}>
                    Sorry, Could not find any order
                </LayoutWrapperMain>
                <LayoutWrapperFooter>
                    <Footer />
                </LayoutWrapperFooter>
            </LayoutSingleColumn>
        </div>
    );
};


export default OrdersPage

