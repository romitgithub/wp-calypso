import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { getPlanDiscountedRawPrice } from 'calypso/state/sites/plans/selectors';

/**
 * Computes a price based on plan slug/constant, including any discounts available.
 *
 * @param {object} state Current redux state
 * @param {number|undefined} siteId Site ID to consider
 * @param {object} planObject Plan object returned by getPlan() from @automattic/calypso-products
 * @param {boolean} isMonthly Flag - should return a monthly price?
 * @returns {number} Requested price
 */
export const getPlanPrice = ( state, siteId, planObject, isMonthly ) => {
	return (
		getPlanDiscountedRawPrice( state, siteId, planObject.getStoreSlug(), { isMonthly } ) ||
		getPlanRawPrice( state, planObject.getProductId(), isMonthly )
	);
};
