import React from 'react';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import css from './MessagesPage.module.css';
import {
    LayoutSingleColumn,
    LayoutWrapperTopbar,
    LayoutWrapperMain,
    LayoutWrapperFooter,
    Footer,
    ExternalLink,
  } from '../../components';

const MassagesPage = () => {
    return (
        <div>
            <LayoutSingleColumn>
                <LayoutWrapperTopbar>
                    <TopbarContainer />
                </LayoutWrapperTopbar>
                <LayoutWrapperMain className={css.staticPageWrapper}>
                Sorry, Could not find any messages
                </LayoutWrapperMain>
                <LayoutWrapperFooter>
                    <Footer />
                </LayoutWrapperFooter>
            </LayoutSingleColumn>
        </div>
    );
};


export default MassagesPage

