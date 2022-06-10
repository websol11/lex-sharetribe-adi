 /*
 * Marketplace specific configuration.
 *
 * Every filter needs to have following keys:
 * - id:     Unique id of the filter.
 * - label:  The default label of the filter.
 * - type:   String that represents one of the existing filter components:
 *           BookingDateRangeFilter, KeywordFilter, PriceFilter,
 *           SelectSingleFilter, SelectMultipleFilter.
 * - group:  Is this 'primary' or 'secondary' filter?
 *           Primary filters are visible on desktop layout by default.
 *           Secondary filters are behind "More filters" button.
 *           Read more from src/containers/SearchPage/README.md
 * - queryParamNames: Describes parameters to be used with queries
 *                    (e.g. 'price' or 'pub_amenities'). Most of these are
 *                    the same between webapp URLs and API query params.
 *                    You can't change 'dates', 'price', or 'keywords'
 *                    since those filters are fixed to a specific attribute.
 * - config: Extra configuration that the filter component needs.
 *
 * Note 1: Labels could be tied to translation file
 *         by importing FormattedMessage:
 *         <FormattedMessage id="some.translation.key.here" />
 *
 * Note 2: If you need to add new custom filter components,
 *         you need to take those into use in:
 *         src/containers/SearchPage/FilterComponent.js
 *
 * Note 3: If you just want to create more enum filters
 *         (i.e. SelectSingleFilter, SelectMultipleFilter),
 *         you can just add more configurations with those filter types
 *         and tie them with correct extended data key
 *         (i.e. pub_<key> or meta_<key>).
 */

import electronics from '../containers/DepartmentPage/images/electronics.jpg';
import pet_supplies from '../containers/DepartmentPage/images/pet_supplies.jpg';
import outdoors from '../containers/DepartmentPage/images/outdoors.jpg';
import antiques from '../containers/DepartmentPage/images/antiques.jpg';
import artwork from '../containers/DepartmentPage/images/artwork.jpg';
import automotive from '../containers/DepartmentPage/images/automotive.jpg';
import crafts from '../containers/DepartmentPage/images/crafts.jpg';
import travel from '../containers/DepartmentPage/images/travel.jpg';
import collectibles from '../containers/DepartmentPage/images/collectibles.jpg';
import industrial from '../containers/DepartmentPage/images/industrial.jpg';
import business from '../containers/DepartmentPage/images/business.jpg';
import sports from '../containers/DepartmentPage/images/sports.jpg';
import books_magazines from '../containers/DepartmentPage/images/books_&_magazines.jpg';
import computer_tablets from '../containers/DepartmentPage/images/computer_&_tablets.jpg';
import music_movies_tv from '../containers/DepartmentPage/images/music,_movies_&_tv.jpg';
import home_garden from '../containers/DepartmentPage/images/home_&_garden.jpg';
import health_beauty from '../containers/DepartmentPage/images/health_&_beauty.jpg';
import toy_games from '../containers/DepartmentPage/images/toy_&_games.jpg';
import kids_babies from '../containers/DepartmentPage/images/kids_&_babies.jpg';

export const filters = [
  {
    id: 'category',
    label: 'Category',
    type: 'SelectSingleFilter',
    group: 'primary',
    queryParamNames: ['pub_category'],
    config: {
      // Schema type is enum for SelectSingleFilter
      schemaType: 'enum',

      // "key" is the option you see in Flex Console.
      // "label" is set here for the UI only.
      // Note: label is not added through the translation files
      // to make filter customizations a bit easier.
      options: [
        { key: 'Electronics', label: 'Electronics', image: electronics },
        { key: 'Computers & Tablets', label: 'Computers & Tablets', image: computer_tablets },
        { key: 'Music, Movies & TV', label: 'Music, Movies & TV', image: music_movies_tv },
        { key: 'Home & Garden', label: 'Home & Garden', image: home_garden },
        { key: 'Pet Supplies', label: 'Pet Supplies', image: pet_supplies },
        { key: 'Health & Beauty', label: 'Health & Beauty', image: health_beauty },
        { key: 'Sports', label: 'Sports', image: sports },
        { key: 'Outdoors', label: 'Outdoors', image: outdoors },
        { key: 'Toys & Games', label: 'Toys & Games', image: toy_games },
        { key: 'Kids & Babies', label: 'Kids & Babies', image: kids_babies },
        { key: 'Automotive', label: 'Automotive', image: automotive },
        { key: 'Business', label: 'Business', image: business },
        { key: 'Industrial', label: 'Industrial', image: industrial },
        { key: 'Books & Magazines', label: 'Books & Magazines', image: books_magazines },
        { key: 'Artwork', label: 'Artwork', image: artwork },
        { key: 'Antiques', label: 'Antiques', image: antiques },
        { key: 'Crafts', label: 'Crafts', image: crafts },
        { key: 'Travel', label: 'Travel', image: travel },
        { key: 'Collectibles', label: 'Collectibles', image: collectibles },
      ],
    },
  },
  /*{
    id: 'gender',
    label: 'Gender',
    type: 'SelectSingleFilter',
    group: 'primary',
    queryParamNames: ['pub_gender'],
    config: {
      // Schema type is enum for SelectSingleFilter
      schemaType: 'enum',

      // "key" is the option you see in Flex Console.
      // "label" is set here for the UI only.
      // Note: label is not added through the translation files
      // to make filter customizations a bit easier.
      options: [
        { key: 'men', label: 'Men' },
        { key: 'Computers & Tablets', label: 'Women' },
        { key: 'kids', label: 'Kids' },
      ],
    },
  },*/
  /*{
    id: 'size',
    label: 'Size (US)',
    type: 'SelectMultipleFilter',
    group: 'primary',
    queryParamNames: ['pub_size'],
    config: {
      // Schema type options: 'enum', 'multi-enum'
      // Both types can work so that user selects multiple values when filtering search results.
      // With "enum" the functionality will be OR-semantics (Nike OR Adidas OR Salomon)
      // With "multi-enum" it's possible to use both AND and OR semantics with searchMode config.
      schemaType: 'enum',

      // "key" is the option you see in Flex Console.
      // "label" is set here for the UI only.
      // Note: label is not added through the translation files
      // to make filter customizations a bit easier.
      options: [
        { key: '4', label: '4' },
        { key: '5', label: '5' },
        { key: '6', label: '6' },
        { key: '7', label: '7' },
        { key: '8', label: '8' },
        { key: '9', label: '9' },
        { key: '10', label: '10' },
        { key: '11', label: '11' },
        { key: '12', label: '12' },
      ],
    },
  },*/
  {
    id: 'brand',
    label: 'Brand',
    type: 'KeywordFilter',
    group: 'primary',
    queryParamNames: ['pub_brand'],
    config: {},
  },
/*
  {
    id: 'brand',
    label: 'Brand',
    type: 'SelectMultipleFilter',
    group: 'primary',
    queryParamNames: ['pub_brand'],
    config: {
      // Schema type options: 'enum', 'multi-enum'
      // Both types can work so that user selects multiple values when filtering search results.
      // With "enum" the functionality will be OR-semantics (Nike OR Adidas OR Salomon)
      // With "multi-enum" it's possible to use both AND and OR semantics with searchMode config.
      schemaType: 'enum',

      // "key" is the option you see in Flex Console.
      // "label" is set here for the UI only.
      // Note: label is not added through the translation files
      // to make filter customizations a bit easier.
      options: [
        { key: 'adidas', label: 'Adidas' },
        { key: 'air_jordan', label: 'Air Jordan' },
        { key: 'converse', label: 'Converse' },
        { key: 'new_balance', label: 'New Balance' },
        { key: 'nike', label: 'Nike' },
        { key: 'puma', label: 'Puma' },
        { key: 'ultraboost', label: 'Ultraboost' },
        { key: 'vans', label: 'Vans' },
        { key: 'yeezy', label: 'Yeezy' },
        { key: 'other', label: 'Other' },
      ],
    },
  },
  */
  {
    id: 'price',
    label: 'Price',
    type: 'PriceFilter',
    group: 'primary',
    // Note: PriceFilter is fixed filter,
    // you can't change "queryParamNames: ['price'],"
    queryParamNames: ['price'],
    // Price filter configuration
    // Note: unlike most prices this is not handled in subunits
    config: {
      min: 0,
      max: 1000,
      step: 5,
    },
  },
  {
    id: 'keyword',
    label: 'Keyword',
    type: 'KeywordFilter',
    group: 'primary',
    // Note: KeywordFilter is fixed filter,
    // you can't change "queryParamNames: ['keywords'],"
    queryParamNames: ['keywords'],
    // NOTE: If you are ordering search results by distance
    // the keyword search can't be used at the same time.
    // You can turn on/off ordering by distance from config.js file.
    config: {},
  },
  {
    id: 'asin',
    label: 'Asin',
    type: 'KeywordFilter',
    group: 'secondary',
    queryParamNames: ['pub_asin'],
    config: {},
  },{
    id: 'isbn',
    label: 'isbn',
    type: 'KeywordFilter',
    group: 'secondary',
    queryParamNames: ['pub_isbn'],
    config: {},
  },{
    id: 'mpn',
    label: 'mpn',
    type: 'KeywordFilter',
    group: 'secondary',
    queryParamNames: ['pub_mpn'],
    config: {},
  },{
    id: 'upc',
    label: 'upc',
    type: 'KeywordFilter',
    group: 'secondary',
    queryParamNames: ['pub_upc'],
    config: {},
  },
  {
    id: 'handlingTime',
    label: 'handlingTime',
    type: 'KeywordFilter',
    group: 'secondary',
    config: {},
  },
  {
    id: 'zipcode',
    label: 'zipcode',
    type: 'KeywordFilter',
    group: 'secondary',
    config: {},
  },
  {
    id: 'condition',
    label: 'Condition',
    type: 'SelectSingleFilter',
    group: 'secondary',
    //queryParamNames: ['pub_condition'],
    config: {
      schemaType: 'enum',
      options: [
        { key: 'new', label: 'New' },
        { key: 'old', label: 'Old' },
      ],
    },
  },
  {
    id: 'return',
    label: 'Product return policy',
    type: 'SelectSingleFilter',
    group: 'secondary',
    //queryParamNames: ['pub_return'],
    config: {
      schemaType: 'enum',
      options: [
        { key: 'no_returns', label: 'No returns' },
        { key: '30_day_returns', label: '30-day return policy' },
      ],
    },
  },
   /*{
    id: 'capacity',
    label: 'Capacity',
    type: 'SelectSingleFilter',
    group: 'secondary',
    queryParamNames: ['pub_capacity'],
    config: {
      // Schema type is enum for SelectSingleFilter
      schemaType: 'enum',
      options: [
        { key: '1to3', label: '1 to 3' },
        { key: '4to6', label: '4 to 6' },
        { key: '7to9', label: '7 to 9' },
        { key: '10plus', label: '10 plus' },
      ],
    },
  },*/
  // Here is an example of multi-enum search filter.
  //
  // {
  //   id: 'amenities',
  //   label: 'Amenities',
  //   type: 'SelectMultipleFilter',
  //   group: 'secondary',
  //   queryParamNames: ['pub_amenities'],
  //   config: {
  //     // Schema type options: 'enum', 'multi-enum'
  //     // Both types can work so that user selects multiple values when filtering search results.
  //     // With "enum" the functionality will be OR-semantics (Nike OR Adidas OR Salomon)
  //     // With "multi-enum" it's possible to use both AND and OR semantics with searchMode config.
  //     schemaType: 'multi-enum',

  //     // Optional modes: 'has_all', 'has_any'
   //     // Note: this is relevant only for schema type 'multi-enum'
  //     // https://www.sharetribe.com/api-reference/marketplace.html#extended-data-filtering
  //     searchMode: 'has_all',

  //     // "key" is the option you see in Flex Console.
  //     // "label" is set here for this web app's UI only.
  //     // Note: label is not added through the translation files
  //     // to make filter customizations a bit easier.
  //     options: [
  //       { key: 'towels', label: 'Towels' },
  //       { key: 'bathroom', label: 'Bathroom' },
  //       { key: 'swimming_pool', label: 'Swimming pool' },
  //       { key: 'barbeque', label: 'Barbeque' },
  //     ],
  //   },
  // },
];

export const sortConfig = {
  // Enable/disable the sorting control in the SearchPage
  active: true,

  // Note: queryParamName 'sort' is fixed,
  // you can't change it since Flex API expects it to be named as 'sort'
  queryParamName: 'sort',

  // Internal key for the relevance option, see notes below.
  relevanceKey: 'relevance',

  // Relevance key is used with keywords filter.
  // Keywords filter also sorts results according to relevance.
  relevanceFilter: 'keywords',

  // Keyword filter is sorting the results by relevance.
  // If keyword filter is active, one might want to disable other sorting options
  // by adding 'keyword' to this list.
  conflictingFilters: [],

  options: [
    { key: 'createdAt', label: 'Newest' },
    { key: '-createdAt', label: 'Oldest' },
    { key: '-price', label: 'Lowest price' },
    { key: 'price', label: 'Highest price' },

    // The relevance is only used for keyword search, but the
    // parameter isn't sent to the Marketplace API. The key is purely
    // for handling the internal state of the sorting dropdown.
    { key: 'relevance', label: 'Relevance', longLabel: 'Relevance (Keyword search)' },
  ],
};

export const listing = {
  // These should be listing details from public data with schema type: enum
  // SectionDetailsMaybe component shows these on listing page.
  enumFieldDetails: [ 'category', 'condition', 'return'],
};
