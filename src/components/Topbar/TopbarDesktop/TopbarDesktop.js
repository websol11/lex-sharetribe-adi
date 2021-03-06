import React, { useState, useEffect } from 'react';
import { any, bool, func, object, number, string } from 'prop-types';
import classNames from 'classnames';

import { FormattedMessage, intlShape } from '../../../util/reactIntl';
import { ACCOUNT_SETTINGS_PAGES } from '../../../routing/routeConfiguration';
import { propTypes } from '../../../util/types';
import {
  Avatar,
  InlineTextButton,
  Logo,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  NamedLink,
  NotificationBadge,
} from '../../../components';

import TopbarSearchForm from '../TopbarSearchForm/TopbarSearchForm';

import css from './TopbarDesktop.module.css';

const TopbarDesktop = props => {
  const {
    className,
    appConfig,
    currentUser,
    currentPage,
    rootClassName,
    currentUserHasListings,
    notificationCount,
    intl,
    isAuthenticated,
    onLogout,
    onSearchSubmit,
    initialSearchFormValues,
  } = props;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const authenticatedOnClientSide = mounted && isAuthenticated;
  const isAuthenticatedOrJustHydrated = isAuthenticated || !mounted;

  const classes = classNames(rootClassName || css.root, className);
  const cartProductsCount =
      currentUser?.attributes?.profile?.protectedData?.cartLikedProducts?.length;
  const wishlistProductsCount =
      currentUser?.attributes?.profile?.privateData?.likedListings?.length;
  
  const search = (
    <TopbarSearchForm
      className={css.searchLink}
      desktopInputRoot={css.topbarSearchWithLeftPadding}
      onSubmit={onSearchSubmit}
      initialValues={initialSearchFormValues}
      appConfig={appConfig}
    />
  );

  const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null;
  const cartCountBadge =
    cartProductsCount > 0 ? (
      <NotificationBadge className={css.notificationBadge} count={cartProductsCount} />
    ) : null;
  const wishlistCountBadge =
    wishlistProductsCount > 0 ? (
      <NotificationBadge className={css.notificationWishlistBadge} count={wishlistProductsCount} />
    ) : null;
  const inboxLink = authenticatedOnClientSide ? (
    <NamedLink
      className={css.inboxLink}
      name="InboxPage"
      params={{ tab: currentUserHasListings ? 'orders' : 'orders' }} /*'sales' : 'orders'*/
    >
      <span className={css.inbox}>
        <FormattedMessage id="TopbarDesktop.orders" />
        {notificationDot}
      </span>
    </NamedLink>
  ) : null;

  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  const profileMenu = authenticatedOnClientSide ? (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <Avatar className={css.avatar} user={currentUser} disableProfileLink />
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        <MenuItem key="ManageListingsPage">
          <NamedLink
            className={classNames(css.yourListingsLink, currentPageClass('ManageListingsPage'))}
            name="ManageListingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.yourListingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="WishlistPage">
          <NamedLink
            className={classNames(css.wishlistPageLink, currentPageClass('WishlistPage'))}
            name="WishlistPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.wishlistLink" />
            {wishlistCountBadge}
          </NamedLink>
        </MenuItem>
        <MenuItem key="ProfileSettingsPage">
          <NamedLink
            className={classNames(css.profileSettingsLink, currentPageClass('ProfileSettingsPage'))}
            name="ProfileSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.profileSettingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="AccountSettingsPage">
          <NamedLink
            className={classNames(css.yourListingsLink, currentPageClass('AccountSettingsPage'))}
            name="AccountSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="logout">
          <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.logout" />
          </InlineTextButton>
        </MenuItem>
      </MenuContent>
    </Menu>
  ) : null;

  const signupLink = isAuthenticatedOrJustHydrated ? null : (
    <NamedLink name="SignupPage" className={css.signupLink}>
      <span className={css.signup}>
        <FormattedMessage id="TopbarDesktop.signup" />
      </span>
    </NamedLink>
  );

  const loginLink = isAuthenticatedOrJustHydrated ? null : (
    <NamedLink name="LoginPage" className={css.loginLink}>
      <span className={css.login}>
        <FormattedMessage id="TopbarDesktop.login" />
      </span>
    </NamedLink>
  );


  const shopByCategoryLink = (
    <NamedLink name="DepartmentPage" className={css.shopByCategoryLink}>
      <span className={css.shopByCategory}>
        <FormattedMessage id="TopbarDesktop.shopByCategory" />
      </span>
    </NamedLink>
  );


  const shoppingCartLink = (
    <NamedLink name="CartPage" className={css.shoppingCartLink}>
      <span className={css.shoppingCart}>
        <FormattedMessage id="TopbarDesktop.shoppingCart" />
        
      </span>
      {cartCountBadge}
    </NamedLink>
  );


  const messagesLink = authenticatedOnClientSide ? (
    <NamedLink name="MassagesPage" className={css.messagesLink}>
      <span className={css.messages}>
        <FormattedMessage id="TopbarDesktop.messages" />
      </span>
    </NamedLink>
  ):null;


  const aboutLink = authenticatedOnClientSide ? (
    <NamedLink name="ContactUsPage" className={css.messagesLink}>
      <span className={css.messages}>
        <FormattedMessage id="Footer.toContactPage" />
      </span>
    </NamedLink>
  ):null;

  const helpLink = authenticatedOnClientSide ? (
    <NamedLink name="FaqPage" className={css.messagesLink}>
      <span className={css.messages}>
        <FormattedMessage id="Footer.toHelpPage" />
      </span>
    </NamedLink>
  ):null;

  const ordersLink = authenticatedOnClientSide ? (
    <NamedLink name="OrdersPage" className={css.ordersLink}>
      <span className={css.orders}>
        <FormattedMessage id="TopbarDesktop.orders" />
      </span>
    </NamedLink>) : null;

  return (
    <nav className={classes}>
      <NamedLink className={css.logoLink} name="LandingPage">
        <Logo
          format="desktop"
          className={css.logo}
          alt={intl.formatMessage({ id: 'TopbarDesktop.logo' })}
        />
      </NamedLink>
      {/* {search} */}
      {/* <NamedLink className={css.createListingLink} name="NewListingPage">
        <span className={css.createListing}>
          <FormattedMessage id="TopbarDesktop.createListing" />
        </span>
      </NamedLink> */}

      <NamedLink className={css.createListingLink} name="NewListingPage">
        <span className={css.createListing}>
          <FormattedMessage id="TopbarDesktop.sellItems" />
        </span>
      </NamedLink>

      {shopByCategoryLink}
      {messagesLink}
      {/* {ordersLink} */}

      {search}
      {aboutLink}
      {helpLink}

      {shoppingCartLink}
      {inboxLink}
      {profileMenu}
      {signupLink}
      {loginLink}

    </nav>
  );
};

TopbarDesktop.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  currentPage: null,
  notificationCount: 0,
  initialSearchFormValues: {},
  appConfig: null,
};

TopbarDesktop.propTypes = {
  rootClassName: string,
  className: string,
  currentUserHasListings: bool.isRequired,
  currentUser: propTypes.currentUser,
  currentPage: string,
  isAuthenticated: bool.isRequired,
  onLogout: func.isRequired,
  notificationCount: number,
  onSearchSubmit: func.isRequired,
  initialSearchFormValues: object,
  intl: intlShape.isRequired,
  appConfig: object,
};

export default TopbarDesktop;
