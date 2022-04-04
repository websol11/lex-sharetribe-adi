import React from 'react';
import Decimal from 'decimal.js';
import { fakeIntl, createBooking } from '../../util/test-data';
import { renderDeep } from '../../util/test-helpers';
import { types as sdkTypes } from '../../util/sdkLoader';
import {
  TRANSITION_REQUEST_PAYMENT,
  TX_TRANSITION_ACTOR_CUSTOMER,
  DATE_TYPE_DATE,
} from '../../util/transaction';
import { LINE_ITEM_NIGHT, LINE_ITEM_UNITS } from '../../util/types';
import { OrderBreakdownComponent } from './OrderBreakdown';

const { UUID, Money } = sdkTypes;

const exampleTransaction = params => {
  const created = new Date(Date.UTC(2017, 1, 1));
  return {
    id: new UUID('example-transaction'),
    type: 'transaction',
    attributes: {
      createdAt: created,
      lastTransitionedAt: created,
      lastTransition: TRANSITION_REQUEST_PAYMENT,
      transitions: [
        {
          createdAt: created,
          by: TX_TRANSITION_ACTOR_CUSTOMER,
          transition: TRANSITION_REQUEST_PAYMENT,
        },
      ],

      // payinTotal, payoutTotal, and lineItems required in params
      ...params,
    },
  };
};

describe('OrderBreakdown', () => {
  it('data for product marketplace matches snapshot', () => {
    const tree = renderDeep(
      <OrderBreakdownComponent
        userRole="customer"
        unitType={LINE_ITEM_UNITS}
        transaction={exampleTransaction({
          payinTotal: new Money(3000, 'USD'),
          payoutTotal: new Money(3000, 'USD'),
          lineItems: [
            {
              code: 'line-item/units',
              includeFor: ['customer', 'provider'],
              quantity: new Decimal(2),
              lineTotal: new Money(2000, 'USD'),
              unitPrice: new Money(1000, 'USD'),
              reversal: false,
            },
            {
              code: 'line-item/shipping-fee',
              includeFor: ['customer', 'provider'],
              quantity: new Decimal(1),
              unitPrice: new Money(1000, 'USD'),
              lineTotal: new Money(1000, 'USD'),
              reversal: false,
            },
          ],
        })}
        intl={fakeIntl}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('customer transaction data matches snapshot', () => {
    const tree = renderDeep(
      <OrderBreakdownComponent
        userRole="customer"
        unitType={LINE_ITEM_NIGHT}
        dateType={DATE_TYPE_DATE}
        transaction={exampleTransaction({
          payinTotal: new Money(2000, 'USD'),
          payoutTotal: new Money(2000, 'USD'),
          lineItems: [
            {
              code: 'line-item/night',
              includeFor: ['customer', 'provider'],
              quantity: new Decimal(2),
              lineTotal: new Money(2000, 'USD'),
              unitPrice: new Money(1000, 'USD'),
              reversal: false,
            },
          ],
        })}
        booking={createBooking('example-booking', {
          start: new Date(Date.UTC(2017, 3, 14)),
          end: new Date(Date.UTC(2017, 3, 16)),
        })}
        intl={fakeIntl}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('provider transaction data matches snapshot', () => {
    const tree = renderDeep(
      <OrderBreakdownComponent
        userRole="provider"
        unitType={LINE_ITEM_NIGHT}
        dateType={DATE_TYPE_DATE}
        transaction={exampleTransaction({
          payinTotal: new Money(2000, 'USD'),
          payoutTotal: new Money(1800, 'USD'),
          lineItems: [
            {
              code: 'line-item/night',
              includeFor: ['customer', 'provider'],
              quantity: new Decimal(2),
              lineTotal: new Money(2000, 'USD'),
              unitPrice: new Money(1000, 'USD'),
              reversal: false,
            },
            {
              code: 'line-item/provider-commission',
              includeFor: ['provider'],
              lineTotal: new Money(-200, 'USD'),
              unitPrice: new Money(-200, 'USD'),
              reversal: false,
            },
          ],
        })}
        booking={createBooking('example-booking', {
          start: new Date(Date.UTC(2017, 3, 14)),
          end: new Date(Date.UTC(2017, 3, 16)),
        })}
        intl={fakeIntl}
      />
    );
    expect(tree).toMatchSnapshot();
  });
});
