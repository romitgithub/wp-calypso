import { withStorageKey } from '@automattic/state-utils';
import {
	HOSTING_PHP_VERSION_SET,
	HOSTING_SFTP_USER_UPDATE,
	HOSTING_SFTP_USERS_SET,
	HOSTING_STATIC_FILE_404_SET,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

export const sftpUsers = ( state = {}, { type, users } ) => {
	if ( type === HOSTING_SFTP_USERS_SET ) {
		return users;
	}

	if ( type === HOSTING_SFTP_USER_UPDATE && Array.isArray( state ) ) {
		return state.map( ( user ) => {
			const updatedUser = users.find( ( u ) => u.username === user.username );
			return {
				...user,
				...updatedUser,
			};
		} );
	}

	return state;
};

const phpVersion = ( state = null, { type, version } ) => {
	switch ( type ) {
		case HOSTING_PHP_VERSION_SET:
			return version;
	}

	return state;
};

const staticFile404 = ( state = null, { type, setting } ) => {
	switch ( type ) {
		case HOSTING_STATIC_FILE_404_SET:
			return setting;
	}

	return state;
};

const atomicHostingReducer = combineReducers( {
	phpVersion,
	sftpUsers,
	staticFile404,
} );

const reducer = keyedReducer( 'siteId', atomicHostingReducer );
export default withStorageKey( 'atomicHosting', reducer );
