import React from 'react';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import css from './ShopByCategoryPage.module.css';
import {
    LayoutSingleColumn,
    LayoutWrapperTopbar,
    LayoutWrapperMain,
    LayoutWrapperFooter,
    Footer,
    ExternalLink,
} from '../../components';

const ShopByCategoryPage = () => {
    return (
        <div>
            <LayoutSingleColumn>
                <LayoutWrapperTopbar>
                    <TopbarContainer />
                </LayoutWrapperTopbar>
                <LayoutWrapperMain className={css.staticPageWrapper}>
                    Sorry, Could not find any item
                </LayoutWrapperMain>
                <LayoutWrapperFooter>
                    <Footer />
                </LayoutWrapperFooter>
            </LayoutSingleColumn>
        </div>
    );
};


export default ShopByCategoryPage

