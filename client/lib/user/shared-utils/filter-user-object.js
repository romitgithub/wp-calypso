import { decodeEntities } from 'calypso/lib/formatting/decode-entities';
import { getComputedAttributes } from './get-computed-attributes';

const allowedKeys = [
	'ID',
	'display_name',
	'username',
	'avatar_URL',
	'site_count',
	'jetpack_site_count',
	'visible_site_count',
	'jetpack_visible_site_count',
	'date',
	'has_unseen_notes',
	'newest_note_type',
	'phone_account',
	'email',
	'email_verified',
	'is_valid_google_apps_country',
	'user_ip_country_code',
	'logout_URL',
	'primary_blog',
	'primary_blog_is_jetpack',
	'has_jetpack_partner_access',
	'jetpack_partner_types',
	'primary_blog_url',
	'meta',
	'is_new_reader',
	'social_login_connections',
	'abtests',
	'lasagna_jwt',
	'i18n_empathy_mode',
	'use_fallback_for_incomplete_languages',
];
const requiredKeys = [ 'ID' ];
const decodedKeys = [ 'display_name', 'description', 'user_URL' ];

export function filterUserObject( obj ) {
	if ( typeof obj !== 'object' ) {
		throw new Error( 'the /me response is not an object' );
	}

	for ( const key of requiredKeys ) {
		if ( ! obj.hasOwnProperty( key ) ) {
			throw new Error( `the /me response misses a required field '${ key }'` );
		}
	}

	const user = {};
	for ( const key of allowedKeys ) {
		const value = obj[ key ];
		user[ key ] = value && decodedKeys.includes( key ) ? decodeEntities( value ) : value;
	}

	return Object.assign( user, getComputedAttributes( obj ) );
}
